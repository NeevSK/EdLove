import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSystemAccess } from '../../../theme/native/access';

function Probe() {
  const a = useSystemAccess();
  return <Text testID="a">{`${a.contrast} ${a.transparency}`}</Text>;
}

// The test engine's AccessibilityInfo lacks the iOS setting queries that the
// installed RN 0.88 declares; each test supplies them. The engine runs as iOS.

const info: Record<string, unknown> = AccessibilityInfo;
const saved = { ...info };
afterEach(() => {
  for (const key of Object.keys(info)) if (!(key in saved)) delete info[key];
  Object.assign(info, saved);
});

describe('useSystemAccess', { tags: ['a11y', 'unit'] }, () => {
  it('reads darker colours and reduce transparency, then follows changes', async () => {
    const handlers: Record<string, (v: boolean) => void> = {};
    Object.assign(info, {
      isDarkerSystemColorsEnabled: vi.fn(async () => true),
      isReduceTransparencyEnabled: vi.fn(async () => false),
      addEventListener: vi.fn((name: string, fn: (v: boolean) => void) => {
        handlers[name] = fn;
        return { remove: vi.fn() };
      }),
    });
    await render(<Probe />);
    await act(async () => {});
    expect(screen.getByTestId('a').props.children).toBe('more standard');
    await act(() => handlers.reduceTransparencyChanged?.(true));
    expect(screen.getByTestId('a').props.children).toBe('more reduced');
    await act(() => handlers.darkerSystemColorsChanged?.(false));
    expect(screen.getByTestId('a').props.children).toBe('standard reduced');
  });

  it('a setting that cannot be read leaves the world standard', async () => {
    Object.assign(info, {
      isDarkerSystemColorsEnabled: vi.fn(async () => Promise.reject(new Error('no'))),
      isReduceTransparencyEnabled: vi.fn(async () => Promise.reject(new Error('no'))),
      addEventListener: vi.fn(() => ({ remove: vi.fn() })),
    });
    await render(<Probe />);
    await act(async () => {});
    expect(screen.getByTestId('a').props.children).toBe('standard standard');
  });
});
