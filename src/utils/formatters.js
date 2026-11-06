import { CURRENCIES } from '../data/currencies';
import { parseLocalDate } from './calculations';

/**
 * Format a number as currency using the active currency code and locale
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = Number(amount) || 0;
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(numericAmount);
  } catch {
    return `${currency.symbol}${numericAmount.toLocaleString()}`;
  }
};

/**
 * Format compact currency for charts and tight badges, e.g. ₹85K
 */
export const formatCompactCurrency = (amount, currencyCode = 'INR') => {
  const numericAmount = Number(amount) || 0;
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  if (Math.abs(numericAmount) >= 10000000) {
    return `${currency.symbol}${(numericAmount / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(numericAmount) >= 100000) {
    return `${currency.symbol}${(numericAmount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(numericAmount) >= 1000) {
    return `${currency.symbol}${(numericAmount / 1000).toFixed(1)}K`;
  }
  return `${currency.symbol}${numericAmount}`;
};

/**
 * Format a YYYY-MM-DD date string to a human readable format
 */
export const formatDate = (dateString, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!dateString) return '';
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', options).format(date);
};

/**
 * Format date with relative helper (Today, Yesterday, or 12 Oct 2024)
 */
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = parseLocalDate(dateString);
  if (!targetDate || isNaN(targetDate.getTime())) return dateString;
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return formatDate(dateString);
};

/**
 * Format percentage
 */
export const formatPercent = (val, decimals = 1) => {
  const num = Number(val) || 0;
  return `${num.toFixed(decimals)}%`;
};
