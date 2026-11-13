import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { KioskFloor } from '../../../../app/(sanctuary)/workspace/kiosk/KioskFloor';
import { leadership } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/kiosk')({
  ...forAudience(
    leadership,
    'The doorway ingress kiosk station is restricted to institutional administrators and school leadership.',
  ),
  component: WorkspaceKioskScreen,
});

function WorkspaceKioskScreen() {
  const { accountId, activeScope, surface } = useSession();
  return (
    <KioskFloor
      key={accountId}
      mode={surface === 'explore' ? 'explore' : 'account'}
      subjectId={accountId}
      scope={activeScope}
    />
  );
}
