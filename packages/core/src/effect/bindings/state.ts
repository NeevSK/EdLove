import {
  getAccountScopeRevision,
  getActiveAccountId,
  scopeStorageKey,
} from '@repo/core/lib/accountScope.adapter';
import {
  createScopedStateStorage,
  withScopedStateWritesPaused,
} from '@repo/core/lib/scopedStateStorage.adapter';
import { storage } from '@repo/core/lib/storage.adapter';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper.adapter';
import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import {
  getGuestScope,
  getGuestScopeRevision,
  guestStorageKey,
  isGuestUserId,
} from '@repo/core/native/guestScope';
import { isLocalGuestSessionId } from '@repo/core/types/localGuest';
import type { StateStorage } from 'zustand/middleware';

/**
 * What state (Tier 4) needs synchronously from the device, bound once to its adapters: where
 * persisted state lives, which account or guest owns it, and the in-process event bus.
 *
 * Kept apart from ../bindings.ts so a store can import it without loading the feature-rollout SDK,
 * and so no adapter that a store's persistence touches can import its way back here.
 */

/** Where persisted Zustand state is kept. */
export const persistStorage: StateStorage = SafeZustandStorage;

/** Zustand persistence isolated by account or the current guest. */
export const scopedState = {
  createStorage: (): StateStorage => createScopedStateStorage(),
  /** Runs `operation` with scoped writes held, so a reset can't be overwritten mid-way. */
  pauseWrites: <T>(operation: () => T): T => withScopedStateWritesPaused(operation),
};

/** Raw key-value storage on the device, for the few records state reads outside Zustand. */
export const deviceStorage = storage;

/** Which account or guest the session is in, for namespacing local data and dropping stale work. */
export const sessionScope = {
  /** Changes whenever the active account or guest changes. */
  revision: (): string => `${getAccountScopeRevision()}:${getGuestScopeRevision()}`,
  /** A storage key in the signed-in account's namespace, or the guest's when there is no account. */
  storageKey: (name: string, accountId: string | null): string =>
    accountId ? scopeStorageKey(name, accountId) : guestStorageKey(name),
  /** A storage key in this account's namespace. */
  accountKey: (name: string, accountId: string): string => scopeStorageKey(name, accountId),
  /** A guest session that lives only on this device, with no server-issued permissions. */
  isLocalGuest: (userId: string): boolean => isLocalGuestSessionId(userId),
  /** Any guest identity (leased or local). */
  isGuest: (userId: string): boolean => isGuestUserId(userId),
  /** The signed-in account, or null. */
  activeAccountId: (): string | null => getActiveAccountId(),
  /** Changes whenever the active account changes; a read that spans a change is stale. */
  accountRevision: (): number => getAccountScopeRevision(),
  /** The current guest lease. */
  guestScope: (): string => getGuestScope(),
  /** Changes whenever the guest lease changes. */
  guestRevision: (): number => getGuestScopeRevision(),
};

/** The in-process event bus that state publishes transitions on. */
export const eventBus = sovereignBus;
