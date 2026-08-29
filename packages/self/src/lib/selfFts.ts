import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') return null;
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync('gurudevi_self_search.db');
  } catch {
    return null;
  }
  await db.execAsync('PRAGMA journal_mode=WAL;');
  await db.execAsync(`
    CREATE VIRTUAL TABLE IF NOT EXISTS wisdom_notes_fts USING fts5(
      id UNINDEXED,
      insight,
      tokenize='porter unicode61'
    );
  `);
  await db.execAsync(`
    CREATE VIRTUAL TABLE IF NOT EXISTS voice_journals_fts USING fts5(
      id UNINDEXED,
      duration_text,
      insight,
      tokenize='porter unicode61'
    );
  `);
  return db;
}

export async function indexWisdomNotes(notes: { id: string; insight: string }[]): Promise<void> {
  if (notes.length === 0) return;
  const d = await getDb();
  if (!d) return;
  // replace existing for these ids
  for (const n of notes) {
    try {
      await d.runAsync('DELETE FROM wisdom_notes_fts WHERE id = ?', [n.id]);
      await d.runAsync('INSERT INTO wisdom_notes_fts (id, insight) VALUES (?, ?)', [n.id, n.insight]);
    } catch {}
  }
}

export async function searchWisdomNotes(query: string, limit = 20): Promise<{ id: string; snippet: string }[]> {
  if (!query.trim()) return [];
  const d = await getDb();
  if (!d) return [];
  const sanitized = query.trim().replace(/"/g, '').replace(/\s+/g, ' ').split(' ').filter(Boolean).join(' OR ');
  // use snippet for highlight
  try {
    const rows = await d.getAllAsync<{ id: string; snippet: string }>(
      `SELECT id, snippet(wisdom_notes_fts, 1, '<b>', '</b>', '…', 12) as snippet FROM wisdom_notes_fts WHERE wisdom_notes_fts MATCH ? LIMIT ?`,
      [`${sanitized}*`, limit],
    );
    return rows ?? [];
  } catch {
    return [];
  }
}

export async function clearWisdomFts(): Promise<void> {
  const d = await getDb();
  if (!d) return;
  try {
    await d.execAsync('DELETE FROM wisdom_notes_fts;');
  } catch {}
}

export async function indexVoiceJournals(
  records: { id: string; duration_seconds: number; transcript?: string }[],
): Promise<void> {
  if (records.length === 0) return;
  const d = await getDb();
  if (!d) return;
  for (const r of records) {
    try {
      await d.runAsync('DELETE FROM voice_journals_fts WHERE id = ?', [r.id]);
      await d.runAsync('INSERT INTO voice_journals_fts (id, duration_text, insight) VALUES (?, ?, ?)', [
        r.id,
        `${r.duration_seconds}s voice`,
        r.transcript ?? '',
      ]);
    } catch {}
  }
}

export async function searchVoiceJournals(query: string, limit = 20): Promise<{ id: string; snippet: string }[]> {
  if (!query.trim()) return [];
  const d = await getDb();
  if (!d) return [];
  const sanitized = query.trim().replace(/"/g, '').split(' ').filter(Boolean).join(' OR ');
  try {
    const rows = await d.getAllAsync<{ id: string; snippet: string }>(
      `SELECT id, snippet(voice_journals_fts, 2, '<b>', '</b>', '…', 10) as snippet FROM voice_journals_fts WHERE voice_journals_fts MATCH ? LIMIT ?`,
      [`${sanitized}*`, limit],
    );
    return rows ?? [];
  } catch {
    return [];
  }
}

export async function initSelfFts(): Promise<void> {
  await getDb();
}
