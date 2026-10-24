import { DEFAULT_GOVERNOR_CONFIG } from './config';
import type { ExperimentArm } from './experiment';
import { classifyFrameWindow, frameRate } from './frames';
import { createQualityMeter, type QualityMeter } from './quality';
import type { FrameWindow, GovernorConfig, GovernorSnapshot, LeverSpec } from './types';

export type TelemetryValue = string | number | boolean;

/** Port: the app supplies the transport (Expo Observe, PostHog). Never called per frame. */
export type GovernorTelemetrySink = (
  name: string,
  attributes: Readonly<Record<string, TelemetryValue>>,
) => void;

export interface GovernorTelemetryOptions {
  readonly sink: GovernorTelemetrySink;
  readonly arm: ExperimentArm;
  readonly experimentKey: string;
  /** Stable for one app launch; lets sessions be compared without identifying anyone. */
  readonly sessionId?: string;
  /** Device stratum attached to `governor_started` so arms are compared within strata. */
  readonly device?: Readonly<Record<string, TelemetryValue>>;
  /** Hash of the active config, so data can be split by every threshold that produced it. */
  readonly configHash?: string;
  /** The policy deciding; verger's own when absent. */
  readonly policy?: { readonly id: string; readonly version: number };
  /** Classifies windows for the summary with the governor's own rule. */
  readonly config?: GovernorConfig;
  /**
   * Native cumulative frame totals. The window stream is filtered (calm repeats are not
   * forwarded), so summaries count frames from these totals, not from forwarded windows.
   */
  readonly readTotals?: () => {
    readonly frames: number;
    readonly missedVsyncs: number;
    readonly costMs: number;
  };
  /** The levers in play, so summaries report the quality given up beside the performance gained. */
  readonly levers?: readonly LeverSpec[];
  /** Separate budget for periodic summaries, so state churn cannot starve them. */
  readonly maxSummaries?: number;
  /** Hard cap per process, so a flapping signal cannot flood the network. */
  readonly maxEvents?: number;
  /** Summary cadence while foreground. */
  readonly summaryEveryMs?: number;
}

export interface GovernorTelemetry {
  /** Call with each new snapshot; emits only when governed outputs change. */
  onSnapshot(snapshot: GovernorSnapshot): void;
  /** Call with each frame window; aggregated into a periodic summary. */
  /** `at` is the caller's clock; it defaults to the window's end on the sensor timeline. */
  onFrameWindow(window: FrameWindow, interactionIdle: boolean, at?: number): void;
  /** Call with each CPU sample and long task; aggregated into the periodic summary. */
  onThreadLoad(at: number, jsCores: number, mainCores: number): void;
  onLongTask(at: number, durationMs: number): void;
  /** Emits the pending summary, if any, e.g. on background. */
  flush(at: number): void;
  /** A one-off event (launch, recovery, flight record), under the same event budget. */
  event(name: string, attributes: Readonly<Record<string, TelemetryValue>>): void;
  readonly emitted: number;
}

interface Summary {
  startAt: number;
  windows: number;
  frames: number;
  stressedWindows: number;
  idleDrawMs: number;
  worstMs: number;
  costSum: number;
  cpuSamples: number;
  jsCoresSum: number;
  mainCoresSum: number;
  longTasks: number;
  longTaskMaxMs: number;
}

const emptySummary = (at: number): Summary => ({
  startAt: at,
  windows: 0,
  frames: 0,
  stressedWindows: 0,
  idleDrawMs: 0,
  worstMs: 0,
  costSum: 0,
  cpuSamples: 0,
  jsCoresSum: 0,
  mainCoresSum: 0,
  longTasks: 0,
  longTaskMaxMs: 0,
});

/**
 * Bumped whenever a decision rule or default changes, so field data can be split by the policy
 * that produced it (deterministic, versioned policies: telemetry informs the next version).
 */
export const GOVERNOR_POLICY_VERSION = 4;

/** Reasons carry measured numbers; telemetry keeps their shape, not their values. */
export function reasonCode(reason: string): string {
  return reason.replace(/[0-9]+(\.[0-9]+)?/g, '#').slice(0, 80);
}

/** Durations are bucketed so events stay low-cardinality and carry no fine timing fingerprint. */
export function bucketMs(value: number): string {
  if (value < 8) return '<8';
  if (value < 16) return '8-16';
  if (value < 33) return '16-33';
  if (value < 66) return '33-66';
  if (value < 133) return '66-133';
  return '>=133';
}

export function createGovernorTelemetry(options: GovernorTelemetryOptions): GovernorTelemetry {
  const maxEvents = options.maxEvents ?? 64;
  const maxSummaries = options.maxSummaries ?? 120;
  const summaryEveryMs = options.summaryEveryMs ?? 60_000;
  const config = options.config ?? DEFAULT_GOVERNOR_CONFIG;
  let emitted = 0;
  let summaries = 0;
  let lastTotals = safeTotals(options.readTotals);
  let previous: GovernorSnapshot | null = null;
  let summary: Summary | null = null;
  const quality: QualityMeter | null = options.levers ? createQualityMeter(options.levers) : null;

  const send = (name: string, attributes: Record<string, TelemetryValue>) => {
    try {
      options.sink(name, {
        experiment: options.experimentKey,
        arm: options.arm,
        policy: options.policy?.version ?? GOVERNOR_POLICY_VERSION,
        policy_id: options.policy?.id ?? 'verger',
        ...(options.sessionId ? { session: options.sessionId } : {}),
        ...(options.configHash ? { config: options.configHash } : {}),
        ...attributes,
      });
    } catch {
      // Telemetry must never change app behaviour; a failing sink is dropped silently.
    }
  };
  const emit = (name: string, attributes: Record<string, TelemetryValue>) => {
    if (emitted >= maxEvents) return;
    emitted += 1;
    send(name, attributes);
  };

  const flush = (at: number) => {
    if (!summary || (summary.windows === 0 && summary.cpuSamples === 0 && summary.longTasks === 0))
      return;
    if (summaries >= maxSummaries) return;
    summaries += 1;
    const samples = Math.max(1, summary.cpuSamples);
    const totals = safeTotals(options.readTotals);
    const delta =
      totals && lastTotals
        ? {
            frames: Math.max(0, totals.frames - lastTotals.frames),
            missed: Math.max(0, totals.missedVsyncs - lastTotals.missedVsyncs),
            cost: Math.max(0, totals.costMs - lastTotals.costMs),
          }
        : null;
    lastTotals = totals;
    const cost = quality?.take(at);
    send('governor_summary', {
      // Quality given up (0 = full quality, 1 = every lever at its cheapest), time-weighted.
      ...(cost ? { quality_cost: round2(cost.applied), proposed_cost: round2(cost.proposed) } : {}),
      ...(delta
        ? {
            all_frames: delta.frames,
            all_missed: delta.missed,
            all_mean_cost: bucketMs(delta.cost / Math.max(1, delta.frames)),
          }
        : {}),
      js_cores: Math.round((summary.jsCoresSum / samples) * 100) / 100,
      main_cores: Math.round((summary.mainCoresSum / samples) * 100) / 100,
      long_tasks: summary.longTasks,
      long_task_max: bucketMs(summary.longTaskMaxMs),
      span_s: Math.round((at - summary.startAt) / 1000),
      // Forwarded windows only (calm repeats are filtered natively); use all_* for totals.
      fwd_windows: summary.windows,
      fwd_frames: summary.frames,
      stressed_windows: summary.stressedWindows,
      idle_draw_s: Math.round(summary.idleDrawMs / 1000),
      mean_cost: bucketMs(summary.costSum / Math.max(1, summary.frames)),
      worst_cost: bucketMs(summary.worstMs),
    });
    summary = emptySummary(at);
  };

  return {
    get emitted() {
      return emitted;
    },
    event(name, attributes) {
      emit(name, { ...attributes });
    },
    onSnapshot(snapshot) {
      try {
        quality?.onSnapshot(snapshot);
      } catch {
        // Measurement must never change behaviour.
      }
      const prev = previous;
      previous = snapshot;
      if (!prev) {
        emit('governor_started', {
          mode: snapshot.mode,
          thermal: snapshot.thermal,
          memory: snapshot.memory,
          ...(options.device ?? {}),
        });
        return;
      }
      if (
        prev.frameState !== snapshot.frameState ||
        prev.thermal !== snapshot.thermal ||
        prev.memory !== snapshot.memory ||
        prev.optionalConcurrency !== snapshot.optionalConcurrency ||
        prev.interactionIdle !== snapshot.interactionIdle ||
        prev.contention !== snapshot.contention ||
        prev.contentionExhausted !== snapshot.contentionExhausted ||
        prev.refreshCapHz !== snapshot.refreshCapHz ||
        prev.cpuBoost !== snapshot.cpuBoost ||
        prev.globalReducedMotion !== snapshot.globalReducedMotion
      ) {
        emit('governor_state', {
          frame: snapshot.frameState,
          thermal: snapshot.thermal,
          memory: snapshot.memory,
          optional_cap: snapshot.optionalConcurrency,
          idle: snapshot.interactionIdle,
          contention: snapshot.contention,
          unrelieved: snapshot.contentionExhausted,
          refresh_cap: snapshot.refreshCapHz ?? 0,
          cpu_boost: snapshot.cpuBoost,
          global_motion: snapshot.globalReducedMotion,
          action: snapshot.lastAction,
          reason: reasonCode(snapshot.lastReason),
        });
      }
      for (const [lever, level] of Object.entries(snapshot.proposedLevels)) {
        const before = prev.proposedLevels[lever];
        if (before !== undefined && before !== level) {
          emit('governor_lever', {
            lever,
            from: before,
            to: level,
            applied: snapshot.mode === 'active',
            action: snapshot.lastAction,
            reason: reasonCode(snapshot.lastReason),
          });
        }
      }
    },
    onThreadLoad(at, jsCores, mainCores) {
      summary ??= emptySummary(at);
      summary.cpuSamples += 1;
      summary.jsCoresSum += jsCores;
      summary.mainCoresSum += mainCores;
      if (at - summary.startAt >= summaryEveryMs) flush(at);
    },
    onLongTask(at, durationMs) {
      summary ??= emptySummary(at);
      summary.longTasks += 1;
      summary.longTaskMaxMs = Math.max(summary.longTaskMaxMs, durationMs);
    },
    onFrameWindow(window, interactionIdle, at = window.endMs) {
      summary ??= emptySummary(at - (window.endMs - window.startMs));
      summary.windows += 1;
      summary.frames += window.frames;
      summary.costSum += window.averageMs * window.frames;
      summary.worstMs = Math.max(summary.worstMs, window.worstMs);
      if (classifyFrameWindow(window, config) === 'stressed') summary.stressedWindows += 1;
      if (interactionIdle && frameRate(window) > 1)
        summary.idleDrawMs += window.endMs - window.startMs;
      if (at - summary.startAt >= summaryEveryMs) flush(at);
    },
    flush,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function safeTotals(read: GovernorTelemetryOptions['readTotals']) {
  if (!read) return null;
  try {
    const t = read();
    return Number.isFinite(t.frames) && Number.isFinite(t.missedVsyncs) && Number.isFinite(t.costMs)
      ? t
      : null;
  } catch {
    return null;
  }
}

/** A short stable hash of a config object, for splitting field data by thresholds. */
export function configHash(config: GovernorConfig): string {
  const text = JSON.stringify(Object.entries(config).sort(([a], [b]) => (a < b ? -1 : 1)));
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
