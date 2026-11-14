import { usePermissions, usePerspectiveSwitch } from '@repo/core/logic';

/** Who is in the room: the person, the bond they are looking through, and its capacity. */
export function useRoomBond() {
  const { context } = usePermissions();
  const { activePerspective } = usePerspectiveSwitch();
  return {
    userId: context.userId,
    perspectiveId: activePerspective.id,
    capacity: context.activeBond?.capacity ?? context.primaryCapacity ?? null,
  };
}
