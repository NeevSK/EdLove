/**
 * One picture of sync for the person: the outbox (commands waiting to be sent) and the PowerSync
 * connection (records syncing with the server), in a single value a screen can show. A pure
 * reducer; the coordinator feeds it events, the store holds it.
 */

export type SyncStatusKind = 'idle' | 'syncing' | 'success' | 'error' | 'conflict' | 'offline';

/** The PowerSync connection, as the person would understand it. `off` means not connected by design. */
export type RemotePhase = 'off' | 'connecting' | 'syncing' | 'available' | 'unavailable';

export interface SyncStatus {
  readonly kind: SyncStatusKind;
  readonly pendingCount: number;
  readonly lastSyncedAt: number | null;
  readonly lastError: string | null;
  readonly conflictCount: number;
  readonly remote: {
    readonly phase: RemotePhase;
    readonly initialSyncComplete: boolean;
    /** For developers; the person's message comes from the failure feedback copy. */
    readonly error: string | null;
  };
}

export type SyncStatusEvent =
  | { readonly type: 'outboxStarted'; readonly queueLength: number }
  | {
      readonly type: 'outboxCompleted';
      readonly processed: number;
      readonly failed: number;
      readonly at: number;
    }
  | { readonly type: 'outboxFailed'; readonly error: string }
  | { readonly type: 'outboxQueue'; readonly pendingCount: number; readonly isSyncing: boolean }
  | { readonly type: 'conflictDetected' }
  | { readonly type: 'conflictResolved' }
  | { readonly type: 'online' }
  | { readonly type: 'offline' }
  | {
      readonly type: 'remote';
      readonly connected: boolean;
      readonly connecting: boolean;
      readonly downloading: boolean;
      readonly uploading: boolean;
      readonly hasSynced: boolean;
      readonly error: string | null;
      readonly at: number;
    }
  | { readonly type: 'remoteFirstSync'; readonly at: number }
  | { readonly type: 'remoteUnavailable' };

export const INITIAL_SYNC_STATUS: SyncStatus = {
  kind: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
  conflictCount: 0,
  remote: { phase: 'off', initialSyncComplete: false, error: null },
};

function remotePhase(event: Extract<SyncStatusEvent, { type: 'remote' }>): RemotePhase {
  if (event.error) return 'unavailable';
  if (event.uploading || event.downloading) return 'syncing';
  if (event.connected) return 'available';
  return event.connecting ? 'connecting' : 'unavailable';
}

export function reduceSyncStatus(status: SyncStatus, event: SyncStatusEvent): SyncStatus {
  switch (event.type) {
    case 'outboxStarted':
      return { ...status, kind: 'syncing', pendingCount: event.queueLength, lastError: null };
    case 'outboxCompleted':
      return {
        ...status,
        kind: event.failed > 0 ? 'error' : 'success',
        lastSyncedAt: event.at,
        pendingCount: Math.max(0, status.pendingCount - event.processed),
      };
    case 'outboxFailed':
      return { ...status, kind: 'error', lastError: event.error };
    case 'outboxQueue':
      return {
        ...status,
        pendingCount: event.pendingCount,
        kind: event.isSyncing ? 'syncing' : status.kind,
      };
    case 'conflictDetected':
      return { ...status, kind: 'conflict', conflictCount: status.conflictCount + 1 };
    case 'conflictResolved':
      return {
        ...status,
        conflictCount: Math.max(0, status.conflictCount - 1),
        kind: status.conflictCount <= 1 ? 'idle' : 'conflict',
      };
    case 'online':
      return status.kind === 'offline' ? { ...status, kind: 'idle' } : status;
    case 'offline':
      return { ...status, kind: 'offline' };
    case 'remote': {
      const phase = remotePhase(event);
      // A finished round with the server counts as "synced" for the person.
      const settled = status.remote.phase === 'syncing' && phase === 'available';
      return {
        ...status,
        lastSyncedAt: settled ? event.at : status.lastSyncedAt,
        remote: {
          phase,
          initialSyncComplete: status.remote.initialSyncComplete || event.hasSynced,
          error: event.error,
        },
      };
    }
    case 'remoteFirstSync':
      return {
        ...status,
        lastSyncedAt: event.at,
        remote: { phase: 'available', initialSyncComplete: true, error: null },
      };
    case 'remoteUnavailable':
      return { ...status, remote: { ...status.remote, phase: 'unavailable' } };
  }
}
