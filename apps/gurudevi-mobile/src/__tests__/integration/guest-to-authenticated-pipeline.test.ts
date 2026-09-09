import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import {
  getLocalGuestIdentity,
  migrateGuestDataToAuthenticatedUser,
  updateLocalGuestIdentity,
} from '@repo/core/native/guestIdentity';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { createScenarioTestContext } from '@repo/core/testing/scenarioHarness';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Suite B: Full Guest -> Offline Creation -> Auth Upgrade -> Replay E2E Pipeline', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
  });

  it('orchestrates complete guest creation, offline outbox queuing, account linking, and outbox reconciliation', async () => {
    // 1. App starts in Guest Mode (Offline or unauthenticated)
    harness.setGuestUser();
    const initialGuest = await getLocalGuestIdentity('guest');
    expect(initialGuest.id).toBe('guest');
    expect(initialGuest.citizenship).toBe('THIRD_CLASS');

    // 2. Guest user modifies local identity offline
    await updateLocalGuestIdentity('guest', {
      display_name: 'Pioneer Guest',
      onboarding_completed: true,
    });

    const updatedGuest = await getLocalGuestIdentity('guest');
    expect(updatedGuest.display_name).toBe('Pioneer Guest');
    expect(updatedGuest.onboarding_completed).toBe(true);

    // 3. Guest queues 2 optimistic offline mutations
    const queueStore = useMutationQueue.getState();
    await queueStore.addToQueue({
      type: 'CREATE',
      scope: 'journal',
      name: 'createEntry',
      variables: { text: 'My first offline memory', mood: 'serene' },
    });

    await queueStore.addToQueue({
      type: 'CUSTOM',
      scope: 'rewards',
      name: 'claimExplorationBadge',
      variables: { badge: 'first_step' },
    });

    const pendingQueue = useMutationQueue.getState().queue;
    expect(pendingQueue.length).toBe(2);

    // 4. User signs in with Google (Auth Upgrade)
    const authenticatedUserId = 'user_google_777';
    harness.setAuthenticatedUser(authenticatedUserId);

    const activeUser = useAuthStore.getState().user;
    expect(activeUser?.id).toBe(authenticatedUserId);
    expect(activeUser?.is_anonymous).toBe(false);

    // 5. Account Migration: Use official migrateGuestDataToAuthenticatedUser helper
    const migratedIdentity = await migrateGuestDataToAuthenticatedUser(
      authenticatedUserId,
      'guest',
    );
    expect(migratedIdentity.display_name).toBe('Pioneer Guest');
    expect(migratedIdentity.onboarding_completed).toBe(true);

    const guestCheck = await getLocalGuestIdentity('guest');
    expect(guestCheck.display_name).toBe('');

    // 6. Outbox Replay Verification: Pending mutations remain intact for authenticated execution
    const outboxToReplay = useMutationQueue.getState().queue;
    expect(outboxToReplay.length).toBe(2);
    expect(outboxToReplay[0]?.variables.text).toBe('My first offline memory');
    expect(outboxToReplay[1]?.variables.badge).toBe('first_step');

    // Simulate successful sync execution
    queueStore.removeFromQueue(outboxToReplay[0]!.id);
    queueStore.removeFromQueue(outboxToReplay[1]!.id);

    expect(useMutationQueue.getState().queue.length).toBe(0);
  });
});
