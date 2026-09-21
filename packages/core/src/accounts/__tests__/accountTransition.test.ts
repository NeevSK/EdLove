import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QueuedMutation } from '@repo/core/lib/sync/types';

const mocks = vi.hoisted(() => ({ clearPowerSyncAccount: vi.fn() }));

vi.mock('../../adapters/powersync/database', () => ({
  clearPowerSyncAccount: mocks.clearPowerSyncAccount,
}));

import { accountTransition } from '../accountTransition';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';

function command(id: string, userId?: string): QueuedMutation {
  return {
    id,
    idempotencyKey: `key-${id}`,
    type: 'CUSTOM',
    scope: 'self',
    name: 'save',
    variables: {},
    timestamp: 1,
    retryCount: 0,
    userId,
    commandState: 'queued',
  };
}

describe('accountTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
  });

  it('quarantines only commands belonging to the outgoing principal', async () => {
    useMutationQueue.setState({
      queue: [command('outgoing', 'account-a'), command('incoming', 'account-b'), command('legacy')],
      isSyncing: true,
    });

    const outcome = await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: 'account-b',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: true,
    });

    expect(mocks.clearPowerSyncAccount).toHaveBeenCalledOnce();
    expect(outcome).toMatchObject({
      quarantinedCommandCount: 1,
      untouchedUnboundCommandCount: 1,
      replicatedDataCleared: true,
    });
    expect(useMutationQueue.getState().queue).toEqual([
      expect.objectContaining({ id: 'outgoing', commandState: 'auth_paused' }),
      expect.objectContaining({ id: 'incoming', commandState: 'queued' }),
      expect.objectContaining({ id: 'legacy', commandState: 'queued' }),
    ]);
  });

  it('discards only explicitly selected principal work, including its dead letters', async () => {
    useMutationQueue.setState({
      queue: [command('outgoing', 'account-a'), command('incoming', 'account-b'), command('legacy')],
      deadLetterQueue: [command('dead-outgoing', 'account-a'), command('dead-incoming', 'account-b')],
    });

    const outcome = await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: null,
      disposition: 'discard',
      clearReplicatedData: false,
    });

    expect(mocks.clearPowerSyncAccount).not.toHaveBeenCalled();
    expect(outcome.discardedCommandCount).toBe(2);
    expect(useMutationQueue.getState().queue.map((entry) => entry.id)).toEqual(['incoming', 'legacy']);
    expect(useMutationQueue.getState().deadLetterQueue.map((entry) => entry.id)).toEqual(['dead-incoming']);
  });

  it('does not change command ownership when clearing replicated data fails', async () => {
    mocks.clearPowerSyncAccount.mockRejectedValueOnce(new Error('local database unavailable'));
    useMutationQueue.setState({ queue: [command('outgoing', 'account-a')], isSyncing: true });

    await expect(
      accountTransition.transition({
        outgoingPrincipalId: 'account-a',
        incomingPrincipalId: 'account-b',
        disposition: 'preserve-and-quarantine',
        clearReplicatedData: true,
      }),
    ).rejects.toThrow('local database unavailable');

    expect(useMutationQueue.getState()).toMatchObject({
      isSyncing: true,
      queue: [expect.objectContaining({ id: 'outgoing', commandState: 'queued' })],
    });
  });
});
