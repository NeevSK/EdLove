import { createFileRoute } from '@tanstack/react-router';
import { PrincipalFloor } from '../../../../app/(sanctuary)/admin/principal/PrincipalFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/principal')({
  head: () => ({ meta: [{ title: 'Principal Command Center | Gurudevi Sanctuary' }] }),
  component: AdminPrincipalScreen,
});

function AdminPrincipalScreen() {
  const { displayName, surface } = useSession();
  return <PrincipalFloor displayName={displayName} isExplore={surface === 'explore'} />;
}
