import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { createScenarioTestContext } from '../../testing/scenarioHarness';

describe('Storage Quota Exhaustion & Error Recovery Suite', () => {
  const harness = createScenarioTestContext();

  beforeEach(async () => {
    await harness.resetAll();
  });

  it('handles QuotaExceededError on setItem without throwing uncaught fatal exception', async () => {
    // Spy on setItem to simulate storage full (QuotaExceededError)
    const setItemSpy = vi.spyOn(SafeZustandStorage, 'setItem').mockRejectedValueOnce(
      new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    );

    let errorCaught = false;
    try {
      await SafeZustandStorage.setItem('overflow_key', JSON.stringify({ hugeData: true }));
    } catch (e: any) {
      errorCaught = true;
      expect(e.name).toBe('QuotaExceededError');
    }

    expect(setItemSpy).toHaveBeenCalled();
    expect(errorCaught).toBe(true);
  });

  it('allows getItem reads even when write operations are failing or degraded', async () => {
    // Preload valid cache
    await SafeZustandStorage.setItem('readable_key', JSON.stringify({ valid: true }));

    // Mock setItem throwing quota error
    vi.spyOn(SafeZustandStorage, 'setItem').mockRejectedValue(
      new DOMException('Disk full', 'QuotaExceededError')
    );

    // Assert reads still succeed reliably
    const cached = await SafeZustandStorage.getItem('readable_key');
    expect(cached).not.toBeNull();
    expect(JSON.parse(cached!)).toEqual({ valid: true });
  });
});
