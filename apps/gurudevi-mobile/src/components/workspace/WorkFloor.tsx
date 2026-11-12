import { deskPort } from '@repo/classroom/deskPort';
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
import { useQuery } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { hasDesk, loadWorkDesk, type PieceContext, workPiece } from './pieces';

/** Pieces that have their own screen today. The rest show what they know and open nothing yet. */
const DESTINATIONS: Partial<Record<string, Href>> = {
  events: '/workspace/events',
};

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

  const { t, i18n } = useTranslation();
  const router = useRouter();
  const capacity = hasDesk(plan.capacity) ? plan.capacity : null;
  const desk = useQuery({
    queryKey: ['work-desk', capacity, deskPort.get().source],
    queryFn: ({ signal }) => loadWorkDesk(deskPort.get(), capacity!, signal),
    enabled: capacity !== null,
  });
  const ctx: PieceContext = {
    t,
    locale: i18n.language || 'en',
    canOpen: (id) => DESTINATIONS[id] !== undefined,
    open: (id) => {
      const to = DESTINATIONS[id];
      if (to) router.push(to);
    },
  };

  return (
    <View style={styles.floor}>
      <FloorView
        tree={tree}
        renderPiece={(p) =>
          (desk.data ? workPiece(p.id, p.label, desk.data, ctx) : null) ?? <Card title={p.label} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  floor: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
});
