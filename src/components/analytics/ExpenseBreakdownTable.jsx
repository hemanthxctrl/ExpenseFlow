import React from 'react';
import { CategoryIcon } from '../common/CategoryIcon';
import { useCurrency } from '../../context/CurrencyContext';

export const ExpenseBreakdownTable = ({ categoryData }) => {
  const { format } = useCurrency();

  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        No expense data recorded for this period.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-navy-750 text-slate-400 uppercase tracking-wider text-[11px]">
            <th className="pb-3 font-semibold">Category</th>
            <th className="pb-3 font-semibold text-center">Transactions</th>
            <th className="pb-3 font-semibold text-right">Amount</th>
            <th className="pb-3 font-semibold text-right">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-navy-750/60">
          {categoryData.map((item) => (
            <tr key={item.category} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon categoryId={item.category} size="sm" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.category}
                  </span>
                </div>
              </td>
              <td className="py-3 text-center text-slate-500 dark:text-slate-400 font-medium">
                {item.count}
              </td>
              <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                {format(item.amount)}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-slate-100 dark:bg-navy-900 rounded-full h-1.5 hidden sm:block">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="font-semibold text-brand-400 min-w-[36px]">
                    {item.percentage}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

