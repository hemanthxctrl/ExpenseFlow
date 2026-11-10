import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { MonthlyBarChart } from '../components/analytics/MonthlyBarChart';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { CashflowChart } from '../components/analytics/CashflowChart';
import { ExpenseBreakdownTable } from '../components/analytics/ExpenseBreakdownTable';
import {
  calculateCategoryBreakdown,
  calculateMonthlyTrend,
  calculatePaymentMethodBreakdown,
  filterByTimeframe
} from '../utils/calculations';
import {
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Percent,
  CreditCard
} from 'lucide-react';

export const Analytics = () => {
  const { transactions } = useFinance();
  const { format } = useCurrency();

  const [timeframe, setTimeframe] = useState('this-month'); // 'this-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'all'

  // Filtered transactions for the selected timeframe
  const filteredTxs = useMemo(() => {
    return filterByTimeframe(transactions, timeframe);
  }, [transactions, timeframe]);

  // High-level KPI metrics for timeframe
  const kpiMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTxs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else expense += amt;
    });

    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    return { income, expense, savings, savingsRate };
  }, [filteredTxs]);

  // Category breakdown for timeframe
  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(filteredTxs, 'expense');
  }, [filteredTxs]);

  // Monthly comparison data for last 6 months
  const monthlyTrend = useMemo(() => {
    return calculateMonthlyTrend(transactions, 6);
  }, [transactions]);

  // Payment methods breakdown
  const paymentMethods = useMemo(() => {
    return calculatePaymentMethodBreakdown(filteredTxs);
  }, [filteredTxs]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Timeframe Filter Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Deep dive into your cashflow trends, spending habits and savings performance
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-navy-850 rounded-xl border border-slate-200 dark:border-navy-750 overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'this-month', label: 'This Month' },
            { id: 'last-3-months', label: 'Last 3M' },
            { id: 'last-6-months', label: 'Last 6M' },
            { id: 'this-year', label: 'This Year' },
            { id: 'all', label: 'All Time' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                timeframe === tab.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards for Chosen Timeframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Income"
          value={format(kpiMetrics.income)}
          icon={ArrowUpRight}
          variant="income"
          subtitle={`${filteredTxs.filter(t => t.type === 'income').length} deposits`}
        />

        <StatCard
          title="Period Expenses"
          value={format(kpiMetrics.expense)}
          icon={ArrowDownLeft}
          variant="expense"
          subtitle={`${filteredTxs.filter(t => t.type === 'expense').length} transactions`}
        />

        <StatCard
          title="Net Savings"
          value={format(kpiMetrics.savings)}
          icon={PiggyBank}
          variant={kpiMetrics.savings >= 0 ? 'savings' : 'expense'}
          subtitle={kpiMetrics.savings >= 0 ? 'Surplus retained' : 'Deficit spent'}
        />

        <StatCard
          title="Savings Rate"
          value={`${kpiMetrics.savingsRate}%`}
          icon={Percent}
          variant="brand"
          subtitle={kpiMetrics.savingsRate >= 0 ? 'Of income saved' : 'Spending exceeded income'}
        />
      </div>

      {/* Charts Grid 1: Monthly Comparison Bar Chart + Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison Bar Chart */}
        <Card className="min-w-0">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Income vs Expenses (Monthly)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side performance over the last 6 months
            </p>
          </div>
          <MonthlyBarChart data={monthlyTrend} />
        </Card>

        {/* Category Share Donut Chart */}
        <Card className="min-w-0">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Where your money went in the selected period
            </p>
          </div>
          <CategoryPieChart data={categoryBreakdown} />
        </Card>
      </div>

      {/* Charts Grid 2: Net Cashflow Area Chart + Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Cashflow Area Chart */}
        <Card className="lg:col-span-2 min-w-0">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cashflow Trajectory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline view of inflows and outflows
            </p>
          </div>
          <CashflowChart data={monthlyTrend} />
        </Card>

        {/* Payment Methods Breakdown */}
        <Card className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Channels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spending by payment mechanism
              </p>
            </div>
            <CreditCard className="w-5 h-5 text-brand-400 shrink-0" />
          </div>

          <div className="space-y-3">
            {paymentMethods.length > 0 ? (
              paymentMethods.map((pm) => (
                <div key={pm.method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {pm.method}
                    </span>
                    <span className="text-slate-400">
                      {format(pm.amount)} ({pm.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(pm.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No expense payments recorded for this period.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Category Table */}
      <Card className="min-w-0">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Spending Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive breakdown of expenses, transaction volumes and percentages
          </p>
        </div>
        <ExpenseBreakdownTable categoryData={categoryBreakdown} />
      </Card>
    </div>
  );
};
