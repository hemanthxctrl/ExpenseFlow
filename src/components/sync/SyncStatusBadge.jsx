import React from 'react';
import { useSync } from '../../context/SyncContext';
import { useAuth } from '../../context/AuthContext';
import {
  Cloud,
  CheckCircle2,
  CloudUpload,
  CloudOff,
  RefreshCw,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const SyncStatusBadge = ({ className = '', showLabel = true }) => {
  const { syncStatus, pendingCount, syncNow, lastSyncedAt } = useSync();
  const { user, openAuthModal, isConfigured } = useAuth();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
    } else {
      syncNow({ silent: false });
    }
  };

  // Format relative last synced text
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `${diffHr}h ago`;
    } catch {
      return 'Recently';
    }
  };

  // Configure appearance based on status
  let config = {
    icon: Cloud,
    label: 'Guest',
    tooltip: 'Guest mode (Local only). Click to sign in and sync across devices.',
    containerClass: 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700/60',
    iconClass: 'text-slate-400'
  };

  if (!isConfigured) {
    config = {
      icon: Cloud,
      label: 'Local Only',
      tooltip: 'Supabase credentials not configured. Click to configure in Settings.',
      containerClass: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
      iconClass: 'text-slate-500'
    };
  } else if (!user) {
    config = {
      icon: Cloud,
      label: 'Guest',
      tooltip: 'Using local storage. Tap to sign in and enable multi-device sync.',
      containerClass: 'bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 border-brand-500/30',
      iconClass: 'text-brand-400'
    };
  } else if (syncStatus === 'syncing') {
    config = {
      icon: RefreshCw,
      label: 'Syncing...',
      tooltip: 'Synchronizing with Supabase cloud...',
      containerClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30 animate-pulse',
      iconClass: 'text-blue-400 animate-spin'
    };
  } else if (syncStatus === 'pending' || pendingCount > 0) {
    config = {
      icon: CloudUpload,
      label: `${pendingCount} unsynced`,
      tooltip: `${pendingCount} local changes pending cloud upload. Tap to sync now.`,
      containerClass: 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/30',
      iconClass: 'text-amber-400'
    };
  } else if (syncStatus === 'offline') {
    config = {
      icon: CloudOff,
      label: 'Offline',
      tooltip: 'You are offline. Changes are saved locally and will sync when reconnected.',
      containerClass: 'bg-slate-800/80 text-slate-400 border-slate-700/70',
      iconClass: 'text-slate-400'
    };
  } else if (syncStatus === 'error') {
    config = {
      icon: AlertCircle,
      label: 'Sync Error',
      tooltip: 'Last sync encountered an error. Tap to retry.',
      containerClass: 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border-rose-500/30',
      iconClass: 'text-rose-400'
    };
  } else {
    // Synced
    config = {
      icon: CheckCircle2,
      label: 'Synced',
      tooltip: `Cloud synced (${formatTimeAgo(lastSyncedAt)}). Tap to force sync.`,
      containerClass: 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30',
      iconClass: 'text-emerald-400'
    };
  }

  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={config.tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer active:scale-95 ${config.containerClass} ${className}`}
      aria-label={config.tooltip}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
      {showLabel && <span>{config.label}</span>}
    </button>
  );
};
