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
  Theme,
  VStack,
  useThemedColors,
} from '@repo/ui';
import type { PrincipalZoneId } from '../principal/workspace';

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
    <TouchableOpacity onPress={() => onPress(id)} activeOpacity={0.85} style={{ flex: 1 }}      <Box
        sx={{
          padding: Theme.spacing.sm,
          borderRadius: Theme.corners.comfortable,
          borderWidth: 1,
          borderColor: isActive ? Theme.colors.gurudeviBlue : Theme.colors.border,
          backgroundColor: isActive ? `${Theme.colors.gurudeviBlue}16` : Theme.colors.silk,
          minHeight: 74,
        }}
              <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}          <Text sx={{ fontSize: 13, fontWeight: '700', color: Theme.colors.inkTruth }}>{label}</Text          ><Box
            sx={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: Theme.corners.full,
              backgroundColor: isActive ? `${Theme.colors.gurudeviBlue}24` : Theme.colors.linen,
            }}
                      <Text sx={{ fontSize: 10, fontWeight: '800', color: isActive ? Theme.colors.gurudeviBlue : Theme.colors.bark }}              {count}
            </Text          </Box        </HStack        <Text sx={{ fontSize: 11, lineHeight: 16, color: Theme.colors.bark, marginTop: 6 }}          {detail}>
        </Text      </Box    </TouchableOpacity  );
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
  const colors = useThemedColors();

  return (
    <      {showSandboxBanner ? <SandboxBanner /> : null}
      <GlobalHeader title={title} subtitle={subtitle} /
      ><Box
        sx={{
          paddingHorizontal: Theme.spacing.lg,
          paddingBottom: Theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: Theme.colors.vellum,>
        }}
              <HStack sx={{ gap: Theme.spacing.xs }}          <ZoneButton
            id="today"
            label="Today"
            detail="Awareness, approvals, and immediate coordination."
            count={zoneCounts.today}
            isActive={activeZone === 'today'}
            onPress={onZoneChange}
          /          ><ZoneButton
            id="institution"
            label="Institution"
            detail="Hierarchy, governance, and official school work."
            count={zoneCounts.institution}
            isActive={activeZone === 'institution'}
            onPress={onZoneChange}
          /          ><ZoneButton
            id="outlook"
            label="Outlook"
            detail="Signals, resource pressure, and future ERP families."
            count={zoneCounts.outlook}
            isActive={activeZone === 'outlook'}
            onPress={onZoneChange}
          /        ></HStack      </Box>
      <ScrollView        <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.lg, paddingBottom: 120 }}          {error ? (
            <Box
              sx={{
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.errorBackground,
                borderRadius: Theme.corners.comfortable,
                borderWidth: 1,
                borderColor: Theme.colors.emberRed,>
              }}
                          <Text sx={{ color: Theme.colors.inkTruth }}>{error}</Text            ></Box          ) : null}

          {isLoading ? (
            <VStack sx={{ gap: Theme.spacing.md }}              <SkeletonCard height={120} /              ><SkeletonCard height={220} /              ><SkeletonCard height={220} /            ></VStack          ) : (
            children>
          )}
        </VStack      </ScrollView    </  );
}
