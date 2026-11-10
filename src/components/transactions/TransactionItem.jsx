import React from 'react';
import { CategoryIcon } from '../common/CategoryIcon';
import { useCurrency } from '../../context/CurrencyContext';
import { formatRelativeDate } from '../../utils/formatters';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';

export const TransactionItem = ({
  transaction,
  onEdit,
  onDelete,
  onView
}) => {
  const { format } = useCurrency();
  const isIncome = transaction.type === 'income';

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-navy-750/70 hover:border-slate-300 dark:hover:border-navy-650 bg-white dark:bg-navy-850 hover:bg-slate-50/80 dark:hover:bg-navy-800/60 transition-all duration-200 gap-3">
      {/* Left: Category Icon + Title + Meta */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <CategoryIcon categoryId={transaction.category} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              onClick={() => onView && onView(transaction)}
              className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand-400 transition-colors"
              title={transaction.title}
            >
              {transaction.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatRelativeDate(transaction.date)}</span>
            <span>•</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {transaction.category}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
              {transaction.paymentMethod || 'UPI'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount + Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-navy-800/80 shrink-0">
        <div className="text-left sm:text-right">
          <div className={`flex items-center sm:justify-end font-bold text-base sm:text-lg tracking-tight ${
            isIncome ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
          }`}>
            {isIncome ? (
              <ArrowUpRight className="w-4 h-4 mr-0.5 shrink-0" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 mr-0.5 shrink-0" />
            )}
            <span>{isIncome ? '+' : '-'}{format(transaction.amount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 opacity-95 sm:opacity-75 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={() => onView(transaction)}
              className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-navy-750 rounded-lg transition-colors focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
              title="View Details"
              aria-label="View transaction details"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-navy-750 rounded-lg transition-colors focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
            title="Edit Transaction"
            aria-label="Edit transaction"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-navy-750 rounded-lg transition-colors focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center active:scale-95"
            title="Delete Transaction"
            aria-label="Delete transaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
