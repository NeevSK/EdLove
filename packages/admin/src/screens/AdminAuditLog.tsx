import { View, Text } from 'react-native';
import { getAdminAuditEntries } from '@repo/admin/admin/adminControl';
import { AdminRoomPanel, AdminRoomShell } from '@repo/admin/screens/AdminRoomShell';
import { useNavigator } from '@repo/ui/components/native/navigation';

export default function AdminAuditLog({ onBack }: { onBack?: () => void } = {}) {
  const router = useNavigator();
  const entries = getAdminAuditEntries();

  return (
    <AdminRoomShell
      eyebrow="Audit trail"
      title="Accountability log"
      description="Review recent operator context, approvals, and cross-tenant signals so every action stays attributable."
      caution="This room is about accountability. If a change cannot be explained in the log, it should not be shipped."
      onBack={() => (onBack ? onBack() : router.back('/workspace'))}
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
      <View className="gap-4">
        <AdminRoomPanel
          title="Recent observations"
          description="The audit trail should read like a durable operator memory, not a debug dump."
        >
          <View className="gap-3">
            {entries.length === 0 ? (
              <Text className="text-[13px] text-phaseText-secondary">
                No admin audit entries are persisted yet.
              </Text>
            ) : (
              entries.map((item) => (
                <View
                  key={item.id}
                  className="rounded-2xl border border-starlightGray/15 bg-silk px-4 py-3"
                >
                  <Text className="text-[13px] font-bold text-phaseText-primary">{item.name}</Text>
                  <Text className="mt-1 text-[12px] text-phaseText-secondary">{item.summary}</Text>
                  <Text className="mt-2 text-[11px] text-phaseText-secondary">
                    {item.scope} • {item.status} • {new Date(item.updatedAt).toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </AdminRoomPanel>
      </View>
    </AdminRoomShell>
  );
}
