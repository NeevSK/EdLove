import { describe, expect, it } from 'vitest';
import {
  type CapacityFacts,
  chooseLeverToLower,
  DEFAULT_GOVERNOR_CONFIG,
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
    const lowered = Object.entries(snap.proposedLevels)
      .filter(([, level]) => level > 0)
      .map(([id]) => id);
    const cpuLevers = new Set(GURUDEVI_LEVERS.filter((l) => l.target === 'cpu').map((l) => l.id));
    expect(lowered.some((id) => cpuLevers.has(id))).toBe(true);
  });

  it('acts at most once per saturation period', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, jsLoad(0, 3, 0.99));
    const first = state.stack.length;
    state = run(state, [{ type: 'tick', at: 3500 }]);
    expect(state.stack.length).toBe(first);
    state = run(state, jsLoad(3000, 2, 0.99));
    expect(state.stack.length).toBe(first + 1);
  });

  it('never lets one busy JS loop strip levers that do not relieve the JS thread', () => {
    // A minute of a pinned JS thread that no lever relieves (the load never drops).
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, jsLoad(0, 60, 1.0));
    const cpuLevers = new Set(GURUDEVI_LEVERS.filter((l) => l.target === 'cpu').map((l) => l.id));
    expect(state.stack.length).toBeGreaterThan(0);
    expect(state.stack.every((id) => cpuLevers.has(id))).toBe(true);
    expect(state.stack.length).toBeLessThanOrEqual(
      DEFAULT_GOVERNOR_CONFIG.maxUnrelievedContentionSteps + 1,
    );
    const snap = snapshotOf(state);
    expect(snap.contentionExhausted).toBe(true);
    expect(snap.lastReason).toMatch(/not relieved by levers, needs a code fix$/);
    expect(snap.globalReducedMotion).toBe(false);
    expect(state.stack).not.toContain('refresh-rate');
    expect(snap.proposedLevels['image-cache']).toBe(0);
  });

  it('keeps shedding while each step relieves the saturated thread', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, jsLoad(0, 3, 1.0)); // first step at ~2 s
    const first = state.stack.length;
    state = run(state, jsLoad(3000, 2, 0.94)); // relieved by 0.06 cores, still saturated
    expect(state.stack.length).toBe(first + 1);
    expect(snapshotOf(state).contentionExhausted).toBe(false);
  });

  it('chooses global motion only after every lower-impact lever aimed at the same targets', () => {
    const targets = ['cpu', 'gpu'] as const;
    const levels: Record<string, number> = {};
    // Lower everything except global motion as far as it goes; then it must be the next pick.
    for (const lever of GURUDEVI_LEVERS)
      if (lever.id !== 'global-motion') levels[lever.id] = lever.maxLevel;
    expect(chooseLeverToLower(GURUDEVI_LEVERS, levels, targets, true)?.id).toBe('global-motion');
    // With any lower-impact cpu/gpu lever still available, global motion is not chosen.
    for (const lever of GURUDEVI_LEVERS) {
      if (lever.visualImpact === 'high' || !targets.includes(lever.target as 'cpu' | 'gpu'))
        continue;
      const open = { ...levels, [lever.id]: 0 };
      expect(chooseLeverToLower(GURUDEVI_LEVERS, open, targets, true)?.id).not.toBe(
        'global-motion',
      );
    }
    // JS contention matches a lever's primary target only (as the policy calls it), so it can
    // never reach this UI-thread lever, though the lever declares that it also relieves CPU.
    expect(chooseLeverToLower(GURUDEVI_LEVERS, levels, ['cpu'], 'primary')).toBeNull();
    // Main-thread contention may: animations run on the UI thread.
    expect(chooseLeverToLower(GURUDEVI_LEVERS, levels, ['cpu'], true)?.id).toBe('global-motion');
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
    let state = createGovernor({
      at: 0,
      capacity: PHONE_90HZ,
      levers: GURUDEVI_LEVERS,
      memorySensing: true,
    });
    state = run(state, [
      { type: 'memory-state', at: 1000, availableMb: 900, thresholdMb: 216, lowMemory: false },
    ]);
    expect(snapshotOf(state).memory).toBe('normal');
    state = run(state, [
      { type: 'memory-state', at: 11_000, availableMb: 400, thresholdMb: 216, lowMemory: false },
    ]);
    expect(snapshotOf(state).memory).toBe('trimmed');
    state = run(state, [
      { type: 'memory-state', at: 21_000, availableMb: 210, thresholdMb: 216, lowMemory: true },
    ]);
    const snap = snapshotOf(state);
    expect(snap.memory).toBe('low');
    expect(snap.lastReason).toBe('free memory low (critical)');
    expect(snap.proposedLevels['image-cache']).toBeGreaterThan(0);
  });
});

describe('hardware levers', () => {
  it('caps the refresh rate when idle, warm, or saving power, and releases it on touch', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [
      { type: 'interaction', at: 0 },
      { type: 'tick', at: 5000 },
    ]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
    state = run(state, [{ type: 'tick', at: 10_001 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
    state = run(state, [{ type: 'interaction', at: 10_500 }]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
    // Warm, but a finger was on the screen 0.5 s ago: the cap waits (gesture freeze).
    state = run(state, [{ type: 'thermal', at: 11_000, status: 'light', headroom: 0.9 }]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
    state = run(state, [{ type: 'tick', at: 11_600 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
    // Hot is forced through even mid-gesture.
    state = run(state, [
      { type: 'interaction', at: 12_000 },
      { type: 'thermal', at: 12_100, status: 'severe', headroom: null },
    ]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);

    const saver = run(createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS }), [
      { type: 'power', at: 1, saver: true },
      { type: 'tick', at: 1_500 }, // launch counts as a touch; the gesture freeze has passed
    ]);
    expect(snapshotOf(saver).refreshCapHz).toBe(60);
  });

  it('never asks a 60 Hz display for a cap it cannot honour', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_LOW, levers: GURUDEVI_LEVERS });
    state = run(state, [
      { type: 'tick', at: 20_000 },
      { type: 'power', at: 20_001, saver: true },
    ]);
    expect(snapshotOf(state).refreshCapHz).toBeNull();
  });

  it('boosts the UI threads only while someone interacts on a cool, unrestricted, capable device', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'interaction', at: 0 }]);
    expect(snapshotOf(state).cpuBoost).toBe(true);
    expect(snapshotOf(run(state, [{ type: 'tick', at: 10_001 }])).cpuBoost).toBe(false);
    expect(
      snapshotOf(run(state, [{ type: 'thermal', at: 1, status: 'moderate', headroom: 0.96 }]))
        .cpuBoost,
    ).toBe(false);
    expect(snapshotOf(run(state, [{ type: 'power', at: 1, saver: true }])).cpuBoost).toBe(false);
    expect(
      snapshotOf(run(state, [{ type: 'app-state', at: 1, state: 'background' }])).cpuBoost,
    ).toBe(false);
    const low = run(createGovernor({ at: 0, capacity: PHONE_LOW, levers: GURUDEVI_LEVERS }), [
      { type: 'interaction', at: 0 },
    ]);
    expect(snapshotOf(low).cpuBoost).toBe(false);
  });

  it('in shadow mode proposes but applies no hardware lever', () => {
    const events: GovernorEvent[] = [
      { type: 'interaction', at: 0 },
      ...jsLoad(0, 10, 1.0),
      { type: 'tick', at: 61_000 },
    ];
    const { final } = replayGovernor(
      { at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS, mode: 'shadow' },
      events,
    );
    expect(final.proposedLevels['refresh-rate']).toBe(1); // idle: proposed, not applied
    expect(final.refreshCapHz).toBeNull();
    expect(final.globalReducedMotion).toBe(false);
    expect(final.cpuBoost).toBe(false);
  });
});

describe('review findings, held as regressions', () => {
  const stressed = (start: number, overrides: Record<string, number> = {}): GovernorEvent => ({
    type: 'frame-window',
    at: start + 500,
    window: {
      startMs: start,
      endMs: start + 500,
      frames: 30,
      averageMs: 25,
      targetMs: 16.667,
      worstMs: 40,
      droppedRatio: 0.2,
      ...overrides,
    },
  });

  it('classifies a window of a few very long frames as stress, not quiet', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [
      stressed(0, { frames: 3, averageMs: 160, worstMs: 170, droppedRatio: 0.9 }),
      stressed(500, { frames: 3, averageMs: 160, worstMs: 170, droppedRatio: 0.9 }),
    ]);
    expect(snapshotOf(state).frameState).toBe('stressed');
    expect(state.stack.length).toBe(1);
  });

  it('does not add up stressed windows that are not contiguous', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [stressed(0), stressed(60_000)]);
    expect(state.stack.length).toBe(0);
    state = run(state, [stressed(60_500)]);
    expect(state.stack.length).toBe(1);
  });

  it('does not raise quality on an idle screen, only on calm frames', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [stressed(0), stressed(500), { type: 'tick', at: 30_000 }]);
    expect(state.stack.length).toBe(1);
    const calm = (start: number): GovernorEvent => ({
      type: 'frame-window',
      at: start + 500,
      window: {
        startMs: start,
        endMs: start + 500,
        frames: 30,
        averageMs: 6,
        targetMs: 16.667,
        worstMs: 9,
        droppedRatio: 0,
      },
    });
    state = run(state, [calm(30_000), calm(30_500)]);
    expect(state.stack.length).toBe(0);
  });

  it('never lets a stale headroom hide a fresh severe status', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'thermal', at: 1, status: 'severe', headroom: 0.5 }]);
    expect(snapshotOf(state).thermal).toBe('hot');
  });

  it('keeps a steadily low polled memory reading low beyond the trim latch', () => {
    let state = createGovernor({
      at: 0,
      capacity: PHONE_90HZ,
      levers: GURUDEVI_LEVERS,
      memorySensing: true,
    });
    state = run(state, [
      { type: 'memory-state', at: 1000, availableMb: 300, thresholdMb: 216, lowMemory: false },
    ]);
    expect(snapshotOf(state).memory).toBe('low');
    state = run(state, [{ type: 'tick', at: 60_000 }]);
    expect(snapshotOf(state).memory).toBe('low');
    state = run(state, [
      { type: 'memory-state', at: 61_000, availableMb: 1200, thresholdMb: 216, lowMemory: false },
    ]);
    expect(snapshotOf(state).memory).toBe('normal');
  });
});

describe('second review findings, held as regressions', () => {
  const win = (
    start: number,
    averageMs: number,
    extra: Record<string, unknown> = {},
  ): GovernorEvent => ({
    type: 'frame-window',
    at: start + 500,
    window: {
      startMs: start,
      endMs: start + 500,
      frames: 30,
      averageMs,
      targetMs: 16.667,
      worstMs: averageMs * 1.4,
      droppedRatio: averageMs > 20 ? 0.2 : 0,
      ...extra,
    },
  });

  it('raises again from the forwarded stream, where a run of calm windows arrives as one', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [win(0, 25), win(500, 25), win(1000, 25), win(1500, 25)]);
    expect(state.stack.length).toBe(2);
    // Only the first calm window crosses the bridge; the rest are suppressed as repeats.
    state = run(state, [win(2000, 6), { type: 'tick', at: 7_000 }, { type: 'tick', at: 12_000 }]);
    expect(state.stack.length).toBe(0);
  });

  it('holds the published cap through a tap instead of switching the display mode twice', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, [{ type: 'thermal', at: 2_000, status: 'light', headroom: 0.9 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
    state = run(state, [{ type: 'interaction', at: 3_000 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
    state = run(state, [{ type: 'tick', at: 4_100 }]);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
  });

  it('answers UI-bound jank with the refresh cap when that is the lever the build applies', () => {
    const applied = GURUDEVI_LEVERS.filter(
      (l) => l.id === 'refresh-rate' || l.id === 'global-motion',
    );
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: applied });
    const stages = { uiMs: 20, renderMs: 3, gpuMs: 2, delayMs: 0 };
    state = run(state, [win(0, 25, { stages }), win(500, 25, { stages })]);
    expect(state.stack).toEqual(['refresh-rate']);
  });

  it('accumulates freeze-type jank across the empty slot a long frame leaves', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    const freeze = (start: number) =>
      win(start, 1000, { frames: 1, worstMs: 1000, droppedRatio: 0.98 });
    state = run(state, [freeze(0)]);
    expect(state.stack.length).toBe(1);
  });

  it('keeps the "not relievable" verdict through a load flickering across the line', () => {
    let state = createGovernor({ at: 0, capacity: PHONE_90HZ, levers: GURUDEVI_LEVERS });
    state = run(state, jsLoad(0, 12, 1.0));
    expect(snapshotOf(state).contentionExhausted).toBe(true);
    const before = state.stack.length;
    for (let i = 0; i < 6; i += 1) {
      const t = 12_000 + i * 1000;
      state = run(state, [
        { type: 'thread-load', at: t, cores: { js: i % 2 ? 0.5 : 1.0 }, processCores: 1 },
      ]);
    }
    expect(state.stack.length).toBe(before);
  });
});
