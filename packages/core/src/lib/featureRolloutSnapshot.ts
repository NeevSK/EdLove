import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import { FEATURE_FLAG_MANIFEST } from '@repo/core/logic/registry/featureLifecycleManifest';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '@repo/core/store/types/featureFlags';

/** Maximum time a persisted rollout snapshot can influence temporary flags. */
export const FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeFeatureRolloutSnapshot(
  snapshot: FeatureRolloutSnapshot,
  now = Date.now(),
): FeatureRolloutSnapshot {
  const refreshedAt = Date.parse(snapshot.refreshedAt);
  const stale =
    !Number.isFinite(refreshedAt) ||
    refreshedAt > now ||
    now - refreshedAt >= FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS;

  if (!stale) return { ...snapshot, stale: false };

  const flags = Object.fromEntries(
    Object.entries(snapshot.flags).filter(([key]) => {
      const metadata = FEATURE_FLAG_MANIFEST[key as keyof typeof FEATURE_FLAG_MANIFEST];
      return metadata?.class === 'operational';
    }),
  );

  return { ...snapshot, flags, stale: true };
}

function toBoolean(value: boolean | string): boolean {
  if (typeof value === 'boolean') return value;
  return value === 'true';
}

export function projectFeatureFlags(overrides: Record<string, boolean | string>): FeatureFlags {
  const result = { ...DEFAULT_FEATURE_FLAGS };
  for (const key of Object.keys(result) as (keyof FeatureFlags)[]) {
    const value = overrides[key];
    if (value !== undefined) result[key] = toBoolean(value);
  }
  return result;
}
