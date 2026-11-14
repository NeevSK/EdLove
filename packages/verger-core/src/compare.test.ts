import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS } from './activation';
import { comparePolicies } from './compare';
import { VERGER_POLICY, VERGER_POLICY_P5 } from './policy';
import { UNKNOWN_CAPACITY } from './reducer';
import type { VergerEvent } from './types';

const frames = (at: number, averageMs: number, droppedRatio: number): VergerEvent => ({
  type: 'frame-window',
  at,
  window: { startMs: at - 500, endMs: at, frames: 30, averageMs, targetMs: 16.67, worstMs: averageMs * 2, droppedRatio },
});

function story(): VergerEvent[] {
  const events: VergerEvent[] = [{ type: 'memory-trim', at: 100, severity: 'critical' }];
  for (let at = 600; at <= 2600; at += 500) events.push(frames(at, 40, 0.5));
  for (let at = 3100; at <= 25_000; at += 500) events.push(frames(at, 8, 0));
  for (let at = 1000; at <= 25_000; at += 2000) events.push({ type: 'interaction', at: at + 1 });
  return events;
}

const options = {
  at: 0,
  levers: SAMPLE_LEVERS,
  capacity: { ...UNKNOWN_CAPACITY, totalMemoryBytes: 12 * 1024 ** 3, sdkInt: 34, refreshRatesHz: [60, 120] },
  memorySensing: true,
  activation: ACTIVATION_PRESETS.active,
};

describe('comparePolicies', () => {
  it('reports p5 giving up less quality than p4, under the same disturbances', () => {
    const report = comparePolicies(options, story(), { p4: VERGER_POLICY, p5: VERGER_POLICY_P5 });
    const { p4, p5 } = report;
    if (!p4 || !p5) throw new Error('missing report');
    expect(p4.spanMs).toBe(p5.spanMs);
    // Open loop: both saw the same disturbances (the trim keeps memory strained throughout).
    expect(p5.strainMs).toBe(p4.strainMs);
    expect(p4.worstQuality).toBeGreaterThan(0);
    // p5 returns the frame-bound levers once frames calm; p4 holds them.
    expect(p5.qualityGivenUp).toBeLessThan(p4.qualityGivenUp);
    expect(p5.moves).toBeGreaterThan(p4.moves);
    for (const r of [p4, p5]) {
      expect(r.strainMs).toBeGreaterThan(0);
      expect(r.strainMs).toBeLessThanOrEqual(r.spanMs);
      expect(r.qualityGivenUp).toBeGreaterThanOrEqual(0);
      expect(r.qualityGivenUp).toBeLessThanOrEqual(r.worstQuality);
    }
  });

  it('is deterministic and order-independent in its input', () => {
    const events = story();
    const a = comparePolicies(options, events, { p4: VERGER_POLICY });
    const b = comparePolicies(options, [...events].reverse(), { p4: VERGER_POLICY });
    expect(b).toEqual(a);
  });

  it('reports a steady resting cost and no moves when nothing happens', () => {
    const report = comparePolicies(options, [{ type: 'interaction', at: 10 }], { p4: VERGER_POLICY, p5: VERGER_POLICY_P5 }, 10_000);
    expect(report.p5).toEqual(report.p4);
    expect(report.p4?.moves).toBe(0);
    expect(report.p4?.strainMs).toBe(0);
    expect(report.p4?.qualityGivenUp).toBe(report.p4?.worstQuality);
    expect(report.p4?.qualityGivenUpCalm).toBe(report.p4?.qualityGivenUp);
  });
});
