import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_PRESETS,
  createVergerState,
  type VergerEvent,
  reduceVerger,
  resolveActivation,
  snapshotOf,
  UNKNOWN_CAPACITY,
  type VergerActivation,
} from '@repo/verger-core';
import { GURUDEVI_LEVERS } from './gurudeviLevers';

/** An Android 9 phone: no thermal service, so battery temperature is the only witness of heat. */
// High-class memory, so no capacity floor hides the battery rule under test.
const ANDROID_9 = { ...UNKNOWN_CAPACITY, totalMemoryBytes: 12 * 1024 ** 3, sdkInt: 28 };

const battery = (
  levelPercent: number | null,
  pluggedIn: boolean | null,
  temperatureC: number | null = 30,
): VergerEvent => ({
  type: 'battery',
  at: 1,
  levelPercent,
  pluggedIn,
  temperatureC,
});

function after(
  events: readonly VergerEvent[],
  activation: VergerActivation = ACTIVATION_PRESETS.active,
  config = {},
) {
  let state = createVergerState({
    at: 0,
    levers: GURUDEVI_LEVERS,
    capacity: ANDROID_9,
    activation,
    config,
  });
  for (const event of events) state = reduceVerger(state, event);
  return snapshotOf(state);
}

describe('a low battery on Gurudevi', () => {
  it('low and on battery: decoration paces down and prefetch waits for idle', () => {
    const s = after([battery(15, false)]);
    expect(s.levels['ambient-motion']).toBe(1);
    expect(s.levels.particles).toBe(1);
    expect(s.levels.prefetch).toBe(1);
  });

  it('the threshold is inclusive at 20% and configurable', () => {
    expect(after([battery(20, false)]).levels['ambient-motion']).toBe(1);
    expect(after([battery(21, false)]).levels['ambient-motion']).toBe(0);
    expect(
      after([battery(25, false)], ACTIVATION_PRESETS.active, { batteryLowPercent: 30 }).levels[
        'ambient-motion'
      ],
    ).toBe(1);
  });

  it('plugged in, or plug state unknown: never low', () => {
    expect(after([battery(5, true)]).levels['ambient-motion']).toBe(0);
    expect(after([battery(5, null)]).levels['ambient-motion']).toBe(0);
  });
});

describe('heat from the battery where the platform has no thermal service (Android 9)', () => {
  it('a hot battery reads as hot, from the battery', () => {
    const s = after([battery(60, false, 46)]);
    expect(s.thermal).toBe('hot');
    expect(s.thermalSource).toBe('battery');
  });

  it('the platform wins whenever it speaks', () => {
    const s = after([
      { type: 'thermal', at: 1, status: 'none', headroom: null },
      battery(60, false, 46),
    ]);
    expect(s.thermal).toBe('nominal');
    expect(s.thermalSource).toBe('platform');
  });

  it('with the thermal sensor off, battery temperature does not stand in', () => {
    const deaf = resolveActivation(ACTIVATION_PRESETS.active, { sense: { thermal: false } });
    const s = after([battery(60, false, 52)], deaf);
    expect(s.thermal).toBe('unknown');
    expect(s.thermalSource).toBe('none');
  });
});
