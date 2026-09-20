import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_DEAD_LETTER_QUEUE_SIZE,
  MAX_MUTATION_QUEUE_SIZE,
} from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';

describe('useMutationQueue (G0 Unit / G1 State)', () => {
  beforeEach(() => {
    useMutationQueue.getState().clearQueue();
    useMutationQueue.getState().clearDeadLetterQueue();
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

  it('maintains bounded capacity on the main queue and evicts oldest items', async () => {
    const { addToQueue } = useMutationQueue.getState();

    // Fill queue to MAX_MUTATION_QUEUE_SIZE
    const promises = [];
    for (let i = 0; i < MAX_MUTATION_QUEUE_SIZE + 5; i++) {
      promises.push(
        addToQueue({
          name: `mutation-${i}`,
          scope: 'stress',
          type: 'CREATE',
          variables: { index: i },
          userId: 'stress-user',
        }),
      );
    }
    await Promise.all(promises);

    const queue = useMutationQueue.getState().queue;
    expect(queue.length).toBeLessThanOrEqual(MAX_MUTATION_QUEUE_SIZE);
    expect(queue.length).toBe(MAX_MUTATION_QUEUE_SIZE);
    // The earliest 5 items should have been evicted to prevent memory bloat
    expect(queue[0]?.name).not.toBe('mutation-0');
    expect(queue[queue.length - 1]?.name).toBe(`mutation-${MAX_MUTATION_QUEUE_SIZE + 4}`);
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
});
