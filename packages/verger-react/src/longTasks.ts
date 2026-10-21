/**
 * JS event-loop stalls as reported by React Native's own scheduler. RN 0.88's RuntimeScheduler
 * reports a task that ran without a yielding opportunity for 50 ms or more as a W3C `longtask`
 * entry, so this costs no polling and covers any code running as a scheduler task. It does not
 * see synchronous native calls outside the scheduler or work on the UI thread (worklets); the
 * native per-thread CPU sampler covers those.
 */
interface LongTaskEntry {
  readonly duration: number;
}

interface LongTaskObserver {
  observe(options: { type: string; buffered?: boolean }): void;
  disconnect(): void;
}

type LongTaskObserverConstructor = {
  new (callback: (list: { getEntries(): readonly LongTaskEntry[] }) => void): LongTaskObserver;
  readonly supportedEntryTypes?: readonly string[];
};

/** Starts observing; returns a stop function. Inert where the API or entry type is missing. */
export function observeLongTasks(onLongTask: (durationMs: number) => void): () => void {
  const Observer = (globalThis as { PerformanceObserver?: LongTaskObserverConstructor })
    .PerformanceObserver;
  if (!Observer || !(Observer.supportedEntryTypes ?? []).includes('longtask')) return () => {};
  let observer: LongTaskObserver | null = null;
  try {
    observer = new Observer((list) => {
      for (const entry of list.getEntries()) onLongTask(entry.duration);
    });
    observer.observe({ type: 'longtask' });
  } catch (error) {
    console.error('[verger] long-task observer unavailable', error);
    return () => {};
  }
  return () => observer?.disconnect();
}
