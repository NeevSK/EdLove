import { describe, expect, it } from 'vitest';
import { type AssetCachePolicy, selectEvictions } from '../cachePolicy';

describe('selectEvictions', () => {
  const policy: AssetCachePolicy = {
    maxTotalBytes: 1000,
    ttlMs: 10_000,
    eviction: 'lru',
  };

  it('evicts expired unpinned entries first, then oldest LRU entries until within budget', () => {
    const now = 50_000;
    const evicted = selectEvictions(
      [
        { key: 'expired', bytes: 200, lastAccessedAt: 10_000 },
        { key: 'pinned', bytes: 500, lastAccessedAt: 10_000, pinned: true },
        { key: 'older', bytes: 400, lastAccessedAt: 45_000 },
        { key: 'newer', bytes: 300, lastAccessedAt: 49_000 },
      ],
      400,
      policy,
      now,
    );

    // expired (200) removed by TTL; remaining = pinned(500) + older(400) + newer(300) + incoming(400) = 1600 > 1000
    // older(400) + newer(300) evicted to reach 900 <= 1000; pinned is preserved
    expect(evicted).toEqual(['expired', 'older', 'newer']);
  });

  it('skips LRU eviction when eviction is manual, only pruning TTL', () => {
    const now = 50_000;
    const evicted = selectEvictions(
      [
        { key: 'expired', bytes: 200, lastAccessedAt: 10_000 },
        { key: 'keep', bytes: 900, lastAccessedAt: 45_000 },
      ],
      500,
      { ...policy, eviction: 'manual' },
      now,
    );
    expect(evicted).toEqual(['expired']);
  });
});
