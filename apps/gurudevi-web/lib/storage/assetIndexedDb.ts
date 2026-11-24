import {
  type AssetCachePolicy,
  type CachedAssetMeta,
  DEFAULT_ASSET_CACHE_POLICY,
  selectEvictions,
  webCryptoSha256,
} from '@repo/library/content';

const DB_NAME = 'SanctuaryAssetStoreDB';
const DB_VERSION = 1;
const PENDING_STORE = 'pending_uploads';
const CACHE_STORE = 'cached_packs';

export interface PendingUploadRecord {
  readonly assetId: string;
  readonly sha256: string;
  readonly name: string;
  readonly mime: string;
  readonly bytes: number;
  readonly blob: Blob;
  readonly createdAt: number;
}

export interface CachedPackRecord {
  readonly key: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly mime: string;
  readonly blob: Blob;
  readonly lastAccessedAt: number;
  readonly pinned?: boolean;
}

function openAssetDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is unavailable in this environment'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: 'assetId' });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open asset database'));
  });
}

function txRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

export async function hashBlobSha256(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return webCryptoSha256(bytes);
}

export async function putPendingUpload(record: PendingUploadRecord): Promise<void> {
  const db = await openAssetDb();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  await txRequest(tx.objectStore(PENDING_STORE).put(record));
}

export async function getPendingUpload(assetId: string): Promise<PendingUploadRecord | undefined> {
  const db = await openAssetDb();
  const tx = db.transaction(PENDING_STORE, 'readonly');
  return txRequest<PendingUploadRecord | undefined>(tx.objectStore(PENDING_STORE).get(assetId));
}

export async function removePendingUpload(assetId: string): Promise<void> {
  const db = await openAssetDb();
  const tx = db.transaction(PENDING_STORE, 'readwrite');
  await txRequest(tx.objectStore(PENDING_STORE).delete(assetId));
}

export async function getCachedPackEntry(key: string): Promise<CachedPackRecord | undefined> {
  const db = await openAssetDb();
  const tx = db.transaction(CACHE_STORE, 'readwrite');
  const store = tx.objectStore(CACHE_STORE);
  const existing = await txRequest<CachedPackRecord | undefined>(store.get(key));
  if (existing) {
    await txRequest(store.put({ ...existing, lastAccessedAt: Date.now() }));
  }
  return existing;
}

export async function getCachedBlobBySha256(sha256: string): Promise<CachedPackRecord | undefined> {
  const db = await openAssetDb();
  const tx = db.transaction(CACHE_STORE, 'readonly');
  const all = await txRequest<CachedPackRecord[]>(tx.objectStore(CACHE_STORE).getAll());
  return all.find((r) => r.sha256.toLowerCase() === sha256.toLowerCase());
}

export async function listCachedPackMeta(): Promise<readonly CachedAssetMeta[]> {
  const db = await openAssetDb();
  const tx = db.transaction(CACHE_STORE, 'readonly');
  const all = await txRequest<CachedPackRecord[]>(tx.objectStore(CACHE_STORE).getAll());
  return all.map((r) => ({
    key: r.key,
    bytes: r.bytes,
    lastAccessedAt: r.lastAccessedAt,
    pinned: r.pinned,
  }));
}

export async function putCachedPackEntry(
  record: CachedPackRecord,
  policy: AssetCachePolicy = DEFAULT_ASSET_CACHE_POLICY,
): Promise<void> {
  const existing = await listCachedPackMeta();
  const evictions = selectEvictions(
    existing.filter((e) => e.key !== record.key),
    record.bytes,
    policy,
  );

  const db = await openAssetDb();
  const tx = db.transaction(CACHE_STORE, 'readwrite');
  const store = tx.objectStore(CACHE_STORE);
  for (const key of evictions) {
    await txRequest(store.delete(key));
  }
  await txRequest(store.put(record));
}

export async function removeCachedPackEntry(key: string): Promise<void> {
  const db = await openAssetDb();
  const tx = db.transaction(CACHE_STORE, 'readwrite');
  await txRequest(tx.objectStore(CACHE_STORE).delete(key));
}
