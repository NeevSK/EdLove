'use client';

import { GURUDEVI_SANCTUARY_URL } from '@repo/core/config/publicUrls';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useEffect, useState } from 'react';
import styles from './sync-status-pill.module.css';

type PageReachability = 'checking' | 'reachable' | 'unreachable';

export function SyncStatusPill() {
  const network = useOfflineStatus();
  const [reachability, setReachability] = useState<PageReachability>('checking');

  useEffect(() => {
    if (network.status !== 'online') return;
    setReachability('checking');
    let activeProbe = false;
    let retryRequested = false;
    let disposed = false;
    let probeController: AbortController | null = null;

    const checkConnection = async () => {
      if (document.visibilityState === 'hidden') return;
      if (activeProbe) {
        retryRequested = true;
        return;
      }
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
        // An opaque response establishes page reachability, never API or sync health.
        if (!disposed) setReachability('reachable');
      } catch {
        if (!disposed) setReachability('unreachable');
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

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void checkConnection();
    };

    void checkConnection();
    const interval = window.setInterval(() => void checkConnection(), 30000);
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      probeController?.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [network.status, network.connection]);

  const connection = network.connection;
  const slow =
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    (connection?.rttMs ?? 0) >= 1000;
  const status = network.isOffline
    ? 'offline'
    : network.status === 'unknown' || reachability === 'checking'
      ? 'checking'
      : reachability === 'unreachable'
        ? 'unreachable'
        : slow
          ? 'unstable'
          : 'online';

  const label =
    status === 'checking'
      ? 'Checking'
      : status === 'offline'
        ? 'Offline'
        : status === 'unreachable'
          ? 'Site unavailable'
          : status === 'unstable'
            ? 'Unstable'
            : 'Online';

  return (
    <div
      aria-live="polite"
      aria-label={`Connection status: ${label === 'Checking' ? 'checking reachability' : label}`}
      className={styles.pill}
      data-status={status}
      title={
        status === 'unreachable'
          ? 'The site could not be reached. Your device is still connected.'
          : `Connection status: ${label}`
      }
    >
      <span aria-hidden="true" className={styles.statusDot} />
      <span>{label}</span>
    </div>
  );
}
