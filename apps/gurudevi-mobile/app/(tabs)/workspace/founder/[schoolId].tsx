import FounderSchoolDashboard from '@repo/admin/screens/FounderSchoolDashboard';
import { usePermissions } from '@repo/core/logic';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Redirect, useLocalSearchParams } from 'expo-router';

export { RouteErrorBoundary as ErrorBoundary };

export default function FounderSchoolRoute() {
  const { schoolId } = useLocalSearchParams<{ schoolId: string }>();
  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isFounder = capacity === 'founder' || capacity === 'developer' || capacity === 'admin';

  if (!isFounder) {
    return <Redirect href="/workspace" />;
  }

  return (
    <FounderSchoolDashboard
      schoolId={schoolId || 'default-school'}
      userId={context.userId || ''}
    />
  );
}
