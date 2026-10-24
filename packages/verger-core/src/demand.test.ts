import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import { ACTIVATION_PRESETS, resolveActivation } from './activation';
import { classesOfLever, estimateAccounts, validateWorkloads, type WorkloadSpec } from './demand';
import { createGovernor, reduceGovernor, snapshotOf, UNKNOWN_CAPACITY } from './governor';
import { defineHost } from './host';
import type { CapacityFacts, GovernorEvent } from './types';

const WORKLOADS: readonly WorkloadSpec[] = [
  { id: 'tap', class: 'critical', spends: ['cpu'], source: 'everywhere' },
  { id: 'glitter', class: 'ornamental', spends: ['gpu'], levers: ['sparkle'], source: 'hero' },
  { id: 'gallery', class: 'committed', spends: ['memory'], levers: ['photo-cache', 'sparkle'], source: 'gallery' },
];

const CAPACITY: CapacityFacts = { ...UNKNOWN_CAPACITY, sdkInt: 34, totalMemoryBytes: 8 * 1024 ** 3 };

describe('demand registry', () => {
  it('a host carries its workloads, checked against its levers', () => {
    const host = defineHost({ name: 'sample', levers: SAMPLE_LEVERS, workloads: WORKLOADS });
    expect(host.workloads.map((w) => w.id)).toEqual(['tap', 'glitter', 'gallery']);
    expect(defineHost({ name: 'sample', levers: SAMPLE_LEVERS }).workloads).toEqual([]);
  });

  it('rejects duplicates, unknown levers, unknown accounts and work that spends nothing', () => {
    const tap = WORKLOADS[0] as WorkloadSpec;
    expect(() => validateWorkloads([tap, tap], SAMPLE_LEVERS)).toThrow(/Duplicate/);
    expect(() => validateWorkloads([{ ...tap, levers: ['nope'] }], SAMPLE_LEVERS)).toThrow(/unknown lever/);
    expect(() => validateWorkloads([{ ...tap, spends: [] }], SAMPLE_LEVERS)).toThrow(/at least one/);
    // A registry read from data can hold anything; the check must not trust the type.
    const bad = JSON.parse('{"id":"x","class":"urgent","spends":["cpu"],"source":"s"}') as WorkloadSpec;
    expect(() => validateWorkloads([bad], SAMPLE_LEVERS)).toThrow(/unknown class/);
    const badAccount = JSON.parse('{"id":"x","class":"critical","spends":["disk"],"source":"s"}') as WorkloadSpec;
    expect(() => validateWorkloads([badAccount], SAMPLE_LEVERS)).toThrow(/unknown account/);
  });

  it('a lever answers for the classes of work that read it, most important first', () => {
    expect(classesOfLever(WORKLOADS, 'sparkle')).toEqual(['committed', 'ornamental']);
    expect(classesOfLever(WORKLOADS, 'frosting')).toEqual([]);
  });
});

describe('resource accounts', () => {
  const run = (events: readonly GovernorEvent[], patch = {}) => {
    let state = createGovernor({
      at: 0,
      levers: SAMPLE_LEVERS,
      capacity: CAPACITY,
      memorySensing: true,
      activation: resolveActivation(ACTIVATION_PRESETS.active, patch),
    });
    for (const event of events) state = reduceGovernor(state, event);
    return estimateAccounts(snapshotOf(state), CAPACITY);
  };

  it('no reading is unknown with no confidence, never ample', () => {
    const accounts = run([]);
    expect(accounts.thermal).toEqual({ state: 'unknown', confidence: 0, source: 'no signal' });
    expect(accounts.gpu.state).toBe('unknown');
    expect(accounts.network.state).toBe('unknown');
    expect(accounts.storage.state).toBe('unknown');
  });

  it('heat, memory and frames map onto their accounts', () => {
    const accounts = run([
      { type: 'thermal', at: 1, status: 'severe', headroom: 0.97 },
      { type: 'memory-state', at: 2, availableMb: 100, thresholdMb: 200, lowMemory: false },
      {
        type: 'frame-window',
        at: 500,
        window: { startMs: 0, endMs: 500, frames: 30, averageMs: 30, targetMs: 16.7, worstMs: 35, droppedRatio: 0.3 },
      },
    ]);
    expect(accounts.thermal.state).toBe('overdrawn');
    expect(accounts.thermal.confidence).toBeGreaterThan(0.8);
    expect(accounts.memory.state).toBe('overdrawn');
    expect(accounts.gpu.state).toBe('overdrawn');
  });

  it('a saturated thread overdraws cpu, whatever the frames say', () => {
    const load: GovernorEvent[] = [0, 2500].map((at) => ({
      type: 'thread-load',
      at,
      cores: { js: 1 },
      processCores: 1.2,
    }));
    expect(run(load).cpu).toMatchObject({ state: 'overdrawn', source: 'js thread saturated' });
  });

  it('a switched-off sensor reads as unknown, not as the last value', () => {
    const hot: GovernorEvent = { type: 'thermal', at: 1, status: 'severe', headroom: 0.97 };
    expect(run([hot], { sense: { thermal: false } }).thermal.state).toBe('unknown');
  });
});
