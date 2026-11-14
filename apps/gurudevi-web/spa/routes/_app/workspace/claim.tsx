import { createFileRoute } from '@tanstack/react-router';
import { ClaimSpotFloor } from '../../../../app/(sanctuary)/workspace/claim/ClaimSpotFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/claim')({
  head: () => ({ meta: [{ title: 'Claim My Student Spot | Gurudevi Sanctuary' }] }),
  component: WorkspaceClaimScreen,
});

function WorkspaceClaimScreen() {
  const { accountId, activeScope, surface } = useSession();
  return (
    <ClaimSpotFloor
      key={accountId}
      mode={surface === 'explore' ? 'explore' : 'account'}
      subjectId={accountId}
      scope={activeScope}
    />
  );
}
