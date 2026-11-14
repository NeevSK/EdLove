'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

/** The Work room's own areas. Areas belong to each room; core has no fixed list. */
export type WorkRoomArea = 'today' | 'work' | 'institution' | 'outlook';

export const WORK_ROOM_AREAS: readonly WorkRoomArea[] = [
  'today',
  'work',
  'institution',
  'outlook',
] as const;

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';
export type WorkspaceLayoutMode = 'overview' | 'master-detail' | 'stream';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;
const DEFAULT_WORKSPACE_PINNED = ['today'];

export interface UseWorkspaceCanvasOptions {
  readonly accountId?: string;
  readonly enableRemoteSync?: boolean;
  readonly activeTaskId?: string | null;
}

export function useWorkspaceCanvas({
  accountId = 'anonymous',
  enableRemoteSync = true,
  activeTaskId = null,
}: UseWorkspaceCanvasOptions = {}) {
  const [viewport, setViewport] = useState<ViewportKind>('desktop');

  const appearanceHook = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: WORK_ROOM_AREAS,
    defaultPinnedIds: DEFAULT_WORKSPACE_PINNED,
    enableRemoteSync,
    workspaceId: 'workspace',
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

  const pinnedZones = useMemo<WorkRoomArea[]>(() => {
    return appearanceHook.pinnedIds.filter((id): id is WorkRoomArea =>
      (WORK_ROOM_AREAS as readonly string[]).includes(id),
    );
  }, [appearanceHook.pinnedIds]);

  const togglePin = useCallback(
    (id: string) => {
      let updated: string[];
      if (appearanceHook.pinnedIds.includes(id)) {
        updated = appearanceHook.pinnedIds.filter((item) => item !== id);
      } else {
        updated = [...appearanceHook.pinnedIds, id];
      }
      void appearanceHook.setPinnedIds(updated);
    },
    [appearanceHook],
  );

  const layoutMode: WorkspaceLayoutMode = useMemo(() => {
    if (!activeTaskId) return 'overview';
    if (viewport === 'mobile') return 'stream';
    return 'master-detail';
  }, [activeTaskId, viewport]);

  return {
    viewport,
    layoutMode,
    groupOrder: appearanceHook.groupOrder as WorkRoomArea[],
    pinnedZones,
    pinnedIds: appearanceHook.pinnedIds,
    togglePin,
    appearance: appearanceHook.appearance,
    storedAppearance: appearanceHook.stored,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
  };
}
