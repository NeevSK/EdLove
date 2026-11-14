import { usePerspectiveSwitch } from '@repo/core/logic';
import type { CommercialPerspective } from '@repo/core/types/Perspective';
import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { EmptyState, Grid, Icon, Surface, Text } from '@repo/ui/components/native';
import { CircleCheck, FileText, QrCode, Send, TrendingUp, Users } from '@repo/ui/icons';
import type { KitIconProps } from '@repo/ui/theme';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useLocalSearchParams } from 'expo-router';
import { type ComponentType, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { RoomPage } from '@/components/shell/RoomPage';

export { RouteErrorBoundary as ErrorBoundary };

const icon = (c: unknown) => c as ComponentType<KitIconProps>;

const ACTIONS = [
  {
    label: 'Card Scan Entry',
    note: 'Barcode / QR Check',
    a11y: 'Scan Student Admission Cards',
    icon: icon(QrCode),
  },
  {
    label: 'Paper Marks',
    note: 'Rank & Score Sheets',
    a11y: 'Paper Mark Entry',
    icon: icon(FileText),
  },
  { label: 'SMS Broadcast', note: 'Parent Notices', a11y: 'SMS Broadcast', icon: icon(Send) },
] as const;

const METRICS = [
  { label: 'Enrolled Students', value: '248', icon: icon(Users) },
  { label: "Today's Attendance", value: '92%', icon: icon(CircleCheck) },
  { label: 'Monthly Fees Paid', value: '88%', icon: icon(TrendingUp) },
] as const;

export default function CommercialBatchScreen() {
  const { batchId } = useLocalSearchParams<{ batchId?: string }>();
  const { activePerspective, availablePerspectives, getPerspectiveStorage } =
    usePerspectiveSwitch();

  const commercialBatch = useMemo(() => {
    if (activePerspective.kind === 'commercial') {
      return activePerspective as CommercialPerspective;
    }
    const found = availablePerspectives.find(
      (p) =>
        p.kind === 'commercial' &&
        (p.id === batchId || (p as CommercialPerspective).batchId === batchId),
    );
    return (found as CommercialPerspective) || null;
  }, [activePerspective, availablePerspectives, batchId]);

  // Sandboxed storage partition for this specific commercial batch (e.g. attendance drafts, marks caches)
  const batchStorage = useMemo(() => {
    return getPerspectiveStorage(commercialBatch?.id || batchId);
  }, [batchId, commercialBatch?.id, getPerspectiveStorage]);

  if (!commercialBatch) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <EmptyState
          title="Batch Workspace Not Found"
          message="Please select an active commercial tuition batch from the perspective switcher."
        />
      </View>
    );
  }

  const roleTitle = commercialBatch.role?.replace('_', ' ').toUpperCase() || 'LEAD TUTOR';

  return (
    <RoomPage
      title={commercialBatch.displayTitle || commercialBatch.displayName}
      intro={`${commercialBatch.instituteName} · ${commercialBatch.batchName} · ${commercialBatch.grade} (${commercialBatch.medium?.toUpperCase()})`}
      mark={{ label: roleTitle, tone: 'lamp' }}
    >
      <View style={{ gap: 10 }}>
        <Text kind="label" tone="soft">
          Operational Actions
        </Text>
        <Grid min="sm" max={3} gap="inside">
          {ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.a11y}
              onPress={() => hapticLight()}
            >
              <Surface tone="raised" style={{ padding: 14, gap: 6, minHeight: 104 }}>
                <Icon icon={action.icon} tone="lamp" />
                <Text kind="label">{action.label}</Text>
                <Text kind="caption" tone="soft">
                  {action.note}
                </Text>
              </Surface>
            </Pressable>
          ))}
        </Grid>
      </View>

      <View style={{ gap: 10 }}>
        <Text kind="label" tone="soft">
          Batch Summary
        </Text>
        <Grid min="sm" max={3} gap="inside">
          {METRICS.map((metric) => (
            <Surface key={metric.label} tone="inset" style={{ padding: 14, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon icon={metric.icon} size="sm" tone="soft" />
                <Text kind="caption" tone="soft" style={{ flexShrink: 1 }}>
                  {metric.label}
                </Text>
              </View>
              <Text kind="value">{metric.value}</Text>
            </Surface>
          ))}
        </Grid>
      </View>
    </RoomPage>
  );
}
