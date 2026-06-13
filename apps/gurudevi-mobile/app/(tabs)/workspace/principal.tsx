import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import { usePermissionStore } from '@repo/core';
import { usePermissions } from '@repo/core/logic';
import { Center, Spinner } from '@repo/ui/primitives';

export default function PrincipalRoute() {
  const { context } = usePermissions();
  const loading = usePermissionStore((state: any) => state.isLoading);

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <Spinner />
      </Center>
    );
  }

  const schoolId = context.schoolId || 'demo-school';
  const userId = context.userId || '';

  return <PrincipalDashboard schoolId={schoolId} userId={userId} />;
}
