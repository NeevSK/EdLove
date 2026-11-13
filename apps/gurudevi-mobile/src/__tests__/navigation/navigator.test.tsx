import { renderHook } from '@testing-library/react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  dismissTo: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  canGoBack: vi.fn(() => true),
}));
const redirect = vi.hoisted(() => vi.fn(() => null));
const capture = vi.hoisted(() => vi.fn());
vi.mock('expo-router', () => ({ useRouter: () => router, Redirect: redirect }));
vi.mock('@repo/core/monitoring', () => ({ captureException: capture }));

import { GoTo } from '@/navigation/GoTo';
import { useNavigator } from '@/navigation/navigator';

describe('useNavigator (mobile) / G3 hook, real catalogue and guard, router substituted', () => {
  beforeEach(() => vi.clearAllMocks());

  it('navigates to a screen that exists, with or without its group', () => {
    const { result } = renderHook(() => useNavigator());
    expect(result.current.push('/settings')).toMatchObject({ ok: true, route: '/(tabs)/settings' });
    expect(router.push).toHaveBeenCalledWith('/settings');
    result.current.replace('/(tabs)/workspace/inventory');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/workspace/inventory');
  });

  it('builds a dynamic href from a pattern and params, encoded', () => {
    const { result } = renderHook(() => useNavigator());
    result.current.push({ pathname: '/self/wisdom/[id]', params: { id: 'a/b', from: 'home' } });
    expect(router.push).toHaveBeenCalledWith('/self/wisdom/a%2Fb?from=home');
  });

  it.each([
    ['https://evil.example/self', 'not_internal'],
    ['//evil.example', 'not_internal'],
    ['FounderDashboard', 'not_internal'],
    ['/self/../auth', 'traversal'],
    ['/no-such-screen', 'unknown_route'],
  ])('refuses a runtime destination %s (%s), reporting only its path', (raw, reason) => {
    const { result } = renderHook(() => useNavigator());
    expect(result.current.follow(raw, 'notification')).toEqual({ ok: false, reason });
    expect(router.push).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ boundary: 'navigator', source: 'notification', reason }),
    );
  });

  it('never reports a refused destination query, which can carry codes', () => {
    const { result } = renderHook(() => useNavigator());
    result.current.follow('/no-such-screen?token=secret', 'notification');
    expect(JSON.stringify(capture.mock.calls)).not.toContain('secret');
  });

  it('follows a runtime destination that passes, with the asked operation', () => {
    const { result } = renderHook(() => useNavigator());
    expect(result.current.follow('/welcome', 'entry-gate', 'replace')).toMatchObject({ ok: true });
    expect(router.replace).toHaveBeenCalledWith('/welcome');
  });

  it('goes back, or to the fallback at the root', () => {
    const { result } = renderHook(() => useNavigator());
    result.current.back('/self');
    expect(router.back).toHaveBeenCalledOnce();
    router.canGoBack.mockReturnValueOnce(false);
    result.current.back('/self');
    expect(router.replace).toHaveBeenCalledWith('/self');
  });

  it('prefetches only destinations that pass', () => {
    const { result } = renderHook(() => useNavigator());
    result.current.prefetch('/reading');
    result.current.warm('https://evil.example');
    expect(router.prefetch).toHaveBeenCalledTimes(1);
    expect(router.prefetch).toHaveBeenCalledWith('/reading');
  });

  it('redirects declaratively only to a destination that passes', () => {
    render(<GoTo href={{ pathname: '/workspace/commercial/[batchId]', params: { batchId: 'b1' } }} />);
    expect(redirect).toHaveBeenCalledWith({ href: '/workspace/commercial/b1' }, undefined);
    redirect.mockClear();
    render(<GoTo href={{ pathname: '/workspace/commercial/[batchId]', params: {} }} />);
    expect(redirect).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ source: 'redirect', reason: 'unfilled_params' }),
    );
  });
});
