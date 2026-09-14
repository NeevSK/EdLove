import type { ExploreStorage } from './types';

const memoryValues = new Map<string, string>();

function createMemoryStorage(): ExploreStorage {
  return {
    kind: 'memory',
    getItem: (key) => memoryValues.get(key) ?? null,
    setItem: (key, value) => {
      memoryValues.set(key, value);
    },
    removeItem: (key) => {
      memoryValues.delete(key);
    },
  };
}

/**
 * Returns localStorage only after proving that this browser allows writes.
 * Private browsing and restrictive browser policies may expose localStorage
 * while throwing on access; those sessions remain usable in process memory.
 */
export function createExploreStorage(): ExploreStorage {
  if (typeof window === 'undefined') return createMemoryStorage();

  try {
    const probeKey = '__gurudevi_explore_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);

    return {
      kind: 'local-storage',
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => {
        window.localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        window.localStorage.removeItem(key);
      },
    };
  } catch {
    return createMemoryStorage();
  }
}

export function createInMemoryExploreStorage(): ExploreStorage {
  return createMemoryStorage();
}
