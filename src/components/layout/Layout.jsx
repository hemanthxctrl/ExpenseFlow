import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { useFinance } from '../../context/FinanceContext';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addTransaction } = useFinance();

  // If launched with ?action=add (from PWA app shortcuts)
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddModalOpen(true);
      // Clean up search params without reloading
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Offline Status Bar Indicator */}
      <OfflineIndicator />

      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddTransaction: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) for Quick Expense Entry */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="lg:hidden fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-30 w-13 h-13 p-3.5 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-xl shadow-brand-500/40 hover:shadow-brand-500/60 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-navy-900"
        aria-label="Quick Add Transaction"
        title="Quick Add Transaction"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Quick Add Transaction Modal */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
};
