/**
 * What verger itself costs, measured in the controller around the pure reducer (D3). The
 * doctrine asks verger to reduce itself first, so it must know its own price: reducer time per
 * event, events and wakeups per minute, and the share of the span spent reducing. Memory is
 * bounded: counts and a fixed histogram, never a list of samples.
 */
export interface SelfCost {
  readonly events: number;
  /** Timer wake-ups for time-only changes (each costs the phone a CPU wake). */
  readonly wakeups: number;
  readonly spanMs: number;
  readonly eventsPerMinute: number;
  readonly reduceTotalMs: number;
  readonly reduceMeanMs: number;
  readonly reduceMaxMs: number;
  /** Upper bound of the histogram bucket holding the 95th percentile (within a factor of 2). */
  readonly reduceP95Ms: number;
  /** Reducer time over the span: 0.001 means verger spent 0.1% of the time deciding. */
  readonly dutyRatio: number;
}

export interface SelfCostMeter {
  onReduce(durationMs: number): void;
  onWakeup(): void;
  read(at: number): SelfCost;
}

/** Bucket k holds durations up to SMALLEST_MS × 2^k; the last bucket holds everything longer. */
const SMALLEST_MS = 0.01;
const BUCKETS = 21;

const bucketOf = (durationMs: number): number => {
  if (durationMs <= SMALLEST_MS) return 0;
  return Math.min(BUCKETS - 1, Math.ceil(Math.log2(durationMs / SMALLEST_MS)));
};

export function createSelfCostMeter(startAt: number): SelfCostMeter {
  const histogram = new Array<number>(BUCKETS).fill(0);
  let events = 0;
  let wakeups = 0;
  let total = 0;
  let max = 0;
  return {
    onReduce(durationMs) {
      // A clock that steps backwards, or a non-finite reading, is not verger's cost.
      const d = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
      events += 1;
      total += d;
      max = Math.max(max, d);
      histogram[bucketOf(d)] = (histogram[bucketOf(d)] ?? 0) + 1;
    },
    onWakeup() {
      wakeups += 1;
    },
    read(at) {
      const spanMs = Math.max(0, at - startAt);
      let p95 = 0;
      if (events > 0) {
        const rank = Math.ceil(events * 0.95);
        let seen = 0;
        for (let k = 0; k < BUCKETS; k += 1) {
          seen += histogram[k] ?? 0;
          if (seen >= rank) {
            // The last bucket is open-ended: its honest bound is the largest duration seen.
            p95 = k === BUCKETS - 1 ? max : Math.min(max, SMALLEST_MS * 2 ** k);
            break;
          }
        }
      }
      return {
        events,
        wakeups,
        spanMs,
        eventsPerMinute: spanMs > 0 ? (events * 60_000) / spanMs : 0,
        reduceTotalMs: total,
        reduceMeanMs: events > 0 ? total / events : 0,
        reduceMaxMs: max,
        reduceP95Ms: p95,
        dutyRatio: spanMs > 0 ? total / spanMs : 0,
      };
    },
  };
}
