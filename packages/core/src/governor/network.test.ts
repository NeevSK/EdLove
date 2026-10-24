import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_PRESETS,
  createGovernor,
  type GovernorEvent,
  reduceGovernor,
  resolveActivation,
  snapshotOf,
  UNKNOWN_CAPACITY,
  type VergerActivation,
} from '@repo/verger-core';
import { GURUDEVI_LEVERS } from './gurudeviLevers';

const CAPACITY = { ...UNKNOWN_CAPACITY, totalMemoryBytes: 8 * 1024 ** 3, sdkInt: 34 };

const net = (over: Partial<Extract<GovernorEvent, { type: 'network' }>>): GovernorEvent => ({
  type: 'network',
  at: 1,
  transport: 'wifi',
  validated: true,
  metered: false,
  downKbps: 20_000,
  dataSaver: 'disabled',
  ...over,
});

function after(event: GovernorEvent | null, activation: VergerActivation = ACTIVATION_PRESETS.active) {
  let state = createGovernor({ at: 0, levers: GURUDEVI_LEVERS, capacity: CAPACITY, activation });
  if (event) state = reduceGovernor(state, event);
  return snapshotOf(state);
}

describe('network limits on Gurudevi (the user and the OS decide; verger respects)', () => {
  it('unmetered and validated: nothing is limited', () => {
    const s = after(net({}));
    expect(s.levels.prefetch).toBe(0);
    expect(s.optionalConcurrency).toBe(after(null).optionalConcurrency);
  });

  it('metered: prefetch waits for idle, optional work one at a time', () => {
    const s = after(net({ transport: 'cellular', metered: true }));
    expect(s.levels.prefetch).toBe(1);
    expect(s.optionalConcurrency).toBe(1);
  });

  it('Data Saver on: no prefetch and no optional data work', () => {
    const s = after(net({ transport: 'cellular', metered: true, dataSaver: 'enabled' }));
    expect(s.levels.prefetch).toBe(2);
    expect(s.optionalConcurrency).toBe(0);
  });

  it('Data Saver on but this app allowlisted by the user: only the metered limit', () => {
    const s = after(net({ transport: 'cellular', metered: true, dataSaver: 'allowlisted' }));
    expect(s.levels.prefetch).toBe(1);
  });

  it('offline or unvalidated: no prefetch, no optional work', () => {
    for (const event of [net({ transport: 'none', validated: false }), net({ validated: false })]) {
      const s = after(event);
      expect(s.levels.prefetch).toBe(2);
      expect(s.optionalConcurrency).toBe(0);
    }
  });

  it('unknown is not offline: before any report, nothing is limited', () => {
    expect(after(null).levels.prefetch).toBe(0);
  });

  it('limits hold in static mode, and a deaf network sensor limits nothing', () => {
    const saving = net({ metered: true, dataSaver: 'enabled' });
    expect(after(saving, ACTIVATION_PRESETS.static).levels.prefetch).toBe(0); // static preset: network sensor off
    const staticHearing = resolveActivation(ACTIVATION_PRESETS.static, { sense: { network: true } });
    expect(after(saving, staticHearing).levels.prefetch).toBe(2);
  });
});
