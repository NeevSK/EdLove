import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  dismissTo: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  canGoBack: vi.fn(() => true),
}));
const width = vi.hoisted(() => ({ value: 390 }));
const capture = vi.hoisted(() => vi.fn());
vi.mock('expo-router', () => ({ useRouter: () => router }));
vi.mock('react-native', () => ({
  useWindowDimensions: () => ({ width: width.value, height: 800, scale: 2, fontScale: 1 }),
}));
vi.mock('@repo/core/monitoring', () => ({ captureException: capture }));

import { useFlowNavigator } from '@/navigation/useFlowNavigator';

describe('useFlowNavigator (mobile) / G3 hook, real resolver, router substituted', () => {
  beforeEach(() => vi.clearAllMocks());

  it('pushes the step route and returns how it appears', () => {
    const { result } = renderHook(() => useFlowNavigator());
    const resolved = result.current.open('flow:entry:mobile', 'auth_gate');
    expect(router.push).toHaveBeenCalledWith('/auth');
    expect(resolved).toMatchObject({ kind: 'go', presentation: 'push' });
    expect(result.current.sizeClass).toBe('compact');
  });

  it('uses the regular size class on a tablet', () => {
    width.value = 1024;
    const { result } = renderHook(() => useFlowNavigator());
    expect(result.current.sizeClass).toBe('regular');
    width.value = 390;
  });

  it('replaces into the last step, then dismisses to the completion without leaving the flow behind', () => {
    const { result } = renderHook(() => useFlowNavigator());
    result.current.next('flow:entry:mobile', 'onboarding');
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/workspace');
    vi.clearAllMocks();
    expect(result.current.next('flow:entry:mobile', 'workspace_floor')).toBeNull();
    expect(router.dismissTo).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('prefetches a reachable step and stays quiet for one that is not', () => {
    const { result } = renderHook(() => useFlowNavigator());
    result.current.prefetch('flow:entry:mobile', 'auth_gate');
    expect(router.prefetch).toHaveBeenCalledWith('/auth');
    result.current.prefetch('flow:teacher:roll_call', 'batch_mark');
    expect(router.prefetch).toHaveBeenCalledTimes(1);
    expect(capture).not.toHaveBeenCalled();
  });

  it('does not navigate to a step that has no route, and reports it', () => {
    const { result } = renderHook(() => useFlowNavigator());
    const resolved = result.current.open('flow:teacher:roll_call', 'batch_mark');
    expect(resolved).toMatchObject({ kind: 'unavailable', reason: 'route_missing' });
    expect(router.push).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ reason: 'route_missing' }));
  });

  it('goes back only when there is somewhere to go', () => {
    const { result } = renderHook(() => useFlowNavigator());
    router.canGoBack.mockReturnValueOnce(false);
    result.current.back();
    expect(router.back).not.toHaveBeenCalled();
    result.current.back();
    expect(router.back).toHaveBeenCalledOnce();
  });
});
