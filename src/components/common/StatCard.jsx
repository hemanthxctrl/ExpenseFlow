import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  sentiment = 'normal', // 'normal' (up is green, down is red) | 'inverted' (up is red, down is green)
  variant = 'brand', // 'brand' | 'income' | 'expense' | 'savings'
  glow = false
}) => {
  const getThemeStyles = () => {
    switch (variant) {
      case 'income':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          gradient: 'from-emerald-500/10 to-transparent',
          valueColor: 'text-emerald-400'
        };
      case 'expense':
        return {
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          gradient: 'from-rose-500/10 to-transparent',
          valueColor: 'text-rose-400'
        };
      case 'savings':
        return {
          iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
          gradient: 'from-indigo-500/10 to-transparent',
          valueColor: 'text-indigo-400 dark:text-indigo-300'
        };
      case 'brand':
      default:
        return {
          iconBg: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
          gradient: 'from-brand-500/10 to-transparent',
          valueColor: 'text-brand-400 dark:text-brand-300'
        };
    }
  };

  const styles = getThemeStyles();

  // Determine trend styling based on trend number and sentiment
  const renderTrend = () => {
    if (trend === undefined || trend === null) return null;

    const numTrend = Number(trend);
    if (numTrend === 0) {
      return (
        <span className="flex items-center text-slate-400 font-medium">
          <Minus className="w-3.5 h-3.5 mr-0.5" />
          0%
        </span>
      );
    }

    const isPositive = numTrend > 0;
    const isGood = sentiment === 'inverted' ? !isPositive : isPositive;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isGood
      ? 'text-emerald-500 dark:text-emerald-400'
      : 'text-rose-500 dark:text-rose-400';

    return (
      <span className={`flex items-center font-semibold ${colorClass}`}>
        <TrendIcon className="w-3.5 h-3.5 mr-0.5" />
        {isPositive ? `+${numTrend}%` : `${numTrend}%`}
      </span>
    );
  };

  return (
    <Card className="relative overflow-hidden group">
      {/* Ambient glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${styles.gradient} blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${styles.iconBg} transition-transform duration-200 group-hover:scale-110 shadow-sm shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-750/70 flex items-center justify-between text-xs gap-2">
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 font-medium shrink-0">
              {renderTrend()}
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          )}

          {subtitle && (
            <span className="text-slate-400 dark:text-slate-500 ml-auto truncate font-medium text-right">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
