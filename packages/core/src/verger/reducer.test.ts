import { describe, expect, it } from 'vitest';
// The A52 trace is verger's golden fixture; Gurudevi's tests replay it through Gurudevi's levers.
import a52 from '../../../verger-core/src/__fixtures__/a52-self-idle.json';
import type { CapacityFacts, FrameWindow } from './index';
import {
  aggregateFrames,
  assignExperiment,
  classifyFrameWindow,
  createVergerState,
  createVergerTelemetry,
  DEFAULT_VERGER_CONFIG,
  frameRate,
  type VergerEvent,
  GURUDEVI_LEVERS,
  type LeverSpec,
  reduceVerger,
  replayVerger,
  snapshotOf,
  thermalLevelOf,
} from './index';

const A52: CapacityFacts = {
  totalMemoryBytes: 7_668_940 * 1024,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 60,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  // The A52 panel offers 60 and 90 Hz; hint sessions exist on Android 14.
  refreshRatesHz: [60, 90],
  supportsCpuHints: true,
};

/**
 * The A52's profile with high-class memory. The loop's mechanics are tested where no capacity
 * class floor applies; the class floors (the real A52, 8 GB, is mid) have their own tests below.
 */
const HIGH_END: CapacityFacts = { ...A52, totalMemoryBytes: 12 * 1024 ** 3 };

const LOW_END: CapacityFacts = {
  ...A52,
  totalMemoryBytes: 2 * 1024 ** 3,
  cpuCores: 4,
  sdkInt: 30,
  supportsRuntimeShader: false,
};

const window = (
  start: number,
  averageMs: number,
  overrides: Partial<FrameWindow> = {},
): FrameWindow => ({
  startMs: start,
  endMs: start + 500,
  frames: 30,
  averageMs,
  targetMs: 16.667,
  worstMs: averageMs * 1.5,
  droppedRatio: 0,
  ...overrides,
});

const frames = (start: number, end: number, averageMs: number): VergerEvent[] => {
  const out: VergerEvent[] = [];
  for (let t = start; t < end; t += 500)
    out.push({ type: 'frame-window', at: t + 500, window: window(t, averageMs) });
  return out;
};

describe('frame windows from the A52 idle Self trace (golden vector)', () => {
  const samples = a52.frames.map((frame) => ({ tMs: frame.tMs, durMs: frame.durMs }));
  const windows = aggregateFrames(samples, 500, a52.vsyncAppMedianGapMs);

  it('reproduces the trace: a 2.5 s burst at the full 60 Hz rate, then near silence', () => {
    expect(windows.map((w) => w.startMs)).toEqual([0, 500, 1000, 1500, 2000, 2500, 5000]);
    expect(windows.reduce((sum, w) => sum + w.frames, 0)).toBe(a52.frames.length);
    for (const w of windows.slice(1, 4)) expect(frameRate(w)).toBe(60);
    expect(windows[5]?.frames).toBe(1);
  });

  it('classifies the burst: one spike window, then near-budget frames with occasional misses', () => {
    const states = windows.map((w) => classifyFrameWindow(w, DEFAULT_VERGER_CONFIG));
    expect(states).toEqual([
      'stressed',
      'neutral',
      'neutral',
      'neutral',
      'neutral',
      'quiet',
      'calm',
    ]);
    expect(windows[0]?.worstMs).toBeCloseTo(a52.summary.max, 1);
  });

  it('puts ambient levers to sleep on the same stream once the screen is untouched for 10 s', () => {
    const events: VergerEvent[] = windows.map((w) => ({
      type: 'frame-window',
      at: w.endMs,
      window: w,
    }));
    events.push({ type: 'tick', at: 10_000 });
    const { final } = replayVerger(
      { at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS, memorySensing: true },
      events,
    );
    expect(final.interactionIdle).toBe(true);
    expect(final.levels['ambient-motion']).toBe(2);
    expect(final.levels['loading-shimmer']).toBe(1);
    expect(final.levels.particles).toBe(2);
    expect(final.levels.blur).toBe(0);
    expect(final.levels['glass-material']).toBe(0);
  });

  it('in shadow mode decides the same but applies the open-loop baseline', () => {
    const events: VergerEvent[] = [{ type: 'tick', at: 12_000 }];
    const { final } = replayVerger(
      { at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS, mode: 'shadow' },
      events,
    );
    expect(final.proposedLevels['ambient-motion']).toBe(2);
    expect(final.levels['ambient-motion']).toBe(0);
  });
});

describe('closed-loop lowering and restoring', () => {
  it('lowers the least visible lever aimed at the bottleneck first, after 750 ms of stress', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, { type: 'interaction', at: 0 });
    for (const event of frames(0, 500, 25)) state = reduceVerger(state, event);
    expect(snapshotOf(state).lastAction).toBe('stale');
    for (const event of frames(500, 1000, 25)) state = reduceVerger(state, event);
    const snap = snapshotOf(state);
    expect(snap.lastAction).toBe('decrease');
    // gpu/cpu bottleneck, low impact first, ties by id: ambient-motion.
    expect(snap.levels['ambient-motion']).toBe(1);
    expect(snap.levels.blur).toBe(0);
  });

  it('keeps lowering in a stable order under sustained stress and never touches energy first', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    // Frames that answer the levers: each window a little cheaper, still over budget throughout.
    for (let i = 0; i < 12; i += 1) {
      const averageMs = 21 + 9 * 0.85 ** i;
      state = reduceVerger(state, { type: 'frame-window', at: i * 500 + 500, window: window(i * 500, averageMs) });
    }
    // One decrease per two over-budget windows (750 ms needs two 500 ms windows).
    expect(state.stack.length).toBe(6);
    expect(state.stack.slice(0, 3)).toEqual(['ambient-motion', 'loading-shimmer', 'particles']);
    expect(snapshotOf(state, 6000).proposedLevels.prefetch).toBe(0);
  });

  it('stops lowering when its steps do not bring frames toward the budget (P8)', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    for (const event of frames(0, 6000, 30)) state = reduceVerger(state, event);
    expect(state.stack.length).toBe(DEFAULT_VERGER_CONFIG.frameReliefSteps);
    expect(snapshotOf(state).lastReason).toMatch(/not relieved by levers/);
  });

  it('restores last-in first-out after sustained comfort, and backs off after a failed upgrade', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    for (const event of frames(0, 1000, 25)) state = reduceVerger(state, event);
    expect(state.stack).toEqual(['ambient-motion']);
    for (const event of frames(1000, 5500, 8)) state = reduceVerger(state, event);
    expect(state.stack).toEqual([]);
    expect(state.lastIncreaseAt).toBe(5000);
    // Stress returns within the failed-upgrade window: hold doubles.
    for (const event of frames(5500, 6500, 25)) state = reduceVerger(state, event);
    expect(state.upgradeAfterMs).toBe(8000);
    // Comfort for only 4 s is no longer enough.
    for (const event of frames(6500, 11_000, 8)) state = reduceVerger(state, event);
    expect(state.stack.length).toBe(1);
    for (const event of frames(11_000, 15_000, 8)) state = reduceVerger(state, event);
    expect(state.stack.length).toBe(0);
  });
});

describe('thermal and memory pressure', () => {
  it('maps ADPF headroom before status, and treats missing data as unknown', () => {
    const config = DEFAULT_VERGER_CONFIG;
    expect(thermalLevelOf('none', 0.5, config)).toBe('nominal');
    expect(thermalLevelOf('none', 0.9, config)).toBe('warm');
    expect(thermalLevelOf('none', 0.97, config)).toBe('hot');
    expect(thermalLevelOf('none', 1.1, config)).toBe('critical');
    expect(thermalLevelOf('severe', null, config)).toBe('hot');
    expect(thermalLevelOf('none', Number.NaN, config)).toBe('nominal');
    expect(thermalLevelOf(null, null, config)).toBe('unknown');
  });

  it('lowers continuous gpu work first when hot, spaced by the thermal delay, and blocks upgrades', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, { type: 'thermal', at: 100, status: 'moderate', headroom: 0.97 });
    expect(state.stack).toEqual(['ambient-motion']);
    state = reduceVerger(state, { type: 'tick', at: 1000 });
    expect(state.stack.length).toBe(1);
    state = reduceVerger(state, { type: 'tick', at: 2200 });
    expect(state.stack.length).toBe(2);
    expect(snapshotOf(state).optionalConcurrency).toBe(1);
    state = reduceVerger(state, { type: 'thermal', at: 3000, status: 'light', headroom: 0.9 });
    state = reduceVerger(state, { type: 'tick', at: 20_000 });
    expect(state.stack.length).toBe(2);
    state = reduceVerger(state, { type: 'thermal', at: 21_000, status: 'none', headroom: 0.6 });
    // Cool again, but nothing has been drawn yet: silence is not evidence, so nothing rises.
    state = reduceVerger(state, { type: 'tick', at: 25_100 });
    expect(state.stack.length).toBe(2);
    // Calm frames are evidence, but heat steps down only after the thermal dwell (P4).
    for (const event of frames(25_100, 26_100, 8)) state = reduceVerger(state, event);
    expect(state.stack.length).toBe(2);
    const cooled = 21_000 + DEFAULT_VERGER_CONFIG.thermalDwellMs;
    for (const event of frames(cooled, cooled + 1_000, 8)) state = reduceVerger(state, event);
    expect(state.stack.length).toBe(1);
  });

  it('fast-decreases and stops optional work when critical', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, { type: 'thermal', at: 50, status: 'critical', headroom: 1.05 });
    expect(state.stack.length).toBe(3);
    expect(snapshotOf(state).optionalConcurrency).toBe(0);
    expect(snapshotOf(state).lastAction).toBe('fast-decrease');
  });

  it('relieves memory levers first on a trim and latches for 30 s', () => {
    let state = createVergerState({
      at: 0,
      capacity: HIGH_END,
      levers: GURUDEVI_LEVERS,
      memorySensing: true,
    });
    expect(snapshotOf(state).memory).toBe('normal');
    state = reduceVerger(state, { type: 'memory-trim', at: 100, severity: 'moderate' });
    expect(state.stack).toEqual(['image-cache']);
    state = reduceVerger(state, { type: 'memory-trim', at: 200, severity: 'critical' });
    expect(state.stack.slice(1, 3)).toEqual(['image-cache', 'image-decode']);
    expect(snapshotOf(state).memory).toBe('low');
    expect(snapshotOf(state).optionalConcurrency).toBe(0);
    state = reduceVerger(state, { type: 'tick', at: 30_300 });
    expect(snapshotOf(state).memory).toBe('normal');
  });
});

describe('floors: users, the system and the hardware come first', () => {
  it('honours reduce motion and never raises a motion lever above its floor', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, {
      type: 'preferences',
      at: 1,
      reduceMotion: true,
      fidelity: 'auto',
    });
    const snap = snapshotOf(state);
    expect(snap.levels.transitions).toBe(2);
    expect(snap.levels['ambient-motion']).toBe(2);
    expect(snap.levels.blur).toBe(0);
  });

  it('starts a 2 GB phone without ambient effects, refraction or a second optional job', () => {
    const state = createVergerState({ at: 0, capacity: LOW_END, levers: GURUDEVI_LEVERS });
    const snap = snapshotOf(state);
    expect(snap.levels['ambient-motion']).toBe(2);
    expect(snap.levels['glass-material']).toBeGreaterThanOrEqual(1);
    expect(snap.levels.blur).toBe(1);
    expect(snap.optionalConcurrency).toBe(1);
  });

  it('lets a user who asks for high fidelity keep effects on a low-memory phone, until pressure says otherwise', () => {
    let state = createVergerState({ at: 0, capacity: LOW_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, {
      type: 'preferences',
      at: 1,
      reduceMotion: false,
      fidelity: 'high',
    });
    expect(snapshotOf(state).levels.blur).toBe(0);
    expect(snapshotOf(state).levels['glass-material']).toBe(1);
  });

  it('stills everything ambient and stops optional work in the background', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, { type: 'app-state', at: 10, state: 'background' });
    const snap = snapshotOf(state);
    expect(snap.levels['ambient-motion']).toBe(2);
    expect(snap.levels.prefetch).toBe(2);
    expect(snap.optionalConcurrency).toBe(0);
  });

  it('wakes ambient levers on the next touch', () => {
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    state = reduceVerger(state, { type: 'tick', at: 15_000 });
    expect(snapshotOf(state).levels['ambient-motion']).toBe(2);
    state = reduceVerger(state, { type: 'interaction', at: 15_100 });
    expect(snapshotOf(state).levels['ambient-motion']).toBe(0);
  });
});

describe('determinism and validation', () => {
  it('produces identical snapshots for identical streams', () => {
    const events = [...frames(0, 3000, 28), { type: 'tick', at: 13_000 } as VergerEvent];
    const a = replayVerger({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS }, events);
    const b = replayVerger({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS }, events);
    expect(a.snapshots).toEqual(b.snapshots);
  });

  it('rejects malformed lever catalogues', () => {
    const bad: LeverSpec = { ...GURUDEVI_LEVERS[0]!, levels: ['one'] };
    expect(() => createVergerState({ at: 0, levers: [bad] })).toThrow(/must describe/);
    expect(() =>
      createVergerState({ at: 0, levers: [GURUDEVI_LEVERS[0]!, GURUDEVI_LEVERS[0]!] }),
    ).toThrow(/Duplicate/);
  });
});

describe('controlled experiment', () => {
  it('assigns installs deterministically and close to the requested split', () => {
    let treatment = 0;
    for (let i = 0; i < 10_000; i += 1) {
      const a = assignExperiment({
        installId: `install-${i}`,
        key: 'verger-v1',
        treatmentPercent: 50,
        killSwitch: false,
      });
      const b = assignExperiment({
        installId: `install-${i}`,
        key: 'verger-v1',
        treatmentPercent: 50,
        killSwitch: false,
      });
      expect(a).toEqual(b);
      if (a.arm === 'treatment') treatment += 1;
    }
    expect(treatment).toBeGreaterThan(4_700);
    expect(treatment).toBeLessThan(5_300);
  });

  it('turns the runtime off entirely when the kill switch is on', () => {
    const a = assignExperiment({
      installId: 'x',
      key: 'verger-v1',
      treatmentPercent: 100,
      killSwitch: true,
    });
    expect(a).toMatchObject({
      arm: 'control',
      mode: 'shadow',
      runtime: 'off',
      reason: 'kill-switch',
    });
  });
});

describe('telemetry', () => {
  it('emits only on change, caps events, and survives a throwing sink', () => {
    const events: Array<[string, Record<string, unknown>]> = [];
    const telemetry = createVergerTelemetry({
      sink: (name, attributes) => {
        events.push([name, attributes]);
        if (events.length === 2) throw new Error('transport down');
      },
      arm: 'treatment',
      experimentKey: 'verger-v1',
      maxEvents: 4,
    });
    let state = createVergerState({ at: 0, capacity: HIGH_END, levers: GURUDEVI_LEVERS });
    telemetry.onSnapshot(snapshotOf(state));
    telemetry.onSnapshot(snapshotOf(state));
    expect(events.map(([name]) => name)).toEqual(['verger_started']);
    state = reduceVerger(state, { type: 'tick', at: 11_000 });
    telemetry.onSnapshot(snapshotOf(state));
    expect(events.length).toBe(4);
    expect(telemetry.emitted).toBe(4);
    for (let i = 0; i < 20; i += 1)
      telemetry.onSnapshot(
        snapshotOf(reduceVerger(state, { type: 'interaction', at: 12_000 + i })),
      );
    expect(events.length).toBe(4);
    expect(events[0]?.[1]).toMatchObject({ experiment: 'verger-v1', arm: 'treatment' });
  });

  it('summarises idle drawing from the A52 trace without per-frame events', () => {
    const names: string[] = [];
    const telemetry = createVergerTelemetry({
      sink: (name) => names.push(name),
      arm: 'control',
      experimentKey: 'verger-v1',
      summaryEveryMs: 5000,
    });
    const windows = aggregateFrames(a52.frames, 500, a52.vsyncAppMedianGapMs);
    for (const w of windows) telemetry.onFrameWindow(w, true);
    telemetry.flush(6000);
    expect(names).toEqual(['verger_summary']);
  });
});
