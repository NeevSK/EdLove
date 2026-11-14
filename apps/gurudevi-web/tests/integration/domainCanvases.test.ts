import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCommunityCanvas } from '../../lib/canvas/useCommunityCanvas';
import { useLibraryCanvas } from '../../lib/canvas/useLibraryCanvas';
import { useProfileCanvas } from '../../lib/canvas/useProfileCanvas';
import { useWorkspaceCanvas } from '../../lib/canvas/useWorkspaceCanvas';

describe('Domain Canvases Headless Engine (G1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('useCommunityCanvas', () => {
    it('initializes default layout mode to overview when no active surface', () => {
      const { result } = renderHook(() => useCommunityCanvas({ accountId: 'user-1' }));
      expect(result.current.layoutMode).toBe('overview');
      expect(result.current.pinnedSurfaces).toContain('circles');
    });

    it('switches layout mode to master-detail when active surface is present on desktop', () => {
      const { result } = renderHook(() =>
        useCommunityCanvas({ accountId: 'user-1', activeSurface: 'circles' }),
      );
      expect(result.current.layoutMode).toBe('master-detail');
    });

    it('allows toggling pinned community surfaces', () => {
      const { result } = renderHook(() => useCommunityCanvas({ accountId: 'user-1' }));
      expect(result.current.pinnedSurfaces).toEqual(['circles']);

      act(() => {
        result.current.togglePin('feed');
      });

      expect(result.current.pinnedSurfaces).toContain('feed');
    });
  });

  describe('useLibraryCanvas', () => {
    it('initializes default layout mode to overview when no active resource', () => {
      const { result } = renderHook(() => useLibraryCanvas({ accountId: 'user-1' }));
      expect(result.current.layoutMode).toBe('overview');
      expect(result.current.pinnedCategories).toContain('discovery');
    });

    it('switches layout mode to master-detail when resource is active', () => {
      const { result } = renderHook(() =>
        useLibraryCanvas({ accountId: 'user-1', activeResourceKey: 'text-123' }),
      );
      expect(result.current.layoutMode).toBe('master-detail');
    });

    it('allows toggling pinned library categories', () => {
      const { result } = renderHook(() => useLibraryCanvas({ accountId: 'user-1' }));
      act(() => {
        result.current.togglePin('collections');
      });
      expect(result.current.pinnedCategories).toContain('collections');
    });
  });

  describe('useWorkspaceCanvas', () => {
    it('initializes default layout mode to overview when no active task', () => {
      const { result } = renderHook(() => useWorkspaceCanvas({ accountId: 'user-1' }));
      expect(result.current.layoutMode).toBe('overview');
      expect(result.current.pinnedZones).toContain('today');
    });

    it('switches layout mode to master-detail when active task is present', () => {
      const { result } = renderHook(() =>
        useWorkspaceCanvas({ accountId: 'user-1', activeTaskId: 'attendance' }),
      );
      expect(result.current.layoutMode).toBe('master-detail');
    });

    it('allows toggling pinned workspace zones', () => {
      const { result } = renderHook(() => useWorkspaceCanvas({ accountId: 'user-1' }));
      act(() => {
        result.current.togglePin('work');
      });
      expect(result.current.pinnedZones).toContain('work');
    });
  });

  describe('useProfileCanvas', () => {
    it('initializes profile sections and appearance', () => {
      const { result } = renderHook(() => useProfileCanvas({ accountId: 'user-1' }));
      expect(result.current.sections).toContain('identity');
      expect(result.current.appearance.preset).toBe('default');
    });
  });
});
