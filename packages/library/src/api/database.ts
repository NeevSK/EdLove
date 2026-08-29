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

// P2 Reader Annotations
interface TextHighlightRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_range: string | null;
  pdf_page_index: number | null;
  pdf_rects: string | null; // JSON
  pdf_text: string | null;
  color: string;
  created_at: number;
  updated_at: number;
}

interface TextNoteRow {
  id: string;
  resource_id: string;
  user_id: string;
  highlight_id: string | null;
  cfi_position: string | null;
  pdf_page_index: number | null;
  pdf_x: number | null;
  pdf_y: number | null;
  content: string;
  is_private: number;
  tags: string | null; // JSON
  created_at: number;
  updated_at: number;
}

interface ReadingProgressRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_progress: string | null;
  pdf_page_index: number | null;
  pdf_scroll_y: number | null;
  pdf_total_pages: number | null;
  time_spent_ms: number;
  completed_at: number | null;
  last_read_at: number;
}

interface BookmarkRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_position: string | null;
  pdf_page_index: number | null;
  pdf_scroll_y: number | null;
  title: string | null;
  note: string | null;
  created_at: number;
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

      // P2 Annotations Tables
      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS text_highlights (
                    id TEXT PRIMARY KEY,
                    resource_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    cfi_range TEXT,
                    pdf_page_index INTEGER,
                    pdf_rects TEXT,
                    pdf_text TEXT,
                    color TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
            `);

      await this.db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_text_highlights_resource_user
                    ON text_highlights (resource_id, user_id);
            `);

      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS text_notes (
                    id TEXT PRIMARY KEY,
                    resource_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    highlight_id TEXT,
                    cfi_position TEXT,
                    pdf_page_index INTEGER,
                    pdf_x REAL,
                    pdf_y REAL,
                    content TEXT NOT NULL,
                    is_private INTEGER DEFAULT 1,
                    tags TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
            `);

      await this.db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_text_notes_resource_user
                    ON text_notes (resource_id, user_id);
            `);

      await this.db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_text_notes_highlight
                    ON text_notes (highlight_id);
            `);

      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS reading_progress (
                    id TEXT PRIMARY KEY,
                    resource_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    cfi_progress TEXT,
                    pdf_page_index INTEGER,
                    pdf_scroll_y REAL,
                    pdf_total_pages INTEGER,
                    time_spent_ms INTEGER DEFAULT 0,
                    completed_at INTEGER,
                    last_read_at INTEGER NOT NULL
                );
            `);

      await this.db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_reading_progress_resource_user
                    ON reading_progress (resource_id, user_id);
            `);

      await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS bookmarks (
                    id TEXT PRIMARY KEY,
                    resource_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    cfi_position TEXT,
                    pdf_page_index INTEGER,
                    pdf_scroll_y REAL,
                    title TEXT,
                    note TEXT,
                    created_at INTEGER NOT NULL
                );
            `);

      await this.db.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_bookmarks_resource_user
                    ON bookmarks (resource_id, user_id);
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

  // ============================================================
  // P2 Reader Annotations
  // ============================================================

  // --- Text Highlights ---
  async createHighlight(
    highlight: Omit<TextHighlightRow, 'id' | 'created_at' | 'updated_at'> & { id: string },
  ): Promise<void> {
    if (!this.db) return;
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO text_highlights (id, resource_id, user_id, cfi_range, pdf_page_index, pdf_rects, pdf_text, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        highlight.id,
        highlight.resource_id,
        highlight.user_id,
        highlight.cfi_range,
        highlight.pdf_page_index,
        highlight.pdf_rects,
        highlight.pdf_text,
        highlight.color,
        now,
        now,
      ],
    );
  },

  async updateHighlight(
    id: string,
    updates: Partial<Omit<TextHighlightRow, 'id' | 'created_at'>>,
  ): Promise<void> {
    if (!this.db) return;
    const now = Date.now();
    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    if (updates.cfi_range !== undefined) {
      fields.push('cfi_range = ?');
      params.push(updates.cfi_range);
    }
    if (updates.pdf_page_index !== undefined) {
      fields.push('pdf_page_index = ?');
      params.push(updates.pdf_page_index);
    }
    if (updates.pdf_rects !== undefined) {
      fields.push('pdf_rects = ?');
      params.push(updates.pdf_rects);
    }
    if (updates.pdf_text !== undefined) {
      fields.push('pdf_text = ?');
      params.push(updates.pdf_text);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      params.push(updates.color);
    }
    if (fields.length === 0) return;
    fields.push('updated_at = ?');
    params.push(Date.now());
    params.push(id);
    await this.db.runAsync(`UPDATE text_highlights SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async deleteHighlight(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(`DELETE FROM text_highlights WHERE id = ?`, [id]);
  },

  async getHighlightsByResource(resourceId: string, userId: string): Promise<TextHighlightRow[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync(
      `SELECT * FROM text_highlights WHERE resource_id = ? AND user_id = ? ORDER BY created_at DESC`,
      [resourceId, userId],
    );
    return results as TextHighlightRow[];
  },

  async getHighlightsByIds(ids: string[]): Promise<TextHighlightRow[]> {
    if (!this.db || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const results = await this.db.getAllAsync(
      `SELECT * FROM text_highlights WHERE id IN (${placeholders})`,
      ids,
    );
    return results as TextHighlightRow[];
  },

  // --- Text Notes ---
  async createNote(
    note: Omit<TextNoteRow, 'id' | 'created_at' | 'updated_at'> & { id: string },
  ): Promise<void> {
    if (!this.db) return;
    const now = Date.now();
    await this.db.runAsync(
      `INSERT INTO text_notes (id, resource_id, user_id, highlight_id, cfi_position, pdf_page_index, pdf_x, pdf_y, content, is_private, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        note.id,
        note.resource_id,
        note.user_id,
        note.highlight_id,
        note.cfi_position,
        note.pdf_page_index,
        note.pdf_x,
        note.pdf_y,
        note.content,
        note.is_private ? 1 : 0,
        note.tags,
        now,
        now,
      ],
    );
  },

  async updateNote(
    id: string,
    updates: Partial<Omit<TextNoteRow, 'id' | 'created_at'>>,
  ): Promise<void> {
    if (!this.db) return;
    const now = Date.now();
    const fields: string[] = [];
    const params: (string | number | null)[] = [];
    if (updates.content !== undefined) {
      fields.push('content = ?');
      params.push(updates.content);
    }
    if (updates.is_private !== undefined) {
      fields.push('is_private = ?');
      params.push(updates.is_private ? 1 : 0);
    }
    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      params.push(updates.tags);
    }
    if (updates.pdf_page_index !== undefined) {
      fields.push('pdf_page_index = ?');
      params.push(updates.pdf_page_index);
    }
    if (updates.pdf_x !== undefined) {
      fields.push('pdf_x = ?');
      params.push(updates.pdf_x);
    }
    if (updates.pdf_y !== undefined) {
      fields.push('pdf_y = ?');
      params.push(updates.pdf_y);
    }
    if (updates.cfi_position !== undefined) {
      fields.push('cfi_position = ?');
      params.push(updates.cfi_position);
    }
    if (fields.length === 0) return;
    fields.push('updated_at = ?');
    params.push(Date.now());
    params.push(id);
    await this.db.runAsync(`UPDATE text_notes SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async deleteNote(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(`DELETE FROM text_notes WHERE id = ?`, [id]);
  },

  async getNotesByResource(resourceId: string, userId: string): Promise<TextNoteRow[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync(
      `SELECT * FROM text_notes WHERE resource_id = ? AND user_id = ? ORDER BY created_at DESC`,
      [resourceId, userId],
    );
    return results as TextNoteRow[];
  },

  async getNotesByHighlight(highlightId: string): Promise<TextNoteRow[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync(
      `SELECT * FROM text_notes WHERE highlight_id = ? ORDER BY created_at DESC`,
      [highlightId],
    );
    return results as TextNoteRow[];
  },

  // --- Reading Progress ---
  async upsertReadingProgress(
    progress: Omit<ReadingProgressRow, 'id'> & { id: string },
  ): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      `INSERT OR REPLACE INTO reading_progress (id, resource_id, user_id, cfi_progress, pdf_page_index, pdf_scroll_y, pdf_total_pages, time_spent_ms, completed_at, last_read_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        progress.id,
        progress.resource_id,
        progress.user_id,
        progress.cfi_progress,
        progress.pdf_page_index,
        progress.pdf_scroll_y,
        progress.pdf_total_pages,
        progress.time_spent_ms,
        progress.completed_at,
        progress.last_read_at,
      ],
    );
  },

  async getReadingProgress(resourceId: string, userId: string): Promise<ReadingProgressRow | null> {
    if (!this.db) return null;
    const result = await this.db.getFirstAsync(
      `SELECT * FROM reading_progress WHERE resource_id = ? AND user_id = ? LIMIT 1`,
      [resourceId, userId],
    );
    return result as ReadingProgressRow | null;
  },

  // --- Bookmarks ---
  async createBookmark(
    bookmark: Omit<BookmarkRow, 'id' | 'created_at'> & { id: string },
  ): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(
      `INSERT INTO bookmarks (id, resource_id, user_id, cfi_position, pdf_page_index, pdf_scroll_y, title, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookmark.id,
        bookmark.resource_id,
        bookmark.user_id,
        bookmark.cfi_position,
        bookmark.pdf_page_index,
        bookmark.pdf_scroll_y,
        bookmark.title,
        bookmark.note,
        Date.now(),
      ],
    );
  },

  async deleteBookmark(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.runAsync(`DELETE FROM bookmarks WHERE id = ?`, [id]);
  },

  async getBookmarksByResource(resourceId: string, userId: string): Promise<BookmarkRow[]> {
    if (!this.db) return [];
    const results = await this.db.getAllAsync(
      `SELECT * FROM bookmarks WHERE resource_id = ? AND user_id = ? ORDER BY created_at DESC`,
      [resourceId, userId],
    );
    return results as BookmarkRow[];
  },
};
