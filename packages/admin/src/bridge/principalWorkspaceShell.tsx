import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, Heading, Text, VStack, useThemedColors, ScrollView, Pressable, useTheme } from '@repo/ui';
import { Building2, MessageSquare, NotebookPen, QrCode, Wind } from 'lucide-react-native';
import { ManagementStation, PrincipalGovernanceTimeline } from '../components';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView,
  type PrincipalZoneId} from '../principal/workspace';
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
  copy}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <VStack className="gap-2">
      <Text className="text-[12px] font-black uppercase text-primary tracking-widest">
        {eyebrow}
      </Text>
      <Heading className="text-2xl font-black text-ink">
        {title}
      </Heading>
      <Text className="text-[13px] leading-relaxed text-ink/60">{copy}</Text>
    </VStack>
  );
}

export const PrincipalWorkspaceShell: React.FC<any> = ({ 
    activeView, 
    onViewChange, 
    children, 
    isLoading 
}) => {
    return (
        <Box className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <VStack className="p-6 gap-8">
                    <VStack className="gap-2">
                        <Heading className="text-3xl font-black text-ink">
                            Principal <Text className="text-primary font-black">Workspace</Text>.
                        </Heading>
                        <Text className="text-base text-ink/60 font-medium">
                            Operational cockpit for institution leaders.
                        </Text>
                    </VStack>

                    <HStack className="gap-1 bg-silk p-1.5 rounded-2xl self-start border border-border/50">
                        {['Dashboard', 'Structure', 'Invites', 'Logbook'].map((tab, i) => {
                            const isActive = (tab === 'Dashboard' && activeView === 'main') || 
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
                                    className={`px-5 py-2.5 rounded-xl transition-all ${isActive ? 'bg-white shadow-sm border border-border/50' : ''}`}
                                >
                                    <Text className={`text-[13px] font-black uppercase tracking-wider ${isActive ? 'text-primary' : 'text-ink/40'}`}>
                                        {tab}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </HStack>

                    <Box className="flex-1 min-h-[500px]">
                        {isLoading ? (
                            <VStack className="flex-1 items-center justify-center p-12 gap-4">
                                <Box className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                <Text className="text-sm font-bold text-ink/40">Synchronizing workspace...</Text>
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
    <Box className="flex-1 min-w-[47%] bg-silk rounded-2xl border border-border p-4">
      <Text className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-2xl font-black text-ink mt-1.5">
        {value}
      </Text>
    </Box>
  );
}

function InstitutionLinks({
  onOpenProfile,
  onOpenCommons,
  onOpenQr,
  onOpenBreathing,
  onEditSchool}: {
  onOpenProfile: () => void;
  onOpenCommons: () => void;
  onOpenQr: () => void;
  onOpenBreathing: () => void;
  onEditSchool: () => void;
}) {
  const colors = useTheme().scene;

  const LinkRow = ({
    icon: Icon,
    label,
    hint,
    onPress}: {
    icon: any;
    label: string;
    hint: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Box className="bg-silk rounded-2xl border border-border p-4">
        <HStack className="items-center gap-4">
          <Box className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <Icon size={18} className="text-primary" />
          </Box>
          <VStack className="flex-1">
            <Text className="text-[13px] font-bold text-ink">{label}</Text>
            <Text className="text-[11px] text-ink/40 font-bold">{hint}</Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );

  return (
    <VStack className="gap-2">
      <LinkRow icon={Building2} label="Institution profile" hint="Open the official school record." onPress={onOpenProfile} />
      <LinkRow icon={MessageSquare} label="Community commons" hint="Step into the culture and mission layer." onPress={onOpenCommons} />
      <LinkRow icon={QrCode} label="School QR" hint="Share the sanctuary entry point." onPress={onOpenQr} />
      <LinkRow icon={Wind} label="Leadership breathing" hint="Reset before the next decision." onPress={onOpenBreathing} />
      <LinkRow icon={NotebookPen} label="Edit school details" hint="Adjust name, handle, and institution basics." onPress={onEditSchool} />
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
  renderOutlookContent}: PrincipalWorkspaceShellArgs) {
  const zoneCounts = useMemo(
    () => ({
      today: getPrincipalCapabilitiesByZone('today', 'live').length,
      institution: getPrincipalCapabilitiesByZone('institution', 'live').length,
      outlook: getPrincipalCapabilitiesByZone('outlook').filter((capability) => capability.status !== 'hidden').length}),
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
        )},
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
            <ManagementStation onAction={(view) => navigatePrincipalView(view as PrincipalWorkspaceView)} />
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
        )},
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
        )}}),
    [schoolId, principalId, stats, navigatePrincipalView, onOpenProfile, onOpenCommons, onOpenQr, onOpenBreathing, onEditSchool, renderTodayContent, renderOutlookContent],
  );

  return {
    zoneCounts,
    surfaces};
}
