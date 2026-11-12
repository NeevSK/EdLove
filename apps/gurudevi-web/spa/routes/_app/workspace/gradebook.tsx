import { createFileRoute } from '@tanstack/react-router';
import { GradebookFloor } from '../../../../app/(sanctuary)/workspace/gradebook/GradebookFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/gradebook')({
  component: WorkspaceGradebookScreen,
});

function WorkspaceGradebookScreen() {
  const { capacity, displayName } = useSession();
  return <GradebookFloor displayName={displayName} capacity={capacity} />;
}
