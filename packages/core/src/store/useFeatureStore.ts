import { breadcrumb, featureRollout, featureRolloutCache } from '@repo/core/effect/bindings';
import { sessionScope } from '@repo/core/effect/bindings/state';
import {
  FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS,
  normalizeFeatureRolloutSnapshot,
  projectFeatureFlags,
} from '@repo/core/lib/featureRolloutSnapshot';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '@repo/core/store/types/featureFlags';
import { create } from 'zustand';

interface FeatureState {
  flags: FeatureFlags;
  snapshot: FeatureRolloutSnapshot | null;
  bindContext: (context: UserContext) => () => void;
  clear: () => void;
}

/** One current SDK evaluation. Flags are an atomic projection, never a persisted authority. */
export const useFeatureStore = create<FeatureState>((set) => {
  let generation = 0;
  let dispose: (() => void) | undefined;
  const clear = () => {
    generation += 1;
    dispose?.();
    dispose = undefined;
    set({ flags: DEFAULT_FEATURE_FLAGS, snapshot: null });
  };
  return {
    flags: DEFAULT_FEATURE_FLAGS,
    snapshot: null,
    clear,
    bindContext: (context) => {
      clear();
      breadcrumb('flags', 'Recomputing feature flags', 'info');
      const owner = generation;
      const scopeRevision = sessionScope.revision();
      const fingerprint = JSON.stringify(context);
      const key = sessionScope.storageKey(
        'feature-rollout:v2',
        context.userId && !context.isLocalOnly ? context.userId : null,
      );
      let timer: ReturnType<typeof setTimeout> | undefined;
      let sdkPublished = false;
      let lastAccepted: string | undefined;
      const isCurrent = () => owner === generation && scopeRevision === sessionScope.revision();
      const publish = (snapshot: FeatureRolloutSnapshot) => {
        if (!isCurrent()) return;
        clearTimeout(timer);
        const normalized = normalizeFeatureRolloutSnapshot(snapshot);
        set({ snapshot: normalized, flags: projectFeatureFlags(normalized.flags) });
        if (!normalized.stale) {
          timer = setTimeout(
            () => publish(snapshot),
            Date.parse(snapshot.refreshedAt) + FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS - Date.now(),
          );
        }
      };
      const accept = (snapshot: FeatureRolloutSnapshot) => {
        if (!isCurrent()) return;
        // An SDK without a loaded payload has not superseded a saved evaluation.
        if (snapshot.source === 'computed' && Object.keys(snapshot.flags).length === 0) return;
        const signature = JSON.stringify(snapshot);
        if (signature === lastAccepted) return;
        lastAccepted = signature;
        sdkPublished = true;
        publish(snapshot);
        breadcrumb('flags', 'Feature flags applied', 'info', {
          flagCount: Object.keys(snapshot.flags).length,
        });
        void featureRolloutCache.write(key, fingerprint, snapshot).catch((error: unknown) => {
          console.warn('[FeatureRollout] snapshot write failed', error);
        });
      };
      const unsubscribe = featureRollout.subscribeToFlagChanges(context, accept);
      dispose = () => {
        clearTimeout(timer);
        unsubscribe();
      };
      void featureRolloutCache
        .read(key, fingerprint)
        .then((saved) => {
          if (saved && isCurrent() && !sdkPublished) publish(saved);
        })
        .catch((error: unknown) => {
          console.warn('[FeatureRollout] snapshot read failed; record retained', error);
        });
      void featureRollout
        .resolveFlags(context)
        .then(accept)
        .catch((error: unknown) => {
          if (isCurrent()) {
            console.warn('[FeatureRollout] refresh failed; keeping current snapshot', error);
            breadcrumb('flags', 'Recompute failed', 'error', { error: String(error) });
          }
        });
      return () => {
        if (owner === generation) clear();
      };
    },
  };
});
