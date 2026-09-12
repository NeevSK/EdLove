import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import GuardianStudentsScreen from '@repo/admin/screens/GuardianStudentsScreen';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';

export { RouteErrorBoundary as ErrorBoundary };

export default function GuardianStudentsRoute() {
  useTrackActiveSubTab({
    id: 'ws-guardian-students',
    title: 'Learner Room',
    route: '/workspace/guardian/students',
    domain: 'workspace',
  });

  return <GuardianStudentsScreen />;
}
