import { createFileRoute } from '@tanstack/react-router';
import { EnhancedAnalyticsFloor } from '../../../../app/(sanctuary)/admin/analytics/EnhancedAnalyticsFloor';
import { useSession } from '../../../surface/session';

export const Route = createFileRoute('/_app/admin/analytics')({
  component: AdminAnalyticsScreen,
});

function AdminAnalyticsScreen() {
  const { capacity, displayName } = useSession();
  return <EnhancedAnalyticsFloor displayName={displayName} capacity={capacity} />;
}
