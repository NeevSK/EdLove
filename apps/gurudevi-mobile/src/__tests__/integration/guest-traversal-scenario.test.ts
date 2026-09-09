import { profileAPI } from '@repo/core/api/profile';
import { rewardsAPI } from '@repo/core/api/rewards';
import { trackingAPI } from '@repo/core/api/tracking';
import { getLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { createScenarioTestContext } from '@repo/core/testing/scenarioHarness';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Scenario 1: Full Guest-Mode Isolation & Traversal (App Integration)', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setGuestUser();
  });

  it('resolves guest identity from local identity factory without network', async () => {
    const guestIdentity = await getLocalGuestIdentity('guest');

    expect(guestIdentity).toBeDefined();
    expect(guestIdentity.id).toBe('guest');
    expect(guestIdentity.citizenship).toBe('THIRD_CLASS');
  });

  it('retrieves tracking exploration without throwing unhandled network exceptions', async () => {
    const explored = await trackingAPI.getExploredFeatures('guest');
    expect(Array.isArray(explored)).toBe(true);
  });

  it('handles guest profile queries safely when offline without throwing fatal errors', async () => {
    harness.setOnline(false);

    const guestProfile = await profileAPI.getUserProfile('guest');
    // Offline / guest returns null or synthetic fallback instead of throwing fatal exception
    expect(guestProfile === null || guestProfile?.is_anonymous === true).toBe(true);
  });

  it('handles rewards query safely for guest user without network crash', async () => {
    harness.setOnline(false);

    const rewards = await rewardsAPI.getRewards('guest');
    expect(rewards === null || Array.isArray(rewards)).toBe(true);
  });
});
