import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

export const CashflowChart = ({ data }) => {
  const { format, formatCompact } = useCurrency();
  const [activeMetric, setActiveMetric] = useState('all'); // 'all' | 'income' | 'expense'

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900/95 border border-navy-750 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Metric Selector Buttons */}
      <div className="flex items-center justify-end gap-1.5 mb-4 text-xs">
        <button
          onClick={() => setActiveMetric('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeMetric === 'all'
              ? 'bg-brand-500 text-white'
              : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveMetric('income')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeMetric === 'income'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setActiveMetric('expense')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeMetric === 'expense'
              ? 'bg-rose-500 text-white'
              : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-white'
          }`}
        >
          Expenses
        </button>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatCompact(val)}
            />
            <Tooltip content={<CustomTooltip />} />

            {(activeMetric === 'all' || activeMetric === 'income') && (
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'expense') && (
              <Area
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

