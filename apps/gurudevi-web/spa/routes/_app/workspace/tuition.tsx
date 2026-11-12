import { createFileRoute } from '@tanstack/react-router';
import { TuitionFloor } from '../../../../app/(sanctuary)/workspace/tuition/TuitionFloor';
import { leadershipOrGuardian } from '../../../../lib/sanctuary/capacityAccess';
import { CapacityGate } from '../../../surface/CapacityGate';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/tuition')({
  component: WorkspaceTuitionScreen,
});

function WorkspaceTuitionScreen() {
  const { capacity, displayName } = useSession();
  return (
    <CapacityGate
      allows={leadershipOrGuardian}
      detail="Tuition and institutional fee ledgers are restricted to school leadership and verified guardians."
    >
      <TuitionFloor displayName={displayName} capacity={capacity} />
    </CapacityGate>
  );
}
