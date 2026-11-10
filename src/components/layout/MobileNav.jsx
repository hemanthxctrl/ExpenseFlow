import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Wallet,
  Settings
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptText },
  { name: 'Budgets', path: '/budgets', icon: Wallet },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const MobileNav = () => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-navy-750/90 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] safe-area-bottom"
    >
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-2.5 rounded-2xl min-w-[52px] sm:min-w-[58px] min-h-[48px] transition-all duration-200 select-none
                ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold bg-brand-50/80 dark:bg-brand-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] leading-tight tracking-tight">{item.name}</span>
                  {isActive && (
                    <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-brand-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
