import { Observe } from 'expo-observe';
import type { EssentialStartupStageEvent } from '@/boot/startupCoordinator';
import { devTelemetryCatcher } from '@/telemetry/devTelemetryCatcher';
import { setDevelopmentTelemetrySource } from '@/telemetry/localDevelopmentTelemetry';

const MAX_STARTUP_EVENTS_PER_PROCESS = 64;
const MAX_DEVELOPMENT_TRACE_EVENTS = 65_536;
let emittedStartupEvents = 0;
let emittedDevelopmentTraceEvents = 0;
let lastTraceWriteCallMs: number | null = null;
let cumulativeTraceWriteCallMs = 0;
let warnedAboutTraceCap = false;
let warnedAboutObserveFailure = false;
const DEVELOPMENT_TRACE_SESSION_ID = __DEV__
  ? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  : null;
let emittedTraceSessionStart = false;
const TRACE_STRING_FIELDS = new Set([
  'category',
  'task',
  'state',
  'outcome',
  'source',
  'memory',
  'thermal',
  'operation',
  'event_name',
  'phase',
  'app_state',
  'pressure_bucket',
  'reason',
  'decision',
]);
const TRACE_NUMBER_FIELDS = new Set([
  'duration_ms',
  'processing_duration_ms',
  'queue_depth',
  'queue_wait_ms',
  'optional_cap',
  'input_delay_ms',
  'processing_ms',
  'presentation_delay_ms',
  'interaction_id',
  'previous_trace_write_call_ms',
  'cumulative_trace_write_call_ms',
  'at_ms',
  'wall_time_ms',
]);
const TRACE_BOOLEAN_FIELDS = new Set([
  'capacity_known',
  'battery_saver',
  'allowed',
  'session_loading',
  'profile_resolving',
  'local_guest_ready',
  'onboarding_completed',
  'profile_error_present',
  'has_session',
]);

/** Emits only fixed startup-stage fields, with no account or request identifiers. */
export function recordStartupStage(event: EssentialStartupStageEvent): void {
  if (__DEV__) {
    if (typeof event.startedAtMs === 'number' && Number.isFinite(event.startedAtMs)) {
      recordDevelopmentTrace({
        category: 'essential-stage',
        task: event.stage,
        state: 'started',
        at_ms: event.startedAtMs,
      });
    }
    recordDevelopmentTrace({
      category: 'essential-stage',
      task: event.stage,
      outcome: event.outcome,
      state: event.outcome,
      duration_ms: event.durationMs,
      ...(typeof event.finishedAtMs === 'number' && Number.isFinite(event.finishedAtMs)
        ? { at_ms: event.finishedAtMs }
        : {}),
    });
  }
  if (emittedStartupEvents >= MAX_STARTUP_EVENTS_PER_PROCESS) return;
  emittedStartupEvents += 1;

  try {
    Observe.logEvent('startup_stage', {
      attributes: {
        stage: event.stage,
        outcome: event.outcome,
        ...(event.durationMs === null ? {} : { duration_ms: event.durationMs }),
      },
    });
  } catch {
    if (!warnedAboutObserveFailure) {
      warnedAboutObserveFailure = true;
      console.warn('[startup] Observe stage telemetry is unavailable.');
    }
  }
}

/** Full local startup trace for development; fixed fields only, bounded per process. */
export function recordDevelopmentTrace(
  event: Record<string, string | number | boolean | null>,
): void {
  if (!__DEV__) return;
  if (emittedDevelopmentTraceEvents >= MAX_DEVELOPMENT_TRACE_EVENTS) {
    if (!warnedAboutTraceCap) {
      warnedAboutTraceCap = true;
      try {
        console.warn(
          '[runtime-trace] Development trace event cap reached; later events are omitted.',
        );
      } catch {
        // Diagnostic output must never affect runtime work.
      }
    }
    return;
  }
  const startedAt = performance.now();
  const eventAt =
    typeof event.at_ms === 'number' && Number.isFinite(event.at_ms) && event.at_ms >= 0
      ? event.at_ms
      : startedAt;
  const wallTime =
    typeof event.wall_time_ms === 'number' && Number.isFinite(event.wall_time_ms)
      ? event.wall_time_ms
      : Date.now() - (startedAt - eventAt);
  emittedDevelopmentTraceEvents += 1;
  try {
    const attributes: Record<string, string | number | boolean> = {
      at_ms: eventAt,
      wall_time_ms: wallTime,
      time_origin_ms: wallTime - eventAt,
      wall_clock_basis:
        typeof event.wall_time_ms === 'number' && Number.isFinite(event.wall_time_ms)
          ? 'provided'
          : 'estimated-from-observation',
      trace_session_id: DEVELOPMENT_TRACE_SESSION_ID ?? 'unknown',
      trace_event_index: emittedDevelopmentTraceEvents,
      category: String(event.category ?? 'trace'),
      trace_session_started: !emittedTraceSessionStart,
    };
    if (lastTraceWriteCallMs !== null) {
      attributes.previous_trace_write_call_ms = lastTraceWriteCallMs;
      attributes.cumulative_trace_write_call_ms = cumulativeTraceWriteCallMs;
    }
    for (const [key, value] of Object.entries(event)) {
      if (
        TRACE_STRING_FIELDS.has(key) &&
        typeof value === 'string' &&
        /^[a-zA-Z0-9._/-]{1,80}$/.test(value)
      ) {
        attributes[key] = value;
      } else if (
        TRACE_NUMBER_FIELDS.has(key) &&
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0
      ) {
        attributes[key] = value;
      } else if (TRACE_BOOLEAN_FIELDS.has(key) && typeof value === 'boolean') {
        attributes[key] = value;
      }
    }
    devTelemetryCatcher.record(
      {
        category: 'observe',
        name: String(event.task ?? event.stage ?? event.category ?? 'trace'),
        durationMs: typeof event.duration_ms === 'number' ? event.duration_ms : undefined,
        attributes,
      },
      { print: false },
    );
    if (process.env.EXPO_PUBLIC_GURUDEVI_TRACE_CONSOLE === 'true') {
      console.log(`[runtime-trace] ${JSON.stringify(attributes)}`);
    }
    emittedTraceSessionStart = true;
  } catch {
    // Diagnostic output must never affect runtime work.
  } finally {
    lastTraceWriteCallMs = Math.max(0, performance.now() - startedAt);
    cumulativeTraceWriteCallMs += lastTraceWriteCallMs;
  }
}

export function recordDevelopmentScreenInteractive(
  screen: 'welcome' | 'onboarding' | 'self',
): void {
  if (!__DEV__) return;
  recordDevelopmentTrace({ category: 'screen-interactive', task: screen, state: 'ready' });
}

const MAX_DEVELOPMENT_INTERACTION_EVENTS = 2_048;

/** Records native Event Timing entries in development without retaining target text or view IDs. */
export function observeDevelopmentInteractions(): () => void {
  if (!__DEV__) return () => undefined;
  if (typeof PerformanceObserver === 'undefined') {
    setDevelopmentTelemetrySource(
      'event-timing',
      'unsupported',
      'PerformanceObserver is not available in this runtime.',
    );
    return () => undefined;
  }
  const supportedTypes = (
    PerformanceObserver as typeof PerformanceObserver & {
      supportedEntryTypes?: readonly string[];
    }
  ).supportedEntryTypes;
  if (!supportedTypes?.includes('event')) {
    setDevelopmentTelemetrySource(
      'event-timing',
      'unsupported',
      'The runtime does not advertise Event Timing entries.',
    );
    return () => undefined;
  }

  let recorded = 0;
  let capReported = false;
  let observer: PerformanceObserver;
  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (recorded >= MAX_DEVELOPMENT_INTERACTION_EVENTS) {
          if (!capReported) {
            capReported = true;
            recordDevelopmentTrace({
              category: 'interaction',
              task: 'event-timing',
              state: 'capped',
            });
            setDevelopmentTelemetrySource(
              'event-timing',
              'capped',
              'Development Event Timing entry cap reached.',
            );
          }
          observer.disconnect();
          return;
        }
        const event = entry as PerformanceEntry & {
          processingStart?: number;
          processingEnd?: number;
          interactionId?: number;
        };
        const eventName = /^[a-zA-Z]{1,24}$/.test(event.name) ? event.name.toLowerCase() : 'other';
        const processingStart = event.processingStart ?? event.startTime;
        const processingEnd = event.processingEnd ?? processingStart;
        recordDevelopmentTrace({
          category: 'interaction',
          task: eventName,
          state: 'observed',
          at_ms: event.startTime,
          interaction_id:
            typeof event.interactionId === 'number' && Number.isSafeInteger(event.interactionId)
              ? event.interactionId
              : 0,
          duration_ms: Math.max(0, event.duration),
          input_delay_ms: Math.max(0, processingStart - event.startTime),
          processing_ms: Math.max(0, processingEnd - processingStart),
          presentation_delay_ms: Math.max(0, event.startTime + event.duration - processingEnd),
        });
        recorded += 1;
      }
    });
    const eventTimingOptions: PerformanceObserverInit & {
      type: 'event';
      buffered: boolean;
      durationThreshold: number;
    } = { type: 'event', buffered: false, durationThreshold: 0 };
    observer.observe(eventTimingOptions);
  } catch {
    setDevelopmentTelemetrySource(
      'event-timing',
      'failed',
      'PerformanceObserver could not subscribe to Event Timing.',
    );
    return () => undefined;
  }
  setDevelopmentTelemetrySource(
    'event-timing',
    'recording',
    'Event Timing entries omit target text and view IDs.',
  );
  return () => {
    observer.disconnect();
    if (!capReported) {
      setDevelopmentTelemetrySource('event-timing', 'complete', 'Event Timing observer stopped.');
    }
  };
}

export async function measureDevelopmentStartupTask<T>(
  task: string,
  operation: () => Promise<T>,
): Promise<T> {
  if (!__DEV__) return operation();
  const startedAt = performance.now();
  recordDevelopmentTrace({ category: 'startup-task', task, state: 'started' });
  try {
    const result = await operation();
    recordDevelopmentTrace({
      category: 'startup-task',
      task,
      state: 'completed',
      duration_ms: Math.max(0, performance.now() - startedAt),
    });
    return result;
  } catch (error) {
    recordDevelopmentTrace({
      category: 'startup-task',
      task,
      state: 'failed',
      duration_ms: Math.max(0, performance.now() - startedAt),
    });
    throw error;
  }
}
