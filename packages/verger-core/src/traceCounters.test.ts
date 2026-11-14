import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { createVergerState, reduceVerger, snapshotOf } from './index';
import { decisionCounters } from './traceCounters';

describe('decisions as system-trace counters', () => {
  it('names every lever and the heat, memory and optional work verger acts on', () => {
    let state = createVergerState({ at: 0, levers: SAMPLE_LEVERS });
    state = reduceVerger(state, { type: 'thermal', at: 1, status: 'severe', headroom: null });
    const snapshot = snapshotOf(state);
    const counters = decisionCounters(snapshot);
    for (const lever of SAMPLE_LEVERS)
      expect(counters[`verger.lever.${lever.id}`]).toBe(snapshot.levels[lever.id]);
    expect(counters['verger.optional']).toBe(snapshot.optionalConcurrency);
    expect(counters['verger.thermal']).toBeGreaterThan(0);
    expect(Object.values(counters).every((v) => Number.isFinite(v))).toBe(true);
  });

  it('an unknown reading counts 0, never as calm', () => {
    const counters = decisionCounters(snapshotOf(createVergerState({ at: 0, levers: SAMPLE_LEVERS })));
    expect(counters['verger.thermal']).toBe(0);
    expect(counters['verger.memory']).toBe(0);
  });
});
