import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({ navigate: vi.fn(), preloadRoute: vi.fn() }));
const capture = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-router', () => ({ useRouter: () => router }));
vi.mock('@repo/core/monitoring', () => ({ captureException: capture }));

import { useNavigator } from './useNavigator';

describe('useNavigator (web) / G3 hook, real web catalogue and guard, TanStack router substituted', () => {
  beforeEach(() => vi.clearAllMocks());

  it('follows a runtime destination to a page that exists', () => {
    const { result } = renderHook(() => useNavigator());
    expect(result.current.follow('/workspace/attendance?date=1', 'workspace-task')).toMatchObject({
      ok: true,
      route: '/workspace/attendance',
    });
    expect(router.navigate).toHaveBeenCalledWith({
      href: '/workspace/attendance?date=1',
      replace: false,
      viewTransition: true,
    });
    result.current.follow('/school/7', 'welcome', 'replace');
    expect(router.navigate).toHaveBeenLastCalledWith(expect.objectContaining({ replace: true }));
  });

  it.each([
    ['https://evil.example/self', 'not_internal'],
    ['//evil.example', 'not_internal'],
    ['javascript:alert(1)', 'not_internal'],
    ['/self/%2e%2e/admin', 'traversal'],
    ['/workspace/nope', 'unknown_route'],
  ])('refuses %s (%s) and reports only its path', (raw, reason) => {
    const { result } = renderHook(() => useNavigator());
    expect(result.current.follow(`${raw}?code=secret`, 'sign-in')).toMatchObject({ ok: false });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(JSON.stringify(capture.mock.calls)).not.toContain('secret');
    expect(capture.mock.calls[0]?.[1]).toMatchObject({ source: 'sign-in' });
    expect(result.current.follow(raw, 'sign-in')).toEqual({ ok: false, reason });
  });

  it('warms only destinations that pass', () => {
    const { result } = renderHook(() => useNavigator());
    result.current.warm('/library');
    result.current.warm('https://evil.example');
    expect(router.preloadRoute).toHaveBeenCalledOnce();
    expect(router.preloadRoute).toHaveBeenCalledWith({ to: '/library' });
  });
});
