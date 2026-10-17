'use client';

import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useOfflineStatus } from '@repo/core/offline/resilience';
import React from 'react';
import styles from './offline-banner.module.css';

export function OfflineSyncBanner() {
  const { isOffline } = useOfflineStatus();
  const queueLength = useMutationQueue((s) => s.queue.length);
  const isSyncing = useMutationQueue((s) => s.isSyncing);

  if (!isOffline && queueLength === 0 && !isSyncing) {
    return null;
  }

  return (
    <aside
      aria-label="Offline and Synchronization Status"
      className={isOffline ? styles.offlineBanner : styles.syncingBanner}
      role="status"
    >
      <div className={styles.innerContainer}>
        {isOffline ? (
          <>
            <span aria-hidden="true" className={styles.statusDotOffline} />
            <span className={styles.messageText}>
              <strong>Working Offline</strong> — Your notes, receipts, and check-ins are safely
              saved to this device.
            </span>
            {queueLength > 0 && <span className={styles.queuePill}>{queueLength} pending</span>}
          </>
        ) : (
          <>
            <span aria-hidden="true" className={styles.statusDotSyncing} />
            <span className={styles.messageText}>
              <strong>Synchronizing</strong> — Reconnected. Processing {queueLength} queued change
              {queueLength === 1 ? '' : 's'}...
            </span>
          </>
        )}
      </div>
    </aside>
  );
}
