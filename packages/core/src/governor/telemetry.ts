import { frameRate } from './frames';
import type { ExperimentArm } from './experiment';
import type { FrameWindow, GovernorSnapshot } from './types';

export type TelemetryValue = string | number | boolean;

/** Port: the app supplies the transport (Expo Observe, PostHog). Never called per frame. */
export type GovernorTelemetrySink = (name: string, attributes: Readonly<Record<string, TelemetryValue>>) => void;

export interface GovernorTelemetryOptions {
  readonly sink: GovernorTelemetrySink;
  readonly arm: ExperimentArm;
  readonly experimentKey: string;
  /** Hard cap per process, so a flapping signal cannot flood the network. */
  readonly maxEvents?: number;
  /** Summary cadence while foreground. */
  readonly summaryEveryMs?: number;
}

export interface GovernorTelemetry {
  /** Call with each new snapshot; emits only when governed outputs change. */
  onSnapshot(snapshot: GovernorSnapshot): void;
  /** Call with each frame window; aggregated into a periodic summary. */
  onFrameWindow(window: FrameWindow, interactionIdle: boolean): void;
  /** Emits the pending summary, if any, e.g. on background. */
  flush(at: number): void;
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
}

const emptySummary = (at: number): Summary => ({
  startAt: at,
  windows: 0,
  frames: 0,
  stressedWindows: 0,
  idleDrawMs: 0,
  worstMs: 0,
  costSum: 0,
});

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
  const summaryEveryMs = options.summaryEveryMs ?? 60_000;
  let emitted = 0;
  let previous: GovernorSnapshot | null = null;
  let summary: Summary | null = null;

  const emit = (name: string, attributes: Record<string, TelemetryValue>) => {
    if (emitted >= maxEvents) return;
    emitted += 1;
    try {
      options.sink(name, { experiment: options.experimentKey, arm: options.arm, ...attributes });
    } catch {
      // Telemetry must never change app behaviour; a failing sink is dropped silently.
    }
  };

  const flush = (at: number) => {
    if (!summary || summary.windows === 0) return;
    emit('governor_summary', {
      span_s: Math.round((at - summary.startAt) / 1000),
      windows: summary.windows,
      frames: summary.frames,
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
    onSnapshot(snapshot) {
      const prev = previous;
      previous = snapshot;
      if (!prev) {
        emit('governor_started', { mode: snapshot.mode, thermal: snapshot.thermal, memory: snapshot.memory });
        return;
      }
      if (
        prev.frameState !== snapshot.frameState ||
        prev.thermal !== snapshot.thermal ||
        prev.memory !== snapshot.memory ||
        prev.optionalConcurrency !== snapshot.optionalConcurrency ||
        prev.interactionIdle !== snapshot.interactionIdle
      ) {
        emit('governor_state', {
          frame: snapshot.frameState,
          thermal: snapshot.thermal,
          memory: snapshot.memory,
          optional_cap: snapshot.optionalConcurrency,
          idle: snapshot.interactionIdle,
          action: snapshot.lastAction,
        });
      }
      for (const [lever, level] of Object.entries(snapshot.proposedLevels)) {
        const before = prev.proposedLevels[lever];
        if (before !== undefined && before !== level) {
          emit('governor_lever', { lever, from: before, to: level, applied: snapshot.mode === 'active', action: snapshot.lastAction });
        }
      }
    },
    onFrameWindow(window, interactionIdle) {
      summary ??= emptySummary(window.startMs);
      summary.windows += 1;
      summary.frames += window.frames;
      summary.costSum += window.averageMs * window.frames;
      summary.worstMs = Math.max(summary.worstMs, window.worstMs);
      if (window.averageMs > window.targetMs * 1.25) summary.stressedWindows += 1;
      if (interactionIdle && frameRate(window) > 1) summary.idleDrawMs += window.endMs - window.startMs;
      if (window.endMs - summary.startAt >= summaryEveryMs) flush(window.endMs);
    },
    flush,
  };
}
