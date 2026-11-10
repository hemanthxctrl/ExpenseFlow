import React, { useState, useEffect, useRef } from 'react';
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
  const amountInputRef = useRef(null);

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

    // Focus amount input for rapid entry on mobile
    if (isOpen) {
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
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

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
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

  // Filter categories relevant to type
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
      maxWidth="max-w-lg"
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
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 shrink-0" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              Income
            </button>
          </div>
        </div>

        {/* Amount Input - Prominent with Mobile Decimal Numeric Keypad */}
        <div className="bg-slate-50/50 dark:bg-navy-900/40 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-navy-750">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Amount ({symbol}) *
          </label>
          <div className="relative flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-2 select-none">
              {symbol}
            </span>
            <input
              ref={amountInputRef}
              type="number"
              step="any"
              min="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
              }}
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.amount ? 'border-rose-500' : 'border-slate-300 dark:border-navy-700 focus:border-brand-500'
              } py-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors`}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.amount}
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
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-navy-900 border ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-navy-750'
            } rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.title}
            </p>
          )}
        </div>

        {/* Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]"
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
            } rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[44px]`}
          />
          {errors.date && (
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.date}
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
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-750 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-750">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-[44px] px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'success' : 'primary'}
            className="min-h-[44px] px-6 font-bold"
          >
            {initialData ? 'Save Changes' : type === 'income' ? 'Add Income' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
