import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_PRESETS,
  type CapacityFacts,
  capacityClassOf,
  createVergerState,
  type CreateVergerStateOptions,
  DEFAULT_VERGER_CONFIG,
  type VergerEvent,
  nextTimedChangeAt,
  reduceVerger,
  resolveActivation,
  snapshotOf,
  UNKNOWN_CAPACITY,
  validateConfig,
} from '@repo/verger-core';
import { GURUDEVI_LEVERS } from './gurudeviLevers';

const KIB = 1024;
const GIB = 1024 ** 3;
// Graphics capable, so only the class decides; memory is what phones report (below the marketed
// size): the A52's is measured, the others are typical and to be confirmed on phones.
const CAPABLE: CapacityFacts = {
  ...UNKNOWN_CAPACITY,
  sdkInt: 34,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 120],
};
const PHONE_4GB: CapacityFacts = { ...CAPABLE, totalMemoryBytes: 3.7 * GIB };
const A52_8GB: CapacityFacts = { ...CAPABLE, totalMemoryBytes: 7_668_940 * KIB };
const PHONE_12GB: CapacityFacts = { ...CAPABLE, totalMemoryBytes: 11.2 * GIB };

const MID_FLOORED = ['ambient-motion', 'particles', 'blur', 'glass-material', 'image-cache'];

function snapshot(options: Partial<CreateVergerStateOptions>, events: readonly VergerEvent[] = []) {
  let state = createVergerState({ at: 0, levers: GURUDEVI_LEVERS, ...options });
  for (const event of events) state = reduceVerger(state, event);
  return snapshotOf(state);
}

describe('capacity classes: the hardware is the ceiling until the phone earns more', () => {
  it('classes phones by reported memory: 4 GB low, 6 and 8 GB mid, 12 GB high', () => {
    expect(capacityClassOf(PHONE_4GB, DEFAULT_VERGER_CONFIG)).toBe('low');
    expect(
      capacityClassOf({ ...PHONE_4GB, totalMemoryBytes: 5.5 * GIB }, DEFAULT_VERGER_CONFIG),
    ).toBe('mid');
    expect(capacityClassOf(A52_8GB, DEFAULT_VERGER_CONFIG)).toBe('mid');
    expect(capacityClassOf(PHONE_12GB, DEFAULT_VERGER_CONFIG)).toBe('high');
    expect(capacityClassOf(UNKNOWN_CAPACITY, DEFAULT_VERGER_CONFIG)).toBe('unknown');
    // The OS's own low-RAM flag wins over memory.
    expect(capacityClassOf({ ...PHONE_12GB, isLowRamDevice: true }, DEFAULT_VERGER_CONFIG)).toBe(
      'low',
    );
  });

  it('a mid phone gives up exactly what its levers declare, and nothing else', () => {
    const s = snapshot({ capacity: A52_8GB });
    expect(s.capacityClass).toBe('mid');
    for (const lever of GURUDEVI_LEVERS)
      expect([lever.id, s.levels[lever.id]]).toEqual([
        lever.id,
        MID_FLOORED.includes(lever.id) ? 1 : 0,
      ]);
  });

  it('a 4 GB phone is low: ambient stilled, the rest one step down', () => {
    const s = snapshot({ capacity: PHONE_4GB });
    expect(s.levels['ambient-motion']).toBe(2);
    expect(s.levels.blur).toBe(1);
    expect(s.optionalConcurrency).toBe(1);
  });

  it('a high phone starts at full quality', () => {
    const s = snapshot({ capacity: PHONE_12GB });
    expect(Object.values(s.levels).every((level) => level === 0)).toBe(true);
  });

  it('the user asking for high fidelity, or a phone that earned it, lifts the mid floors', () => {
    const high: VergerEvent = { type: 'preferences', at: 1, reduceMotion: false, fidelity: 'high' };
    expect(snapshot({ capacity: A52_8GB }, [high]).levels.blur).toBe(0);
    expect(snapshot({ capacity: A52_8GB, capacityGrant: 1 }).levels.blur).toBe(0);
  });

  it('thresholds are configuration, checked in order', () => {
    const s = snapshot({ capacity: A52_8GB, config: { midCapacityBelowBytes: 7 * GIB } });
    expect(s.capacityClass).toBe('high');
    expect(() =>
      validateConfig({ ...DEFAULT_VERGER_CONFIG, lowCapacityBelowBytes: 9 * GIB }),
    ).toThrow(/lowCapacityBelowBytes/);
  });
});

const net = (
  at: number,
  over: Partial<Extract<VergerEvent, { type: 'network' }>> = {},
): VergerEvent => ({
  type: 'network',
  at,
  transport: 'cellular',
  validated: true,
  metered: true,
  downKbps: 8_192,
  dataSaver: 'disabled',
  ...over,
});

describe('weak networks: optional data waits for a steady, fast link', () => {
  const capacity = PHONE_12GB;

  it('a fast link limits nothing', () => {
    const s = snapshot({ capacity }, [net(1)]);
    expect(s.networkLimit).toBe('none');
    expect(s.levels.prefetch).toBe(0);
  });

  it('a slow link stops prefetch and admits one optional job at a time', () => {
    const s = snapshot({ capacity }, [net(1, { downKbps: 512 })]);
    expect(s.networkLimit).toBe('slow');
    expect(s.levels.prefetch).toBe(2);
    expect(s.optionalConcurrency).toBe(1);
  });

  it('an unknown speed is not slow', () => {
    expect(snapshot({ capacity }, [net(1, { downKbps: null })]).networkLimit).toBe('none');
  });

  it('back from offline, the link is unstable until it has held for networkSettleMs', () => {
    let state = createVergerState({ at: 0, levers: GURUDEVI_LEVERS, capacity });
    state = reduceVerger(
      state,
      net(1_000, { transport: 'none', validated: false, downKbps: null }),
    );
    state = reduceVerger(state, net(5_000));
    expect(snapshotOf(state).networkLimit).toBe('unstable');
    expect(snapshotOf(state).levels.prefetch).toBe(2);
    // The settle is a timed change, so the controller wakes for it (after ambient sleep at 10 s).
    state = reduceVerger(state, { type: 'tick', at: 10_000 });
    expect(nextTimedChangeAt(state)).toBe(1_000 + DEFAULT_VERGER_CONFIG.networkSettleMs);
    state = reduceVerger(state, { type: 'tick', at: 61_000 });
    expect(snapshotOf(state).networkLimit).toBe('none');
    expect(snapshotOf(state).levels.prefetch).toBe(0);
  });

  it('turning the network sensor off forgets the instability with the network', () => {
    let state = createVergerState({ at: 0, levers: GURUDEVI_LEVERS, capacity });
    state = reduceVerger(state, net(1_000, { transport: 'none', validated: false }));
    state = reduceVerger(state, net(2_000));
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, { sense: { network: false } });
    state = reduceVerger(state, { type: 'activation', at: 3_000, activation: deaf });
    expect(snapshotOf(state).networkLimit).toBe('none');
    expect(snapshotOf(state).levels.prefetch).toBe(0);
  });
});
