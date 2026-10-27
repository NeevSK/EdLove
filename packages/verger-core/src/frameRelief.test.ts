import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import type { FrameWindow, VergerEvent } from './types';

/** P8: the frames loop stops lowering when its steps do not bring frame cost toward the budget. */
const TARGET = 16.67;
const window = (endMs: number, averageMs: number): FrameWindow => ({
  startMs: endMs - 500,
  endMs,
  frames: 30,
  averageMs,
  targetMs: TARGET,
  worstMs: averageMs * 2,
  droppedRatio: averageMs > TARGET * 1.25 ? 0.5 : 0,
});
const frames = (from: number, count: number, cost: (i: number) => number): VergerEvent[] =>
  Array.from({ length: count }, (_, i) => ({
    type: 'frame-window',
    at: from + (i + 1) * 500,
    window: window(from + (i + 1) * 500, cost(i)),
  }));

function run(events: readonly VergerEvent[], policy = VERGER_POLICY) {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS });
  const depth: number[] = [];
  for (const event of events) {
    state = policy.reduce(state, event);
    depth.push(Object.values(policy.snapshot(state).pressure).reduce((sum, level) => sum + level, 0));
  }
  return { snapshot: policy.snapshot(state), depth };
}

describe('frames loop relief check (P8)', () => {
  it('work no lever reduces: two steps, then it stops and says why', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      const { snapshot, depth } = run(frames(0, 40, () => 40), policy);
      expect(depth[depth.length - 1]).toBe(2);
      expect(snapshot.lastReason).toMatch(/not relieved by levers/);
    }
  });

  it('steps that bring frames toward the budget keep going', () => {
    // Each window after a step is a fifth of the gap cheaper: relief, so the ladder continues.
    let cost = 40;
    const { depth } = run(
      frames(0, 12, (i) => {
        if (i > 0 && i % 2 === 0) cost -= (40 - TARGET) / 5;
        return cost;
      }),
    );
    expect(depth[depth.length - 1]).toBeGreaterThan(2);
  });

  it('frames back within budget end the episode; the next stress may lower again', () => {
    const { depth } = run([
      ...frames(0, 20, () => 40),
      ...frames(10_000, 1, () => 10),
      ...frames(10_500, 4, () => 40),
    ]);
    expect(depth[19]).toBe(2);
    // A fresh episode gets its own steps before it is judged.
    expect(depth[depth.length - 1]).toBe(4);
  });

  it('heat still lowers when the frames loop has stopped', () => {
    const { depth } = run([
      ...frames(0, 20, () => 40),
      { type: 'thermal', at: 10_100, status: 'critical', headroom: 1.05 },
    ]);
    expect(depth[depth.length - 1]).toBeGreaterThan(2);
  });

  it('R7: mid-screen, after a cheap step that did not help, a costly one is not taken', () => {
    const levers = [
      { id: 'shimmer', maxLevel: 1, visualImpact: 'low' as const, target: 'gpu' as const, ambient: false, motion: true, levels: ['on', 'off'] },
      { id: 'all-motion', maxLevel: 1, visualImpact: 'high' as const, target: 'gpu' as const, ambient: false, motion: true, levels: ['on', 'off'] },
    ];
    const run = (screenAt: number | null) => {
      let state = VERGER_POLICY.create({ at: 0, levers });
      if (screenAt !== null) state = VERGER_POLICY.reduce(state, { type: 'screen', at: screenAt, name: 'workspace' });
      for (const event of frames(10_000, 12, () => 40)) state = VERGER_POLICY.reduce(state, event);
      return VERGER_POLICY.snapshot(state);
    };
    // Mid-screen (stress 10 s after the screen opened): one cheap step (quality cost 1) did not
    // help and spent the budget of 1, so the high-impact lever (3) never comes.
    const mid = run(0);
    expect(mid.levels['all-motion']).toBe(0);
    expect(mid.lastReason).toMatch(/not relieved by levers/);
    // On arrival (the screen opened just now), the screen's own weight: the ladder takes its steps.
    expect(run(9_900).levels['all-motion']).toBe(1);
  });
});
