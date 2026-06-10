import { Text, VStack } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useAdminWorkspaceSnapshot } from '../admin/adminRepository';
import { AdminRoomPanel, AdminRoomShell } from './AdminRoomShell';

export default function AdminTenantDetail() {
  const { snapshot: data } = useAdminWorkspaceSnapshot();
  const router = useRouter();
  if (!data) return null;
  const tenant = data.recentSchools[0];

  return (
    <AdminRoomShell
      eyebrow="Tenant detail"
      title="Tenant directory drill-in"
      description="Inspect a single tenant in context, with enough detail to support maintenance, customer care, and controlled fixes."
      caution="Cross-tenant admin access should be used to maintain the platform, not to impersonate tenant operators."
      onBack={() => router.back()}
      stats={[
        {
          label: 'Known tenants',
          value: data.schoolCount,
          hint: 'Directory scope',
        },
        {
          label: 'Users',
          value: data.userCount,
          hint: 'Platform-wide population',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Latest tenant"
          description="This view should eventually accept a tenant picker. For now it opens on the most recent tenant snapshot."
        >
          {tenant ? (
            <VStack className="gap-1">
              <Text className="text-[16px] font-bold text-phaseText-primary">
                {tenant.name ?? tenant.id}
              </Text>
              <Text className="text-[12px] text-phaseText-secondary">
                Created{' '}
                {tenant.created_at ? new Date(tenant.created_at).toLocaleString() : 'recently'}.
              </Text>
            </VStack>
          ) : (
            <Text className="text-[13px] text-phaseText-secondary">
              No tenant records surfaced in this snapshot.
            </Text>
          )}
        </AdminRoomPanel>
      </VStack>
    </AdminRoomShell>
  );
}
