import React, { useMemo, useState } from 'react';
import { Box, VStack, HStack, Heading, Text, Pressable, ScrollView } from '../gluestack';
import { createDefaultWorkspaceLayout, setWorkspaceSurfaceHidden } from '@repo/core/logic';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
} from '@repo/core/types';
import { WorkspaceCanvas } from '../components/workspace';
import { useTheme } from '../hooks/useTheme';
import ScreenWrapper from '../components/ScreenWrapper';

type DemoRole = 'teacher' | 'principal' | 'founder';
/* ... types truncated ... */
type DemoSurfaceId =
  | 'lesson-flow'
  | 'student-signals'
  | 'institution-arc'
  | 'attendance-watch'
  | 'guardian-loop'
  | 'ecosystem-pulse'
  | 'private-reflection';
type DemoCapabilityKey =
  | 'TeacherLessonFlow'
  | 'TeacherSignals'
  | 'InstitutionArc'
  | 'AttendanceOversight'
  | 'GuardianRelationship'
  | 'FounderEcosystemPulse'
  | 'PrivateReflection';

interface DemoSurfaceMeta {
  subtitle: string;
  summary: string;
  snapshot: string;
  temporalLabel: string;
  temporalTone: 'present' | 'past' | 'future' | 'neutral';
  metadata: string[];
  actions: string[];
  info: string;
}

type DemoSurface = WorkspaceSurfaceDefinition<DemoSurfaceId, DemoCapabilityKey>;

const ROLE_LABELS: Record<DemoRole, string> = {
  teacher: 'Teacher',
  principal: 'Principal',
  founder: 'Founder',
};

const SURFACE_LIBRARY: Record<DemoSurfaceId, DemoSurface & DemoSurfaceMeta> = {
  'lesson-flow': {
    surfaceId: 'lesson-flow',
    workspaceId: 'classroom',
    capabilityKey: 'TeacherLessonFlow',
    ownerPackage: 'classroom',
    defaultZone: 'today',
    defaultOrder: 10,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Live lesson rhythm',
    summary:
      'A compact teaching surface for what is happening now, what needs intervention next, and what can be closed quickly.',
    snapshot: '3 live groups, 1 assignment blocked, 82% participation in the current cycle.',
    temporalLabel: 'Present',
    temporalTone: 'present',
    metadata: ['Teacher', 'Realtime', 'Actionable'],
    actions: ['Open session', 'Create note'],
    info: 'Use when a teacher needs a high-signal present-tense operating view rather than a retrospective report.',
  },
  'student-signals': {
    surfaceId: 'student-signals',
    workspaceId: 'classroom',
    capabilityKey: 'TeacherSignals',
    ownerPackage: 'classroom',
    defaultZone: 'work',
    defaultOrder: 20,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Signals and intervention candidates',
    summary: 'Highlights learners who changed state recently and surfaces the next best response.',
    snapshot: '2 students rose into watch status after yesterdays assessments.',
    temporalLabel: 'Past 24h',
    temporalTone: 'past',
    metadata: ['Teacher', 'Insight', 'Review'],
    actions: ['Review signals', 'Log intervention'],
    info: 'This card favors temporal transitions and supports read plus lightweight write actions.',
  },
  'institution-arc': {
    surfaceId: 'institution-arc',
    workspaceId: 'classroom',
    capabilityKey: 'InstitutionArc',
    ownerPackage: 'admin',
    defaultZone: 'institution',
    defaultOrder: 30,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Institutional arc',
    summary:
      'A school-wide snapshot that blends present health, upcoming risk, and what needs leadership attention.',
    snapshot:
      'Attendance stable, invite backlog reduced, and one grade band trending below target.',
    temporalLabel: 'This week',
    temporalTone: 'present',
    metadata: ['Leadership', 'Oversight', 'Cross-holon'],
    actions: ['Inspect trend', 'Assign follow-up'],
    info: 'This is the domain-specific language that could later wrap the shared base as an InstitutionalArcCard preset.',
  },
  'attendance-watch': {
    surfaceId: 'attendance-watch',
    workspaceId: 'classroom',
    capabilityKey: 'AttendanceOversight',
    ownerPackage: 'admin',
    defaultZone: 'outlook',
    defaultOrder: 40,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Attendance watch',
    summary: 'Shows emerging attendance drift before it becomes an official escalation.',
    snapshot: 'Friday trend predicts a 6% dip if transport disruptions continue.',
    temporalLabel: 'Forecast',
    temporalTone: 'future',
    metadata: ['Leadership', 'Forecast', 'Temporal'],
    actions: ['Open attendance lane', 'Message coordinator'],
    info: 'A good example of why the shared card needs temporal state beyond just a title and body.',
  },
  'guardian-loop': {
    surfaceId: 'guardian-loop',
    workspaceId: 'classroom',
    capabilityKey: 'GuardianRelationship',
    ownerPackage: 'guardian',
    defaultZone: 'work',
    defaultOrder: 50,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Guardian communication loop',
    summary:
      'Captures summaries ready to share outward without making the workspace itself the persistence owner.',
    snapshot: '4 guardian-ready summaries drafted, 1 awaiting verification.',
    temporalLabel: 'Queued',
    temporalTone: 'neutral',
    metadata: ['Family', 'Summary', 'Share-ready'],
    actions: ['Review summary', 'Send update'],
    info: 'Shows a role crossing seam: teacher and principal may both see it, but through different capabilities.',
  },
  'ecosystem-pulse': {
    surfaceId: 'ecosystem-pulse',
    workspaceId: 'classroom',
    capabilityKey: 'FounderEcosystemPulse',
    ownerPackage: 'admin',
    defaultZone: 'institution',
    defaultOrder: 60,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Ecosystem pulse',
    summary:
      'A founder-facing view that emphasizes momentum across institutions rather than one schools local dashboard.',
    snapshot: '3 institutions expanding, 1 needs staffing support, growth health remains positive.',
    temporalLabel: 'Quarter arc',
    temporalTone: 'future',
    metadata: ['Founder', 'Multi-site', 'Strategic'],
    actions: ['Open network map', 'Create directive'],
    info: 'Demonstrates that the same renderer can support non-classroom leadership surfaces without role-specific UI forks.',
  },
  'private-reflection': {
    surfaceId: 'private-reflection',
    workspaceId: 'classroom',
    capabilityKey: 'PrivateReflection',
    ownerPackage: 'core',
    defaultZone: 'private',
    defaultOrder: 70,
    hiddenByDefault: true,
    mobileSupport: true,
    webSupport: true,
    subtitle: 'Private reflection',
    summary:
      'A personal note surface that belongs to the user, not the institution, and can stay hidden by default.',
    snapshot: '2 unfinished reflections from the last 7 days.',
    temporalLabel: 'Private',
    temporalTone: 'neutral',
    metadata: ['Personal', 'Hidden by default'],
    actions: ['Resume note'],
    info: 'Included to show hidden-by-default handling and private-zone rendering.',
  },
};

const ROLE_SURFACES: Record<DemoRole, DemoSurfaceId[]> = {
  teacher: ['lesson-flow', 'student-signals', 'guardian-loop', 'private-reflection'],
  principal: ['institution-arc', 'attendance-watch', 'guardian-loop', 'private-reflection'],
  founder: ['ecosystem-pulse', 'institution-arc', 'attendance-watch', 'private-reflection'],
};

function buildRoleSurfaces(role: DemoRole): Array<DemoSurface & DemoSurfaceMeta> {
  return ROLE_SURFACES[role].map((surfaceId) => SURFACE_LIBRARY[surfaceId]);
}

export default function WorkspaceCanvasDemo() {
  const [role, setRole] = useState<DemoRole>('principal');
  const [notice, setNotice] = useState('Select a surface to inspect how the shared card behaves.');
  const { text, background, border } = useTheme();

  const surfaces = useMemo(() => buildRoleSurfaces(role), [role]);
  const [layoutByRole, setLayoutByRole] = useState<
    Record<DemoRole, WorkspaceLayout<DemoSurfaceId>>
  >(() => ({
    teacher: createDefaultWorkspaceLayout({
      workspaceId: 'classroom',
      userId: 'demo-teacher',
      surfaces: buildRoleSurfaces('teacher'),
    }),
    principal: createDefaultWorkspaceLayout({
      workspaceId: 'classroom',
      userId: 'demo-principal',
      surfaces: buildRoleSurfaces('principal'),
    }),
    founder: createDefaultWorkspaceLayout({
      workspaceId: 'classroom',
      userId: 'demo-founder',
      surfaces: buildRoleSurfaces('founder'),
    }),
  }));

  const layout = layoutByRole[role];

  const updateRoleLayout = (
    updater: (current: WorkspaceLayout<DemoSurfaceId>) => WorkspaceLayout<DemoSurfaceId>,
  ) => {
    setLayoutByRole((current) => ({
      ...current,
      [role]: updater(current[role]),
    }));
  };

  const renderActionButton = (label: string, tone: 'primary' | 'secondary' = 'secondary') => (
    <Box
      key={label}
      className="rounded-full border px-3 py-1.5"
      style={{
        backgroundColor: tone === 'primary' ? '#D4AF37' : background.secondary,
        borderColor: tone === 'primary' ? '#D4AF37' : border.primary,
      }}
    >
      <Text size="xs" className="font-bold" style={{ color: tone === 'primary' ? text.primary : text.secondary }}>
        {label}
      </Text>
    </Box>
  );

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1">
        <VStack className="p-6 gap-6">
          <VStack className="gap-2">
            <Text size="xs" className="font-bold tracking-widest text-[#SaffronMuted] uppercase">SHARED CANVAS DEMO</Text>
            <Heading size="xl">Capability-first workspace canvas</Heading>
            <Text size="md" style={{ color: text.secondary }} className="max-w-[760px]">
              One responsive entry point now selects mobile, tablet, or web renderers while still
              consuming the same shared surfaces and layout state.
            </Text>
          </VStack>

          <HStack className="flex-wrap gap-2">
            {(['teacher', 'principal', 'founder'] as DemoRole[]).map((candidate) => (
              <Pressable
                key={candidate}
                onPress={() => {
                  setRole(candidate);
                  setNotice(`Switched to the ${ROLE_LABELS[candidate]} capability mix.`);
                }}
                className="rounded-full border px-4 py-2"
                style={{
                  backgroundColor: role === candidate ? text.primary : background.secondary,
                  borderColor: role === candidate ? text.primary : border.primary,
                }}
              >
                <Text
                  size="sm"
                  className="font-semibold"
                  style={{ color: role === candidate ? background.primary : text.primary }}
                >
                  {ROLE_LABELS[candidate]}
                </Text>
              </Pressable>
            ))}
          </HStack>

          <VStack className="rounded-xl border p-4 gap-1" style={{ backgroundColor: background.secondary, borderColor: border.primary }}>
            <Text size="xs" className="font-bold tracking-widest text-[#SaffronMuted] uppercase">Demo note</Text>
            <Text size="md">{notice}</Text>
          </VStack>

          <WorkspaceCanvas
            title={`${ROLE_LABELS[role]} Workspace Canvas`}
            subtitle="Responsive renderer demo with snapshot, temporal state, metadata, info, and action slots."
            surfaces={surfaces}
            layout={layout}
            getSurfaceSubtitle={(surface) =>
              SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].subtitle
            }
            getSurfaceSummary={(surface) => SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].summary}
            getSurfaceSnapshot={(surface) =>
              SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].snapshot
            }
            getSurfaceTemporalLabel={(surface) =>
              SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].temporalLabel
            }
            getSurfaceTemporalTone={(surface) =>
              SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].temporalTone
            }
            getSurfaceMetadata={(surface) =>
              SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].metadata
            }
            renderSurfaceActions={(surface) => (
              <HStack className="flex-wrap gap-2">
                {SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].actions.map(
                  (action: string, index: number) =>
                    renderActionButton(action, index === 0 ? 'primary' : 'secondary'),
                )}
              </HStack>
            )}
            renderSurfaceContent={(surface) => (
              <VStack className="gap-1">
                <Text size="sm" className="font-bold">Surface contract</Text>
                <Text size="sm" style={{ color: text.secondary }}>Capability: {surface.capabilityKey}</Text>
                <Text size="sm" style={{ color: text.secondary }}>Package owner: {surface.ownerPackage}</Text>
                <Text size="sm" style={{ color: text.secondary }}>
                  Mobile/Web: {surface.mobileSupport ? 'mobile ' : ''}
                  {surface.webSupport ? 'web' : ''}
                </Text>
              </VStack>
            )}
            onSurfacePress={(surface) => {
              setNotice(`${String(surface.surfaceId)} selected in the ${ROLE_LABELS[role]} canvas.`);
            }}
            onPressSurfaceInfo={(surface) => {
              setNotice(SURFACE_LIBRARY[surface.surfaceId as DemoSurfaceId].info);
            }}
            onToggleHidden={(surface) => {
              updateRoleLayout((current) =>
                setWorkspaceSurfaceHidden(current, surface.surfaceId, !surface.hidden),
              );
              setNotice(
                `${surface.hidden ? 'Restored' : 'Hidden'} ${String(surface.surfaceId)} in the ${ROLE_LABELS[role]} demo.`,
              );
            }}
          />
        </VStack>
      </ScrollView>
    </ScreenWrapper>
  );
}
