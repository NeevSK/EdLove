import { WORKSPACE_CANVAS_ZONES } from '@repo/core/logic';
import { useWorkspaceLayoutSync } from '@repo/core/native';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceSurfaceDefinition,
  WorkspaceSwitcherTarget,
  WorkspaceZoneId,
} from '@repo/core/types';

import { WorkspaceCanvas } from '@repo/ui/components/workspace';
import {
  Building2,
  CalendarCheck,
  LayoutGrid,
  MoveRight,
  NotebookPen,
  QrCode,
  Share2,
  Wind,
} from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';

import type React from 'react';
import { useMemo } from 'react';
import DashboardEcho from '@repo/admin/components/principal/DashboardEcho';
import InstitutionalCalendarSection from '@repo/admin/components/principal/InstitutionalCalendarSection';
import LeaveApprovalSection from '@repo/admin/components/principal/LeaveApprovalSection';
import ManagementStation from '@repo/admin/components/principal/ManagementStation';
import MorningSituationalBrief from '@repo/admin/components/principal/MorningSituationalBrief';
import PrincipalGovernanceTimeline from '@repo/admin/components/principal/PrincipalGovernanceTimeline';
import PrincipalObservationsSection from '@repo/admin/components/principal/PrincipalObservationsSection';
import PulseDashboard from '@repo/admin/components/principal/PulseDashboard';
import ResourceNeedsDashboard from '@repo/admin/components/principal/ResourceNeedsDashboard';
import TeacherCarousel from '@repo/admin/components/principal/TeacherCarousel';
import {
  getPrincipalCapabilityMeta,
  type PrincipalCapabilityId,
  type PrincipalWorkspaceSurfaceId,
  type PrincipalWorkspaceView,
} from '@repo/admin/principal/workspace';
import { getPrincipalPreviewSummary } from '@repo/admin/principal/workspacePreview';

export type PrincipalWorkspaceSurface = WorkspaceSurfaceDefinition<
  PrincipalWorkspaceSurfaceId,
  PrincipalCapabilityId
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  snapshot?: string;
  temporalLabel?: string;
  temporalTone?: 'present' | 'past' | 'future' | 'neutral';
  metadata?: string[];
  content: React.ReactNode;
};

type PrincipalWorkspaceStats =
  | {
      total_students?: number;
      total_teachers?: number;
      total_classrooms?: number;
      total_sections?: number;
    }
  | null
  | undefined;

type PrincipalWorkspaceCanvasArgs = {
  schoolId: string;
  principalId: string;
  schoolName?: string | null;
  stats?: PrincipalWorkspaceStats;
  hasSchool?: boolean;
  isPastView?: boolean;
  isDemoExperience?: boolean;
  workspaceTargets?: WorkspaceSwitcherTarget[];
  navigatePrincipalView: (view: PrincipalWorkspaceView) => void;
  onSelectWorkspaceTarget?: (target: WorkspaceSwitcherTarget) => void;
  onOpenProfile: () => void;
  onOpenCommons: () => void;
  onOpenQr: () => void;
  onOpenBreathing: () => void;
  onEditSchool: () => void;
};

function WorkspaceSwitcherSurface({
  targets,
  onSelectTarget,
}: {
  targets: WorkspaceSwitcherTarget[];
  onSelectTarget: (target: WorkspaceSwitcherTarget) => void;
}) {
  return (
    <VStack className="gap-2">
      {targets.map((target) => (
        <Pressable
          key={target.id}
          onPress={() => onSelectTarget(target)}
          disabled={!target.enabled}
          className="active:opacity-80"
        >
          <Box
            className={`rounded-2xl border p-4 ${target.enabled ? 'border-starlightGray/20 bg-silk' : 'border-starlightGray/10 bg-phase-primary/5'}`}
          >
            <HStack className="items-center gap-3">
              <Box className="rounded-full bg-phase-warning/10 px-3 py-1">
                <Text className="text-[10px] font-bold uppercase text-phaseText-primary">
                  {target.status.replace('_', ' ')}
                </Text>
              </Box>
              <VStack className="flex-1 gap-0.5">
                <Text className="text-[13px] font-bold text-phaseText-primary">{target.title}</Text>
                <Text className="text-[11px] text-phaseText-secondary">
                  {target.enabled ? target.description : target.reason || target.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Pressable>
      ))}
    </VStack>
  );
}

function getNextZone(zone: WorkspaceZoneId): WorkspaceZoneId {
  const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
  const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
  return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
}

function SurfaceLauncher({
  icon: LucideIcon,
  title,
  copy,
  actionLabel,
  onPress,
}: {
  icon: any;
  title: string;
  copy: string;
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <VStack className="gap-4">
      <HStack className="items-center gap-3">
        <Box className="w-10 h-10 rounded-xl bg-phase-warning/10 items-center justify-center">
          <Icon as={LucideIcon} size={18} className="text-phaseText-primary" />
        </Box>
        <VStack className="flex-1 gap-0.5">
          <Text className="text-[15px] font-bold text-phaseText-primary">{title}</Text>
          <Text className="text-[12px] text-phaseText-secondary">{copy}</Text>
        </VStack>
      </HStack>
      <Pressable
        onPress={onPress}
        className="self-start rounded-full bg-phase-interactive px-4 py-2 border border-phase-border shadow-sm active:scale-95 transition-all"
      >
        <HStack className="items-center gap-2">
          <Text className="text-[12px] font-black text-white uppercase tracking-widest">
            {actionLabel}
          </Text>
          <Icon as={MoveRight} size={14} className="text-white" />
        </HStack>
      </Pressable>
    </VStack>
  );
}

function ProfileSurface({
  stats,
  schoolName,
  onOpenProfile,
  onOpenQr,
  onEditSchool,
}: {
  stats?: PrincipalWorkspaceStats;
  schoolName?: string | null;
  onOpenProfile: () => void;
  onOpenQr: () => void;
  onEditSchool: () => void;
}) {
  const actions = [
    {
      icon: Building2,
      label: 'Institution, profile',
      hint: schoolName || 'Open, the, official, school, record.',
      onPress: onOpenProfile,
    },
    {
      icon: QrCode,
      label: 'School, QR',
      hint: 'Share, the, school, sanctuary, entry, point.',
      onPress: onOpenQr,
    },
    {
      icon: NotebookPen,
      label: 'Edit, school, details',
      hint: 'Adjust, institution, basics, and, identity.',
      onPress: onEditSchool,
    },
  ];

  return (
    <VStack className="gap-4">
      <HStack className="gap-3 flex-wrap">
        {[
          { label: 'Students', value: stats?.total_students ?? 0 },
          { label: 'Teachers', value: stats?.total_teachers ?? 0 },
          { label: 'Classrooms', value: stats?.total_classrooms ?? 0 },
          { label: 'Sections', value: stats?.total_sections ?? 0 },
        ].map((item) => (
          <Box
            key={item.label}
            className="min-w-[47%] flex-1 p-5 rounded-[24px] bg-phase-surface border border-phase-border shadow-sm"
          >
            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest">
              {item.label}
            </Text>
            <Text className="mt-1 text-2xl font-black text-phaseText-primary tracking-tight">
              {item.value}
            </Text>
          </Box>
        ))}
      </HStack>

      <VStack className="gap-2">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            className="active:scale-[0.98] transition-all"
          >
            <Box className="bg-phase-surface rounded-[24px] border border-phase-border p-5 shadow-sm">
              <HStack className="items-center gap-4">
                <Icon as={action.icon} size="sm" className="text-phase-interactive" />
                <VStack className="flex-1 gap-0.5">
                  <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
                    {action.label}
                  </Text>
                  <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-wider">
                    {action.hint}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </Pressable>
        ))}
      </VStack>
    </VStack>
  );
}

function CommonsSurface({
  onOpenCommons,
  onOpenBreathing,
}: {
  onOpenCommons: () => void;
  onOpenBreathing: () => void;
}) {
  return (
    <VStack className="gap-2">
      <Pressable onPress={onOpenCommons} className="active:scale-[0.98] transition-all">
        <Box className="p-5 rounded-[24px] border border-phase-border bg-phase-surface shadow-sm">
          <HStack className="items-center gap-4">
            <Icon as={Share2} size="sm" className="text-phase-interactive" />
            <VStack className="flex-1 gap-0.5">
              <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
                Community, commons
              </Text>
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-wider">
                Step into the mission layer of the school.
              </Text>
            </VStack>
          </HStack>
        </Box>
      </Pressable>

      <Pressable onPress={onOpenBreathing} className="active:scale-[0.98] transition-all">
        <Box className="p-5 rounded-[24px] border border-phase-border bg-phase-surface shadow-sm">
          <HStack className="items-center gap-4">
            <Icon as={Wind} size="sm" className="text-phase-warning" />
            <VStack className="flex-1 gap-0.5">
              <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
                Leadership, breathing
              </Text>
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-wider">
                Reset before the next decision.
              </Text>
            </VStack>
          </HStack>
        </Box>
      </Pressable>
    </VStack>
  );
}

function createPrincipalSurface(
  surfaceId: PrincipalWorkspaceSurfaceId,
  config: Omit<
    PrincipalWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage'
  >,
): PrincipalWorkspaceSurface {
  const meta = getPrincipalCapabilityMeta(surfaceId);

  return {
    surfaceId,
    workspaceId: 'principal-workspace',
    capabilityKey: surfaceId,
    ownerPackage: 'admin',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    kind: ((config as unknown as { kind?: string }).kind as unknown as PrincipalWorkspaceSurface['kind']) ?? 'widget',
    domain: (config as unknown as { domain?: string }).domain ?? config.defaultZone,
    groupId: (config as unknown as { groupId?: string }).groupId ?? config.defaultZone,
    hiddenByDefault: config.hiddenByDefault,
    mobileSupport: config.mobileSupport ?? true,
    webSupport: config.webSupport ?? true,
    title: config.title || meta?.title || surfaceId,
    subtitle: config.subtitle ?? meta?.title,
    summary: config.summary ?? meta?.description,
    snapshot: config.snapshot,
    temporalLabel: config.temporalLabel,
    temporalTone: config.temporalTone,
    metadata: config.metadata,
    content: config.content,
  };
}

export function usePrincipalWorkspaceCanvasSurfaces({
  schoolId,
  principalId,
  schoolName,
  stats,
  hasSchool = true,
  isPastView = false,
  isDemoExperience = false,
  workspaceTargets = [],
  navigatePrincipalView,
  onSelectWorkspaceTarget,
  onOpenProfile,
  onOpenCommons,
  onOpenQr,
  onOpenBreathing,
  onEditSchool,
}: PrincipalWorkspaceCanvasArgs) {
  return useMemo<PrincipalWorkspaceSurface[]>(
    () => [
      createPrincipalSurface('setup_runway', {
        defaultZone: 'institution',
        defaultOrder: 5,
        title: 'Setup, runway',
        subtitle: 'Institution, launch, path',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('setup_runway')
          : hasSchool
            ? 'Keep, setup-heavy, rooms, close while the, school, is, still, taking, shape, then, move, them, aside, once, the, institutional, rhythm, is, stable.'
            : 'This, runway, becomes, the, first, real, canvas, after, founding, the, school, with, hierarchy, invites, cycles, and, official, profile, work, ready, to, organize.',
        temporalLabel: isDemoExperience ? 'Preview' : hasSchool ? 'Setup' : 'Next, after, founding',
        temporalTone: 'future',
        metadata: isDemoExperience
          ? ['Preview', schoolName || 'Institution', 'Launch, path']
          : ['Setup', schoolName || 'Institution'],
        content: (
          <ManagementStation
            onAction={(action) => {
              if (action === 'notes') {
                navigatePrincipalView('log');
                return;
              }
              navigatePrincipalView(action);
            }}
          />
        ),
      }),
      createPrincipalSurface('workspace_switcher', {
        defaultZone: 'institution',
        defaultOrder: 8,
        title: 'Workspace, Switcher',
        subtitle: 'Mixed-role, navigation',
        summary:
          'A, principal, can, still, move, into, guardian, founder, or, academic, work, when, those, capabilities, belong, to, the, same, person.',
        temporalLabel: 'Role-aware',
        temporalTone: 'neutral',
        metadata: ['Institution', 'Mixed-role'],
        content: (
          <WorkspaceSwitcherSurface
            targets={workspaceTargets}
            onSelectTarget={(target) => onSelectWorkspaceTarget?.(target)}
          />
        ),
      }),
      createPrincipalSurface('morning_brief', {
        defaultZone: 'today',
        defaultOrder: 10,
        title: 'Morning, brief',
        subtitle: 'Daily, leadership, pulse',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('morning_brief')
          : 'Start, with, the, operational, truth, of, the, day, before, everything else competes for attention.',
        temporalLabel: isDemoExperience ? 'Preview' : isPastView ? 'Past, view' : 'Today',
        temporalTone: isPastView ? 'past' : 'present',
        metadata: isDemoExperience ? ['Preview', 'Leadership, pulse'] : ['Daily', 'Institution'],
        content: <MorningSituationalBrief schoolId={schoolId} />,
      }),
      createPrincipalSurface('faculty_overview', {
        defaultZone: 'today',
        defaultOrder: 20,
        title: 'Faculty, overview',
        subtitle: 'Coverage, and, presence',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('faculty_overview')
          : 'Read, staffing, availability, teaching, presence, and, who, may, need, support, or, relief.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Live',
        metadata: isDemoExperience ? ['Preview', 'Faculty, signal'] : ['Daily', 'Staff'],
        content: <TeacherCarousel schoolId={schoolId} />,
      }),
      createPrincipalSurface('pending_approvals', {
        defaultZone: 'today',
        defaultOrder: 30,
        title: 'Pending, approvals',
        subtitle: 'Immediate, decisions',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('pending_approvals')
          : 'Keep, sign-offs, moving, so, the, school, day, stays, unblocked.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Action, ready',
        metadata: isDemoExperience
          ? ['Preview', 'Operational, decisions']
          : ['Daily', 'Operations'],
        content: <LeaveApprovalSection schoolId={schoolId} principalId={principalId} />,
      }),
      createPrincipalSurface('institutional_calendar', {
        defaultZone: 'today',
        defaultOrder: 40,
        title: 'Institutional, calendar',
        subtitle: 'Near-term, rhythm',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('institutional_calendar')
          : 'Terms, dates, and, events, that, shape, the, next, movements, of, the, institution.',
        temporalLabel: isDemoExperience ? 'Preview' : 'This, cycle',
        metadata: isDemoExperience ? ['Preview', 'Institution, rhythm'] : ['Periodic', 'Calendar'],
        content: <InstitutionalCalendarSection schoolId={schoolId} principalId={principalId} />,
      }),
      createPrincipalSurface('observations', {
        defaultZone: 'today',
        defaultOrder: 50,
        title: 'Observations',
        subtitle: 'Leadership, memory',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('observations')
          : 'Hold, recent, walkthrough, notes, and, institutional, observations, close, enough, to, act, on, them.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Recent',
        metadata: isDemoExperience ? ['Preview', 'Leadership, memory'] : ['Daily', 'Follow-up'],
        content: <PrincipalObservationsSection schoolId={schoolId} principalId={principalId} />,
      }),
      createPrincipalSurface('hierarchy', {
        defaultZone: 'institution',
        defaultOrder: 60,
        title: 'Hierarchy',
        subtitle: 'Structure, and, sections',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('hierarchy')
          : 'A, setup, room for grades, sections, and, institutional, structure.',
        temporalLabel: isDemoExperience ? 'Preview, room' : 'Setup, room',
        temporalTone: 'neutral',
        metadata: isDemoExperience
          ? ['Preview', `Sections ${stats?.total_sections ?? 0}`]
          : ['Setup', `Sections ${stats?.total_sections ?? 0}`],
        content: (
          <SurfaceLauncher
            icon={LayoutGrid}
            title="School, hierarchy"
            copy="Shape, grades and, sections when, the institution, changes, then, leave the, daily canvas, uncluttered."
            actionLabel="Open, hierarchy room"
            onPress={() => navigatePrincipalView('hierarchy')}
          />
        ),
      }),
      createPrincipalSurface('invites', {
        defaultZone: 'institution',
        defaultOrder: 65,
        title: 'Invites',
        subtitle: 'Positive, invitations',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('invites')
          : 'Periodic, onboarding, and, governance, through, explicit, role-aware, entry.',
        temporalLabel: isDemoExperience ? 'Preview, room' : 'Periodic, room',
        temporalTone: 'future',
        metadata: isDemoExperience ? ['Preview', 'Governance, entry'] : ['Periodic', 'Onboarding'],
        content: (
          <SurfaceLauncher
            icon={Building2}
            title="Governance, invites"
            copy="Bring, teachers and, leaders in, deliberately, with, role-aware, invitations and, capability gates."
            actionLabel="Open, invites room"
            onPress={() => navigatePrincipalView('invites')}
          />
        ),
      }),
      createPrincipalSurface('cycles', {
        defaultZone: 'institution',
        defaultOrder: 75,
        title: 'Cycles',
        subtitle: 'Academic, rhythm',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('cycles')
          : 'Define, terms, and, academic, periods, so, the, institution, shares, one, stable, timeline.',
        temporalLabel: isDemoExperience ? 'Preview, room' : 'Setup, room',
        temporalTone: 'neutral',
        metadata: isDemoExperience
          ? ['Preview', 'Institution, timeline']
          : ['Setup', 'Year, structure'],
        content: (
          <SurfaceLauncher
            icon={CalendarCheck}
            title="Academic, cycles"
            copy="Set, the institutional, time structure, here so, governance and, learning operate, inside the, same rhythm."
            actionLabel="Open, cycles room"
            onPress={() => navigatePrincipalView('cycles')}
          />
        ),
      }),
      createPrincipalSurface('log', {
        defaultZone: 'institution',
        defaultOrder: 90,
        title: 'Logbook',
        subtitle: 'Governance, timeline',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('log')
          : 'A, place for institutional, memory, follow-up, and, leadership, trace, across, time.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Daily, record',
        metadata: isDemoExperience ? ['Preview', 'Governance, memory'] : ['Daily', 'Timeline'],
        content: <PrincipalGovernanceTimeline schoolId={schoolId} principalId={principalId} />,
      }),
      createPrincipalSurface('notes', {
        defaultZone: 'private',
        defaultOrder: 100,
        hiddenByDefault: true,
        title: 'Private, notes',
        subtitle: 'Principal, studio',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('notes')
          : 'A, quieter, personal, working, surface, that, the, principal, can, unhide, or, reposition if it, matters.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Private',
        temporalTone: 'neutral',
        metadata: isDemoExperience
          ? ['Preview', 'Private, layer']
          : ['Private', 'Hidden, by default'],
        content: (
          <SurfaceLauncher
            icon={NotebookPen}
            title="Private, notes"
            copy="Keep a, quieter reflection, space available, without forcing, it onto, the default institutional canvas."
            actionLabel="Open, notes room"
            onPress={() => navigatePrincipalView('notes')}
          />
        ),
      }),
      createPrincipalSurface('school_profile', {
        defaultZone: 'institution',
        defaultOrder: 110,
        title: 'School, profile',
        subtitle: 'Official, institution, record',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('school_profile')
          : 'Profile, school, snapshot, QR, entry, and, institution, identity, belong, here.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Periodic',
        metadata: isDemoExperience
          ? ['Preview', schoolName || 'Institution, profile']
          : ['Institution', schoolName || 'Profile'],
        content: (
          <ProfileSurface
            stats={stats}
            schoolName={schoolName}
            onOpenProfile={onOpenProfile}
            onOpenQr={onOpenQr}
            onEditSchool={onEditSchool}
          />
        ),
      }),
      createPrincipalSurface('resource_needs', {
        defaultZone: 'outlook',
        defaultOrder: 120,
        title: 'Resource, needs',
        subtitle: 'Pressure, and, readiness',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('resource_needs')
          : 'Aggregated, requests, help, the, principal, see, where, support, supply, or, attention, is, accumulating.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Weekly, read',
        temporalTone: 'future',
        metadata: isDemoExperience
          ? ['Preview', 'Pressure, signal']
          : ['Outlook', 'Classroom, signal'],
        content: <ResourceNeedsDashboard schoolId={schoolId} />,
      }),
      createPrincipalSurface('ecosystem_resonance', {
        defaultZone: 'outlook',
        defaultOrder: 130,
        title: 'Ecosystem, resonance',
        subtitle: 'Climate, and, pulse',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('ecosystem_resonance')
          : 'Community, tone, pattern, and, broader, school, climate, belong, in, the, outlook, lane.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Monthly, read',
        temporalTone: 'future',
        metadata: isDemoExperience ? ['Preview', 'School, climate'] : ['Outlook', 'Culture'],
        content: (
          <VStack className="gap-4">
            <PulseDashboard schoolId={schoolId} />
            <DashboardEcho schoolId={schoolId} />
          </VStack>
        ),
      }),
      createPrincipalSurface('open_commons', {
        defaultZone: 'outlook',
        defaultOrder: 140,
        title: 'Open, commons',
        subtitle: 'Mission, and, community',
        summary: isDemoExperience
          ? getPrincipalPreviewSummary('open_commons')
          : 'A, bridge from institutional, leadership, into, the, living, community, commons.',
        temporalLabel: isDemoExperience ? 'Preview' : 'Community',
        metadata: isDemoExperience ? ['Preview', 'Mission, bridge'] : ['Outlook', 'Commons'],
        content: <CommonsSurface onOpenCommons={onOpenCommons} onOpenBreathing={onOpenBreathing} />,
      }),
    ],
    [
      schoolId,
      principalId,
      schoolName,
      stats,
      hasSchool,
      isPastView,
      isDemoExperience,
      workspaceTargets,
      navigatePrincipalView,
      onSelectWorkspaceTarget,
      onOpenProfile,
      onOpenCommons,
      onOpenQr,
      onOpenBreathing,
      onEditSchool,
    ],
  );
}

export function usePrincipalWorkspaceLayout(
  userId: string | null | undefined,
  surfaces: PrincipalWorkspaceSurface[],
) {
  const workspace = useWorkspaceLayoutSync({
    workspaceId: 'principal-workspace',
    userId,
    surfaces,
  });

  const resolvedSurfaceMap = useMemo(
    () => new Map(workspace.surfaces.map((surface) => [surface.surfaceId, surface] as const)),
    [workspace.surfaces],
  );

  const enrichedSurfaces = useMemo(
    () =>
      surfaces
        .map((surface) => {
          const resolved = resolvedSurfaceMap.get(surface.surfaceId);
          if (!resolved) return null;

          return {
            ...surface,
            ...resolved,
          } as PrincipalWorkspaceSurface &
            ResolvedWorkspaceSurface<PrincipalWorkspaceSurfaceId, PrincipalCapabilityId>;
        })
        .filter(Boolean) as Array<
        PrincipalWorkspaceSurface &
          ResolvedWorkspaceSurface<PrincipalWorkspaceSurfaceId, PrincipalCapabilityId>
      >,
    [surfaces, resolvedSurfaceMap],
  );

  return {
    ...workspace,
    surfaces: enrichedSurfaces,
  };
}

type PrincipalResolvedSurface = PrincipalWorkspaceSurface &
  ResolvedWorkspaceSurface<PrincipalWorkspaceSurfaceId, PrincipalCapabilityId>;

export function PrincipalWorkspaceCanvas({
  layout,
  surfaces,
  schoolName,
  onToggleHidden,
  onTogglePinned,
  onMoveToNextZone,
  onOpenSurface,
}: {
  layout: {
    order: PrincipalWorkspaceSurfaceId[];
    hidden: PrincipalWorkspaceSurfaceId[];
    pinned: PrincipalWorkspaceSurfaceId[];
    zoneBySurface: Partial<Record<PrincipalWorkspaceSurfaceId, WorkspaceZoneId>>;
    workspaceId: string;
    userId: string;
    updatedAt: string;
  } | null;
  surfaces: PrincipalResolvedSurface[];
  schoolName?: string | null;
  onToggleHidden: (id: PrincipalWorkspaceSurfaceId, hidden: boolean) => void;
  onTogglePinned: (id: PrincipalWorkspaceSurfaceId, pinned: boolean) => void;
  onMoveToNextZone: (id: PrincipalWorkspaceSurfaceId, zone: WorkspaceZoneId) => void;
  onOpenSurface: (surface: PrincipalResolvedSurface) => void;
}) {
  if (!layout) return null;

  return (
    <WorkspaceCanvas
      surfaces={surfaces}
      layout={layout as any}
      title="Principal, Workspace Canvas"
      subtitle={`Default, leadership, arrangement for ${schoolName || 'the, institution'}, with, room for the principal, to pin, hide, and, move surfaces, according to, real work.`}
      emptyMessage="No, principal surfaces, are available, yet for this workspace."
      renderSurfaceContent={(surface) => (
        <Box className="flex-1">{(surface as PrincipalResolvedSurface).content}</Box>
      )}
      getSurfaceTitle={(surface) => (surface as PrincipalResolvedSurface).title}
      getSurfaceSubtitle={(surface) => (surface as PrincipalResolvedSurface).subtitle}
      getSurfaceSummary={(surface) => (surface as PrincipalResolvedSurface).summary}
      getSurfaceSnapshot={(surface) => (surface as PrincipalResolvedSurface).snapshot}
      getSurfaceTemporalLabel={(surface) => (surface as PrincipalResolvedSurface).temporalLabel}
      getSurfaceTemporalTone={(surface) => (surface as PrincipalResolvedSurface).temporalTone}
      getSurfaceMetadata={(surface) => (surface as PrincipalResolvedSurface).metadata}
      onSurfacePress={(surface) => onOpenSurface(surface as PrincipalResolvedSurface)}
      renderSurfaceActions={(surface) => {
        const typedSurface = surface as PrincipalResolvedSurface;
        const nextZone = getNextZone(typedSurface.zone);
        const detailView = getPrincipalCapabilityMeta(typedSurface.surfaceId)?.workspaceView;

        return (
          <HStack className="gap-3 flex-wrap">
            <Pressable
              onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)}
              className="active:opacity-80"
            >
              <Box className="rounded-full px-4 py-2 bg-phase-primary/5 border border-starlightGray/10">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  {typedSurface.pinned ? 'Unpin' : 'Pin'}
                </Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
              className="active:opacity-80"
            >
              <Box className="rounded-full px-4 py-2 bg-phase-primary/5 border border-starlightGray/10">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  Move, to {nextZone}
                </Text>
              </Box>
            </Pressable>
            {detailView ? (
              <Pressable onPress={() => onOpenSurface(typedSurface)} className="active:opacity-80">
                <Box className="rounded-full px-4 py-2 bg-phase-warning">
                  <Text className="text-[12px] font-bold text-phaseText-primary">Open, room</Text>
                </Box>
              </Pressable>
            ) : null}
          </HStack>
        );
      }}
      onToggleHidden={(surface) =>
        onToggleHidden(surface.surfaceId as PrincipalWorkspaceSurfaceId, !surface.hidden)
      }
    />
  );
}
