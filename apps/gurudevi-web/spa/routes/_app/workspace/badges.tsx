import { createFileRoute } from '@tanstack/react-router';
import { BadgeSheetFloor } from '../../../../app/(sanctuary)/workspace/badges/BadgeSheetFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/badges')({
  component: WorkspaceBadgesScreen,
});

function WorkspaceBadgesScreen() {
  const { accountId, activeScope, surface } = useSession();
  return (
    <BadgeSheetFloor
      key={accountId}
      mode={surface === 'explore' ? 'explore' : 'account'}
      subjectId={accountId}
      scope={activeScope}
    />
  );
}
