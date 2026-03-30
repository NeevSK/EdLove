import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, Heading, Text, Theme, VStack, useThemedColors } from '@repo/ui';
import { Building2, MessageSquare, NotebookPen, QrCode, Wind } from 'lucide-react-native';
import { ManagementStation, PrincipalGovernanceTimeline } from '../components';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView,
  type PrincipalZoneId,
} from '../principal/workspace';
import { PrincipalModuleAtlas } from '../components';

type PrincipalWorkspaceStats = {
  total_students?: number;
  total_teachers?: number;
  total_classrooms?: number;
  total_sections?: number;
} | null | undefined;

type PrincipalWorkspaceSurface = {
  id: PrincipalZoneId;
  eyebrow: string;
  title: string;
  copy: string;
  content: React.ReactNode;
};

type PrincipalWorkspaceShellArgs = {
  schoolId: string;
  principalId: string;
  stats?: PrincipalWorkspaceStats;
  navigatePrincipalView: (view: PrincipalWorkspaceView) => void;
  onOpenProfile: () => void;
  onOpenCommons: () => void;
  onOpenQr: () => void;
  onOpenBreathing: () => void;
  onEditSchool: () => void;
  renderTodayContent: () => React.ReactNode;
  renderOutlookContent: () => React.ReactNode;
};

function ZoneIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <VStack sx={{ gap: Theme.spacing.xs }}      <Text
        sx={{
          fontSize: 12,
          fontWeight: '800',
          color: Theme.colors.gurudeviViolet,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}
              {eyebrow}
      </Text      <Heading sx={{ fontSize: Theme.typography.fontSize.xl, color: Theme.colors.inkTruth }}>{title}</Heading      <Text sx={{ fontSize: 13, lineHeight: 20, color: Theme.colors.bark }}>{copy}</Text    </VStack  );
}

function SnapshotTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: Theme.colors.silk,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        padding: Theme.spacing.md,
      }}
          <Text sx={{ fontSize: 11, fontWeight: '700', color: Theme.colors.bark, textTransform: 'uppercase', letterSpacing: 0.6 }}        {label}
      </Text      <Text sx={{ fontSize: 24, fontWeight: '700', color: Theme.colors.inkTruth, marginTop: 6 }}        {value}
      </Text    </Box  );
}

function InstitutionLinks({
  onOpenProfile,
  onOpenCommons,
  onOpenQr,
  onOpenBreathing,
  onEditSchool,
}: {
  onOpenProfile: () => void;
  onOpenCommons: () => void;
  onOpenQr: () => void;
  onOpenBreathing: () => void;
  onEditSchool: () => void;
}) {
  const colors = useThemedColors();

  const LinkRow = ({
    icon: Icon,
    label,
    hint,
    onPress,
  }: {
    icon: any;
    label: string;
    hint: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}      <Box
        sx={{
          backgroundColor: Theme.colors.silk,
          borderRadius: Theme.corners.comfortable,
          borderWidth: 1,
          borderColor: colors.border,
          padding: Theme.spacing.md,
        }}
              <HStack sx={{ alignItems: 'center', gap: Theme.spacing.md }}          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: Theme.corners.medium,
              backgroundColor: `${Theme.colors.gurudeviBlue}18`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
                      <Icon size={18} color={Theme.colors.gurudeviBlue} /          </Box          <VStack sx={{ flex: 1 }}            <Text sx={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{label}</Text            <Text sx={{ fontSize: 11, color: colors.textSecondary }}>{hint}</Text          </VStack        </HStack      </Box    </TouchableOpacity  );

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}      <LinkRow icon={Building2} label="Institution profile" hint="Open the official school record." onPress={onOpenProfile} /      <LinkRow icon={MessageSquare} label="Community commons" hint="Step into the culture and mission layer." onPress={onOpenCommons} /      <LinkRow icon={QrCode} label="School QR" hint="Share the sanctuary entry point." onPress={onOpenQr} /      <LinkRow icon={Wind} label="Leadership breathing" hint="Reset before the next decision." onPress={onOpenBreathing} /      <LinkRow icon={NotebookPen} label="Edit school details" hint="Adjust name, handle, and institution basics." onPress={onEditSchool} /    </VStack  );
}

export function usePrincipalWorkspaceShell({
  schoolId,
  principalId,
  stats,
  navigatePrincipalView,
  onOpenProfile,
  onOpenCommons,
  onOpenQr,
  onOpenBreathing,
  onEditSchool,
  renderTodayContent,
  renderOutlookContent,
}: PrincipalWorkspaceShellArgs) {
  const zoneCounts = useMemo(
    () => ({
      today: getPrincipalCapabilitiesByZone('today', 'live').length,
      institution: getPrincipalCapabilitiesByZone('institution', 'live').length,
      outlook: getPrincipalCapabilitiesByZone('outlook').filter((capability) => capability.status !== 'hidden').length,
    }),
    [],
  );

  const surfaces = useMemo<Record<PrincipalZoneId, PrincipalWorkspaceSurface>>(
    () => ({
      today: {
        id: 'today',
        eyebrow: 'Today',
        title: 'Run the school day clearly',
        copy: 'See the current pulse, unblock pending operations, and keep the day steady without turning the dashboard into surveillance.',
        content: (
          <VStack sx={{ gap: Theme.spacing.lg }}            <ZoneIntro eyebrow="Today" title="Run the school day clearly" copy="See the current pulse, unblock pending operations, and keep the day steady without turning the dashboard into surveillance." /            {renderTodayContent()}
          </VStack        ),
      },
      institution: {
        id: 'institution',
        eyebrow: 'Institution',
        title: 'Shape the school as an institution',
        copy: 'Move from live coordination into hierarchy, invites, cycles, logbook work, and the official identity of the school.',
        content: (
          <VStack sx={{ gap: Theme.spacing.lg }}            <ZoneIntro eyebrow="Institution" title="Shape the school as an institution" copy="Move from live coordination into hierarchy, invites, cycles, logbook work, and the official identity of the school." /            <ManagementStation onAction={(view) => navigatePrincipalView(view as PrincipalWorkspaceView)} /            <VStack sx={{ gap: Theme.spacing.sm }}              <Text sx={{ fontSize: 16, fontWeight: '700', color: Theme.colors.inkTruth }}>School snapshot</Text              <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}                <SnapshotTile label="Students" value={stats?.total_students ?? 0} /                <SnapshotTile label="Teachers" value={stats?.total_teachers ?? 0} /                <SnapshotTile label="Classrooms" value={stats?.total_classrooms ?? 0} /                <SnapshotTile label="Sections" value={stats?.total_sections ?? 0} /              </HStack            </VStack            <InstitutionLinks
              onOpenProfile={onOpenProfile}
              onOpenCommons={onOpenCommons}
              onOpenQr={onOpenQr}
              onOpenBreathing={onOpenBreathing}
              onEditSchool={onEditSchool}
            /            <PrincipalGovernanceTimeline schoolId={schoolId} principalId={principalId} /          </VStack        ),
      },
      outlook: {
        id: 'outlook',
        eyebrow: 'Outlook',
        title: 'Read patterns and prepare what comes next',
        copy: 'Watch aggregated climate and resource pressure now, while giving future ERP families a modular home instead of crowding the main cockpit.',
        content: (
          <VStack sx={{ gap: Theme.spacing.lg }}            <ZoneIntro eyebrow="Outlook" title="Read patterns and prepare what comes next" copy="Watch aggregated climate and resource pressure now, while giving future ERP families a modular home instead of crowding the main cockpit." /            {renderOutlookContent()}
            <PrincipalModuleAtlas /          </VStack        ),
      },
    }),
    [schoolId, principalId, stats, navigatePrincipalView, onOpenProfile, onOpenCommons, onOpenQr, onOpenBreathing, onEditSchool, renderTodayContent, renderOutlookContent],
  );

  return {
    zoneCounts,
    surfaces,
  };
}
