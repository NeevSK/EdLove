import { Building2, MessageSquare, NotebookPen, QrCode, Wind } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Pressable,
  ScrollView,
  Text,
  useTheme,
  VStack,
} from '@repo/ui/primitives';

import type React from 'react';
import { useMemo } from 'react';
import {
  ManagementStation,
  PrincipalGovernanceTimeline,
  PrincipalModuleAtlas,
} from '../components';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView,
  type PrincipalZoneId,
} from '../principal/workspace';

type PrincipalWorkspaceStats =
  | {
      total_students?: number;
      total_teachers?: number;
      total_classrooms?: number;
      total_sections?: number;
    }
  | null
  | undefined;

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

function ZoneIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <VStack className="gap-2">
      <Text className="text-[12px] font-black uppercase text-phase-interactive tracking-widest">
        {eyebrow}
      </Text>
      <Heading className="text-2xl font-black text-phaseText-primary">{title}</Heading>
      <Text className="text-[13px] leading-relaxed text-phaseText-secondary">{copy}</Text>
    </VStack>
  );
}

export const PrincipalWorkspaceShell: React.FC<any> = ({
  activeView,
  onViewChange,
  children,
  isLoading,
}) => {
  return (
    <Box className="flex-1 bg-phase-canvas">
      <ScrollView className="flex-1">
        <VStack className="p-6 gap-8">
          <VStack className="gap-2">
            <Heading className="text-3xl font-black text-phaseText-primary">
              Principal <Text className="text-phase-interactive font-black">Workspace</Text>.
            </Heading>
            <Text className="text-base text-phaseText-secondary font-medium">
              Operational cockpit for institution leaders.
            </Text>
          </VStack>

          <HStack className="gap-1 bg-phase-canvas p-1.5 rounded-2xl self-start border border-phase-border">
            {['Dashboard', 'Structure', 'Invites', 'Logbook'].map((tab, _i) => {
              const isActive =
                (tab === 'Dashboard' && activeView === 'main') ||
                (tab === 'Structure' && activeView === 'hierarchy') ||
                (tab === 'Invites' && activeView === 'invites') ||
                (tab === 'Logbook' && activeView === 'log');

              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    if (tab === 'Dashboard') onViewChange('main');
                    if (tab === 'Structure') onViewChange('hierarchy');
                    if (tab === 'Invites') onViewChange('invites');
                    if (tab === 'Logbook') onViewChange('log');
                  }}
                  className={`px-5 py-2.5 rounded-xl transition-all ${isActive ? 'bg-phase-canvas shadow-sm border border-phase-border' : ''}`}
                >
                  <Text
                    className={`text-[13px] font-black uppercase tracking-wider ${isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}`}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>

          <Box className="flex-1 min-h-[500px]">
            {isLoading ? (
              <VStack className="flex-1 items-center justify-center p-12 gap-4">
                <Box className="w-12 h-12 rounded-full border-4 border-phase-interactive/20 border-t-phase-interactive animate-spin" />
                <Text className="text-sm font-bold text-phaseText-muted">
                  Synchronizing workspace...
                </Text>
              </VStack>
            ) : (
              children
            )}
          </Box>
        </VStack>
      </ScrollView>

      <Box className="h-20 bg-transparent" />
    </Box>
  );
};

function SnapshotTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Box className="flex-1 min-w-[47%] bg-phase-canvas rounded-2xl border border-phase-border p-4">
      <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-2xl font-black text-phaseText-primary mt-1.5">{value}</Text>
    </Box>
  );
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
  const _colors = useTheme().scene;

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
    <Pressable onPress={onPress} className="active:scale-95 transition-all">
      <Box className="bg-phase-canvas rounded-3xl border border-phase-border p-5 shadow-sm active:bg-phase-interactive/5">
        <HStack className="items-center gap-4">
          <Box className="w-12 h-12 rounded-2xl bg-phase-interactive/10 items-center justify-center">
            <Icon size={22} className="text-phase-interactive" />
          </Box>
          <VStack className="flex-1">
            <Text className="text-[15px] font-black text-phaseText-primary">{label}</Text>
            <Text className="text-xs text-phaseText-muted font-bold">{hint}</Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <VStack className="gap-2">
      <LinkRow
        icon={Building2}
        label="Institution profile"
        hint="Open the official school record."
        onPress={onOpenProfile}
      />
      <LinkRow
        icon={MessageSquare}
        label="Community commons"
        hint="Step into the culture and mission layer."
        onPress={onOpenCommons}
      />
      <LinkRow
        icon={QrCode}
        label="School QR"
        hint="Share the sanctuary entry point."
        onPress={onOpenQr}
      />
      <LinkRow
        icon={Wind}
        label="Leadership breathing"
        hint="Reset before the next decision."
        onPress={onOpenBreathing}
      />
      <LinkRow
        icon={NotebookPen}
        label="Edit school details"
        hint="Adjust name, handle, and institution basics."
        onPress={onEditSchool}
      />
    </VStack>
  );
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
      outlook: getPrincipalCapabilitiesByZone('outlook').filter(
        (capability) => capability.status !== 'hidden',
      ).length,
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
          <VStack className="gap-6">
            <ZoneIntro
              eyebrow="Today"
              title="Run the school day clearly"
              copy="See the current pulse, unblock pending operations, and keep the day steady without turning the dashboard into surveillance."
            />
            {renderTodayContent()}
          </VStack>
        ),
      },
      institution: {
        id: 'institution',
        eyebrow: 'Institution',
        title: 'Shape the school as an institution',
        copy: 'Move from live coordination into hierarchy, invites, cycles, logbook work, and the official identity of the school.',
        content: (
          <VStack className="gap-6">
            <ZoneIntro
              eyebrow="Institution"
              title="Shape the school as an institution"
              copy="Move from live coordination into hierarchy, invites, cycles, logbook work, and the official identity of the school."
            />
            <ManagementStation
              onAction={(view) => navigatePrincipalView(view as PrincipalWorkspaceView)}
            />
            <VStack className="gap-2">
              <Text className="text-base font-bold text-ink">School snapshot</Text>
              <HStack className="gap-2 flex-wrap">
                <SnapshotTile label="Students" value={stats?.total_students ?? 0} />
                <SnapshotTile label="Teachers" value={stats?.total_teachers ?? 0} />
                <SnapshotTile label="Classrooms" value={stats?.total_classrooms ?? 0} />
                <SnapshotTile label="Sections" value={stats?.total_sections ?? 0} />
              </HStack>
            </VStack>
            <InstitutionLinks
              onOpenProfile={onOpenProfile}
              onOpenCommons={onOpenCommons}
              onOpenQr={onOpenQr}
              onOpenBreathing={onOpenBreathing}
              onEditSchool={onEditSchool}
            />
            <PrincipalGovernanceTimeline schoolId={schoolId} principalId={principalId} />
          </VStack>
        ),
      },
      outlook: {
        id: 'outlook',
        eyebrow: 'Outlook',
        title: 'Read patterns and prepare what comes next',
        copy: 'Watch aggregated climate and resource pressure now, while giving future ERP families a modular home instead of crowding the main cockpit.',
        content: (
          <VStack className="gap-6">
            <ZoneIntro
              eyebrow="Outlook"
              title="Read patterns and prepare what comes next"
              copy="Watch aggregated climate and resource pressure now, while giving future ERP families a modular home instead of crowding the main cockpit."
            />
            {renderOutlookContent()}
            <PrincipalModuleAtlas />
          </VStack>
        ),
      },
    }),
    [
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
    ],
  );

  return {
    zoneCounts,
    surfaces,
  };
}
