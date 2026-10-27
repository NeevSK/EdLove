import { ACTIVATION_PRESETS } from '@repo/verger-core';
import { describe, expect, it } from 'vitest';
import { GURUDEVI_LEVERS } from './gurudeviLevers';
import { GURUDEVI_MOBILE_HOST } from './host';
import {
  hostWith,
  hostWithConfig,
  resolveVergerPolicy,
  VERGER_POLICIES,
  resolveVergerConfig,
  resolveVergerLaunch,
  VERGER_REMOTE_FLAG_KEYS,
  type VergerLaunchInputs,
  vergerRemoteFromFlags,
} from './launch';

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

describe('this launch\'s thresholds', () => {
  const base = GURUDEVI_MOBILE_HOST.config;
  const config = (over: Partial<Parameters<typeof resolveVergerConfig>[0]>) =>
    resolveVergerConfig({ base, remoteConfig: undefined, dev: false, ...over });

  it('nothing set is the host\'s config, unpatched', () => {
    expect(config({})).toEqual({ config: base, patched: false, rejectedConfig: null, rejectedLocalConfig: null });
  });

  it('remote overrules the lab; the lab counts only in a development build', () => {
    const both = config({ dev: true, localConfig: { upgradeAfterMs: 2000, storageLowBytes: 1 }, remoteConfig: { upgradeAfterMs: 3000 } });
    expect(both.config.upgradeAfterMs).toBe(3000);
    expect(both.config.storageLowBytes).toBe(1);
    expect(both.patched).toBe(true);
    expect(config({ localConfig: { upgradeAfterMs: 2000 } }).config.upgradeAfterMs).toBe(base.upgradeAfterMs);
  });

  it('a malformed or invalid patch is refused whole, with its reason, and the rest still applies', () => {
    const bad = config({ remoteConfig: { upgradeAfterMs: 2000, noSuch: 1 } });
    expect(bad.config).toEqual(base);
    expect(bad.rejectedConfig).toMatch(/unknown threshold/);
    const invalid = config({ dev: true, localConfig: { storageLowBytes: 1 }, remoteConfig: { upgradeAfterMs: 10 ** 9 } });
    expect(invalid.config.storageLowBytes).toBe(1);
    expect(invalid.config.upgradeAfterMs).toBe(base.upgradeAfterMs);
    expect(invalid.rejectedConfig).toMatch(/below/);
  });

  it('a host on another config keeps its levers and policy and gets its own hash', () => {
    const patched = hostWithConfig(GURUDEVI_MOBILE_HOST, { ...base, upgradeAfterMs: 2000 });
    expect(patched.levers).toEqual(GURUDEVI_MOBILE_HOST.levers);
    expect(patched.policy).toBe(GURUDEVI_MOBILE_HOST.policy);
    expect(patched.configHash).not.toBe(GURUDEVI_MOBILE_HOST.configHash);
  });
});

describe('verger\'s remote inputs from feature flags', () => {
  it('reads the mode, and the patches as JSON strings; absent flags are no input', () => {
    expect(
      vergerRemoteFromFlags({
        [VERGER_REMOTE_FLAG_KEYS.mode]: 'off',
        [VERGER_REMOTE_FLAG_KEYS.activation]: '{"grow":false}',
        [VERGER_REMOTE_FLAG_KEYS.config]: '{"upgradeAfterMs":2000}',
      }),
    ).toEqual({ override: 'off', remotePatch: { grow: false }, remoteConfig: { upgradeAfterMs: 2000 } });
    expect(vergerRemoteFromFlags({})).toEqual({ override: undefined, remotePatch: undefined, remoteConfig: undefined });
  });

  it('an unparseable patch reaches the strict parser, which refuses it with the reason', () => {
    const inputs = vergerRemoteFromFlags({ [VERGER_REMOTE_FLAG_KEYS.config]: '{oops' });
    expect(inputs.remoteConfig).toMatch(/^unparseable/);
    const read = resolveVergerConfig({ base: GURUDEVI_MOBILE_HOST.config, remoteConfig: inputs.remoteConfig, dev: false });
    expect(read.patched).toBe(false);
    expect(read.rejectedConfig).toMatch(/object of thresholds/);
  });
});

describe('which policy decides this launch', () => {
  const pick = (over: Partial<Parameters<typeof resolveVergerPolicy>[0]>) =>
    resolveVergerPolicy({ build: undefined, remote: undefined, dev: false, ...over });

  it('p4 by default; then build, lab (development only) and remote, weakest first', () => {
    expect(pick({})).toMatchObject({ name: 'p4', source: 'default', rejected: null });
    expect(pick({ build: 'p5' })).toMatchObject({ name: 'p5', source: 'build' });
    expect(pick({ build: 'p5', local: 'p4' })).toMatchObject({ name: 'p5', source: 'build' });
    expect(pick({ build: 'p5', local: 'p4', dev: true })).toMatchObject({ name: 'p4', source: 'lab' });
    expect(pick({ local: 'p4', remote: 'p5', dev: true })).toMatchObject({ name: 'p5', source: 'remote' });
    expect(pick({ remote: 'p5' }).policy).toBe(VERGER_POLICIES.p5);
  });

  it('an unknown name is refused and reported; the layer below decides', () => {
    const read = pick({ build: 'p5', remote: 'p9' });
    expect(read).toMatchObject({ name: 'p5', source: 'build' });
    expect(read.rejected).toMatch(/remote: unknown policy "p9"/);
    expect(pick({ remote: 'constructor' }).name).toBe('p4');
  });

  it('a split sends a stable share of installs to p5; a forced choice overrules it', () => {
    const arms = Array.from({ length: 1000 }, (_, i) =>
      pick({ split: { installId: `install-${i}`, key: 'k', treatmentPercent: 20 } }),
    );
    const p5 = arms.filter((a) => a.name === 'p5').length;
    expect(p5).toBeGreaterThan(150);
    expect(p5).toBeLessThan(250);
    const one = { installId: 'install-7', key: 'k', treatmentPercent: 20 };
    expect(pick({ split: one }).name).toBe(pick({ split: one }).name);
    expect(pick({ split: one, remote: 'p4' })).toMatchObject({ name: 'p4', source: 'remote' });
    expect(pick({ split: { ...one, treatmentPercent: 0 } }).source).toBe('default');
  });

  it('another policy keys its own recovery ladder', () => {
    const p5 = hostWith(GURUDEVI_MOBILE_HOST, { policy: VERGER_POLICIES.p5 });
    expect(p5.experimentKey).not.toBe(GURUDEVI_MOBILE_HOST.experimentKey);
    expect(p5.config).toEqual(GURUDEVI_MOBILE_HOST.config);
  });
});
