import type {
  DevelopmentTelemetryRecord,
  SafeObject,
  SafeValue,
} from './developmentTelemetryDatabase';

export const MAX_DEVTOOLS_TRACE_BYTES = 32 * 1024 * 1024;
const MAX_TRACE_EVENTS = 50_000;

export type DevelopmentTraceSource = 'rn-devtools-trace' | 'perfetto-trace-json';

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSafeObject(value: SafeValue): value is SafeObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exceedsTraceByteLimit(content: string): boolean {
  let bytes = 0;
  for (let index = 0; index < content.length && bytes <= MAX_DEVTOOLS_TRACE_BYTES; index += 1) {
    const code = content.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      content.charCodeAt(index + 1) >= 0xdc00 &&
      content.charCodeAt(index + 1) <= 0xdfff
    ) {
      bytes += 4;
      index += 1;
    } else bytes += 3;
  }
  return bytes > MAX_DEVTOOLS_TRACE_BYTES;
}

function toSafeJsonValue(value: unknown): SafeValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(toSafeJsonValue);
  if (isObject(value)) {
    const result: Record<string, SafeValue> = {};
    for (const [key, child] of Object.entries(value)) {
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype')
        result[key] = toSafeJsonValue(child);
    }
    return result;
  }
  throw new Error('The selected trace contains a value that is not valid JSON.');
}

function asSafeObject(value: unknown): SafeObject {
  const safe = toSafeJsonValue(value);
  if (!isSafeObject(safe)) {
    throw new Error('The selected trace event must be a JSON object.');
  }
  return safe;
}

/** Converts an explicitly selected React Native DevTools trace into a separate, trace-clock session. */
export function parseReactNativeDevToolsTrace(
  content: string,
  session: string,
  importedAtMs: number,
): DevelopmentTelemetryRecord[] {
  return parseDevelopmentTrace(content, session, importedAtMs, 'rn-devtools-trace');
}

export function parsePerfettoTraceJson(
  content: string,
  session: string,
  importedAtMs: number,
): DevelopmentTelemetryRecord[] {
  return parseDevelopmentTrace(content, session, importedAtMs, 'perfetto-trace-json');
}

function parseDevelopmentTrace(
  content: string,
  session: string,
  importedAtMs: number,
  source: DevelopmentTraceSource,
): DevelopmentTelemetryRecord[] {
  if (exceedsTraceByteLimit(content)) {
    throw new Error(
      'The selected trace exceeds the 32 MiB import limit; split the capture and retry.',
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  const envelope = isObject(parsed) ? parsed : null;
  const traceEvents = Array.isArray(parsed)
    ? parsed
    : envelope && Array.isArray(envelope.traceEvents)
      ? envelope.traceEvents
      : null;
  if (traceEvents === null) {
    throw new Error('Expected a React Native DevTools trace array or a traceEvents array.');
  }
  if (traceEvents.length === 0) throw new Error('The selected trace contains no events.');
  if (traceEvents.length > MAX_TRACE_EVENTS) {
    throw new Error(
      'The selected trace exceeds the 50,000 event import limit; split the capture and retry.',
    );
  }

  const events = traceEvents.map((value, index) => {
    if (!isObject(value) || typeof value.ts !== 'number' || !Number.isFinite(value.ts)) {
      throw new Error(`Trace event ${index + 1} has no finite microsecond timestamp.`);
    }
    const name =
      typeof value.name === 'string'
        ? value.name
        : typeof value.cat === 'string'
          ? value.cat
          : 'trace-event';
    return {
      schema: 1,
      session,
      sequence: index + 1,
      at_ms: value.ts / 1000,
      wall_time_ms: importedAtMs,
      source,
      name: name.slice(0, 120),
      attributes: asSafeObject(value),
    } satisfies DevelopmentTelemetryRecord;
  });

  if (envelope) {
    const { traceEvents: _events, ...metadata } = envelope;
    if (Object.keys(metadata).length > 0) {
      events.unshift({
        schema: 1,
        session,
        sequence: 0,
        at_ms: Math.min(...events.map((event) => event.at_ms)),
        wall_time_ms: importedAtMs,
        source,
        name: 'trace-metadata',
        attributes: asSafeObject(metadata),
      });
    }
  }

  return events;
}
