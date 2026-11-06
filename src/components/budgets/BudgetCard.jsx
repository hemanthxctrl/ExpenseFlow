import React from 'react';
import { Card } from '../common/Card';
import { CategoryIcon } from '../common/CategoryIcon';
import { Badge } from '../common/Badge';
import { useCurrency } from '../../context/CurrencyContext';
import { AlertTriangle, AlertCircle, Edit2, Trash2 } from 'lucide-react';

export const BudgetCard = ({
  budget, // { category, limit, spent, remaining, percentage, status }
  onEdit,
  onDelete
}) => {
  const { format } = useCurrency();
  const { category, limit, spent, remaining, percentage, status } = budget;

  const isExceeded = status === 'exceeded';
  const isWarning = status === 'warning';

  const getProgressColor = () => {
    if (isExceeded) return 'bg-rose-500 shadow-glow-expense';
    if (isWarning) return 'bg-amber-500';
    return 'bg-gradient-to-r from-brand-500 to-violet-400';
  };

  const getCardBorder = () => {
    if (isExceeded) return 'border-rose-500/40 dark:border-rose-500/30';
    if (isWarning) return 'border-amber-500/40 dark:border-amber-500/30';
    return 'border-slate-200 dark:border-navy-750/80';
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 ${getCardBorder()}`}>
      {/* Exceeded / Warning banner glow */}
      {isExceeded && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500 animate-pulse" />
      )}
      {isWarning && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
      )}

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CategoryIcon categoryId={category} size="md" />
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {category}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Budget: {format(limit)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
            title="Edit budget limit"
            aria-label={`Edit ${category} budget`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
            title="Delete budget"
            aria-label={`Delete ${category} budget`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        {isExceeded ? (
          <Badge variant="expense" size="sm" className="font-semibold">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Exceeded by {format(Math.abs(remaining))} ({percentage}%)
          </Badge>
        ) : isWarning ? (
          <Badge variant="warning" size="sm" className="font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Warning: {percentage}% of budget spent
          </Badge>
        ) : (
          <Badge variant="violet" size="sm">
            {format(remaining)} remaining ({100 - percentage}%)
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-navy-750">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Figures breakdown */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div>
          <span className="text-slate-400 block">Spent this month</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {format(spent)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block">Remaining</span>
          <span className={`font-bold ${isExceeded ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
            {remaining < 0 ? `-${format(Math.abs(remaining))}` : format(remaining)}
          </span>
        </div>
      </div>
    </Card>
  );
};

