import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { Button } from '../common/Button';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/transactions': 'Transactions History',
  '/budgets': 'Monthly Budgets',
  '/analytics': 'Analytics & Reports',
  '/settings': 'Application Settings'
};

export const Navbar = ({ onOpenSidebar, onOpenAddModal }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { currencyCode, setCurrencyCode, currencies } = useCurrency();

  const currentTitle = PAGE_TITLES[location.pathname] || 'ExpenseFlow';

  return (
    <header className="sticky top-0 z-30 min-h-16 sm:min-h-20 pt-[env(safe-area-inset-top,0px)] bg-white/85 dark:bg-navy-900/85 backdrop-blur-md border-b border-slate-200 dark:border-navy-750/80 transition-colors duration-200 px-3.5 sm:px-6 lg:px-8">
      <div className="h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile menu button + Page title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 lg:hidden focus:outline-none shrink-0"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[150px] xs:max-w-[190px] sm:max-w-none">
              {currentTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              Track, budget and optimize your personal wealth
            </p>
          </div>
        </div>

        {/* Right: Actions (Currency selector, Theme toggle, Add Transaction) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="appearance-none bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl pl-2.5 sm:pl-3 pr-6 sm:pr-7 py-2 border border-slate-300 dark:border-navy-700 hover:border-slate-400 dark:hover:border-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer transition-colors"
              title="Select Currency"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 sm:px-2 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 border border-slate-200 dark:border-navy-700 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>

          {/* Add Transaction Button */}
          <Button
            onClick={onOpenAddModal}
            variant="primary"
            size="sm"
            icon={Plus}
            className="hidden sm:inline-flex"
          >
            Add Transaction
          </Button>

          {/* Mobile quick add button */}
          <button
            onClick={onOpenAddModal}
            className="sm:hidden p-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/30 shrink-0"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
