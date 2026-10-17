import type { WorkspaceWallpaper } from '@repo/core/types';
import type { RuntimeVisualBudget } from './visualBudget';

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

export function resolveWallpaperPresentation(
  wallpaper: WorkspaceWallpaper | undefined,
  budget: RuntimeVisualBudget,
  viewportWidth?: number,
): WallpaperPresentation {
  if (!wallpaper || budget.quality === 'essential') {
    return { enabled: false, allowBlur: false, opacity: 0, url: null };
  }
  const qualityWidth = budget.quality === 'rich' ? 1920 : 1280;
  const responsiveWidth =
    typeof viewportWidth === 'number' && Number.isFinite(viewportWidth) && viewportWidth > 0
      ? Math.min(qualityWidth, Math.ceil(viewportWidth * budget.maxDevicePixelRatio))
      : qualityWidth;
  return {
    enabled: true,
    allowBlur: budget.allowBlur,
    opacity: budget.quality === 'rich' ? 0.2 : 0.12,
    url: buildResponsiveWallpaperUrl(wallpaper.url, responsiveWidth),
  };
}
