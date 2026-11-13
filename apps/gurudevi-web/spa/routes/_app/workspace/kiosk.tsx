import { createFileRoute } from '@tanstack/react-router';
import { KioskFloor } from '../../../../app/(sanctuary)/workspace/kiosk/KioskFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/workspace/kiosk')({
  head: () => ({ meta: [{ title: 'Doorway Ingress Kiosk | Gurudevi Sanctuary' }] }),
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
