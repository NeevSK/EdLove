/**
 * StorageManager - The Sovereign Dispatcher for KV Storage.
 *
 * This class follows the Port/Adapter (Hexagonal) pattern to keep
 * core logic free from native pollution.
 */
import { MemoryStorageAdapter } from '@repo/core/adapters/MemoryStorageAdapter';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

export class StorageManager implements IStorage {
  private adapter: IStorage = new MemoryStorageAdapter();
  private readonly observers = new Map<string, Set<() => void>>();

  /**
   * Registers the platform-specific adapter.
   * This should be called early in the app lifecycle (e.g. index.ts).
   */
  registerAdapter(adapter: IStorage) {
    this.adapter = adapter;
    for (const key of this.observers.keys()) this.notify(key);
  }

  subscribe(key: string, listener: () => void): () => void {
    const listeners = this.observers.get(key) ?? new Set<() => void>();
    listeners.add(listener);
    this.observers.set(key, listeners);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.observers.delete(key);
    };
  }

  private notify(key: string): void {
    this.observers.get(key)?.forEach((listener) => listener());
  }

  private observeCompletion(operation: Promise<void>, notify: () => void): Promise<void> {
    void operation.then(notify, () => undefined);
    return operation;
  }

  private getAdapter(): IStorage {
    return this.adapter;
  }

  set(key: string, value: string | boolean | number) {
    this.getAdapter().set(key, value);
    this.notify(key);
  }

  setAsync(key: string, value: string | boolean | number) {
    return this.observeCompletion(this.getAdapter().setAsync(key, value), () => this.notify(key));
  }

  getString(key: string) {
    return this.getAdapter().getString(key);
  }

  async getStringAsync(key: string) {
    const value = await this.getAdapter().getStringAsync(key);
    this.notify(key);
    return value;
  }

  getBoolean(key: string) {
    return this.getAdapter().getBoolean(key);
  }

  getNumber(key: string) {
    return this.getAdapter().getNumber(key);
  }

  delete(key: string) {
    this.getAdapter().delete(key);
    this.notify(key);
  }

  deleteAsync(key: string) {
    return this.observeCompletion(this.getAdapter().deleteAsync(key), () => this.notify(key));
  }

  clearAll() {
    this.getAdapter().clearAll();
    for (const key of this.observers.keys()) this.notify(key);
  }

  clearAllAsync() {
    return this.observeCompletion(this.getAdapter().clearAllAsync(), () => {
      for (const key of this.observers.keys()) this.notify(key);
    });
  }

  contains(key: string) {
    return this.getAdapter().contains(key);
  }
}

export const storage = new StorageManager();
