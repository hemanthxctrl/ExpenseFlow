/**
 * scripts/test-phase4-sync.js
 * Comprehensive automated test suite for ExpenseFlow Phase 4 Supabase Cloud Sync
 */

import {
  mergeTransactions,
  mergeBudgets,
  mapTransactionToRemote,
  mapRemoteToTransaction,
  mapBudgetToRemote,
  mapRemoteToBudget,
  checkMigrationNeeded
} from '../src/services/syncService.js';
import { calculateDashboardMetrics, calculateBudgetsStatus } from '../src/utils/calculations.js';

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
console.log('EXPENSEFLOW PHASE 4: CLOUD SYNC & REPLICATION TESTS');
console.log('====================================================\n');

// ----------------------------------------------------------------------------
// Test 1: Data Model Mapping & Bi-directional Serialization
// ----------------------------------------------------------------------------
console.log('Test 1: Transaction & Budget Schema Mapping');
const mockLocalTx = {
  id: 'tx-1731234567890-test',
  title: 'Organic Groceries',
  amount: 2450.50,
  type: 'expense',
  category: 'Food',
  date: '2026-11-10',
  paymentMethod: 'UPI',
  description: 'Weekly organic veggies'
};

const remoteTx = mapTransactionToRemote(mockLocalTx, 'mock-user-123');
assert(remoteTx.id === mockLocalTx.id, 'Transaction ID preserved across remote mapping');
assert(remoteTx.user_id === 'mock-user-123', 'User ID attached to remote payload');
assert(remoteTx.payment_method === 'UPI', 'paymentMethod mapped to snake_case payment_method');
assert(remoteTx.amount === 2450.50, 'Amount numeric precision preserved');

const mappedBackTx = mapRemoteToTransaction(remoteTx);
assert(mappedBackTx.paymentMethod === 'UPI', 'payment_method mapped back to camelCase paymentMethod');
assert(mappedBackTx.title === mockLocalTx.title, 'Title preserved round-trip');

const mockBudget = { category: 'Dining', limit: 8000 };
const remoteBgt = mapBudgetToRemote(mockBudget, 'mock-user-123');
assert(remoteBgt.amount === 8000, 'Budget limit mapped to remote amount');
assert(remoteBgt.user_id === 'mock-user-123', 'Budget user_id mapped');

const mappedBackBgt = mapRemoteToBudget(remoteBgt);
assert(mappedBackBgt.limit === 8000, 'Remote amount mapped back to limit');
assert(mappedBackBgt.category === 'Dining', 'Budget category preserved');

// ----------------------------------------------------------------------------
// Test 2: Last-Write-Wins (LWW) Conflict Resolution
// ----------------------------------------------------------------------------
console.log('\nTest 2: Last-Write-Wins Conflict Resolution');
const localList = [
  {
    id: 'tx-1',
    title: 'Coffee at Cafe',
    amount: 150,
    type: 'expense',
    category: 'Food',
    date: '2026-11-09',
    updated_at: '2026-11-10T10:00:00.000Z'
  }
];

// Remote has a newer edit from another device (e.g. mobile phone)
const remoteListNewer = [
  {
    id: 'tx-1',
    title: 'Coffee & Sandwich at Cafe',
    amount: 320,
    type: 'expense',
    category: 'Food',
    date: '2026-11-09',
    payment_method: 'UPI',
    updated_at: '2026-11-10T11:00:00.000Z', // 1 hour newer
    deleted_at: null
  }
];

const mergedNewer = mergeTransactions(localList, remoteListNewer, []);
assert(mergedNewer[0].amount === 320, 'Remote change won because updated_at was newer');
assert(mergedNewer[0].title === 'Coffee & Sandwich at Cafe', 'Title updated to remote edit');

// Remote has an older edit (stale sync)
const remoteListOlder = [
  {
    id: 'tx-1',
    title: 'Old Coffee',
    amount: 100,
    type: 'expense',
    category: 'Food',
    date: '2026-11-09',
    payment_method: 'UPI',
    updated_at: '2026-11-10T09:00:00.000Z', // 1 hour older
    deleted_at: null
  }
];

const mergedOlder = mergeTransactions(localList, remoteListOlder, []);
assert(mergedOlder[0].amount === 150, 'Local change preserved because local updated_at was newer than remote');

// ----------------------------------------------------------------------------
// Test 3: Deletion Tombstones (Soft Deletes across devices)
// ----------------------------------------------------------------------------
console.log('\nTest 3: Deletion Tombstones');
const remoteDeleted = [
  {
    id: 'tx-1',
    title: 'Coffee',
    amount: 150,
    updated_at: '2026-11-10T12:00:00.000Z',
    deleted_at: '2026-11-10T12:00:00.000Z' // Deleted on another device
  }
];

const mergedDeleted = mergeTransactions(localList, remoteDeleted, []);
assert(mergedDeleted.length === 0, 'Deleted record pruned locally when remote deleted_at is set');

// ----------------------------------------------------------------------------
// Test 4: Offline Queue Priority Over Stale Remote Pulls
// ----------------------------------------------------------------------------
console.log('\nTest 4: Offline Uncommitted Changes Priority');
const pendingQueue = [
  {
    entity: 'transaction',
    action: 'upsert',
    data: { id: 'tx-1', title: 'Local Offline Edit Pending Push', amount: 999 }
  }
];

const mergedWithQueue = mergeTransactions(localList, remoteListNewer, pendingQueue);
assert(mergedWithQueue[0].amount === 150, 'Local pending queue prevents remote override until synced');

// ----------------------------------------------------------------------------
// Test 5: First-Time Guest Data Migration Detection
// ----------------------------------------------------------------------------
console.log('\nTest 5: Guest Migration Detection');
// Mock localStorage in node environment for checkMigrationNeeded
global.localStorage = {
  getItem: (k) => null,
  setItem: () => {}
};

const migrationNeeded = checkMigrationNeeded('user-999', [{ id: 'tx-1' }], [{ category: 'Food' }]);
assert(migrationNeeded === true, 'Migration triggered when user logs in with local data');

const noMigrationNeeded = checkMigrationNeeded('user-999', [], []);
assert(noMigrationNeeded === false, 'Migration skipped if local data is empty');

// ----------------------------------------------------------------------------
// Test 6: Zero Calculation Regressions (Financial Calculations Integrity)
// ----------------------------------------------------------------------------
console.log('\nTest 6: Financial Calculations Integrity');
const testTransactions = [
  { id: '1', title: 'Salary', amount: 50000, type: 'income', category: 'Salary', date: '2026-11-01' },
  { id: '2', title: 'Rent', amount: 15000, type: 'expense', category: 'Housing', date: '2026-11-02' },
  { id: '3', title: 'Food', amount: 5000, type: 'expense', category: 'Food', date: '2026-11-05' }
];

const metrics = calculateDashboardMetrics(testTransactions);
assert(metrics.totalIncome === 50000, 'Total income is exactly 50000');
assert(metrics.totalExpenses === 20000, 'Total expenses is exactly 20000');
assert(metrics.totalBalance === 30000, 'Total balance is exactly 30000 (50000 - 20000)');
assert(metrics.savingsRate === 60, 'Savings rate is exactly 60% ((30000/50000)*100)');

const testBudgets = [
  { category: 'Food', limit: 6000 },
  { category: 'Housing', limit: 14000 }
];

const budgetSummary = calculateBudgetsStatus(testBudgets, testTransactions);
const foodBgt = budgetSummary.budgets.find(c => c.category === 'Food');
assert(foodBgt.spent === 5000, 'Food spent is 5000');
assert(foodBgt.status === 'warning', 'Food budget warning triggered (> 80% threshold: 5000/6000 = 83.3%)');

const housingBgt = budgetSummary.budgets.find(c => c.category === 'Housing');
assert(housingBgt.status === 'exceeded', 'Housing budget marked exceeded (15000 > 14000)');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
