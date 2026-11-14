import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

export interface DevelopmentTelemetryRecord {
  readonly schema: number;
  readonly session: string;
  readonly sequence: number;
  readonly at_ms: number;
  readonly wall_time_ms: number;
  readonly source: string;
  readonly name: string;
  readonly attributes: Readonly<Record<string, SafeValue>>;
}

export interface SafeObject {
  readonly [key: string]: SafeValue;
}

export type SafeValue = string | number | boolean | null | readonly SafeValue[] | SafeObject;

export type DevelopmentTelemetryRow = Omit<DevelopmentTelemetryRecord, 'attributes'> & {
  readonly attributes_json: string;
};

export interface DevelopmentTelemetrySession {
  readonly session: string;
  readonly first_at_ms: number;
  readonly last_at_ms: number;
  readonly event_count: number;
  readonly sources: string;
  readonly metadata_json: string;
}

export interface DevelopmentTelemetrySessionManifest {
  readonly captureMode: 'development-local-detail';
  readonly startedAtMs: number;
  readonly timeOriginMs: number;
  readonly platform?: string;
  readonly appVersion?: string | null;
  readonly nativeBuildVersion?: string | null;
  readonly expoSdkVersion?: string | null;
  readonly reactNativeVersion?: string;
  readonly deviceModel?: string | null;
  readonly osVersion?: string | null;
  readonly vergerMode?: string;
  readonly vergerPolicy?: string;
  /** Expo Observe's pseudonymous install id, the key that joins this session to its dashboards. */
  readonly easClientId?: string | null;
}

export interface DevelopmentTelemetryArtifact {
  readonly artifact_id: string;
  readonly session: string;
  readonly source: string;
  readonly file_name: string;
  readonly uri: string;
  readonly media_type: string;
  readonly byte_count: number;
  readonly sha256: string | null;
  readonly tool: string;
  readonly imported_at_ms: number;
}

export interface DevelopmentTelemetryEventCount {
  readonly source: string;
  readonly event_count: number;
  readonly first_at_ms: number;
  readonly last_at_ms: number;
}

export interface DevelopmentTelemetrySourceStatus {
  readonly source: string;
  readonly state: 'recording' | 'unsupported' | 'disabled' | 'complete' | 'capped' | 'failed';
  readonly details: string;
  readonly updated_at_ms: number;
}

export interface DevelopmentTelemetryQuery {
  readonly limit?: number;
  readonly beforeAtMs?: number;
  readonly afterAtMs?: number;
  readonly before?: { readonly atMs: number; readonly sequence: number };
  readonly source?: string;
  readonly name?: string;
  readonly attributeKey?: string;
  readonly attributeEquals?: string | number | boolean | null;
}

const DATABASE_NAME = 'gurudevi-development-telemetry.db';
const MAX_QUERY_ROWS = 10_000;
let databasePromise: Promise<SQLiteDatabase> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function database(): Promise<SQLiteDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = (async () => {
    const SQLite = await import('expo-sqlite');
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if (version && version.user_version > 2) {
      throw new Error(`Unsupported diagnostics database version ${version.user_version}.`);
    }
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS diagnostic_sessions (
        session TEXT PRIMARY KEY NOT NULL,
        first_at_ms REAL NOT NULL,
        last_at_ms REAL NOT NULL,
        event_count INTEGER NOT NULL DEFAULT 0,
        state TEXT NOT NULL DEFAULT 'recording'
      );
      CREATE INDEX IF NOT EXISTS diagnostic_sessions_recent
        ON diagnostic_sessions(last_at_ms DESC);
      CREATE TABLE IF NOT EXISTS diagnostic_events (
        session TEXT NOT NULL REFERENCES diagnostic_sessions(session) ON DELETE CASCADE,
        sequence INTEGER NOT NULL,
        at_ms REAL NOT NULL,
        wall_time_ms REAL NOT NULL,
        source TEXT NOT NULL,
        name TEXT NOT NULL,
        attributes_json TEXT NOT NULL,
        PRIMARY KEY(session, sequence)
      );
      CREATE INDEX IF NOT EXISTS diagnostic_events_timeline
        ON diagnostic_events(session, at_ms, sequence);
      CREATE INDEX IF NOT EXISTS diagnostic_events_source
        ON diagnostic_events(session, source, name, sequence);
      CREATE TABLE IF NOT EXISTS diagnostic_sources (
        session TEXT NOT NULL REFERENCES diagnostic_sessions(session) ON DELETE CASCADE,
        source TEXT NOT NULL,
        state TEXT NOT NULL,
        details TEXT NOT NULL DEFAULT '',
        updated_at_ms REAL NOT NULL,
        PRIMARY KEY(session, source)
      );
    `);
    if (!version || version.user_version < 1) {
      await db.execAsync('PRAGMA user_version = 1');
    }
    if (!version || version.user_version < 2) {
      await db.execAsync(`
        ALTER TABLE diagnostic_sessions
          ADD COLUMN metadata_json TEXT NOT NULL DEFAULT '{}';
        CREATE TABLE IF NOT EXISTS diagnostic_artifacts (
          artifact_id TEXT PRIMARY KEY NOT NULL,
          session TEXT NOT NULL REFERENCES diagnostic_sessions(session) ON DELETE CASCADE,
          source TEXT NOT NULL,
          file_name TEXT NOT NULL,
          uri TEXT NOT NULL,
          media_type TEXT NOT NULL,
          byte_count INTEGER NOT NULL,
          sha256 TEXT,
          tool TEXT NOT NULL,
          imported_at_ms REAL NOT NULL
        );
        CREATE INDEX IF NOT EXISTS diagnostic_artifacts_session
          ON diagnostic_artifacts(session, imported_at_ms);
        PRAGMA user_version = 2;
      `);
    }
    return db;
  })().catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

/** Persists one event batch and its session index in the same SQLite transaction. */
export async function appendDevelopmentTelemetry(
  records: readonly DevelopmentTelemetryRecord[],
): Promise<void> {
  if (records.length === 0) return;
  return serializeWrite(async () => {
    const db = await database();
    await db.withTransactionAsync(async () => {
      const firstAtMs = Math.min(...records.map((record) => record.at_ms));
      const lastAtMs = Math.max(...records.map((record) => record.at_ms));
      const session = records[0]?.session;
      if (!session) return;
      await db.runAsync(
        `INSERT OR IGNORE INTO diagnostic_sessions(session, first_at_ms, last_at_ms, event_count)
         VALUES (?, ?, ?, 0)`,
        [session, firstAtMs, lastAtMs],
      );
      for (let offset = 0; offset < records.length; offset += 100) {
        const batch = records.slice(offset, offset + 100);
        const values = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        const parameters: SQLiteBindValue[] = [];
        for (const record of batch) {
          parameters.push(
            record.session,
            record.sequence,
            record.at_ms,
            record.wall_time_ms,
            record.source,
            record.name,
            JSON.stringify(record.attributes),
          );
        }
        await db.runAsync(
          `INSERT OR IGNORE INTO diagnostic_events
           (session, sequence, at_ms, wall_time_ms, source, name, attributes_json)
           VALUES ${values}`,
          parameters,
        );
      }
      await db.runAsync(
        `UPDATE diagnostic_sessions
         SET first_at_ms = MIN(first_at_ms, ?), last_at_ms = MAX(last_at_ms, ?),
             event_count = (SELECT COUNT(*) FROM diagnostic_events WHERE session = ?)
         WHERE session = ?`,
        [firstAtMs, lastAtMs, session, session],
      );
    });
  });
}

export async function writeDevelopmentTelemetrySource(
  session: string,
  value: DevelopmentTelemetrySourceStatus,
): Promise<void> {
  return serializeWrite(async () => {
    const db = await database();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR IGNORE INTO diagnostic_sessions(session, first_at_ms, last_at_ms, event_count)
         VALUES (?, ?, ?, 0)`,
        [session, value.updated_at_ms, value.updated_at_ms],
      );
      await db.runAsync(
        `INSERT INTO diagnostic_sources(session, source, state, details, updated_at_ms)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(session, source) DO UPDATE SET
           state = excluded.state, details = excluded.details, updated_at_ms = excluded.updated_at_ms`,
        [session, value.source, value.state, value.details, value.updated_at_ms],
      );
    });
  });
}

export async function listDevelopmentTelemetrySessions(
  limit = 100,
): Promise<DevelopmentTelemetrySession[]> {
  const db = await database();
  return db.getAllAsync<DevelopmentTelemetrySession>(
    `SELECT s.session, s.first_at_ms, s.last_at_ms, s.event_count, s.metadata_json,
       COALESCE((SELECT group_concat(source, ', ') FROM
         (SELECT DISTINCT source FROM diagnostic_events e WHERE e.session = s.session)), '') AS sources
     FROM diagnostic_sessions s ORDER BY s.last_at_ms DESC LIMIT ?`,
    [Math.max(1, Math.min(limit, 100))],
  );
}

export async function writeDevelopmentTelemetrySessionManifest(
  session: string,
  manifest: DevelopmentTelemetrySessionManifest,
): Promise<void> {
  return serializeWrite(async () => {
    const db = await database();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR IGNORE INTO diagnostic_sessions(session, first_at_ms, last_at_ms, event_count)
         VALUES (?, ?, ?, 0)`,
        [session, manifest.startedAtMs, manifest.startedAtMs],
      );
      await db.runAsync('UPDATE diagnostic_sessions SET metadata_json = ? WHERE session = ?', [
        JSON.stringify(manifest),
        session,
      ]);
    });
  });
}

export async function listDevelopmentTelemetryArtifacts(
  session: string,
): Promise<DevelopmentTelemetryArtifact[]> {
  const db = await database();
  return db.getAllAsync<DevelopmentTelemetryArtifact>(
    `SELECT artifact_id, session, source, file_name, uri, media_type, byte_count,
       sha256, tool, imported_at_ms
     FROM diagnostic_artifacts WHERE session = ? ORDER BY imported_at_ms`,
    [session],
  );
}

export async function addDevelopmentTelemetryArtifact(
  artifact: DevelopmentTelemetryArtifact,
): Promise<void> {
  return serializeWrite(async () => {
    const db = await database();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR IGNORE INTO diagnostic_sessions(session, first_at_ms, last_at_ms, event_count)
         VALUES (?, ?, ?, 0)`,
        [artifact.session, artifact.imported_at_ms, artifact.imported_at_ms],
      );
      await db.runAsync(
        `INSERT INTO diagnostic_artifacts
         (artifact_id, session, source, file_name, uri, media_type, byte_count, sha256, tool, imported_at_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          artifact.artifact_id,
          artifact.session,
          artifact.source,
          artifact.file_name,
          artifact.uri,
          artifact.media_type,
          artifact.byte_count,
          artifact.sha256,
          artifact.tool,
          artifact.imported_at_ms,
        ],
      );
    });
  });
}

export async function queryDevelopmentTelemetry(
  session: string,
  query: DevelopmentTelemetryQuery = {},
): Promise<DevelopmentTelemetryRow[]> {
  const db = await database();
  const clauses = ['session = ?'];
  const parameters: SQLiteBindValue[] = [session];
  if (query.afterAtMs !== undefined) {
    clauses.push('at_ms >= ?');
    parameters.push(query.afterAtMs);
  }
  if (query.beforeAtMs !== undefined) {
    clauses.push('at_ms <= ?');
    parameters.push(query.beforeAtMs);
  }
  if (query.before) {
    clauses.push('(at_ms < ? OR (at_ms = ? AND sequence < ?))');
    parameters.push(query.before.atMs, query.before.atMs, query.before.sequence);
  }
  if (query.source) {
    clauses.push('source = ?');
    parameters.push(query.source);
  }
  if (query.name) {
    clauses.push('instr(lower(name), lower(?)) > 0');
    parameters.push(query.name.slice(0, 120));
  }
  if (query.attributeKey && /^[A-Za-z][\w.-]{0,63}$/.test(query.attributeKey)) {
    clauses.push('json_extract(attributes_json, ?) IS ?');
    parameters.push(`$.${query.attributeKey}`);
    parameters.push(
      typeof query.attributeEquals === 'boolean'
        ? Number(query.attributeEquals)
        : (query.attributeEquals ?? null),
    );
  }
  const limit = Math.max(1, Math.min(query.limit ?? 2000, MAX_QUERY_ROWS));
  return db.getAllAsync<DevelopmentTelemetryRow>(
    `SELECT session, sequence, at_ms, wall_time_ms, source, name, attributes_json
     FROM diagnostic_events WHERE ${clauses.join(' AND ')} ORDER BY at_ms DESC, sequence DESC LIMIT ?`,
    [...parameters, limit],
  );
}

export async function listDevelopmentTelemetrySources(
  session: string,
): Promise<DevelopmentTelemetrySourceStatus[]> {
  const db = await database();
  const rows = await db.getAllAsync<{
    source: string;
    state: DevelopmentTelemetrySourceStatus['state'];
    details: string;
    updated_at_ms: number;
  }>(
    `SELECT source, state, details, updated_at_ms FROM diagnostic_sources
     WHERE session = ? ORDER BY source`,
    [session],
  );
  return rows;
}

/** Returns session-wide persisted event totals, independent of timeline pagination or filters. */
export async function listDevelopmentTelemetryEventCounts(
  session: string,
): Promise<DevelopmentTelemetryEventCount[]> {
  const db = await database();
  return db.getAllAsync<DevelopmentTelemetryEventCount>(
    `SELECT source, COUNT(*) AS event_count, MIN(at_ms) AS first_at_ms, MAX(at_ms) AS last_at_ms
     FROM diagnostic_events WHERE session = ? GROUP BY source ORDER BY source`,
    [session],
  );
}

/** Removes one explicitly selected session from the query database. */
export async function deleteDevelopmentTelemetrySession(session: string): Promise<void> {
  return serializeWrite(async () => {
    const db = await database();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM diagnostic_events WHERE session = ?', [session]);
      await db.runAsync('DELETE FROM diagnostic_sources WHERE session = ?', [session]);
      await db.runAsync('DELETE FROM diagnostic_artifacts WHERE session = ?', [session]);
      await db.runAsync('DELETE FROM diagnostic_sessions WHERE session = ?', [session]);
    });
  });
}
