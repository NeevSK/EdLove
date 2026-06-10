import { Box, Text, VStack } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useAdminWorkspaceSnapshot } from '../admin/adminRepository';
import { AdminRoomPanel, AdminRoomShell } from './AdminRoomShell';

export default function AdminJobControl() {
  const router = useRouter();
  const { snapshot: data } = useAdminWorkspaceSnapshot();

  if (!data) {
    return null;
  }

  return (
    <AdminRoomShell
      eyebrow="Job control"
      title="Guarded operator actions"
      description="Approve, retry, resync, or schedule remediation tasks with explicit operator intent and a clear audit trail."
      caution="Do not mutate tenant state casually here. Prefer preview, confirm, and then execute only when the scope is understood."
      onBack={() => router.back()}
      stats={[
        {
          label: 'Approvals',
          value: data.pendingApprovalCount,
          hint: 'Pending guarded responses',
        },
        {
          label: 'Inventory',
          value: data.inventoryRequestCount,
          hint: 'Remediation-adjacent work',
        },
        {
          label: 'Signals',
          value: data.recentIncidentSignals.length,
          hint: 'Queue pressure',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Action posture"
          description="Use this room as a queue of operator decisions, not as an automatic executor."
        >
          <VStack className="gap-3">
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">Preview first</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                Every high-impact action should explain what will change, who it affects, and how to
                roll it back.
              </Text>
            </Box>
            <Box className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3">
              <Text className="text-[13px] font-bold text-phaseText-primary">Retry and repair</Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                Guarded retries are fine when the platform is transiently unhealthy, but avoid blind
                repeated execution.
              </Text>
            </Box>
          </VStack>
        </AdminRoomPanel>
      </VStack>
    </AdminRoomShell>
  );
}
