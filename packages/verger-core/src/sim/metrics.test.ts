import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from '../__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from '../activation';
import { VERGER_POLICY } from '../policy';
import { FLOORS_ACTIVATION } from '../verger';
import type { SimTick } from './closedLoop';
import { SIM_SESSIONS } from './closedLoop';
import { compareClosedLoop, controlMetrics } from './metrics';
import { SIM_PHONES } from './plant';

const phone = SIM_PHONES.mid;
const tick = (at: number, over: Partial<SimTick> = {}): SimTick => ({
  at,
  segment: 0,
  costMs: 5,
  targetMs: 10,
  temperatureC: 35,
  visible: true,
  disturbance: false,
  levels: {},
  qualityCost: 0,
  frameState: 'calm',
  thermal: 'nominal',
  ...over,
});

describe('control metrics', () => {
  it('counts a flap only when a lever reverses within the window', () => {
    const fast = [tick(0), tick(1000, { levels: { sparkle: 1 } }), tick(2000, { levels: { sparkle: 0 } }), tick(60_000)];
    expect(controlMetrics(fast, phone, SAMPLE_LEVERS).flapsPerMinute).toBe(1);
    const slow = [tick(0), tick(1000, { levels: { sparkle: 1 } }), tick(45_000, { levels: { sparkle: 0 } }), tick(60_000)];
    expect(controlMetrics(slow, phone, SAMPLE_LEVERS).flapsPerMinute).toBe(0);
    // ...nor, alone, a slow cycle: one lowering given back is disturbance rejection.
    expect(controlMetrics(slow, phone, SAMPLE_LEVERS).slowReversalsPerMinute).toBe(0);
    // Down, up, down again within five minutes is.
    const cycle = [...slow.slice(0, 3), tick(50_000, { levels: { sparkle: 1 } }), tick(60_000, { levels: { sparkle: 1 } })];
    expect(controlMetrics(cycle, phone, SAMPLE_LEVERS).slowReversalsPerMinute).toBe(1);
  });

  it('measures jank, quality while janking, heat time and settling on the plant truth', () => {
    const ticks = [
      tick(500, { qualityCost: 0 }),
      tick(1000, { disturbance: true, costMs: 20, qualityCost: 0.4, temperatureC: phone.thermal.throttleFromC + 3 }),
      tick(1500, { disturbance: true, costMs: 20, qualityCost: 0.4 }),
      tick(2000, { qualityCost: 0.2 }),
      tick(2500, { qualityCost: 0.01 }),
    ];
    const m = controlMetrics(ticks, phone, SAMPLE_LEVERS);
    expect(m.jankShare).toBeCloseTo(0.4);
    expect(m.qualityWhileJanking).toBeCloseTo(0.4);
    expect(m.hotMs).toBe(500);
    expect(m.settlingMs).toBe(1000);
  });

  it('counts heat-level changes as chatter, but not the first reading', () => {
    const ticks = [
      tick(0, { thermal: 'unknown' }),
      tick(30_000, { thermal: 'nominal' }),
      tick(45_000, { thermal: 'warm' }),
      tick(60_000, { thermal: 'nominal' }),
    ];
    expect(controlMetrics(ticks, phone, SAMPLE_LEVERS).thermalFlipsPerMinute).toBe(2);
  });

  it('counts as chatter only the changes the true temperature does not explain', () => {
    const ticks = [
      tick(0, { thermal: 'nominal', temperatureC: 38 }),
      tick(15_000, { thermal: 'warm', temperatureC: 40.1 }),
      tick(30_000, { thermal: 'nominal', temperatureC: 39.9 }), // 0.2 °C: chatter
      tick(45_000, { thermal: 'warm', temperatureC: 41 }), // 1.1 °C: heat really rose
      tick(60_000, { thermal: 'warm', temperatureC: 41 }),
    ];
    const m = controlMetrics(ticks, phone, SAMPLE_LEVERS);
    expect(m.thermalFlipsPerMinute).toBe(3);
    expect(m.thermalChatterPerMinute).toBe(1);
  });

  it('a disturbance that ends the session is not a failure to settle', () => {
    expect(controlMetrics([tick(500), tick(1000, { disturbance: true, qualityCost: 0.5 })], phone, SAMPLE_LEVERS).settlingMs).toBe(0);
  });
});

describe('closed-loop comparison', () => {
  it('judges arms on effects: on a heat soak verger cuts jank and heat, then settles back', () => {
    const report = compareClosedLoop({
      phone,
      session: SIM_SESSIONS.heatSoak,
      levers: SAMPLE_LEVERS,
      arms: {
        off: { policy: VERGER_POLICY, activation: FLOORS_ACTIVATION },
        p4: { policy: VERGER_POLICY, activation: ACTIVATION_PRESETS.active },
      },
    });
    expect(report.p4?.jankShare).toBeLessThan((report.off?.jankShare ?? 0) / 4);
    expect(report.p4?.peakTemperatureC).toBeLessThan((report.off?.peakTemperatureC ?? 0) - 2);
    expect(report.p4?.settlingMs).toBeLessThan(Number.POSITIVE_INFINITY);
  });
});
