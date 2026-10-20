'use client';

import { useEffect, useState } from 'react';
import { GURUDEVI_SANCTUARY_URL } from '@repo/core/config/publicUrls';
import styles from './sync-status-pill.module.css';

type ConnectionEstimate = EventTarget & Readonly<{
  effectiveType?: string;
  rtt?: number;
}>;

type NavigatorWithConnection = Navigator & Readonly<{
  connection?: ConnectionEstimate;
}>;

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'unstable';

export function SyncStatusPill() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    let activeProbe = false;
    let retryRequested = false;
    let disposed = false;
    let probeController: AbortController | null = null;

    const updateFromEstimate = () => {
      if (!navigator.onLine) {
        setStatus('offline');
        return false;
      }

      const effectiveType = connection?.effectiveType;
      const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || (connection?.rtt ?? 0) >= 1000;
      if (isSlow) setStatus('unstable');
      return true;
    };

    const checkConnection = async () => {
      if (document.visibilityState === 'hidden') return;
      if (activeProbe) {
        retryRequested = true;
        return;
      }
      if (!updateFromEstimate()) return;

      activeProbe = true;
      probeController = new AbortController();
      const timeout = window.setTimeout(() => probeController?.abort(), 5000);

      try {
        await fetch(GURUDEVI_SANCTUARY_URL, {
          method: 'HEAD',
          mode: 'no-cors',
          credentials: 'omit',
          cache: 'no-store',
          signal: probeController.signal,
        });
        if (!disposed && navigator.onLine) {
          const effectiveType = connection?.effectiveType;
          const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || (connection?.rtt ?? 0) >= 1000;
          setStatus(isSlow ? 'unstable' : 'online');
        }
      } catch {
        if (!disposed) setStatus('offline');
      } finally {
        window.clearTimeout(timeout);
        activeProbe = false;
        probeController = null;
        if (retryRequested && !disposed) {
          retryRequested = false;
          void checkConnection();
        }
      }
    };

    const handleOffline = () => {
      probeController?.abort();
      setStatus('offline');
    };
    const handleOnline = () => {
      setStatus('checking');
      void checkConnection();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void checkConnection();
    };

    void checkConnection();
    const interval = window.setInterval(() => void checkConnection(), 30000);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    connection?.addEventListener('change', handleVisibility);

    return () => {
      disposed = true;
      probeController?.abort();
      window.clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      connection?.removeEventListener('change', handleVisibility);
    };
  }, []);

  const label =
    status === 'checking'
      ? 'Checking'
      : status === 'offline'
        ? 'Offline'
        : status === 'unstable'
          ? 'Unstable'
          : 'Online';

  return (
    <div
      aria-live="polite"
      aria-label={`Connection status: ${label === 'Checking' ? 'checking reachability' : label}`}
      className={styles.pill}
      data-status={status}
      title={`Connection status: ${label}`}
    >
      <span aria-hidden="true" className={styles.statusDot} />
      <span>{label}</span>
    </div>
  );
}
