import {
  getActiveAccountId,
  getAccountScopeRevision,
  scopeStorageKey,
} from '@repo/core/lib/accountScope';
import {
  getGuestScope,
  getGuestScopeRevision,
  guestStorageKey,
} from '@repo/core/native/guestScope';
import { storage } from '@repo/core/lib/storage';
import type { StateStorage } from 'zustand/middleware';

type Owner =
  | { kind: 'account'; id: string; revision: number }
  | { kind: 'guest'; id: string; revision: number };
let writesPaused = 0;

export function withScopedStateWritesPaused<T>(operation: () => T): T {
  writesPaused += 1;
  try {
    return operation();
  } finally {
    writesPaused -= 1;
  }
}

function currentOwner(): Owner {
  const accountId = getActiveAccountId();
  return accountId
    ? { kind: 'account', id: accountId, revision: getAccountScopeRevision() }
    : { kind: 'guest', id: getGuestScope(), revision: getGuestScopeRevision() };
}

function storageKey(name: string, owner: Owner): string {
  return owner.kind === 'account'
    ? scopeStorageKey(name, owner.id)
    : guestStorageKey(name, owner.id);
}

/** Zustand persistence isolated by canonical account or the current guest lease. */
export function createScopedStateStorage(): StateStorage {
  return {
    getItem: async (name) => {
      const owner = currentOwner();
      const value = await storage.getStringAsync(storageKey(name, owner));
      return sameOwner(owner) ? (value ?? null) : null;
    },
    setItem: async (name, value) => {
      if (writesPaused > 0) return;
      const owner = currentOwner();
      await storage.setAsync(storageKey(name, owner), value);
    },
    removeItem: async (name) => {
      const owner = currentOwner();
      await storage.deleteAsync(storageKey(name, owner));
    },
  };
}

function sameOwner(owner: Owner): boolean {
  const current = currentOwner();
  return (
    current.kind === owner.kind &&
    current.id === owner.id &&
    current.revision === owner.revision
  );
}
