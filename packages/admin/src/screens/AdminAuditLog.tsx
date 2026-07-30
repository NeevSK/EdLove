import { Box, Text, VStack } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { getAdminAuditEntries } from '@repo/admin/admin/adminControl';
import { AdminRoomPanel, AdminRoomShell } from '@repo/admin/screens/AdminRoomShell';

export default function AdminAuditLog() {
  const router = useRouter();
  const entries = getAdminAuditEntries();

  return (
    <AdminRoomShell
      eyebrow="Audit trail"
      title="Accountability log"
      description="Review recent operator context, approvals, and cross-tenant signals so every action stays attributable."
      caution="This room is about accountability. If a change cannot be explained in the log, it should not be shipped."
      onBack={() => safeBack('/workspace')}
      stats={[
        {
          label: 'Entries',
          value: entries.length,
          hint: 'Persisted operator events',
        },
        {
          label: 'Queued',
          value: entries.filter((entry) => entry.status === 'queued').length,
          hint: 'Awaiting review or follow-up',
        },
      ]}
    >
      <VStack className="gap-4">
        <AdminRoomPanel
          title="Recent observations"
          description="The audit trail should read like a durable operator memory, not a debug dump."
        >
          <VStack className="gap-3">
            {entries.length === 0 ? (
              <Text className="text-[13px] text-phaseText-secondary">
                No admin audit entries are persisted yet.
              </Text>
            ) : (
              entries.map((item) => (
                <Box
                  key={item.id}
                  className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
                >
                  <Text className="text-[13px] font-bold text-phaseText-primary">{item.name}</Text>
                  <Text className="mt-1 text-[12px] text-phaseText-secondary">{item.summary}</Text>
                  <Text className="mt-2 text-[11px] text-phaseText-secondary">
                    {item.scope} • {item.status} • {new Date(item.updatedAt).toLocaleString()}
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
