import type { WorkspaceWallpaper } from '@repo/core/types';

/**
 * Each world's own photos for the Photo ground, shared by web and phone. URLs are paths on the
 * web app; the phone resolves them against the app's public origin (photosForDevice).
 */
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

/** Whether this world has photos of its own (others borrow Sanctuary's until theirs are made). */
export function hasOwnBackdrops(worldId: string): boolean {
  return (WORLD_BACKDROPS[worldId]?.length ?? 0) > 0;
}

/** A photo path the phone can load: preset paths live on the web app's public origin. */
export function photoUrlFor(wallpaper: WorkspaceWallpaper, origin: string): string {
  return wallpaper.url.startsWith('/')
    ? `${origin.replace(/\/+$/, '')}${wallpaper.url}`
    : wallpaper.url;
}
