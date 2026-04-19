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
    <Pressable onPress={() => onPress(id)} className="flex-1 active:scale-95">
      <Box
        className={`p-4 rounded-3xl border min-h-[74px] shadow-sm ${ isActive ? 'border-action bg-action/5' : 'border-border bg-white' }`}
      >
        <HStack className="justify-between items-center">
          <Text className={`text-[13px] font-black uppercase tracking-wider ${isActive ? 'text-action' : 'text-ink/60'}`}>
            {label}
          </Text>
          <Box
            className={`px-2 py-0.5 rounded-full ${ isActive ? 'bg-action/10' : 'bg-ink/5' }`}
          >
            <Text
              className={`text-[10px] font-black ${ isActive ? 'text-action' : 'text-ink/40' }`}
            >
              {count}
            </Text>
          </Box>
        </HStack>
        <Text className="text-[11px] font-bold text-ink/40 mt-2">
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
  const theme = useTheme();
  // We use NativeWind for styling, so 'colors' might be unused here but safe to keep if needed later.

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
            children
          )}
        </VStack>
      </ScrollView>
    </>
  );
}
