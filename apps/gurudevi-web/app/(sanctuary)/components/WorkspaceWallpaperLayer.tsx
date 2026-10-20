'use client';

import { resolveWallpaperPresentation } from '@repo/core/efficiency';
import type { WorkspaceWallpaper } from '@repo/core/types';
import { useBrowserVisualBudget } from '../../../lib/runtime/useBrowserVisualBudget';

export function WorkspaceWallpaperLayer({
  wallpaper,
  nextWallpaper,
  isCrossFading = false,
  fixed = true,
  pure = false,
}: Readonly<{
  wallpaper?: WorkspaceWallpaper | null;
  nextWallpaper?: WorkspaceWallpaper | null;
  isCrossFading?: boolean;
  fixed?: boolean;
  pure?: boolean;
}>) {
  const budget = useBrowserVisualBudget();
  const viewportWidth = typeof window === 'undefined' ? undefined : window.innerWidth;
  const presentation = resolveWallpaperPresentation(wallpaper ?? undefined, budget, viewportWidth);
  const nextPresentation = nextWallpaper
    ? resolveWallpaperPresentation(nextWallpaper, budget, viewportWidth)
    : null;

  if (!presentation.enabled || !presentation.url) {
    if (!nextPresentation?.enabled || !nextPresentation?.url) return null;
  }

  const opacity = pure
    ? Math.min(presentation.opacity * 2.2, 0.42)
    : presentation.opacity;

  const nextOpacity = pure
    ? Math.min((nextPresentation?.opacity ?? 0.16) * 2.2, 0.42)
    : (nextPresentation?.opacity ?? 0.16);

  return (
    <>
      {presentation.url ? (
        <div
          aria-hidden="true"
          data-testid="workspace-wallpaper"
          style={{
            position: fixed ? 'fixed' : 'absolute',
            zIndex: 0,
            inset: 0,
            width: fixed ? '100vw' : '100%',
            height: fixed ? '100vh' : '100%',
            backgroundImage: `url("${presentation.url}")`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: fixed ? 'fixed' : 'scroll',
            opacity: isCrossFading ? opacity * 0.3 : opacity,
            filter: presentation.allowBlur ? 'blur(1.5px)' : undefined,
            pointerEvents: 'none',
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ) : null}

      {nextPresentation?.url ? (
        <div
          aria-hidden="true"
          data-testid="workspace-wallpaper-next"
          style={{
            position: fixed ? 'fixed' : 'absolute',
            zIndex: 0,
            inset: 0,
            width: fixed ? '100vw' : '100%',
            height: fixed ? '100vh' : '100%',
            backgroundImage: `url("${nextPresentation.url}")`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: fixed ? 'fixed' : 'scroll',
            opacity: isCrossFading ? nextOpacity : 0,
            filter: nextPresentation.allowBlur ? 'blur(1.5px)' : undefined,
            pointerEvents: 'none',
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      ) : null}
    </>
  );
}
