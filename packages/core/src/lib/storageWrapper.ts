import { storage } from '@repo/core/lib/storage';
import { ensureDeviceThemePreference } from '@repo/core/lib/devicePreferences';
import type { StateStorage } from 'zustand/middleware';

function observePersistenceFailure(
  operation: 'write' | 'remove',
  result: Promise<void>,
): Promise<void> {
  void result.catch((error: unknown) => {
    console.error(`Storage: Zustand persistence ${operation} failed`, error);
  });
  return result;
}

/**
 * A architecture-compliant storage wrapper for Zustand.
 * It utilizes the Sovereign StorageManager (Adapter Pattern) to ensure
 * persistence works across Web and Native without direct pollution.
 */
export const SafeZustandStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    if (name === 'gurudevi-ui-storage') {
      return ensureDeviceThemePreference().then(async () => (await storage.getStringAsync(name)) ?? null);
    }
    // Attempt sync retrieval (MMKV or Cached AsyncStorage)
    const value = storage.getString(name);
    if (value !== undefined) return value;

    // Fallback to async retrieval through the manager
    return storage.getStringAsync(name).then((v) => v ?? null);
  },
  setItem: (name: string, value: string): Promise<void> =>
    observePersistenceFailure('write', storage.setAsync(name, value)),
  removeItem: (name: string): Promise<void> =>
    observePersistenceFailure('remove', storage.deleteAsync(name)),
};
