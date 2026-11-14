import { View, Text, Pressable, ScrollView } from 'react-native';
import { useDomainFeature } from '@repo/core/logic';
import { AppHeader , WorldSkeleton } from '@repo/ui/components/native';
import SandboxBanner from '@repo/ui/components/SandboxBanner';

import type { PrincipalZoneId } from '@repo/admin/principal/workspace';

function ZoneButton({
  id,
  label,
  detail,
  count,
  isActive,
  onPress,
}: {
  id: PrincipalZoneId;
  label: string;
  detail: string;
  count: number;
  isActive: boolean;
  onPress: (zone: PrincipalZoneId) => void;
}) {
  return (
    <Pressable onPress={() => onPress(id)} className="flex-1 active:scale-95 transition-all">
      <View
        className={`p-4 rounded-3xl border min-h-[74px] shadow-sm ${isActive ? 'border-phase-interactive bg-phase-interactive/5' : 'border-phase-border bg-phase-surface'}`}
      >
        <View className="flex-row items-center justify-between items-center">
          <Text
            className={`text-[13px] font-black uppercase tracking-wider ${isActive ? 'text-phase-interactive' : 'text-phaseText-secondary'}`}
          >
            {label}
          </Text>
          <View
            className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-phase-interactive/10' : 'bg-phase-canvas'}`}
          >
            <Text
              className={`text-[10px] font-black ${isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}`}
            >
              {count}
            </Text>
          </View>
        </View>
        <Text
          className={`text-[11px] font-bold mt-2 ${isActive ? 'text-phase-interactive/60' : 'text-phaseText-muted'}`}
        >
          {detail}
        </Text>
      </View>
    </Pressable>
  );
}

interface PrincipalNativeDashboardShellProps {
  title: string;
  subtitle: string;
  showSandboxBanner?: boolean;
  activeZone: PrincipalZoneId;
  onZoneChange: (zone: PrincipalZoneId) => void;
  zoneCounts: Record<PrincipalZoneId, number>;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export function PrincipalNativeDashboardShell({
  title,
  subtitle,
  showSandboxBanner,
  activeZone,
  onZoneChange,
  zoneCounts,
  isLoading,
  error,
  children,
}: PrincipalNativeDashboardShellProps) {
  const { result: workspaceShellFeature } = useDomainFeature('workspace-shell');

  return (
    <>
      {showSandboxBanner ? <SandboxBanner /> : null}
      <AppHeader title={title} eyebrow={subtitle} />

      <View className="px-lg pb-md border-b border-phase-surface/10 bg-phase-world">
        <View className="flex-row items-center gap-1">
          <ZoneButton
            id="today"
            label="Today"
            detail="Awareness, approvals, and immediate coordination."
            count={zoneCounts.today}
            isActive={activeZone === 'today'}
            onPress={onZoneChange}
          />
          <ZoneButton
            id="institution"
            label="Institution"
            detail="Hierarchy, governance, and official school work."
            count={zoneCounts.institution}
            isActive={activeZone === 'institution'}
            onPress={onZoneChange}
          />
          <ZoneButton
            id="outlook"
            label="Outlook"
            detail="Signals, resource pressure, and future ERP families."
            count={zoneCounts.outlook}
            isActive={activeZone === 'outlook'}
            onPress={onZoneChange}
          />
        </View>
      </View>

      <ScrollView>
        <View className="gap-lg p-lg pb-[120px]">
          {error ? (
            <View className="p-md bg-phase-danger/10 rounded-xl border border-phase-danger">
              <Text className="text-phaseText-primary">{error}</Text>
            </View>
          ) : null}

          {isLoading ? (
            <View className="gap-md">
              <WorldSkeleton height={120} />
              <WorldSkeleton height={220} />
              <WorldSkeleton height={220} />
            </View>
          ) : workspaceShellFeature.permitted ? (
            children
          ) : (
            <View className="p-xl bg-phase-canvas rounded-3xl border border-dashed border-phase-border items-center justify-center min-h-[300px]">
              <Text className="text-phaseText-secondary font-bold text-center">
                Workspace is currently under development.
              </Text>
              <Text className="text-phaseText-muted text-[12px] mt-2 text-center">
                Stay tuned for updates on governance and institutional signals.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
