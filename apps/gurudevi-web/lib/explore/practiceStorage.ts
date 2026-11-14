import type { LocalOnlyKeyValueStorage } from '@repo/core/logic/ports/storage';

export type BrowserPracticeStorage = LocalOnlyKeyValueStorage & Readonly<{ kind: 'indexed-db' }>;

export class BrowserPracticeStorageError extends Error {
  constructor(
    readonly code: 'unavailable' | 'read-failed' | 'write-failed' | 'remove-failed',
    message: string,
  ) {
    super(message);
    this.name = 'BrowserPracticeStorageError';
  }
}

const databaseName = 'gurudevi-safe-try';
const storeName = 'documents';

function indexedDbFactory(): IDBFactory {
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new BrowserPracticeStorageError(
      'unavailable',
      'Safe Try requires browser storage. Allow site data in this browser and try again.',
    );
  }
  return window.indexedDB;
}

function requestResult<T>(request: IDBRequest<T>, code: BrowserPracticeStorageError['code']) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new BrowserPracticeStorageError(
          code,
          code === 'read-failed'
            ? 'Safe Try data could not be read from this browser. It was not removed.'
            : code === 'remove-failed'
              ? 'Safe Try data could not be discarded from this browser. Try again.'
              : 'Safe Try data could not be saved in this browser. Free storage and retry.',
        ),
      );
  });
}

function transactionComplete(
  transaction: IDBTransaction,
  code: BrowserPracticeStorageError['code'],
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () =>
      reject(
        new BrowserPracticeStorageError(
          code,
          code === 'remove-failed'
            ? 'Safe Try data could not be discarded from this browser. Try again.'
            : 'Safe Try data could not be saved in this browser. Free storage and retry.',
        ),
      );
  });
}

function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDbFactory().open(databaseName, 1);
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName))
        request.result.createObjectStore(storeName);
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(
        new BrowserPracticeStorageError(
          'unavailable',
          'Safe Try requires browser storage. Allow site data in this browser and try again.',
        ),
      );
  });
}

/**
 * Account Safe Try has no memory/localStorage fallback. IndexedDB offers the
 * required async, browser-native document boundary while remaining local-only.
 */
export function createRequiredBrowserPracticeStorage(): BrowserPracticeStorage {
  const database = openDatabase();
  return {
    kind: 'indexed-db',
    isolation: 'local-only',
    async getItem(key) {
      const db = await database;
      const transaction = db.transaction(storeName, 'readonly');
      const stored = await requestResult(
        transaction.objectStore(storeName).get(key),
        'read-failed',
      );
      if (typeof stored === 'string') return stored;
      // Read-only bridge for existing Safe Try records. New writes are never
      // sent to localStorage, and legacy records remain intact for recovery.
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      const db = await database;
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put(value, key);
      await transactionComplete(transaction, 'write-failed');
    },
    async removeItem(key) {
      const db = await database;
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).delete(key);
      await transactionComplete(transaction, 'remove-failed');
    },
  };
}
