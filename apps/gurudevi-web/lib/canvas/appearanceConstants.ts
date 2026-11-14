import {
  getBackdropsForWorld,
  hasOwnBackdrops,
  WORLD_BACKDROPS,
} from '@repo/core/logic/workspace/worldBackdrops';
import type { WorkspaceAppearance, WorkspaceWallpaper } from '@repo/core/types';

// The world photos moved to core so the phone reads the same set; kept exported here for callers.
export { getBackdropsForWorld, hasOwnBackdrops, WORLD_BACKDROPS };

export const PRESET_WALLPAPERS: ReadonlyArray<WorkspaceWallpaper> = [
  ...getBackdropsForWorld('sanctuary'),
  ...getBackdropsForWorld('wewa'),
  ...getBackdropsForWorld('kandyan'),
  ...getBackdropsForWorld('kele'),
];

export const DEFAULT_APPEARANCE: WorkspaceAppearance = {
  preset: 'default',
  motion: 'off',
  groundMode: 'live',
  worldId: 'sanctuary',
  wallpaper: PRESET_WALLPAPERS[0],
};

/**
 * Explore mode default appearance:
 * - World: Sanctuary
 * - Ground: Living Sky ('live')
 * - Motion: subtle
 * - Wallpaper fallback: Dawn Lotus
 */
export const EXPLORE_DEFAULT_APPEARANCE: WorkspaceAppearance = {
  preset: 'dawn',
  motion: 'subtle',
  groundMode: 'live',
  worldId: 'sanctuary',
  wallpaper: PRESET_WALLPAPERS[0],
  wallpaperConfig: {
    mode: 'slideshow',
    activeId: PRESET_WALLPAPERS[0]?.publicId ?? 'preset:sanctuary-dawn-lotus',
    items: [...PRESET_WALLPAPERS],
    slideshowIntervalSeconds: 180, // 3 min
    customWashColor: '#d4843a',
  },
};

/**
 * The look a world starts with, before anyone changes it: the world's own first photo stands
 * ready for Photo (explore starts on its slideshow of the same world's photos).
 */
export function groundDefaultsFor(worldId: string, isExplore: boolean): WorkspaceAppearance {
  const base = isExplore ? EXPLORE_DEFAULT_APPEARANCE : DEFAULT_APPEARANCE;
  const photos = getBackdropsForWorld(worldId);
  return {
    ...base,
    wallpaper: photos[0] ?? null,
    wallpaperConfig: base.wallpaperConfig
      ? { ...base.wallpaperConfig, items: [...photos], activeId: photos[0]?.publicId ?? null }
      : base.wallpaperConfig,
  };
}
