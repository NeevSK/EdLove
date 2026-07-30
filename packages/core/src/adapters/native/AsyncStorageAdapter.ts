import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/**
 * Robust AsyncStorage-based adapter with in-memory cache for synchronous access.
 */
export class AsyncStorageAdapter implements IStorage {
  private cache = new Map<string, any>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      pairs.forEach(([key, value]) => {
        if (value !== null) {
          if (value === 'true') this.cache.set(key, true);
          else if (value === 'false') this.cache.set(key, false);
          else if (!Number.isNaN(Number(value)) && value.trim() !== '')
            this.cache.set(key, Number(value));
          else this.cache.set(key, value);
        }
      });
      this.initialized = true;
    } catch (_e) {
      // Silently fail during hydration
    }
  }

  set(key: string, value: string | boolean | number) {
    this.cache.set(key, value);
    AsyncStorage.setItem(key, String(value)).catch((e) =>
      console.error(`📦 Storage: Failed to persist ${key}`, e),
    );
  }

  getString(key: string) {
    const val = this.cache.get(key);
    return typeof val === 'string' ? val : undefined;
  }

  async getStringAsync(key: string) {
    if (!this.initialized && this.initPromise) await this.initPromise;
    const val = await AsyncStorage.getItem(key);
    return val || undefined;
  }

  getBoolean(key: string) {
    const val = this.cache.get(key);
    return typeof val === 'boolean' ? val : undefined;
  }

  getNumber(key: string) {
    const val = this.cache.get(key);
    return typeof val === 'number' ? val : undefined;
  }

  delete(key: string) {
    this.cache.delete(key);
    AsyncStorage.removeItem(key).catch((e) => {
      console.error(`📦 Storage: Failed to remove ${key}`, e);
    });
  }

  clearAll() {
    this.cache.clear();
    AsyncStorage.clear().catch((e) => {
      console.error('📦 Storage: Failed to clear all keys', e);
    });
  }

  contains(key: string) {
    return this.cache.has(key);
  }
}
