import { createFileRoute } from '@tanstack/react-router';
import { GuardianFloor } from '../../../../app/(sanctuary)/workspace/guardian/GuardianFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/guardian')({
  component: WorkspaceGuardianScreen,
});

function WorkspaceGuardianScreen() {
  const { displayName, surface } = useSession();
  return <GuardianFloor displayName={displayName} isExplore={surface === 'explore'} />;
}
