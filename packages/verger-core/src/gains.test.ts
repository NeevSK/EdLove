import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import { DEFAULT_VERGER_CONFIG } from './config';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { runClosedLoop, SIM_SESSIONS } from './sim/closedLoop';
import { defaultEffect, SIM_PHONES } from './sim/plant';
import type { FrameWindow, VergerEvent } from './types';

/** P6: each lever's gain measured from the frames after a single-step lowering. */
const TARGET = 16.67;
const frame = (endMs: number, averageMs: number): VergerEvent => ({
  type: 'frame-window',
  at: endMs,
  window: {
    startMs: endMs - 500,
    endMs,
    frames: 30,
    averageMs,
    targetMs: TARGET,
    worstMs: averageMs * 2,
    droppedRatio: averageMs > TARGET * 1.25 ? 0.5 : 0,
  } satisfies FrameWindow,
});

function run(events: readonly VergerEvent[], policy = VERGER_POLICY) {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS });
  for (const event of events) state = policy.reduce(state, event);
  return policy.snapshot(state);
}

describe('lever gain estimation (P6)', () => {
  it('a step that makes frames 20% lighter is measured as a gain of 0.2', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      // Two stressed windows lower one lever at 1 s; the window after it is a fifth lighter.
      const snapshot = run([frame(500, 30), frame(1_000, 30), frame(1_500, 24)], policy);
      const measured = Object.entries(snapshot.gains);
      expect(measured).toHaveLength(1);
      expect(measured[0]?.[1].gain).toBeCloseTo(0.2);
      expect(measured[0]?.[1].samples).toBe(1);
    }
  });

  it('a step that changes nothing is a gain near 0, not missing', () => {
    const snapshot = run([frame(500, 30), frame(1_000, 30), frame(1_500, 30)]);
    expect(Object.values(snapshot.gains).map((g) => g.gain)).toEqual([0]);
  });

  it('a second step is measured against the smoothed load just before it', () => {
    const snapshot = run([
      frame(500, 30),
      frame(1_000, 30), // first step
      frame(1_500, 24), // its sample: 1 - 24/30 = 0.2
      frame(2_000, 24), // second step
      frame(2_500, 21.6), // its sample, against the smoothed load at 2 s
    ]);
    const load = (ms: number) => ms / TARGET;
    const smoothed = [30, 30, 24, 24].map(load).reduce((s, l, i) => (i === 0 ? l : (s + l) / 2));
    const second = 1 - load(21.6) / smoothed;
    const a = DEFAULT_VERGER_CONFIG.gainAlpha;
    const gains = Object.values(snapshot.gains);
    expect(gains.reduce((sum, g) => sum + g.samples, 0)).toBe(2);
    // Two levers measured once each, or one lever twice through the EWMA.
    const values = gains.map((g) => g.gain).sort();
    const expected = gains.length === 2 ? [0.2, second].sort() : [0.2 + a * (second - 0.2)];
    values.forEach((v, i) => expect(v).toBeCloseTo(expected[i] ?? Number.NaN, 9));
  });

  it('a window that began before the change is not evidence of it', () => {
    // The 1 s window decided the step; its successor must start at or after 1 s.
    const snapshot = run([
      frame(500, 30),
      frame(1_000, 30),
      { type: 'frame-window', at: 1_200, window: { startMs: 900, endMs: 1_200, frames: 18, averageMs: 10, targetMs: TARGET, worstMs: 12, droppedRatio: 0 } },
    ]);
    expect(snapshot.gains).toEqual({});
  });

  it('a change of two levers at once is confounded: no sample', () => {
    // Critical heat lowers three steps at once (fast decrease).
    const snapshot = run([
      frame(500, 20),
      { type: 'thermal', at: 600, status: 'critical', headroom: 1.05 },
      frame(1_000, 10),
    ]);
    expect(snapshot.gains).toEqual({});
  });
});

describe('gains converge on the plant model (P6, G2)', () => {
  // The identify session publishes one step at a time. True gains on the model: a gpu step 0.14,
  // a cpu step 0.10 of the frame cost (the rich stretch has no work levers cannot reduce).
  const truth = (id: string) => {
    const lever = SAMPLE_LEVERS.find((l) => l.id === id);
    if (!lever) throw new Error(id);
    return 1 - defaultEffect(lever).costFactorPerStep;
  };
  for (const [name, expected] of [['mid', ['rows-ahead', 'frosting']], ['high', ['rows-ahead']]] as const) {
    for (const seed of [1, 2, 3]) {
      it(`${name}, seed ${seed}: ${expected.join(' and ')} within 0.05 of the model`, () => {
        const { final } = runClosedLoop({
          phone: SIM_PHONES[name],
          session: SIM_SESSIONS.identify,
          levers: SAMPLE_LEVERS,
          policy: VERGER_POLICY,
          activation: ACTIVATION_PRESETS.active,
          seed,
        });
        for (const id of expected) {
          const g = final.gains[id];
          expect(g, id).toBeDefined();
          expect(g?.samples ?? 0, id).toBeGreaterThanOrEqual(5);
          expect(Math.abs((g?.gain ?? Number.NaN) - truth(id)), id).toBeLessThanOrEqual(0.05);
        }
      });
    }
  }
});
