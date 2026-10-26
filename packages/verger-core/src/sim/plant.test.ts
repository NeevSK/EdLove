import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from '../__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from '../activation';
import { VERGER_POLICY } from '../policy';
import { FLOORS_ACTIVATION } from '../verger';
import { runClosedLoop, SIM_SESSIONS } from './closedLoop';
import { type PlantState, SIM_PHONES, stepPlant, throttleOf } from './plant';

const phone = SIM_PHONES.mid;
const none = { levels: {}, refreshCapHz: null, globalReducedMotion: false } as const;
const idle = { baseCostMs: 0, extraCostMs: 0, visible: false };

describe('the plant model', () => {
  it('cools with its time constant: after one tau, 63% of the gap to its resting point is gone', () => {
    let state: PlantState = { temperatureC: 45 };
    let rest = 0;
    for (let t = 0; t < phone.thermal.tauMs; t += 500) {
      const step = stepPlant(phone, state, idle, none, [], {}, 500, 1);
      state = step.state;
      rest = phone.thermal.ambientC + phone.thermal.risePerLoadC * step.utilisation;
    }
    const closed = (45 - state.temperatureC) / (45 - rest);
    expect(closed).toBeGreaterThan(0.6);
    expect(closed).toBeLessThan(0.66);
  });

  it('settles at ambient plus its rise times utilisation', () => {
    let state: PlantState = { temperatureC: phone.thermal.ambientC };
    let utilisation = 0;
    for (let t = 0; t < 20 * phone.thermal.tauMs; t += 500) {
      const step = stepPlant(phone, state, { baseCostMs: 4, extraCostMs: 0, visible: true }, none, [], {}, 500, 1);
      state = step.state;
      utilisation = step.utilisation;
    }
    expect(state.temperatureC).toBeCloseTo(phone.thermal.ambientC + phone.thermal.risePerLoadC * utilisation, 1);
  });

  it('throttles above its threshold, and each lever step makes frames cheaper by its factor', () => {
    expect(throttleOf(phone, phone.thermal.throttleFromC)).toBe(1);
    expect(throttleOf(phone, phone.thermal.throttleFromC + 4)).toBeCloseTo(1 + 4 * phone.thermal.throttlePerC);
    const demand = { baseCostMs: 10, extraCostMs: 0, visible: true };
    const cool = { temperatureC: 30 };
    const full = stepPlant(phone, cool, demand, none, SAMPLE_LEVERS, {}, 500, 1).costMs;
    const lowered = stepPlant(phone, cool, demand, { ...none, levels: { sparkle: 2 } }, SAMPLE_LEVERS, { sparkle: { costFactorPerStep: 0.5, memoryMbPerStep: 0 } }, 500, 1).costMs;
    expect(lowered / full).toBeCloseTo(0.25);
  });

  it('a refresh cap lengthens the frame deadline; memory levers free memory', () => {
    const demand = { baseCostMs: 5, extraCostMs: 0, visible: true };
    const cool = { temperatureC: 30 };
    expect(stepPlant(phone, cool, demand, { ...none, refreshCapHz: 60 }, [], {}, 500, 1).targetMs).toBeCloseTo(1000 / 60);
    const cache = SAMPLE_LEVERS.find((l) => l.target === 'memory');
    if (!cache) throw new Error('no memory lever in the fixture');
    const before = stepPlant(phone, cool, demand, none, SAMPLE_LEVERS, {}, 500, 1).availableMb;
    const after = stepPlant(phone, cool, demand, { ...none, levels: { [cache.id]: 1 } }, SAMPLE_LEVERS, {}, 500, 1).availableMb;
    expect(after).toBeGreaterThan(before);
  });
});

describe('closed loop', () => {
  const run = (policy: 'off' | 'p4', seed = 1) =>
    runClosedLoop({
      phone,
      session: SIM_SESSIONS.heatSoak,
      policy: VERGER_POLICY,
      levers: SAMPLE_LEVERS,
      activation: policy === 'off' ? FLOORS_ACTIVATION : ACTIVATION_PRESETS.active,
      seed,
    }).ticks;

  it('is deterministic for a seed, and the seed matters', () => {
    expect(run('p4', 7)).toEqual(run('p4', 7));
    expect(run('p4', 7)).not.toEqual(run('p4', 8));
  });

  it('closing the loop cuts jank and heat on a heat soak, where the floors alone cannot', () => {
    const jank = (ticks: ReturnType<typeof run>) =>
      ticks.filter((t) => t.visible && t.costMs > t.targetMs * 1.25).length / ticks.length;
    const peak = (ticks: ReturnType<typeof run>) => Math.max(...ticks.map((t) => t.temperatureC));
    const off = run('off');
    const p4 = run('p4');
    expect(jank(p4)).toBeLessThan(jank(off) / 4);
    expect(peak(p4)).toBeLessThan(peak(off) - 2);
  });
});
