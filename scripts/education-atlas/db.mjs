import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = resolve(__dirname, '../../data/education-atlas');
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = resolve(DATA_DIR, 'atlas_staging.db');

let _db = null;

export function getAtlasDb() {
  if (_db) return _db;

  _db = new DatabaseSync(DB_PATH);

  // Configure WAL and resilience pragmas
  _db.exec('PRAGMA journal_mode = WAL;');
  _db.exec('PRAGMA synchronous = FULL;');
  _db.exec('PRAGMA busy_timeout = 10000;');
  _db.exec('PRAGMA foreign_keys = ON;');

  // Apply schema
  const schemaPath = resolve(__dirname, 'schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf8');
  _db.exec(schemaSql);

  return _db;
}

export function closeAtlasDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
