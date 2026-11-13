import { createFileRoute } from '@tanstack/react-router';
import { FounderFloor } from '../../../../app/(sanctuary)/admin/founder/FounderFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/founder')({
  component: AdminFounderScreen,
});

function AdminFounderScreen() {
  const { accountId, capacity, displayName } = useSession();
  return <FounderFloor displayName={displayName} capacity={capacity} userId={accountId} />;
}
