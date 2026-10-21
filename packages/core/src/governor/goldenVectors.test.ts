import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import a52 from './__fixtures__/a52-self-idle.json';
import {
  aggregateFrames,
  classifyFrameWindow,
  DEFAULT_GOVERNOR_CONFIG,
  type FrameState,
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

describe('golden vectors shared with the Kotlin estimator', () => {
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
