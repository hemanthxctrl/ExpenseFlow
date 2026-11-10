import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useFinance } from './FinanceContext';
import { useToast } from './ToastContext';
import {
  getSyncQueue,
  getLastSyncedAt,
  executeFullSync,
  checkMigrationNeeded,
  markMigrationDismissed,
  migrateLocalDataToCloud,
  handleUserSessionChange
} from '../services/syncService';
import { getSupabase } from '../lib/supabase';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const { user, isConfigured } = useAuth();
  const { transactions, budgets, profile, applyRemoteSync } = useFinance();
  const { showToast } = useToast();

  const [syncStatus, setSyncStatus] = useState('guest'); // 'guest' | 'synced' | 'syncing' | 'pending' | 'offline' | 'error'
  const [lastSyncedAt, setLastSyncedAtState] = useState(() => getLastSyncedAt());
  const [pendingCount, setPendingCount] = useState(() => getSyncQueue().length);
  const [syncError, setSyncError] = useState(null);

  // Migration modal state
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [hasPendingMigration, setHasPendingMigration] = useState(false);

  // Sync debounce timer ref
  const syncTimeoutRef = useRef(null);

  // Keep references to latest finance data for async operations
  const financeRef = useRef({ transactions, budgets, profile, applyRemoteSync });
  useEffect(() => {
    financeRef.current = { transactions, budgets, profile, applyRemoteSync };
  }, [transactions, budgets, profile, applyRemoteSync]);

  // Update pending queue count
  const refreshQueueCount = useCallback(() => {
    const queue = getSyncQueue();
    setPendingCount(queue.length);
    if (!user) {
      setSyncStatus('guest');
    } else if (!navigator.onLine) {
      setSyncStatus('offline');
    } else if (queue.length > 0) {
      setSyncStatus('pending');
    }
  }, [user]);

  // Execute full synchronization
  const syncNow = useCallback(async (options = { silent: false }) => {
    if (!isConfigured) {
      setSyncStatus('guest');
      return { success: false, reason: 'unconfigured' };
    }

    if (!user) {
      setSyncStatus('guest');
      return { success: false, reason: 'unauthenticated' };
    }

    if (!navigator.onLine) {
      setSyncStatus('offline');
      if (!options.silent) {
        showToast('You are offline. Changes are saved locally and will sync once connected.', 'info');
      }
      return { success: false, reason: 'offline' };
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);

      const currentLocal = {
        transactions: financeRef.current.transactions || [],
        budgets: financeRef.current.budgets || [],
        profile: financeRef.current.profile || null
      };

      const result = await executeFullSync(user.id, currentLocal, (merged) => {
        if (financeRef.current.applyRemoteSync) {
          financeRef.current.applyRemoteSync(merged);
        }
      }, { forceReplace: options.forceReplace });

      if (result.success) {
        setSyncStatus('synced');
        setLastSyncedAtState(result.lastSyncedAt);
        refreshQueueCount();
        if (!options.silent && (result.pushedCount > 0 || result.pulledCount > 0)) {
          showToast(`Cloud Sync: ${result.pushedCount} uploaded, ${result.pulledCount} updated`, 'success');
        }
        return { success: true, result };
      } else {
        throw result.error || new Error('Sync failed');
      }
    } catch (err) {
      console.error('[SyncContext] Sync failed:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Synchronization error');
      if (!options.silent) {
        showToast('Sync error: ' + (err.message || 'Could not connect to cloud'), 'warning');
      }
      return { success: false, error: err };
    }
  }, [isConfigured, user, showToast, refreshQueueCount]);

  // Check migration or account switch when user logs in or changes
  useEffect(() => {
    if (!user) {
      handleUserSessionChange(null);
      setSyncStatus('guest');
      setHasPendingMigration(false);
      setIsMigrationModalOpen(false);
      return;
    }

    const sessionChange = handleUserSessionChange(user.id);

    if (sessionChange.switched) {
      // Account switch detected: force replace local state with this account's records
      setHasPendingMigration(false);
      setIsMigrationModalOpen(false);
      syncNow({ silent: true, forceReplace: true });
      return;
    }

    const needsMigration = checkMigrationNeeded(user.id, transactions, budgets);

    if (needsMigration) {
      setHasPendingMigration(true);
      setIsMigrationModalOpen(true);
    } else {
      // Direct auto sync
      syncNow({ silent: true });
    }
  }, [user, syncNow]);

  // Debounced sync trigger when local queue changes
  useEffect(() => {
    const handleQueueChange = () => {
      refreshQueueCount();
      if (user && navigator.onLine) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          syncNow({ silent: true });
        }, 1000);
      }
    };

    window.addEventListener('expenseflow:queue_changed', handleQueueChange);
    return () => {
      window.removeEventListener('expenseflow:queue_changed', handleQueueChange);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user, syncNow, refreshQueueCount]);

  // Realtime Supabase Channel Listener for multi-device sync
  useEffect(() => {
    if (!user || !isConfigured) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          // Debounced pull remote changes
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(() => {
            syncNow({ silent: true });
          }, 500);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` },
        () => {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(() => {
            syncNow({ silent: true });
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isConfigured, syncNow]);

  // Listen for online / visibility events
  useEffect(() => {
    const handleOnline = () => {
      refreshQueueCount();
      if (user) {
        syncNow({ silent: false });
      }
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user && navigator.onLine) {
        syncNow({ silent: true });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, syncNow, refreshQueueCount]);

  // Migration Actions
  const handlePerformMigration = async () => {
    if (!user) return;
    try {
      setSyncStatus('syncing');
      const localData = {
        transactions: financeRef.current.transactions || [],
        budgets: financeRef.current.budgets || [],
        profile: financeRef.current.profile || {}
      };

      const res = await migrateLocalDataToCloud(user.id, localData);
      showToast(`Migrated ${res.transactionsCount} transactions & ${res.budgetsCount} budgets to your cloud account!`, 'success');
      setIsMigrationModalOpen(false);
      setHasPendingMigration(false);
      await syncNow({ silent: true });
    } catch (err) {
      console.error('Migration failed:', err);
      showToast('Migration error: ' + (err.message || 'Failed to upload local records'), 'error');
    }
  };

  const handleDismissMigration = () => {
    if (user) {
      markMigrationDismissed(user.id);
    }
    setIsMigrationModalOpen(false);
    setHasPendingMigration(false);
    showToast('Existing local data kept separate on this device.', 'info');
    syncNow({ silent: true });
  };

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        lastSyncedAt,
        pendingCount,
        syncError,
        syncNow,
        refreshQueueCount,
        // Migration
        isMigrationModalOpen,
        hasPendingMigration,
        openMigrationModal: () => setIsMigrationModalOpen(true),
        closeMigrationModal: () => setIsMigrationModalOpen(false),
        performMigration: handlePerformMigration,
        dismissMigration: handleDismissMigration
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
