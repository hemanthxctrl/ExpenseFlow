import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_PROFILE } from '../data/sampleData';
import { calculateDashboardMetrics, calculateBudgetsStatus } from '../utils/calculations';
import { useToast } from './ToastContext';

const FinanceContext = createContext();

const STORAGE_KEYS = {
  TRANSACTIONS: 'expenseflow_transactions',
  BUDGETS: 'expenseflow_budgets',
  PROFILE: 'expenseflow_profile'
};

export const FinanceProvider = ({ children }) => {
  const { showToast } = useToast();

  // Transactions state - seed ONLY when no key exists in localStorage
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      // Seed sample data on first launch
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    } catch (e) {
      console.error('Error loading transactions from localStorage:', e);
      return INITIAL_TRANSACTIONS;
    }
  });

  // Budgets state - seed ONLY when no key exists
  const [budgets, setBudgets] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    } catch (e) {
      console.error('Error loading budgets from localStorage:', e);
      return INITIAL_BUDGETS;
    }
  });

  // User Profile state
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored !== null) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    } catch (e) {
      console.error('Error loading profile from localStorage:', e);
      return INITIAL_PROFILE;
    }
  });

  // Sync to localStorage whenever transactions change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  // Sync to localStorage whenever budgets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets to localStorage', e);
    }
  }, [budgets]);

  // Sync to localStorage whenever profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }, [profile]);

  // Automatically recalculate dashboard metrics when transactions change
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(transactions);
  }, [transactions]);

  // Automatically recalculate budgets status when transactions or budgets change
  const budgetSummary = useMemo(() => {
    return calculateBudgetsStatus(budgets, transactions);
  }, [budgets, transactions]);

  // --- CRUD OPERATIONS ---

  // Add Transaction
  const addTransaction = (newTxData) => {
    const id = 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newTx = {
      id,
      title: newTxData.title.trim(),
      amount: Math.abs(Number(newTxData.amount)),
      type: newTxData.type || 'expense',
      category: newTxData.category || 'Other',
      date: newTxData.date || new Date().toISOString().split('T')[0],
      paymentMethod: newTxData.paymentMethod || 'UPI',
      description: newTxData.description ? newTxData.description.trim() : ''
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Added ${newTx.type === 'income' ? 'income' : 'expense'}: "${newTx.title}"`, 'success');
    return newTx;
  };

  // Edit Transaction
  const updateTransaction = (id, updatedData) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          title: updatedData.title ? updatedData.title.trim() : t.title,
          amount: updatedData.amount !== undefined ? Math.abs(Number(updatedData.amount)) : t.amount,
          type: updatedData.type || t.type,
          category: updatedData.category || t.category,
          date: updatedData.date || t.date,
          paymentMethod: updatedData.paymentMethod || t.paymentMethod,
          description: updatedData.description !== undefined ? updatedData.description.trim() : t.description
        };
      }
      return t;
    }));
    showToast('Transaction updated successfully', 'success');
  };

  // Delete Transaction
  const deleteTransaction = (id) => {
    const target = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast(`Deleted "${target?.title || 'transaction'}"`, 'info');
  };

  // Set or update a category budget
  const setBudget = (category, limit) => {
    const numLimit = Math.abs(Number(limit));
    setBudgets(prev => {
      const index = prev.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], limit: numLimit };
        return updated;
      }
      return [...prev, { category, limit: numLimit }];
    });
    showToast(`Budget for ${category} set to limit`, 'success');
  };

  // Delete a category budget
  const deleteBudget = (category) => {
    setBudgets(prev => prev.filter(b => b.category.toLowerCase() !== category.toLowerCase()));
    showToast(`Budget for ${category} removed`, 'info');
  };

  // Update Profile
  const updateProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
    showToast('Profile updated successfully', 'success');
  };

  // Reset to Sample Data
  const resetSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setProfile(INITIAL_PROFILE);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    showToast('Restored 20 sample transactions & budgets', 'info');
  };

  // Clear All Data
  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    showToast('All transaction and budget records cleared', 'warning');
  };

  // Import JSON Backup
  const importData = (data) => {
    try {
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
      if (Array.isArray(data.budgets)) {
        setBudgets(data.budgets);
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      showToast('Data imported successfully!', 'success');
      return true;
    } catch {
      showToast('Invalid backup file format', 'error');
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        profile,
        metrics,
        budgetSummary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudget,
        deleteBudget,
        updateProfile,
        resetSampleData,
        clearAllData,
        importData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

