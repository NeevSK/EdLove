import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { createVergerState, reduceVerger, type VergerState } from './reducer';
import { compareClosedLoop } from './sim/metrics';
import { SIM_SESSIONS } from './sim/closedLoop';
import { SIM_PHONES } from './sim/plant';
import type { LeverGain, VergerEvent } from './types';
import { FLOORS_ACTIVATION } from './verger';

/** P7: p5 chooses among levers by measured gain per unit of quality, once confident. */
const stressed = (at: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs: 30, targetMs: 16.67, worstMs: 60, droppedRatio: 0.5 },
});

/** The lever the first frames-loop step lowers, with these gains already learned. */
function firstLowered(expansion: boolean, gains: Readonly<Record<string, LeverGain>>): string | undefined {
  const created = createVergerState({ at: 0, levers: SAMPLE_LEVERS, expansion });
  let state: VergerState = { ...created, leverGains: gains };
  for (const event of [stressed(500), stressed(1_000)]) state = reduceVerger(state, event);
  return state.stack[state.stack.length - 1];
}

const confident = (gain: number): LeverGain => ({ gain, samples: 5 });

describe('gain-guided choice (P7)', () => {
  it('without measurements both policies follow the declared order', () => {
    expect(firstLowered(false, {})).toBe('rows-ahead');
    expect(firstLowered(true, {})).toBe('rows-ahead');
  });

  it('p5 passes over a lever measured to do almost nothing; p4 does not', () => {
    const gains = { 'rows-ahead': confident(0.005) };
    expect(firstLowered(false, gains)).toBe('rows-ahead');
    expect(firstLowered(true, gains)).not.toBe('rows-ahead');
  });

  it('p5 prefers the most relief per unit of quality among measured levers', () => {
    // rows-ahead (low, 2 steps): 0.1 / 0.5 = 0.2; frosting (medium, 2 steps): 0.3 / 1 = 0.3.
    const gains = { 'rows-ahead': confident(0.1), frosting: confident(0.3) };
    expect(firstLowered(true, gains)).toBe('frosting');
    expect(firstLowered(false, gains)).toBe('rows-ahead');
  });

  it('a measurement below the confidence threshold does not steer', () => {
    const gains = { 'rows-ahead': { gain: 0.001, samples: 1 }, frosting: { gain: 0.9, samples: 1 } };
    expect(firstLowered(true, gains)).toBe('rows-ahead');
  });
});

describe('gain-guided choice in closed loop (P7, G2)', () => {
  // A host whose declaration is wrong: rows-ahead, declared least visible, barely helps; frosting,
  // declared more visible, helps a lot. p5 learns it; p4 cannot.
  const effects = {
    'rows-ahead': { costFactorPerStep: 0.99, memoryMbPerStep: 0 },
    frosting: { costFactorPerStep: 0.8, memoryMbPerStep: 0 },
  };
  for (const seed of [1, 2, 3]) {
    it(`high, seed ${seed}: p5 gives up less quality than p4 for no more jank`, () => {
      const report = compareClosedLoop({
        phone: SIM_PHONES.high,
        session: SIM_SESSIONS.identify,
        levers: SAMPLE_LEVERS,
        effects,
        seed,
        arms: {
          off: { policy: VERGER_POLICY, activation: FLOORS_ACTIVATION },
          p4: { policy: VERGER_POLICY, activation: ACTIVATION_PRESETS.active },
          p5: { policy: VERGER_POLICY_P5, activation: ACTIVATION_PRESETS.active },
        },
      });
      const p4 = report.p4;
      const p5 = report.p5;
      expect(p4 && p5).toBeTruthy();
      if (!p4 || !p5) return;
      expect(p5.jankShare).toBeLessThanOrEqual(p4.jankShare);
      expect(p5.qualityGivenUp).toBeLessThan(p4.qualityGivenUp - 0.01);
    });
  }
});
