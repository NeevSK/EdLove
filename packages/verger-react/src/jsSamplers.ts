/**
 * Two cheap JS-side samplers for stalls the scheduler's long tasks miss (vision: "cpu / JS thread:
 * event-loop lag sampler"; "memory: Hermes heap, GC pauses"). Both pause while `paused()` (the app
 * is not visible: a hidden page or app throttles timers, which would read as huge lag) and start
 * their window over when they resume.
 */

/**
 * Event-loop lag: a timer asked for every `intervalMs` fires late by however long the JS thread
 * was busy. Reports the worst lateness of each `windowMs`. A stall of `intervalMs` or longer is
 * always caught; a shorter one with probability about its length over the interval. 500 ms is
 * two wake-ups a second while visible (cheapest first: the vision's signal rule).
 */
export function observeEventLoopLag(
  onLag: (lagMs: number) => void,
  paused: () => boolean,
  now: () => number,
  intervalMs = 500,
  windowMs = 5000,
): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let expected = now() + intervalMs;
  let windowStart = now();
  let worst = 0;
  let wasPaused = false;
  const tick = () => {
    if (stopped) return;
    const at = now();
    // Hidden, and on the first tick back (its lateness is the throttled timer, not a stall),
    // nothing is measured and the window starts over.
    if (paused() || wasPaused) {
      wasPaused = paused();
      worst = 0;
      windowStart = at;
    } else {
      worst = Math.max(worst, at - expected);
      if (at - windowStart >= windowMs) {
        onLag(worst);
        worst = 0;
        windowStart = at;
      }
    }
    expected = at + intervalMs;
    timer = setTimeout(tick, intervalMs);
  };
  timer = setTimeout(tick, intervalMs);
  return () => {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
  };
}

/** The Hermes statistics read here; every key is optional (`flow/HermesInternalType.js`). */
interface HermesStats {
  readonly js_gcTime?: unknown;
  readonly js_allocatedBytes?: unknown;
}

const hermesStats = (): HermesStats | null => {
  const internal = (globalThis as { HermesInternal?: { getInstrumentedStats?: () => HermesStats } })
    .HermesInternal;
  return typeof internal?.getInstrumentedStats === 'function' ? internal.getInstrumentedStats() : null;
};

/**
 * Hermes' GC pressure: the share of each window's wall time spent in collection pauses
 * (`js_gcTime`, cumulative seconds, per Hermes' `GCBase::getGCTime`), and the live heap
 * (`js_allocatedBytes`). Inert off Hermes (browsers) or where the statistics are missing.
 */
export function observeJsHeap(
  onSample: (gcPauseShare: number, allocatedBytes: number | null) => void,
  paused: () => boolean,
  now: () => number,
  windowMs = 10_000,
): () => void {
  const first = hermesStats();
  if (first === null || typeof first.js_gcTime !== 'number') return () => {};
  let lastGcS: number = first.js_gcTime;
  let lastAt = now();
  const timer = setInterval(() => {
    const at = now();
    let stats: HermesStats | null;
    try {
      stats = hermesStats();
    } catch (error) {
      console.error('[verger] Hermes statistics unavailable', error);
      return;
    }
    const gcS = stats?.js_gcTime;
    if (typeof gcS !== 'number') return;
    const span = at - lastAt;
    const share = span > 0 ? Math.max(0, ((gcS - lastGcS) * 1000) / span) : 0;
    lastGcS = gcS;
    lastAt = at;
    if (paused()) return;
    const allocated = stats?.js_allocatedBytes;
    onSample(Math.min(1, share), typeof allocated === 'number' ? allocated : null);
  }, windowMs);
  return () => clearInterval(timer);
}
