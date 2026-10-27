import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/**
 * MemoryStorageAdapter - A fallback adapter for environments without persistent storage
 * or for early access before the native adapter is registered.
 */
export class MemoryStorageAdapter implements IStorage {
  private data = new Map<string, string | boolean | number>();

  set(key: string, value: string | boolean | number) {
    this.data.set(key, value);
  }

  async setAsync(key: string, value: string | boolean | number) {
    this.set(key, value);
  }

  getString(key: string) {
    const val = this.data.get(key);
    return typeof val === 'string' ? val : undefined;
  }

  async getStringAsync(key: string) {
    return this.getString(key);
  }

  getBoolean(key: string) {
    const val = this.data.get(key);
    return typeof val === 'boolean' ? val : undefined;
  }

  getNumber(key: string) {
    const val = this.data.get(key);
    return typeof val === 'number' ? val : undefined;
  }

  delete(key: string) {
    this.data.delete(key);
  }

  async deleteAsync(key: string) {
    this.delete(key);
  }

  clearAll() {
    this.data.clear();
  }

  async clearAllAsync() {
    this.clearAll();
  }

  contains(key: string) {
    return this.data.has(key);
  }
}
