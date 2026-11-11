import { featureRolloutCache as rolloutCache } from '@repo/core/adapters/feature-rollout/featureRolloutCache.adapter';
import { growthBookFeatureRolloutAdapter } from '@repo/core/adapters/feature-rollout/growthBookFeatureRollout.adapter';
import { getAccountScopeRevision, scopeStorageKey } from '@repo/core/lib/accountScope';
import { authProfileStorage, restoreIdentityProfile } from '@repo/core/lib/authProfileStorage';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import type {
  FeatureRolloutSnapshot,
  IFeatureRolloutPort,
} from '@repo/core/logic/ports/featureRollout.port';
import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import { getGuestScopeRevision, guestStorageKey } from '@repo/core/native/guestScope';
import { isLocalGuestSessionId } from '@repo/core/types/localGuest';
import type { StateStorage } from 'zustand/middleware';

/**
 * Synchronous bindings for state (Tier 4), part of the composition root.
 *
 * Effect ports that state calls asynchronously live in ./Layers.ts and run on ./AppRuntime.ts.
 * Some things state needs synchronously: Zustand persist storage when a store is created, a
 * subscription that returns its unsubscribe, the current session scope. Those are bound here, once,
 * to their adapters. Stores import these names and never an adapter or lib/ file.
 */

/** Where persisted Zustand state is kept. */
export const persistStorage: StateStorage = SafeZustandStorage;

/** The feature-flag source. */
export const featureRollout: IFeatureRolloutPort = growthBookFeatureRolloutAdapter;

/** The last flag evaluation per account or guest, checked when read. */
export const featureRolloutCache: {
  read(key: string, context: string): Promise<FeatureRolloutSnapshot | null>;
  write(key: string, context: string, snapshot: FeatureRolloutSnapshot): Promise<void>;
} = rolloutCache;

/** Which account or guest the session is in, for namespacing local data and dropping stale work. */
export const sessionScope = {
  /** Changes whenever the active account or guest changes. */
  revision: (): string => `${getAccountScopeRevision()}:${getGuestScopeRevision()}`,
  /** A storage key in the signed-in account's namespace, or the guest's when there is no account. */
  storageKey: (name: string, accountId: string | null): string =>
    accountId ? scopeStorageKey(name, accountId) : guestStorageKey(name),
  /** A guest session that lives only on this device, with no server-issued permissions. */
  isLocalGuest: (userId: string): boolean => isLocalGuestSessionId(userId),
};

/** Records a state change for the next error report. */
export const breadcrumb: typeof leaveBreadcrumb = leaveBreadcrumb;

/** The in-process event bus that state publishes transitions on. */
export const eventBus = sovereignBus;

/** The persisted auth profile and how a stored record is turned back into a typed profile. */
export const authProfile = { storage: authProfileStorage, restore: restoreIdentityProfile };
