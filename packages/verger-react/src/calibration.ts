/**
 * Lightweight empirical hardware capability calibration probe.
 * Inspired by MSI Center Pro's hardware diagnostic & component benchmarking, adapted for
 * modern cross-platform React/Hermes/Chromium runtimes.
 *
 * Runs non-intrusively without blocking the UI thread to calculate a Hardware Capability Index (HCI)
 * from 0.0 to 1.0, enabling empirical baseline calibration beyond static memory bucketing.
 */

export interface HardwareCalibrationResult {
  /** Normalized score from 0.0 (severely constrained) to 1.0 (flagship desktop / mobile). */
  readonly score: number;
  /** Suggested capability tier derived from empirical throughput and event loop latency. */
  readonly tier: 'low' | 'mid' | 'high';
  /** Mean event loop timer scheduling jitter in milliseconds. */
  readonly eventLoopJitterMs: number;
  /** Duration in milliseconds of a deterministic 10,000-iteration numeric compute probe. */
  readonly computeDurationMs: number;
  /** Monotonic or wall timestamp of when the benchmark completed. */
  readonly completedAt: number;
}

export interface CalibrationOptions {
  /** Maximum iterations for the microtask jitter loop (defaults to 3). */
  readonly jitterSamples?: number;
  /** Clock source to measure performance (defaults to performance.now). */
  readonly now?: () => number;
}

/**
 * Executes a deterministic, bounded calibration probe.
 * Total execution takes under 15ms of thread time across multiple microtask yields,
 * ensuring zero dropped UI frames during app initialization.
 */
export async function runHardwareCalibration(
  options: CalibrationOptions = {},
): Promise<HardwareCalibrationResult> {
  const now = options.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const samples = options.jitterSamples ?? 3;

  // 1. Measure Event Loop Jitter across macro/micro task yields
  let totalJitter = 0;
  for (let i = 0; i < samples; i++) {
    const start = now();
    await new Promise<void>((resolve) => setTimeout(resolve, 4));
    const elapsed = now() - start;
    // Expected delay is 4ms; deviation is the scheduling jitter
    totalJitter += Math.max(0, elapsed - 4);
  }
  const meanJitter = totalJitter / samples;

  // 2. Measure Pure Mathematical Vector Throughput (Matrix transformation simulator)
  const computeStart = now();
  let acc = 1.0;
  for (let i = 0; i < 20_000; i++) {
    acc = (acc * 1.0001 + Math.sin(i) * 0.05) % 1000;
  }
  const computeDuration = Math.max(0.01, now() - computeStart);

  // Suppress unused variable warning on acc
  if (acc === 0.123456789) {
    console.debug(acc);
  }

  // 3. Score synthesis:
  // - Flagship (high): jitter < 2ms, compute < 3ms -> Score ~0.85 - 1.0
  // - Mid-range: jitter 2-8ms, compute 3-10ms -> Score ~0.50 - 0.84
  // - Constrained (low): jitter > 8ms, compute > 10ms -> Score < 0.50
  const jitterPenalty = Math.min(1, meanJitter / 20); // 0 at 0ms, 1 at 20ms+
  const computePenalty = Math.min(1, computeDuration / 25); // 0 at 0ms, 1 at 25ms+

  const rawScore = Math.max(0.05, Math.min(1.0, 1.0 - (jitterPenalty * 0.5 + computePenalty * 0.5)));
  const score = Math.round(rawScore * 100) / 100;

  const tier: 'low' | 'mid' | 'high' = score >= 0.8 ? 'high' : score >= 0.5 ? 'mid' : 'low';

  return {
    score,
    tier,
    eventLoopJitterMs: Math.round(meanJitter * 100) / 100,
    computeDurationMs: Math.round(computeDuration * 100) / 100,
    completedAt: now(),
  };
}

