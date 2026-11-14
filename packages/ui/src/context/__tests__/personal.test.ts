import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => new Map<string, string>());

vi.mock('@repo/core/lib/storage.adapter', () => ({
  storage: {
    getStringAsync: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  },
}));

import { clearestOn } from '../../theme/color';
import { getReading, STANDARD_READING, setReading } from '../../theme/native/style';
import {
  addCompanion,
  letOut,
  loadCompanions,
  removeCompanion,
  updateCompanion,
} from '../Companions';
import { loadReading, resetReading, updateReading } from '../ReadingPreferences';

describe('reading settings', () => {
  beforeEach(() => {
    setReading(STANDARD_READING);
  });

  it('keeps every value inside its readable range', () => {
    setReading({ scale: 9, weight: -900, tracking: 1, lines: 0 });
    expect(getReading()).toEqual({ scale: 1.5, weight: -100, tracking: 0.08, lines: 1 });
  });

  it('saves, restores and resets', async () => {
    updateReading({ scale: 1.2, lines: 1.3 });
    setReading(STANDARD_READING);
    await loadReading();
    expect(getReading().scale).toBe(1.2);
    expect(getReading().lines).toBe(1.3);
    resetReading();
    expect(getReading()).toEqual(STANDARD_READING);
  });
});

describe('companions', () => {
  it('takes any kind in the person’s own words and brings the first one out', async () => {
    const kiri = addCompanion({ name: '  Kiri  ', kind: 'our parrot', tone: 'glow', way: 'perch' });
    expect(kiri.name).toBe('Kiri');
    expect(kiri.kind).toBe('our parrot');
    const saved = JSON.parse(store.get('@gurudevi/companions') ?? '{}');
    expect(saved.out).toBe(kiri.id);

    const tom = addCompanion({ name: 'Tom', kind: 'a little dragon', tone: 'ink', way: 'wander' });
    expect(JSON.parse(store.get('@gurudevi/companions') ?? '{}').out).toBe(kiri.id);

    updateCompanion(tom.id, { way: 'rest' });
    letOut(tom.id);
    letOut('nobody-by-this-id');
    expect(JSON.parse(store.get('@gurudevi/companions') ?? '{}').out).toBeNull();

    letOut(tom.id);
    removeCompanion(tom.id);
    const after = JSON.parse(store.get('@gurudevi/companions') ?? '{}');
    expect(after.out).toBe(kiri.id);
    expect(after.companions).toHaveLength(1);

    await loadCompanions();
    expect(JSON.parse(store.get('@gurudevi/companions') ?? '{}').companions[0].name).toBe('Kiri');
  });

  it('drops broken saved entries on load', async () => {
    store.set('@gurudevi/companions', JSON.stringify({ companions: [{ id: 1 }, null], out: 'x' }));
    await loadCompanions();
    removeCompanion('none');
    expect(JSON.parse(store.get('@gurudevi/companions') ?? '{}')).toEqual({
      companions: [],
      out: null,
    });
  });
});

describe('clearestOn', () => {
  it('picks the ink that reads best on a colour', () => {
    expect(clearestOn('#111111', ['#222222', '#FFFFFF'])).toBe('#FFFFFF');
    expect(clearestOn('#FAFAFA', ['#FFFFFF', '#101010'])).toBe('#101010');
  });
});
