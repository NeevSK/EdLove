import { createFileRoute } from '@tanstack/react-router';
import { WorkforceFloor } from '../../../../app/(sanctuary)/workspace/workforce/WorkforceFloor';

export const Route = createFileRoute('/_app/workspace/workforce')({
  component: WorkspaceWorkforceScreen,
});

function WorkspaceWorkforceScreen() {
  return <WorkforceFloor />;
}
