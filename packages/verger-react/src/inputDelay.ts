/**
 * How long inputs waited for their handlers (B7), from Event Timing: `processingStart` minus
 * `startTime` of each `event` entry. Browsers with Event Timing (Chromium, Firefox) and React
 * Native 0.88 (`PerformanceEventTiming`, `durationThreshold` honoured) report it; elsewhere this
 * is inert. Only entries whose whole duration passes `durationThresholdMs` arrive, so a quiet
 * app reports nothing and the observer costs no polling.
 */
interface EventTimingEntry {
  readonly startTime: number;
  readonly processingStart?: number;
}

interface EventTimingObserver {
  observe(options: { type: string; durationThreshold?: number; buffered?: boolean }): void;
  disconnect(): void;
}

type EventTimingObserverConstructor = {
  new (callback: (list: { getEntries(): readonly EventTimingEntry[] }) => void): EventTimingObserver;
  readonly supportedEntryTypes?: readonly string[];
};

/** Event Timing's default and the spec's minimum is 16 ms; 104 ms is the browsers' default. */
export const INPUT_DELAY_DURATION_THRESHOLD_MS = 104;

export function observeInputDelay(
  onDelay: (delayMs: number) => void,
  durationThresholdMs: number = INPUT_DELAY_DURATION_THRESHOLD_MS,
): () => void {
  const Observer = (globalThis as { PerformanceObserver?: EventTimingObserverConstructor })
    .PerformanceObserver;
  if (!Observer || !(Observer.supportedEntryTypes ?? []).includes('event')) return () => {};
  let observer: EventTimingObserver | null = null;
  try {
    observer = new Observer((list) => {
      for (const entry of list.getEntries()) {
        if (typeof entry.processingStart !== 'number') continue;
        const delay = entry.processingStart - entry.startTime;
        if (Number.isFinite(delay) && delay >= 0) onDelay(delay);
      }
    });
    observer.observe({ type: 'event', durationThreshold: durationThresholdMs });
  } catch (error) {
    console.error('[verger] event timing observer unavailable', error);
    return () => {};
  }
  return () => observer?.disconnect();
}
