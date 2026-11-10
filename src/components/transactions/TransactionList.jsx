import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { TransactionFormModal } from './TransactionFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { useCurrency } from '../../context/CurrencyContext';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const TransactionList = ({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenAddModal
}) => {
  const { format } = useCurrency();

  // Selected for View / Edit / Delete
  const [viewingTx, setViewingTx] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when transactions count changes
  useMemo(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Summary of displayed transactions
  const summary = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') inc += amt;
      else exp += amt;
    });
    return { income: inc, expense: exp, net: inc - exp };
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Quick Summary Pill for Filtered Results */}
      {transactions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/70 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-750 text-xs sm:text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Showing {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-500 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{format(summary.income)}
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <ArrowDownLeft className="w-3.5 h-3.5" /> -{format(summary.expense)}
            </span>
            <span className="hidden sm:inline font-bold text-slate-800 dark:text-slate-200">
              Net: {format(summary.net)}
            </span>
          </div>
        </div>
      )}

      {/* Transaction Items */}
      {paginatedTransactions.length > 0 ? (
        <div className="space-y-2.5">
          {paginatedTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onView={(item) => setViewingTx(item)}
              onEdit={(item) => setEditingTx(item)}
              onDelete={(item) => setDeletingTx(item)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transactions found"
          description="Try adjusting your search terms or filters to find what you're looking for."
          actionLabel="Add Transaction"
          onAction={onOpenAddModal}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-navy-750">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-navy-750 bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors active:scale-95"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-navy-750 bg-white dark:bg-navy-850 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors active:scale-95"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {viewingTx && (
        <TransactionDetailsModal
          isOpen={!!viewingTx}
          onClose={() => setViewingTx(null)}
          transaction={viewingTx}
          onEdit={(tx) => {
            setViewingTx(null);
            setEditingTx(tx);
          }}
          onDelete={(tx) => {
            setViewingTx(null);
            setDeletingTx(tx);
          }}
        />
      )}

      {editingTx && (
        <TransactionFormModal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          initialData={editingTx}
          onSubmit={(updatedData) => {
            onUpdateTransaction(editingTx.id, updatedData);
            setEditingTx(null);
          }}
        />
      )}

      {deletingTx && (
        <ConfirmDialog
          isOpen={!!deletingTx}
          onClose={() => setDeletingTx(null)}
          title="Delete Transaction?"
          message={`Are you sure you want to permanently delete "${deletingTx.title}" (${format(deletingTx.amount)})? This action cannot be reversed.`}
          confirmText="Delete Transaction"
          type="danger"
          onConfirm={() => {
            onDeleteTransaction(deletingTx.id);
            setDeletingTx(null);
          }}
        />
      )}
    </div>
  );
};

