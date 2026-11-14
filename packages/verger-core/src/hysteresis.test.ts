import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { activationForMode, resolveActivation } from './activation';
import { DEFAULT_VERGER_CONFIG, parseConfigPatch } from './config';
import { createOutcomeLedger } from './outcomes';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { createVergerState, snapshotOf, UNKNOWN_CAPACITY } from './reducer';
import type { ThermalLevel, VergerEvent, VergerSnapshot } from './types';
import { FLOORS_ACTIVATION } from './verger';

const MB = 1024 ** 2;

/** Runs `events` and returns the published heat after each one. */
function heatAfter(events: readonly VergerEvent[], policy = VERGER_POLICY): ThermalLevel[] {
  let state = policy.create({ at: 0, levers: SAMPLE_LEVERS });
  return events.map((event) => {
    state = policy.reduce(state, event);
    return policy.snapshot(state).thermal;
  });
}

const headroom = (at: number, value: number): VergerEvent => ({
  type: 'thermal',
  at,
  status: null,
  headroom: value,
});
const battery = (at: number, temperatureC: number): VergerEvent => ({
  type: 'battery',
  at,
  levelPercent: 80,
  pluggedIn: false,
  temperatureC,
});
const tick = (at: number): VergerEvent => ({ type: 'tick', at });

describe('thermal hysteresis (P4)', () => {
  it('a headroom hovering at the warm threshold no longer chatters', () => {
    // ADPF jitter of ±0.01 around 0.85, every 10 s for five minutes: before P4, a flip per sample.
    const events = Array.from({ length: 30 }, (_, i) => headroom((i + 1) * 10_000, i % 2 === 0 ? 0.86 : 0.84));
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      const heat = heatAfter(events, policy);
      const flips = heat.filter((level, i) => i > 0 && level !== heat[i - 1]).length;
      expect(heat[0]).toBe('warm');
      expect(flips).toBe(0);
    }
  });

  it('rising heat applies at once', () => {
    expect(heatAfter([headroom(1_000, 0.5), headroom(2_000, 0.96)])).toEqual(['nominal', 'hot']);
    expect(heatAfter([headroom(1_000, 0.86), headroom(1_001, 1.2)])).toEqual(['warm', 'critical']);
  });

  it('stepping down needs the reading past the exit band, held for the dwell', () => {
    const dwell = DEFAULT_VERGER_CONFIG.thermalDwellMs;
    // Inside the band (0.80 to 0.85): warm holds however long it lasts.
    const inBand = heatAfter([headroom(1_000, 0.9), headroom(2_000, 0.82), tick(2_000 + 3 * dwell)]);
    expect(inBand).toEqual(['warm', 'warm', 'warm']);
    // Past the band: nominal only once the dwell has run.
    const past = heatAfter([
      headroom(1_000, 0.9),
      headroom(2_000, 0.79),
      tick(2_000 + dwell - 1),
      tick(2_000 + dwell),
    ]);
    expect(past).toEqual(['warm', 'warm', 'warm', 'nominal']);
  });

  it('a step down goes to what the banded reading says, and heat rising mid-dwell restarts it', () => {
    const dwell = DEFAULT_VERGER_CONFIG.thermalDwellMs;
    expect(heatAfter([headroom(1_000, 0.97), headroom(2_000, 0.5), tick(2_000 + dwell)])).toEqual([
      'hot',
      'hot',
      'nominal',
    ]);
    const restarted = heatAfter([
      headroom(1_000, 0.9),
      headroom(2_000, 0.79),
      headroom(12_000, 0.83), // back inside the band: the dwell is lost
      headroom(15_000, 0.79),
      tick(2_000 + dwell),
      tick(15_000 + dwell),
    ]);
    expect(restarted).toEqual(['warm', 'warm', 'warm', 'warm', 'warm', 'nominal']);
  });

  it("the OS's discrete status steps down after the dwell alone", () => {
    const dwell = DEFAULT_VERGER_CONFIG.thermalDwellMs;
    const heat = heatAfter([
      { type: 'thermal', at: 1_000, status: 'severe', headroom: null },
      { type: 'thermal', at: 2_000, status: 'none', headroom: null },
      tick(2_000 + dwell - 1),
      tick(2_000 + dwell),
    ]);
    expect(heat).toEqual(['hot', 'hot', 'hot', 'nominal']);
  });

  it('battery temperature (Android 9) has an exit band in degrees', () => {
    const dwell = DEFAULT_VERGER_CONFIG.thermalDwellMs;
    const heat = heatAfter([
      battery(1_000, 40.2),
      battery(2_000, 39.6), // jitter below 40 °C: still warm
      tick(2_000 + 2 * dwell),
      battery(3_000 + 2 * dwell, 38.9),
      tick(3_000 + 3 * dwell),
    ]);
    expect(heat).toEqual(['warm', 'warm', 'warm', 'warm', 'nominal']);
  });

  it('losing the reading is unknown at once, never a held level', () => {
    const active = activationForMode('active');
    let state = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS, activation: active });
    state = VERGER_POLICY.reduce(state, headroom(1_000, 0.97));
    expect(VERGER_POLICY.snapshot(state).thermal).toBe('hot');
    const deaf = resolveActivation(active, { sense: { thermal: false } });
    state = VERGER_POLICY.reduce(state, { type: 'activation', at: 2_000, activation: deaf });
    expect(VERGER_POLICY.snapshot(state).thermal).toBe('unknown');
  });

  it('the end of a dwell is a timed change, so a quiet phone still cools', () => {
    let state = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS });
    state = VERGER_POLICY.reduce(state, headroom(1_000, 0.9));
    state = VERGER_POLICY.reduce(state, headroom(2_000, 0.5));
    expect(VERGER_POLICY.nextTimedChangeAt(state)).toBeLessThanOrEqual(
      2_000 + DEFAULT_VERGER_CONFIG.thermalDwellMs,
    );
  });

  it('a band as wide as the first threshold is refused', () => {
    expect(parseConfigPatch({ thermalExitBandHeadroom: 0.85 }, DEFAULT_VERGER_CONFIG)).toHaveProperty('error');
    expect(parseConfigPatch({ thermalExitBandC: 40 }, DEFAULT_VERGER_CONFIG)).toHaveProperty('error');
    expect(parseConfigPatch({ thermalExitBandHeadroom: 0.1, thermalDwellMs: 60_000 }, DEFAULT_VERGER_CONFIG)).toHaveProperty('patch');
  });
});

describe('storage exit band (P4)', () => {
  const storage = (at: number, mb: number): VergerEvent => ({ type: 'storage', at, freeBytes: mb * MB });

  it('low storage ends only past the band; entering still needs the threshold', () => {
    let state = VERGER_POLICY.create({ at: 0, levers: SAMPLE_LEVERS, activation: FLOORS_ACTIVATION });
    const levels: string[] = [];
    for (const event of [storage(1, 500), storage(2, 540), storage(3, 600), storage(4, 540), storage(5, 500)]) {
      state = VERGER_POLICY.reduce(state, event);
      levels.push(VERGER_POLICY.snapshot(state).storage);
    }
    expect(levels).toEqual(['low', 'low', 'ample', 'ample', 'low']);
  });
});

describe('the outcome ledger and the thermal dwell', () => {
  const base = snapshotOf(createVergerState({ at: 0, levers: SAMPLE_LEVERS, memorySensing: true }));
  const snap = (at: number, over: Partial<VergerSnapshot>): VergerSnapshot => ({ ...base, at, thermal: 'nominal', ...over });

  it('only a compress that relieves heat gets the longer window', () => {
    const l = createOutcomeLedger({ levers: SAMPLE_LEVERS, capacity: UNKNOWN_CAPACITY });
    l.observe(snap(0, {}));
    // photo-cache relieves memory, not heat: the plain window.
    l.observe(snap(1_000, { memory: 'low', levels: { ...base.levels, 'photo-cache': 1 }, pressure: { 'photo-cache': 1 } }));
    l.settle(1_000 + DEFAULT_VERGER_CONFIG.outcomeJudgeWindowMs);
    expect(l.records()[0]).toMatchObject({ lever: 'photo-cache', verdict: 'not-relieved' });
  });
});
