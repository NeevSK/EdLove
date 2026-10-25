import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS, resolveActivation, type VergerActivation } from './activation';
import { isValidEvent } from './controller';
import { estimateAccounts } from './demand';
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
