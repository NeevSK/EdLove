import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { BadgeSheetFloor } from '../../../../app/(sanctuary)/workspace/badges/BadgeSheetFloor';
import { staff } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/badges')({
  ...forAudience(
    staff,
    'Batch credential card and QR badge printing is reserved for educators and administrators.',
  ),
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
