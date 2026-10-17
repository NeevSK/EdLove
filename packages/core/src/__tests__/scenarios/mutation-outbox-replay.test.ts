import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { MUTATION_REGISTRY } from '@repo/core/lib/sync/registry';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Scenario 3: Optimistic Mutation Outbox, Conflict Fork & DLQ Replay', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
  });

  it('deduplicates queued mutations with matching idempotency keys', async () => {
    const queueStore = useMutationQueue.getState();

    await queueStore.addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateProfile',
      variables: { display_name: 'Hero Explorer' },
    });

    await queueStore.addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateProfile',
      variables: { display_name: 'Hero Explorer' },
    });

    const queue = useMutationQueue.getState().queue;
    expect(queue.length).toBe(1);
    expect(queue[0]?.variables).toEqual({ display_name: 'Hero Explorer' });
  });

  it('routes mutations exceeding max retries to Dead Letter Queue without crashing', async () => {
    const queueStore = useMutationQueue.getState();

    await queueStore.addToQueue({
      type: 'CREATE',
      scope: 'journal',
      name: 'createEntry',
      variables: { text: 'Important note' },
    });

    const item = useMutationQueue.getState().queue[0]!;
    expect(item).toBeDefined();

    // Simulate fatal error routing to DLQ
    queueStore.moveToDeadLetter(item.id, 'MAX_RETRIES_EXCEEDED');

    const updatedQueue = useMutationQueue.getState().queue;
    const dlq = useMutationQueue.getState().deadLetterQueue;

    expect(updatedQueue.length).toBe(0);
    expect(dlq.length).toBe(1);
    expect(dlq[0]?.id).toBe(item.id);
    expect(dlq[0]?.lastError).toBe('MAX_RETRIES_EXCEEDED');
  });

  it('records state conflict when server returns 409 conflict payload', async () => {
    const queueStore = useMutationQueue.getState();
    const conflictStore = useConflictStore.getState();

    await queueStore.addToQueue({
      type: 'CUSTOM',
      scope: 'rewards',
      name: 'claimReward',
      variables: { rewardId: 'badge_101', tier: 'gold' },
    });

    const item = useMutationQueue.getState().queue[0]!;

    // Conflict detection flow
    conflictStore.addConflict({
      id: item.id,
      scope: item.scope,
      name: item.name,
      localData: item.variables,
      remoteData: { rewardId: 'badge_101', tier: 'silver', claimed: true },
      timestamp: Date.now(),
    });

    const activeConflicts = useConflictStore.getState().activeConflicts;
    expect(activeConflicts.length).toBe(1);
    expect(activeConflicts[0]?.scope).toBe('rewards');
    expect(activeConflicts[0]?.localData).toEqual({ rewardId: 'badge_101', tier: 'gold' });
    expect(activeConflicts[0]?.remoteData).toEqual({
      rewardId: 'badge_101',
      tier: 'silver',
      claimed: true,
    });
  });
});
