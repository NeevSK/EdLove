import SchoolCreationScreen from '@repo/admin/screens/SchoolCreationScreen';
import { usePermissions } from '@repo/core/logic';
import { Redirect } from 'expo-router';

export default function SchoolCreationRoute() {
  const { context, can } = usePermissions();
  const capacity = context.activeBond?.capacity ?? context.primaryCapacity;
  const isAuthorized =
    capacity === 'founder' ||
    capacity === 'developer' ||
    capacity === 'admin' ||
    capacity === 'principal' ||
    can('create', 'School');

  if (!isAuthorized) {
    return <Redirect href="/workspace" />;
  }

  return <SchoolCreationScreen />;
}
