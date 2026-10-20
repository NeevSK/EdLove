import { Observe } from 'expo-observe';
import type { EssentialStartupStageEvent } from '@/boot/startupCoordinator';

const MAX_STARTUP_EVENTS_PER_PROCESS = 64;
let emittedStartupEvents = 0;
let warnedAboutObserveFailure = false;

/** Emits only fixed startup-stage fields, with no account or request identifiers. */
export function recordStartupStage(event: EssentialStartupStageEvent): void {
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
