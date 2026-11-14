import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

/**
 * Robust AsyncStorage-based adapter with in-memory cache for synchronous access.
 */
export class AsyncStorageAdapter implements IStorage {
  private cache = new Map<string, string | boolean | number>();
  private keyRevisions = new Map<string, number>();
  private initPromise: Promise<void>;
  private operationQueue: Promise<void> = Promise.resolve();
  private revision = 0;
  private clearEpoch = 0;

  constructor() {
    this.initPromise = this.init();
    void this.initPromise.catch((error: unknown) => {
      console.error('Storage: Failed to hydrate AsyncStorage cache', error);
    });
  }

  private async init() {
    const hydrationEpoch = this.clearEpoch;
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([key, value]) => {
      // A synchronous legacy write may happen before hydration finishes. Its
      // in-memory value is newer than the snapshot being loaded here.
      if (value !== null && hydrationEpoch === this.clearEpoch && !this.keyRevisions.has(key)) {
        if (value === 'true') this.cache.set(key, true);
        else if (value === 'false') this.cache.set(key, false);
        else if (!Number.isNaN(Number(value)) && value.trim() !== '')
          this.cache.set(key, Number(value));
        else this.cache.set(key, value);
      }
    });
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation);
    this.operationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private beginKeyMutation(key: string) {
    const revision = ++this.revision;
    this.keyRevisions.set(key, revision);
    return { revision, clearEpoch: this.clearEpoch };
  }

  private isLatestKeyMutation(
    key: string,
    mutation: { revision: number; clearEpoch: number },
  ): boolean {
    return (
      this.keyRevisions.get(key) === mutation.revision && this.clearEpoch === mutation.clearEpoch
    );
  }

  private logLegacyFailure(operation: string, error: unknown): void {
    console.error(`Storage: Failed to ${operation}`, error);
  }

  private enqueueLegacy(operation: () => Promise<void>, label: string): void {
    void this.enqueue(operation).catch((error: unknown) => this.logLegacyFailure(label, error));
  }

  private snapshotCacheRevisions(): Map<string, number | undefined> {
    return new Map([...this.cache.keys()].map((key) => [key, this.keyRevisions.get(key)] as const));
  }

  private clearUnchangedCacheEntries(snapshot: Map<string, number | undefined>): void {
    for (const [key, revision] of snapshot) {
      if (this.keyRevisions.get(key) === revision) this.cache.delete(key);
    }
  }

  set(key: string, value: string | boolean | number) {
    const mutation = this.beginKeyMutation(key);
    this.cache.set(key, value);
    this.enqueueLegacy(async () => {
      await this.initPromise;
      await AsyncStorage.setItem(key, String(value));
      if (this.isLatestKeyMutation(key, mutation)) this.cache.set(key, value);
    }, `persist ${key}`);
  }

  setAsync(key: string, value: string | boolean | number): Promise<void> {
    const mutation = this.beginKeyMutation(key);
    return this.enqueue(async () => {
      await this.initPromise;
      await AsyncStorage.setItem(key, String(value));
      if (this.isLatestKeyMutation(key, mutation)) this.cache.set(key, value);
    });
  }

  getString(key: string) {
    const val = this.cache.get(key);
    return typeof val === 'string' ? val : undefined;
  }

  async getStringAsync(key: string) {
    return this.enqueue(async () => {
      await this.initPromise;
      const val = await AsyncStorage.getItem(key);
      return val ?? undefined;
    });
  }

  async migrateMissingKeysTo(
    target: {
      contains: (key: string) => boolean;
      getString: (key: string) => string | undefined;
      set: (key: string, value: string) => void;
    },
    excludedKeys: ReadonlySet<string> = new Set(),
    overwriteExisting = false,
  ): Promise<void> {
    return this.enqueue(async () => {
      await this.initPromise;
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        if (excludedKeys.has(key) || (target.contains(key) && !overwriteExisting)) continue;
        const value = await AsyncStorage.getItem(key);
        if (value === null) continue;
        target.set(key, value);
        if (target.getString(key) !== value) {
          throw new Error(`Storage migration read-back failed for key: ${key}`);
        }
      }
    });
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
    const mutation = this.beginKeyMutation(key);
    this.cache.delete(key);
    this.enqueueLegacy(async () => {
      await this.initPromise;
      await AsyncStorage.removeItem(key);
      if (this.isLatestKeyMutation(key, mutation)) this.cache.delete(key);
    }, `remove ${key}`);
  }

  deleteAsync(key: string): Promise<void> {
    const mutation = this.beginKeyMutation(key);
    return this.enqueue(async () => {
      await this.initPromise;
      await AsyncStorage.removeItem(key);
      if (this.isLatestKeyMutation(key, mutation)) this.cache.delete(key);
    });
  }

  clearAll() {
    const epoch = ++this.clearEpoch;
    const revision = ++this.revision;
    this.cache.clear();
    this.enqueueLegacy(async () => {
      await this.initPromise;
      await AsyncStorage.clear();
      if (this.clearEpoch === epoch && this.revision === revision) this.cache.clear();
    }, 'clear all keys');
  }

  clearAllAsync(): Promise<void> {
    const epoch = ++this.clearEpoch;
    const revision = ++this.revision;
    const cacheSnapshot = this.snapshotCacheRevisions();
    return this.enqueue(async () => {
      await this.initPromise;
      await AsyncStorage.clear();
      if (this.clearEpoch === epoch && this.revision === revision) this.cache.clear();
      else this.clearUnchangedCacheEntries(cacheSnapshot);
    });
  }

  contains(key: string) {
    return this.cache.has(key);
  }
}
