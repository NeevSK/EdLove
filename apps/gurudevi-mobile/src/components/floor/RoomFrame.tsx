import {
  type FloorNode,
  type FloorSpace,
  floorControlsOfStage,
  layoutRoomFloor,
  type RoomPlan,
  roomSurfaceDefinitions,
  WORLD_FLOOR_ID,
} from '@repo/core/logic/floor';
import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import { useFloorLayout, useWorkspaceLayoutSync } from '@repo/core/native';
import { FloorView, type PatternWords, useStage } from '@repo/ui/components/native';
import { floorFitOf, type KitPiece, worldFloorBias } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { type ReactNode, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

/** The shell bars above and below a room (status, header, stripe, rooms bar). */
const CHROME: FloorSpace['chrome'] = [
  { id: 'status', height: 24, giveWayRank: 0, essential: true },
  { id: 'header', height: 56, giveWayRank: 2 },
  { id: 'stripe', height: 32, giveWayRank: 4 },
  { id: 'rooms', height: 64, giveWayRank: 3 },
];

const NO_SURFACES: never[] = [];

export interface RoomFrameProps {
  plan: RoomPlan;
  userId: string | null | undefined;
  /** The active bond; each bond keeps its own arrangement. */
  perspectiveId: string;
  renderPiece: (piece: FloorNode) => ReactNode;
  presentationOf?: (pieceId: string) => FeaturePresentationMode;
  onSeeAll?: (groupId: string) => void;
  words?: Partial<PatternWords>;
}

/**
 * The phone's one room frame: any room drawn by the floor engine through the
 * same door the web frame uses (layoutRoomFloor). The world gives the
 * starting character, the person's every-room and this-room floor settings
 * come from their saved layouts, the stage tier (verger) sets the dials, and
 * the window is the space. Rooms move onto it one at a time.
 */
export function RoomFrame({
  plan,
  userId,
  perspectiveId,
  renderPiece,
  presentationOf,
  onSeeAll,
  words,
}: RoomFrameProps) {
  const win = useWindowDimensions();
  const stage = useStage();
  const world = useWorld();
  const surfaces = useMemo(
    () => roomSurfaceDefinitions(plan, `${plan.room}@${perspectiveId}`),
    [plan, perspectiveId],
  );
  const saved = useFloorLayout({ room: plan.room, perspectiveId, userId, surfaces });
  const everyRoom = useWorkspaceLayoutSync({
    workspaceId: WORLD_FLOOR_ID,
    userId,
    surfaces: NO_SURFACES,
  });

  const floor = useMemo(
    () =>
      layoutRoomFloor({
        plan,
        presentationOf,
        layout: saved.layout,
        everyRoom: everyRoom.layout?.floor ?? null,
        fitOf: (kit) => floorFitOf(kit as KitPiece, Platform.OS === 'android' ? 'android' : 'ios'),
        space: { width: win.width, height: win.height, fontScale: win.fontScale, chrome: CHROME },
        controls: floorControlsOfStage(stage.tier),
        world: worldFloorBias(world.id),
      }),
    [
      plan,
      presentationOf,
      saved.layout,
      everyRoom.layout?.floor,
      win.width,
      win.height,
      win.fontScale,
      stage.tier,
      world.id,
    ],
  );

  return (
    <View style={styles.floor}>
      <FloorView tree={floor.tree} renderPiece={renderPiece} onSeeAll={onSeeAll} words={words} />
    </View>
  );
}

const styles = StyleSheet.create({
  floor: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});
