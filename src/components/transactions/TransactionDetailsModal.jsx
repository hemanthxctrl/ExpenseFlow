import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CategoryIcon } from '../common/CategoryIcon';
import { Badge } from '../common/Badge';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/formatters';
import { Calendar, CreditCard, FileText, ArrowUpRight, ArrowDownLeft, Edit2, Trash2 } from 'lucide-react';

export const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete
}) => {
  const { format } = useCurrency();
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      subtitle={`Transaction ID: ${transaction.id}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-6 pt-1">
        {/* Top Header Card */}
        <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-750">
          <CategoryIcon categoryId={transaction.category} size="lg" className="mb-3" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {transaction.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {transaction.category}
          </p>

          <div className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-1 ${
            isIncome ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
            <span>{isIncome ? '+' : '-'}{format(transaction.amount)}</span>
          </div>

          <div className="mt-3">
            <Badge variant={isIncome ? 'income' : 'expense'}>
              {isIncome ? 'Income' : 'Expense'}
            </Badge>
          </div>
        </div>

        {/* Metadata Details List */}
        <div className="space-y-3 bg-white dark:bg-navy-850 p-4 rounded-xl border border-slate-200 dark:border-navy-750/70 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-navy-750">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" /> Date
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(transaction.date)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-navy-750">
            <span className="text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" /> Payment Method
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {transaction.paymentMethod || 'UPI'}
            </span>
          </div>

          {transaction.description && (
            <div className="py-1.5">
              <span className="text-slate-400 flex items-center gap-2 mb-1.5">
                <FileText className="w-4 h-4 text-brand-400" /> Notes / Description
              </span>
              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm bg-slate-50 dark:bg-navy-900 p-3 rounded-xl border border-slate-200 dark:border-navy-750 leading-relaxed">
                {transaction.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={() => {
              onDelete(transaction);
              onClose();
            }}
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Edit2}
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

