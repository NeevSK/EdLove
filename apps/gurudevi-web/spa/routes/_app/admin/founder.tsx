import { createFileRoute } from '@tanstack/react-router';
import { FounderFloor } from '../../../../app/(sanctuary)/admin/founder/FounderFloor';
import { steward } from '../../../../lib/sanctuary/capacityAccess';
import { CapacityGate } from '../../../surface/CapacityGate';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/founder')({
  component: AdminFounderScreen,
});

function AdminFounderScreen() {
  const { accountId, capacity, displayName } = useSession();
  return (
    <CapacityGate
      allows={steward}
      detail="Founder command is restricted to sovereign platform stewards (Founders, Co-Founders, and Executive Directors)."
    >
      <FounderFloor displayName={displayName} capacity={capacity} userId={accountId} />
    </CapacityGate>
  );
}
