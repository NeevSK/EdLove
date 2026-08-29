/**
 * Journey Analytics — lightweight event emitters for journey funnel tracking.
 *
 * These functions emit structured events that can be consumed by any
 * analytics provider (Sentry, PostHog, custom). They do NOT import
 * analytics SDKs directly — that's the consumer's responsibility.
 */

type JourneyType = 'auth' | 'onboarding' | 'create' | 'sync';

interface JourneyEvent {
  type: string;
  journey: JourneyType;
  timestamp: number;
  [key: string]: unknown;
}

type JourneyEventListener = (event: JourneyEvent) => void;

const listeners: Set<JourneyEventListener> = new Set();

/**
 * Subscribe to journey events. Returns an unsubscribe function.
 */
export function onJourneyEvent(listener: JourneyEventListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: JourneyEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Never let a listener crash the app
    }
  }
}

/**
 * User started a journey (entered auth, onboarding, create, or sync flow).
 */
export function journeyStarted(journey: JourneyType, entryPoint: string) {
  emit({
    type: 'journey_started',
    journey,
    timestamp: Date.now(),
    entry_point: entryPoint,
  });
}

/**
 * User completed a step within a journey.
 */
export function journeyStepCompleted(
  journey: JourneyType,
  step: string,
  durationMs: number,
) {
  emit({
    type: 'journey_step_completed',
    journey,
    timestamp: Date.now(),
    step,
    duration_ms: durationMs,
  });
}

/**
 * User completed the entire journey.
 */
export function journeyCompleted(journey: JourneyType, totalDurationMs: number) {
  emit({
    type: 'journey_completed',
    journey,
    timestamp: Date.now(),
    total_duration_ms: totalDurationMs,
  });
}

/**
 * User hit an error during a journey step.
 */
export function journeyFailed(journey: JourneyType, step: string, errorType: string) {
  emit({
    type: 'journey_failed',
    journey,
    timestamp: Date.now(),
    step,
    error_type: errorType,
  });
}

/**
 * User abandoned a journey mid-flow.
 */
export function journeyAbandoned(journey: JourneyType, step: string, timeOnStepMs: number) {
  emit({
    type: 'journey_abandoned',
    journey,
    timestamp: Date.now(),
    step,
    time_on_step_ms: timeOnStepMs,
  });
}
