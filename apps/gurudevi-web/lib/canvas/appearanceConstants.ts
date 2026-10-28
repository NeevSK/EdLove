import type { WorkspaceAppearance, WorkspaceWallpaper } from '@repo/core/types';

export const WORLD_BACKDROPS: Readonly<Record<string, ReadonlyArray<WorkspaceWallpaper>>> = {
  sanctuary: [
    {
      provider: 'preset',
      url: '/wallpapers/sanctuary-dawn-lotus.jpg',
      publicId: 'preset:sanctuary-dawn-lotus',
      width: 1920,
      height: 1080,
      name: 'Dawn Lotus',
    },
    {
      provider: 'preset',
      url: '/artwork/sanctuary_cloister_morning_1792762395893.jpg',
      publicId: 'preset:sanctuary-cloister',
      width: 1920,
      height: 1080,
      name: 'Sanctuary Cloister',
    },
    {
      provider: 'preset',
      url: '/artwork/realm-sanctuary.jpg',
      publicId: 'preset:realm-sanctuary',
      width: 1920,
      height: 1080,
      name: 'Sanctuary Realm',
    },
  ],
  wewa: [
    {
      provider: 'preset',
      url: '/artwork/wewa_reservoir_dusk_1792762377203.jpg',
      publicId: 'preset:wewa-dusk',
      width: 1920,
      height: 1080,
      name: 'Wewa at Dusk',
    },
    {
      provider: 'preset',
      url: '/artwork/realm-wewa.jpg',
      publicId: 'preset:realm-wewa',
      width: 1920,
      height: 1080,
      name: 'Wewa Waters',
    },
  ],
  kandyan: [
    {
      provider: 'preset',
      url: '/artwork/kandyan_temple_frescoes_1792762416787.jpg',
      publicId: 'preset:kandyan-frescoes',
      width: 1920,
      height: 1080,
      name: 'Temple Frescoes',
    },
    {
      provider: 'preset',
      url: '/artwork/realm-kandyan.jpg',
      publicId: 'preset:realm-kandyan',
      width: 1920,
      height: 1080,
      name: 'Temple Walls',
    },
  ],
  kele: [
    {
      provider: 'preset',
      url: '/artwork/sinharaja_rainforest_canopy_1792762436377.jpg',
      publicId: 'preset:sinharaja-canopy',
      width: 1920,
      height: 1080,
      name: 'Sinharaja Canopy',
    },
    {
      provider: 'preset',
      url: '/artwork/realm-kele.jpg',
      publicId: 'preset:realm-kele',
      width: 1920,
      height: 1080,
      name: 'Forest Realm',
    },
  ],
};

export function getBackdropsForWorld(worldId: string): ReadonlyArray<WorkspaceWallpaper> {
  return WORLD_BACKDROPS[worldId] ?? WORLD_BACKDROPS.sanctuary ?? [];
}

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
