import type { StateStorage } from 'zustand/middleware';
import { storage } from './storage';

/**
 * A architecture-compliant storage wrapper for Zustand.
 * It utilizes the Sovereign StorageManager (Adapter Pattern) to ensure
 * persistence works across Web and Native without direct pollution.
 */
export const SafeZustandStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    // Attempt sync retrieval (MMKV or Cached AsyncStorage)
    const value = storage.getString(name);
    if (value !== undefined) return value;

    // Fallback to async retrieval through the manager
    return storage.getStringAsync(name).then((v) => v ?? null);
  },
  setItem: (name: string, value: string): void | Promise<void> => {
    storage.set(name, value);
  },
  removeItem: (name: string): void | Promise<void> => {
    storage.delete(name);
  },
};
