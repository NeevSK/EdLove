import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_VERGER_CONFIG } from './config';
import { estimateAccounts } from './demand';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { LeverSpec, VergerEvent } from './types';

/** R1 (heat trend) and P5 (time-scale separation for heat). */
const c = DEFAULT_VERGER_CONFIG;

const GLOW: LeverSpec = {
  id: 'glow',
  maxLevel: 1,
  visualImpact: 'low',
  target: 'gpu',
  ambient: false,
  motion: false,
  levels: ['on', 'off'],
  whenWarm: 1,
};
const LEVERS = [...SAMPLE_LEVERS, GLOW];

const headroom = (at: number, value: number): VergerEvent => ({ type: 'thermal', at, status: null, headroom: value });
const battery = (at: number, temperatureC: number): VergerEvent => ({
  type: 'battery',
  at,
  levelPercent: 80,
  pluggedIn: false,
  temperatureC,
});
const touch = (at: number): VergerEvent => ({ type: 'interaction', at });
/** A calm frame window: raises need evidence that frames fit at the lowered levels. */
const calm = (at: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs: 5, targetMs: 16.67, worstMs: 8, droppedRatio: 0 },
});
/** Events in time order, with calm frames every second from `from` to `to`. */
const withCalmFrames = (events: VergerEvent[], from: number, to: number): VergerEvent[] => {
  for (let t = from; t <= to; t += 1_000) events.push(calm(t + 500));
  return events.sort((a, b) => a.at - b.at);
};

function run(events: readonly VergerEvent[], policy = VERGER_POLICY) {
  let state = policy.create({ at: 0, levers: LEVERS });
  for (const event of events) state = policy.reduce(state, event);
  return { snapshot: policy.snapshot(state), next: policy.nextTimedChangeAt(state) };
}

describe('heat trend (R1)', () => {
  it('a rising headroom projects warm before the reading is warm, and tightens on it', () => {
    for (const policy of [VERGER_POLICY, VERGER_POLICY_P5]) {
      // +0.004 per second: 0.78 now, 0.90 thirty seconds ahead.
      const { snapshot } = run([headroom(10_000, 0.7), headroom(20_000, 0.74), headroom(30_000, 0.78)], policy);
      expect(snapshot.thermal).toBe('nominal');
      expect(snapshot.thermalProjected).toBe('warm');
      expect(snapshot.levels.glow).toBe(1);
      expect(estimateAccounts(snapshot, UNKNOWN_CAPACITY).thermal.state).toBe('tight');
    }
  });

  it('a falling trend relaxes nothing: the projection is never below the reading', () => {
    const { snapshot } = run([headroom(10_000, 0.94), headroom(20_000, 0.9), headroom(30_000, 0.86)]);
    expect(snapshot.thermal).toBe('warm');
    expect(snapshot.thermalProjected).toBe('warm');
  });

  it('too few readings are no trend', () => {
    const { snapshot } = run([headroom(10_000, 0.7), headroom(20_000, 0.8)]);
    expect(snapshot.thermalProjected).toBe('nominal');
  });

  it('battery temperature trends too (Android 9), in degrees', () => {
    // +0.8 °C per 30 s: 39.6 now, 40.4 thirty seconds ahead, past batteryWarmC 40.
    const { snapshot } = run([battery(30_000, 38), battery(60_000, 38.8), battery(90_000, 39.6)]);
    expect(snapshot.thermalSource).toBe('battery');
    expect(snapshot.thermal).toBe('nominal');
    expect(snapshot.thermalProjected).toBe('warm');
  });

  it('a trend fades as its oldest reading leaves the window: a timed change', () => {
    const { next } = run([headroom(10_000, 0.7), headroom(20_000, 0.74), headroom(30_000, 0.78)]);
    expect(next).toBeLessThanOrEqual(10_000 + c.thermalTrendWindowMs + 1);
  });
});

describe('time-scale separation for heat (P5)', () => {
  /** Warm at 10 s, cool from 20 s, readings every 10 s with a given slope, a touch each second. */
  function afterHeat(until: number, coolValue: (t: number) => number) {
    const events: VergerEvent[] = [headroom(10_000, 0.9)];
    for (let t = 20_000; t <= until; t += 10_000) events.push(headroom(t, coolValue(t)));
    for (let t = 1_000; t <= until; t += 1_000) events.push(touch(t));
    events.sort((a, b) => a.at - b.at);
    return events;
  }

  it('warm floors outlast the heat by thermalRecoverMs', () => {
    // Heat steps down to nominal after the dwell (P4); the floor stays a recovery after that.
    const cool = (t: number) => 0.5 - t / 1e7;
    const heldAt = (until: number) => run(afterHeat(until, cool)).snapshot.levels.glow;
    const nominalAt = 20_000 + c.thermalDwellMs;
    expect(run(afterHeat(nominalAt, cool)).snapshot.thermal).toBe('nominal');
    expect(heldAt(nominalAt + c.thermalRecoverMs - 10_000)).toBe(1);
  });

  it('after the latch, quality climbs one step per thermalStepMs while heat is not rising', () => {
    // Long heat lowers several steps; then a steadily cooling phone.
    const events: VergerEvent[] = [];
    for (let t = 1_000; t <= 20_000; t += 1_000)
      events.push({ type: 'thermal', at: t, status: 'severe', headroom: 0.97 });
    for (let t = 30_000; t <= 400_000; t += 10_000) events.push(headroom(t, 0.6 - (t - 30_000) / 2e6));
    withCalmFrames(events, 30_000, 400_000);
    let state = VERGER_POLICY.create({ at: 0, levers: LEVERS });
    const raises: number[] = [];
    let previous = VERGER_POLICY.snapshot(state);
    for (const event of events) {
      state = VERGER_POLICY.reduce(state, event);
      const snapshot = VERGER_POLICY.snapshot(state);
      const fell = LEVERS.reduce((n, l) => n + Math.max(0, (previous.levels[l.id] ?? 0) - (snapshot.levels[l.id] ?? 0)), 0);
      for (let i = 0; i < fell; i += 1) raises.push(event.at);
      previous = snapshot;
    }
    expect(raises.length).toBeGreaterThan(2);
    // One step at a time, at least thermalStepMs apart, once the heat-floor release is past.
    const paced = raises.filter((t, i) => i > 0 && t === raises[i - 1]);
    expect(paced.length).toBeLessThanOrEqual(LEVERS.filter((l) => l.whenWarm !== undefined).length);
    const gaps = raises.slice(1).map((t, i) => t - (raises[i] ?? 0)).filter((g) => g > 0);
    for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(c.thermalStepMs);
  });

  it('a paced climb stops while heat readings rise toward warm, and lowering is never paced', () => {
    const events: VergerEvent[] = [];
    for (let t = 1_000; t <= 20_000; t += 1_000)
      events.push({ type: 'thermal', at: t, status: 'severe', headroom: 0.97 });
    // Cooling until 300 s (paced raises happen), then rising fast toward warm.
    const value = (t: number) => (t < 300_000 ? 0.6 - (t - 30_000) / 2e6 : 0.47 + (t - 300_000) / 5e5);
    for (let t = 30_000; t <= 420_000; t += 10_000) events.push(headroom(t, value(t)));
    withCalmFrames(events, 30_000, 420_000);
    let state = VERGER_POLICY.create({ at: 0, levers: LEVERS });
    const depthAt = new Map<number, number>();
    for (const event of events) {
      state = VERGER_POLICY.reduce(state, event);
      depthAt.set(event.at, Object.values(VERGER_POLICY.snapshot(state).levels).reduce((a, b) => a + b, 0));
    }
    const at = (t: number) => depthAt.get(t) ?? Number.NaN;
    // Raises happened while the phone cooled.
    expect(at(300_000)).toBeLessThan(at(30_000));
    // None once the rise projects (first order, over τ) past the band: from about 350 s, while the
    // reading itself (0.71 at 420 s) is still nominal.
    expect(VERGER_POLICY.snapshot(state).thermal).toBe('nominal');
    const rising = [...depthAt].filter(([t]) => t > 360_000 && t <= 420_000).map(([, d]) => d);
    expect(Math.min(...rising)).toBe(at(360_000));
    // Heat again lowers at once, pacing or not.
    const before = Object.values(VERGER_POLICY.snapshot(state).levels).reduce((a, b) => a + b, 0);
    state = VERGER_POLICY.reduce(state, { type: 'thermal', at: 421_000, status: 'critical', headroom: 1.1 });
    expect(Object.values(VERGER_POLICY.snapshot(state).levels).reduce((a, b) => a + b, 0)).toBeGreaterThan(before);
  });

  it('config: the recovery is shorter than the pacing window', async () => {
    const { parseConfigPatch } = await import('./config');
    expect(parseConfigPatch({ thermalRecoverMs: 700_000 }, c)).toHaveProperty('error');
  });
});
