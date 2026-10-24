import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { createGovernor, reduceGovernor } from './governor';
import { defineHost } from './host';
import {
  canonicalLadderKey,
  ladderKey,
  policyKey,
  VERGER_POLICY,
  type VergerPolicy,
  validatePolicy,
} from './policy';
import { replayGovernor } from './replay';
import type { CapacityFacts, GovernorEvent, GovernorSnapshot } from './types';
import { createVerger, type VergerPlatform } from './verger';

const CAPACITY: CapacityFacts = {
  totalMemoryBytes: 8 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 120,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 120],
  supportsCpuHints: true,
};

/** One stressed half-second: under verger's rules too short to act on (750 ms needed). */
const STREAM: readonly GovernorEvent[] = [
  { type: 'interaction', at: 0 },
  {
    type: 'frame-window',
    at: 500,
    window: { startMs: 0, endMs: 500, frames: 30, averageMs: 30, targetMs: 16.7, worstMs: 35, droppedRatio: 0.3 },
  },
];

/** A rival policy: verger's rules with a quicker trigger, as a lab would compare. */
const EAGER: VergerPolicy = {
  ...VERGER_POLICY,
  id: 'eager',
  version: 1,
  create: (options) =>
    createGovernor({ ...options, config: { ...options.config, downgradeAfterMs: 250 } }),
};

/** A policy that is not verger's code at all: it lowers everything, always. */
const FLOOR: VergerPolicy<{ at: number; version: number }> = {
  id: 'floor',
  version: 1,
  create: (options) => ({ at: options.at, version: 0 }),
  reduce: (state, event) => ({ at: Math.max(state.at, event.at), version: state.version }),
  snapshot(state, at = state.at): GovernorSnapshot {
    const levels = Object.fromEntries(SAMPLE_LEVERS.map((lever) => [lever.id, lever.maxLevel]));
    const base = VERGER_POLICY.snapshot(createGovernor({ at, levers: SAMPLE_LEVERS }));
    return { ...base, version: state.version, levels, proposedLevels: levels };
  },
  outputVersion: (state) => state.version,
  nextTimedChangeAt: () => null,
};

const options = { at: 0, levers: SAMPLE_LEVERS, capacity: CAPACITY, memorySensing: true };

describe('policy as a swappable unit', () => {
  it('two policies give different answers on the same recorded stream', () => {
    expect(replayGovernor(options, STREAM).final.pressure).toEqual({});
    expect(Object.keys(replayGovernor(options, STREAM, EAGER).final.pressure)).not.toHaveLength(0);
  });

  it('a host decides by the policy it brings, and its keys name that policy', () => {
    const own = defineHost({ name: 'sample', levers: SAMPLE_LEVERS });
    const eager = defineHost({ name: 'sample', levers: SAMPLE_LEVERS, policy: EAGER });
    expect(own.policy).toBe(VERGER_POLICY);
    expect(own.experimentKey).toBe(`sample-${policyKey(VERGER_POLICY)}`);
    expect(eager.experimentKey).toBe('sample-eager-p1');
  });

  it('a policy that is not verger code runs the whole loop through the same contract', async () => {
    const host = defineHost({ name: 'sample', levers: SAMPLE_LEVERS, policy: FLOOR });
    const platform = (): VergerPlatform => ({
      readCapacity: () => CAPACITY,
      memorySensing: true,
      createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
    });
    const verger = createVerger({ host, platform, requested: 'active', release: '1', now: () => 0 });
    await verger.start();
    expect(verger.getSnapshot()?.levels.sparkle).toBe(2);
    expect(verger.getSnapshot()?.levels['rows-ahead']).toBe(2);
    await verger.stop();
  });

  it('rejects a policy with a bad name or version', () => {
    expect(() => validatePolicy({ ...VERGER_POLICY, id: 'Bad Name' })).toThrow();
    expect(() => validatePolicy({ ...VERGER_POLICY, version: 0 })).toThrow();
  });
});

describe('the ladder key, a persisted format', () => {
  it('is pinned: changing it needs a migration and a new pin', () => {
    expect(ladderKey(VERGER_POLICY, 'abc', '1.2.0+34')).toBe(`verger-p${VERGER_POLICY.version}:abc:1.2.0+34`);
    expect(ladderKey(EAGER, 'abc', '1')).toBe('eager-p1:abc:1');
  });

  it('reads keys from before policies were named as verger\'s own, and leaves others alone', () => {
    expect(canonicalLadderKey('p4:abc:1.0.0')).toBe('verger-p4:abc:1.0.0');
    expect(canonicalLadderKey('verger-p4:abc:1.0.0')).toBe('verger-p4:abc:1.0.0');
    expect(canonicalLadderKey('eager-p1:abc:1')).toBe('eager-p1:abc:1');
    // A release that merely contains "p4:" is not a legacy prefix.
    expect(canonicalLadderKey('verger-p5:abc:p4:x')).toBe('verger-p5:abc:p4:x');
  });
});

describe('live tuning', () => {
  it('a config event changes thresholds from that moment, deterministically', () => {
    let state = createGovernor(options);
    state = reduceGovernor(state, {
      type: 'config',
      at: 0,
      config: { ...DEFAULT_GOVERNOR_CONFIG, downgradeAfterMs: 250 },
    });
    for (const event of STREAM) state = reduceGovernor(state, event);
    expect(Object.keys(state.pressure)).not.toHaveLength(0);
  });

  it('Verger.tune validates the whole config before anything changes', async () => {
    const host = defineHost({ name: 'sample', levers: SAMPLE_LEVERS });
    const platform = (): VergerPlatform => ({
      readCapacity: () => CAPACITY,
      memorySensing: true,
      createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
    });
    let clock = 0;
    const verger = createVerger({ host, platform, requested: 'active', release: '1', now: () => clock });
    await verger.start();
    expect(() => verger.tune({ stressRatio: 0.5 })).toThrow(/comfortRatio/);
    verger.tune({ downgradeAfterMs: 250 });
    for (const event of STREAM) {
      clock = event.at;
      verger.dispatch(event);
    }
    expect(Object.keys(verger.getSnapshot()?.pressure ?? {})).not.toHaveLength(0);
    await verger.stop();
  });
});
