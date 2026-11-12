import {
  type DetailTier,
  type FloorSpace,
  layoutFloor,
  type MotionLevel,
  type RoomPlan,
  roomFloorInput,
  roomSurfaceDefinitions,
} from '@repo/core/logic/floor';
import { useFloorLayout } from '@repo/core/native';
import { Card, FloorView, useStage } from '@repo/ui/components/native';
import { floorFitOf, type KitPiece } from '@repo/ui/theme';
import { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

/** The shell bars above and below a work room (status, header, stripe, rooms bar). */
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

export interface WorkFloorProps {
  plan: RoomPlan;
  userId: string | null | undefined;
  /** The active bond; each bond keeps its own arrangement. */
  perspectiveId: string;
}

/**
 * The work room drawn by the floor engine: the role's default plan, the
 * person's saved arrangement for this bond, and the verger tier, laid out for
 * this screen. Opt-in (EXPO_PUBLIC_WORK_FLOOR=1) while pieces gain their real
 * screens; the existing work room is unchanged when it is off.
 */
export function WorkFloor({ plan, userId, perspectiveId }: WorkFloorProps) {
  const win = useWindowDimensions();
  const stage = useStage();
  const surfaces = useMemo(
    () => roomSurfaceDefinitions(plan, `workspace@${perspectiveId}`),
    [plan, perspectiveId],
  );
  const saved = useFloorLayout({ room: 'workspace', perspectiveId, userId, surfaces });

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
    <View style={styles.floor}>
      <FloorView tree={tree} renderPiece={(p) => <Card title={p.label} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  floor: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});
