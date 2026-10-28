import type { LaunchPlan, VergerEvent, VergerSnapshot } from '@repo/core/verger';
import {
  appendDevelopmentTelemetry,
  type DevelopmentTelemetryEventCount,
  type DevelopmentTelemetryQuery,
  type DevelopmentTelemetryRecord,
  type DevelopmentTelemetryRow,
  type DevelopmentTelemetrySession,
  type DevelopmentTelemetrySourceStatus,
  deleteDevelopmentTelemetrySession as deleteDevelopmentTelemetrySessionFromDatabase,
  listDevelopmentTelemetryEventCounts,
  listDevelopmentTelemetrySessions,
  listDevelopmentTelemetrySources,
  queryDevelopmentTelemetry,
  type SafeObject,
  type SafeValue,
  writeDevelopmentTelemetrySource,
} from './developmentTelemetryDatabase';
import {
  type DevelopmentTraceSource,
  parsePerfettoTraceJson,
  parseReactNativeDevToolsTrace,
} from './reactNativeDevToolsTrace';

type LocalTelemetryEvent = {
  source: 'analytics' | 'runtime' | 'verger' | 'performance' | 'network' | 'devtools';
  name: string;
  attributes: Record<string, unknown>;
  timestampMs?: number;
  wallTimeMs?: number;
};

const MAX_SESSION_BYTES = 32 * 1024 * 1024;
const MAX_PENDING_RECORDS = 4096;
const session = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const pending: string[] = [];
const status = {
  session,
  state: 'idle' as 'idle' | 'recording' | 'capped' | 'error',
  uri: null as string | null,
  written: 0,
  dropped: 0,
  bytes: 0,
  error: null as string | null,
  databaseState: 'idle' as 'idle' | 'recording' | 'error',
  databaseError: null as string | null,
  databaseDropped: 0,
  databaseWritten: 0,
  databaseInFlight: 0,
};
const pendingRecords: DevelopmentTelemetryRecord[] = [];
let sequence = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let writing: Promise<void> | null = null;
let statusDirty = false;
let files: Promise<{
  append: (text: string) => Promise<number>;
  saveStatus: () => Promise<void>;
}> | null = null;
let fileUnavailable = false;

const SENSITIVE_KEYS =
  /(?:email|password|token|secret|authorization|cookie|payload|body|message|content|text|query|param|user|student|school|classroom|account|principal|response|header)/i;
const SAFE_CORRELATION_KEYS = new Set(['trace_session_id', 'interaction_id']);

function safeValue(key: string, value: unknown, depth = 0): SafeValue | undefined {
  const normalized = key.toLowerCase();
  if (
    SENSITIVE_KEYS.test(normalized) ||
    (normalized.endsWith('_id') && !SAFE_CORRELATION_KEYS.has(normalized))
  )
    return undefined;
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    if (value.length > 120 || /@|https?:\/\/|bearer\s/i.test(value)) return undefined;
    return /^[\w./:-]*$/.test(value) ? value : undefined;
  }
  if (depth >= 3) return undefined;
  if (Array.isArray(value)) {
    return value.slice(0, 32).flatMap((item) => {
      const safe = safeValue(key, item, depth + 1);
      return safe === undefined ? [] : [safe];
    });
  }
  if (typeof value === 'object') {
    const safe: Record<string, SafeValue> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const filtered = safeValue(childKey, childValue, depth + 1);
      if (filtered !== undefined && /^[A-Za-z][\w.-]{0,63}$/.test(childKey))
        safe[childKey] = filtered;
    }
    return safe;
  }
  return undefined;
}

function safeAttributes(attributes: Record<string, unknown>): Readonly<Record<string, SafeValue>> {
  const safe = safeValue('attributes', attributes);
  return isSafeObject(safe) ? safe : {};
}

function isSafeObject(value: SafeValue | undefined): value is SafeObject {
  return (
    value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value)
  );
}

export function recordDevelopmentVergerEvent(event: VergerEvent): void {
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event)) attributes[key] = value;
  saveDevelopmentTelemetry({
    source: 'verger',
    name: event.type,
    attributes,
    timestampMs: event.at,
  });
}

function safeVergerReason(reason: string): Record<string, string | number | boolean> | null {
  const frame =
    /^frames over budget for (\d{1,15}) ms(?:, (ui|render|gpu|delay)-bound)?(?:: (not relieved by levers|reducing is switched off|nothing left to lower|\d{1,15} steps, sized by measured gains))?$/.exec(
      reason,
    );
  if (frame)
    return {
      kind: 'frame-budget',
      duration_ms: Number(frame[1]),
      ...(frame[2] ? { bound: frame[2] } : {}),
      unrelieved: frame[3] === 'not relieved by levers',
      ...(frame[3] ? { detail: frame[3].replaceAll(' ', '_').replaceAll(',', '') } : {}),
    };
  const thread =
    /^(JS|main) thread saturated \((\d{1,15}\.\d{1,15}) cores(?:, (\d{1,15}) long tasks)?\)(?:: (not relieved by levers, needs a code fix|reducing is switched off|nothing left to lower))?$/.exec(
      reason,
    );
  if (thread)
    return {
      kind: 'thread-saturated',
      thread: thread[1]?.toLowerCase() ?? 'unknown',
      cores: Number(thread[2]),
      ...(thread[3] ? { long_tasks: Number(thread[3]) } : {}),
      ...(thread[4] ? { detail: thread[4].replaceAll(' ', '_').replaceAll(',', '') } : {}),
    };
  return null;
}

/** A published change tied to the input that triggered this reduction, not a causal outcome. */
export function recordDevelopmentVergerTransition(
  event: VergerEvent,
  before: VergerSnapshot,
  after: VergerSnapshot,
): void {
  const reason = safeVergerReason(after.lastReason);
  saveDevelopmentTelemetry({
    source: 'verger',
    name: 'snapshot-transition',
    timestampMs: event.at,
    wallTimeMs: Date.now() - (performance.now() - event.at),
    attributes: {
      input_type: event.type,
      input: event,
      before_version: before.version,
      after_version: after.version,
      mode: after.mode,
      action: after.lastAction,
      levels: after.levels,
      proposed_levels: after.proposedLevels,
      prior_levels: before.levels,
      reason_recorded: reason !== null,
      reason_changed: before.lastReason !== after.lastReason,
      ...(reason ? { reason } : {}),
      wall_clock_basis: 'estimated-from-observation',
    },
  });
}

/** Records the recovery ladder's actual result, rather than the requested build mode. */
export function recordDevelopmentVergerLaunch(plan: LaunchPlan): void {
  if (!__DEV__) return;
  saveDevelopmentTelemetry({
    source: 'runtime',
    name: 'verger-launch-plan',
    attributes: { runtime: plan.runtime, rung: plan.rung, reason: plan.reason },
  });
  setDevelopmentTelemetrySource(
    'verger-inputs',
    plan.runtime === 'off' ? 'disabled' : 'recording',
    `Resolved runtime: ${plan.runtime}; rung: ${plan.rung}; reason: ${plan.reason}.`,
  );
}

/** Imports a user-selected DevTools export as its own trace-clock session. */
export async function importReactNativeDevToolsTrace(
  fileName: string,
  content: string,
): Promise<{ readonly session: string; readonly eventCount: number }> {
  return importDevelopmentTrace(
    fileName,
    content,
    parseReactNativeDevToolsTrace,
    'rn-devtools-trace',
  );
}

/** Imports Perfetto's Chrome JSON conversion as a trace-clock session. */
export async function importPerfettoTraceJson(
  fileName: string,
  content: string,
): Promise<{ readonly session: string; readonly eventCount: number }> {
  return importDevelopmentTrace(fileName, content, parsePerfettoTraceJson, 'perfetto-trace-json');
}

/** Backfills stopped JSONL journals created before SQLite capture was available. */
export async function backfillDevelopmentTelemetryJournals(): Promise<{
  readonly sessions: number;
  readonly events: number;
  readonly skipped: number;
}> {
  if (!__DEV__)
    throw new Error('Development telemetry backfill is available only in development builds.');
  await flushDevelopmentTelemetry();
  const { Directory, File, Paths } = await import('expo-file-system');
  const directory = new Directory(Paths.document, 'dev-telemetry');
  const journals = directory
    .list()
    .filter(
      (entry): entry is InstanceType<typeof File> =>
        entry instanceof File && entry.name.endsWith('.jsonl'),
    );
  let importedSessions = 0;
  let importedEvents = 0;
  let skipped = 0;
  for (const journal of journals) {
    const match = /^([A-Za-z0-9_-]{1,100})\.jsonl$/.exec(journal.name);
    const journalSession = match?.[1];
    if (
      !journalSession ||
      journalSession === session ||
      journal.size === null ||
      journal.size > MAX_SESSION_BYTES
    ) {
      skipped += 1;
      continue;
    }
    const records: DevelopmentTelemetryRecord[] = [];
    let rejectedLines = 0;
    for (const line of (await journal.text()).split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const candidate: unknown = JSON.parse(line);
        const record = normalizeJournalRecord(candidate, journalSession);
        if (record) records.push(record);
        else rejectedLines += 1;
      } catch {
        rejectedLines += 1;
      }
    }
    for (let offset = 0; offset < records.length; offset += 500) {
      await appendDevelopmentTelemetry(records.slice(offset, offset + 500));
    }
    await writeDevelopmentTelemetrySource(journalSession, {
      source: 'jsonl-journal',
      state: rejectedLines > 0 ? 'failed' : 'complete',
      details: `Backfilled ${records.length} validated event(s); rejected ${rejectedLines} malformed or invalid line(s).`,
      updated_at_ms: performance.now(),
    });
    importedSessions += 1;
    importedEvents += records.length;
  }
  return { sessions: importedSessions, events: importedEvents, skipped };
}

function normalizeJournalRecord(
  value: unknown,
  expectedSession: string,
): DevelopmentTelemetryRecord | null {
  if (!isRecord(value)) return null;
  const {
    schema,
    session: recordSession,
    sequence: recordSequence,
    at_ms,
    wall_time_ms,
    source,
    name,
    attributes,
  } = value;
  if (
    schema !== 1 ||
    recordSession !== expectedSession ||
    typeof recordSequence !== 'number' ||
    !Number.isSafeInteger(recordSequence) ||
    typeof at_ms !== 'number' ||
    !Number.isFinite(at_ms) ||
    typeof wall_time_ms !== 'number' ||
    !Number.isFinite(wall_time_ms) ||
    typeof source !== 'string' ||
    source.length > 120 ||
    typeof name !== 'string' ||
    name.length > 120 ||
    !isRecord(attributes)
  )
    return null;
  return {
    schema: 1,
    session: expectedSession,
    sequence: recordSequence,
    at_ms,
    wall_time_ms,
    source,
    name,
    attributes: safeAttributes(attributes),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function importDevelopmentTrace(
  fileName: string,
  content: string,
  parse: typeof parseReactNativeDevToolsTrace,
  source: DevelopmentTraceSource,
): Promise<{ readonly session: string; readonly eventCount: number }> {
  if (!__DEV__)
    throw new Error('Development trace import is available only in development builds.');
  const importedAtMs = Date.now();
  const traceSession = `trace-${importedAtMs.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const records = parse(content, traceSession, importedAtMs);
  await appendDevelopmentTelemetry(records);
  await writeDevelopmentTelemetrySource(traceSession, {
    source,
    state: 'complete',
    details: `Imported ${records.length} trace row(s) from ${fileName.slice(0, 120)}. Timestamps use the artifact clock and are not aligned to live app sessions.`,
    updated_at_ms: performance.now(),
  });
  return { session: traceSession, eventCount: records.length };
}

/** Removes a stopped development session and its optional local JSONL sidecars. */
export async function deleteDevelopmentTelemetrySession(requestedSession: string): Promise<void> {
  if (!__DEV__)
    throw new Error('Development telemetry deletion is available only in development builds.');
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(requestedSession)) {
    throw new Error('The selected diagnostics session has an invalid identifier.');
  }
  if (requestedSession === session) {
    throw new Error('The active session cannot be deleted while its recorder is running.');
  }

  await deleteDevelopmentTelemetrySessionFromDatabase(requestedSession);
  const { Directory, File, Paths } = await import('expo-file-system');
  const directory = new Directory(Paths.document, 'dev-telemetry');
  for (const suffix of ['.jsonl', '.status.json']) {
    const file = new File(directory, `${requestedSession}${suffix}`);
    if (file.exists) file.delete();
  }
}

async function openFiles() {
  const { Directory, File, Paths } = await import('expo-file-system');
  const directory = new Directory(Paths.document, 'dev-telemetry');
  directory.create({ idempotent: true, intermediates: true });
  const file = new File(directory, `${session}.jsonl`);
  const manifest = new File(directory, `${session}.status.json`);
  file.create();
  manifest.create();
  status.uri = file.uri;
  status.state = 'recording';
  console.info(`[local-telemetry] ${file.uri}`);
  return {
    append: async (text: string) => {
      await file.write(text, { append: true });
      return file.size;
    },
    saveStatus: async () => {
      await manifest.write(JSON.stringify({ ...status, pending: pending.length }));
    },
  };
}

/** Resolves after queued records reach the app's document directory; status discloses IO failure. */
export function flushDevelopmentTelemetry(): Promise<void> {
  if (!__DEV__) return Promise.resolve();
  if (timer !== null) clearTimeout(timer);
  timer = null;
  if (writing) return writing.then(flushDevelopmentTelemetry);
  if (pending.length === 0 && !statusDirty) return Promise.resolve();
  const batch = pending.splice(0, 128);
  const recordBatch = pendingRecords.splice(0, batch.length);
  status.databaseInFlight += recordBatch.length;
  statusDirty = false;
  const previouslyWritten = status.written;
  const write = (async () => {
    try {
      if (fileUnavailable) {
        status.dropped += batch.length;
        return;
      }
      const output = await (files ??= openFiles());
      if (status.state === 'capped') {
        status.dropped += batch.length;
      } else if (batch.length > 0) {
        status.bytes = await output.append(batch.join(''));
        status.written += batch.length;
        if (status.bytes >= MAX_SESSION_BYTES) status.state = 'capped';
      }
      await output.saveStatus();
    } catch {
      fileUnavailable = true;
      status.state = 'error';
      status.error = 'Local telemetry write failed; inspect device storage and file access.';
      if (status.written === previouslyWritten) status.dropped += batch.length;
      console.warn('[local-telemetry] Local capture failed; records are not confirmed on disk.');
    }
  })();
  const persistDatabase = async () => {
    if (recordBatch.length === 0) return;
    try {
      await appendDevelopmentTelemetry(recordBatch);
      status.databaseWritten += recordBatch.length;
      status.databaseState = 'recording';
      status.databaseError = null;
    } catch {
      status.databaseState = 'error';
      status.databaseError = 'SQLite diagnostic write failed; the JSONL journal remains available.';
      status.databaseDropped += recordBatch.length;
      console.warn('[local-telemetry] SQLite write failed; queryable capture is incomplete.');
    } finally {
      status.databaseInFlight -= recordBatch.length;
      statusDirty = true;
      scheduleFlush();
    }
  };
  writing = Promise.all([write, persistDatabase()])
    .then(() => undefined)
    .finally(() => {
      writing = null;
    });
  return writing.then(() => {
    if (pending.length > 0 || statusDirty) return flushDevelopmentTelemetry();
  });
}

function scheduleFlush() {
  if (timer === null)
    timer = setTimeout(() => {
      void flushDevelopmentTelemetry();
    }, 100);
}

export function saveDevelopmentTelemetry(event: LocalTelemetryEvent): void {
  if (!__DEV__) return;
  if (pending.length >= MAX_PENDING_RECORDS) {
    status.dropped += 1;
    if (status.state !== 'error') {
      statusDirty = true;
      scheduleFlush();
    }
    return;
  }
  const at = performance.now();
  try {
    const record: DevelopmentTelemetryRecord = {
      schema: 1,
      session,
      sequence: ++sequence,
      at_ms:
        typeof event.timestampMs === 'number' && Number.isFinite(event.timestampMs)
          ? event.timestampMs
          : at,
      wall_time_ms:
        typeof event.wallTimeMs === 'number' && Number.isFinite(event.wallTimeMs)
          ? event.wallTimeMs
          : Date.now(),
      source: event.source,
      name: event.name.slice(0, 120),
      attributes: safeAttributes(event.attributes),
    };
    const line = `${JSON.stringify(record)}\n`;
    pending.push(line);
    pendingRecords.push(record);
  } catch {
    status.dropped += 1;
    status.error = 'A telemetry record could not be serialized.';
    statusDirty = true;
    console.warn('[local-telemetry] A record could not be serialized; omission counted.');
  }
  scheduleFlush();
}

export const getDevelopmentTelemetryStatus = () => ({ ...status, pending: pending.length });

export function setDevelopmentTelemetrySource(
  source: string,
  state: DevelopmentTelemetrySourceStatus['state'],
  details = '',
): void {
  if (!__DEV__) return;
  void writeDevelopmentTelemetrySource(session, {
    source,
    state,
    details: details.slice(0, 240),
    updated_at_ms: performance.now(),
  }).catch(() => {
    status.databaseState = 'error';
    status.databaseError = 'Could not save source completeness metadata.';
  });
}

export async function getDevelopmentTelemetrySessions(): Promise<DevelopmentTelemetrySession[]> {
  if (!__DEV__) return [];
  return listDevelopmentTelemetrySessions();
}

export async function queryDevelopmentTelemetrySession(
  requestedSession: string,
  query: DevelopmentTelemetryQuery = {},
): Promise<DevelopmentTelemetryRow[]> {
  if (!__DEV__) return [];
  return queryDevelopmentTelemetry(requestedSession, query);
}

export async function getDevelopmentTelemetrySources(
  requestedSession: string,
): Promise<DevelopmentTelemetrySourceStatus[]> {
  if (!__DEV__) return [];
  return listDevelopmentTelemetrySources(requestedSession);
}

export async function getDevelopmentTelemetryEventCounts(
  requestedSession: string,
): Promise<DevelopmentTelemetryEventCount[]> {
  if (!__DEV__) return [];
  return listDevelopmentTelemetryEventCounts(requestedSession);
}

export async function getCurrentDevelopmentTelemetryBundle() {
  await flushDevelopmentTelemetry();
  const [sessions, events, sources] = await Promise.all([
    getDevelopmentTelemetrySessions(),
    queryDevelopmentTelemetrySession(session),
    getDevelopmentTelemetrySources(session),
  ]);
  return { session, sessions, events, sources, status: getDevelopmentTelemetryStatus() };
}

/** Explicit export reads the persisted file, so a debugger or lab can verify disk contents. */
export async function exportDevelopmentTelemetry() {
  await flushDevelopmentTelemetry();
  if (status.uri === null) return { status: getDevelopmentTelemetryStatus(), records: '' };
  const { File } = await import('expo-file-system');
  return { status: getDevelopmentTelemetryStatus(), records: await new File(status.uri).text() };
}

declare global {
  var __GURUDEVI_DEV_TELEMETRY__:
    | {
        status: typeof getDevelopmentTelemetryStatus;
        flush: typeof flushDevelopmentTelemetry;
        export: typeof exportDevelopmentTelemetry;
        sessions: typeof getDevelopmentTelemetrySessions;
        query: typeof queryDevelopmentTelemetrySession;
        sources: typeof getDevelopmentTelemetrySources;
        bundle: typeof getCurrentDevelopmentTelemetryBundle;
        setSource: typeof setDevelopmentTelemetrySource;
        ingest: typeof saveDevelopmentTelemetry;
        importTrace: typeof importReactNativeDevToolsTrace;
        importPerfettoTraceJson: typeof importPerfettoTraceJson;
        deleteSession: typeof deleteDevelopmentTelemetrySession;
        backfill: typeof backfillDevelopmentTelemetryJournals;
      }
    | undefined;
}

if (__DEV__) {
  globalThis.__GURUDEVI_DEV_TELEMETRY__ = {
    status: getDevelopmentTelemetryStatus,
    flush: flushDevelopmentTelemetry,
    export: exportDevelopmentTelemetry,
    sessions: getDevelopmentTelemetrySessions,
    query: queryDevelopmentTelemetrySession,
    sources: getDevelopmentTelemetrySources,
    bundle: getCurrentDevelopmentTelemetryBundle,
    setSource: setDevelopmentTelemetrySource,
    ingest: saveDevelopmentTelemetry,
    importTrace: importReactNativeDevToolsTrace,
    importPerfettoTraceJson,
    deleteSession: deleteDevelopmentTelemetrySession,
    backfill: backfillDevelopmentTelemetryJournals,
  };
}
