import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { DEFAULT_VERGER_CONFIG } from './config';
import { createRuntimeController, type RuntimePort } from './controller';
import { UNKNOWN_CAPACITY } from './reducer';
import { createSelfCostMeter } from './selfCost';

describe('self-cost meter', () => {
  it('reports counts, rates and a duty ratio over the span', () => {
    const meter = createSelfCostMeter(1000);
    for (const d of [0.05, 0.1, 0.2, 0.4]) meter.onReduce(d);
    meter.onWakeup();
    const cost = meter.read(61_000);
    expect(cost).toMatchObject({ events: 4, wakeups: 1, spanMs: 60_000, eventsPerMinute: 4 });
    expect(cost.reduceTotalMs).toBeCloseTo(0.75);
    expect(cost.reduceMeanMs).toBeCloseTo(0.1875);
    expect(cost.reduceMaxMs).toBe(0.4);
    expect(cost.dutyRatio).toBeCloseTo(0.75 / 60_000);
  });

  it('bounds the 95th percentile within a factor of two, and never above the maximum', () => {
    const meter = createSelfCostMeter(0);
    for (let i = 0; i < 99; i += 1) meter.onReduce(0.1);
    meter.onReduce(50);
    const cost = meter.read(1000);
    expect(cost.reduceP95Ms).toBeGreaterThanOrEqual(0.1);
    expect(cost.reduceP95Ms).toBeLessThanOrEqual(0.2);
    const slow = createSelfCostMeter(0);
    slow.onReduce(1e9);
    expect(slow.read(1).reduceP95Ms).toBe(1e9);
  });

  it('ignores clock faults: negative and non-finite durations cost nothing', () => {
    const meter = createSelfCostMeter(0);
    meter.onReduce(-5);
    meter.onReduce(Number.NaN);
    const cost = meter.read(0);
    expect(cost).toMatchObject({ events: 2, reduceTotalMs: 0, reduceMaxMs: 0, eventsPerMinute: 0, dutyRatio: 0 });
  });
});

describe('controller self-cost', () => {
  it('measures each reduction with the measure clock and counts timer wake-ups', () => {
    let at = 0;
    let measured = 0;
    const timers: (() => void)[] = [];
    const port: RuntimePort = { start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} };
    const controller = createRuntimeController({
      port,
      capacity: UNKNOWN_CAPACITY,
      levers: SAMPLE_LEVERS,
      mode: 'active',
      config: DEFAULT_VERGER_CONFIG,
      now: () => at,
      // Every reading advances 0.5 ms: one reduction measures exactly 0.5 ms.
      measure: () => (measured += 0.5),
      scheduler: {
        setTimeout: (callback) => timers.push(callback),
        clearTimeout: () => {},
      },
      memorySensing: false,
    });
    controller.start();
    at = 10;
    controller.dispatch({ type: 'interaction', at });
    controller.dispatch({ type: 'memory-trim', at, severity: 'critical' });
    at = 60_000;
    const due = timers.at(-1);
    if (!due) throw new Error('a trim should schedule its release');
    due();
    const cost = controller.selfCost();
    expect(cost.events).toBe(3);
    expect(cost.wakeups).toBe(1);
    expect(cost.reduceTotalMs).toBeCloseTo(1.5);
    expect(cost.spanMs).toBe(60_000);
  });
});
