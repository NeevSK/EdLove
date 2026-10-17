import { storage } from '@repo/core/lib/storage';
import {
  invalidateResilience,
  useOfflineStatus,
  withResilience,
} from '@repo/core/offline/resilience';
import { useOfflineStatus as canonicalOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Disaster Suite 3: SWR Resilience Cache Defense Against 500 / 503 Poisoning', () => {
  const cacheKey = 'swr_defense_test_key';

  it('exports the existing offline hook without a second implementation', () => {
    expect(useOfflineStatus).toBe(canonicalOfflineStatus);
  });

  beforeEach(() => {
    invalidateResilience(cacheKey);
    vi.restoreAllMocks();
  });

  it('preserves and serves valid stale cache when background refresh throws 500 / 503 error', async () => {
    // 1. Initial successful cache seed (TTL: 10ms for instant expiration in test)
    const initialFetcher = vi.fn().mockResolvedValue({ id: 'doc_1', content: 'Sacred Gold Copy' });
    const firstResult = await withResilience(initialFetcher, {
      key: cacheKey,
      ttl: 10,
      silent: true,
    });
    expect(firstResult).toEqual({ id: 'doc_1', content: 'Sacred Gold Copy' });

    // Wait 25ms for TTL expiration
    await new Promise((resolve) => setTimeout(resolve, 25));

    // 2. Background refresh fails with fatal 500 / 503
    const failingFetcher = vi
      .fn()
      .mockRejectedValue(new Error('500 Internal Server Error / 503 Offline'));

    const staleResult = await withResilience(failingFetcher, {
      key: cacheKey,
      ttl: 10,
      silent: true,
    });

    // SWR MUST protect cache and return stale gold copy instead of null or error
    expect(staleResult).toEqual({ id: 'doc_1', content: 'Sacred Gold Copy' });

    // Cache in storage MUST NOT be wiped or corrupted
    const rawStorage = storage.getString(cacheKey);
    expect(rawStorage).not.toBeUndefined();
    expect(JSON.parse(rawStorage!).data).toEqual({ id: 'doc_1', content: 'Sacred Gold Copy' });
  });

  it('handles corrupt JSON in resilience storage gracefully by calling fetcher fresh', async () => {
    // Write corrupted JSON string directly to storage key
    storage.set(cacheKey, '<<<corrupted_unparseable_binary_dump>>>');

    const freshFetcher = vi.fn().mockResolvedValue({ id: 'doc_fresh', content: 'Fresh Data' });
    const recoveredResult = await withResilience(freshFetcher, {
      key: cacheKey,
      ttl: 60000,
      silent: true,
    });

    expect(recoveredResult).toEqual({ id: 'doc_fresh', content: 'Fresh Data' });
    expect(freshFetcher).toHaveBeenCalled();
  });
});
