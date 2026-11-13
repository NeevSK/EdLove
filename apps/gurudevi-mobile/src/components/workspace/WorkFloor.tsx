import { deskPort } from '@repo/classroom/deskPort';
import type { RoomPlan } from '@repo/core/logic/floor';
import { Card } from '@repo/ui/components/native';
import { useQuery } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoomFrame } from '../floor/RoomFrame';
import { hasDesk, loadWorkDesk, type PieceContext, workPiece } from './pieces';

/** Pieces that have their own screen today. The rest show what they know and open nothing yet. */
const DESTINATIONS: Partial<Record<string, Href>> = {
  events: '/workspace/events',
};

export interface WorkFloorProps {
  plan: RoomPlan;
  userId: string | null | undefined;
  /** The active bond; each bond keeps its own arrangement. */
  perspectiveId: string;
}

/**
 * The work room on the phone's one room frame: the role's plan and its pieces;
 * the frame does the rest (world, settings, verger, space). Opt-in
 * (EXPO_PUBLIC_WORK_FLOOR=1) while pieces gain their real screens; the
 * existing work room is unchanged when it is off.
 */
export function WorkFloor({ plan, userId, perspectiveId }: WorkFloorProps) {
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
    <RoomFrame
      plan={plan}
      userId={userId}
      perspectiveId={perspectiveId}
      renderPiece={(p) =>
        (desk.data ? workPiece(p.id, p.label, desk.data, ctx) : null) ?? <Card title={p.label} />
      }
    />
  );
}
