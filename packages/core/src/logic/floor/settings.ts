import type { WorkspaceFloorSettings } from '@repo/core/types';
import { z } from 'zod';
import type { FloorConfig } from './config';
import type { DensityTier, WorldFloorBias } from './types';

/**
 * The person's floor settings, and how a room follows the world.
 *
 * Same chain as the ground (world, then every room, then this room): the world
 * gives the default character, a person can change every room at once, or one
 * room only. A room follows until someone picks "just this room"; a later
 * every-room change wins over older room settings, so nobody has to visit each
 * room to bring it back. Page kinds never change these.
 *
 * Pure: stores and saving live in each app; settings ride on the saved layout
 * (`WorkspaceLayout.floor`), and the every-room settings sit on their own
 * saved layout, `WORLD_FLOOR_ID`.
 */

export const WORLD_FLOOR_ID = 'world-floor';

const DENSITY = ['calm', 'standard', 'dense'] as const;

export const FloorSettingsSchema: z.ZodType<WorkspaceFloorSettings> = z.object({
  /** How much fits on the first screen: calm (roomy), standard, dense. */
  density: z.enum(DENSITY).optional(),
  /** Who may reorder: only labelled smart areas, everywhere, or never (my order always wins). */
  reorder: z.enum(['smart-areas', 'everywhere', 'never']).optional(),
  /** "world" = follow every-room settings; "room" = this room's own. */
  scope: z.enum(['world', 'room']),
  changedAt: z.string(),
});

export type FloorSettings = WorkspaceFloorSettings;

export type FloorSettingsSource = 'room' | 'every-room' | 'world';

export interface ResolvedFloorSettings {
  density: DensityTier;
  reorder: FloorConfig['reorder'];
  /** Where the density came from, for the Studio ("following every room", "this room only"). */
  source: FloorSettingsSource;
}

function stamp(value: string | undefined): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

/** Whether a room's settings are its own: picked for this room, and newer than any every-room change. */
export function roomHasOwnFloor(
  room: FloorSettings | null | undefined,
  everyRoom: FloorSettings | null | undefined,
): boolean {
  if (!room || room.scope !== 'room') return false;
  return stamp(room.changedAt) > stamp(everyRoom?.changedAt);
}

/** Moves a density one step roomier (-1) or tighter (+1), within the three tiers. */
export function shiftDensity(tier: DensityTier, step: number): DensityTier {
  const i = DENSITY.indexOf(tier);
  const j = Math.min(DENSITY.length - 1, Math.max(0, i + Math.round(step)));
  return DENSITY[j] as DensityTier;
}

/**
 * The settings a room uses. Density: this room's own, else every room's, else
 * the room kind's default nudged by the world's character. Reorder follows the
 * same chain and falls back to the engine default.
 */
export function resolveFloorSettings(args: {
  room: string;
  config: FloorConfig;
  world?: WorldFloorBias;
  everyRoom?: FloorSettings | null;
  roomSettings?: FloorSettings | null;
}): ResolvedFloorSettings {
  const { room, config, world, everyRoom, roomSettings } = args;
  const kindDefault = config.tierByRoom[room] ?? 'standard';
  const worldDensity = shiftDensity(kindDefault, world?.densityShift ?? 0);
  const own = roomHasOwnFloor(roomSettings, everyRoom) ? roomSettings : null;

  const density = own?.density ?? everyRoom?.density ?? worldDensity;
  const source: FloorSettingsSource = own?.density
    ? 'room'
    : everyRoom?.density
      ? 'every-room'
      : 'world';
  const reorder = own?.reorder ?? everyRoom?.reorder ?? config.reorder;
  return { density, reorder, source };
}

/** Engine config for one room with its resolved settings applied. */
export function configWithFloorSettings(
  config: FloorConfig,
  room: string,
  settings: ResolvedFloorSettings,
): FloorConfig {
  return {
    ...config,
    reorder: settings.reorder,
    tierByRoom: { ...config.tierByRoom, [room]: settings.density },
  };
}

export interface FloorSettingsWrite {
  /** New settings for the room the person is in (scope "room"), when they chose "just this room". */
  room?: FloorSettings;
  /** New every-room settings, when they chose "every room". */
  everyRoom?: FloorSettings;
}

/**
 * Records a change. "every room" updates the every-room settings and, being
 * newer, brings every room back to them; "just this room" stays in this room.
 */
export function writeFloorSettings(
  change: Partial<Pick<FloorSettings, 'density' | 'reorder'>>,
  scope: 'every-room' | 'this-room',
  previous: { everyRoom?: FloorSettings | null; room?: FloorSettings | null },
  now: string,
): FloorSettingsWrite {
  if (scope === 'every-room') {
    return {
      everyRoom: { ...(previous.everyRoom ?? {}), ...change, scope: 'world', changedAt: now },
    };
  }
  const base = roomHasOwnFloor(previous.room, previous.everyRoom) ? previous.room : null;
  return { room: { ...(base ?? {}), ...change, scope: 'room', changedAt: now } };
}

/** Puts a room back on the every-room settings. */
export function followWorldFloor(now: string): FloorSettings {
  return { scope: 'world', changedAt: now };
}
