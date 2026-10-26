import { fireEvent, render } from '@testing-library/react';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
const replace = vi.fn();

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  StyleSheet: { create: <T,>(styles: T) => styles },
  View: 'View',
  Text: 'Text',
  Pressable: ({ children, onPress }: { children: unknown; onPress: () => void }) =>
    createElement('button', { onClick: onPress }, children as never),
  ScrollView: 'ScrollView',
  Share: { share: vi.fn(async () => ({})) },
}));
vi.mock('expo-router', () => ({ router: { replace } }));
vi.mock('expo-application', () => ({ getAndroidId: () => 'install-1' }));
vi.mock('@repo/core/native/storage', () => ({
  storage: {
    getString: (key: string) => store.get(key),
    set: (key: string, value: string) => store.set(key, value),
    delete: (key: string) => store.delete(key),
  },
}));

const { ShellLabScreen, compareShells } = await import('@/runtime/lab/ShellLabScreen');
const { EMPTY_STATS, summarize, addSwitch, addSample, writeStats } = await import(
  '@/lib/navigation/shellMetrics'
);
const { getShellVariant, setShellVariantOverride } = await import('@/lib/navigation/shellVariant');

describe('the tab shell lab', () => {
  beforeEach(() => {
    store.clear();
    replace.mockClear();
    setShellVariantOverride(null);
  });

  it('puts A beside B, with a dash where nothing was timed', () => {
    const b = addSwitch(addSample(EMPTY_STATS, 'stressed', 'normal', 6000), 40);
    const rows = compareShells(summarize(EMPTY_STATS), summarize(b));
    expect(rows).toContainEqual(['Frames stressed', '0%', '100%']);
    expect(rows).toContainEqual(['Switch, mean', '–', '40 ms']);
  });

  it('switches the shell and returns to the tabs', () => {
    writeStats('native', { ...EMPTY_STATS, launches: 3 });
    const view = render(createElement(ShellLabScreen));
    expect(view.container.textContent).toContain('Custom tabs (A)');
    fireEvent.click(view.getByText('Use native tabs (B)'));
    expect(getShellVariant()).toEqual({ variant: 'native', reason: 'override', bucket: null });
    expect(replace).toHaveBeenCalledWith('/(tabs)/self');
    fireEvent.click(view.getByText('Back to the assignment'));
    expect(getShellVariant().reason).toBe('default');
  });
});
