import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ROOT_DIR } from '../utils/constants.js';

export interface DeviceProfileStoreInput {
  databasePath?: string;
  captureId: string;
  capturedAt: string;
  label: string;
  profileName: string;
  deviceAlias: string;
  appId: string;
  buildKind: string;
  status: string;
  model: string | null;
  sdk: number | null;
  soc: string | null;
  totalMemoryKb: number | null;
  availableMemoryKb: number | null;
  appPssKb: number | null;
  appRssKb: number | null;
  metricsJson: string;
  manifestJson: string;
  outputs: Record<string, string | null>;
}

export interface DeviceProfileTraceEvent {
  capture_id: string;
  trace_session_id: string | null;
  trace_session_started: boolean;
  trace_event_index: number;
  at_ms: number;
  category: string;
  task: string | null;
  state: string | null;
  outcome: string | null;
  duration_ms: number | null;
  wall_time_ms: number | null;
  time_origin_ms: number | null;
  event_json: string;
}

const MAX_TRACE_EVENTS_PER_CAPTURE = 65_536;
const TRACE_CATEGORIES = new Set([
  'essential-stage',
  'startup-task',
  'governor-overhead',
  'runtime-pressure',
  'admission',
  'optional-queue',
  'outbox',
  'route-transition',
  'interaction',
]);
const TRACE_STRING_FIELDS = [
  'task',
  'state',
  'outcome',
  'source',
  'memory',
  'thermal',
  'phase',
  'app_state',
  'operation',
  'event_name',
  'pressure',
  'pressure_bucket',
  'reason',
] as const;
const TRACE_NUMERIC_FIELDS = [
  'duration_ms',
  'processing_duration_ms',
  'input_delay_ms',
  'processing_ms',
  'presentation_delay_ms',
  'queue_depth',
  'queue_wait_ms',
  'trace_event_index',
  'wall_time_ms',
  'time_origin_ms',
  'interaction_id',
  'previous_trace_write_call_ms',
  'cumulative_trace_write_call_ms',
  'optional_cap',
] as const;
const TRACE_BOOLEAN_FIELDS = ['capacity_known', 'battery_saver', 'allowed'] as const;

/** Projects only fixed runtime trace fields; raw logcat remains available as an output. */
export function parseDeviceProfileTraceEvents(
  logcat: string,
  captureId: string,
): DeviceProfileTraceEvent[] {
  const events: DeviceProfileTraceEvent[] = [];
  for (const line of logcat.split(/\r?\n/)) {
    if (events.length >= MAX_TRACE_EVENTS_PER_CAPTURE) break;
    const marker = line.indexOf('[runtime-trace] ');
    if (marker < 0) continue;
    try {
      const parsed: unknown = JSON.parse(line.slice(marker + '[runtime-trace] '.length));
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) continue;
      const value = parsed as Record<string, unknown>;
      if (
        typeof value.at_ms !== 'number' ||
        !Number.isFinite(value.at_ms) ||
        value.at_ms < 0 ||
        typeof value.trace_event_index !== 'number' ||
        !Number.isSafeInteger(value.trace_event_index) ||
        value.trace_event_index < 1 ||
        typeof value.category !== 'string' ||
        !TRACE_CATEGORIES.has(value.category) ||
        (value.wall_time_ms !== undefined &&
          (typeof value.wall_time_ms !== 'number' || !Number.isFinite(value.wall_time_ms)))
      )
        continue;
      const projected: Record<string, string | number | boolean> = {
        at_ms: value.at_ms,
        trace_event_index: value.trace_event_index,
        category: value.category,
      };
      if (
        typeof value.trace_session_id === 'string' &&
        /^[a-zA-Z0-9-]{1,64}$/.test(value.trace_session_id)
      )
        projected.trace_session_id = value.trace_session_id;
      if (value.trace_session_started === true) projected.trace_session_started = true;
      for (const field of TRACE_STRING_FIELDS) {
        const item = value[field];
        if (typeof item === 'string' && /^[a-zA-Z0-9._-]{1,80}$/.test(item))
          projected[field] = item;
      }
      for (const field of TRACE_NUMERIC_FIELDS) {
        const item = value[field];
        if (
          field !== 'trace_event_index' &&
          typeof item === 'number' &&
          Number.isFinite(item) &&
          item >= 0
        ) {
          projected[field] = item;
        }
      }
      for (const field of TRACE_BOOLEAN_FIELDS) {
        const item = value[field];
        if (typeof item === 'boolean') projected[field] = item;
      }
      events.push({
        capture_id: captureId,
        trace_session_id:
          typeof projected.trace_session_id === 'string' ? projected.trace_session_id : null,
        trace_session_started: projected.trace_session_started === true,
        trace_event_index: value.trace_event_index,
        at_ms: value.at_ms,
        category: value.category,
        task: typeof projected.task === 'string' ? projected.task : null,
        state: typeof projected.state === 'string' ? projected.state : null,
        outcome: typeof projected.outcome === 'string' ? projected.outcome : null,
        duration_ms: typeof projected.duration_ms === 'number' ? projected.duration_ms : null,
        wall_time_ms: typeof projected.wall_time_ms === 'number' ? projected.wall_time_ms : null,
        time_origin_ms:
          typeof projected.time_origin_ms === 'number' ? projected.time_origin_ms : null,
        event_json: JSON.stringify(projected),
      });
    } catch {
      // Logcat can contain partial or unrelated console lines; keep the raw output only.
    }
  }
  return events;
}

export const DEVICE_PROFILE_DATABASE_PATH = path.join(
  ROOT_DIR,
  'reports',
  'mobile-performance',
  'device-profiles.sqlite',
);

function initialize(database: DatabaseSync): void {
  const priorVersion = Number(
    (database.prepare('PRAGMA user_version').get() as { user_version?: number } | undefined)
      ?.user_version ?? 0,
  );
  database.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS device_profile_captures (
      capture_id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      scenario_label TEXT NOT NULL,
      profile_name TEXT NOT NULL,
      device_alias TEXT NOT NULL,
      model TEXT,
      android_sdk INTEGER,
      soc TEXT,
      app_id TEXT NOT NULL,
      build_kind TEXT NOT NULL,
      status TEXT NOT NULL,
      system_total_memory_kb INTEGER,
      system_available_memory_kb INTEGER,
      app_pss_kb INTEGER,
      app_rss_kb INTEGER,
      metrics_json TEXT NOT NULL,
      manifest_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_device_profile_captures_compare
      ON device_profile_captures(app_id, scenario_label, profile_name, device_alias, captured_at);
    CREATE TABLE IF NOT EXISTS device_profile_outputs (
      capture_id TEXT NOT NULL REFERENCES device_profile_captures(capture_id) ON DELETE CASCADE,
      output_name TEXT NOT NULL,
      output_text TEXT NOT NULL,
      byte_length INTEGER NOT NULL,
      sha256 TEXT NOT NULL,
      PRIMARY KEY (capture_id, output_name)
    );
    CREATE TABLE IF NOT EXISTS device_profile_trace_events (
      capture_id TEXT NOT NULL REFERENCES device_profile_captures(capture_id) ON DELETE CASCADE,
      trace_session_id TEXT,
      trace_session_started INTEGER NOT NULL DEFAULT 0,
      trace_event_index INTEGER NOT NULL,
      at_ms REAL NOT NULL,
      category TEXT NOT NULL,
      task TEXT,
      state TEXT,
      outcome TEXT,
      duration_ms REAL,
      wall_time_ms REAL,
      time_origin_ms REAL,
      event_json TEXT NOT NULL,
      PRIMARY KEY (capture_id, trace_session_id, trace_event_index)
    );
    CREATE INDEX IF NOT EXISTS idx_device_profile_trace_category
      ON device_profile_trace_events(capture_id, category, trace_event_index);
    CREATE VIEW IF NOT EXISTS device_profile_comparison AS
      SELECT app_id, scenario_label, profile_name, device_alias, model, android_sdk,
        build_kind, COUNT(*) AS capture_count,
        AVG(app_pss_kb) AS mean_app_pss_kb,
        MIN(app_pss_kb) AS min_app_pss_kb,
        MAX(app_pss_kb) AS max_app_pss_kb,
        AVG(app_rss_kb) AS mean_app_rss_kb,
        AVG(system_available_memory_kb) AS mean_system_available_memory_kb,
        MIN(captured_at) AS first_capture_at,
        MAX(captured_at) AS last_capture_at
      FROM device_profile_captures
      WHERE status IN ('complete', 'partial')
      GROUP BY app_id, scenario_label, profile_name, device_alias, model, android_sdk, build_kind;
  `);
  const traceColumns = database.prepare('PRAGMA table_info(device_profile_trace_events)').all();
  const columnNames = new Set(traceColumns.map((column) => String(column.name)));
  if (!columnNames.has('trace_session_id')) {
    database.exec('ALTER TABLE device_profile_trace_events ADD COLUMN trace_session_id TEXT');
  }
  if (!columnNames.has('trace_session_started')) {
    database.exec(
      'ALTER TABLE device_profile_trace_events ADD COLUMN trace_session_started INTEGER NOT NULL DEFAULT 0',
    );
  }
  if (!columnNames.has('wall_time_ms')) {
    database.exec('ALTER TABLE device_profile_trace_events ADD COLUMN wall_time_ms REAL');
  }
  if (!columnNames.has('time_origin_ms')) {
    database.exec('ALTER TABLE device_profile_trace_events ADD COLUMN time_origin_ms REAL');
  }
  if (priorVersion < 5) {
    database.exec('BEGIN IMMEDIATE');
    try {
      database.exec(`
        CREATE TABLE device_profile_trace_events_v5 (
          capture_id TEXT NOT NULL REFERENCES device_profile_captures(capture_id) ON DELETE CASCADE,
          trace_session_id TEXT,
          trace_session_started INTEGER NOT NULL DEFAULT 0,
          trace_event_index INTEGER NOT NULL,
          at_ms REAL NOT NULL,
          category TEXT NOT NULL,
          task TEXT,
          state TEXT,
          outcome TEXT,
          duration_ms REAL,
          wall_time_ms REAL,
          time_origin_ms REAL,
          event_json TEXT NOT NULL,
          PRIMARY KEY (capture_id, trace_session_id, trace_event_index)
        );
        INSERT OR IGNORE INTO device_profile_trace_events_v5
          SELECT capture_id, trace_session_id, trace_session_started, trace_event_index,
            at_ms, category, task, state, outcome, duration_ms, wall_time_ms,
            time_origin_ms, event_json
          FROM device_profile_trace_events;
        DROP TABLE device_profile_trace_events;
        ALTER TABLE device_profile_trace_events_v5 RENAME TO device_profile_trace_events;
      `);
      const logcatRows = database
        .prepare(
          `SELECT capture_id, output_text FROM device_profile_outputs
           WHERE output_name = 'logcat'`,
        )
        .all() as Array<{ capture_id: string; output_text: string }>;
      const insertTrace = database.prepare(
        `INSERT OR REPLACE INTO device_profile_trace_events
         (capture_id, trace_session_id, trace_session_started, trace_event_index, at_ms,
          category, task, state, outcome, duration_ms, wall_time_ms, time_origin_ms, event_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const row of logcatRows) {
        for (const event of parseDeviceProfileTraceEvents(row.output_text, row.capture_id)) {
          insertTrace.run(
            event.capture_id,
            event.trace_session_id,
            event.trace_session_started ? 1 : 0,
            event.trace_event_index,
            event.at_ms,
            event.category,
            event.task,
            event.state,
            event.outcome,
            event.duration_ms,
            event.wall_time_ms,
            event.time_origin_ms,
            event.event_json,
          );
        }
      }
      database.exec('PRAGMA user_version = 5');
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }
  if (priorVersion < 7) {
    const logcatRows = database.prepare(
      `SELECT capture_id, output_text FROM device_profile_outputs
       WHERE output_name = 'logcat'`,
    );
    const insertTrace = database.prepare(
      `INSERT OR REPLACE INTO device_profile_trace_events
       (capture_id, trace_session_id, trace_session_started, trace_event_index, at_ms,
        category, task, state, outcome, duration_ms, wall_time_ms, time_origin_ms, event_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const row of logcatRows.iterate() as Iterable<{
      capture_id: string;
      output_text: string;
    }>) {
      for (const event of parseDeviceProfileTraceEvents(row.output_text, row.capture_id)) {
        insertTrace.run(
          event.capture_id,
          event.trace_session_id,
          event.trace_session_started ? 1 : 0,
          event.trace_event_index,
          event.at_ms,
          event.category,
          event.task,
          event.state,
          event.outcome,
          event.duration_ms,
          event.wall_time_ms,
          event.time_origin_ms,
          event.event_json,
        );
      }
    }
    database.exec('PRAGMA user_version = 7');
  }
  database.exec(`CREATE INDEX IF NOT EXISTS idx_device_profile_trace_category
    ON device_profile_trace_events(capture_id, category, trace_event_index)`);
}

export async function storeDeviceProfileCapture(input: DeviceProfileStoreInput): Promise<string> {
  const databasePath = input.databasePath ?? DEVICE_PROFILE_DATABASE_PATH;
  await fs.mkdir(path.dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  try {
    initialize(database);
    database.exec('BEGIN IMMEDIATE');
    try {
      database
        .prepare(
          `INSERT INTO device_profile_captures (
            capture_id, captured_at, scenario_label, profile_name, device_alias, model,
            android_sdk, soc, app_id, build_kind, status, system_total_memory_kb,
            system_available_memory_kb, app_pss_kb, app_rss_kb, metrics_json, manifest_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          input.captureId,
          input.capturedAt,
          input.label,
          input.profileName,
          input.deviceAlias,
          input.model,
          input.sdk,
          input.soc,
          input.appId,
          input.buildKind,
          input.status,
          input.totalMemoryKb,
          input.availableMemoryKb,
          input.appPssKb,
          input.appRssKb,
          input.metricsJson,
          input.manifestJson,
        );
      const insertOutput = database.prepare(
        `INSERT INTO device_profile_outputs (capture_id, output_name, output_text, byte_length, sha256)
         VALUES (?, ?, ?, ?, ?)`,
      );
      for (const [name, output] of Object.entries(input.outputs)) {
        if (output === null) continue;
        const byteLength = Buffer.byteLength(output, 'utf8');
        const digest = createHash('sha256').update(output).digest('hex');
        insertOutput.run(input.captureId, name, output, byteLength, digest);
      }
      const logcat = input.outputs.logcat;
      if (logcat !== null && logcat !== undefined) {
        const insertTrace = database.prepare(
          `INSERT OR IGNORE INTO device_profile_trace_events
           (capture_id, trace_session_id, trace_session_started, trace_event_index, at_ms, category, task, state, outcome, duration_ms, wall_time_ms, time_origin_ms, event_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        );
        for (const event of parseDeviceProfileTraceEvents(logcat, input.captureId)) {
          insertTrace.run(
            event.capture_id,
            event.trace_session_id,
            event.trace_session_started ? 1 : 0,
            event.trace_event_index,
            event.at_ms,
            event.category,
            event.task,
            event.state,
            event.outcome,
            event.duration_ms,
            event.wall_time_ms,
            event.time_origin_ms,
            event.event_json,
          );
        }
      }
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  } finally {
    database.close();
  }
  return databasePath;
}

export function listDeviceProfileCaptures(limit = 50, databasePath = DEVICE_PROFILE_DATABASE_PATH) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error('limit must be an integer from 1 through 500.');
  }
  let database: DatabaseSync;
  if (!existsSync(databasePath)) return [];
  try {
    database = new DatabaseSync(databasePath, { readOnly: true });
  } catch (error) {
    throw error;
  }
  try {
    return database
      .prepare(
        `SELECT capture_id, captured_at, scenario_label, profile_name, device_alias, model,
          android_sdk, soc, app_id, build_kind, status, app_pss_kb, app_rss_kb,
          system_available_memory_kb
         FROM device_profile_captures ORDER BY captured_at DESC LIMIT ?`,
      )
      .all(limit);
  } finally {
    database.close();
  }
}

export function listDeviceProfileComparisons(databasePath = DEVICE_PROFILE_DATABASE_PATH) {
  if (!existsSync(databasePath)) return [];
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    return database
      .prepare(
        'SELECT * FROM device_profile_comparison ORDER BY app_id, scenario_label, profile_name, device_alias',
      )
      .all();
  } finally {
    database.close();
  }
}

export function listDeviceProfileTraceEvents(
  captureId: string,
  limit = 5000,
  databasePath = DEVICE_PROFILE_DATABASE_PATH,
): DeviceProfileTraceEvent[] {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_TRACE_EVENTS_PER_CAPTURE) {
    throw new Error(`limit must be an integer from 1 through ${MAX_TRACE_EVENTS_PER_CAPTURE}.`);
  }
  if (!existsSync(databasePath)) return [];
  const database = new DatabaseSync(databasePath);
  try {
    initialize(database);
    const rows = database
      .prepare(
        `SELECT capture_id, trace_session_id, trace_session_started, trace_event_index, at_ms, category, task, state, outcome, duration_ms, wall_time_ms, time_origin_ms, event_json
       FROM device_profile_trace_events WHERE capture_id = ?
       ORDER BY wall_time_ms, trace_event_index, trace_session_id LIMIT ?`,
      )
      .all(captureId, limit);
    return rows.map((row) => ({
      capture_id: String(row.capture_id),
      trace_session_id: typeof row.trace_session_id === 'string' ? row.trace_session_id : null,
      trace_session_started: row.trace_session_started === 1,
      trace_event_index: Number(row.trace_event_index),
      at_ms: Number(row.at_ms),
      category: String(row.category),
      task: typeof row.task === 'string' ? row.task : null,
      state: typeof row.state === 'string' ? row.state : null,
      outcome: typeof row.outcome === 'string' ? row.outcome : null,
      duration_ms: typeof row.duration_ms === 'number' ? row.duration_ms : null,
      wall_time_ms: typeof row.wall_time_ms === 'number' ? row.wall_time_ms : null,
      time_origin_ms: typeof row.time_origin_ms === 'number' ? row.time_origin_ms : null,
      event_json: String(row.event_json),
    }));
  } finally {
    database.close();
  }
}
