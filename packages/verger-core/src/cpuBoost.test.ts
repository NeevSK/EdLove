import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { activationForMode, resolveActivation } from './activation';
import { checkSnapshot } from './invariants';
import { VERGER_POLICY } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';

/**
 * R9: the ADPF boost acts on reported frame work, so it is asked for only once frame reports
 * arrive: never with frames deaf, and never before the first report (a deaf sensor must act like
 * a silent one; found by the deaf-sensor property at 3000 runs, seed 970816213).
 */
describe('CPU boost needs frame reports (R9)', () => {
  const capacity = { ...UNKNOWN_CAPACITY, supportsCpuHints: true };
  const boost = (frames: boolean, reported = true) => {
    const activation = resolveActivation(activationForMode('active'), { sense: { frames } });
    let state = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS, capacity, activation });
    if (reported)
      state = VERGER_POLICY.reduce(state, {
        type: 'frame-window',
        at: 50,
        window: { startMs: 0, endMs: 50, frames: 3, averageMs: 8, targetMs: 16.67, worstMs: 10, droppedRatio: 0 },
      });
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

  it('not before the first frame report, even with the sensor on', () => {
    expect(boost(true, false)).toBe(false);
  });
});
