/**
 * JS event-loop stalls. On React Native, as its own scheduler reports them. RN 0.88's RuntimeScheduler
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

/**
 * Starts observing the first supported entry type of `types`; returns a stop function. Inert
 * where the API or every type is missing. A browser prefers `long-animation-frame` (Chromium
 * 123+: also frames blocked by several shorter tasks), falling back to `longtask`.
 */
export function observeLongTasks(
  onLongTask: (durationMs: number) => void,
  types: readonly string[] = ['longtask'],
): () => void {
  const Observer = (globalThis as { PerformanceObserver?: LongTaskObserverConstructor })
    .PerformanceObserver;
  const supported = Observer?.supportedEntryTypes ?? [];
  const type = types.find((candidate) => supported.includes(candidate));
  if (!Observer || type === undefined) return () => {};
  let observer: LongTaskObserver | null = null;
  try {
    observer = new Observer((list) => {
      for (const entry of list.getEntries()) onLongTask(entry.duration);
    });
    observer.observe({ type });
  } catch (error) {
    console.error('[verger] long-task observer unavailable', error);
    return () => {};
  }
  return () => observer?.disconnect();
}
