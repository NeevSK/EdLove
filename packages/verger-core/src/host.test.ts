import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SAMPLE_LEVERS } from './__fixtures__/sampleHost';
import {
  type CapacityFacts,
  createGovernor,
  DEFAULT_GOVERNOR_CONFIG,
  defineHost,
  type LeverSpec,
  reduceGovernor,
  snapshotOf,
  VERGER_GLOBAL_MOTION,
  VERGER_REFRESH_CAP,
} from './index';

const PHONE: CapacityFacts = {
  totalMemoryBytes: 6 * 1024 ** 3,
  isLowRamDevice: false,
  memoryClassMb: 256,
  sdkInt: 30,
  cpuCores: 8,
  refreshRateHz: 90,
  supportsRenderEffect: false,
  supportsRuntimeShader: false,
  refreshRatesHz: [60, 90],
  supportsCpuHints: false,
};

describe('verger knows no host', () => {
  it('names no host and no host lever anywhere in its source', () => {
    const dir = import.meta.dirname;
    const sources = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    const forbidden =
      /gurudevi|edlove|sanctuary|'blur'|'glass-material'|'prefetch'|'ambient-motion'|'image-cache'/i;
    for (const file of sources) {
      const text = readFileSync(path.join(dir, file), 'utf8');
      expect(text, file).not.toMatch(forbidden);
    }
  });

  it('keeps every verger package free of host names', () => {
    const root = path.join(import.meta.dirname, '..', '..');
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '__fixtures__')
          return [];
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return /\.(ts|tsx|kt|gradle|json)$/.test(entry.name) ? [full] : [];
      });
    const files = ['verger-core', 'verger-android', 'verger-react'].flatMap((pkg) =>
      walk(path.join(root, pkg)),
    );
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      if (file.endsWith('host.test.ts')) continue; // this test names what it forbids
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/gurudevi|edlove|sanctuary/i);
    }
  });

  it('refers to its own built-in levers only by actuator, never by id', () => {
    const governor = readFileSync(path.join(import.meta.dirname, 'governor.ts'), 'utf8');
    expect(governor).not.toMatch(/'refresh-rate'|'global-motion'/);
  });

  it('applies declared rules whatever the levers are called', () => {
    const renamed: readonly LeverSpec[] = [
      { ...VERGER_REFRESH_CAP, id: 'display-pace' },
      { ...VERGER_GLOBAL_MOTION, id: 'stillness' },
      ...SAMPLE_LEVERS.filter((l) => l.actuator === undefined),
    ];
    let state = createGovernor({ at: 0, capacity: PHONE, levers: renamed });
    // Graphics capabilities missing: the declared floors apply.
    expect(snapshotOf(state).levels.frosting).toBe(2);
    // Hidden: the declared whenHidden floor applies.
    state = reduceGovernor(state, { type: 'app-state', at: 1, state: 'background' });
    expect(snapshotOf(state).levels['warm-ahead']).toBe(2);
    // Idle and visible: the refresh actuator is found by its actuator, under its new name.
    state = reduceGovernor(state, { type: 'app-state', at: 2, state: 'active' });
    state = reduceGovernor(state, { type: 'tick', at: 20_000 });
    expect(snapshotOf(state).levels['display-pace']).toBe(1);
    expect(snapshotOf(state).refreshCapHz).toBe(60);
  });
});

describe('defineHost', () => {
  it('freezes a valid host and versions its experiment key', () => {
    const host = defineHost({
      name: 'sample-app',
      levers: SAMPLE_LEVERS,
      config: { refreshCapHz: 72 },
    });
    expect(host.config.refreshCapHz).toBe(72);
    expect(host.experimentKey).toMatch(/^sample-app-verger-p\d+$/);
    expect(host.configHash).toMatch(/^[0-9a-f]{8}$/);
    expect(Object.isFrozen(host.levers)).toBe(true);
  });

  it('rejects bad names, bad rules, duplicate actuators and incoherent thresholds at startup', () => {
    expect(() => defineHost({ name: 'Bad Name', levers: SAMPLE_LEVERS })).toThrow(/Host name/);
    expect(() =>
      defineHost({ name: 'x-app', levers: [{ ...SAMPLE_LEVERS[2]!, whenHidden: 9 } as LeverSpec] }),
    ).toThrow(/whenHidden/);
    expect(() =>
      defineHost({
        name: 'x-app',
        levers: [VERGER_REFRESH_CAP, { ...VERGER_REFRESH_CAP, id: 'second-cap' }],
      }),
    ).toThrow(/Actuator "refresh-cap"/);
    expect(() =>
      defineHost({ name: 'x-app', levers: SAMPLE_LEVERS, config: { comfortRatio: 2 } }),
    ).toThrow(/comfortRatio/);
    expect(() =>
      defineHost({
        name: 'x-app',
        levers: SAMPLE_LEVERS,
        config: { saturationAfterMs: Number.NaN },
      }),
    ).toThrow(/saturationAfterMs/);
    expect(DEFAULT_GOVERNOR_CONFIG.refreshCapHz).toBe(60);
  });
});
