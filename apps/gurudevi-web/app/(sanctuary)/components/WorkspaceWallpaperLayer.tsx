'use client';

import { resolveWallpaperPresentation } from '@repo/core/efficiency';
import type { WorkspaceWallpaper } from '@repo/core/types';
import { useBrowserVisualBudget } from '../../../lib/runtime/useBrowserVisualBudget';

export function WorkspaceWallpaperLayer({
  wallpaper,
}: Readonly<{ wallpaper?: WorkspaceWallpaper }>) {
  const budget = useBrowserVisualBudget();
  const viewportWidth = typeof window === 'undefined' ? undefined : window.innerWidth;
  const presentation = resolveWallpaperPresentation(wallpaper, budget, viewportWidth);

  if (!presentation.enabled || !presentation.url) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="workspace-wallpaper"
      style={{
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage: `url("${presentation.url}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        opacity: presentation.opacity,
        filter: presentation.allowBlur ? 'blur(2px)' : undefined,
        pointerEvents: 'none',
      }}
    />
  );
}
