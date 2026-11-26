import { retainSyncStatus } from '@repo/core/lib/sync/syncStatus.coordinator';
import { useSyncStatusStore } from '@repo/core/store/useSyncStatusStore';
import { useEffect } from 'react';

export type { SyncStatus, SyncStatusKind, RemotePhase } from '@repo/core/logic/sync/syncStatus';

/**
 * The sync picture for a screen: the outbox and the PowerSync connection in one value. Every
 * caller shares one subscription (`retainSyncStatus`), and re-renders only when the status changes.
 */
export function useSyncStatus() {
  useEffect(() => retainSyncStatus(), []);
  return useSyncStatusStore((state) => state.status);
}
