import { useTrackActiveSubTab } from '@/hooks/useTrackActiveSubTab';
import GuardianStudentDetailScreen from '@repo/admin/screens/GuardianStudentDetailScreen';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useLocalSearchParams } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function GuardianStudentDetailRoute() {
  const params = useLocalSearchParams<{ studentId?: string; studentName?: string }>();
  const title = params.studentName ? params.studentName.split(' ')[0] : 'Learner';

  useTrackActiveSubTab({
    id: `ws-guardian-student-${params.studentId || 'default'}`,
    title: `${title} Details`,
    route: '/workspace/guardian/[studentId]',
    params: { studentId: params.studentId || '', studentName: params.studentName || '' },
    domain: 'workspace',
  });

  return <GuardianStudentDetailScreen />;
}
