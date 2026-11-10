import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, HardDrive } from 'lucide-react';
import { usePWA } from '../../context/PWAContext';

export const OfflineIndicator = () => {
  const { isOnline } = usePWA();
  const [showRestored, setShowRestored] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
      setShowRestored(false);
    } else if (hasBeenOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setHasBeenOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full py-1.5 px-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
        isOnline
          ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
          : 'bg-amber-500/15 text-amber-300 border-b border-amber-500/30'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Connected • Local storage active</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>Offline Mode • Storing all transactions safely on this device</span>
          <span className="hidden sm:inline text-amber-400/70 text-[11px]">(No internet required)</span>
        </>
      )}
    </div>
  );
};

