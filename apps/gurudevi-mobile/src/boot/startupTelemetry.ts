import { Observe } from 'expo-observe';
import type { EssentialStartupStageEvent } from '@/boot/startupCoordinator';
import { devTelemetryCatcher } from '@/telemetry/devTelemetryCatcher';

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

/** Emits only fixed startup-stage fields, with no account or request identifiers. */
export function recordStartupStage(event: EssentialStartupStageEvent): void {
  if (__DEV__) {
    recordDevelopmentTrace({
      category: 'essential-stage',
      task: event.stage,
      outcome: event.outcome,
      duration_ms: event.durationMs,
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
  emittedDevelopmentTraceEvents += 1;
  try {
    devTelemetryCatcher.record({
      category: 'observe',
      name: String(event.task ?? event.stage ?? event.category ?? 'trace'),
      durationMs: typeof event.duration_ms === 'number' ? event.duration_ms : undefined,
      attributes: event,
    });
    emittedTraceSessionStart = true;
  } catch {
    // Diagnostic output must never affect runtime work.
  } finally {
    lastTraceWriteCallMs = Math.max(0, performance.now() - startedAt);
    cumulativeTraceWriteCallMs += lastTraceWriteCallMs;
  }
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
