import { authenticatedSovereignFetch } from '@repo/core/api/clientRuntime';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { createScenarioTestContext } from '@repo/core/testing/scenarioHarness';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Scenario 2: Network Flapping, Offline Drops & Silent Recovery', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
    harness.setAuthenticatedUser('user_network_flap');
  });

  it('synthesizes offline 503 response on network rejection instead of throwing fatal exception', async () => {
    // Attempting to fetch non-existent endpoint or offline simulation
    const response = await authenticatedSovereignFetch('https://unreachable.localhost/api/test', {
      method: 'GET',
    });

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual(expect.objectContaining({ offline: true }));
  });

  it('preserves cached state in SafeZustandStorage through offline drops', async () => {
    const cacheKey = 'gurudevi-network-flap-cache-key';
    const originalPayload = { status: 'healthy', balance: 150 };

    await SafeZustandStorage.setItem(cacheKey, JSON.stringify(originalPayload));

    // Simulate network drop
    harness.setOnline(false);

    // Read while offline
    const cachedRaw = await SafeZustandStorage.getItem(cacheKey);
    expect(cachedRaw).not.toBeNull();
    expect(JSON.parse(cachedRaw!)).toEqual(originalPayload);

    // Simulate network restore
    harness.setOnline(true);
    const restoredRaw = await SafeZustandStorage.getItem(cacheKey);
    expect(JSON.parse(restoredRaw!)).toEqual(originalPayload);
  });
});
