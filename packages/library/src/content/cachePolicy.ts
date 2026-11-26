/**
 * Configurable offline cache & TTL retention policy for downloaded content packs.
 * Aligns with `2026-08-25-storage-efficiency-plan.md` so device caches never grow unboundedly.
 */

export type CacheEvictionStrategy = 'lru' | 'manual';

export interface AssetCachePolicy {
  /** Maximum total bytes retained in the local offline pack cache. */
  readonly maxTotalBytes: number;
  /** Time-to-live in milliseconds before an unpinned cached asset is eligible for pruning. */
  readonly ttlMs: number;
  /** Whether LRU eviction runs automatically when adding a new entry. */
  readonly eviction: CacheEvictionStrategy;
}

const MB = 1024 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_ASSET_CACHE_POLICY: AssetCachePolicy = {
  maxTotalBytes: 250 * MB,
  ttlMs: 30 * DAY_MS,
  eviction: 'lru',
};

export interface CachedAssetMeta {
  readonly key: string;
  readonly bytes: number;
  readonly lastAccessedAt: number;
  readonly pinned?: boolean;
}

/**
 * Computes which cached entries should be evicted to respect `policy.ttlMs` and `policy.maxTotalBytes`
 * when storing `incomingBytes`. Pinned entries are never evicted by LRU.
 */
export function selectEvictions(
  entries: readonly CachedAssetMeta[],
  incomingBytes: number,
  policy: AssetCachePolicy = DEFAULT_ASSET_CACHE_POLICY,
  now: number = Date.now(),
): readonly string[] {
  const toEvict = new Set<string>();
  const kept: CachedAssetMeta[] = [];

  for (const entry of entries) {
    if (!entry.pinned && now - entry.lastAccessedAt > policy.ttlMs) {
      toEvict.add(entry.key);
    } else {
      kept.push(entry);
    }
  }

  if (policy.eviction === 'manual') {
    return [...toEvict];
  }

  let totalBytes = kept.reduce((sum, e) => sum + e.bytes, 0) + incomingBytes;
  if (totalBytes <= policy.maxTotalBytes) {
    return [...toEvict];
  }

  const candidates = kept
    .filter((e) => !e.pinned)
    .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

  for (const candidate of candidates) {
    if (totalBytes <= policy.maxTotalBytes) break;
    toEvict.add(candidate.key);
    totalBytes -= candidate.bytes;
  }

  return [...toEvict];
}
