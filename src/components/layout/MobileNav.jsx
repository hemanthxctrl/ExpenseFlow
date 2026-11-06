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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-navy-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-navy-750 px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]
                ${
                  isActive
                    ? 'text-brand-500 dark:text-brand-400 font-semibold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
