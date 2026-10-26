import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS, resolveActivation, type VergerActivation } from './activation';
import { isValidEvent } from './controller';
import { admitWork, estimateAccounts } from './demand';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { LeverSpec, VergerEvent } from './types';
import { FLOORS_ACTIVATION } from './verger';

const PREFETCH: LeverSpec = {
  id: 'prefetch',
  maxLevel: 2,
  visualImpact: 'low',
  target: 'energy',
  alsoRelieves: ['network'],
  ambient: false,
  motion: false,
  levels: ['prefetch', 'on idle', 'none'],
  whenStorageLow: 2,
};
const LEVERS = [...SAMPLE_LEVERS, PREFETCH];
const MB = 1024 ** 2;

function after(events: readonly VergerEvent[], activation: VergerActivation = FLOORS_ACTIVATION, policy = VERGER_POLICY) {
  let state = policy.create({ at: 0, levers: LEVERS, activation });
  for (const event of events) state = policy.reduce(state, event);
  return policy.snapshot(state);
}

describe('storage as a limit (B4)', () => {
  it('free storage below the threshold holds the levers that declare it, with only the floors running', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      const low = after([{ type: 'storage', at: 10, freeBytes: 100 * MB }], FLOORS_ACTIVATION, policy);
      expect(low.storage).toBe('low');
      expect(low.levels.prefetch).toBe(2);
      expect(checkSnapshot(low, LEVERS)).toEqual([]);
    }
    const ample = after([{ type: 'storage', at: 10, freeBytes: 4096 * MB }]);
    expect(ample.storage).toBe('ample');
    expect(ample.levels.prefetch).toBe(0);
  });

  it('unknown storage is never a limit; a deaf sensor hears nothing and forgets the last reading', () => {
    expect(after([{ type: 'storage', at: 10, freeBytes: null }]).storage).toBe('unknown');
    const deaf = resolveActivation(FLOORS_ACTIVATION, { sense: { storage: false } });
    expect(after([{ type: 'storage', at: 10, freeBytes: MB }], deaf).storage).toBe('unknown');
    const forgotten = after([
      { type: 'storage', at: 10, freeBytes: MB },
      { type: 'activation', at: 20, activation: deaf },
    ]);
    expect(forgotten.storage).toBe('unknown');
    expect(forgotten.levels.prefetch).toBe(0);
  });

  it('the storage account reads the level', () => {
    const low = after([{ type: 'storage', at: 10, freeBytes: MB }]);
    expect(estimateAccounts(low, UNKNOWN_CAPACITY).storage).toMatchObject({ state: 'overdrawn' });
    expect(estimateAccounts(after([]), UNKNOWN_CAPACITY).storage.state).toBe('unknown');
  });

  it('rejects a reading a defective sensor could produce', () => {
    expect(isValidEvent({ type: 'storage', at: 1, freeBytes: Number.NaN })).toBe(false);
    expect(isValidEvent({ type: 'storage', at: 1, freeBytes: null })).toBe(true);
    expect(isValidEvent({ type: 'input-delay', at: 1, durationMs: Number.POSITIVE_INFINITY })).toBe(false);
  });
});

describe('input delay as evidence of contention (B7)', () => {
  const delays = (ms: number): VergerEvent[] => [1000, 1500, 2000, 2500].map((at) => ({ type: 'input-delay', at, durationMs: ms }));

  it('long-delayed inputs count as long tasks; short ones do not', () => {
    const active = ACTIVATION_PRESETS.active;
    expect(after(delays(300), active).contention).not.toBe('none');
    expect(after(delays(20), active).contention).toBe('none');
  });

  it('is heard with the long-task sensor: deaf, it changes nothing', () => {
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, { sense: { longTasks: false } });
    // Only the clock moves.
    const { at: _heard, ...heard } = after(delays(300), deaf);
    const { at: _quiet, ...quiet } = after([{ type: 'tick', at: 2500 }], deaf);
    expect(heard).toEqual(quiet);
  });
});

describe('event-loop lag and GC pauses as stall evidence', () => {
  const at = [1000, 1500, 2000, 2500];
  it('lag and GC share at or above their thresholds count; below do not', () => {
    const active = ACTIVATION_PRESETS.active;
    expect(after(at.map((t) => ({ type: 'event-loop-lag', at: t, lagMs: 250 }) as const), active).contention).not.toBe('none');
    expect(after(at.map((t) => ({ type: 'event-loop-lag', at: t, lagMs: 30 }) as const), active).contention).toBe('none');
    expect(after(at.map((t) => ({ type: 'js-heap', at: t, gcPauseShare: 0.2, allocatedBytes: null }) as const), active).contention).not.toBe('none');
    expect(after(at.map((t) => ({ type: 'js-heap', at: t, gcPauseShare: 0.01, allocatedBytes: 1 }) as const), active).contention).toBe('none');
  });
});

describe('low storage and admission: a per-workload decision', () => {
  const low = { networkLimit: 'none', powerSaver: false, battery: { levelPercent: null, pluggedIn: null, temperatureC: null }, storage: 'low' } as const;
  it('holds only deferrable work that declares it waits; never critical work, never undeclared work', () => {
    expect(admitWork(low, { class: 'deferrable', spends: ['storage'], whenStorageLow: 'wait' })).toEqual({ admit: false, reason: 'storage-low' });
    expect(admitWork(low, { class: 'deferrable', spends: ['storage', 'cpu'] }).admit).toBe(true);
    expect(admitWork(low, { class: 'critical', spends: ['storage'], whenStorageLow: 'wait' }).admit).toBe(true);
    expect(admitWork({ ...low, storage: 'unknown' }, { class: 'deferrable', spends: ['storage'], whenStorageLow: 'wait' }).admit).toBe(true);
  });
});

describe('compute pressure as evidence of contention (R10)', () => {
  const pressure = (state: 'nominal' | 'fair' | 'serious' | 'critical', at = 1000): VergerEvent => ({
    type: 'compute-pressure',
    at,
    state,
  });

  const stall: VergerEvent = { type: 'long-task', at: 1500, durationMs: 120 };

  it('under serious or critical, one long task is JS contention; under nominal or fair it is not', () => {
    const active = ACTIVATION_PRESETS.active;
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      expect(after([pressure('serious'), stall], active, policy).contention).toBe('js');
      expect(after([pressure('critical'), stall], active, policy).contention).toBe('js');
      expect(after([pressure('fair'), stall], active, policy).contention).toBe('none');
      expect(after([pressure('critical'), pressure('nominal', 1200), stall], active, policy).contention).toBe('none');
    }
  });

  it('pressure alone is never contention, and the long task ages out: no reading means no hold', () => {
    const active = ACTIVATION_PRESETS.active;
    expect(after([pressure('critical')], active).contention).toBe('none');
    expect(after([pressure('critical'), stall, { type: 'tick', at: 30_000 }], active).contention).toBe('none');
  });

  it('is heard with the threads sensor: deaf, it changes nothing, and deafening forgets it', () => {
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, { sense: { threads: false } });
    expect(after([pressure('critical'), stall], deaf).contention).toBe('none');
    expect(
      after([pressure('critical'), { type: 'activation', at: 1200, activation: deaf }, stall], ACTIVATION_PRESETS.active)
        .contention,
    ).toBe('none');
  });

  it('rejects a state the spec does not define', () => {
    expect(isValidEvent(pressure('serious'))).toBe(true);
    const bogus = { type: 'compute-pressure', at: 1, state: 'hot' };
    expect(isValidEvent(bogus as VergerEvent)).toBe(false);
  });
});

describe('CPU headroom as evidence of a busy device (R11)', () => {
  const headroom = (percent: number | null, at = 1000): VergerEvent => ({ type: 'cpu-headroom', at, percent });
  const stall: VergerEvent = { type: 'long-task', at: 1500, durationMs: 120 };

  it('under the busy line one long task is JS contention; above it, or alone, it is not', () => {
    const active = ACTIVATION_PRESETS.active;
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      expect(after([headroom(5), stall], active, policy).contention).toBe('js');
      expect(after([headroom(40), stall], active, policy).contention).toBe('none');
      expect(after([headroom(5)], active, policy).contention).toBe('none');
      // No value (NaN on the platform) is no reading: busy does not outlive its evidence.
      expect(after([headroom(5), headroom(null, 1200), stall], active, policy).contention).toBe('none');
    }
  });

  it('is heard with the threads sensor, and deafening forgets it', () => {
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, { sense: { threads: false } });
    expect(after([headroom(5), stall], deaf).contention).toBe('none');
    expect(
      after([headroom(5), { type: 'activation', at: 1200, activation: deaf }, stall], ACTIVATION_PRESETS.active)
        .contention,
    ).toBe('none');
  });

  it('rejects a reading outside 0 to 100; the busy line is a percentage', async () => {
    expect(isValidEvent(headroom(0))).toBe(true);
    expect(isValidEvent(headroom(null))).toBe(true);
    expect(isValidEvent(headroom(101))).toBe(false);
    expect(isValidEvent(headroom(Number.NaN))).toBe(false);
    expect(isValidEvent({ type: 'data-usage', at: 1, totalBytes: Number.POSITIVE_INFINITY })).toBe(false);
    const { DEFAULT_VERGER_CONFIG, parseConfigPatch } = await import('./config');
    expect(parseConfigPatch({ cpuHeadroomBusyPercent: 101 }, DEFAULT_VERGER_CONFIG)).toHaveProperty('error');
  });
});
