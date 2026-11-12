import { createFileRoute } from '@tanstack/react-router';
import { WorkspaceFloor } from '../../../app/(sanctuary)/workspace/WorkspaceFloor';
import { useSession } from '../../surface/session';

export const Route = createFileRoute('/workspace/')({
  component: WorkspaceScreen,
});

function WorkspaceScreen() {
  const { surface, displayName, capacity } = useSession();
  return (
    <WorkspaceFloor
      displayName={displayName}
      capacity={capacity}
      mode={surface === 'explore' ? 'explore' : 'account'}
    />
  );
}
