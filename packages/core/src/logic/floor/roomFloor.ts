import type { WorkspaceLayout } from '@repo/core/types';
import { floorConfigWith } from './config';
import { layoutFloor } from './layout';
import { type RoomFloorOptions, roomFloorInput } from './rooms';
import {
  configWithFloorSettings,
  type FloorSettings,
  type ResolvedFloorSettings,
  resolveFloorSettings,
} from './settings';
import type { FloorTree } from './types';

/**
 * The one door every room frame (web and phone) uses to lay out a room, so
 * both follow the world the same way: the room's catalog and the person's saved
 * arrangement go in, the floor settings are resolved along the chain (world
 * character, then every room, then this room), and the engine lays it out.
 * Pure; the frame measures the space and draws the tree.
 */
export interface RoomFloorArgs extends Omit<RoomFloorOptions, 'layout'> {
  layout?:
    | (Pick<WorkspaceLayout, 'order' | 'hidden' | 'pinned' | 'zoneBySurface' | 'groupOrder'> &
        Partial<Pick<WorkspaceLayout, 'floor'>>)
    | null;
  /** The every-room settings (their own saved layout, `WORLD_FLOOR_ID`). */
  everyRoom?: FloorSettings | null;
}

export interface RoomFloor {
  tree: FloorTree;
  /** What the room uses and where it came from, for the Studio. */
  settings: ResolvedFloorSettings;
}

export function layoutRoomFloor({
  layout = null,
  everyRoom = null,
  config: overrides,
  ...rest
}: RoomFloorArgs): RoomFloor {
  const room = rest.catalog.room;
  const base = floorConfigWith(overrides);
  const settings = resolveFloorSettings({
    room,
    config: base,
    world: rest.world,
    everyRoom,
    roomSettings: layout?.floor ?? null,
  });
  const config = configWithFloorSettings(base, room, settings);
  const tree = layoutFloor(roomFloorInput({ ...rest, layout, config }));
  return { tree, settings };
}
