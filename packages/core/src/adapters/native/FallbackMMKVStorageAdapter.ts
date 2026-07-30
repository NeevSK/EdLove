import type { IStorage } from '@repo/core/logic/interfaces/storage.port';
import { AsyncStorageAdapter } from '@repo/core/adapters/native/AsyncStorageAdapter';

/**
 * FallbackMMKVStorageAdapter — May 2026
 *
 * Wraps MMKVStorageAdapter with a transparent per-operation fallback to AsyncStorage.
 *
 * WHY: MMKV uses JSI (synchronous native bridge). In rare edge cases it can fail:
 *   - On some emulators or test environments
 *   - After an OTA update before the native module is reloaded
 *   - In Expo Go (which doesn't bundle MMKV)
 *
 * The outer bootstrap already handles the cold-start case (if MMKV can't init,
 * it falls back to AsyncStorage). This adapter handles the "init succeeded but
 * a specific operation fails" case — which is more subtle and harder to debug.
 *
 * SWAPPING: Because both are registered via StorageManager.registerAdapter(),
 * swapping the entire storage backend is one line in bootstrap.ts:
 *   storage.registerAdapter(new AsyncStorageAdapter());
 * No other code changes are needed.
 */
export class FallbackMMKVStorageAdapter implements IStorage {
  private readonly fallback: IStorage;

  constructor(private mmkv: any) {
    this.fallback = new AsyncStorageAdapter();
  }

  set(key: string, value: string | boolean | number): void {
    try {
      this.mmkv.set(key, value);
    } catch (e) {
      console.warn(`[Storage] MMKV.set("${key}") failed, using AsyncStorage fallback:`, e);
      this.fallback.set(key, value);
    }
  }

  getString(key: string): string | undefined {
    try {
      return this.mmkv.getString(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.getString("${key}") failed, returning undefined:`, e);
      return undefined;
    }
  }

  async getStringAsync(key: string): Promise<string | undefined> {
    try {
      const val = this.mmkv.getString(key);
      if (val !== undefined) return val;
      // MMKV returned undefined — might just be a missing key, not an error.
      // Still check AsyncStorage in case a previous session wrote there.
      return this.fallback.getStringAsync(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.getStringAsync("${key}") failed, trying AsyncStorage:`, e);
      return this.fallback.getStringAsync(key);
    }
  }

  getBoolean(key: string): boolean | undefined {
    try {
      return this.mmkv.getBoolean(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.getBoolean("${key}") failed:`, e);
      return undefined;
    }
  }

  getNumber(key: string): number | undefined {
    try {
      return this.mmkv.getNumber(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.getNumber("${key}") failed:`, e);
      return undefined;
    }
  }

  delete(key: string): void {
    try {
      this.mmkv.delete(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.delete("${key}") failed, delegating to fallback:`, e);
      this.fallback.delete(key);
    }
  }

  clearAll(): void {
    try {
      this.mmkv.clearAll();
    } catch (e) {
      console.warn(`[Storage] MMKV.clearAll() failed, delegating to fallback:`, e);
      this.fallback.clearAll();
    }
  }

  contains(key: string): boolean {
    try {
      return this.mmkv.contains(key);
    } catch (e) {
      console.warn(`[Storage] MMKV.contains("${key}") failed:`, e);
      return false;
    }
  }
}
