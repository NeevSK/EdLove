import type {
  FloorWallpaperConfig,
  GroundScope,
  SceneGroundMode,
  WorkspaceAppearance,
  WorkspaceWallpaper,
} from '@repo/core/types';

/**
 * The ground of a room: what its floor stands on (the world's living sky, a still sky, a photo, or
 * quiet paper), with its wash and texture.
 *
 * One world is shared across the app and every room follows it. A room can still take its own
 * look: someone changes the look and chooses "just this room" instead of "every room". Each
 * choice carries `changedAt`, so a later every-room change brings every room back to the world's
 * look without visiting each room. All functions here are pure; the stores live in each app.
 */

/** The saved-layout id that holds the every-room look, beside each room's own layout. */
export const WORLD_GROUND_ID = 'world-ground';

/** Where the look a room shows came from. */
export type GroundSource = 'room' | 'world' | 'default';

export interface ResolvedGround {
  appearance: WorkspaceAppearance;
  source: GroundSource;
}

/** The fields that make the ground. `worldId` is not one: the world itself is chosen app-wide. */
const GROUND_KEYS = [
  'preset',
  'motion',
  'groundMode',
  'wallpaper',
  'wallpaperConfig',
  'atmosphere',
] as const satisfies readonly (keyof WorkspaceAppearance)[];

function stamp(value: string | undefined): number {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

/**
 * Whether a room's saved look is its own (and so shown) rather than the world's.
 * Older saved looks (no `groundScope`) stay the room's own until an every-room change is newer.
 */
export function roomHasOwnGround(
  room: WorkspaceAppearance | null | undefined,
  world: WorkspaceAppearance | null | undefined,
): boolean {
  if (!room || room.groundScope === 'world') return false;
  if (!world?.changedAt) return true;
  return stamp(room.changedAt) > stamp(world.changedAt);
}

function groundOf(source: WorkspaceAppearance): Partial<WorkspaceAppearance> {
  const ground: Partial<WorkspaceAppearance> = {};
  for (const key of GROUND_KEYS) {
    if (source[key] !== undefined) (ground as Record<string, unknown>)[key] = source[key];
  }
  return ground;
}

/** The look a room shows: its own if it has one, otherwise the world's, otherwise the defaults. */
export function resolveRoomGround(
  defaults: WorkspaceAppearance,
  world: WorkspaceAppearance | null | undefined,
  room: WorkspaceAppearance | null | undefined,
): ResolvedGround {
  if (room && roomHasOwnGround(room, world)) {
    return { appearance: { ...defaults, ...groundOf(room) }, source: 'room' };
  }
  if (world) return { appearance: { ...defaults, ...groundOf(world) }, source: 'world' };
  return { appearance: defaults, source: 'default' };
}

export interface GroundWrite {
  /** The new every-room look, when the change is for every room. */
  world?: WorkspaceAppearance;
  /** The room's new saved look, when the change is for this room (or it now follows the world). */
  room?: WorkspaceAppearance;
}

/**
 * Where one change to the look is saved. `scope: 'world'` changes every room (and, by being
 * newer, brings rooms with their own look back to the world's); `scope: 'room'` changes only
 * this room. `current` is the look the room shows now, so the change starts from what is seen.
 */
export function writeGround(
  current: WorkspaceAppearance,
  patch: Partial<WorkspaceAppearance>,
  scope: GroundScope,
  now: string = new Date().toISOString(),
): GroundWrite {
  const next: WorkspaceAppearance = { ...current, ...groundOf({ ...current, ...patch }) };
  if (scope === 'world') return { world: { ...next, groundScope: 'world', changedAt: now } };
  return { room: { ...next, groundScope: 'room', changedAt: now } };
}

/** This room gives up its own look and follows the world again. */
export function followWorldGround(
  room: WorkspaceAppearance | null | undefined,
  defaults: WorkspaceAppearance,
  now: string = new Date().toISOString(),
): WorkspaceAppearance {
  return { ...(room ?? defaults), groundScope: 'world', changedAt: now };
}

/**
 * The patch for choosing a ground mode. The photo is remembered when someone leaves Photo, so
 * coming back shows the same one; choosing Photo with none picked takes the world's first.
 */
export function groundModePatch(
  current: WorkspaceAppearance,
  mode: SceneGroundMode,
  worldPhotos: readonly WorkspaceWallpaper[],
): Partial<WorkspaceAppearance> {
  if (mode !== 'image') return { groundMode: mode };
  const wallpaper = current.wallpaper ?? worldPhotos[0] ?? null;
  const config = current.wallpaperConfig;
  return {
    groundMode: 'image',
    wallpaper,
    wallpaperConfig:
      config && config.mode !== 'off'
        ? { ...config, activeId: wallpaper?.publicId ?? config.activeId ?? null }
        : config
          ? { ...config, mode: 'single', activeId: wallpaper?.publicId ?? null }
          : config,
  };
}

/** The patch for choosing a photo (or clearing it, which returns to the world's living sky). */
export function wallpaperPatch(
  current: WorkspaceAppearance,
  wallpaper: WorkspaceWallpaper | null,
): Partial<WorkspaceAppearance> {
  if (!wallpaper) return { wallpaper: null, groundMode: 'live' };
  const config = current.wallpaperConfig;
  return {
    wallpaper,
    groundMode: 'image',
    wallpaperConfig: config
      ? {
          ...config,
          mode: config.mode === 'off' ? 'single' : config.mode,
          activeId: wallpaper.publicId,
        }
      : config,
  };
}

/** The patch for a new playback config: the shown photo stays the active one. */
export function wallpaperConfigPatch(
  current: WorkspaceAppearance,
  config: FloorWallpaperConfig,
): Partial<WorkspaceAppearance> {
  return {
    wallpaperConfig: { ...current.wallpaperConfig, ...config },
  };
}

/** A photo kept only on this device (an upload): its pixels never leave the device. */
export function isDeviceOnlyWallpaper(wallpaper: WorkspaceWallpaper | null | undefined): boolean {
  return Boolean(
    wallpaper && (wallpaper.provider === 'custom' || wallpaper.url.startsWith('data:')),
  );
}

const DEVICE_ONLY_URL = 'device:';

function toSyncWallpaper(wallpaper: WorkspaceWallpaper): WorkspaceWallpaper {
  return isDeviceOnlyWallpaper(wallpaper)
    ? { ...wallpaper, provider: 'custom', url: `${DEVICE_ONLY_URL}${wallpaper.publicId}` }
    : wallpaper;
}

/**
 * The look as it is sent to the account: uploads go as a reference, not their pixels (a photo
 * can be megabytes, and it stays on the device it was added on).
 */
export function appearanceForSync(appearance: WorkspaceAppearance): WorkspaceAppearance {
  const next: WorkspaceAppearance = { ...appearance };
  if (next.wallpaper) next.wallpaper = toSyncWallpaper(next.wallpaper);
  if (next.wallpaperConfig) {
    next.wallpaperConfig = {
      ...next.wallpaperConfig,
      items: next.wallpaperConfig.items.map(toSyncWallpaper),
    };
  }
  return next;
}

/** Whether this wallpaper is a reference to an upload that lives on some device. */
export function isDeviceReference(wallpaper: WorkspaceWallpaper | null | undefined): boolean {
  return Boolean(wallpaper?.url.startsWith(DEVICE_ONLY_URL));
}

function restoreFrom(
  wallpaper: WorkspaceWallpaper | null | undefined,
  known: ReadonlyMap<string, WorkspaceWallpaper>,
): WorkspaceWallpaper | null {
  if (!wallpaper) return wallpaper ?? null;
  if (!isDeviceReference(wallpaper)) return wallpaper;
  return known.get(wallpaper.publicId) ?? null;
}

/**
 * Two copies of one saved look (this device's and the account's): the newer wins. Uploads the
 * account only knows by reference take their pixels from this device when it has them; when it
 * does not, the photo is dropped and the world's own photo shows instead.
 */
export function mergeSavedGround(
  local: WorkspaceAppearance | null | undefined,
  remote: WorkspaceAppearance | null | undefined,
): WorkspaceAppearance | null {
  if (!remote) return local ?? null;
  const winner = !local || stamp(remote.changedAt) >= stamp(local.changedAt) ? remote : local;
  if (winner === local) return local;
  const known = new Map<string, WorkspaceWallpaper>();
  for (const item of [local?.wallpaper, ...(local?.wallpaperConfig?.items ?? [])]) {
    if (item && !isDeviceReference(item)) known.set(item.publicId, item);
  }
  const merged: WorkspaceAppearance = { ...remote };
  if (remote.wallpaper !== undefined) merged.wallpaper = restoreFrom(remote.wallpaper, known);
  if (remote.wallpaperConfig) {
    merged.wallpaperConfig = {
      ...remote.wallpaperConfig,
      items: remote.wallpaperConfig.items
        .map((item) => restoreFrom(item, known))
        .filter((item): item is WorkspaceWallpaper => item !== null),
    };
  }
  return merged;
}
