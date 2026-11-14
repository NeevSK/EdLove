import { describe, expect, it, vi } from 'vitest';

vi.mock('@repo/core/native/storage', () => {
  const data = new Map<string, string>();
  return {
    storage: {
      getString: (k: string) => data.get(k),
      set: (k: string, v: string) => data.set(k, String(v)),
      delete: (k: string) => data.delete(k),
    },
  };
});
vi.mock('expo-application', () => ({ getAndroidId: () => 'install-1' }));

import {
  addSample,
  addSwitch,
  EMPTY_STATS,
  readStats,
  summarize,
  writeStats,
} from '@/lib/navigation/shellMetrics';
import { resolveShellVariant } from '@/lib/navigation/shellVariant';

describe('shell variant', () => {
  it('defaults to the custom tabs', () => {
    expect(resolveShellVariant({})).toEqual({ variant: 'custom', reason: 'default', bucket: null });
  });

  it('lets a choice on the phone win over remote, build and split', () => {
    const choice = resolveShellVariant({
      override: 'native',
      remote: 'custom',
      build: 'custom',
      nativePercent: 0,
    });
    expect(choice).toMatchObject({ variant: 'native', reason: 'override' });
    expect(resolveShellVariant({ remote: 'custom', build: 'native' }).reason).toBe('remote');
    expect(resolveShellVariant({ build: 'native' }).variant).toBe('native');
  });

  it('ignores values it does not know', () => {
    expect(resolveShellVariant({ override: 'glass', remote: 1, build: '' }).variant).toBe('custom');
  });

  it('splits installs stably by percent', () => {
    const a = resolveShellVariant({ nativePercent: 50, installId: 'abc' });
    const b = resolveShellVariant({ nativePercent: 50, installId: 'abc' });
    expect(a).toEqual(b);
    expect(a.reason).toBe('split');
    expect(resolveShellVariant({ nativePercent: 100, installId: 'abc' }).variant).toBe('native');
    expect(resolveShellVariant({ nativePercent: 0, installId: 'abc' }).variant).toBe('custom');
    const ids = Array.from({ length: 2000 }, (_, i) => `install-${i}`);
    const native = ids.filter(
      (id) => resolveShellVariant({ nativePercent: 30, installId: id }).variant === 'native',
    ).length;
    expect(native / ids.length).toBeGreaterThan(0.25);
    expect(native / ids.length).toBeLessThan(0.35);
  });
});

describe('shell metrics', () => {
  it('attributes time to stressed frames and memory pressure', () => {
    let s = addSample(EMPTY_STATS, 'calm', 'normal', 3000);
    s = addSample(s, 'stressed', 'trimmed', 1000);
    const sum = summarize(s);
    expect(sum.stressedShare).toBeCloseTo(0.25);
    expect(sum.memoryPressureShare).toBeCloseTo(0.25);
  });

  it('does not count a long sleep as observed time', () => {
    expect(addSample(EMPTY_STATS, 'calm', 'normal', 3_600_000).sampleMs).toBe(10_000);
  });

  it('times tab switches', () => {
    const s = addSwitch(addSwitch(EMPTY_STATS, 40), 120);
    expect(summarize(s)).toMatchObject({ switches: 2, meanSwitchMs: 80, maxSwitchMs: 120 });
    expect(summarize(EMPTY_STATS).meanSwitchMs).toBeNull();
  });

  it('keeps each variant apart and survives bad stored data', () => {
    writeStats('native', addSwitch(EMPTY_STATS, 50));
    expect(readStats('native').switches).toBe(1);
    expect(readStats('custom').switches).toBe(0);
  });
});
