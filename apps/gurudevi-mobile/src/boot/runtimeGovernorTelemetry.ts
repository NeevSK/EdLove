import { Observe } from 'expo-observe';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';
import { devTelemetryCatcher } from '@/telemetry/devTelemetryCatcher';

const MAX_GOVERNOR_EVENTS_PER_PROCESS = 64;
let emittedEvents = 0;
let warnedAboutObserveFailure = false;
let lastRuntimeConditionsKey: string | null = null;
let lastRuntimeAdmissionKey: string | null = null;

function emit(name: string, attributes: Record<string, string | number | boolean>): void {
  if (emittedEvents >= MAX_GOVERNOR_EVENTS_PER_PROCESS) return;
  emittedEvents += 1;
  const startedAt = __DEV__ ? performance.now() : null;
  try {
    Observe.logEvent(name, { attributes });
    if (__DEV__) {
      devTelemetryCatcher.record({
        category: 'governor',
        name,
        attributes,
      });
    }
  } catch {
    if (!warnedAboutObserveFailure) {
      warnedAboutObserveFailure = true;
      console.warn('[runtime-governor] Observe telemetry is unavailable.');
    }
  } finally {
    if (startedAt !== null) {
      recordDevelopmentTrace({
        category: 'governor-overhead',
        operation: 'observe-log-event',
        duration_ms: Math.max(0, performance.now() - startedAt),
        event_name: name,
      });
    }
  }
}

export function recordRuntimeAdmission(event: {
  phase: 'boot' | 'public-ready' | 'protected-ready' | 'settled';
  capacityKnown: boolean;
  appState: 'active' | 'background';
  pressure: 'unknown' | 'normal' | 'constrained' | 'severe';
  batterySaver: boolean;
  optionalCap: number;
  allowed: boolean;
  reason:
    | 'journey-not-ready'
    | 'background'
    | 'constrained-pressure'
    | 'severe-pressure'
    | 'eligible'
    | 'battery-saver';
}): void {
  const key = `${event.phase}:${event.capacityKnown}:${event.appState}:${event.pressure}:${event.batterySaver}:${event.optionalCap}:${event.allowed}:${event.reason}`;
  if (key === lastRuntimeAdmissionKey) return;
  lastRuntimeAdmissionKey = key;
  emit('runtime_admission_changed', {
    phase: event.phase,
    capacity_known: event.capacityKnown,
    pressure_bucket: event.pressure,
    battery_saver: event.batterySaver,
    optional_cap: event.optionalCap,
    allowed: event.allowed,
    reason: event.reason,
  });
}

export function recordRuntimeConditionsChanged(event: {
  appState: 'active' | 'background';
  batterySaver: boolean;
  memoryPressure: 'unknown' | 'normal' | 'constrained' | 'severe';
  thermalPressure: 'unknown' | 'normal' | 'constrained' | 'severe';
  pressure: 'unknown' | 'normal' | 'constrained' | 'severe';
}): void {
  const key = `${event.appState}:${event.batterySaver}:${event.memoryPressure}:${event.thermalPressure}:${event.pressure}`;
  if (key === lastRuntimeConditionsKey) return;
  lastRuntimeConditionsKey = key;
  emit('runtime_conditions_changed', {
    app_state: event.appState,
    battery_saver: event.batterySaver,
    memory_pressure: event.memoryPressure,
    thermal_pressure: event.thermalPressure,
    pressure_bucket: event.pressure,
  });
}

export function recordOptionalWorkFinished(event: {
  task: 'background-sync-registration' | 'google-sign-in-configuration';
  outcome: 'complete' | 'failed';
  durationMs: number;
}): void {
  emit('optional_work_finished', {
    job_id: event.task,
    outcome: event.outcome,
    duration_bucket: durationBucket(event.durationMs),
  });
}

function durationBucket(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs < 0) return 'unknown';
  if (durationMs < 16) return 'lt_16ms';
  if (durationMs < 50) return '16_49ms';
  if (durationMs < 100) return '50_99ms';
  if (durationMs < 250) return '100_249ms';
  if (durationMs < 1000) return '250_999ms';
  return '1000ms_plus';
}
