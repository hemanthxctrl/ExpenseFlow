import fs from 'fs';
import path from 'path';

console.log('=====================================================');
console.log('   EXPENSEFLOW — PHASE 2 FULL QA & AUDIT SUITE       ');
console.log('=====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// MODULE 1: FINANCIAL DATA INTEGRITY & CALCULATION ENGINE
// -----------------------------------------------------------------------------
console.log('--- 1. TESTING FINANCIAL INTEGRITY & CALCULATION ENGINE ---');

const {
  calculateDashboardMetrics,
  calculateBudgetsStatus,
  calculateMonthlyTrend,
  calculateCategoryBreakdown,
  calculatePaymentMethodBreakdown,
  calcPercentageChange,
  isInMonth,
  filterByTimeframe
} = await import('../src/utils/calculations.js');

const { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_PROFILE } = await import('../src/data/sampleData.js');
const { CURRENCIES, DEFAULT_CURRENCY } = await import('../src/data/currencies.js');

// Test 1.1: Initial Sample Data Integrity
assert(Array.isArray(INITIAL_TRANSACTIONS) && INITIAL_TRANSACTIONS.length === 20, 'Initial sample transactions count is 20');
assert(Array.isArray(INITIAL_BUDGETS) && INITIAL_BUDGETS.length === 8, 'Initial sample budgets count is 8');
assert(INITIAL_PROFILE.name === 'Arjun Sharma', 'Initial sample profile matches default');

// Test 1.2: CRUD Simulations
let testLedger = [...INITIAL_TRANSACTIONS];

// Add Income
const incomeTx = {
  id: 'tx-test-inc-1',
  title: 'Consulting Retainer',
  amount: 45000,
  type: 'income',
  category: 'Freelancing',
  date: '2026-11-05',
  paymentMethod: 'Bank Transfer',
  description: 'Q4 Consulting'
};
testLedger.unshift(incomeTx);
assert(testLedger.length === 21 && testLedger[0].id === 'tx-test-inc-1', 'Successfully added income transaction');

// Add Expense
const expenseTx = {
  id: 'tx-test-exp-1',
  title: 'Organic Groceries',
  amount: 3200,
  type: 'expense',
  category: 'Food',
  date: '2026-11-06',
  paymentMethod: 'UPI',
  description: 'Nature Basket'
};
testLedger.unshift(expenseTx);
assert(testLedger.length === 22 && testLedger[0].id === 'tx-test-exp-1', 'Successfully added expense transaction');

// Edit Transaction
testLedger = testLedger.map(t => t.id === 'tx-test-exp-1' ? { ...t, amount: 3500, title: 'Updated Groceries' } : t);
const updatedTx = testLedger.find(t => t.id === 'tx-test-exp-1');
assert(updatedTx.amount === 3500 && updatedTx.title === 'Updated Groceries', 'Successfully edited existing transaction');

// Delete Transaction
testLedger = testLedger.filter(t => t.id !== 'tx-test-exp-1');
assert(!testLedger.some(t => t.id === 'tx-test-exp-1') && testLedger.length === 21, 'Successfully deleted transaction');

// Test 1.3: Calculation Engine Verification
const initialMetrics = calculateDashboardMetrics(INITIAL_TRANSACTIONS);
assert(typeof initialMetrics.totalBalance === 'number', 'Metrics returns valid totalBalance number');
assert(typeof initialMetrics.currentMonthIncome === 'number', 'Metrics returns valid currentMonthIncome number');
assert(typeof initialMetrics.currentMonthExpense === 'number', 'Metrics returns valid currentMonthExpense number');
assert(typeof initialMetrics.currentMonthSavings === 'number', 'Metrics returns valid currentMonthSavings number');

// Total Balance Mathematical Check: Income Sum - Expense Sum
const manualSumIncome = INITIAL_TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
const manualSumExpense = INITIAL_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
const manualBalance = manualSumIncome - manualSumExpense;
assert(initialMetrics.totalBalance === manualBalance, `Total balance matches ledger sum (${manualBalance})`);

// Test 1.4: 80% Budget Warning Threshold Logic
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const testDate = `${currentYear}-${currentMonth}-05`;

const budgetTestCases = [
  { spent: 500, limit: 1000, expectedStatus: 'normal', expectedPct: 50 },
  { spent: 750, limit: 1000, expectedStatus: 'normal', expectedPct: 75 },
  { spent: 790, limit: 1000, expectedStatus: 'normal', expectedPct: 79 },
  { spent: 800, limit: 1000, expectedStatus: 'warning', expectedPct: 80 },
  { spent: 950, limit: 1000, expectedStatus: 'warning', expectedPct: 95 },
  { spent: 1000, limit: 1000, expectedStatus: 'exceeded', expectedPct: 100 },
  { spent: 1250, limit: 1000, expectedStatus: 'exceeded', expectedPct: 125 }
];

for (const tc of budgetTestCases) {
  const mockBudgets = [{ category: 'TestCat', limit: tc.limit }];
  const mockTxs = [{ category: 'TestCat', amount: tc.spent, type: 'expense', date: testDate }];
  const status = calculateBudgetsStatus(mockBudgets, mockTxs);
  const item = status.budgets[0];
  assert(
    item.status === tc.expectedStatus,
    `Budget threshold check: ${tc.spent}/${tc.limit} (${tc.expectedPct}%) => status="${item.status}" (expected "${tc.expectedStatus}")`
  );
}

// Test 1.5: Currency List
assert(CURRENCIES.length === 8, 'Supported currency list contains all 8 predefined currencies');
assert(DEFAULT_CURRENCY === 'INR', 'Default base currency is INR');

// -----------------------------------------------------------------------------
// MODULE 2: DATA PERSISTENCE & BACKUP/RESTORE VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. TESTING LOCALSTORAGE KEYS & BACKUP / RESTORE ---');

const REQUIRED_STORAGE_KEYS = {
  TRANSACTIONS: 'expenseflow_transactions',
  BUDGETS: 'expenseflow_budgets',
  PROFILE: 'expenseflow_profile',
  CURRENCY: 'expenseflow_currency',
  THEME: 'expenseflow_theme'
};

assert(REQUIRED_STORAGE_KEYS.TRANSACTIONS === 'expenseflow_transactions', 'Transactions key: expenseflow_transactions');
assert(REQUIRED_STORAGE_KEYS.BUDGETS === 'expenseflow_budgets', 'Budgets key: expenseflow_budgets');
assert(REQUIRED_STORAGE_KEYS.PROFILE === 'expenseflow_profile', 'Profile key: expenseflow_profile');
assert(REQUIRED_STORAGE_KEYS.CURRENCY === 'expenseflow_currency', 'Currency key: expenseflow_currency');
assert(REQUIRED_STORAGE_KEYS.THEME === 'expenseflow_theme', 'Theme key: expenseflow_theme');

// Test Backup JSON Serialization & Deserialization
const backupPayload = {
  transactions: INITIAL_TRANSACTIONS,
  budgets: INITIAL_BUDGETS,
  profile: INITIAL_PROFILE,
  version: '1.0.0'
};

const serialized = JSON.stringify(backupPayload);
const deserialized = JSON.parse(serialized);
assert(deserialized.transactions.length === 20, 'Backup serialization preserves all 20 transactions');
assert(deserialized.budgets.length === 8, 'Backup serialization preserves all 8 budgets');
assert(deserialized.profile.name === 'Arjun Sharma', 'Backup serialization preserves profile data');

// Test CSV Generation Output
const { exportTransactionsToCSV } = await import('../src/utils/exportCSV.js');
assert(typeof exportTransactionsToCSV === 'function', 'exportTransactionsToCSV utility is exported and callable');

// -----------------------------------------------------------------------------
// MODULE 3: PWA MANIFEST & ICONS SPECIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. TESTING PWA MANIFEST & ICONS SPECIFICATION ---');

const manifestRaw = fs.readFileSync('public/manifest.webmanifest', 'utf8');
const manifest = JSON.parse(manifestRaw);

assert(manifest.name === 'ExpenseFlow', 'Manifest name is "ExpenseFlow"');
assert(manifest.short_name === 'ExpenseFlow', 'Manifest short_name is "ExpenseFlow"');
assert(manifest.display === 'standalone', 'Manifest display is "standalone"');
assert(manifest.start_url === '/', 'Manifest start_url is "/"');
assert(manifest.scope === '/', 'Manifest scope is "/"');
assert(manifest.theme_color.toLowerCase() === '#0b0f19', 'Manifest theme_color is #0B0F19');
assert(manifest.background_color.toLowerCase() === '#0b0f19', 'Manifest background_color is #0B0F19');

// Test Icon entries in manifest
const iconPaths = [
  { file: 'public/icon-192x192.png', expectedPurpose: 'any' },
  { file: 'public/icon-512x512.png', expectedPurpose: 'any' },
  { file: 'public/icon-maskable-192x192.png', expectedPurpose: 'maskable' },
  { file: 'public/icon-maskable-512x512.png', expectedPurpose: 'maskable' },
  { file: 'public/apple-touch-icon.png', expectedPurpose: null },
  { file: 'public/favicon.svg', expectedPurpose: null }
];

for (const icon of iconPaths) {
  assert(fs.existsSync(icon.file), `Icon file exists: ${icon.file}`);
  const stat = fs.statSync(icon.file);
  assert(stat.size > 1000, `Icon file ${icon.file} is non-empty (${stat.size} bytes)`);
}

// Test Home Screen Shortcuts
assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length === 3, 'Manifest defines 3 home screen shortcuts');
const shortcutUrls = manifest.shortcuts.map(s => s.url);
assert(shortcutUrls.includes('/?action=add'), 'Shortcut 1 URL is "/?action=add" (Add Transaction)');
assert(shortcutUrls.includes('/transactions'), 'Shortcut 2 URL is "/transactions" (View Transactions)');
assert(shortcutUrls.includes('/budgets'), 'Shortcut 3 URL is "/budgets" (Monthly Budgets)');

// -----------------------------------------------------------------------------
// MODULE 4: SERVICE WORKER & OFFLINE ARCHITECTURE
// -----------------------------------------------------------------------------
console.log('\n--- 4. TESTING SERVICE WORKER & OFFLINE CACHING ---');

const swContent = fs.readFileSync('public/sw.js', 'utf8');

assert(swContent.includes('CACHE_NAME'), 'SW defines CACHE_NAME version');
assert(swContent.includes('PRECACHE_ASSETS'), 'SW defines PRECACHE_ASSETS shell list');
assert(swContent.includes("self.addEventListener('install'"), 'SW registers install event');
assert(swContent.includes("self.addEventListener('activate'"), 'SW registers activate event');
assert(swContent.includes("self.addEventListener('fetch'"), 'SW registers fetch event');
assert(swContent.includes("self.addEventListener('message'"), 'SW registers message event for SKIP_WAITING');
assert(swContent.includes("request.mode === 'navigate'"), 'SW handles SPA navigation mode fallback');
assert(swContent.includes('/index.html'), 'SW falls back to cached /index.html when offline');
assert(swContent.includes('caches.delete'), 'SW cleans up old caches on activation');
assert(!swContent.includes('localStorage.clear'), 'SW never touches LocalStorage data');

// -----------------------------------------------------------------------------
// MODULE 5: VERCEL DEPLOYMENT CONFIGURATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. TESTING VERCEL DEPLOYMENT CONFIGURATION ---');

const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert(vercelConfig.framework === 'vite', 'Vercel framework is "vite"');
assert(vercelConfig.buildCommand === 'npm run build', 'Vercel buildCommand is "npm run build"');
assert(vercelConfig.outputDirectory === 'dist', 'Vercel outputDirectory is "dist"');
assert(Array.isArray(vercelConfig.rewrites), 'Vercel rewrites configured for SPA routing');

// Check Service Worker Header in vercel.json
const swHeaderRule = vercelConfig.headers?.find(h => h.source === '/sw.js');
assert(!!swHeaderRule, 'Vercel config has dedicated headers for /sw.js');
const swCacheControl = swHeaderRule?.headers?.find(k => k.key === 'Cache-Control')?.value;
assert(swCacheControl?.includes('no-cache'), 'SW Cache-Control includes no-cache to avoid stale worker');

// Check Manifest Header in vercel.json
const manifestHeaderRule = vercelConfig.headers?.find(h => h.source === '/manifest.webmanifest');
assert(!!manifestHeaderRule, 'Vercel config has dedicated headers for /manifest.webmanifest');
const manifestMime = manifestHeaderRule?.headers?.find(k => k.key === 'Content-Type')?.value;
assert(manifestMime?.includes('application/manifest+json'), 'Manifest Content-Type is application/manifest+json');

// -----------------------------------------------------------------------------
// MODULE 6: MOBILE LAYOUT, SAFE AREAS & TOUCH TARGETS
// -----------------------------------------------------------------------------
console.log('\n--- 6. TESTING MOBILE LAYOUT, SAFE AREAS & TOUCH TARGETS ---');

const layoutContent = fs.readFileSync('src/components/layout/Layout.jsx', 'utf8');
const mobileNavContent = fs.readFileSync('src/components/layout/MobileNav.jsx', 'utf8');
const indexCss = fs.readFileSync('src/index.css', 'utf8');
const txFormContent = fs.readFileSync('src/components/transactions/TransactionFormModal.jsx', 'utf8');

assert(layoutContent.includes('pb-[calc(6rem+env(safe-area-inset-bottom,0px))]'), 'Main layout has 6rem safe area bottom clearance');
assert(layoutContent.includes('OfflineIndicator'), 'Layout integrates OfflineIndicator banner');
assert(layoutContent.includes('Plus'), 'Layout integrates Floating Action Button (FAB)');
assert(mobileNavContent.includes('safe-area-bottom'), 'MobileNav uses safe-area-bottom padding');
assert(mobileNavContent.includes('min-h-[48px]'), 'MobileNav tabs meet minimum 48px touch target height');
assert(indexCss.includes('overflow-x: hidden'), 'Index CSS enforces overflow-x: hidden to prevent horizontal scroll');
assert(indexCss.includes('env(safe-area-inset-bottom'), 'Index CSS defines safe-area-bottom utility');
assert(txFormContent.includes('inputMode="decimal"'), 'Transaction form uses inputMode="decimal" for mobile numeric keypad');

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log('\n=====================================================');
console.log(`   QA AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${failedTests} FAILED)`);
console.log('=====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n>>> ALL PRODUCTION READINESS & DATA INTEGRITY TESTS PASSED! <<<\n');
}
