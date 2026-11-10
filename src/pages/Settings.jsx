import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { usePWA } from '../context/PWAContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { exportTransactionsToCSV, exportBackupJSON } from '../utils/exportCSV';
import {
  User,
  Coins,
  Sun,
  Moon,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  Sparkles,
  Info,
  Smartphone,
  DownloadCloud,
  CheckCircle2,
  Wifi,
  WifiOff
} from 'lucide-react';

export const Settings = () => {
  const { profile, updateProfile, transactions, budgets, resetSampleData, clearAllData, importData } = useFinance();
  const { currencyCode, setCurrencyCode, currencies } = useCurrency();
  const { theme, setTheme, isDark } = useTheme();
  const { showToast } = useToast();
  const { isOnline, isInstallable, isInstalled, installApp } = usePWA();

  // Profile form state
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [occupation, setOccupation] = useState(profile.occupation || '');

  // Confirm dialogs state
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      occupation: occupation.trim()
    });
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const success = importData(json);
        if (success) {
          if (json.profile) {
            setName(json.profile.name || '');
            setEmail(json.profile.email || '');
            setOccupation(json.profile.occupation || '');
          }
        }
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, local preferences, currency and data backups
        </p>
      </div>

      {/* 1. Profile Information */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-750">
          <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize your display identity stored in local storage
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              {name ? name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {name || 'Your Name'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Avatar generated from your initials
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun.sharma@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Occupation / Subtitle
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Preferences: Currency & Theme */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-750">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Preferences & Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your default currency and visual theme
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Currency Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Base Currency
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                INR (₹) is default. All calculations and charts adapt to this currency.
              </p>
            </div>

            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code} className="bg-white dark:bg-navy-900">
                  {c.name} ({c.symbol} - {c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-navy-750">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Dashboard Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between Deep Navy Dark SaaS theme and Light theme.
              </p>
            </div>

            <div className="inline-flex p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-750">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-navy-800 text-white shadow-sm border border-navy-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-brand-400" />
                Dark (Default)
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  !isDark
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Progressive Web App (PWA) & Mobile Installation */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-750">
          <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Progressive Web App (PWA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Install ExpenseFlow on your Android phone or desktop for full offline operation
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Application Mode
                </span>
                {isInstalled ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Standalone PWA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full border border-brand-500/30">
                    Browser Web App
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isInstalled
                  ? 'Running in standalone mobile application mode. Works seamlessly offline.'
                  : 'Install ExpenseFlow on your mobile home screen to record expenses with one tap.'}
              </p>
            </div>

            {isInstallable && (
              <Button
                variant="primary"
                size="sm"
                icon={DownloadCloud}
                onClick={installApp}
                className="shrink-0 font-bold"
              >
                Install ExpenseFlow
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-750 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {isOnline ? 'Online Ready' : 'Operating Offline'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  LocalStorage persists data even without internet
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-750 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Private & Device-Only
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  No remote backend — data stays 100% on this device
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Data Management: Export CSV, Backup, Reset, Clear */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-navy-750">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Persistence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your data, backup/restore, or manage local storage
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Export CSV */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Export to CSV
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download a clean spreadsheet file with all transaction history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => exportTransactionsToCSV(transactions, 'expenseflow_transactions.csv')}
            >
              Export CSV
            </Button>
          </div>

          {/* Backup & Restore JSON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                JSON Backup & Restore
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a full offline snapshot of transactions, budgets, and profile
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => exportBackupJSON({ transactions, budgets, profile })}
              >
                Backup
              </Button>
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 text-xs px-3 py-1.5 gap-1.5 min-h-[34px] bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700">
                  <Upload className="w-3.5 h-3.5" />
                  Restore
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Sample Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Reset to Sample Data
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore the 20 realistic Indian sample transactions and default budgets
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={() => setShowResetDialog(true)}
            >
              Reset Data
            </Button>
          </div>

          {/* Clear All Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20">
            <div>
              <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
                Wipe Local Database
              </p>
              <p className="text-xs text-rose-400/80">
                Permanently purge all transactions and budget settings from your browser
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setShowClearDialog(true)}
            >
              Clear Everything
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. College Project Spec & About Card */}
      <Card className="bg-gradient-to-br from-brand-950/40 via-navy-850 to-navy-900 border-brand-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-white">
            ExpenseFlow – Personal Finance Manager
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          A modern, frontend-only financial management architecture built with React 18, Vite, Tailwind CSS, Recharts, and localStorage persistence. Engineered without any third-party backend servers, guaranteeing 100% offline functionality, data privacy, and instant responsiveness.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-750">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Framework</span>
            <span className="text-white font-bold">React 18 + Vite</span>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-750">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Styling</span>
            <span className="text-white font-bold">Tailwind CSS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-750">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Charts</span>
            <span className="text-white font-bold">Recharts 2.x</span>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900/80 border border-navy-750">
            <span className="text-slate-400 block text-[10px] font-semibold uppercase">Persistence</span>
            <span className="text-white font-bold">localStorage</span>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        title="Reset to Sample Data?"
        message="This will replace your current transactions with the 20 realistic Indian sample transactions and default category budgets. Are you sure you want to proceed?"
        confirmText="Reset to Sample"
        type="warning"
        onConfirm={resetSampleData}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        title="Clear All Transactions and Budgets?"
        message="This action will permanently delete all records stored in your browser's localStorage. You will start with a blank ledger."
        confirmText="Yes, Wipe All Data"
        type="danger"
        onConfirm={clearAllData}
      />
    </div>
  );
};

