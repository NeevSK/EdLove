import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_DEAD_LETTER_QUEUE_SIZE,
  MAX_MUTATION_QUEUE_SIZE,
  MutationQueueCapacityError,
} from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { setActiveAccountId } from '@repo/core/lib/accountScope';

describe('useMutationQueue (G0 Unit / G1 State)', () => {
  beforeEach(() => {
    useMutationQueue.getState().clearQueue();
    useMutationQueue.getState().clearDeadLetterQueue();
    setActiveAccountId(null);
  });

  it('isolates queued mutations by user account (Multi-tenant partition)', async () => {
    const { addToQueue, getQueueForUser } = useMutationQueue.getState();

    await addToQueue({
      name: 'createPost',
      scope: 'community',
      type: 'CREATE',
      variables: { title: 'User 1 Post' },
      userId: 'user-123',
    });

    await addToQueue({
      name: 'createPost',
      scope: 'community',
      type: 'CREATE',
      variables: { title: 'User 2 Post' },
      userId: 'user-456',
    });

    await addToQueue({
      name: 'logTelemetry',
      scope: 'general',
      type: 'CUSTOM',
      variables: { event: 'app_start' },
      // unassigned / legacy
    });

    const user1Queue = getQueueForUser('user-123');
    const user2Queue = getQueueForUser('user-456');
    const unassignedQueue = getQueueForUser();

    expect(user1Queue).toHaveLength(1);
    expect(user1Queue[0]?.variables).toEqual({ title: 'User 1 Post' });

    expect(user2Queue).toHaveLength(1);
    expect(user2Queue[0]?.variables).toEqual({ title: 'User 2 Post' });

    expect(unassignedQueue).toHaveLength(1);
    expect(unassignedQueue[0]?.name).toBe('logTelemetry');
  });

  it('prevents duplicate intents for the same user without blocking other users', async () => {
    const { addToQueue } = useMutationQueue.getState();

    // User 1 adds an intent
    await addToQueue({
      name: 'likePost',
      scope: 'community',
      type: 'UPDATE',
      variables: { postId: 'post-1' },
      userId: 'user-123',
    });

    // User 1 submits same intent again -> should be deduplicated
    await addToQueue({
      name: 'likePost',
      scope: 'community',
      type: 'UPDATE',
      variables: { postId: 'post-1' },
      userId: 'user-123',
    });

    // User 2 submits the identical variables -> MUST NOT be suppressed
    await addToQueue({
      name: 'likePost',
      scope: 'community',
      type: 'UPDATE',
      variables: { postId: 'post-1' },
      userId: 'user-456',
    });

    const queue = useMutationQueue.getState().queue;
    expect(queue).toHaveLength(2);
    expect(queue[0]?.userId).toBe('user-123');
    expect(queue[1]?.userId).toBe('user-456');
  });

  it('rejects capacity overflow without discarding accepted commands', async () => {
    const { addToQueue } = useMutationQueue.getState();

    for (let i = 0; i < MAX_MUTATION_QUEUE_SIZE; i++) {
      await addToQueue({
        name: `mutation-${i}`,
        scope: 'stress',
        type: 'CREATE',
        variables: { index: i },
        userId: 'stress-user',
      });
    }

    await expect(
      addToQueue({
        name: 'overflow-mutation',
        scope: 'stress',
        type: 'CREATE',
        variables: { index: MAX_MUTATION_QUEUE_SIZE },
        userId: 'stress-user',
      }),
    ).rejects.toBeInstanceOf(MutationQueueCapacityError);

    const queue = useMutationQueue.getState().queue;
    expect(queue.length).toBe(MAX_MUTATION_QUEUE_SIZE);
    expect(queue[0]?.name).toBe('mutation-0');
    expect(queue[queue.length - 1]?.name).toBe(`mutation-${MAX_MUTATION_QUEUE_SIZE - 1}`);
  });

  it('enforces the capacity boundary when asynchronous submissions complete together', async () => {
    const { addToQueue } = useMutationQueue.getState();
    const submissions = Array.from({ length: MAX_MUTATION_QUEUE_SIZE + 5 }, (_, index) =>
      addToQueue({
        name: `concurrent-mutation-${index}`,
        scope: 'stress',
        type: 'CREATE',
        variables: { index },
        userId: 'stress-user',
      }),
    );

    const outcomes = await Promise.allSettled(submissions);
    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(
      MAX_MUTATION_QUEUE_SIZE,
    );
    expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(5);
    expect(useMutationQueue.getState().queue).toHaveLength(MAX_MUTATION_QUEUE_SIZE);
  });

  it('binds new commands to the active account and only resumes that account after auth recovery', async () => {
    setActiveAccountId('account-a');
    const { addToQueue, resumePausedMutationsForUser, updateMutation } =
      useMutationQueue.getState();

    await addToQueue({
      name: 'saveProfile',
      scope: 'self',
      type: 'UPDATE',
      variables: { displayName: 'A' },
    });
    await addToQueue({
      name: 'saveProfile',
      scope: 'self',
      type: 'UPDATE',
      variables: { displayName: 'B' },
      userId: 'account-b',
    });

    const [accountA, accountB] = useMutationQueue.getState().queue;
    expect(accountA?.userId).toBe('account-a');
    expect(accountB?.userId).toBe('account-b');

    if (!accountA || !accountB) throw new Error('Expected queued commands');
    updateMutation(accountA.id, { commandState: 'auth_paused', backoffUntil: Date.now() + 1_000 });
    updateMutation(accountB.id, { commandState: 'auth_paused', backoffUntil: Date.now() + 1_000 });
    resumePausedMutationsForUser('account-a');

    const resumed = useMutationQueue.getState().queue;
    expect(resumed[0]?.commandState).toBe('queued');
    expect(resumed[0]?.backoffUntil).toBeUndefined();
    expect(resumed[1]?.commandState).toBe('auth_paused');
  });

  it('bounds dead letter queue (DLQ) capacity', async () => {
    const { addToQueue, moveToDeadLetter } = useMutationQueue.getState();

    // Add items and immediately move to DLQ
    for (let i = 0; i < MAX_DEAD_LETTER_QUEUE_SIZE + 10; i++) {
      await addToQueue({
        name: `failing-mutation-${i}`,
        scope: 'stress',
        type: 'CREATE',
        variables: { index: i },
        userId: 'failing-user',
      });
      const currentQueue = useMutationQueue.getState().queue;
      const latest = currentQueue[currentQueue.length - 1];
      if (latest) {
        moveToDeadLetter(latest.id, 'Simulated Failure');
      }
    }

    const dlq = useMutationQueue.getState().deadLetterQueue;
    expect(dlq.length).toBe(MAX_DEAD_LETTER_QUEUE_SIZE);
  });

  it('allows only one coordinator to claim a command lease from the same snapshot', async () => {
    const { addToQueue, tryAcquireMutationLease } = useMutationQueue.getState();
    await addToQueue({
      name: 'saveProfile',
      scope: 'self',
      type: 'UPDATE',
      variables: { displayName: 'Lease owner' },
      userId: 'account-a',
    });

    const mutation = useMutationQueue.getState().queue[0];
    if (!mutation) throw new Error('Expected queued command');

    expect(tryAcquireMutationLease(mutation.id, 15_000, 1_000)).toBe(true);
    expect(tryAcquireMutationLease(mutation.id, 15_000, 1_000)).toBe(false);
    expect(useMutationQueue.getState().queue[0]).toMatchObject({
      commandState: 'dispatching',
      lockLeaseExpiresAt: 16_000,
    });
    expect(tryAcquireMutationLease(mutation.id, 15_000, 16_000)).toBe(true);
  });

  it('imports legacy dead letters without rebinding the original principal', async () => {
    const { importDeadLetterMutations, restoreDeadLetterMutation } = useMutationQueue.getState();
    importDeadLetterMutations([
      {
        id: 'legacy-command',
        idempotencyKey: 'legacy-key',
        name: 'saveProfile',
        scope: 'self',
        type: 'UPDATE',
        variables: { displayName: 'Original owner' },
        timestamp: 1,
        failedAt: 2,
        retryCount: 3,
        userId: 'original-account',
      },
    ]);

    expect(useMutationQueue.getState().deadLetterQueue).toMatchObject([
      { id: 'legacy-command', userId: 'original-account', commandState: 'rejected' },
    ]);
    expect(restoreDeadLetterMutation('legacy-command')).toBe(true);
    expect(useMutationQueue.getState().queue).toMatchObject([
      { id: 'legacy-command', userId: 'original-account', commandState: 'queued' },
    ]);
    expect(useMutationQueue.getState().queue[0]?.failedAt).toBeUndefined();
  });

  it('retains the newest dead-letter records and terminal failure time at capacity', async () => {
    const { importDeadLetterMutations } = useMutationQueue.getState();
    importDeadLetterMutations(
      Array.from({ length: MAX_DEAD_LETTER_QUEUE_SIZE + 1 }, (_, index) => ({
        id: `dead-${index}`,
        idempotencyKey: `key-${index}`,
        name: 'saveProfile',
        scope: 'self',
        type: 'UPDATE' as const,
        variables: { index },
        timestamp: index,
        failedAt: index,
        retryCount: 3,
        userId: 'account-a',
      })),
    );

    const deadLetters = useMutationQueue.getState().deadLetterQueue;
    expect(deadLetters).toHaveLength(MAX_DEAD_LETTER_QUEUE_SIZE);
    expect(deadLetters[0]).toMatchObject({
      id: `dead-${MAX_DEAD_LETTER_QUEUE_SIZE}`,
      failedAt: MAX_DEAD_LETTER_QUEUE_SIZE,
    });
    expect(deadLetters.at(-1)).toMatchObject({ id: 'dead-1', failedAt: 1 });
  });
});
