import type { IStorage as RuntimeStorage } from '@repo/core/logic/interfaces/storage.port';
import type { KeyValueStorage } from '@repo/core/logic/ports/storage';

/**
 * Adapts the established scalar runtime storage manager to the feature-level
 * key/value port without leaking MMKV, AsyncStorage, or browser APIs.
 */
export function createKeyValueStorageAdapter(storage: RuntimeStorage): KeyValueStorage {
  return {
    getItem: async (key) => (await storage.getStringAsync(key)) ?? null,
    setItem: (key, value) => storage.setAsync(key, value),
    removeItem: (key) => storage.deleteAsync(key),
  };
}
