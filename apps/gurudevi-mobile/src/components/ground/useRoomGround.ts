/**
 * The room's ground on the phone, from the same model web uses (core ground +
 * groundPlan): the world's look that every room follows, or the room's own
 * look, planned for this device (verger decides whether photos may load) and
 * for this kind of screen (the person's Lively/Balanced/Calm). The plan goes to
 * the one floor at the root, so every screen stands on it.
 */
import { WORLD_GROUND_ID, resolveRoomGround } from '@repo/core/logic/workspace/ground';
import { groundDialOf } from '@repo/core/logic/workspace/groundLiveliness';
import {
  type GroundStage,
  groundAllowanceOf,
  planGround,
} from '@repo/core/logic/workspace/groundPlan';
import { getBackdropsForWorld } from '@repo/core/logic/workspace/worldBackdrops';
import { useFloorLayout, useWorkspaceLayoutSync } from '@repo/core/native';
import type { WorkspaceAppearance } from '@repo/core/types';
import { useStageContext } from '@repo/ui/components/native';
import { useComfort } from '@repo/ui/context/ComfortPreferences';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { useWorld } from '@repo/ui/theme/native';
import { useVergerSnapshot } from '@repo/verger-react';
import { useEffect, useMemo } from 'react';

const NO_SURFACES: never[] = [];

/** The look a world starts with: its live sky, with its first photo ready for Photo. */
export function worldGroundDefaults(worldId: string): WorkspaceAppearance {
  return {
    preset: 'default',
    motion: 'off',
    groundMode: 'live',
    worldId,
    wallpaper: getBackdropsForWorld(worldId)[0] ?? null,
  };
}

export interface RoomGroundOptions {
  room: string;
  stage: GroundStage;
  userId: string | null | undefined;
  perspectiveId: string;
}

/** Saved looks for the world and for this room, and how to change them. */
export function useRoomLooks({ room, userId, perspectiveId }: Omit<RoomGroundOptions, 'stage'>) {
  const worldLook = useWorkspaceLayoutSync({
    workspaceId: WORLD_GROUND_ID,
    userId,
    surfaces: NO_SURFACES,
  });
  const roomLook = useFloorLayout({ room, perspectiveId, userId, surfaces: NO_SURFACES });
  return { worldLook, roomLook };
}

/** Plans the ground for the room on screen and hands it to the floor. */
export function useRoomGround(options: RoomGroundOptions) {
  const world = useWorld();
  const { setGround } = useStageContext();
  const experience = useVisualCapabilities();
  const snapshot = useVergerSnapshot();
  const { ground: liveliness } = useComfort();
  const { worldLook, roomLook } = useRoomLooks(options);

  const worldAppearance = worldLook.layout?.appearance ?? null;
  const roomAppearance = roomLook.layout?.appearance ?? null;
  const resolved = useMemo(
    () => resolveRoomGround(worldGroundDefaults(world.id), worldAppearance, roomAppearance),
    [world.id, worldAppearance, roomAppearance],
  );

  const reading = {
    networkLimit: snapshot?.networkLimit ?? 'none',
    powerSaver: snapshot?.powerSaver ?? false,
    visibility: snapshot?.visibility ?? 'active',
  } as const;
  const plan = useMemo(
    () =>
      planGround(
        resolved.appearance,
        getBackdropsForWorld(world.id),
        groundAllowanceOf(experience, reading),
        undefined,
        options.stage,
        groundDialOf(liveliness),
      ),
    // reading's fields are listed so a new object each render does not replan.
    [
      resolved.appearance,
      world.id,
      experience,
      reading.networkLimit,
      reading.powerSaver,
      reading.visibility,
      options.stage,
      liveliness,
    ],
  );

  useEffect(() => {
    setGround(plan);
  }, [plan, setGround]);
  useEffect(() => () => setGround(null), [setGround]);

  return { plan, source: resolved.source, current: resolved.appearance, worldLook, roomLook };
}
