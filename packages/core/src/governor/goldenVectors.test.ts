import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import a52 from './__fixtures__/a52-self-idle.json';
import {
  aggregateFrames,
  classifyFrameWindow,
  DEFAULT_GOVERNOR_CONFIG,
  type FrameSample,
  type FrameState,
  frameBottleneck,
  type GovernorEvent,
  GURUDEVI_LEVERS,
  replayGovernor,
  shouldForwardWindow,
} from './index';

/**
 * Golden vectors: the TypeScript reference produces the expected windows, classifications and
 * forwarding decisions for recorded frames. The Kotlin estimator in
 * apps/gurudevi-mobile/modules/runtime-sense is tested against the same file, so the two
 * implementations cannot drift apart silently. Regenerate with UPDATE_GOLDEN=1.
 */
const WINDOW_MS = 500;
const expectedPath = path.join(import.meta.dirname, '__fixtures__', 'a52-self-idle.expected.json');

function reference() {
  const windows = aggregateFrames(a52.frames, WINDOW_MS, a52.vsyncAppMedianGapMs);
  let forwarded: FrameState | null = null;
  return windows.map((w) => {
    const state = classifyFrameWindow(w, DEFAULT_GOVERNOR_CONFIG);
    const forward = shouldForwardWindow(state, forwarded);
    if (forward) forwarded = state;
    const round = (n: number) => Math.round(n * 1e6) / 1e6;
    return {
      startMs: w.startMs,
      endMs: w.endMs,
      frames: w.frames,
      averageMs: round(w.averageMs),
      targetMs: round(w.targetMs),
      worstMs: round(w.worstMs),
      droppedRatio: round(w.droppedRatio),
      state,
      forward,
    };
  });
}

const stagesInputPath = path.join(import.meta.dirname, '__fixtures__', 'synthetic-stages.json');
const stagesExpectedPath = path.join(import.meta.dirname, '__fixtures__', 'synthetic-stages.expected.json');

/**
 * A deterministic stream with per-stage costs: a UI-bound run, a GPU-bound run, a main-thread
 * delay run and a calm tail, at 90 Hz with per-frame deadlines and one gap with no frames.
 */
function syntheticStages(): FrameSample[] {
  const samples: FrameSample[] = [];
  const deadline = 11.111;
  let t = 3;
  const phases: { frames: number; ui: number; render: number; gpu: number; delay: number }[] = [
    { frames: 60, ui: 9.5, render: 3.25, gpu: 4, delay: 0.5 },
    { frames: 45, ui: 3, render: 2.5, gpu: 12.75, delay: 0.25 },
    { frames: 30, ui: 2, render: 1.5, gpu: 2, delay: 18 },
    { frames: 50, ui: 2.5, render: 1.75, gpu: 2.25, delay: 0 },
  ];
  phases.forEach((phase, p) => {
    for (let i = 0; i < phase.frames; i++) {
      const wobble = ((i * 7 + p * 3) % 5) * 0.125;
      const uiMs = phase.ui + wobble;
      const durMs = uiMs + phase.render + phase.gpu + phase.delay;
      samples.push({
        tMs: t,
        durMs,
        deadlineMs: deadline,
        stages: { uiMs, renderMs: phase.render, gpuMs: phase.gpu, delayMs: phase.delay },
      });
      t += deadline;
    }
    t += 900; // silence between phases
  });
  return samples;
}

describe('golden vectors shared with the Kotlin estimator', () => {
  it('matches the committed expected windows with stage attribution', () => {
    const samples = syntheticStages();
    const round = (n: number) => Math.round(n * 1e6) / 1e6;
    let forwarded: FrameState | null = null;
    const windows = aggregateFrames(samples, WINDOW_MS, 16.667).map((w) => {
      const state = classifyFrameWindow(w, DEFAULT_GOVERNOR_CONFIG);
      const forward = shouldForwardWindow(state, forwarded);
      if (forward) forwarded = state;
      return {
        startMs: w.startMs,
        endMs: w.endMs,
        frames: w.frames,
        averageMs: round(w.averageMs),
        targetMs: round(w.targetMs),
        worstMs: round(w.worstMs),
        droppedRatio: round(w.droppedRatio),
        uiMs: round(w.stages?.uiMs ?? Number.NaN),
        renderMs: round(w.stages?.renderMs ?? Number.NaN),
        gpuMs: round(w.stages?.gpuMs ?? Number.NaN),
        delayMs: round(w.stages?.delayMs ?? Number.NaN),
        bottleneck: frameBottleneck(w),
        state,
        forward,
      };
    });
    const actual = { windowMs: WINDOW_MS, defaultTargetMs: 16.667, config: DEFAULT_GOVERNOR_CONFIG, windows };
    if (process.env.UPDATE_GOLDEN === '1') {
      writeFileSync(stagesInputPath, `${JSON.stringify({ frames: samples }, null, 1)}\n`);
      writeFileSync(stagesExpectedPath, `${JSON.stringify(actual, null, 1)}\n`);
    }
    expect(actual).toEqual(JSON.parse(readFileSync(stagesExpectedPath, 'utf8')));
    expect(JSON.parse(readFileSync(stagesInputPath, 'utf8'))).toEqual({ frames: samples });
    const bottlenecks = new Set(windows.map((w) => w.bottleneck));
    expect(bottlenecks).toEqual(new Set(['ui', 'gpu', 'delay']));
  });

  it('matches the committed expected windows', () => {
    const actual = {
      windowMs: WINDOW_MS,
      targetMs: a52.vsyncAppMedianGapMs,
      config: DEFAULT_GOVERNOR_CONFIG,
      windows: reference(),
    };
    if (process.env.UPDATE_GOLDEN === '1') writeFileSync(expectedPath, `${JSON.stringify(actual, null, 1)}\n`);
    const expected = JSON.parse(readFileSync(expectedPath, 'utf8'));
    expect(actual).toEqual(expected);
  });

  it('reaches identical governor decisions from the forwarded subset as from every window', () => {
    // A synthetic mixed stream: comfortable animation, a stress run, recovery, near-budget frames.
    const costs = [6, 6, 6, 25, 25, 25, 6, 6, 6, 6, 6, 6, 6, 6, 15, 15, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
    const all: GovernorEvent[] = [];
    const forwarded: GovernorEvent[] = [];
    let previous: FrameState | null = null;
    costs.forEach((cost, index) => {
      const start = index * WINDOW_MS;
      const window = {
        startMs: start,
        endMs: start + WINDOW_MS,
        frames: 30,
        averageMs: cost,
        targetMs: 16.667,
        worstMs: cost,
        droppedRatio: 0,
      };
      const event: GovernorEvent = { type: 'frame-window', at: start + WINDOW_MS, window };
      all.push(event);
      const state = classifyFrameWindow(window, DEFAULT_GOVERNOR_CONFIG);
      if (shouldForwardWindow(state, previous)) {
        forwarded.push(event);
        previous = state;
      }
    });
    const end: GovernorEvent = { type: 'tick', at: costs.length * WINDOW_MS + 1 };
    const options = { at: 0, levers: GURUDEVI_LEVERS, memorySensing: true };
    const full = replayGovernor(options, [...all, end]);
    const subset = replayGovernor(options, [...forwarded, end]);
    expect(forwarded.length).toBeLessThan(all.length);
    expect(subset.final.proposedLevels).toEqual(full.final.proposedLevels);
  });
});
