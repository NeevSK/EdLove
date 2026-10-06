'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

export type ProfileSection = 'identity' | 'settings' | 'security';

export const DEFAULT_PROFILE_SECTIONS: readonly ProfileSection[] = [
  'identity',
  'settings',
  'security',
] as const;

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';

const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export interface UseProfileCanvasOptions {
  readonly accountId?: string;
  readonly enableRemoteSync?: boolean;
}

export function useProfileCanvas({
  accountId = 'anonymous',
  enableRemoteSync = true,
}: UseProfileCanvasOptions = {}) {
  const [viewport, setViewport] = useState<ViewportKind>('desktop');

  const appearanceHook = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: DEFAULT_PROFILE_SECTIONS,
    enableRemoteSync,
    workspaceId: 'profile',
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

  return {
    viewport,
    sections: appearanceHook.groupOrder as ProfileSection[],
    appearance: appearanceHook.appearance,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
  };
}
