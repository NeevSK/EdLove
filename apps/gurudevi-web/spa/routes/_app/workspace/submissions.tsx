import { createFileRoute } from '@tanstack/react-router';
import { SubmissionsFloor } from '../../../../app/(sanctuary)/workspace/submissions/SubmissionsFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/submissions')({
  component: WorkspaceSubmissionsScreen,
});

function WorkspaceSubmissionsScreen() {
  const { accountId, authSubjectId, capacity, displayName } = useSession();
  return (
    <SubmissionsFloor
      accountId={accountId}
      authSubjectId={authSubjectId}
      displayName={displayName}
      capacity={capacity}
    />
  );
}
