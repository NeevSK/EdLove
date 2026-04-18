import React from 'react';
import { TouchableOpacity } from 'react-native';
import {
  Box,
  GlobalHeader,
  HStack,
  SandboxBanner,
  ScrollView,
  SkeletonCard,
  Text,
  
  VStack,
  useTheme} from '@repo/ui';
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
    <TouchableOpacity onPress={() => onPress(id)} activeOpacity={0.85} style={{ flex: 1 }}>
      <Box
        className={`p-sm rounded-xl border min-h-[74px] ${ isActive ? 'border-gurudeviBlue bg-gurudeviBlue/10' : 'border-phase-interactive/10 bg-phase-canvas' }`}
      >
        <HStack className="justify-between items-center">
          <Text className="text-[13px] font-bold text-phaseText-primary">
            {label}
          </Text>
          <Box
            className={`px-2 py-0.5 rounded-full ${ isActive ? 'bg-gurudeviBlue/20' : 'bg-phase-interactive/5' }`}
          >
            <Text
              className={`text-[10px] font-extrabold ${ isActive ? 'text-gurudeviBlue' : 'text-phaseText-secondary' }`}
            >
              {count}
            </Text>
          </Box>
        </HStack>
        <Text className="text-[11px] leading-4 text-phaseText-secondary mt-1.5">
          {detail}
        </Text>
      </Box>
    </TouchableOpacity>
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
