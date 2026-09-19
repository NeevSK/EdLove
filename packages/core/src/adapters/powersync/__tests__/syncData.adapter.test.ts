import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PowerSyncDataAdapter } from '../syncData.adapter';

const initialQueueState = {
  queue: [],
  deadLetterQueue: [],
  isSyncing: false,
};

afterEach(() => {
  useMutationQueue.setState(initialQueueState);
  sovereignBus.reset();
});

describe('PowerSyncDataAdapter G0 neutral-port mapping', () => {
  it('delegates parameterized reads without exposing the local database', async () => {
    const getAll = vi.fn();
    const executor = {
      async getAll<T>(statement: string, parameters?: unknown[]): Promise<T[]> {
        getAll(statement, parameters);
        return [];
      },
    };
    const port = new PowerSyncDataAdapter('account-a', executor);

    await expect(
      port.query<{ id: string }>({
        statement: 'SELECT id FROM records WHERE id = ?',
        parameters: ['r-1'],
      }),
    ).resolves.toEqual([]);
    expect(getAll).toHaveBeenCalledWith('SELECT id FROM records WHERE id = ?', ['r-1']);
    port.dispose();
  });

  it('maps a neutral mutation intent into the existing outbox contract', async () => {
    const port = new PowerSyncDataAdapter('account-a', { getAll: vi.fn() });
    const onOutboxHealth = vi.fn();
    port.subscribeOutboxHealth(onOutboxHealth);
    await port.enqueueMutation({
      type: 'CREATE',
      scope: 'self',
      name: 'saveReflection',
      variables: { recordId: 'r-1', text: 'remember this' },
      userId: 'account-a',
    });

    expect(useMutationQueue.getState().queue).toMatchObject([
      {
        type: 'CREATE',
        scope: 'self',
        name: 'saveReflection',
        variables: { recordId: 'r-1', text: 'remember this' },
        userId: 'account-a',
      },
    ]);
    expect(port.getOutboxHealth()).toEqual({
      pendingCount: 1,
      failedCount: 0,
      isProcessing: false,
    });
    expect(onOutboxHealth).toHaveBeenLastCalledWith({
      pendingCount: 1,
      failedCount: 0,
      isProcessing: false,
    });
    port.dispose();
  });

  it('binds queued mutations and health to the adapter account', async () => {
    const portA = new PowerSyncDataAdapter('account-a', { getAll: vi.fn() });
    const portB = new PowerSyncDataAdapter('account-b', { getAll: vi.fn() });
    const sharedIntent = {
      type: 'CREATE' as const,
      scope: 'self',
      name: 'saveReflection',
      variables: { recordId: 'same-record' },
    };
    await portA.enqueueMutation(sharedIntent);
    await portB.enqueueMutation({
      ...sharedIntent,
    });
    await portB.enqueueMutation({
      ...sharedIntent,
    });

    expect(portA.getOutboxHealth()).toEqual({
      pendingCount: 1,
      failedCount: 0,
      isProcessing: false,
    });
    expect(portB.getOutboxHealth()).toEqual({
      pendingCount: 1,
      failedCount: 0,
      isProcessing: false,
    });
    expect(useMutationQueue.getState().queue).toHaveLength(2);
    await expect(
      portA.enqueueMutation({
        type: 'CREATE',
        scope: 'self',
        name: 'saveForeignReflection',
        variables: { recordId: 'r-3' },
        userId: 'account-b',
      }),
    ).rejects.toThrow('Mutation identity does not match the active data port');

    portA.dispose();
    portB.dispose();
  });

  it('projects only the matching account’s sync state into the neutral health contract', () => {
    const port = new PowerSyncDataAdapter('account-a', { getAll: vi.fn() });
    const onHealth = vi.fn();
    port.subscribeSyncHealth(onHealth);

    sovereignBus.emit('powersync:status', {
      accountId: 'account-b',
      connected: true,
      connecting: false,
      downloading: false,
      uploading: false,
      hasSynced: true,
      error: null,
    });
    expect(port.getSyncHealth()).toEqual({ phase: 'unknown', initialSyncComplete: false });

    sovereignBus.emit('powersync:status', {
      accountId: 'account-a',
      connected: true,
      connecting: false,
      downloading: true,
      uploading: false,
      hasSynced: true,
      error: null,
    });
    expect(port.getSyncHealth()).toEqual({ phase: 'synchronizing', initialSyncComplete: true });
    expect(onHealth).toHaveBeenCalledTimes(1);

    port.dispose();
    sovereignBus.emit('powersync:first_sync_complete', { accountId: 'account-a' });
    expect(onHealth).toHaveBeenCalledTimes(1);
  });
});
