import GuardianDashboard from '@repo/admin/screens/GuardianDashboard';
import { usePermissions } from '@repo/core/logic';
import { Redirect } from 'expo-router';

export default function GuardianRoute() {
  const { context, can } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isGuardianAuthorized =
    capacity === 'guardian' ||
    capacity === 'parent' ||
    capacity === 'founder' ||
    capacity === 'developer' ||
    can('read', 'GuardianDashboard');

  if (!isGuardianAuthorized) {
    return <Redirect href="/workspace" />;
  }

  return <GuardianDashboard />;
}
