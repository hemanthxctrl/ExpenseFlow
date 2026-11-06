import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CATEGORIES, PAYMENT_METHODS } from '../../data/categories';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';

export const TransactionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // if provided, edit mode
  defaultType = 'expense'
}) => {
  const { symbol } = useCurrency();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setType(initialData.type || 'expense');
      setCategory(initialData.category || 'Food');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialData.paymentMethod || 'UPI');
      setDescription(initialData.description || '');
    } else {
      // Reset to defaults
      setTitle('');
      setAmount('');
      setType(defaultType);
      setCategory(defaultType === 'income' ? 'Salary' : 'Food');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
    }
    setErrors({});
  }, [initialData, defaultType, isOpen]);

  // When type changes, ensure valid category is selected
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income' && (category === 'Food' || category === 'Shopping' || category === 'Transportation' || category === 'Bills' || category === 'Healthcare' || category === 'Entertainment' || category === 'Education')) {
      setCategory('Salary');
    } else if (newType === 'expense' && (category === 'Salary' || category === 'Freelancing')) {
      setCategory('Food');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      paymentMethod,
      description: description.trim()
    });

    onClose();
  };

  // Filter categories relevant to type (or allow all)
  const availableCategories = CATEGORIES.filter(c => {
    if (type === 'income') {
      return c.type === 'income' || c.type === 'both';
    }
    return c.type === 'expense' || c.type === 'both';
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      subtitle={initialData ? 'Update the details of your transaction' : 'Log a new income or expense into your ledger'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Expense vs Income */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-750">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Amount ({symbol}) *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 font-bold text-lg pointer-events-none">
              {symbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
              }}
              className={`w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-navy-900 border ${
                errors.amount ? 'border-rose-500' : 'border-slate-300 dark:border-navy-750'
              } rounded-xl text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50`}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
            </p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Title / Note *
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy Gourmet Dinner, Salary, Gym Fee"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors(prev => ({ ...prev, title: null }));
            }}
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-navy-750'
            } rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
            </p>
          )}
        </div>

        {/* Category & Payment Method Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-white dark:bg-navy-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method} className="bg-white dark:bg-navy-900">
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors(prev => ({ ...prev, date: null }));
            }}
            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border ${
              errors.date ? 'border-rose-500' : 'border-slate-300 dark:border-navy-750'
            } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50`}
          />
          {errors.date && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.date}
            </p>
          )}
        </div>

        {/* Description / Memo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Description / Memo (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add context, vendor, receipt info or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-750">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'success' : 'primary'}
          >
            {initialData ? 'Save Changes' : type === 'income' ? 'Add Income' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

