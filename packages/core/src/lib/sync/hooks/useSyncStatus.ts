/**
 * useSyncStatus — Reactive Sync State Hook (May 2026)
 *
 * Bridges the SovereignBus (push-based) to React state (pull-based).
 * Use this in UI components that need to show sync indicators.
 *
 * Gap closed: "Missing Reactive UI bridge between Background Sync and Foreground UI"
 */
import { useEffect, useState } from 'react';
import { sovereignBus } from '@/lib/sync/eventBus';
import { useMutationQueue } from '@/lib/sync/useMutationQueue';

export type SyncStatusKind = 'idle' | 'syncing' | 'success' | 'error' | 'conflict' | 'offline';

export interface SyncStatus {
  kind: SyncStatusKind;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
  conflictCount: number;
}

const INITIAL_STATUS: SyncStatus = {
  kind: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
  conflictCount: 0,
};

export function useSyncStatus(): SyncStatus {
  const pendingCount = useMutationQueue((s) => s.queue.length);
  const isSyncing = useMutationQueue((s) => s.isSyncing);
  const [status, setStatus] = useState<SyncStatus>({
    ...INITIAL_STATUS,
    pendingCount,
  });

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      sovereignBus.on('sync:started', ({ queueLength }) => {
        setStatus((s) => ({ ...s, kind: 'syncing', pendingCount: queueLength, lastError: null }));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('sync:completed', ({ processedCount, failedCount }) => {
        setStatus((s) => ({
          ...s,
          kind: failedCount > 0 ? 'error' : 'success',
          // eslint-disable-next-line no-restricted-syntax
          lastSyncedAt: Date.now(),
          pendingCount: Math.max(0, s.pendingCount - processedCount),
        }));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('sync:failed', ({ error }) => {
        setStatus((s) => ({ ...s, kind: 'error', lastError: error }));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('conflict:detected', () => {
        setStatus((s) => ({ ...s, kind: 'conflict', conflictCount: s.conflictCount + 1 }));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('conflict:resolved', () => {
        setStatus((s) => ({
          ...s,
          conflictCount: Math.max(0, s.conflictCount - 1),
          kind: s.conflictCount <= 1 ? 'idle' : 'conflict',
        }));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('network:online', () => {
        setStatus((s) => (s.kind === 'offline' ? { ...s, kind: 'idle' } : s));
      }),
    );

    unsubscribers.push(
      sovereignBus.on('network:offline', () => {
        setStatus((s) => ({ ...s, kind: 'offline' }));
      }),
    );

    return () => {
      unsubscribers.forEach((unsub) => {
        unsub();
      });
    };
  }, []);

  // Keep pendingCount in sync with the queue store
  useEffect(() => {
    setStatus((s) => ({ ...s, pendingCount }));
  }, [pendingCount]);

  // Reflect isSyncing from the store as well
  useEffect(() => {
    if (isSyncing) {
      setStatus((s) => ({ ...s, kind: 'syncing' }));
    }
  }, [isSyncing]);

  return status;
}
