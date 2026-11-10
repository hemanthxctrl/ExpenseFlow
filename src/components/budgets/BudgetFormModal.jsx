import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CATEGORIES } from '../../data/categories';
import { useCurrency } from '../../context/CurrencyContext';
import { AlertCircle } from 'lucide-react';

export const BudgetFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  existingCategories = []
}) => {
  const { symbol } = useCurrency();
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');

  // Categories available for budgeting (expense categories or both)
  const eligibleCategories = CATEGORIES.filter(c => c.type === 'expense' || c.type === 'both');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Food');
      setLimit(initialData.limit ? String(initialData.limit) : '');
    } else {
      // Pick first category that does not already have a budget
      const unused = eligibleCategories.find(c => !existingCategories.includes(c.id));
      setCategory(unused ? unused.id : 'Food');
      setLimit('');
    }
    setError('');
  }, [initialData, existingCategories, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);

    if (!limit || isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid monthly budget amount greater than 0');
      return;
    }

    onSubmit(category, numLimit);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit ${initialData.category} Budget` : 'Set Category Budget'}
      subtitle="Define a monthly spending ceiling to stay on track"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Category
          </label>
          <select
            value={category}
            disabled={!!initialData}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60 min-h-[44px]"
          >
            {eligibleCategories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-white dark:bg-navy-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Monthly Limit ({symbol}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-base pointer-events-none">
              {symbol}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              inputMode="decimal"
              placeholder="e.g. 10000"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
            />
          </div>
          {error && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-750">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Update Limit' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

