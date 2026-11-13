import { forAudience } from '../../../surface/audience';
import { createFileRoute } from '@tanstack/react-router';
import { FounderFloor } from '../../../../app/(sanctuary)/admin/founder/FounderFloor';
import { steward } from '../../../../lib/sanctuary/capacityAccess';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/founder')({
  ...forAudience(
    steward,
    'Founder command is restricted to sovereign platform stewards (Founders, Co-Founders, and Executive Directors).',
  ),
  component: AdminFounderScreen,
});

function AdminFounderScreen() {
  const { accountId, capacity, displayName } = useSession();
  return <FounderFloor displayName={displayName} capacity={capacity} userId={accountId} />;
}
