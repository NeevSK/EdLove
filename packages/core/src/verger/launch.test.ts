import { ACTIVATION_PRESETS } from '@repo/verger-core';
import { describe, expect, it } from 'vitest';
import { GURUDEVI_LEVERS } from './gurudeviLevers';
import { resolveVergerLaunch, type VergerLaunchInputs } from './launch';

const base: VergerLaunchInputs = {
  override: undefined,
  buildMode: undefined,
  buildPreset: undefined,
  remotePatch: undefined,
  dev: false,
  levers: GURUDEVI_LEVERS,
};
const launch = (over: Partial<VergerLaunchInputs>) => resolveVergerLaunch({ ...base, ...over });

describe('what verger may do this launch', () => {
  it('a release with nothing configured stays off: its preset is not decided in code', () => {
    expect(launch({})).toMatchObject({ mode: 'off', activation: null, source: 'release default' });
  });

  it('a development build defaults to the lab: every layer on and reported', () => {
    expect(launch({ dev: true })).toMatchObject({
      mode: 'active',
      activation: ACTIVATION_PRESETS.lab,
    });
  });

  it('a development build can still be built off', () => {
    expect(launch({ dev: true, buildMode: 'off' }).mode).toBe('off');
  });

  it('the build preset wins over the build mode; a mode override wins over both', () => {
    expect(launch({ buildPreset: 'static', buildMode: 'shadow' }).activation).toEqual(
      ACTIVATION_PRESETS.static,
    );
    expect(launch({ buildPreset: 'lab', override: 'shadow' })).toMatchObject({
      mode: 'shadow',
      activation: ACTIVATION_PRESETS.shadow,
    });
  });

  it('the remote kill switch beats every preset and patch', () => {
    expect(
      launch({ dev: true, buildPreset: 'lab', override: 'off', remotePatch: { reduce: true } })
        .mode,
    ).toBe('off');
  });

  it('a remote patch applies over the preset, and can lower the mode it asks for', () => {
    const shadowed = launch({
      buildPreset: 'active',
      remotePatch: { defaultLever: 'shadow', admission: 'shadow', hardware: false },
    });
    expect(shadowed.mode).toBe('shadow');
    expect(shadowed.source).toBe('active + remote patch');
    expect(
      launch({ buildPreset: 'active', remotePatch: { sense: { network: false } } }).activation
        ?.sense.network,
    ).toBe(false);
  });

  it('a malformed remote patch is ignored whole and reported', () => {
    const bad = launch({
      buildPreset: 'active',
      remotePatch: { levers: { 'no-such-lever': 'off' }, reduce: false },
    });
    expect(bad.activation).toEqual(ACTIVATION_PRESETS.active);
    expect(bad.rejected).toMatch(/unknown lever/);
  });

  it('a development build applies the lab patch over the preset', () => {
    const lab = launch({ dev: true, localPatch: { grow: false } });
    expect(lab.activation?.grow).toBe(false);
    expect(lab.source).toBe('lab + lab patch');
  });

  it('a release ignores a lab patch left in storage, even a malformed one', () => {
    const release = launch({ buildPreset: 'active', localPatch: { grow: false } });
    expect(release.activation).toEqual(ACTIVATION_PRESETS.active);
    expect(release.source).toBe('active');
    expect(launch({ buildPreset: 'active', localPatch: 'junk' }).rejectedLocal).toBeNull();
  });

  it('remote config overrules the lab; the kill switch beats both', () => {
    const both = launch({ dev: true, localPatch: { grow: false }, remotePatch: { grow: true } });
    expect(both.activation?.grow).toBe(true);
    expect(both.source).toBe('lab + lab patch + remote patch');
    expect(launch({ dev: true, localPatch: { grow: false }, override: 'off' }).mode).toBe('off');
  });

  it('a malformed lab patch is ignored whole and reported apart from the remote one', () => {
    const bad = launch({ dev: true, localPatch: { levers: { 'no-such-lever': 'off' }, grow: false } });
    expect(bad.activation).toEqual(ACTIVATION_PRESETS.lab);
    expect(bad.rejectedLocal).toMatch(/unknown lever/);
    expect(bad.rejected).toBeNull();
  });

  it('an unknown build preset is not a preset', () => {
    expect(launch({ buildPreset: 'turbo' }).mode).toBe('off');
  });
});
