import { createFileRoute } from '@tanstack/react-router';
import { WorkforceFloor } from '../../../../app/(sanctuary)/workspace/workforce/WorkforceFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';
import { CapacityGate } from '../../../surface/CapacityGate';

export const Route = createFileRoute('/_app/workspace/workforce')({
  component: WorkspaceWorkforceScreen,
});

function WorkspaceWorkforceScreen() {
  return (
    <CapacityGate
      allows={staff}
      detail="Workforce directory and leave management are restricted to faculty members and school administrators."
    >
      <WorkforceFloor />
    </CapacityGate>
  );
}
