import * as SQLite from 'expo-sqlite';

const DB_NAME = 'gurudevi_library.db';

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
 * Knowledge Database Manager
 * Handles local SQLite operations for high-performance search and discovery.
 */
export const knowledgeDB = {
  db: null as SQLite.SQLiteDatabase | null,

  /**
   * Initialize the database and create tables if they don't exist.
   */
  async init() {
    try {
      if (!this.db) {
        this.db = await SQLite.openDatabaseAsync(DB_NAME);
      }

      // Enable WAL mode for performance
      await this.db.execAsync('PRAGMA journal_mode = WAL;');

      // Create Main Index Table
      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS knowledge_index (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    content_type TEXT,
                    title_si TEXT,
                    title_ta TEXT,
                    title_en TEXT,
                    tags TEXT,
                    map_x REAL,
                    map_y REAL,
                    latitude REAL,
                    longitude REAL,
                    parent_id TEXT,
                    island_id TEXT,
                    updated_at INTEGER,
                    is_favourite INTEGER DEFAULT 0
                );
            `);

      // Create FTS5 Search Table
      await this.db.execAsync(`
                CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search_fts USING fts5(
                    id UNINDEXED,
                    title_si,
                    title_ta,
                    title_en,
                    tags,
                    content='knowledge_index',
                    content_rowid='rowid'
                );
            `);

      // Create Map Layers Index Table
      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS map_layers_index (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    category TEXT,
                    is_geographic INTEGER,
                    updated_at INTEGER
                );
            `);

      // Triggers for FTS consistency
      await this.db.execAsync(`
                CREATE TRIGGER IF NOT EXISTS knowledge_index_ai AFTER INSERT ON knowledge_index BEGIN
                    INSERT INTO knowledge_search_fts(rowid, id, title_si, title_ta, title_en, tags)
                    VALUES (new.rowid, new.id, new.title_si, new.title_ta, new.title_en, new.tags);
                END;

                CREATE TRIGGER IF NOT EXISTS knowledge_index_ad AFTER DELETE ON knowledge_index BEGIN
                    INSERT INTO knowledge_search_fts(knowledge_search_fts, rowid, id, title_si, title_ta, title_en, tags)
                    VALUES('delete', old.rowid, old.id, old.title_si, old.title_ta, old.title_en, old.tags);
                END;

                CREATE TRIGGER IF NOT EXISTS knowledge_index_au AFTER UPDATE ON knowledge_index BEGIN
                    INSERT INTO knowledge_search_fts(knowledge_search_fts, rowid, id, title_si, title_ta, title_en, tags)
                    VALUES('delete', old.rowid, old.id, old.title_si, old.title_ta, old.title_en, old.tags);
                    INSERT INTO knowledge_search_fts(rowid, id, title_si, title_ta, title_en, tags)
                    VALUES (new.rowid, new.id, new.title_si, new.title_ta, new.title_en, new.tags);
                END;
            `);

      // Sync State Table
      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS sync_state (
                    key TEXT PRIMARY KEY,
                    last_sync_timestamp INTEGER,
                    sync_status TEXT
                );
            `);

      console.log('Knowledge DB Initialized Successfully');
    } catch (error) {
      console.error('Failed to initialize Knowledge DB:', error);
    }
  },

  /**
   * Search the local knowledge index using FTS5.
   */
  async search(query: string, limit: number = 20): Promise<string[]> {
    if (!this.db) return [];

    try {
      // Sanitize query for FTS5 (basic)
      const sanitizedQuery = query.replace(/['"]/g, '');
      if (!sanitizedQuery) return [];

      const results = (await this.db.getAllAsync(
        `SELECT id FROM knowledge_search_fts WHERE knowledge_search_fts MATCH ? LIMIT ?`,
        [`${sanitizedQuery}*`, limit],
      )) as { id: string }[];

      return results.map((r) => r.id);
    } catch (error) {
      console.error('Local search failed:', error);
      return [];
    }
  },

  /**
   * Bulk upsert nodes into the index.
   */
  async upsertNodes(nodes: KnowledgeNodeIndex[]) {
    if (!this.db) return;

    try {
      // Use a transaction for bulk insert
      await this.db.withTransactionAsync(async () => {
        const statement = await this.db!.prepareAsync(
          `INSERT OR REPLACE INTO knowledge_index 
                    (id, type, content_type, title_si, title_ta, title_en, tags, map_x, map_y, latitude, longitude, parent_id, island_id, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        );

        try {
          for (const node of nodes) {
            await statement.executeAsync([
              node.id,
              node.type,
              node.content_type,
              node.title_si,
              node.title_ta,
              node.title_en,
              node.tags,
              node.map_x,
              node.map_y,
              node.latitude,
              node.longitude,
              node.parent_id,
              node.island_id,
              node.updated_at,
            ]);
          }
        } finally {
          await statement.finalizeAsync();
        }
      });
    } catch (error) {
      console.error('Failed to upsert nodes:', error);
    }
  },

  /**
   * Get nodes by IDs from the local index.
   */
  async getNodesByIds(ids: string[]): Promise<KnowledgeNodeIndex[]> {
    if (!this.db || ids.length === 0) return [];

    try {
      const placeholders = ids.map(() => '?').join(',');
      const results = (await this.db.getAllAsync(
        `SELECT * FROM knowledge_index WHERE id IN (${placeholders})`,
        ids,
      )) as KnowledgeNodeIndex[];
      return results;
    } catch (error) {
      console.error('Failed to get nodes by IDs:', error);
      return [];
    }
  },

  /**
   * Bulk upsert layers into the index.
   */
  async upsertLayers(
    layers: {
      id: string;
      name: string;
      category: string | null;
      is_geographic: boolean;
      updated_at: number;
    }[],
  ) {
    if (!this.db) return;

    try {
      await this.db.withTransactionAsync(async () => {
        const statement = await this.db!.prepareAsync(
          `INSERT OR REPLACE INTO map_layers_index 
                    (id, name, category, is_geographic, updated_at) 
                    VALUES (?, ?, ?, ?, ?)`,
        );

        try {
          for (const layer of layers) {
            await statement.executeAsync([
              layer.id,
              layer.name,
              layer.category,
              layer.is_geographic ? 1 : 0,
              layer.updated_at,
            ]);
          }
        } finally {
          await statement.finalizeAsync();
        }
      });
    } catch (error) {
      console.error('Failed to upsert layers:', error);
    }
  },

  /**
   * Convenience wrapper: get the first row from a SQL query.
   * Delegates to the underlying SQLite database instance.
   */
  async getFirstAsync<T>(query: string, params: (string | number | null)[]): Promise<T | null> {
    if (!this.db) return null;
    try {
      const db = this.db as SQLite.SQLiteDatabase & {
        getFirstAsync: <Row>(
          sql: string,
          bindParams?: SQLite.SQLiteBindParams,
        ) => Promise<Row | null>;
      };
      return await db.getFirstAsync<T>(query, params);
    } catch (error) {
      console.error('getFirstAsync failed:', error);
      return null;
    }
  },

  /**
   * Convenience wrapper: execute a SQL statement.
   * Delegates to the underlying SQLite database instance.
   */
  async runAsync(query: string, params: (string | number | null)[]): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.runAsync(query, params);
    } catch (error) {
      console.error('runAsync failed:', error);
    }
  },
};
