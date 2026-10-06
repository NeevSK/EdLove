'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

export type CommunitySurface = 'feed' | 'circles' | 'messages' | 'announcements';

export const DEFAULT_COMMUNITY_SURFACES: readonly CommunitySurface[] = [
  'feed',
  'circles',
  'messages',
  'announcements',
] as const;

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';
export type CommunityLayoutMode = 'overview' | 'master-detail' | 'stream';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;
const DEFAULT_COMMUNITY_PINNED = ['circles'];

export interface UseCommunityCanvasOptions {
  readonly accountId?: string;
  readonly enableRemoteSync?: boolean;
  readonly activeSurface?: CommunitySurface | null;
}

export function useCommunityCanvas({
  accountId = 'anonymous',
  enableRemoteSync = true,
  activeSurface = null,
}: UseCommunityCanvasOptions = {}) {
  const [viewport, setViewport] = useState<ViewportKind>('desktop');

  const appearanceHook = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: DEFAULT_COMMUNITY_SURFACES,
    defaultPinnedIds: DEFAULT_COMMUNITY_PINNED,
    enableRemoteSync,
    workspaceId: 'community',
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < TABLET_BREAKPOINT) {
        setViewport('mobile');
      } else if (width < DESKTOP_BREAKPOINT) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const pinnedSurfaces = useMemo<CommunitySurface[]>(() => {
    return appearanceHook.pinnedIds.filter((id): id is CommunitySurface =>
      (DEFAULT_COMMUNITY_SURFACES as readonly string[]).includes(id),
    );
  }, [appearanceHook.pinnedIds]);

  const togglePin = useCallback(
    (surface: CommunitySurface) => {
      let updated: string[];
      if (appearanceHook.pinnedIds.includes(surface)) {
        updated = appearanceHook.pinnedIds.filter((id) => id !== surface);
        if (updated.length === 0) {
          updated = [...DEFAULT_COMMUNITY_PINNED];
        }
      } else {
        updated = [...appearanceHook.pinnedIds, surface];
      }
      void appearanceHook.setPinnedIds(updated);
    },
    [appearanceHook],
  );

  const layoutMode: CommunityLayoutMode = useMemo(() => {
    if (!activeSurface) return 'overview';
    if (viewport === 'mobile') return 'stream';
    return 'master-detail';
  }, [activeSurface, viewport]);

  return {
    viewport,
    layoutMode,
    groupOrder: appearanceHook.groupOrder as CommunitySurface[],
    pinnedSurfaces,
    togglePin,
    appearance: appearanceHook.appearance,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
  };
}
