'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

export type LibraryCategory = 'discovery' | 'collections' | 'tools' | 'archives';

export const DEFAULT_LIBRARY_CATEGORIES: readonly LibraryCategory[] = [
  'discovery',
  'collections',
  'tools',
  'archives',
] as const;

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';
export type LibraryLayoutMode = 'overview' | 'master-detail' | 'stream';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;
const DEFAULT_LIBRARY_PINNED = ['discovery'];

export interface UseLibraryCanvasOptions {
  readonly accountId?: string;
  readonly enableRemoteSync?: boolean;
  readonly activeResourceKey?: string | null;
}

export function useLibraryCanvas({
  accountId = 'anonymous',
  enableRemoteSync = true,
  activeResourceKey = null,
}: UseLibraryCanvasOptions = {}) {
  const [viewport, setViewport] = useState<ViewportKind>('desktop');

  const appearanceHook = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: DEFAULT_LIBRARY_CATEGORIES,
    defaultPinnedIds: DEFAULT_LIBRARY_PINNED,
    enableRemoteSync,
    workspaceId: 'library',
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

  const pinnedCategories = useMemo<LibraryCategory[]>(() => {
    return appearanceHook.pinnedIds.filter((id): id is LibraryCategory =>
      (DEFAULT_LIBRARY_CATEGORIES as readonly string[]).includes(id),
    );
  }, [appearanceHook.pinnedIds]);

  const togglePin = useCallback(
    (category: LibraryCategory) => {
      let updated: string[];
      if (appearanceHook.pinnedIds.includes(category)) {
        updated = appearanceHook.pinnedIds.filter((id) => id !== category);
        if (updated.length === 0) {
          updated = [...DEFAULT_LIBRARY_PINNED];
        }
      } else {
        updated = [...appearanceHook.pinnedIds, category];
      }
      void appearanceHook.setPinnedIds(updated);
    },
    [appearanceHook],
  );

  const layoutMode: LibraryLayoutMode = useMemo(() => {
    if (!activeResourceKey) return 'overview';
    if (viewport === 'mobile') return 'stream';
    return 'master-detail';
  }, [activeResourceKey, viewport]);

  return {
    viewport,
    layoutMode,
    groupOrder: appearanceHook.groupOrder as LibraryCategory[],
    pinnedCategories,
    togglePin,
    appearance: appearanceHook.appearance,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
  };
}
