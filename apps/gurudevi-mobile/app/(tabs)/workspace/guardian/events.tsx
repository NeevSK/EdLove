import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import GuardianEventsScreen from '@repo/admin/screens/GuardianEventsScreen';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function GuardianEventsRoute() {
  useTrackActiveSubTab({
    id: 'ws-guardian-events',
    title: 'School Calendar',
    route: '/workspace/guardian/events',
    domain: 'workspace',
  });

  return <GuardianEventsScreen />;
}
