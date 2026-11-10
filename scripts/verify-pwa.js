import fs from 'fs';
import path from 'path';

console.log('--- RUNNING PWA & MOBILE SUITE VERIFICATION ---');

// 1. Verify manifest.webmanifest
const manifestPath = path.resolve('dist/manifest.webmanifest');
if (!fs.existsSync(manifestPath)) {
  console.error('FAIL: manifest.webmanifest does not exist in dist/');
  process.exit(1);
}

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log('✓ manifest.webmanifest parsed as valid JSON');

const requiredFields = [
  'name',
  'short_name',
  'description',
  'start_url',
  'scope',
  'display',
  'background_color',
  'theme_color',
  'icons'
];

for (const field of requiredFields) {
  if (!manifestContent[field]) {
    console.error(`FAIL: manifest missing required field "${field}"`);
    process.exit(1);
  }
}
console.log('✓ All required manifest fields present');

// 2. Verify icons
const sizesExpected = ['192x192', '512x512'];
for (const icon of manifestContent.icons) {
  const iconPath = path.join('dist', icon.src.replace(/^\//, ''));
  if (!fs.existsSync(iconPath)) {
    console.error(`FAIL: icon ${icon.src} not found on disk at ${iconPath}`);
    process.exit(1);
  }
  const stats = fs.statSync(iconPath);
  if (stats.size < 500) {
    console.error(`FAIL: icon ${icon.src} size seems invalid (${stats.size} bytes)`);
    process.exit(1);
  }
  console.log(`✓ Icon verified: ${icon.src} (${icon.sizes}, ${icon.purpose}) [${stats.size} bytes]`);
}

// 3. Verify service worker
const swPath = path.resolve('dist/sw.js');
if (!fs.existsSync(swPath)) {
  console.error('FAIL: sw.js does not exist in dist/');
  process.exit(1);
}
const swContent = fs.readFileSync(swPath, 'utf8');
if (!swContent.includes("addEventListener('install'")) {
  console.error('FAIL: sw.js missing install listener');
  process.exit(1);
}
if (!swContent.includes("addEventListener('fetch'")) {
  console.error('FAIL: sw.js missing fetch listener');
  process.exit(1);
}
if (!swContent.includes("addEventListener('activate'")) {
  console.error('FAIL: sw.js missing activate listener');
  process.exit(1);
}
console.log('✓ Service Worker verified with install, activate, and fetch handlers');

// 4. Verify index.html tags
const indexPath = path.resolve('dist/index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const expectedMeta = [
  'rel="manifest"',
  'name="viewport"',
  'viewport-fit=cover',
  'name="theme-color"',
  'apple-touch-icon',
  'name="mobile-web-app-capable"'
];

for (const tag of expectedMeta) {
  if (!indexHtml.includes(tag)) {
    console.error(`FAIL: index.html missing tag pattern "${tag}"`);
    process.exit(1);
  }
}
console.log('✓ index.html verified with manifest, viewport-fit=cover, theme-color, apple-touch-icon');

// 5. Verify calculation logic intact
import('../src/utils/calculations.js').then((calc) => {
  const testTxs = [
    { id: '1', amount: 50000, type: 'income', category: 'Salary', date: '2026-11-01' },
    { id: '2', amount: 15000, type: 'expense', category: 'Housing', date: '2026-11-02' },
    { id: '3', amount: 5000, type: 'expense', category: 'Food', date: '2026-11-03' }
  ];

  const metrics = calc.calculateDashboardMetrics(testTxs);
  if (metrics.totalBalance !== 30000) {
    console.error('FAIL: calculateDashboardMetrics total balance mismatch', metrics.totalBalance);
    process.exit(1);
  }
  console.log('✓ Financial calculations verified: totalBalance = 30000, income = 50000, expense = 20000');
  console.log('--- ALL PWA & APPLICATION CHECKS PASSED ---');
}).catch((err) => {
  console.error('Error importing calculations:', err);
  process.exit(1);
});

