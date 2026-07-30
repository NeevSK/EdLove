/**
 * StorageManager - The Sovereign Dispatcher for KV Storage.
 *
 * This class follows the Port/Adapter (Hexagonal) pattern to keep
 * core logic free from native pollution.
 */
import { MemoryStorageAdapter } from '@repo/core/adapters/MemoryStorageAdapter';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/**
 * StorageManager - The Sovereign Dispatcher for KV Storage.
 *
 * This class follows the Port/Adapter (Hexagonal) pattern to keep
 * core logic free from native pollution.
 */
class StorageManager implements IStorage {
  private adapter: IStorage = new MemoryStorageAdapter();

  /**
   * Registers the platform-specific adapter.
   * This should be called early in the app lifecycle (e.g. index.ts).
   */
  registerAdapter(adapter: IStorage) {
    this.adapter = adapter;
  }

  private getAdapter(): IStorage {
    return this.adapter;
  }

  set(key: string, value: string | boolean | number) {
    this.getAdapter().set(key, value);
  }

  getString(key: string) {
    return this.getAdapter().getString(key);
  }

  async getStringAsync(key: string) {
    return this.getAdapter().getStringAsync(key);
  }

  getBoolean(key: string) {
    return this.getAdapter().getBoolean(key);
  }

  getNumber(key: string) {
    return this.getAdapter().getNumber(key);
  }

  delete(key: string) {
    this.getAdapter().delete(key);
  }

  clearAll() {
    this.getAdapter().clearAll();
  }

  contains(key: string) {
    return this.getAdapter().contains(key);
  }
}

export const storage = new StorageManager();
