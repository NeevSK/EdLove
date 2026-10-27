import AdminDashboard from '@repo/admin/screens/AdminDashboard';
import { usePermissions } from '@repo/core/logic';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Center } from '@repo/ui/primitives';
import { Redirect } from 'expo-router';

export default function AdminRoute() {
  const { context, can } = usePermissions();
  const loading = useCedarDecisionStore((state: any) => state.isLoading);

  if (loading) {
    return (
      <Center className="flex-1 bg-phase-canvas">
        <BrandPulse size={32} accessibilityLabel="Loading workspace" />
      </Center>
    );
  }

  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isAdminAuthorized =
    capacity === 'admin' ||
    capacity === 'founder' ||
    capacity === 'developer' ||
    can('read', 'AdminDashboard') ||
    can('manage', 'AdminDashboard');

  if (!isAdminAuthorized) {
    return <Redirect href="/workspace" />;
  }

  const userId = context.userId || null;
  return <AdminDashboard userId={userId} />;
}
