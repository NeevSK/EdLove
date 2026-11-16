import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';

const rowSchema = z.object({ data: z.string() });
export function withStore<T>(databasePath: string, operation: (db: DatabaseSync) => T): T {
  mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });
  const db = new DatabaseSync(databasePath);
  try {
    db.exec(
      'PRAGMA busy_timeout = 3000; CREATE TABLE IF NOT EXISTS changes (id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (change_id TEXT NOT NULL, action_id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(change_id, action_id));',
    );
    return operation(db);
  } finally {
    db.close();
  }
}
export function transaction<T>(db: DatabaseSync, operation: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = operation();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
export function readChange(db: DatabaseSync, id: string): unknown {
  const row = db.prepare('SELECT data FROM changes WHERE id = ?').get(id);
  if (!row) throw new Error('change_not_found');
  return JSON.parse(rowSchema.parse(row).data);
}
export function readAllChanges(db: DatabaseSync): unknown[] {
  return db
    .prepare('SELECT data FROM changes ORDER BY rowid ASC')
    .all()
    .map((row) => JSON.parse(rowSchema.parse(row).data));
}
export function readEvents(db: DatabaseSync, id: string): unknown[] {
  return db
    .prepare('SELECT data FROM events WHERE change_id = ? ORDER BY rowid')
    .all(id)
    .map((row) => JSON.parse(rowSchema.parse(row).data));
}
