import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '@repo/core/native/storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * A failsafe storage wrapper for Zustand.
 * It prioritizes our custom storage instance (MMKV with fallbacks)
 * but provides an explicit interface for Zustand's persist middleware.
 */
export const SafeZustandStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    // MMKV is synchronous
    const value = storage.getString(name);
    if (value !== undefined) return value;

    // Fallback to AsyncStorage if we are in an environment where MMKV didn't init
    return AsyncStorage.getItem(name);
  },
  setItem: (name: string, value: string): void | Promise<void> => {
    try {
      storage.set(name, value);
    } catch (_e) {
      // Fallback for set
      return AsyncStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void | Promise<void> => {
    try {
      storage.delete(name);
    } catch (_e) {
      return AsyncStorage.removeItem(name);
    }
  },
};
