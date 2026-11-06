import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none focus:outline-none focus:ring-2 focus:ring-brand-500/50';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-500/25 border border-brand-400/20',
    secondary: 'bg-navy-800 hover:bg-navy-750 text-slate-200 dark:bg-navy-800 dark:hover:bg-navy-750 border border-slate-700/60 dark:border-navy-700 hover:border-slate-600',
    outline: 'bg-transparent border border-slate-600 dark:border-navy-600 text-slate-300 dark:text-slate-300 hover:bg-slate-800/40 dark:hover:bg-navy-800/80 hover:text-white',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20 border border-rose-400/20',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/20',
    ghost: 'bg-transparent hover:bg-slate-800/50 dark:hover:bg-navy-800/60 text-slate-300 hover:text-white'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className={iconSizes[size] || iconSizes.md} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className={iconSizes[size] || iconSizes.md} />}
    </button>
  );
};

