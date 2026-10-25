import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_VERGER_CONFIG } from './config';
import { admitWork, estimateAccounts } from './demand';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { LeverSpec, VergerEvent } from './types';

/** R5: the energy setpoint, hours of battery left at the measured drain against a reserve. */
const PREFETCH: LeverSpec = {
  id: 'prefetch',
  maxLevel: 2,
  visualImpact: 'low',
  target: 'energy',
  ambient: false,
  motion: false,
  levels: ['prefetch', 'on idle', 'none'],
  whenBatteryLow: 1,
};
const LEVERS = [...SAMPLE_LEVERS, PREFETCH];
const min = 60_000;
const level = (at: number, percent: number, pluggedIn: boolean | null = false): VergerEvent => ({
  type: 'battery',
  at,
  levelPercent: percent,
  pluggedIn,
  temperatureC: 30,
});
/** A reading every 5 minutes for `minutes`, falling `perHour` points an hour from `from`. */
const drain = (from: number, perHour: number, minutes: number): VergerEvent[] =>
  Array.from({ length: minutes / 5 + 1 }, (_, i) => level(i * 5 * min, from - (perHour * i * 5) / 60));

function run(events: readonly VergerEvent[], policy = VERGER_POLICY) {
  let state = policy.create({ at: 0, levers: LEVERS });
  for (const event of events) state = policy.reduce(state, event);
  return policy.snapshot(state);
}

describe('energy setpoint (R5)', () => {
  it('a fast drain that would not last the reserve is short, long before the battery is low', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      // 60% left, 30 points an hour: 2 hours, under the 3-hour reserve.
      const snapshot = run(drain(75, 30, 30), policy);
      expect(snapshot.battery.levelPercent).toBeCloseTo(60);
      expect(snapshot.batteryHoursLeft).toBeCloseTo(2, 1);
      expect(snapshot.energyShort).toBe(true);
      expect(snapshot.levels.prefetch).toBe(1);
      expect(estimateAccounts(snapshot, UNKNOWN_CAPACITY).energy.state).toBe('tight');
      expect(admitWork(snapshot, { class: 'deferrable', spends: ['energy'] })).toEqual({ admit: false, reason: 'battery-low' });
    }
  });

  it('a slow drain is not short, and does nothing', () => {
    // 60% left at 5 points an hour: 12 hours.
    const snapshot = run(drain(62.5, 5, 30));
    expect(snapshot.batteryHoursLeft).toBeCloseTo(12, 0);
    expect(snapshot.energyShort).toBe(false);
    expect(snapshot.levels.prefetch).toBe(0);
  });

  it('too short a record, or too small a drop, is no drain: never a limit on a guess', () => {
    expect(run(drain(75, 30, 5)).batteryHoursLeft).toBeNull();
    // 1 point in 30 minutes is under the 2-point minimum drop.
    expect(run(drain(61, 2, 30)).batteryHoursLeft).toBeNull();
  });

  it('plugging in starts the record over', () => {
    const events = [...drain(75, 30, 30), level(31 * min, 60, true)];
    const snapshot = run(events);
    expect(snapshot.batteryHoursLeft).toBeNull();
    expect(snapshot.energyShort).toBe(false);
  });

  it('a deaf power sensor forgets the record', async () => {
    const { resolveActivation, activationForMode } = await import('./activation');
    const deaf = resolveActivation(activationForMode('active'), { sense: { power: false } });
    const snapshot = run([...drain(75, 30, 30), { type: 'activation', at: 31 * min, activation: deaf }]);
    expect(snapshot.energyShort).toBe(false);
  });

  it('config: the minimum drop is a percentage', async () => {
    const { parseConfigPatch } = await import('./config');
    expect(parseConfigPatch({ energyDrainMinDropPercent: 101 }, DEFAULT_VERGER_CONFIG)).toHaveProperty('error');
  });
});
