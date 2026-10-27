import type { WorkspaceLayout } from '@repo/core/types';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  layout: null as WorkspaceLayout | null,
  isInitialLayout: false,
  toggleSurfacePinned: vi.fn(),
  setSurfacePinned: vi.fn(),
  togglePinFeature: vi.fn(),
  legacyPins: ['journal', 'mood'],
}));
vi.mock('@repo/core/native', () => ({ useWorkspaceLayoutSync: () => fixture }));
vi.mock('@repo/core/store/useActiveSubTabsStore', () => ({
  useActiveSubTabsStore: (
    select: (state: {
      openTab: () => void;
      pinnedFeatureIdsByDomain: { self: string[] };
      togglePinFeature: typeof fixture.togglePinFeature;
    }) => unknown,
  ) =>
    select({
      openTab: () => undefined,
      pinnedFeatureIdsByDomain: { self: fixture.legacyPins },
      togglePinFeature: fixture.togglePinFeature,
    }),
}));
vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: (select: (state: { snapshot: null }) => unknown) =>
    select({ snapshot: null }),
}));
vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (select: (state: { user: null }) => unknown) => select({ user: null }),
}));
vi.mock('@repo/ui', () => ({ useResponsiveGrid: () => ({ columns: 2, gutter: 16 }) }));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('react-native', () => ({ useWindowDimensions: () => ({ width: 390, height: 844 }) }));
vi.mock('@/navigation/registries/selfRegistry', () => ({
  getSelfRegistry: () => ({
    items: [
      { id: 'journal', title: 'Journal', route: '/self', category: 'growth' },
      { id: 'mood', title: 'Mood', route: '/self', category: 'wellbeing' },
    ],
  }),
}));

import { useSelfCanvas } from '@/hooks/useSelfCanvas';

function layout(pinned: string[], isDefault = false): WorkspaceLayout {
  return {
    userId: 'account-a',
    workspaceId: 'self',
    order: ['journal', 'mood'],
    hidden: [],
    pinned,
    zoneBySurface: {},
    isDefault,
    updatedAt: '2026-10-26T00:00:00Z',
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  fixture.layout = layout([]);
  fixture.isInitialLayout = false;
});

describe('SelfCanvas pin ownership', () => {
  it('keeps a customized empty layout empty instead of reviving old pins', () => {
    const view = renderHook(() => useSelfCanvas());
    expect(view.result.current.effectivePinnedIds).toEqual([]);
    expect(view.result.current.pinnedFeatures).toEqual([]);
  });
  it('treats a saved empty record as authoritative even when its historical default flag is true', () => {
    fixture.layout = layout([], true);
    const view = renderHook(() => useSelfCanvas());
    expect(view.result.current.effectivePinnedIds).toEqual([]);
  });
  it('retains initial pins until the first layout customization', () => {
    fixture.layout = layout([], true);
    fixture.isInitialLayout = true;
    const view = renderHook(() => useSelfCanvas());
    expect(view.result.current.effectivePinnedIds).toEqual(['journal', 'mood']);
    act(() => view.result.current.togglePin('journal'));
    expect(fixture.toggleSurfacePinned).toHaveBeenCalledWith('journal');
    expect(fixture.togglePinFeature).not.toHaveBeenCalled();
    expect(fixture.setSurfacePinned).not.toHaveBeenCalled();
  });
  it('writes only the layout owner when changing existing pins', () => {
    fixture.layout = layout(['journal']);
    const view = renderHook(() => useSelfCanvas());
    act(() => view.result.current.togglePin('journal'));
    expect(fixture.toggleSurfacePinned).toHaveBeenCalledWith('journal');
    expect(fixture.togglePinFeature).not.toHaveBeenCalled();
  });
  it('keeps the local guest path when no layout owner exists', () => {
    fixture.layout = null;
    const view = renderHook(() => useSelfCanvas());
    expect(view.result.current.effectivePinnedIds).toEqual(['journal', 'mood']);
    act(() => view.result.current.togglePin('journal'));
    expect(fixture.togglePinFeature).toHaveBeenCalledWith('self', 'journal');
    expect(fixture.toggleSurfacePinned).not.toHaveBeenCalled();
  });
});
