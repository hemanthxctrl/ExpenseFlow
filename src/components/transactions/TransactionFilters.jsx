import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/categories';

export const TransactionFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="bg-white dark:bg-navy-850 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-navy-750 shadow-sm space-y-3.5">
      {/* Search Bar + Type Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, description, or vendor..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="grid grid-cols-3 md:inline-flex p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-750 shrink-0">
          <button
            onClick={() => onTypeFilterChange('all')}
            className={`py-2 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-navy-750 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onTypeFilterChange('expense')}
            className={`py-2 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center ${
              typeFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => onTypeFilterChange('income')}
            className={`py-2 px-3 sm:px-3.5 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center justify-center ${
              typeFilter === 'income'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Secondary Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[42px]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-white dark:bg-navy-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Payment Method
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[42px]"
          >
            <option value="all">All Methods</option>
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method} className="bg-white dark:bg-navy-900">
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Date / Timeframe Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Timeframe
          </label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[42px]"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="this-year">This Year</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Sort Order
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[42px]"
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="amount-desc">Amount (Highest first)</option>
            <option value="amount-asc">Amount (Lowest first)</option>
            <option value="title-asc">Title (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Reset Filters action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-750/70 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Filtered view active
          </span>
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-brand-500 hover:text-brand-400 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-brand-500/10 min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
