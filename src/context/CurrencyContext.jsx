import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY } from '../data/currencies';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('expenseflow_currency') || DEFAULT_CURRENCY;
  });

  useEffect(() => {
    localStorage.setItem('expenseflow_currency', currencyCode);
  }, [currencyCode]);

  const activeCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const format = (amount) => formatCurrency(amount, currencyCode);
  const formatCompact = (amount) => formatCompactCurrency(amount, currencyCode);

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        setCurrencyCode,
        activeCurrency,
        currencies: CURRENCIES,
        format,
        formatCompact,
        symbol: activeCurrency.symbol
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

