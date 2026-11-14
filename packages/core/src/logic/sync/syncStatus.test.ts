import { describe, expect, it } from 'vitest';
import { INITIAL_SYNC_STATUS, type SyncStatusEvent, reduceSyncStatus } from './syncStatus';

const run = (...events: SyncStatusEvent[]) => events.reduce(reduceSyncStatus, INITIAL_SYNC_STATUS);
const remote = (overrides: Partial<Extract<SyncStatusEvent, { type: 'remote' }>> = {}) =>
  ({
    type: 'remote',
    connected: true,
    connecting: false,
    downloading: false,
    uploading: false,
    hasSynced: true,
    error: null,
    at: 100,
    ...overrides,
  }) as const;

describe('reduceSyncStatus / G1 pure reducer', () => {
  it('follows an outbox round: started, then completed with nothing failed', () => {
    const status = run(
      { type: 'outboxQueue', pendingCount: 3, isSyncing: false },
      { type: 'outboxStarted', queueLength: 3 },
      { type: 'outboxCompleted', processed: 3, failed: 0, at: 50 },
    );
    expect(status).toMatchObject({ kind: 'success', pendingCount: 0, lastSyncedAt: 50 });
  });

  it('reports a round with failures as an error', () => {
    expect(run({ type: 'outboxCompleted', processed: 1, failed: 1, at: 1 }).kind).toBe('error');
  });

  it('counts conflicts and returns to idle when the last is resolved', () => {
    const two = run({ type: 'conflictDetected' }, { type: 'conflictDetected' });
    expect(two).toMatchObject({ kind: 'conflict', conflictCount: 2 });
    const one = reduceSyncStatus(two, { type: 'conflictResolved' });
    expect(one).toMatchObject({ kind: 'conflict', conflictCount: 1 });
    expect(reduceSyncStatus(one, { type: 'conflictResolved' })).toMatchObject({
      kind: 'idle',
      conflictCount: 0,
    });
  });

  it('leaves offline when the network returns, and only then', () => {
    expect(run({ type: 'offline' }, { type: 'online' }).kind).toBe('idle');
    expect(run({ type: 'conflictDetected' }, { type: 'online' }).kind).toBe('conflict');
  });

  it.each([
    [remote({ connected: false, connecting: true }), 'connecting'],
    [remote({ downloading: true }), 'syncing'],
    [remote({ uploading: true }), 'syncing'],
    [remote(), 'available'],
    [remote({ error: 'socket closed' }), 'unavailable'],
    [remote({ connected: false }), 'unavailable'],
  ] as const)('maps the PowerSync status to a phase (%#)', (event, phase) => {
    expect(run(event).remote.phase).toBe(phase);
  });

  it('marks synced when a round with the server finishes', () => {
    const status = run(remote({ downloading: true, at: 10 }), remote({ at: 20 }));
    expect(status.lastSyncedAt).toBe(20);
    expect(run(remote({ at: 20 })).lastSyncedAt).toBeNull();
  });

  it('remembers the first sync once it has happened', () => {
    const status = run(
      { type: 'remoteFirstSync', at: 5 },
      remote({ hasSynced: false, connected: false }),
    );
    expect(status.remote).toMatchObject({ phase: 'unavailable', initialSyncComplete: true });
  });

  it('keeps the outbox and the connection independent', () => {
    const status = run({ type: 'offline' }, remote({ uploading: true }));
    expect(status).toMatchObject({ kind: 'offline', remote: { phase: 'syncing' } });
  });
});
