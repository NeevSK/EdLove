import { describe, expect, it } from 'vitest';
import {
  ACTIVATION_PRESETS,
  activationForMode,
  capActivation,
  leverActivation,
  parseActivationPatch,
  resolveActivation,
  sensorOf,
} from './activation';
import { VERGER_BUILTIN_LEVERS } from './builtins';
import { createGovernor, reduceGovernor, snapshotOf } from './governor';

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
