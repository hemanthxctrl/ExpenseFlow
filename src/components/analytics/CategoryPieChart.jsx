import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { getCategoryMeta } from '../../data/categories';
import { useCurrency } from '../../context/CurrencyContext';

export const CategoryPieChart = ({ data }) => {
  const { format } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No category data available for this timeframe
      </div>
    );
  }

  // Enhance data with colors from categories
  const chartData = data.map(item => {
    const meta = getCategoryMeta(item.category);
    return {
      ...item,
      color: meta.color
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-navy-900/95 border border-navy-750 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
          <p className="font-bold text-white flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.category}
          </p>
          <p className="text-slate-300">
            Amount: <span className="font-bold text-white">{format(item.amount)}</span>
          </p>
          <p className="text-slate-400 mt-0.5">
            Share: <span className="font-semibold text-brand-400">{item.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* Pie Chart */}
      <div className="w-full md:w-1/2 h-56 sm:h-64 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend List */}
      <div className="w-full md:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
        {chartData.slice(0, 6).map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-navy-800/50 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                {item.category}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-slate-900 dark:text-white">
                {format(item.amount)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 w-9 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

