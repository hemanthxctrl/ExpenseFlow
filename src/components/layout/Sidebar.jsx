import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Wallet,
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useCurrency } from '../../context/CurrencyContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ReceiptText },
  { name: 'Budgets', path: '/budgets', icon: Wallet },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { metrics, profile } = useFinance();
  const { format } = useCurrency();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50
          w-64 bg-navy-900 border-r border-navy-750/80
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Top: Logo and App Name */}
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-navy-750/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                ExpenseFlow
              </h1>
              <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-widest">
                Personal Finance
              </p>
            </div>
          </div>

          {/* Quick Balance Banner */}
          <div className="mx-4 my-5 p-4 rounded-xl bg-gradient-to-b from-navy-800 to-navy-850 border border-navy-700/60 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Balance</span>
              <span className="flex items-center text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Live
              </span>
            </div>
            <p className="text-xl font-extrabold text-white tracking-tight">
              {format(metrics.totalBalance)}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/10 text-white border-l-4 border-brand-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800/60'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-navy-750/70">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-800/80 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                {profile.name || 'Arjun Sharma'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile.occupation || 'Personal Account'}
              </p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
