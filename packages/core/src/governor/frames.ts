import type { FrameStage, FrameStages, FrameState, FrameWindow, GovernorConfig, LeverTarget } from './types';

/** One rendered frame: when it finished and what it cost. `deadlineMs` defaults to the target. */
export interface FrameSample {
  readonly tMs: number;
  readonly durMs: number;
  readonly deadlineMs?: number;
  readonly stages?: FrameStages;
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
  let stageFrames = 0;
  let ui = 0;
  let render = 0;
  let gpu = 0;
  let delay = 0;

  const flush = (end: number) => {
    if (start === null || frames === 0) return;
    const window: FrameWindow = {
      startMs: start,
      endMs: end,
      frames,
      averageMs: sum / frames,
      targetMs: deadlineSum / frames,
      worstMs: worst,
      droppedRatio: missed / (frames + missed),
    };
    windows.push(
      stageFrames === 0
        ? window
        : {
            ...window,
            stages: {
              uiMs: ui / stageFrames,
              renderMs: render / stageFrames,
              gpuMs: gpu / stageFrames,
              delayMs: delay / stageFrames,
            },
          },
    );
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
      stageFrames = 0;
      ui = 0;
      render = 0;
      gpu = 0;
      delay = 0;
    }
    const deadline = sample.deadlineMs ?? targetMs;
    frames += 1;
    sum += sample.durMs;
    deadlineSum += deadline;
    if (sample.durMs > worst) worst = sample.durMs;
    if (deadline > 0 && sample.durMs > deadline) missed += Math.floor((sample.durMs - 1e-9) / deadline);
    if (sample.stages) {
      stageFrames += 1;
      ui += sample.stages.uiMs;
      render += sample.stages.renderMs;
      gpu += sample.stages.gpuMs;
      delay += sample.stages.delayMs;
    }
  }
  if (start !== null) flush(start + windowMs);
  return windows;
}

/** Judges one window. Too few frames says nothing about cost, so it is `quiet`. */
export function classifyFrameWindow(window: FrameWindow, config: GovernorConfig): FrameState {
  if (window.frames <= 0 || !(window.targetMs > 0)) return 'quiet';
  if (window.frames < config.minSamples) {
    // Few frames can mean idleness or a main thread too stalled to draw. Missed vsyncs tell
    // them apart: a window that missed as many vsyncs as a judgement needs, or held one frame
    // for many budgets, is severe jank, not quiet.
    const missed = missedVsyncs(window);
    const longFrame = window.worstMs > config.jankFrameFactor * window.targetMs;
    return missed >= config.minSamples || longFrame ? 'stressed' : 'quiet';
  }
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

/** Missed vsyncs recovered from a window: droppedRatio = missed / (frames + missed). */
export function missedVsyncs(window: FrameWindow): number {
  const d = window.droppedRatio;
  if (!(d > 0) || d >= 1) return 0;
  return Math.round((d * window.frames) / (1 - d));
}

/** Frames per second drawn in a window. */
export function frameRate(window: FrameWindow): number {
  const span = window.endMs - window.startMs;
  return span > 0 ? (window.frames * 1000) / span : 0;
}

const STAGE_ORDER: readonly FrameStage[] = ['ui', 'render', 'gpu', 'delay'];

/** The stage that cost most on average, or null when the window carries no stages. */
export function frameBottleneck(window: FrameWindow): FrameStage | null {
  const stages = window.stages;
  if (!stages) return null;
  const cost: Record<FrameStage, number> = {
    ui: stages.uiMs,
    render: stages.renderMs,
    gpu: stages.gpuMs,
    delay: stages.delayMs,
  };
  let best: FrameStage | null = null;
  for (const stage of STAGE_ORDER) {
    if (!(cost[stage] > 0)) continue; // also skips NaN: an unmeasured stage is never the culprit
    if (best === null || cost[stage] > cost[best]) best = stage;
  }
  return best;
}

/**
 * Which lever targets relieve a bottleneck. GPU-bound frames shed GPU work (blur, glass,
 * shaders); every other stage is CPU time on the main or render thread, or main-thread work
 * delaying the frame. Unknown attribution relieves both.
 */
export function bottleneckTargets(stage: FrameStage | null, gpuKnown = true): readonly LeverTarget[] {
  if (stage === 'gpu') return ['gpu'];
  if (stage === null) return ['gpu', 'cpu'];
  // Before Android 12 GPU time is unreported, and buffer swaps block under GPU back-pressure,
  // so a render-bound frame may really be GPU-bound.
  if (stage === 'render' && !gpuKnown) return ['gpu', 'cpu'];
  return ['cpu'];
}

/** Whether the window's stages include a measured GPU time. */
export function gpuMeasured(window: FrameWindow): boolean {
  return window.stages !== undefined && Number.isFinite(window.stages.gpuMs);
}
