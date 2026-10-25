import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { defineHost } from './host';
import { createSelfBudgetGuard } from './selfBudget';
import type { SelfCost } from './selfCost';
import type { VergerEvent } from './types';
import { createVerger } from './verger';

const cost = (reduceTotalMs: number): SelfCost => ({
  events: 0,
  wakeups: 0,
  spanMs: 0,
  eventsPerMinute: 0,
  reduceTotalMs,
  reduceMeanMs: 0,
  reduceMaxMs: 0,
  reduceP95Ms: 0,
  dutyRatio: 0,
});

describe('the self-budget guard (D4)', () => {
  it('judges each finished window on its own share, steps up once per window over, never down', () => {
    const guard = createSelfBudgetGuard({ maxDutyRatio: 0.01, windowMs: 1000 }, 0);
    expect(guard.check(cost(50), 500)).toBe('within'); // window not finished
    expect(guard.check(cost(50), 1000)).toBe('shed'); // 50 ms in 1000: 5%
    expect(guard.lastDutyRatio).toBeCloseTo(0.05);
    expect(guard.check(cost(55), 2000)).toBe('shed'); // 5 ms in 1000: within, stays shed
    expect(guard.check(cost(100), 3000)).toBe('floors');
    expect(guard.check(cost(100), 9000)).toBe('floors');
  });

  it('a cheap verger stays within; a budget that cannot be met is refused', () => {
    const guard = createSelfBudgetGuard({ maxDutyRatio: 0.01, windowMs: 1000 }, 0);
    for (let at = 1000; at <= 10_000; at += 1000) expect(guard.check(cost(at * 0.001), at)).toBe('within');
    expect(() => createSelfBudgetGuard({ maxDutyRatio: 0, windowMs: 1000 }, 0)).toThrow();
    expect(() => createSelfBudgetGuard({ maxDutyRatio: 0.1, windowMs: Number.NaN }, 0)).toThrow();
  });
});

describe('verger over its own budget', () => {
  it('sheds its contention sensing, then hands the session to the floors, and says so', async () => {
    // Every clock read moves 1 ms, so each reduction measures as costing time.
    let clock = 0;
    const now = () => (clock += 1);
    const sent: string[] = [];
    const v = createVerger({
      host: defineHost({
        name: 'budget',
        levers: SAMPLE_LEVERS,
        config: { selfBudgetMaxDutyRatio: 0.01, selfBudgetWindowMs: 200 },
      }),
      platform: () => ({
        readCapacity: () => ({
          totalMemoryBytes: null, isLowRamDevice: null, memoryClassMb: null, sdkInt: null, cpuCores: null,
          refreshRateHz: null, supportsRenderEffect: false, supportsRuntimeShader: false, refreshRatesHz: [],
          supportsCpuHints: false, buildFingerprint: null,
        }),
        memorySensing: false,
        createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
      }),
      requested: 'active',
      release: '1',
      now,
      telemetrySink: (name, attributes) => {
        if (name === 'verger_self_budget') sent.push(String(attributes.stage));
      },
    });
    await v.start();
    expect(v.activation?.sense.threads).toBe(true);
    const tick = async () => {
      v.dispatch({ type: 'interaction', at: now() } satisfies VergerEvent);
      await Promise.resolve();
    };
    while (sent.length < 1) await tick();
    await Promise.resolve();
    expect(v.activation?.sense.threads).toBe(false);
    expect(v.activation?.sense.longTasks).toBe(false);
    // A host configure keeps the shedding on top.
    v.configure({ grow: false });
    expect(v.activation?.sense.threads).toBe(false);
    while (sent.length < 2) await tick();
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
    expect(sent).toEqual(['shed', 'floors']);
    expect(v.activation).toBeNull();
    expect(v.getSnapshot()).not.toBeNull();
  });
});
