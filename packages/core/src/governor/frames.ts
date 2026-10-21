import type { FrameState, FrameWindow, GovernorConfig } from './types';

/** One rendered frame: when it finished and what it cost. `deadlineMs` defaults to the target. */
export interface FrameSample {
  readonly tMs: number;
  readonly durMs: number;
  readonly deadlineMs?: number;
}

/**
 * Groups frames into fixed windows. Windows with no frames are not produced: an idle screen
 * yields nothing, which is itself the signal that nothing is drawing.
 *
 * This is the reference specification of the native estimator's windowing; the Kotlin
 * implementation must produce the same windows from the same samples (golden vectors).
 */
export function aggregateFrames(
  samples: readonly FrameSample[],
  windowMs: number,
  targetMs: number,
): FrameWindow[] {
  const windows: FrameWindow[] = [];
  let start: number | null = null;
  let frames = 0;
  let sum = 0;
  let deadlineSum = 0;
  let worst = 0;
  let missed = 0;

  const flush = (end: number) => {
    if (start === null || frames === 0) return;
    windows.push({
      startMs: start,
      endMs: end,
      frames,
      averageMs: sum / frames,
      targetMs: deadlineSum / frames,
      worstMs: worst,
      droppedRatio: missed / (frames + missed),
    });
  };

  for (const sample of samples) {
    if (start === null) start = Math.floor(sample.tMs / windowMs) * windowMs;
    while (sample.tMs >= start + windowMs) {
      flush(start + windowMs);
      start += windowMs;
      frames = 0;
      sum = 0;
      deadlineSum = 0;
      worst = 0;
      missed = 0;
    }
    const deadline = sample.deadlineMs ?? targetMs;
    frames += 1;
    sum += sample.durMs;
    deadlineSum += deadline;
    if (sample.durMs > worst) worst = sample.durMs;
    if (deadline > 0 && sample.durMs > deadline) missed += Math.floor((sample.durMs - 1e-9) / deadline);
  }
  if (start !== null) flush(start + windowMs);
  return windows;
}

/** Judges one window. Too few frames says nothing about cost, so it is `quiet`. */
export function classifyFrameWindow(window: FrameWindow, config: GovernorConfig): FrameState {
  if (window.frames < config.minSamples || window.targetMs <= 0) return 'quiet';
  const ratio = window.averageMs / window.targetMs;
  if (ratio > config.stressRatio || window.droppedRatio > config.stressDroppedRatio) return 'stressed';
  if (ratio < config.comfortRatio && window.droppedRatio < config.comfortDroppedRatio) return 'calm';
  return 'neutral';
}

/**
 * Which windows the native sensor forwards to JavaScript. Calm and quiet windows only matter
 * when they end a run of stressed or near-budget ones, so repeats are dropped: an animation
 * running comfortably costs no bridge traffic at all. The governor reaches the same decisions
 * from the filtered stream (see the equivalence test).
 */
export function shouldForwardWindow(state: FrameState, previousForwarded: FrameState | null): boolean {
  if (state === 'stressed' || state === 'neutral') return true;
  return state !== previousForwarded;
}

/** Frames per second drawn in a window. */
export function frameRate(window: FrameWindow): number {
  const span = window.endMs - window.startMs;
  return span > 0 ? (window.frames * 1000) / span : 0;
}
