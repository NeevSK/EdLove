import { 
  Box,
  GlobalHeader,
  HStack,
  SandboxBanner,
  ScrollView,
  SkeletonCard,
  Text,
  VStack,
  useTheme,
  Pressable
} from '@repo/ui';
import { FeatureGuard } from '@repo/core';
import type { PrincipalZoneId } from '../principal/workspace';

function ZoneButton({
  id,
  label,
  detail,
  count,
  isActive,
  onPress}: {
  id: PrincipalZoneId;
  label: string;
  detail: string;
  count: number;
  isActive: boolean;
  onPress: (zone: PrincipalZoneId) => void;
}) {
  return (
    <Pressable onPress={() => onPress(id)} className="flex-1 active:scale-95 transition-all">
      <Box
        className={`p-4 rounded-3xl border min-h-[74px] shadow-sm ${ isActive ? 'border-phase-interactive bg-phase-interactive/5' : 'border-phase-border bg-phase-surface' }`}
      >
        <HStack className="justify-between items-center">
          <Text className={`text-[13px] font-black uppercase tracking-wider ${isActive ? 'text-phase-interactive' : 'text-phaseText-secondary'}`}>
            {label}
          </Text>
          <Box
            className={`px-2 py-0.5 rounded-full ${ isActive ? 'bg-phase-interactive/10' : 'bg-phase-canvas' }`}
          >
            <Text
              className={`text-[10px] font-black ${ isActive ? 'text-phase-interactive' : 'text-phaseText-muted' }`}
            >
              {count}
            </Text>
          </Box>
        </HStack>
        <Text className={`text-[11px] font-bold mt-2 ${isActive ? 'text-phase-interactive/60' : 'text-phaseText-muted'}`}>
          {detail}
        </Text>
      </Box>
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
  children}: PrincipalNativeDashboardShellProps) {
  // We use NativeWind for styling, so theme hook is removed as it's legacy.

  return (
    <>
      {showSandboxBanner ? <SandboxBanner /> : null}
      <GlobalHeader title={title} subtitle={subtitle} />

      <Box
        className="px-lg pb-md border-b border-phase-surface/10 bg-phase-world"
      >
        <HStack className="gap-1">
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
        </HStack>
      </Box>

      <ScrollView>
        <VStack className="gap-lg p-lg pb-[120px]">
          {error ? (
            <Box
              className="p-md bg-phase-danger/10 rounded-xl border border-phase-danger"
            >
              <Text className="text-phaseText-primary">{error}</Text>
            </Box>
          ) : null}

          {isLoading ? (
            <VStack className="gap-md">
              <SkeletonCard height={120} />
              <SkeletonCard height={220} />
              <SkeletonCard height={220} />
            </VStack>
          ) : (
            <FeatureGuard 
              feature="isDevelopingWorkspace" 
              fallback={
                <Box className="p-xl bg-phase-canvas rounded-3xl border border-dashed border-phase-border items-center justify-center min-h-[300px]">
                  <Text className="text-phaseText-secondary font-bold text-center">
                    Workspace is currently under development.
                  </Text>
                  <Text className="text-phaseText-muted text-[12px] mt-2 text-center">
                    Stay tuned for updates on governance and institutional signals.
                  </Text>
                </Box>
              }
            >
              {children}
            </FeatureGuard>
          )}
        </VStack>
      </ScrollView>
    </>
  );
}
