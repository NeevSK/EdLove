import { Box, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { useAdminWorkspaceSnapshot } from '@repo/admin/admin/adminRepository';
import { AdminRoomPanel, AdminRoomShell } from '@repo/admin/screens/AdminRoomShell';

export default function AdminIncidentQueue({ onBack }: { onBack?: () => void } = {}) {
  const { snapshot: data } = useAdminWorkspaceSnapshot();
  const router = useRouter();

  if (!data) return null;

  return (
    <AdminRoomShell
      eyebrow="Incident control"
      title="Incident queue"
      description="Triage cross-tenant incidents, regressions, and operational noise with a monitor-first stance and explicit handoff."
      caution="Keep this room read-first until the incident is validated. Escalations should preserve a clear audit trail and a named tenant scope."
      onBack={() => (onBack ? onBack() : safeBack('/workspace'))}
      stats={[
        {
          label: 'Open incidents',
          value: data.incidentCount,
          hint: 'Pending operational items',
        },
        {
          label: 'Recent signals',
          value: data.recentIncidentSignals.length,
          hint: 'Fresh queue volume',
        },
        {
          label: 'Approvals',
          value: data.pendingApprovalCount,
          hint: 'Guarded responses queued',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Recent signals"
          description="The queue below favors recent operational signals over historical noise."
        >
          <VStack className="gap-3">
            {data.recentIncidentSignals.length === 0 ? (
              <Text className="text-[13px] text-phaseText-secondary">
                No incident signals surfaced in this snapshot.
              </Text>
            ) : (
              data.recentIncidentSignals.slice(0, 5).map((item) => (
                <Box
                  key={item.id}
                  className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
                >
                  <Text className="text-[13px] font-bold text-phaseText-primary">{item.title}</Text>
                  <Text className="mt-1 text-[11px] text-phaseText-secondary">
                    {item.schoolId} | {item.status} | {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </Box>
              ))
            )}
          </VStack>
        </AdminRoomPanel>
      </VStack>
    </AdminRoomShell>
  );
}
