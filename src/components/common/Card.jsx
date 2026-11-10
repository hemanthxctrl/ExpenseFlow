import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-navy-850
        border border-slate-200 dark:border-navy-750/80
        rounded-2xl p-4 sm:p-6
        shadow-sm dark:shadow-card-dark
        transition-all duration-200
        ${hover ? 'hover:border-slate-300 dark:hover:border-brand-500/40 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-glow-violet cursor-pointer' : ''}
        ${glow ? 'ring-1 ring-brand-500/30 shadow-glow-violet' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

