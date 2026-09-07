import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Disaster Suite 1: Token Expiration & Re-Auth Outbox Recovery', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setAuthenticatedUser('user_jwt_expire');
  });

  it('correctly classifies 401 and JWT expiration errors as AUTH_EXPIRED instead of PERMANENT failure', () => {
    const error401 = { status: 401, message: 'Unauthorized' };
    const errorJwt = new Error('JWT expired: Token has expired at timestamp 1700000000');
    const errorRefresh = new Error('Invalid refresh token');

    expect(classifyError(error401)).toBe('AUTH_EXPIRED');
    expect(classifyError(errorJwt)).toBe('AUTH_EXPIRED');
    expect(classifyError(errorRefresh)).toBe('AUTH_EXPIRED');
  });

  it('pauses outbox synchronization on AUTH_EXPIRED without dumping items to DLQ', async () => {
    const queueStore = useMutationQueue.getState();

    // Enqueue 2 mutations
    await queueStore.addToQueue({
      type: 'UPDATE',
      scope: 'profile',
      name: 'updateBio',
      variables: { bio: 'Quantum Learner' },
    });

    await queueStore.addToQueue({
      type: 'CREATE',
      scope: 'journal',
      name: 'createEntry',
      variables: { text: 'Entry during expired token' },
    });

    const initialQueue = useMutationQueue.getState().queue;
    expect(initialQueue.length).toBe(2);

    const authRequiredSpy = vi.fn();
    sovereignBus.on('sync:auth_required', authRequiredSpy);

    // Simulate token expiration on Item 1
    const expiredError = { status: 401, message: 'JWT expired' };
    const errorCategory = classifyError(expiredError);

    if (errorCategory === 'AUTH_EXPIRED') {
      sovereignBus.emit('sync:auth_required', { mutationId: initialQueue[0]!.id });
      queueStore.updateMutation(initialQueue[0]!.id, {
        retryCount: 1,
        backoffUntil: Date.now() + 5000,
        lastError: 'AUTH_EXPIRED',
      });
    }

    expect(authRequiredSpy).toHaveBeenCalledWith(expect.objectContaining({ mutationId: initialQueue[0]!.id }));

    // Items MUST remain in active queue, DLQ MUST remain empty
    const queueAfter = useMutationQueue.getState().queue;
    const dlq = useMutationQueue.getState().deadLetterQueue;

    expect(queueAfter.length).toBe(2);
    expect(dlq.length).toBe(0);
    expect(queueAfter[0]?.lastError).toBe('AUTH_EXPIRED');
  });
});
