/**
 * Safely parse a date string (YYYY-MM-DD or ISO) into local year, month, day components
 * completely immune to UTC timezone offset shifts.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
};

/**
 * Check if a date string falls in a specific year and 0-indexed month
 */
export const isInMonth = (dateStr, year, month) => {
  if (!dateStr) return false;
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === year && m === month;
  }
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month;
};

/**
 * Robust financial percentage change calculation
 * Supports positive and negative baselines (e.g. savings deficit -> surplus)
 */
export const calcPercentageChange = (curr, prev) => {
  const current = Number(curr) || 0;
  const previous = Number(prev) || 0;

  if (previous === 0) {
    if (current > 0) return 100;
    if (current < 0) return -100;
    return 0;
  }
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
};

/**
 * Filter transactions by timeframe
 */
export const filterByTimeframe = (transactions, timeframe = 'this-month') => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (timeframe) {
    case 'this-month':
      return transactions.filter(t => isInMonth(t.date, currentYear, currentMonth));

    case 'last-month': {
      const prevMonthTarget = new Date(currentYear, currentMonth - 1, 1);
      return transactions.filter(t => isInMonth(t.date, prevMonthTarget.getFullYear(), prevMonthTarget.getMonth()));
    }

    case 'last-3-months': {
      const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
      return transactions.filter(t => {
        const d = parseLocalDate(t.date);
        return d && d >= threeMonthsAgo;
      });
    }

    case 'last-6-months': {
      const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
      return transactions.filter(t => {
        const d = parseLocalDate(t.date);
        return d && d >= sixMonthsAgo;
      });
    }

    case 'this-year':
      return transactions.filter(t => {
        const d = parseLocalDate(t.date);
        return d && d.getFullYear() === currentYear;
      });

    case 'all':
    default:
      return transactions;
  }
};

/**
 * Calculate dashboard high-level metrics
 */
export const calculateDashboardMetrics = (transactions) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // All time totals
  let totalIncome = 0;
  let totalExpenses = 0;

  // Current month totals
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;

  // Previous month totals
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  transactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    const isInc = t.type === 'income';

    // All time
    if (isInc) totalIncome += amt;
    else totalExpenses += amt;

    // Current month
    if (isInMonth(t.date, currentYear, currentMonth)) {
      if (isInc) currentMonthIncome += amt;
      else currentMonthExpense += amt;
    }

    // Previous month
    if (isInMonth(t.date, prevYear, prevMonth)) {
      if (isInc) prevMonthIncome += amt;
      else prevMonthExpense += amt;
    }
  });

  const totalBalance = totalIncome - totalExpenses;
  const currentMonthSavings = currentMonthIncome - currentMonthExpense;
  const prevMonthSavings = prevMonthIncome - prevMonthExpense;

  // Savings rate as a percentage of income
  let savingsRate = 0;
  if (currentMonthIncome > 0) {
    savingsRate = Math.round((currentMonthSavings / currentMonthIncome) * 100);
  }

  const incomeGrowth = calcPercentageChange(currentMonthIncome, prevMonthIncome);
  const expenseGrowth = calcPercentageChange(currentMonthExpense, prevMonthExpense);
  const savingsGrowth = calcPercentageChange(currentMonthSavings, prevMonthSavings);

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthSavings,
    savingsRate,
    incomeGrowth,
    expenseGrowth,
    savingsGrowth
  };
};

/**
 * Calculate category spending breakdown for given transactions
 */
export const calculateCategoryBreakdown = (transactions, type = 'expense') => {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const categoryMap = {};

  filtered.forEach(t => {
    const cat = (t.category || 'Other').trim();
    const amt = Number(t.amount) || 0;
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        amount: 0,
        count: 0
      };
    }
    categoryMap[cat].amount += amt;
    categoryMap[cat].count += 1;
  });

  const result = Object.values(categoryMap).map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.amount / total) * 100 * 10) / 10 : 0
  }));

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
};

/**
 * Generate monthly trend data for the last 6 months
 */
export const calculateMonthlyTrend = (transactions, monthsCount = 6) => {
  const result = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const monthName = targetDate.toLocaleString('en-US', { month: 'short' });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (isInMonth(t.date, year, month)) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') income += amt;
        else expense += amt;
      }
    });

    result.push({
      month: monthName,
      fullMonth: `${monthName} ${year}`,
      income,
      expense,
      savings: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0
    });
  }

  return result;
};

/**
 * Calculate budget status per category for the current month
 */
export const calculateBudgetsStatus = (budgets, transactions) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Calculate current month expenses per category (case-insensitive & trimmed)
  const expensesPerCategory = {};
  transactions.forEach(t => {
    if (t.type === 'expense' && isInMonth(t.date, currentYear, currentMonth)) {
      const catKey = (t.category || 'Other').trim().toLowerCase();
      expensesPerCategory[catKey] = (expensesPerCategory[catKey] || 0) + (Number(t.amount) || 0);
    }
  });

  let totalAllocated = 0;
  let totalSpent = 0;

  const budgetStatuses = budgets.map(b => {
    const catKey = (b.category || 'Other').trim().toLowerCase();
    const spent = expensesPerCategory[catKey] || 0;
    const limit = Number(b.limit) || 0;
    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : (spent > 0 ? 100 : 0);

    totalAllocated += limit;
    totalSpent += spent;

    let status = 'normal';
    if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      category: b.category,
      limit,
      spent,
      remaining,
      percentage,
      status
    };
  });

  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return {
    budgets: budgetStatuses,
    totalAllocated,
    totalSpent,
    totalRemaining,
    overallPercentage,
    hasExceeded: budgetStatuses.some(b => b.status === 'exceeded'),
    hasWarning: budgetStatuses.some(b => b.status === 'warning')
  };
};

/**
 * Calculate payment methods breakdown
 */
export const calculatePaymentMethodBreakdown = (transactions) => {
  const map = {};
  let totalExpense = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    const method = (t.paymentMethod || 'UPI').trim();
    const amt = Number(t.amount) || 0;
    map[method] = (map[method] || 0) + amt;
    totalExpense += amt;
  });

  return Object.keys(map).map(method => ({
    method,
    amount: map[method],
    percentage: totalExpense > 0 ? Math.round((map[method] / totalExpense) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);
};
