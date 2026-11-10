import React, { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
  Plus,
  ArrowRight,
  Download,
  AlertTriangle,
  ReceiptText,
  DownloadCloud,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import { usePWA } from '../context/PWAContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CashflowChart } from '../components/analytics/CashflowChart';
import { CategoryPieChart } from '../components/analytics/CategoryPieChart';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { EmptyState } from '../components/common/EmptyState';
import { calculateMonthlyTrend, calculateCategoryBreakdown, isInMonth } from '../utils/calculations';
import { exportTransactionsToCSV } from '../utils/exportCSV';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { openAddTransaction } = useOutletContext();
  const { transactions, metrics, budgetSummary, deleteTransaction } = useFinance();
  const { format } = useCurrency();
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissInstallBanner, setDismissInstallBanner] = useState(false);

  // 6-month trend data for CashflowChart
  const monthlyTrendData = useMemo(() => {
    return calculateMonthlyTrend(transactions, 6);
  }, [transactions]);

  // Current month expense category breakdown
  const categoryBreakdownData = useMemo(() => {
    const now = new Date();
    const currentMonthTxs = transactions.filter(t => {
      return isInMonth(t.date, now.getFullYear(), now.getMonth());
    });
    return calculateCategoryBreakdown(currentMonthTxs, 'expense');
  }, [transactions]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time balance, cashflow analytics, and monthly budget overview
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => exportTransactionsToCSV(transactions, 'expenseflow_transactions.csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openAddTransaction}
          >
            New Transaction
          </Button>
        </div>
      </div>

      {/* PWA Install Banner */}
      {isInstallable && !isInstalled && !dismissInstallBanner && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900/60 via-brand-800/40 to-navy-800 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-100 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 border border-brand-500/30">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Install ExpenseFlow on your device
              </p>
              <p className="text-xs text-slate-300">
                Add to your home screen for instant daily tracking, numeric keypad & offline support.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              icon={DownloadCloud}
              onClick={installApp}
              className="font-bold w-full sm:w-auto"
            >
              Install App
            </Button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={format(metrics.totalBalance)}
          icon={Wallet}
          variant="brand"
          subtitle="Net balance of all accounts"
        />

        <StatCard
          title="Monthly Income"
          value={format(metrics.currentMonthIncome)}
          icon={ArrowUpRight}
          variant="income"
          trend={metrics.incomeGrowth}
          sentiment="normal"
        />

        <StatCard
          title="Monthly Expenses"
          value={format(metrics.currentMonthExpense)}
          icon={ArrowDownLeft}
          variant="expense"
          trend={metrics.expenseGrowth}
          sentiment="inverted"
        />

        <StatCard
          title="Monthly Savings"
          value={format(metrics.currentMonthSavings)}
          icon={PiggyBank}
          variant="savings"
          trend={metrics.savingsGrowth}
          sentiment="normal"
          subtitle={
            metrics.currentMonthIncome > 0
              ? `${metrics.savingsRate}% savings rate`
              : metrics.currentMonthSavings < 0
              ? 'Deficit this month'
              : 'Zero cashflow'
          }
        />
      </div>

      {/* Budget Alert Banner (if any budget is exceeded) */}
      {budgetSummary.hasExceeded && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-rose-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-400">
                Monthly Budget Alert!
              </p>
              <p className="text-xs text-rose-300/80">
                One or more of your category budgets have exceeded their monthly spending limit.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/budgets')}
            className="shrink-0 w-full sm:w-auto"
          >
            View Budgets
          </Button>
        </div>
      )}

      {/* Charts Grid: Income vs Expense Area + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trend Chart (2 columns on lg) */}
        <Card className="lg:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cashflow Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Income vs Expenses over the last 6 months
              </p>
            </div>
          </div>

          <CashflowChart data={monthlyTrendData} />
        </Card>

        {/* Category Breakdown (1 column on lg) */}
        <Card className="flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Spending
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This month's expenses by category
                </p>
              </div>
            </div>

            <CategoryPieChart data={categoryBreakdownData} />
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-navy-750">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/analytics')}
            >
              Detailed Analytics & Reports
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Transactions + Budget Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
            >
              <span>View all transactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onEdit={() => navigate('/transactions')}
                  onDelete={() => deleteTransaction(tx.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent transactions"
              description="Start recording your expenses and income to see them here."
              actionLabel="Add Transaction"
              onAction={openAddTransaction}
            />
          )}
        </div>

        {/* Budget Health Snapshot (1 column on lg) */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Budget Health
            </h3>
            <button
              onClick={() => navigate('/budgets')}
              className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Card className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span>Monthly Limit Consumed</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {budgetSummary.overallPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-navy-950 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetSummary.overallPercentage >= 100
                      ? 'bg-rose-500'
                      : budgetSummary.overallPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-brand-500 to-emerald-400'
                  }`}
                  style={{ width: `${Math.min(budgetSummary.overallPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {budgetSummary.budgets.slice(0, 4).map((b) => (
                <div key={b.category} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                      {format(b.spent)} / {format(b.limit)}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      b.status === 'exceeded'
                        ? 'bg-rose-500/20 text-rose-400'
                        : b.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {b.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => navigate('/budgets')}
              className="mt-2"
            >
              View All Category Budgets
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
