import React from 'react';
import { Card } from '../common/Card';
import { useCurrency } from '../../context/CurrencyContext';
import { ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';

export const BudgetSummary = ({ budgetSummary }) => {
  const { format } = useCurrency();
  const { totalAllocated, totalSpent, totalRemaining, overallPercentage, hasExceeded, hasWarning } = budgetSummary;

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-navy-850 dark:to-navy-800 border-slate-200 dark:border-navy-750">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Summary Metrics */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Monthly Budget Utilization
            </h3>
            {hasExceeded ? (
              <span className="flex items-center text-xs font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Action Required
              </span>
            ) : (
              <span className="flex items-center text-xs font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                On Track
              </span>
            )}
          </div>

          {/* Large Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{overallPercentage}% of total budget consumed</span>
              <span>{format(totalSpent)} / {format(totalAllocated)}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-navy-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-300 dark:border-navy-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  overallPercentage >= 100
                    ? 'bg-rose-500'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-brand-600 to-violet-400'
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Key Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-navy-750 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Allocated</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {format(totalAllocated)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Spent</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-500">
              {format(totalSpent)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block font-medium">Safe to Spend</span>
            <span className={`text-base sm:text-lg font-extrabold ${totalRemaining < 0 ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {format(totalRemaining)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

