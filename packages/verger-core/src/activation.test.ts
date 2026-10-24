import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  ACTIVATION_PRESETS,
  type ActivationPatch,
  activationForMode,
  capActivation,
  leverActivation,
  modeForActivation,
  parseActivationPatch,
  resolveActivation,
  sensorOf,
} from './activation';
import { VERGER_BUILTIN_LEVERS } from './builtins';
import { DEFAULT_GOVERNOR_CONFIG } from './config';
import { createGovernor, reduceGovernor, snapshotOf } from './governor';
import type { CapacityFacts, GovernorEvent } from './types';

describe('activation', () => {
  it('later patches win field by field, and per sensor and lever', () => {
    const resolved = resolveActivation(
      ACTIVATION_PRESETS.active,
      { sense: { threads: false }, levers: { 'refresh-rate': 'shadow' } },
      { sense: { frames: false }, levers: { 'global-motion': 'off' }, observe: 'exhaustive' },
      null,
    );
    expect(resolved.sense.threads).toBe(false);
    expect(resolved.sense.frames).toBe(false);
    expect(resolved.sense.thermal).toBe(true);
    expect(leverActivation(resolved, 'refresh-rate')).toBe('shadow');
    expect(leverActivation(resolved, 'global-motion')).toBe('off');
    expect(leverActivation(resolved, 'anything-else')).toBe('apply');
    expect(resolved.observe).toBe('exhaustive');
  });

  it('the ladder only lowers: shadow demotes apply, and hardware needs every permission', () => {
    const lab = resolveActivation(ACTIVATION_PRESETS.lab, { levers: { blur: 'off' } });
    const capped = capActivation(lab, { runtime: 'shadow', hardware: true, grow: false });
    expect(capped.defaultLever).toBe('shadow');
    expect(capped.admission).toBe('shadow');
    expect(capped.levers.blur).toBe('off');
    expect(capped.hardware).toBe(false);
    expect(capped.grow).toBe(false);
    expect(capActivation(lab, { runtime: 'active', hardware: false }).hardware).toBe(false);
    const quiet = capActivation(ACTIVATION_PRESETS.static, { runtime: 'active', hardware: true });
    expect(quiet.hardware).toBe(false);
  });

  it('modes map to the presets that reproduce them', () => {
    expect(activationForMode('active')).toBe(ACTIVATION_PRESETS.active);
    expect(activationForMode('shadow')).toBe(ACTIVATION_PRESETS.shadow);
  });

  it('rejects any malformed remote patch whole', () => {
    const levers = VERGER_BUILTIN_LEVERS;
    expect(parseActivationPatch({ sense: { thermal: false }, levers: { 'refresh-rate': 'off' } }, levers)).toEqual({
      patch: { sense: { thermal: false }, levers: { 'refresh-rate': 'off' } },
    });
    expect(parseActivationPatch({ levers: { blur: 'off' } }, levers)).toEqual({ error: 'unknown lever "blur"' });
    expect(parseActivationPatch({ sense: { gps: true } }, levers)).toEqual({ error: 'unknown sensor "gps"' });
    expect(parseActivationPatch({ reduce: 'yes' }, levers)).toEqual({ error: 'reduce must be a boolean' });
    expect(parseActivationPatch({ extra: 1 }, levers)).toEqual({ error: 'unknown field "extra"' });
    expect(parseActivationPatch([], levers)).toEqual({ error: 'not an object' });
  });

  it('names the sensor behind each reading and none for app events', () => {
    expect(sensorOf({ type: 'thermal', at: 0, status: 'none', headroom: null })).toBe('thermal');
    expect(sensorOf({ type: 'memory-state', at: 0, availableMb: 1, thresholdMb: 1, lowMemory: false })).toBe('memory');
    expect(sensorOf({ type: 'interaction', at: 0 })).toBeNull();
  });

  it('travels through the reducer as an event and onto the snapshot', () => {
    const state = createGovernor({ at: 0, levers: VERGER_BUILTIN_LEVERS, mode: 'shadow' });
    expect(snapshotOf(state).activation).toBe(ACTIVATION_PRESETS.shadow);
    const next = reduceGovernor(state, { type: 'activation', at: 1, activation: ACTIVATION_PRESETS.lab });
    expect(next.version).toBe(state.version + 1);
    expect(snapshotOf(next).activation).toBe(ACTIVATION_PRESETS.lab);
  });
});

// ---------------------------------------------------------------------------------------------
// What each control does to decisions. Each case runs the same stream under the active preset
// (the control) and under one change, so the difference is that change alone.
// ---------------------------------------------------------------------------------------------

const CAPACITY: CapacityFacts = {
  totalMemoryBytes: 8 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 34,
  cpuCores: 8,
  refreshRateHz: 120,
  supportsRenderEffect: true,
  supportsRuntimeShader: true,
  refreshRatesHz: [60, 120],
  supportsCpuHints: true,
};

const frames = (startMs: number, averageMs: number, droppedRatio: number): GovernorEvent => ({
  type: 'frame-window',
  at: startMs + 500,
  window: {
    startMs,
    endMs: startMs + 500,
    frames: 30,
    averageMs,
    targetMs: 16.7,
    worstMs: averageMs + 5,
    droppedRatio,
  },
});
const stressed = (startMs: number) => frames(startMs, 30, 0.3);
const calm = (startMs: number) => frames(startMs, 8, 0);
const touch = (at: number): GovernorEvent => ({ type: 'interaction', at });

function run(patch: ActivationPatch | null, events: readonly GovernorEvent[]) {
  let state = createGovernor({
    at: 0,
    levers: SAMPLE_LEVERS,
    capacity: CAPACITY,
    memorySensing: true,
    activation: resolveActivation(ACTIVATION_PRESETS.active, patch),
  });
  for (const event of events) state = reduceGovernor(state, event);
  return { state, snapshot: snapshotOf(state) };
}

const STRESS = [touch(0), stressed(0), touch(500), stressed(500)];

describe('activation governs decisions', () => {
  it('the control: sustained stress lowers a lever', () => {
    expect(Object.keys(run(null, STRESS).snapshot.pressure)).not.toHaveLength(0);
  });

  it('reduce off: stress is seen but nothing is lowered, and says why', () => {
    const { state, snapshot } = run({ reduce: false }, STRESS);
    expect(snapshot.frameState).toBe('stressed');
    expect(snapshot.pressure).toEqual({});
    expect(state.lastReason).toContain('reducing is switched off');
  });

  it('reduce off: contention is reported, never judged unrelievable', () => {
    const load: GovernorEvent[] = [0, 1000, 2000, 3000, 4000].map((at) => ({
      type: 'thread-load',
      at,
      cores: { js: 1 },
      processCores: 1.5,
    }));
    const { snapshot } = run({ reduce: false }, load);
    expect(snapshot.contention).toBe('js');
    expect(snapshot.contentionExhausted).toBe(false);
    expect(snapshot.pressure).toEqual({});
  });

  it('grow off: quality lowered under stress stays lowered after calm frames', () => {
    const recover = [...STRESS, touch(1000), calm(1000), touch(6000), { type: 'tick', at: 6000 } as const];
    expect(run(null, recover).snapshot.pressure).toEqual({});
    expect(Object.keys(run({ grow: false }, recover).snapshot.pressure)).not.toHaveLength(0);
  });

  it('an off lever is never picked and is left at full quality, floors included', () => {
    const saver: GovernorEvent = { type: 'power', at: 1, saver: true };
    expect(run(null, [saver]).snapshot.levels.sparkle).toBe(2);
    const { snapshot } = run({ levers: { sparkle: 'off' } }, [saver, ...STRESS]);
    expect(snapshot.levels.sparkle).toBe(0);
    expect(snapshot.proposedLevels.sparkle).toBe(0);
    expect(snapshot.pressure.sparkle).toBeUndefined();
  });

  it('a shadow lever publishes the baseline and records the decision as proposed', () => {
    const { snapshot } = run(
      { levers: { sparkle: 'off', 'refresh-rate': 'off', 'rows-ahead': 'off', frosting: 'shadow' } },
      STRESS,
    );
    expect(snapshot.proposedLevels.frosting).toBe(1);
    expect(snapshot.levels.frosting).toBe(0);
  });

  it('static: floors only, so no pressure and no ambient sleep', () => {
    const idle = [touch(0), { type: 'tick', at: 20_000 } as const];
    expect(run(null, idle).snapshot.levels.sparkle).toBe(2);
    const { snapshot } = run({ decide: 'static' }, [...STRESS, ...idle.slice(1)]);
    expect(snapshot.levels.sparkle).toBe(0);
    expect(snapshot.pressure).toEqual({});
    expect(snapshot.proposedLevels).toEqual(snapshot.levels);
  });

  it('a switched-off sensor is not heard, and what it said is forgotten', () => {
    const hot: GovernorEvent = { type: 'thermal', at: 10, status: 'critical', headroom: 1.2 };
    expect(run(null, [hot]).snapshot.thermal).toBe('critical');
    const deaf = run({ sense: { thermal: false } }, [hot]).snapshot;
    expect(deaf.thermal).toBe('unknown');
    expect(deaf.pressure).toEqual({});
    const off = resolveActivation(ACTIVATION_PRESETS.active, { sense: { thermal: false } });
    const forgot = run(null, [hot, { type: 'activation', at: 20, activation: off }]).snapshot;
    expect(forgot.thermal).toBe('unknown');
  });

  it('admission off admits the maximum even under battery saver', () => {
    const saver: GovernorEvent = { type: 'power', at: 1, saver: true };
    expect(run(null, [saver]).snapshot.optionalConcurrency).toBe(0);
    expect(run({ admission: 'off' }, [saver]).snapshot.optionalConcurrency).toBe(
      DEFAULT_GOVERNOR_CONFIG.maxOptionalConcurrency,
    );
  });

  it('hardware off: no refresh cap and no CPU boost, while levels still decide', () => {
    const idle = [touch(0), { type: 'tick', at: 20_000 } as const];
    expect(run(null, idle).snapshot.refreshCapHz).toBe(60);
    expect(run(null, [touch(0)]).snapshot.cpuBoost).toBe(true);
    const off = run({ hardware: false }, idle).snapshot;
    expect(off.refreshCapHz).toBeNull();
    expect(off.levels['refresh-rate']).toBe(1);
    expect(run({ hardware: false }, [touch(0)]).snapshot.cpuBoost).toBe(false);
  });
});

describe('modeForActivation', () => {
  it('asks for active only when something would reach the app or the hardware', () => {
    expect(modeForActivation(ACTIVATION_PRESETS.active)).toBe('active');
    expect(modeForActivation(ACTIVATION_PRESETS.lab)).toBe('active');
    expect(modeForActivation(ACTIVATION_PRESETS.static)).toBe('active');
    expect(modeForActivation(ACTIVATION_PRESETS.shadow)).toBe('shadow');
    const one = resolveActivation(ACTIVATION_PRESETS.shadow, { levers: { sparkle: 'apply' } });
    expect(modeForActivation(one)).toBe('active');
  });
});
