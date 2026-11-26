import { eventBus } from '@repo/core/effect/bindings/state';
import { retainSyncStatus } from '@repo/core/lib/sync/syncStatus.coordinator';
import { useSyncStatusStore } from '@repo/core/store/useSyncStatusStore';
import { afterEach, describe, expect, it } from 'vitest';

const status = () => useSyncStatusStore.getState().status;

describe('retainSyncStatus / G1, real bus and stores', () => {
  afterEach(() => useSyncStatusStore.getState().reset());

  it('feeds the store from the bus while held', () => {
    const release = retainSyncStatus(() => 42);
    eventBus.emit('powersync:first_sync_complete', { accountId: 'a' });
    expect(status()).toMatchObject({
      lastSyncedAt: 42,
      remote: { phase: 'available', initialSyncComplete: true },
    });
    release();
  });

  it('counts an event once however many screens hold it', () => {
    const first = retainSyncStatus();
    const second = retainSyncStatus();
    eventBus.emit('conflict:detected', { mutationId: 'm', scope: 's', name: 'n' });
    expect(status().conflictCount).toBe(1);
    first();
    first();
    eventBus.emit('conflict:detected', { mutationId: 'm2', scope: 's', name: 'n' });
    expect(status().conflictCount).toBe(2);
    second();
  });

  it('stops listening once the last holder lets go', () => {
    retainSyncStatus()();
    eventBus.emit('network:offline', { timestamp: 0 });
    expect(status().kind).toBe('idle');
  });
});
