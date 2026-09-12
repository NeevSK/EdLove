import { featureFlags } from '@repo/core/logic/managers/featureFlag.factory';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import { FEATURE_FLAG_MANIFEST } from '@repo/core/logic/registry/featureLifecycleManifest';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '@repo/core/store/types/featureFlags';
import type { StateCreator } from 'zustand';

export interface FeatureSlice {
  flags: FeatureFlags;
  snapshot: FeatureRolloutSnapshot | null;

  applySnapshot: (snapshot: FeatureRolloutSnapshot) => void;

  recomputeFlags: (context: UserContext) => void;
}

/** Maximum time a persisted rollout snapshot can influence temporary flags. */
export const FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function normalizeFeatureRolloutSnapshot(
  snapshot: FeatureRolloutSnapshot,
  now = Date.now(),
): FeatureRolloutSnapshot {
  const refreshedAt = Date.parse(snapshot.refreshedAt);
  const stale =
    !Number.isFinite(refreshedAt) || now - refreshedAt > FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS;

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

function applyFeatureFlags(
  base: FeatureFlags,
  overrides: Record<string, boolean | string>,
): FeatureFlags {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in result) {
      (result as Record<string, unknown>)[key] = toBoolean(value);
    }
  }
  return result;
}

export const createFeatureSlice: StateCreator<FeatureSlice> = (set) => {
  let recomputeGeneration = 0;

  const applySnapshot = (snapshot: FeatureRolloutSnapshot) => {
    const normalizedSnapshot = normalizeFeatureRolloutSnapshot(snapshot);
    leaveBreadcrumb('flags', 'Feature flags applied', 'info', {
      flagCount: Object.keys(snapshot.flags).length,
    });
    set({
      snapshot: normalizedSnapshot,
      flags: applyFeatureFlags(DEFAULT_FEATURE_FLAGS, normalizedSnapshot.flags),
    });
  };

  return {
    flags: { ...DEFAULT_FEATURE_FLAGS },
    snapshot: null,
    applySnapshot,
    recomputeFlags: (context) => {
      const generation = ++recomputeGeneration;
      leaveBreadcrumb('flags', 'Recomputing feature flags', 'info');
      featureFlags
        .resolveFlags(context)
        .then((snapshot) => {
          if (generation !== recomputeGeneration) return;
          applySnapshot(snapshot);
        })
        .catch((err) => {
          console.warn('[FeatureSlice] resolveFlags failed, keeping defaults:', err);
          leaveBreadcrumb('flags', 'Recompute failed', 'error', { error: String(err) });
        });
    },
  };
};
