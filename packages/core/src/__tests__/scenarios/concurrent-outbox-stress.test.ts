import { describe, expect, it, beforeEach } from 'vitest';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Concurrent Outbox & Race Condition Stress Suite', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setAuthenticatedUser('user_concurrent_stress');
  });

  it('processes burst of 10 concurrent mutations without losing items or duplicating IDs', async () => {
    const queueStore = useMutationQueue.getState();

    // Fire 10 simultaneous mutations across distinct scopes
    const mutationPromises = Array.from({ length: 10 }).map((_, idx) =>
      queueStore.addToQueue({
        type: 'UPDATE',
        scope: `domain_${idx % 3}`,
        name: `action_${idx}`,
        variables: { index: idx, timestamp: Date.now() },
      })
    );

    await Promise.all(mutationPromises);

    const queue = useMutationQueue.getState().queue;
    expect(queue.length).toBe(10);

    // Verify all IDs are unique UUIDs
    const ids = new Set(queue.map((item) => item.id));
    expect(ids.size).toBe(10);
  });

  it('maintains strict insertion order during high-frequency sequential writes', async () => {
    const queueStore = useMutationQueue.getState();

    for (let i = 0; i < 5; i++) {
      await queueStore.addToQueue({
        type: 'UPDATE',
        scope: 'counter',
        name: 'increment',
        variables: { seq: i },
      });
    }

    const queue = useMutationQueue.getState().queue;
    expect(queue.length).toBe(5);

    // Check exact sequential FIFO order
    queue.forEach((item, idx) => {
      expect(item.variables.seq).toBe(idx);
    });
  });

  it('isolates dead letter failures without blocking subsequent unrelated mutations', async () => {
    const queueStore = useMutationQueue.getState();

    // 1. Add failing mutation
    await queueStore.addToQueue({
      type: 'CUSTOM',
      scope: 'payment',
      name: 'charge',
      variables: { amount: 999 },
    });

    // 2. Add healthy subsequent mutation
    await queueStore.addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateBio',
      variables: { bio: 'New bio' },
    });

    const queueBefore = useMutationQueue.getState().queue;
    const failingId = queueBefore[0]!.id;
    const healthyId = queueBefore[1]!.id;

    // Fail item 1 to DLQ
    queueStore.moveToDeadLetter(failingId, 'CARD_DECLINED');

    const queueAfter = useMutationQueue.getState().queue;
    const dlq = useMutationQueue.getState().deadLetterQueue;

    // Failing item removed from active queue and moved to DLQ
    expect(dlq.length).toBe(1);
    expect(dlq[0]?.id).toBe(failingId);

    // Healthy item 2 remains unaffected in active queue ready for sync
    expect(queueAfter.length).toBe(1);
    expect(queueAfter[0]?.id).toBe(healthyId);
    expect(queueAfter[0]?.name).toBe('updateBio');
  });
});
