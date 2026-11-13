import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }));
const capture = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@repo/core/monitoring', () => ({ captureException: capture }));

import { useFlowNavigator } from './useFlowNavigator';

function setWidth(wide: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: wide,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe('useFlowNavigator (web) / G3 hook, real resolver, Next router substituted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWidth(true);
  });

  it('pushes the web route for a step', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.open('flow:entry:mobile', 'auth_gate')).toMatchObject({ kind: 'go', href: '/sign-in' });
    expect(router.push).toHaveBeenCalledWith('/sign-in');
    expect(result.current.sizeClass).toBe('regular');
  });

  it('reads a narrow window as compact', () => {
    setWidth(false);
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.sizeClass).toBe('compact');
  });

  it('replaces into the completion after the last step', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.next('flow:entry:mobile', 'workspace_floor')).toBeNull();
    expect(router.replace).toHaveBeenCalledOnce();
  });

  it('reports and does not navigate when a dynamic route lacks its params', () => {
    const { result } = renderHook(() => useFlowNavigator());
    expect(
      result.current.open('flow:teacher:student_radar_attunement', 'select_student_roster'),
    ).toMatchObject({ kind: 'unavailable', reason: 'params_missing' });
    expect(router.push).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledOnce();
  });
});
