import { getAccountScopeRevision, scopeStorageKey } from '@repo/core/lib/accountScope';
import {
  FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS,
  normalizeFeatureRolloutSnapshot,
  projectFeatureFlags,
} from '@repo/core/lib/featureRolloutSnapshot';
import { storage } from '@repo/core/lib/storage';
import { featureFlags } from '@repo/core/logic/managers/featureFlag.factory';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import { getGuestScopeRevision, guestStorageKey } from '@repo/core/native/guestScope';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from '@repo/core/store/types/featureFlags';
import { z } from 'zod';
import { create } from 'zustand';

const SavedRollout = z.object({
  version: z.literal(2),
  context: z.string(),
  snapshot: z.object({
    flags: z.record(z.string(), z.union([z.boolean(), z.string()])),
    source: z.enum(['cache', 'remote', 'computed']),
    refreshedAt: z.string(),
  }),
});

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
      leaveBreadcrumb('flags', 'Recomputing feature flags', 'info');
      const owner = generation;
      const accountRevision = getAccountScopeRevision();
      const guestRevision = getGuestScopeRevision();
      const fingerprint = JSON.stringify(context);
      const key =
        context.userId && !context.isLocalOnly
          ? scopeStorageKey('feature-rollout:v2', context.userId)
          : guestStorageKey('feature-rollout:v2');
      let timer: ReturnType<typeof setTimeout> | undefined;
      let sdkPublished = false;
      let lastAccepted: string | undefined;
      const isCurrent = () =>
        owner === generation &&
        accountRevision === getAccountScopeRevision() &&
        guestRevision === getGuestScopeRevision();
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
        leaveBreadcrumb('flags', 'Feature flags applied', 'info', {
          flagCount: Object.keys(snapshot.flags).length,
        });
        void storage
          .setAsync(key, JSON.stringify({ version: 2, context: fingerprint, snapshot }))
          .catch((error: unknown) => {
            console.warn('[FeatureRollout] snapshot write failed', error);
          });
      };
      const unsubscribe = featureFlags.subscribeToFlagChanges(context, accept);
      dispose = () => {
        clearTimeout(timer);
        unsubscribe();
      };
      void storage
        .getStringAsync(key)
        .then((raw) => {
          if (!raw || !isCurrent() || sdkPublished) return;
          const saved = SavedRollout.parse(JSON.parse(raw));
          if (saved.context === fingerprint) publish({ ...saved.snapshot, source: 'cache' });
        })
        .catch((error: unknown) => {
          console.warn('[FeatureRollout] snapshot read failed; record retained', error);
        });
      void featureFlags
        .resolveFlags(context)
        .then(accept)
        .catch((error: unknown) => {
          if (isCurrent()) {
            console.warn('[FeatureRollout] refresh failed; keeping current snapshot', error);
            leaveBreadcrumb('flags', 'Recompute failed', 'error', { error: String(error) });
          }
        });
      return () => {
        if (owner === generation) clear();
      };
    },
  };
});
