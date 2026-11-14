import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { isValidEvent } from './controller';
import { DEFAULT_VERGER_CONFIG } from './config';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { createVergerState, reduceVerger, snapshotOf, type VergerState } from './reducer';
import type { LeverGain, VergerEvent } from './types';

/** R2 (proportional lowering), R3 (screen annotations), R4 (screen memory). */
const TARGET = 16.67;
const frame = (at: number, averageMs: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: {
    startMs: at - 500,
    endMs: at,
    frames: 30,
    averageMs,
    targetMs: TARGET,
    worstMs: averageMs * 2,
    droppedRatio: averageMs > TARGET * 1.25 ? 0.5 : 0,
  },
});
const screen = (at: number, name: string, transitionMs?: number): VergerEvent =>
  transitionMs === undefined ? { type: 'screen', at, name } : { type: 'screen', at, name, transitionMs };
const confident = (gain: number): LeverGain => ({ gain, samples: 10 });
const depth = (state: VergerState) => Object.values(state.pressure).reduce((a, b) => a + b, 0);

function run(state: VergerState, events: readonly VergerEvent[]): VergerState {
  let next = state;
  for (const event of events) next = reduceVerger(next, event);
  return next;
}

describe('proportional lowering (R2, p5)', () => {
  const gains = { 'rows-ahead': confident(0.1), sparkle: confident(0.1), frosting: confident(0.1) };

  it('far over budget with confident gains: several steps in one action, up to maxStepsPerAction', () => {
    const start: VergerState = { ...createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion: true }), leverGains: gains };
    // Load 2.4: one step of 0.1 leaves it far over; the action takes the most it may.
    const after = run(start, [frame(500, 40), frame(1_000, 40)]);
    expect(depth(after)).toBe(DEFAULT_VERGER_CONFIG.maxStepsPerAction);
    expect(snapshotOf(after).lastReason).toMatch(/sized by measured gains/);
  });

  it('just over budget: one step is enough, so one step it is', () => {
    const start: VergerState = { ...createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion: true }), leverGains: gains };
    // Load 1.05 over the stress line by dropped frames: one step of 0.1 brings it under 1.
    const nearly: VergerEvent[] = [500, 1_000].map((at) => ({
      type: 'frame-window',
      at,
      window: { startMs: at - 500, endMs: at, frames: 30, averageMs: 17.5, targetMs: TARGET, worstMs: 40, droppedRatio: 0.5 },
    }));
    expect(depth(run(start, nearly))).toBe(1);
  });

  it('without confident gains, and in p4, the ladder takes one step', () => {
    const p5 = run(createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion: true }), [frame(500, 40), frame(1_000, 40)]);
    expect(depth(p5)).toBe(1);
    const p4: VergerState = { ...createVergerState({ at: 0, levers: SAMPLE_LEVERS }), leverGains: gains };
    expect(depth(run(p4, [frame(500, 40), frame(1_000, 40)]))).toBe(1);
  });
});

describe('screen annotations (R3)', () => {
  it('is a valid event only with a name and a non-negative transition', () => {
    expect(isValidEvent(screen(1, 'home'))).toBe(true);
    expect(isValidEvent(screen(1, 'home', 300))).toBe(true);
    expect(isValidEvent(screen(1, ''))).toBe(false);
    expect(isValidEvent(screen(1, 'home', -1))).toBe(false);
    expect(isValidEvent(screen(1, 'home', Number.NaN))).toBe(false);
  });

  it('frames within an announced transition are neither stress nor comfort', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      let state = policy.create({ at: 0, levers: SAMPLE_LEVERS });
      for (const event of [screen(1, 'workspace', 2_000), frame(500, 40), frame(1_000, 40), frame(1_500, 40)])
        state = policy.reduce(state, event);
      expect(policy.snapshot(state).levels).toEqual(policy.snapshot(policy.create({ at: 0, levers: SAMPLE_LEVERS })).levels);
      // After it, the same frames are stress again.
      for (const event of [frame(2_500, 40), frame(3_000, 40)]) state = policy.reduce(state, event);
      expect(Object.values(policy.snapshot(state).pressure).some((p) => p > 0)).toBe(true);
    }
  });

  it('a new screen ends the stress episode and the gain probe: demand changes are not a lever’s effect', () => {
    let state = createVergerState({ at: 0, levers: SAMPLE_LEVERS });
    state = run(state, [frame(500, 40), frame(1_000, 40)]);
    expect(state.gainProbe).not.toBeNull();
    state = run(state, [screen(1_100, 'reading'), frame(1_500, 5)]);
    expect(state.gainProbe).toBeNull();
    expect(state.leverGains).toEqual({});
    expect(state.frameEpisode).toBeNull();
  });
});

describe('screen memory (R4, p5)', () => {
  const gains = { 'rows-ahead': confident(0.1), sparkle: confident(0.1), frosting: confident(0.15) };

  it('levers lowered on a screen, measured to help, are lowered again on arrival', () => {
    let state: VergerState = { ...createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion: true }), leverGains: gains };
    state = run(state, [screen(1, 'workspace'), frame(500, 40), frame(1_000, 40)]);
    const settled = { ...state.pressure };
    expect(depth(state)).toBeGreaterThan(0);
    // Leave, let it all come back, return.
    state = run(state, [screen(2_000, 'home')]);
    for (let at = 2_500; at <= 120_000; at += 500) state = reduceVerger(state, frame(at, 5));
    expect(depth(state)).toBe(0);
    state = run(state, [screen(120_100, 'workspace')]);
    expect(state.pressure).toEqual(settled);
    expect(snapshotOf(state).lastReason).toMatch(/remembered from the last visit/);
  });

  it('an unmeasured lever is not replayed: memory must not freeze a first visit’s guesses', () => {
    let state = createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion: true });
    state = run(state, [screen(1, 'workspace'), frame(500, 40), frame(1_000, 40)]);
    expect(depth(state)).toBeGreaterThan(0);
    state = run(state, [screen(2_000, 'home')]);
    for (let at = 2_500; at <= 120_000; at += 500) state = reduceVerger(state, frame(at, 5));
    state = run(state, [screen(120_100, 'workspace')]);
    expect(depth(state)).toBe(0);
  });

  it('p4 keeps no screen memory', () => {
    let state: VergerState = { ...createVergerState({ at: 0, levers: SAMPLE_LEVERS }), leverGains: gains };
    state = run(state, [screen(1, 'workspace'), frame(500, 40), frame(1_000, 40), screen(2_000, 'home')]);
    expect(state.screenMemory).toEqual({});
  });
});
