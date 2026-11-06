import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BudgetSummary } from '../components/budgets/BudgetSummary';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetFormModal } from '../components/budgets/BudgetFormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Plus, Wallet, Sparkles } from 'lucide-react';

export const Budgets = () => {
  const { budgetSummary, setBudget, deleteBudget, budgets } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const existingCategories = budgets.map(b => b.category);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Category Budgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time spending targets, 80% cautionary warnings and limits
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
        >
          Set New Budget
        </Button>
      </div>

      {/* High Level Utilization Card */}
      <BudgetSummary budgetSummary={budgetSummary} />

      {/* Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Breakdown ({budgetSummary.budgets.length})
          </h3>
          <span className="text-xs text-slate-400">
            Calculated against this month's transactions
          </span>
        </div>

        {budgetSummary.budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetSummary.budgets.map((b) => (
              <BudgetCard
                key={b.category}
                budget={b}
                onEdit={(item) => {
                  setEditingBudget(item);
                  setIsModalOpen(true);
                }}
                onDelete={(cat) => setDeletingCategory(cat)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No budgets configured"
            description="Create monthly spending caps for your frequent categories to keep your expenses in check."
            actionLabel="Set Your First Budget"
            onAction={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Set / Edit Budget Modal */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        initialData={editingBudget}
        existingCategories={existingCategories}
        onSubmit={(category, limit) => {
          setBudget(category, limit);
        }}
      />

      {/* Delete Budget Confirmation Dialog */}
      {deletingCategory && (
        <ConfirmDialog
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          title={`Remove ${deletingCategory} Budget?`}
          message={`Are you sure you want to remove the monthly spending limit for ${deletingCategory}? Your recorded transactions will not be deleted.`}
          confirmText="Remove Budget"
          type="danger"
          onConfirm={() => {
            deleteBudget(deletingCategory);
            setDeletingCategory(null);
          }}
        />
      )}
    </div>
  );
};

