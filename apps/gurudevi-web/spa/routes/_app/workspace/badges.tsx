import { createFileRoute } from '@tanstack/react-router';
import { BadgeSheetFloor } from '../../../../app/(sanctuary)/workspace/badges/BadgeSheetFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';
import { CapacityGate } from '../../../surface/CapacityGate';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/badges')({
  component: WorkspaceBadgesScreen,
});

function WorkspaceBadgesScreen() {
  const { accountId, activeScope, surface } = useSession();
  return (
    <CapacityGate
      allows={staff}
      detail="Batch credential card and QR badge printing is reserved for educators and administrators."
    >
      <BadgeSheetFloor
        key={accountId}
        mode={surface === 'explore' ? 'explore' : 'account'}
        subjectId={accountId}
        scope={activeScope}
      />
    </CapacityGate>
  );
}
