'use client';

import type { WorkspaceWallpaper } from '@repo/core/types';
import { type WallpaperPresentation, wallpaperOf } from '@repo/core/verger';
import { useGurudeviView } from '../../../lib/runtime/useGurudeviView';

const OFF: WallpaperPresentation = { enabled: false, allowBlur: false, opacity: 0, url: null };

export interface SceneImageLayerProps {
  wallpaper?: WorkspaceWallpaper | null;
  nextWallpaper?: WorkspaceWallpaper | null;
  isCrossFading?: boolean;
  fixed?: boolean;
  pure?: boolean;
  /** The world's readability limit for a photo (see `groundLimitsOf`). Never passed. */
  maxOpacity?: number;
}

export function SceneImageLayer({
  wallpaper,
  nextWallpaper,
  isCrossFading = false,
  fixed = true,
  pure = false,
  maxOpacity = 1,
}: Readonly<SceneImageLayerProps>) {
  // Verger decides; until it is known (server, hydration), no wallpaper is requested.
  const view = useGurudeviView();
  const viewportWidth = typeof window === 'undefined' ? undefined : window.innerWidth;
  const present = (asset: WorkspaceWallpaper | null | undefined) =>
    view === null
      ? OFF
      : wallpaperOf(asset ?? undefined, view.experience, view.reading, viewportWidth);
  const presentation = present(wallpaper);
  const nextPresentation = nextWallpaper ? present(nextWallpaper) : null;

  if (!presentation.enabled || !presentation.url) {
    if (!nextPresentation?.enabled || !nextPresentation?.url) return null;
  }

  const opacity = Math.min(
    pure ? Math.min(presentation.opacity * 2.2, 0.42) : presentation.opacity,
    maxOpacity,
  );

  const nextOpacity = Math.min(
    pure
      ? Math.min((nextPresentation?.opacity ?? 0.16) * 2.2, 0.42)
      : (nextPresentation?.opacity ?? 0.16),
    maxOpacity,
  );

  return (
    <>
      {presentation.url ? (
        <div
          aria-hidden="true"
          data-testid="workspace-wallpaper"
          data-layer="scene-image"
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
          data-layer="scene-image-next"
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
