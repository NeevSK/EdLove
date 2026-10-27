import FounderDashboard from '@repo/admin/screens/FounderDashboard';
import { usePermissions } from '@repo/core/logic';
import { Redirect } from 'expo-router';

export default function FounderRoute() {
  const { context } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isFounder = capacity === 'founder' || capacity === 'developer' || capacity === 'admin';

  if (!isFounder) {
    return <Redirect href="/workspace" />;
  }

  return <FounderDashboard />;
}
