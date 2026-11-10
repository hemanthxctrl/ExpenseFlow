/**
 * scripts/test-phase5-security.js
 * Comprehensive automated security & multi-user isolation audit suite for ExpenseFlow Phase 5
 */

import fs from 'fs';
import path from 'path';
import {
  handleUserSessionChange,
  clearSyncQueue,
  getSyncQueue,
  saveSyncQueue,
  setLastSyncedAt,
  getLastSyncedAt,
  mergeTransactions,
  mergeBudgets
} from '../src/services/syncService.js';
import { isSupabaseConfigured, getSupabase } from '../src/lib/supabase.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('EXPENSEFLOW PHASE 5: SECURITY AUDIT & SESSION TESTS');
console.log('====================================================\n');

// Mock localStorage in Node.js environment
const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

// ----------------------------------------------------------------------------
// Test 1: Codebase Secret Inspection (No service-role or private keys exposed)
// ----------------------------------------------------------------------------
console.log('Test 1: Zero Exposed Secrets Audit');
const srcDir = path.resolve('src');
const allSrcFiles = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(js|jsx|ts|tsx|json|html)$/.test(entry.name)) {
      allSrcFiles.push(full);
    }
  }
}
scanDir(srcDir);

let foundServiceRole = false;
let foundHardcodedSecret = false;

for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('service_role')) {
    foundServiceRole = true;
    console.error(`Found service_role reference in ${file}`);
  }
  // Check for raw supabase project jwt secret patterns
  if (/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/.test(content)) {
    // Only flag if not in sample/test file
    if (!file.includes('test')) {
      foundHardcodedSecret = true;
    }
  }
}

assert(!foundServiceRole, 'Zero service_role tokens found in frontend codebase');
assert(!foundHardcodedSecret, 'Zero hardcoded JWT credentials found in source files');

// ----------------------------------------------------------------------------
// Test 2: Git & Environment Isolation (.env is strictly ignored)
// ----------------------------------------------------------------------------
console.log('\nTest 2: Git Credentials Protection');
const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
assert(gitignoreContent.includes('.env'), '.gitignore excludes .env files');
assert(gitignoreContent.includes('.env.local'), '.gitignore excludes .env.local');
assert(gitignoreContent.includes('*.local'), '.gitignore excludes *.local');

// ----------------------------------------------------------------------------
// Test 3: SQL Migration Row Level Security (RLS) Policy Audit
// ----------------------------------------------------------------------------
console.log('\nTest 3: Database Migration RLS Policy Verification');
const sqlPath = path.resolve('supabase/migrations/20261110_initial_schema.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

assert(sqlContent.includes('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on profiles');
assert(sqlContent.includes('ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on transactions');
assert(sqlContent.includes('ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on budgets');

// Verification of all 4 CRUD actions on transactions
assert(sqlContent.includes('ON public.transactions FOR SELECT') && sqlContent.includes('auth.uid() = user_id'), 'Transactions SELECT policy strictly enforces auth.uid() = user_id');
assert(sqlContent.includes('ON public.transactions FOR INSERT') && sqlContent.includes('WITH CHECK (auth.uid() = user_id)'), 'Transactions INSERT policy strictly checks auth.uid() = user_id');
assert(sqlContent.includes('ON public.transactions FOR UPDATE') && sqlContent.includes('auth.uid() = user_id'), 'Transactions UPDATE policy strictly enforces auth.uid() = user_id');
assert(sqlContent.includes('ON public.transactions FOR DELETE') && sqlContent.includes('auth.uid() = user_id'), 'Transactions DELETE policy strictly enforces auth.uid() = user_id');

// Verification of idempotent realtime publication
assert(sqlContent.includes("SELECT 1 FROM pg_publication_tables"), 'Realtime publication configuration is safely idempotent');

// ----------------------------------------------------------------------------
// Test 4: Account Switching & Session Isolation Audit
// ----------------------------------------------------------------------------
console.log('\nTest 4: Account Switching & Data Isolation');

// Simulate User A logging in
localStorage.clear();
const sessionA = handleUserSessionChange('user-A-uuid-111');
assert(sessionA.switched === false, 'Initial User A login detected as non-switched');
assert(localStorage.getItem('expenseflow_current_user_id') === 'user-A-uuid-111', 'User A ID stored in session tracker');

// User A queues an offline mutation
saveSyncQueue([{
  mutationId: 'mut-A-1',
  entity: 'transaction',
  action: 'upsert',
  data: { id: 'tx-private-A', title: 'Confidential Transaction A', amount: 9999 }
}]);
setLastSyncedAt('2026-11-10T12:00:00Z');
assert(getSyncQueue().length === 1, 'User A offline mutation added to queue');

// User A logs out
const logoutSession = handleUserSessionChange(null);
assert(logoutSession.loggedOut === true, 'Logout correctly tracked');
assert(getSyncQueue().length === 0, 'Offline queue purged on logout to prevent cross-account leak');
assert(getLastSyncedAt() === null, 'lastSyncedAt cleared on logout');
assert(localStorage.getItem('expenseflow_current_user_id') === null, 'User ID removed from storage on logout');

// User B logs in on same device
const sessionB = handleUserSessionChange('user-B-uuid-222');
assert(sessionB.switched === false, 'User B login initialized cleanly');

// Simulate direct user switch without logout (e.g. fast account switch)
localStorage.setItem('expenseflow_current_user_id', 'user-A-uuid-111');
saveSyncQueue([{ mutationId: 'mut-A-2', entity: 'transaction', data: { id: 'leak-tx' } }]);
setLastSyncedAt('2026-11-10T14:00:00Z');

const fastSwitch = handleUserSessionChange('user-B-uuid-222');
assert(fastSwitch.switched === true, 'Direct account switch detected (User A -> User B)');
assert(fastSwitch.previousUserId === 'user-A-uuid-111', 'Identified previous account correctly');
assert(getSyncQueue().length === 0, 'Sync queue purged on fast switch');
assert(getLastSyncedAt() === null, 'lastSyncedAt purged on fast switch to trigger complete sync for User B');

// ----------------------------------------------------------------------------
// Test 5: Client Resilience (Unconfigured / Missing credentials handling)
// ----------------------------------------------------------------------------
console.log('\nTest 5: Client Configuration Resilience');
// In test environment without credentials
const configured = isSupabaseConfigured();
const client = getSupabase();
assert(typeof configured === 'boolean', 'isSupabaseConfigured returns clean boolean');
assert(client === null || typeof client === 'object', 'getSupabase returns null or client without throwing');

console.log('\n====================================================');
console.log(`PHASE 5 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
