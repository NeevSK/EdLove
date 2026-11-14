import { featureRolloutCache as rolloutCache } from '@repo/core/adapters/feature-rollout/featureRolloutCache.adapter';
import { growthBookFeatureRolloutAdapter } from '@repo/core/adapters/feature-rollout/growthBookFeatureRollout.adapter';
import {
  authProfileStorage,
  restoreIdentityProfile,
} from '@repo/core/lib/authProfileStorage.adapter';
import type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@repo/core/logic/ports/featureRollout.port';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';

/**
 * Synchronous bindings for state (Tier 4), part of the composition root.
 *
 * Effect ports that state calls asynchronously live in ./Layers.ts and run on ./AppRuntime.ts.
 * Some things state needs synchronously are bound here, once, to their adapters; persistence,
 * the session scope and the event bus are in ./bindings/state.ts. Stores import these names and
 * never an adapter or lib/ file.
 *
 * A binding whose adapter pulls in a heavy chain (the database client, date libraries) gets its own
 * file under ./bindings/, so importing the auth store doesn't load it.
 */

/** The feature-flag source. */
export const featureRollout: IFeatureRolloutPort = growthBookFeatureRolloutAdapter;

/** The last flag evaluation per account or guest, checked when read. */
export const featureRolloutCache: {
  read(key: string, context: string): Promise<FeatureRolloutSnapshot | null>;
  write(key: string, context: string, snapshot: FeatureRolloutSnapshot): Promise<void>;
} = rolloutCache;

/** Records a state change for the next error report. */
export const breadcrumb: typeof leaveBreadcrumb = leaveBreadcrumb;

/** The persisted auth profile and how a stored record is turned back into a typed profile. */
export const authProfile = { storage: authProfileStorage, restore: restoreIdentityProfile };
