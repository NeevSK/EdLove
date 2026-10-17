import type { ReactNode } from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handleURL: vi.fn(),
  replace: vi.fn(),
  params: { code: 'one-time-code', state: 'csrf-state' } as Record<string, string | string[]>,
}));

vi.mock('@repo/core/logic', () => ({
  deepLink: { handleURL: mocks.handleURL },
}));

vi.mock('expo-router', () => ({
  router: { replace: mocks.replace },
  useGlobalSearchParams: () => mocks.params,
}));

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));

vi.mock('@repo/ui', () => ({ BrandPulse: () => null }));

vi.mock('@repo/ui/components/ErrorBoundary', () => ({
  RouteErrorBoundary: () => null,
}));

vi.mock('@repo/ui/primitives', () => ({
  Button: ({ children, onPress }: { children: ReactNode; onPress: () => void }) => (
    <button onClick={onPress}>{children}</button>
  ),
  ButtonText: ({ children }: { children: ReactNode }) => <>{children}</>,
  Center: ({ children }: { children: ReactNode }) => <>{children}</>,
  Text: ({ children }: { children: ReactNode }) => <>{children}</>,
  VStack: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

import AuthCallbackRoute from '@/../app/auth/callback';

describe('AuthCallbackRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.params = { code: 'one-time-code', state: 'csrf-state' };
    mocks.handleURL.mockResolvedValue({ isHandled: true });
  });

  it('uses the validated core callback exchange on native after router normalization', async () => {
    await act(async () => {
      create(<AuthCallbackRoute />);
      await Promise.resolve();
    });

    expect(mocks.handleURL).toHaveBeenCalledWith(
      'gurudevi://auth/callback?code=one-time-code&state=csrf-state',
    );
  });

  it('shows the core failure reason instead of leaving a native callback spinning', async () => {
    mocks.handleURL.mockResolvedValue({
      isHandled: false,
      message: 'This secure link cannot be used. Request a new link and try again.',
    });
    let screen: ReturnType<typeof create>;

    await act(async () => {
      screen = create(<AuthCallbackRoute />);
      await Promise.resolve();
    });

    expect(JSON.stringify(screen!.toJSON())).toContain('This secure link cannot be used.');
  });

  it('passes duplicate native callback parameters through to the core policy for rejection', async () => {
    mocks.params = { code: ['first', 'second'], state: 'csrf-state' };
    mocks.handleURL.mockResolvedValue({
      isHandled: false,
      message: 'This secure link cannot be used. Request a new link and try again.',
    });

    let screen: ReturnType<typeof create>;
    await act(async () => {
      screen = create(<AuthCallbackRoute />);
      await Promise.resolve();
    });

    expect(mocks.handleURL).toHaveBeenCalledWith(
      'gurudevi://auth/callback?code=first&code=second&state=csrf-state',
    );
    expect(JSON.stringify(screen!.toJSON())).toContain('This secure link cannot be used.');
  });

  it('recovers when an unexpected callback exchange failure rejects', async () => {
    mocks.handleURL.mockRejectedValue(new Error('transport unavailable'));
    let screen: ReturnType<typeof create>;

    await act(async () => {
      screen = create(<AuthCallbackRoute />);
      await Promise.resolve();
    });

    expect(JSON.stringify(screen!.toJSON())).toContain(
      'Sign-in could not be completed. Please try again.',
    );
  });
});
