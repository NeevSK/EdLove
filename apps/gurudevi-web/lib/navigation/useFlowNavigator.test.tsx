import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({
  navigate: vi.fn(),
  preloadRoute: vi.fn(),
  history: { back: vi.fn() },
}));
const canGoBack = vi.hoisted(() => ({ value: true }));
const capture = vi.hoisted(() => vi.fn());
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => router,
  useCanGoBack: () => canGoBack.value,
}));
vi.mock('@repo/core/monitoring', () => ({ captureException: capture }));

import { useFlowNavigator } from './useFlowNavigator';

function setWide(wide: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: wide,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe('useFlowNavigator (web) / G3 hook, real resolver, TanStack router substituted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWide(true);
    canGoBack.value = true;
  });

  it('pushes the web route for a step, with a view transition', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.open('flow:entry:mobile', 'auth_gate')).toMatchObject({
      kind: 'go',
      href: '/sign-in',
    });
    expect(router.navigate).toHaveBeenCalledWith({
      href: '/sign-in',
      replace: false,
      viewTransition: true,
    });
    expect(result.current.sizeClass).toBe('regular');
  });

  it('reads a narrow window as compact', () => {
    setWide(false);
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.sizeClass).toBe('compact');
  });

  it('replaces into the completion after the last step: the web has no stack to dismiss', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.next('flow:entry:mobile', 'workspace_floor')).toBeNull();
    expect(router.navigate).toHaveBeenCalledOnce();
    expect(router.navigate.mock.calls[0]?.[0]).toMatchObject({ replace: true });
  });

  it('reports and does not navigate when a dynamic route lacks its params', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(
      result.current.open('flow:teacher:student_radar_attunement', 'select_student_roster'),
    ).toMatchObject({ kind: 'unavailable', reason: 'params_missing' });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledOnce();
  });

  it('preloads a reachable step', () => {
    const { result } = renderHook(() => useFlowNavigator());
    result.current.prefetch('flow:entry:mobile', 'auth_gate');
    expect(router.preloadRoute).toHaveBeenCalledWith({ to: '/sign-in' });
  });

  it('goes back only when the tab has somewhere to go', () => {
    canGoBack.value = false;
    const { result } = renderHook(() => useFlowNavigator());
    result.current.back();
    expect(router.history.back).not.toHaveBeenCalled();
  });
});
