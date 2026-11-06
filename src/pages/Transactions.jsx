import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { Button } from '../components/common/Button';
import { Plus, Download } from 'lucide-react';
import { exportTransactionsToCSV } from '../utils/exportCSV';
import { filterByTimeframe, parseLocalDate } from '../utils/calculations';

export const Transactions = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Modal for new transaction
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check if any non-default filters are applied
  const hasActiveFilters = 
    searchQuery !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    dateFilter !== 'all' ||
    sortBy !== 'date-desc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setDateFilter('all');
    setSortBy('date-desc');
  };

  // Filter & Sort Logic
  const filteredTransactions = useMemo(() => {
    // 1. Timeframe filtering
    let result = filterByTimeframe(transactions, dateFilter);

    // 2. Search query filter (matches title, description, category, payment method)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
      );
    }

    // 3. Type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    // 4. Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => (t.category || '').toLowerCase() === categoryFilter.toLowerCase());
    }

    // 5. Payment method filter
    if (paymentFilter !== 'all') {
      result = result.filter(t => (t.paymentMethod || 'UPI').toLowerCase() === paymentFilter.toLowerCase());
    }

    // 6. Sort order
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': {
          const da = parseLocalDate(a.date) || new Date(0);
          const db = parseLocalDate(b.date) || new Date(0);
          return da - db;
        }

        case 'amount-desc':
          return Number(b.amount) - Number(a.amount);

        case 'amount-asc':
          return Number(a.amount) - Number(b.amount);

        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');

        case 'date-desc':
        default: {
          const da = parseLocalDate(a.date) || new Date(0);
          const db = parseLocalDate(b.date) || new Date(0);
          return db - da;
        }
      }
    });

    return result;
  }, [transactions, searchQuery, typeFilter, categoryFilter, paymentFilter, dateFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View, search, filter and manage all your historical finances
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => exportTransactionsToCSV(filteredTransactions, 'filtered_transactions.csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Transactions List */}
      <TransactionList
        transactions={filteredTransactions}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
};
