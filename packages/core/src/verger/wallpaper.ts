import type { WorkspaceWallpaper } from '@repo/core/types';
import type { VergerSnapshot } from '@repo/verger-core';
import type { GurudeviExperience } from './experience';

export interface WallpaperPresentation {
  enabled: boolean;
  allowBlur: boolean;
  opacity: number;
  url: string | null;
}

export function buildResponsiveWallpaperUrl(url: string, width: number): string {
  if (!Number.isSafeInteger(width) || width <= 0) return url;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== 'https:' ||
      (parsed.hostname !== 'res.cloudinary.com' && !parsed.hostname.endsWith('.res.cloudinary.com'))
    ) {
      return url;
    }
    const marker = '/image/upload/';
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) return url;
    const prefixEnd = markerIndex + marker.length;
    parsed.pathname = `${parsed.pathname.slice(0, prefixEnd)}c_limit,w_${width},q_auto,f_auto/${parsed.pathname.slice(prefixEnd)}`;
    return parsed.toString();
  } catch {
    return url;
  }
}

/** What verger says now that a decorative image depends on. */
export type WallpaperReading = Pick<VergerSnapshot, 'networkLimit' | 'powerSaver' | 'visibility'>;

const OFF: WallpaperPresentation = { enabled: false, allowBlur: false, opacity: 0, url: null };

/**
 * Whether decorative wallpapers may show (and rotate) now: they wait whenever data, energy or
 * attention is short (offline, Data Saver, a slow or unstable link, battery saver, a hidden app)
 * and where fidelity is low.
 */
export function wallpaperAllowed(
  view: Pick<GurudeviExperience, 'effectiveFidelity'>,
  reading: WallpaperReading,
): boolean {
  return (
    view.effectiveFidelity !== 'low' &&
    reading.visibility === 'active' &&
    !reading.powerSaver &&
    reading.networkLimit === 'none'
  );
}

/**
 * The workspace wallpaper, as verger allows it (`wallpaperAllowed`). A high phone gets the sharp
 * image; any other a smaller one. Blur follows the blur lever.
 */
export function wallpaperOf(
  wallpaper: WorkspaceWallpaper | undefined,
  view: Pick<GurudeviExperience, 'deviceTier' | 'effectiveFidelity' | 'allowBlur'>,
  reading: WallpaperReading,
  viewportWidth?: number,
): WallpaperPresentation {
  if (!wallpaper || !wallpaperAllowed(view, reading)) return OFF;
  const rich = view.deviceTier === 'high';
  const qualityWidth = rich ? 1920 : 1280;
  const devicePixelRatio = rich ? 1.5 : 1;
  const responsiveWidth =
    typeof viewportWidth === 'number' && Number.isFinite(viewportWidth) && viewportWidth > 0
      ? Math.min(qualityWidth, Math.ceil(viewportWidth * devicePixelRatio))
      : qualityWidth;
  return {
    enabled: true,
    allowBlur: view.allowBlur,
    opacity: rich ? 0.2 : 0.12,
    url: buildResponsiveWallpaperUrl(wallpaper.url, responsiveWidth),
  };
}
