// Knowledge Database Manager (Web — IndexedDB)

const DB_NAME = 'gurudevi_library';
const STORE_NAME = 'knowledge_index';
const SYNC_STORE = 'sync_state';
const DB_VERSION = 1;

export interface KnowledgeNodeIndex {
  id: string;
  type: string;
  content_type: string | null;
  title_si: string | null;
  title_ta: string | null;
  title_en: string | null;
  tags: string | null;
  map_x: number | null;
  map_y: number | null;
  latitude: number | null;
  longitude: number | null;
  parent_id: string | null;
  island_id: string | null;
  updated_at: number;
}

/**
 * Knowledge Database Manager (Web \u2014 IndexedDB)
 * High-fidelity un-shimming: Using browser-native standards for local state.
 */
export const knowledgeDB = {
  db: null as IDBDatabase | null,

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Main resource index
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('updated_at', 'updated_at', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          // Indexes for search
          store.createIndex('title_en', 'title_en', { unique: false });
          store.createIndex('title_si', 'title_si', { unique: false });
          store.createIndex('title_ta', 'title_ta', { unique: false });
        }

        // Sync state store
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          db.createObjectStore(SYNC_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('Knowledge IndexedDB Initialized');
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  },

  async search(query: string, limit: number = 20): Promise<string[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    const normalizedQuery = query.toLowerCase();

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const results: string[] = [];

      // Simple prefix search implementation using cursor (high-performance enough for library size)
      store.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < limit) {
          const node = cursor.value as KnowledgeNodeIndex;
          const match =
            node.title_en?.toLowerCase().includes(normalizedQuery) ||
            node.title_si?.toLowerCase().includes(normalizedQuery) ||
            node.title_ta?.toLowerCase().includes(normalizedQuery) ||
            node.tags?.toLowerCase().includes(normalizedQuery);

          if (match) {
            results.push(node.id);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  },

  async upsertNodes(nodes: KnowledgeNodeIndex[]) {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      nodes.forEach((node) => void store.put(node));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async getNodesByIds(ids: string[]): Promise<KnowledgeNodeIndex[]> {
    if (!this.db) await this.init();
    if (!this.db) return [];

    const results: KnowledgeNodeIndex[] = [];
    const transaction = this.db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    for (const id of ids) {
      const node = await new Promise<KnowledgeNodeIndex | null>((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
      if (node) results.push(node);
    }
    return results;
  },

  // Shim for compatibility with sync logic that uses SQLite methods
  async runAsync(query: string, params: any[]) {
    if (!this.db) await this.init();
    if (!this.db) return;
    if (query.includes('sync_state')) {
      const key = params[0] as string;
      // Two SQL variants are called by sync.ts:
      //   3-param: INSERT \u2026 (key, last_sync_timestamp, sync_status)
      //   2-param: INSERT \u2026 (key, sync_status)  \u2190 error path
      let record: Record<string, unknown>;
      if (query.includes('last_sync_timestamp')) {
        record = {
          key,
          last_sync_timestamp: params[1],
          sync_status: params[2] ?? 'idle',
        };
      } else {
        record = { key, sync_status: params[1] ?? 'error' };
      }
      return new Promise<void>((resolve, reject) => {
        const tx = this.db!.transaction([SYNC_STORE], 'readwrite');
        tx.objectStore(SYNC_STORE).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  },

  async getFirstAsync<T>(query: string, params: any[]): Promise<T | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;
    if (query.includes('sync_state')) {
      const [key] = params;
      return new Promise((resolve) => {
        const tx = this.db!.transaction([SYNC_STORE], 'readonly');
        const request = tx.objectStore(SYNC_STORE).get(key);
        request.onsuccess = () => resolve((request.result as T) ?? null);
        request.onerror = () => resolve(null);
      });
    }
    return null;
  },

  async upsertLayers(
    layers: {
      id: string;
      name: string;
      category: string | null;
      is_geographic: boolean;
      updated_at: number;
    }[],
  ) {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      layers.forEach(
        (layer) =>
          void store.put({
            id: layer.id,
            type: 'layer',
            content_type: layer.category,
            title_en: layer.name,
            title_si: null,
            title_ta: null,
            tags: null,
            map_x: null,
            map_y: null,
            latitude: null,
            longitude: null,
            parent_id: null,
            island_id: null,
            updated_at: layer.updated_at,
          }),
      );

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};
