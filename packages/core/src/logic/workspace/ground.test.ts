import type { WorkspaceAppearance, WorkspaceWallpaper } from '@repo/core/types';
import { describe, expect, it } from 'vitest';
import {
  appearanceForSync,
  followWorldGround,
  groundModePatch,
  mergeSavedGround,
  resolveRoomGround,
  roomHasOwnGround,
  wallpaperPatch,
  writeGround,
} from './ground';

const DEFAULTS: WorkspaceAppearance = { preset: 'default', motion: 'off', groundMode: 'live' };
const LOTUS: WorkspaceWallpaper = {
  provider: 'preset',
  url: '/wallpapers/lotus.jpg',
  publicId: 'preset:lotus',
  width: 1920,
  height: 1080,
};
const UPLOAD: WorkspaceWallpaper = {
  provider: 'custom',
  url: 'data:image/jpeg;base64,AAAA',
  publicId: 'custom:1',
  width: 1920,
  height: 1080,
};

describe('one world, rooms follow it', () => {
  it('a room with nothing saved shows the world look', () => {
    const world = { ...DEFAULTS, groundMode: 'quiet' as const, changedAt: '2026-11-12T10:00:00Z' };
    expect(resolveRoomGround(DEFAULTS, world, null)).toEqual({
      appearance: { ...DEFAULTS, groundMode: 'quiet' },
      source: 'world',
    });
  });

  it('just this room keeps its own look; every room later brings it back', () => {
    const room = writeGround(
      DEFAULTS,
      { groundMode: 'image', wallpaper: LOTUS },
      'room',
      '2026-11-12T10:00:00Z',
    ).room;
    expect(roomHasOwnGround(room, null)).toBe(true);
    expect(resolveRoomGround(DEFAULTS, null, room).appearance.groundMode).toBe('image');

    const world = writeGround(
      DEFAULTS,
      { groundMode: 'still' },
      'world',
      '2026-11-12T11:00:00Z',
    ).world;
    expect(roomHasOwnGround(room, world)).toBe(false);
    expect(resolveRoomGround(DEFAULTS, world, room)).toMatchObject({
      source: 'world',
      appearance: { groundMode: 'still' },
    });
  });

  it('older saved looks stay the room own until an every-room change is made', () => {
    const legacy: WorkspaceAppearance = { preset: 'garden', motion: 'off' };
    expect(resolveRoomGround(DEFAULTS, null, legacy).source).toBe('room');
    const world = { ...DEFAULTS, groundScope: 'world' as const, changedAt: '2026-11-12T11:00:00Z' };
    expect(resolveRoomGround(DEFAULTS, world, legacy).source).toBe('world');
  });

  it('follow world drops the room look', () => {
    const room = writeGround(DEFAULTS, { preset: 'night' }, 'room').room;
    expect(roomHasOwnGround(followWorldGround(room, DEFAULTS), null)).toBe(false);
  });
});

describe('switching grounds back and forth', () => {
  it('Photo, Live, Photo comes back to the same photo', () => {
    let look: WorkspaceAppearance = { ...DEFAULTS };
    look = { ...look, ...groundModePatch(look, 'image', [LOTUS]) };
    expect(look).toMatchObject({ groundMode: 'image', wallpaper: LOTUS });
    look = { ...look, ...groundModePatch(look, 'live', [LOTUS]) };
    expect(look.groundMode).toBe('live');
    look = { ...look, ...groundModePatch(look, 'image', []) };
    expect(look).toMatchObject({ groundMode: 'image', wallpaper: LOTUS });
  });

  it('picking a photo while a slideshow config exists makes it the active one', () => {
    const look: WorkspaceAppearance = {
      ...DEFAULTS,
      wallpaperConfig: { mode: 'off', items: [UPLOAD, LOTUS], slideshowIntervalSeconds: 300 },
    };
    expect(wallpaperPatch(look, LOTUS)).toMatchObject({
      groundMode: 'image',
      wallpaperConfig: { mode: 'single', activeId: 'preset:lotus' },
    });
    expect(wallpaperPatch(look, null)).toEqual({ wallpaper: null, groundMode: 'live' });
  });
});

describe('saving to the account', () => {
  it('uploads go as a reference and come back from this device', () => {
    const local: WorkspaceAppearance = {
      ...DEFAULTS,
      groundMode: 'image',
      wallpaper: UPLOAD,
      changedAt: '2026-11-12T10:00:00Z',
    };
    const sent = appearanceForSync(local);
    expect(sent.wallpaper?.url).toBe('device:custom:1');
    expect(mergeSavedGround(local, sent)?.wallpaper).toEqual(UPLOAD);
    expect(mergeSavedGround(null, sent)?.wallpaper).toBeNull();
  });

  it('the newer copy wins, so a late account copy does not undo a fresh change', () => {
    const fresh = { ...DEFAULTS, groundMode: 'quiet' as const, changedAt: '2026-11-12T11:00:00Z' };
    const stale = { ...DEFAULTS, groundMode: 'image' as const, changedAt: '2026-11-12T10:00:00Z' };
    expect(mergeSavedGround(fresh, stale)?.groundMode).toBe('quiet');
    expect(mergeSavedGround(stale, fresh)?.groundMode).toBe('quiet');
  });
});
