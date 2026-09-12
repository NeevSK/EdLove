import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import GuardianNotificationsScreen from '@repo/admin/screens/GuardianNotificationsScreen';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function GuardianNotificationsRoute() {
  useTrackActiveSubTab({
    id: 'ws-guardian-notifications',
    title: 'Notices',
    route: '/workspace/guardian/notifications',
    domain: 'workspace',
  });

  return <GuardianNotificationsScreen />;
}
