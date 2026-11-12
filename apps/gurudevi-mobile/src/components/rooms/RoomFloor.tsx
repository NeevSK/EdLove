/**
 * A room's front floor, placed by the floor engine: the room's plan as this
 * person's bond sees it, their saved arrangement, the verger tier and this
 * screen's size go in; the engine says which pieces show, in what pattern and
 * order, and the room only draws each piece. The world's floor shows in full
 * behind it, like Self. Shared by Library, Community and Profile.
 */
import {
  type DetailTier,
  type FloorNode,
  type FloorSpace,
  layoutFloor,
  type MotionLevel,
  type RoomPlan,
  roomFloorInput,
  roomSurfaceDefinitions,
} from '@repo/core/logic/floor';
import { useFloorLayout } from '@repo/core/native';
import {
  FloorView,
  useScreenGround,
  useRoomScroll,
  useShellLayout,
  useStage,
} from '@repo/ui/components/native';
import { floorFitOf, type KitPiece } from '@repo/ui/theme';
import { WorldEnter } from '@repo/ui/theme/native';
import { type ReactNode, useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The shell bars above and below a room (status, header, stripe, rooms bar). */
const CHROME: FloorSpace['chrome'] = [
  { id: 'status', height: 24, giveWayRank: 0, essential: true },
  { id: 'header', height: 56, giveWayRank: 2 },
  { id: 'stripe', height: 32, giveWayRank: 4 },
  { id: 'rooms', height: 64, giveWayRank: 3 },
];

const DETAIL: Record<string, DetailTier> = {
  rich: 'rich',
  middle: 'balanced',
  floor: 'essential',
  bare: 'essential',
};
const MOTION: Record<string, MotionLevel> = {
  rich: 'full',
  middle: 'reduced',
  floor: 'reduced',
  bare: 'none',
};

export interface RoomFloorProps {
  plan: RoomPlan;
  userId: string | null | undefined;
  /** The active bond; each bond keeps its own arrangement of each room. */
  perspectiveId: string;
  /** Draws one piece; return null for a piece with nothing to show yet. */
  renderPiece: (piece: FloorNode) => ReactNode;
  /** Opens the rest of a group whose pieces did not all fit. */
  onSeeAll?: (groupId: string) => void;
  /** Above the floor: a greeting, a sample-data note. */
  lead?: ReactNode;
}

export function RoomFloor({
  plan,
  userId,
  perspectiveId,
  renderPiece,
  onSeeAll,
  lead,
}: RoomFloorProps) {
  useScreenGround('room');
  const scroll = useRoomScroll();
  const insets = useSafeAreaInsets();
  const shell = useShellLayout();
  const win = useWindowDimensions();
  const stage = useStage();
  const surfaces = useMemo(
    () => roomSurfaceDefinitions(plan, `${plan.room}@${perspectiveId}`),
    [plan, perspectiveId],
  );
  const saved = useFloorLayout({ room: plan.room, perspectiveId, userId, surfaces });

  const tree = useMemo(
    () =>
      layoutFloor(
        roomFloorInput({
          plan,
          fitOf: (kit) =>
            floorFitOf(kit as KitPiece, Platform.OS === 'android' ? 'android' : 'ios'),
          layout: saved.layout,
          space: { width: win.width, height: win.height, fontScale: win.fontScale, chrome: CHROME },
          controls: {
            detail: DETAIL[stage.tier] ?? 'balanced',
            motion: MOTION[stage.tier] ?? 'reduced',
          },
        }),
      ),
    [plan, saved.layout, win.width, win.height, win.fontScale, stage.tier],
  );

  return (
    <ScrollView
      {...scroll}
      style={styles.screen}
      contentContainerStyle={{
        paddingLeft: shell.gutter + shell.edges.left,
        paddingRight: shell.gutter + shell.edges.right,
        paddingTop: shell.stance === 'hud' ? shell.rhythm.top : 8,
        paddingBottom: insets.bottom + (shell.tabs === 'rail' ? 96 : 140),
        gap: shell.stance === 'hud' ? 20 : 28,
      }}
      showsVerticalScrollIndicator={false}
    >
      {lead ? <WorldEnter index={0}>{lead}</WorldEnter> : null}
      <WorldEnter index={1}>
        <FloorView tree={tree} renderPiece={renderPiece} onSeeAll={onSeeAll} scroll={false} />
      </WorldEnter>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: 'transparent' } });
