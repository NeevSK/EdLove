import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

type StoredValue = string | boolean | number;

/** Browser-local persistence with a memory fallback for SSR/private-storage failures. */
export class BrowserStorageAdapter implements IStorage {
  private readonly cache = new Map<string, StoredValue>();
  private readonly knownKeys = new Set<string>();

  private get browserStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private decode(value: string): StoredValue {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value);
    return value;
  }

  private hydrateKey(key: string): void {
    if (this.cache.has(key)) return;

    let persisted: string | null | undefined;
    try {
      persisted = this.browserStorage?.getItem(key);
    } catch {
      // Browsers can expose localStorage while rejecting individual reads.
      return;
    }
    if (persisted !== null && persisted !== undefined) {
      this.cache.set(key, this.decode(persisted));
      this.knownKeys.add(key);
    }
  }

  set(key: string, value: StoredValue): void {
    this.cache.set(key, value);
    this.knownKeys.add(key);

    try {
      this.browserStorage?.setItem(key, String(value));
    } catch {
      // The in-memory value remains usable for the current browser session.
    }
  }

  getString(key: string): string | undefined {
    this.hydrateKey(key);
    const value = this.cache.get(key);
    return typeof value === 'string' ? value : undefined;
  }

  async getStringAsync(key: string): Promise<string | undefined> {
    return this.getString(key);
  }

  getBoolean(key: string): boolean | undefined {
    this.hydrateKey(key);
    const value = this.cache.get(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  getNumber(key: string): number | undefined {
    this.hydrateKey(key);
    const value = this.cache.get(key);
    return typeof value === 'number' ? value : undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.knownKeys.delete(key);

    try {
      this.browserStorage?.removeItem(key);
    } catch {
      // Memory cleanup still succeeds when browser storage is unavailable.
    }
  }

  clearAll(): void {
    for (const key of this.knownKeys) this.delete(key);
  }

  contains(key: string): boolean {
    this.hydrateKey(key);
    return this.cache.has(key);
  }
}
