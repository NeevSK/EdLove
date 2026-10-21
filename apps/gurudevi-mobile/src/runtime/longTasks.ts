/**
 * JS-thread stalls as reported by React Native's own scheduler. RN 0.88's RuntimeScheduler
 * reports any task that ran without a yielding opportunity past its long-task threshold as a
 * W3C `longtask` performance entry, so this costs no polling and sees every stall, whatever
 * code caused it.
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
  const Observer = (globalThis as { PerformanceObserver?: LongTaskObserverConstructor }).PerformanceObserver;
  if (!Observer || !(Observer.supportedEntryTypes ?? []).includes('longtask')) return () => {};
  let observer: LongTaskObserver | null = null;
  try {
    observer = new Observer((list) => {
      for (const entry of list.getEntries()) onLongTask(entry.duration);
    });
    observer.observe({ type: 'longtask' });
  } catch (error) {
    console.error('[runtime] long-task observer unavailable', error);
    return () => {};
  }
  return () => observer?.disconnect();
}
