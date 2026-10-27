import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearPowerSyncAccount: vi.fn(),
  disconnectPowerSync: vi.fn(),
}));

vi.mock('../../adapters/powersync/database', () => ({
  clearPowerSyncAccount: mocks.clearPowerSyncAccount,
  disconnectPowerSync: mocks.disconnectPowerSync,
}));

import { useMutationQueue } from '../../lib/sync/useMutationQueue';
import { openReplayAdmission, tryBeginReplay } from '../../lib/sync/replayAdmission';
import { accountTransition } from '../accountTransition';

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
    openReplayAdmission('account-a');
    openReplayAdmission('account-b');
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
  });

  it('quarantines only commands belonging to the outgoing principal', async () => {
    useMutationQueue.setState({
      queue: [
        command('outgoing', 'account-a'),
        command('incoming', 'account-b'),
        command('legacy'),
      ],
      isSyncing: true,
    });

    const outcome = await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: 'account-b',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    });

    expect(mocks.disconnectPowerSync).toHaveBeenCalledOnce();
    expect(mocks.clearPowerSyncAccount).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      quarantinedCommandCount: 1,
      untouchedUnboundCommandCount: 1,
      replicatedDataCleared: false,
    });
    expect(useMutationQueue.getState().queue).toEqual([
      expect.objectContaining({ id: 'outgoing', commandState: 'auth_paused' }),
      expect.objectContaining({ id: 'incoming', commandState: 'queued' }),
      expect.objectContaining({ id: 'legacy', commandState: 'queued' }),
    ]);
    expect(tryBeginReplay('account-a')).toBeNull();
    expect(tryBeginReplay('account-b')).toBeNull();
  });

  it('closes new claims first and waits for admitted replay settlement before database close', async () => {
    let settle!: () => void;
    const inFlight = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const lease = tryBeginReplay('account-a');
    expect(lease).not.toBeNull();
    void inFlight.then(() => lease?.release());

    const transition = accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: 'account-b',
      disposition: 'preserve-and-quarantine',
      clearReplicatedData: false,
    });

    expect(tryBeginReplay('account-a')).toBeNull();
    expect(tryBeginReplay('account-b')).toBeNull();
    await Promise.resolve();
    expect(mocks.disconnectPowerSync).not.toHaveBeenCalled();

    settle();
    await transition;
    expect(mocks.disconnectPowerSync).toHaveBeenCalledOnce();
  });

  it('discards only explicitly selected principal work, including its dead letters', async () => {
    useMutationQueue.setState({
      queue: [
        command('outgoing', 'account-a'),
        command('incoming', 'account-b'),
        command('legacy'),
      ],
      deadLetterQueue: [
        command('dead-outgoing', 'account-a'),
        command('dead-incoming', 'account-b'),
      ],
    });

    const outcome = await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: null,
      disposition: 'discard',
      clearReplicatedData: false,
    });

    expect(mocks.clearPowerSyncAccount).not.toHaveBeenCalled();
    expect(outcome.discardedCommandCount).toBe(2);
    expect(useMutationQueue.getState().queue.map((entry) => entry.id)).toEqual([
      'incoming',
      'legacy',
    ]);
    expect(useMutationQueue.getState().deadLetterQueue.map((entry) => entry.id)).toEqual([
      'dead-incoming',
    ]);
  });

  it('keeps admission closed and preserves queued ownership when closing the outgoing runtime fails', async () => {
    mocks.disconnectPowerSync.mockRejectedValueOnce(new Error('local database unavailable'));
    useMutationQueue.setState({ queue: [command('outgoing', 'account-a')], isSyncing: true });

    await expect(
      accountTransition.transition({
        outgoingPrincipalId: 'account-a',
        incomingPrincipalId: 'account-b',
        disposition: 'preserve-and-quarantine',
        clearReplicatedData: false,
      }),
    ).rejects.toThrow('local database unavailable');

    expect(useMutationQueue.getState()).toMatchObject({
      isSyncing: true,
      queue: [expect.objectContaining({ id: 'outgoing', commandState: 'queued' })],
    });
    expect(tryBeginReplay('account-a')).toBeNull();
    expect(tryBeginReplay('account-b')).toBeNull();
  });

  it('rejects a contradictory preservation request before cleanup or outbox mutation', async () => {
    const outgoing = command('outgoing', 'account-a');
    useMutationQueue.setState({ queue: [outgoing], isSyncing: true });
    await expect(
      accountTransition.transition({
        outgoingPrincipalId: 'account-a',
        incomingPrincipalId: 'account-b',
        disposition: 'preserve-and-quarantine',
        clearReplicatedData: true,
      }),
    ).rejects.toThrow('Preserving account work cannot clear its PowerSync database.');
    expect(mocks.clearPowerSyncAccount).not.toHaveBeenCalled();
    expect(mocks.disconnectPowerSync).not.toHaveBeenCalled();
    expect(useMutationQueue.getState()).toMatchObject({ queue: [outgoing], isSyncing: true });
  });

  it('clears the database only for an explicit discard request', async () => {
    useMutationQueue.setState({ queue: [command('outgoing', 'account-a')] });
    const result = await accountTransition.transition({
      outgoingPrincipalId: 'account-a',
      incomingPrincipalId: null,
      disposition: 'discard',
      clearReplicatedData: true,
    });
    expect(mocks.clearPowerSyncAccount).toHaveBeenCalledOnce();
    expect(mocks.disconnectPowerSync).not.toHaveBeenCalled();
    expect(result).toMatchObject({ replicatedDataCleared: true, discardedCommandCount: 1 });
    expect(useMutationQueue.getState().queue).toEqual([]);
  });
});
