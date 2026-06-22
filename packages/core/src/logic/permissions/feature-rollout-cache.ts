import { storage } from '../../lib/storage';

export interface CachedFeatureRollout {
  flags: Record<string, boolean | string>;
  refreshedAt: string;
}

const FEATURE_ROLLOUT_CACHE_KEY = 'gurudevi_feature_rollout_cache';

export function readFeatureRolloutCache(): CachedFeatureRollout | null {
  const raw = storage.getString(FEATURE_ROLLOUT_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedFeatureRollout;
    if (!parsed || typeof parsed !== 'object' || !parsed.flags || !parsed.refreshedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeFeatureRolloutCache(flags: Record<string, boolean | string>): void {
  const snapshot: CachedFeatureRollout = {
    flags,
    refreshedAt: new Date().toISOString(),
  };
  storage.set(FEATURE_ROLLOUT_CACHE_KEY, JSON.stringify(snapshot));
}
