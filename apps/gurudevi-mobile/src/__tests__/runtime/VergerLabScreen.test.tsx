import { render } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  Share: { share: vi.fn(async () => ({})) },
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

const { createVerger, GURUDEVI_MOBILE_HOST, UNKNOWN_CAPACITY, VERGER_LAB_PATCH_KEY } = await import('@repo/core/verger');
const { bindVerger } = await import('@repo/verger-react');
const { VergerLabScreen, applyLabPatch } = await import('@/runtime/lab/VergerLabScreen');

function runningVerger() {
  return createVerger({
    host: GURUDEVI_MOBILE_HOST,
    platform: () => ({
      readCapacity: () => UNKNOWN_CAPACITY,
      memorySensing: false,
      createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
    }),
    requested: 'active',
    release: '1',
    now: () => 0,
  });
}

describe('the mobile dev lab (D2)', () => {
  it('saves a patch only when it applied; a refusal keeps the store as it was', async () => {
    const verger = runningVerger();
    await verger.start();
    const saved = new Map<string, string>();
    const store = {
      setItem: async (key: string, value: string) => void saved.set(key, value),
      removeItem: async (key: string) => void saved.delete(key),
    };
    expect(await applyLabPatch(verger, '{"levers":{"nope":"off"}}', store)).toMatchObject({ ok: false });
    expect(saved.size).toBe(0);
    expect(await applyLabPatch(verger, '{"grow":false}', store)).toEqual({ ok: true });
    expect(saved.get(VERGER_LAB_PATCH_KEY)).toBe('{"grow":false}');
    expect(await applyLabPatch(verger, '', store)).toEqual({ ok: true });
    expect(saved.size).toBe(0);
    const failing = { setItem: async () => Promise.reject(new Error('disk')), removeItem: async () => {} };
    expect(await applyLabPatch(verger, '{"grow":false}', failing)).toMatchObject({ ok: false, error: expect.stringMatching(/applied, not saved/) });
  });

  it('shows every layer of a bound verger', async () => {
    const verger = runningVerger();
    await verger.start();
    const unbind = bindVerger(verger);
    const view = render(createElement(VergerLabScreen));
    const text = view.container.textContent ?? '';
    for (const title of ['Verger lab', 'Launch', 'Readings', 'Accounts', 'Outcomes', 'Self-cost', 'Levers'])
      expect(text).toContain(title);
    for (const lever of GURUDEVI_MOBILE_HOST.levers) expect(text).toContain(lever.id);
    view.unmount();
    unbind?.();
  });
});
