'use client';

import { useEffect, useState } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastChangedAt: number | null;
}

/**
 * useOfflineStatus
 *
 * Universal React hook tracking browser/network online status.
 * Safely defaults to online during SSR and attaches event listeners upon client hydration.
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });
  const [lastChangedAt, setLastChangedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      // eslint-disable-next-line no-restricted-syntax
      setLastChangedAt(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      // eslint-disable-next-line no-restricted-syntax
      setLastChangedAt(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check upon mount
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastChangedAt,
  };
}
