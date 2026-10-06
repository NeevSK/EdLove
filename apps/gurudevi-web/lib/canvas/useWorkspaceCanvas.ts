'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

export type WorkspaceZone = 'today' | 'work' | 'institution' | 'outlook';

export const DEFAULT_WORKSPACE_ZONES: readonly WorkspaceZone[] = [
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
    defaultGroupOrder: DEFAULT_WORKSPACE_ZONES,
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

  const pinnedZones = useMemo<WorkspaceZone[]>(() => {
    return appearanceHook.pinnedIds.filter((id): id is WorkspaceZone =>
      (DEFAULT_WORKSPACE_ZONES as readonly string[]).includes(id),
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
    groupOrder: appearanceHook.groupOrder as WorkspaceZone[],
    pinnedZones,
    pinnedIds: appearanceHook.pinnedIds,
    togglePin,
    appearance: appearanceHook.appearance,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
  };
}
