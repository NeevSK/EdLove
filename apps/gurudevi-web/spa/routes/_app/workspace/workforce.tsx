import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { WorkforceFloor } from '../../../../app/(sanctuary)/workspace/workforce/WorkforceFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';

export const Route = createFileRoute('/_app/workspace/workforce')({
  ...forAudience(
    staff,
    'Workforce directory and leave management are restricted to faculty members and school administrators.',
  ),
  component: WorkspaceWorkforceScreen,
});

function WorkspaceWorkforceScreen() {
  return <WorkforceFloor />;
}
