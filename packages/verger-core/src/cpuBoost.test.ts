import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { activationForMode, resolveActivation } from './activation';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';

/** R9: the ADPF boost acts on reported frame work, so it is never asked for with frames deaf. */
describe('CPU boost needs the frames sensor (R9)', () => {
  const capacity = { ...UNKNOWN_CAPACITY, supportsCpuHints: true };
  const boost = (frames: boolean) => {
    const activation = resolveActivation(activationForMode('active'), { sense: { frames } });
    let state = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS, capacity, activation });
    state = VERGER_POLICY.reduce(state, { type: 'interaction', at: 100 });
    const snapshot = VERGER_POLICY.snapshot(state);
    expect(checkSnapshot(snapshot, SAMPLE_LEVERS)).toEqual([]);
    return snapshot.cpuBoost;
  };

  it('asked for while frames are sensed and the user is present', () => {
    expect(boost(true)).toBe(true);
  });

  it('never with the frames sensor off', () => {
    expect(boost(false)).toBe(false);
  });
});
