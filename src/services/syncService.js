import { getSupabase } from '../lib/supabase.js';

const QUEUE_STORAGE_KEY = 'expenseflow_sync_queue';
const LAST_SYNC_KEY = 'expenseflow_last_synced_at';
const MIGRATION_PREFIX = 'expenseflow_migrated_';
const CURRENT_USER_KEY = 'expenseflow_current_user_id';

// ============================================================================
// 1. Durably Persisted Offline Sync Queue & Session Isolation
// ============================================================================

export const clearSyncQueue = () => {
  saveSyncQueue([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('expenseflow:queue_changed'));
  }
};

export const handleUserSessionChange = (newUserId) => {
  try {
    const previousUserId = typeof localStorage !== 'undefined' ? localStorage.getItem(CURRENT_USER_KEY) : null;

    if (!newUserId) {
      // User logged out
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
      }
      clearSyncQueue();
      return { switched: false, loggedOut: true };
    }

    if (previousUserId && previousUserId !== newUserId) {
      // Different account logged in -> reset sync metadata & queue to prevent data cross-contamination
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, newUserId);
        localStorage.removeItem(LAST_SYNC_KEY);
      }
      clearSyncQueue();
      return { switched: true, previousUserId };
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, newUserId);
    }
    return { switched: false, initial: !previousUserId };
  } catch (e) {
    console.error('Session change handling error:', e);
    return { switched: false };
  }
};

export const getSyncQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read sync queue from localStorage:', e);
    return [];
  }
};

export const saveSyncQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save sync queue to localStorage:', e);
  }
};

/**
 * Enqueue a mutation for offline replay
 * @param {'transaction'|'budget'|'profile'} entity
 * @param {'upsert'|'delete'} action
 * @param {object} data
 */
export const enqueueMutation = (entity, action, data) => {
  const queue = getSyncQueue();
  const mutationId = 'mut-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const timestamp = new Date().toISOString();

  // If a mutation for this exact entity ID already exists in queue, deduplicate/merge
  const targetId = data.id || (entity === 'budget' ? data.category : null);
  const filtered = queue.filter(item => {
    const itemId = item.data.id || (item.entity === 'budget' ? item.data.category : null);
    return !(item.entity === entity && itemId === targetId);
  });

  filtered.push({
    mutationId,
    entity,
    action,
    data: {
      ...data,
      updated_at: timestamp
    },
    timestamp
  });

  saveSyncQueue(filtered);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('expenseflow:queue_changed'));
  }

  return mutationId;
};

export const removeMutations = (mutationIds) => {
  if (!Array.isArray(mutationIds) || mutationIds.length === 0) return;
  const idSet = new Set(mutationIds);
  const queue = getSyncQueue().filter(item => !idSet.has(item.mutationId));
  saveSyncQueue(queue);
};

export const getLastSyncedAt = () => {
  return localStorage.getItem(LAST_SYNC_KEY) || null;
};

export const setLastSyncedAt = (timestamp) => {
  if (timestamp) {
    localStorage.setItem(LAST_SYNC_KEY, timestamp);
  } else {
    localStorage.removeItem(LAST_SYNC_KEY);
  }
};

// ============================================================================
// 2. Data Mappers (LocalStorage Schema <--> Supabase Database Schema)
// ============================================================================

export const mapTransactionToRemote = (tx, userId) => {
  return {
    id: String(tx.id),
    user_id: userId,
    title: tx.title,
    amount: Number(tx.amount),
    type: tx.type || 'expense',
    category: tx.category || 'Other',
    date: tx.date || new Date().toISOString().split('T')[0],
    payment_method: tx.paymentMethod || 'UPI',
    description: tx.description || '',
    created_at: tx.created_at || new Date().toISOString(),
    updated_at: tx.updated_at || new Date().toISOString(),
    deleted_at: null
  };
};

export const mapRemoteToTransaction = (remote) => {
  return {
    id: remote.id,
    title: remote.title,
    amount: Number(remote.amount),
    type: remote.type,
    category: remote.category,
    date: remote.date,
    paymentMethod: remote.payment_method,
    description: remote.description || '',
    created_at: remote.created_at,
    updated_at: remote.updated_at
  };
};

export const mapBudgetToRemote = (b, userId) => {
  const budgetId = b.id || `bgt-${b.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  return {
    id: budgetId,
    user_id: userId,
    category: b.category,
    amount: Number(b.limit !== undefined ? b.limit : b.amount || 0),
    month: b.month || null,
    year: b.year || null,
    created_at: b.created_at || new Date().toISOString(),
    updated_at: b.updated_at || new Date().toISOString(),
    deleted_at: null
  };
};

export const mapRemoteToBudget = (remote) => {
  return {
    id: remote.id,
    category: remote.category,
    limit: Number(remote.amount),
    month: remote.month,
    year: remote.year,
    created_at: remote.created_at,
    updated_at: remote.updated_at
  };
};

// ============================================================================
// 3. Push Local Queue to Cloud
// ============================================================================

export const pushQueueToCloud = async (userId) => {
  const supabase = getSupabase();
  if (!supabase || !userId) {
    return { pushedCount: 0, errors: [] };
  }

  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { pushedCount: 0, errors: [] };
  }

  const processedIds = [];
  const errors = [];

  for (const item of queue) {
    try {
      if (item.entity === 'transaction') {
        if (item.action === 'upsert') {
          const payload = mapTransactionToRemote(item.data, userId);
          const { error } = await supabase
            .from('transactions')
            .upsert(payload, { onConflict: 'id' });
          if (error) throw error;
        } else if (item.action === 'delete') {
          // Soft delete tombstone
          const { error } = await supabase
            .from('transactions')
            .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq('id', item.data.id)
            .eq('user_id', userId);
          if (error) throw error;
        }
      } else if (item.entity === 'budget') {
        if (item.action === 'upsert') {
          const payload = mapBudgetToRemote(item.data, userId);
          const { error } = await supabase
            .from('budgets')
            .upsert(payload, { onConflict: 'id' });
          if (error) throw error;
        } else if (item.action === 'delete') {
          const budgetId = item.data.id || `bgt-${item.data.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          const { error } = await supabase
            .from('budgets')
            .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .or(`id.eq.${budgetId},category.ilike.${item.data.category}`)
            .eq('user_id', userId);
          if (error) throw error;
        }
      } else if (item.entity === 'profile') {
        if (item.action === 'upsert') {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              display_name: item.data.name || item.data.displayName || null,
              occupation: item.data.occupation || null,
              currency: item.data.currency || 'INR',
              theme: item.data.theme || 'dark',
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          if (error) throw error;
        }
      }

      processedIds.push(item.mutationId);
    } catch (err) {
      console.warn(`[Sync Engine] Failed mutation ${item.mutationId}:`, err);
      errors.push({ mutationId: item.mutationId, error: err });
    }
  }

  // Remove processed items from local queue
  removeMutations(processedIds);

  return {
    pushedCount: processedIds.length,
    remainingCount: queue.length - processedIds.length,
    errors
  };
};

// ============================================================================
// 4. Pull Remote Changes from Cloud with Last-Write-Wins (LWW)
// ============================================================================

export const pullRemoteChanges = async (userId, lastSyncedAt = null) => {
  const supabase = getSupabase();
  if (!supabase || !userId) {
    return { transactions: [], budgets: [], profile: null };
  }

  // 1. Query remote transactions
  let txQuery = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (lastSyncedAt) {
    txQuery = txQuery.gt('updated_at', lastSyncedAt);
  }

  const { data: remoteTxs, error: txError } = await txQuery;
  if (txError) throw txError;

  // 2. Query remote budgets
  let bgtQuery = supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (lastSyncedAt) {
    bgtQuery = bgtQuery.gt('updated_at', lastSyncedAt);
  }

  const { data: remoteBgts, error: bgtError } = await bgtQuery;
  if (bgtError) throw bgtError;

  // 3. Query remote profile
  const { data: remoteProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError && profileError.code !== 'PGRST116') {
    console.warn('Profile fetch warning:', profileError);
  }

  return {
    remoteTransactions: remoteTxs || [],
    remoteBudgets: remoteBgts || [],
    remoteProfile: remoteProfile || null
  };
};

// ============================================================================
// 5. Conflict Resolution & Merge (Last-Write-Wins + Tombstones)
// ============================================================================

/**
 * Merges remote transactions into local transactions.
 * Preserves local items that are newer or have pending unsynced queue operations.
 */
export const mergeTransactions = (localTxs, remoteTxs, pendingQueue = []) => {
  const pendingTxIds = new Set(
    pendingQueue
      .filter(item => item.entity === 'transaction')
      .map(item => item.data.id)
  );

  const mergedMap = new Map();

  // First seed existing local transactions
  for (const tx of localTxs) {
    mergedMap.set(tx.id, { ...tx });
  }

  // Apply remote transactions
  for (const rTx of remoteTxs) {
    // If user has an uncommitted local change waiting in the offline queue for this item,
    // the local uncommitted change takes precedence until pushed
    if (pendingTxIds.has(rTx.id)) {
      continue;
    }

    // If remotely marked deleted (tombstone)
    if (rTx.deleted_at) {
      mergedMap.delete(rTx.id);
      continue;
    }

    const localItem = mergedMap.get(rTx.id);
    if (!localItem) {
      // New remote item added on another device
      mergedMap.set(rTx.id, mapRemoteToTransaction(rTx));
    } else {
      // Conflict resolution: Last-Write-Wins
      const remoteTime = new Date(rTx.updated_at || 0).getTime();
      const localTime = new Date(localItem.updated_at || 0).getTime();

      if (remoteTime >= localTime) {
        mergedMap.set(rTx.id, mapRemoteToTransaction(rTx));
      }
    }
  }

  // Return merged array sorted by date descending (standard ExpenseFlow order)
  return Array.from(mergedMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Merges remote budgets into local budgets.
 */
export const mergeBudgets = (localBgts, remoteBgts, pendingQueue = []) => {
  const pendingCategories = new Set(
    pendingQueue
      .filter(item => item.entity === 'budget')
      .map(item => item.data.category.toLowerCase())
  );

  const budgetMap = new Map();

  for (const b of localBgts) {
    budgetMap.set(b.category.toLowerCase(), { ...b });
  }

  for (const rB of remoteBgts) {
    const catLower = rB.category.toLowerCase();

    if (pendingCategories.has(catLower)) {
      continue;
    }

    if (rB.deleted_at) {
      budgetMap.delete(catLower);
      continue;
    }

    const localBgt = budgetMap.get(catLower);
    if (!localBgt) {
      budgetMap.set(catLower, mapRemoteToBudget(rB));
    } else {
      const remoteTime = new Date(rB.updated_at || 0).getTime();
      const localTime = new Date(localBgt.updated_at || 0).getTime();
      if (remoteTime >= localTime) {
        budgetMap.set(catLower, mapRemoteToBudget(rB));
      }
    }
  }

  return Array.from(budgetMap.values());
};

// ============================================================================
// 6. Full Bidirectional Sync Orchestrator
// ============================================================================

export const executeFullSync = async (userId, currentLocalData, onDataMerged, options = {}) => {
  if (!userId) {
    return { success: false, reason: 'unauthenticated' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, reason: 'supabase_not_configured' };
  }

  const { forceReplace = false } = options;

  try {
    // Step 1: Push offline queue mutations to Supabase (skip if force replacing on account switch)
    let pushResult = { pushedCount: 0 };
    if (!forceReplace) {
      pushResult = await pushQueueToCloud(userId);
    }

    // Step 2: Pull remote records (full pull if forceReplace)
    const lastSynced = forceReplace ? null : getLastSyncedAt();
    const { remoteTransactions, remoteBudgets, remoteProfile } = await pullRemoteChanges(userId, lastSynced);

    // Step 3: Merge remote updates with current local state
    const remainingQueue = getSyncQueue();
    const baseLocalTxs = forceReplace ? [] : (currentLocalData.transactions || []);
    const baseLocalBgts = forceReplace ? [] : (currentLocalData.budgets || []);

    const mergedTransactions = mergeTransactions(
      baseLocalTxs,
      remoteTransactions,
      remainingQueue
    );

    const mergedBudgets = mergeBudgets(
      baseLocalBgts,
      remoteBudgets,
      remainingQueue
    );

    let mergedProfile = currentLocalData.profile;
    if (remoteProfile) {
      mergedProfile = {
        ...(forceReplace ? {} : currentLocalData.profile),
        name: remoteProfile.display_name || currentLocalData.profile?.name || '',
        occupation: remoteProfile.occupation || currentLocalData.profile?.occupation || '',
        currency: remoteProfile.currency || currentLocalData.profile?.currency || 'INR',
        theme: remoteProfile.theme || currentLocalData.profile?.theme || 'dark'
      };
    }

    // Step 4: Callback to notify FinanceContext to update React state & LocalStorage
    if (typeof onDataMerged === 'function') {
      onDataMerged({
        transactions: mergedTransactions,
        budgets: mergedBudgets,
        profile: mergedProfile
      });
    }

    // Step 5: Mark sync timestamp
    const nowIso = new Date().toISOString();
    setLastSyncedAt(nowIso);

    return {
      success: true,
      pushedCount: pushResult.pushedCount,
      pulledCount: remoteTransactions.length + remoteBudgets.length,
      lastSyncedAt: nowIso
    };
  } catch (error) {
    console.error('[Sync Engine] Full sync error:', error);
    return {
      success: false,
      error
    };
  }
};

// ============================================================================
// 7. First-Time Guest Data Migration Helper
// ============================================================================

export const checkMigrationNeeded = (userId, localTransactions, localBudgets) => {
  if (!userId) return false;
  const migratedKey = `${MIGRATION_PREFIX}${userId}`;
  if (localStorage.getItem(migratedKey)) {
    return false; // Already completed migration or decision made
  }
  const hasLocalData = (localTransactions && localTransactions.length > 0) || (localBudgets && localBudgets.length > 0);
  return Boolean(hasLocalData);
};

export const markMigrationDismissed = (userId) => {
  if (userId) {
    localStorage.setItem(`${MIGRATION_PREFIX}${userId}`, 'dismissed');
  }
};

export const migrateLocalDataToCloud = async (userId, localData) => {
  const supabase = getSupabase();
  if (!supabase || !userId) {
    throw new Error('Supabase is not configured or user is not authenticated');
  }

  const { transactions = [], budgets = [], profile = {} } = localData;

  // Batch insert/upsert transactions
  if (transactions.length > 0) {
    const payload = transactions.map(t => mapTransactionToRemote(t, userId));
    // Chunk in groups of 100 for safety
    for (let i = 0; i < payload.length; i += 100) {
      const chunk = payload.slice(i, i + 100);
      const { error } = await supabase
        .from('transactions')
        .upsert(chunk, { onConflict: 'id' });
      if (error) throw error;
    }
  }

  // Batch insert/upsert budgets
  if (budgets.length > 0) {
    const payload = budgets.map(b => mapBudgetToRemote(b, userId));
    const { error } = await supabase
      .from('budgets')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  }

  // Upsert profile
  if (profile) {
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: profile.name || null,
        occupation: profile.occupation || null,
        currency: profile.currency || 'INR',
        theme: profile.theme || 'dark',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
  }

  // Mark migration complete in localStorage
  localStorage.setItem(`${MIGRATION_PREFIX}${userId}`, 'completed');
  setLastSyncedAt(new Date().toISOString());

  return {
    transactionsCount: transactions.length,
    budgetsCount: budgets.length
  };
};
