import { describe, expect, it } from 'vitest';
import {
  type CapacityFacts,
  createGovernor,
  type GovernorEvent,
  type GovernorState,
  GURUDEVI_LEVERS,
  reduceGovernor,
  replayGovernor,
  snapshotOf,
} from './index';

const PHONE_90HZ: CapacityFacts = {
  totalMemoryBytes: 6 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 90,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 90],
  supportsCpuHints: true,
};

/** A 2 GB, 60 Hz, Android 10 phone: no hint sessions, nothing to cap. */
const PHONE_LOW: CapacityFacts = {
  ...PHONE_90HZ,
  totalMemoryBytes: 2 * 1024 ** 3,
  sdkInt: 29,
  cpuCores: 4,
  refreshRateHz: 60,
  supportsRenderEffect: false,
  supportsRuntimeShader: false,
  refreshRatesHz: [60],
  supportsCpuHints: false,
};

function run(state: GovernorState, events: GovernorEvent[]): GovernorState {
  return events.reduce(reduceGovernor, state);
}

/** One thread-load sample per second with the JS thread at `js` cores. */
function jsLoad(from: number, seconds: number, js: number, main = 0.3): GovernorEvent[] {
  return Array.from({ length: seconds }, (_, i) => ({
    type: 'thread-load' as const,
    at: from + (i + 1) * 1000,
    cores: { js, main, render: 0.2 },
    processCores: js + main + 0.2,
  }));
}

describe('containment of work the runtime does not control', () => {
  it('treats a JS thread pinned for 2 s as contention, pauses deferrable work and sheds CPU-side quality', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'interaction', at: 0 }, ...jsLoad(0, 1, 0.98)]);
    expect(snapshotOf(state).contention).toBe('none');
    state = run(state, jsLoad(1000, 2, 0.98));
    const snap = snapshotOf(state);
    expect(snap.contention).toBe('js');
    expect(snap.optionalConcurrency).toBe(0);
    expect(snap.lastReason).toMatch(/^JS thread saturated \(0\.98 cores/);
    const lowered = Object.entries(snap.proposedLevels).filter(([, level]) => level > 0).map(([id]) => id);
    const cpuLevers = new Set(GURUDEVI_LEVERS.filter((l) => l.target === 'cpu').map((l) => l.id));
    expect(lowered.some((id) => cpuLevers.has(id))).toBe(true);
  });

  it('acts at most once per saturation period, so one bad loop cannot collapse quality at once', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, jsLoad(0, 3, 0.99));
    const first = state.stack.length;
    state = run(state, [{ type: 'tick', at: 3500 }]);
    expect(state.stack.length).toBe(first);
    state = run(state, jsLoad(3000, 2, 0.99));
    expect(state.stack.length).toBe(first + 1);
  });

  it('reaches the global motion lever only after every other CPU lever, and never statically', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    expect(snapshotOf(state).globalReducedMotion).toBe(false);
    state = run(state, jsLoad(0, 60, 1.0));
    const snap = snapshotOf(state);
    expect(snap.globalReducedMotion).toBe(true);
    const order = state.stack;
    expect(order.indexOf('global-motion')).toBeGreaterThan(order.indexOf('list-window'));

    const low = createGovernor({ at: 0, capacity: PHONE_LOW, levers: GURUDEVI_LEVERS });
    expect(snapshotOf(low).globalReducedMotion).toBe(false);
  });

  it('counts three long tasks within 5 s as JS contention even when CPU sampling is absent', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [
      { type: 'long-task', at: 1000, durationMs: 120 },
      { type: 'long-task', at: 2000, durationMs: 80 },
    ]);
    expect(snapshotOf(state).contention).toBe('none');
    state = run(state, [{ type: 'long-task', at: 2500, durationMs: 300 }]);
    expect(snapshotOf(state).contention).toBe('js');
    state = run(state, [{ type: 'tick', at: 8000 }]);
    expect(snapshotOf(state).contention).toBe('none');
  });

  it('clears contention as soon as the thread drops below the line', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [...jsLoad(0, 3, 0.95), ...jsLoad(3000, 1, 0.4)]);
    expect(snapshotOf(state).contention).toBe('none');
  });
});

describe('memory pressure on Android 14+, where foreground apps get no trims', () => {
  it('turns polled free memory near the system threshold into the same latch a trim would set', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS, memorySensing: true });
    state = run(state, [{ type: 'memory-state', at: 1000, availableMb: 900, thresholdMb: 216, lowMemory: false }]);
    expect(snapshotOf(state).memory).toBe('normal');
    state = run(state, [{ type: 'memory-state', at: 11_000, availableMb: 400, thresholdMb: 216, lowMemory: false }]);
    expect(snapshotOf(state).memory).toBe('trimmed');
    state = run(state, [{ type: 'memory-state', at: 21_000, availableMb: 210, thresholdMb: 216, lowMemory: true }]);
    const snap = snapshotOf(state);
    expect(snap.memory).toBe('low');
    expect(snap.lastReason).toBe('free memory low (critical)');
    expect(snap.proposedLevels['image-cache']).toBeGreaterThan(0);
  });
});

describe('hardware levers', () => {
  it('caps the refresh rate when idle, warm, or saving power, and releases it on touch', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'interaction', at: 0 }, { type: 'tick', at: 5000 }]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
    state = run(state, [{ type: 'tick', at: 10_001 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
    state = run(state, [{ type: 'interaction', at: 10_500 }]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
    state = run(state, [{ type: 'thermal', at: 11_000, status: 'light', headroom: 0.9 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);

    const saver = run(createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS }), [
      { type: 'power', at: 1, saver: true },
    ]);
    expect(snapshotOf(saver).refreshCapHz).toBe(60);
  });

  it('never asks a 60 Hz display for a cap it cannot honour', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_LOW, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'tick', at: 20_000 }, { type: 'power', at: 20_001, saver: true }]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
  });

  it('boosts the UI threads only while someone interacts on a cool, unrestricted, capable device', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'interaction', at: 0 }]);
    expect(snapshotOf(state).cpuBoost).toBe(true);
    expect(snapshotOf(run(state, [{ type: 'tick', at: 10_001 }])).cpuBoost).toBe(false);
    expect(snapshotOf(run(state, [{ type: 'thermal', at: 1, status: 'moderate', headroom: 0.96 }])).cpuBoost).toBe(false);
    expect(snapshotOf(run(state, [{ type: 'power', at: 1, saver: true }])).cpuBoost).toBe(false);
    expect(snapshotOf(run(state, [{ type: 'app-state', at: 1, state: 'background' }])).cpuBoost).toBe(false);
    const low = run(createGovernor({ at: 0, capacity: PHONE_LOW, levers: GURUDEVI_LEVERS }), [
      { type: 'interaction', at: 0 },
    ]);
    expect(snapshotOf(low).cpuBoost).toBe(false);
  });

  it('in shadow mode proposes but applies no hardware lever', () => {
    const events: GovernorEvent[] = [{ type: 'interaction', at: 0 }, ...jsLoad(0, 60, 1.0), { type: 'tick', at: 61_000 }];
    const { final } = replayGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS, mode: 'shadow' }, events);
    expect(final.proposedLevels['global-motion']).toBe(1);
    expect(final.globalReducedMotion).toBe(false);
    expect(final.cpuBoost).toBe(false);
  });
});
