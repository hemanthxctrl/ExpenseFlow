import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    income: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    expense: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    violet: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    neutral: 'bg-slate-500/15 text-slate-400 border border-slate-500/30 dark:text-slate-300'
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 font-semibold tracking-wide uppercase',
    sm: 'text-xs px-2.5 py-1 font-medium',
    md: 'text-sm px-3 py-1.5 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${variants[variant] || variants.neutral} ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};

