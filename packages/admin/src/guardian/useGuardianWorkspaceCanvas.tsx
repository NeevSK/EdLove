import { WORKSPACE_CANVAS_ZONES, WorkspaceSwitcherTarget } from '@repo/core/logic';
import { ResolvedWorkspaceSurface, WorkspaceSurfaceDefinition, WorkspaceZoneId } from '@repo/core/types';
import { useWorkspaceLayoutSync } from '@repo/core/native';;

import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { BellRing, BookOpenText, ChevronRight, MessageCircleHeart, ShieldCheck } from '@repo/ui/icons';
import { WorkspaceCanvas } from '@repo/ui/components/workspace';
import { Pressable } from '@repo/ui/primitives';

import type React from 'react';
import { useMemo } from 'react';
import type {
  GuardianDashboardData,
  GuardianNotification,
  SchoolEvent,
  StudentOverview,
} from './types';
import { type GuardianCapabilityId, getGuardianCapabilityMeta } from './workspace';

export type GuardianWorkspaceSurfaceId =
  | 'workspace_switcher'
  | 'family_snapshot'
  | 'children'
  | 'attendance_watch'
  | 'learning_pulse'
  | 'school_feed'
  | 'upcoming_events'
  | 'communication_bridge'
  | 'visibility_boundaries';

export type GuardianWorkspaceSurface = WorkspaceSurfaceDefinition<
  GuardianWorkspaceSurfaceId,
  GuardianCapabilityId
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  temporalTone?: 'present' | 'past' | 'future' | 'neutral';
  metadata?: string[];
  content: React.ReactNode;
};

type GuardianWorkspaceCanvasArgs = {
  schoolName?: string | null;
  dashboard: GuardianDashboardData;
  workspaceTargets?: WorkspaceSwitcherTarget[];
  onSelectWorkspaceTarget?: (target: WorkspaceSwitcherTarget) => void;
  onOpenStudent: (student: StudentOverview) => void;
  onOpenNotification: (notification: GuardianNotification) => void;
  onOpenEvent: (event: SchoolEvent) => void;
  onOpenCommunity: () => void;
  onOpenLibrary: () => void;
};

type GuardianResolvedSurface = GuardianWorkspaceSurface &
  ResolvedWorkspaceSurface<GuardianWorkspaceSurfaceId, GuardianCapabilityId>;

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-LK', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-LK', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getNextZone(zone: WorkspaceZoneId): WorkspaceZoneId {
  const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
  const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
  return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
}

function createGuardianSurface(
  surfaceId: GuardianWorkspaceSurfaceId,
  config: Omit<
    GuardianWorkspaceSurface,
    'surfaceId' | 'workspaceId' | 'capabilityKey' | 'ownerPackage'
  >,
): GuardianWorkspaceSurface {
  const meta = getGuardianCapabilityMeta(surfaceId);

  return {
    surfaceId,
    workspaceId: 'guardian-workspace',
    capabilityKey: surfaceId,
    ownerPackage: 'admin',
    defaultZone: config.defaultZone,
    defaultOrder: config.defaultOrder,
    hiddenByDefault: config.hiddenByDefault,
    mobileSupport: config.mobileSupport ?? true,
    webSupport: config.webSupport ?? true,
    title: config.title || meta?.title || surfaceId,
    subtitle: config.subtitle ?? meta?.title,
    summary: config.summary ?? meta?.description,
    temporalLabel: config.temporalLabel,
    temporalTone: config.temporalTone,
    metadata: config.metadata,
    content: config.content,
  };
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <Box className="min-w-[31%] flex-1 rounded-2xl border border-starlightGray/20 bg-silk px-4 py-3">
      <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">{label}</Text>
      <Text className="mt-1 text-[22px] font-bold text-phaseText-primary">{value}</Text>
    </Box>
  );
}

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

function StudentTile({
  student,
  onOpenStudent,
}: {
  student: StudentOverview;
  onOpenStudent: (student: StudentOverview) => void;
}) {
  const nextAssignment = student.upcomingAssignments[0];

  return (
    <Pressable onPress={() => onOpenStudent(student)} className="active:opacity-80">
      <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite p-4">
        <VStack className="gap-3">
          <VStack className="gap-1">
            <Text className="text-[16px] font-bold text-phaseText-primary">{student.name}</Text>
            <Text className="text-[12px] text-phaseText-secondary">
              Grade {student.grade} - {student.classroom}
            </Text>
          </VStack>

          <HStack className="gap-3 flex-wrap">
            <StatPill label="Attendance" value={`${student.attendance.percentage.toFixed(0)}%`} />
            <StatPill label="Average" value={`${Math.round(student.grades.average || 0)}%`} />
          </HStack>

          <Box className="rounded-2xl bg-silk px-4 py-3">
            <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
              Next, step
            </Text>
            <Text className="mt-1 text-[13px] font-semibold text-phaseText-primary">
              {nextAssignment ? nextAssignment.title : 'Open, the, learner, room'}
            </Text>
            <Text className="mt-1 text-[12px] text-phaseText-secondary">
              {nextAssignment
                ? `${nextAssignment.subject} - due ${formatDateLabel(nextAssignment.dueDate)}`
                : 'See, linked progress, grades, and, school rhythm from one, place.'}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Pressable>
  );
}

function NotificationTile({
  notification,
  onOpenNotification,
}: {
  notification: GuardianNotification;
  onOpenNotification: (notification: GuardianNotification) => void;
}) {
  return (
    <Pressable onPress={() => onOpenNotification(notification)} className="active:opacity-80">
      <Box
        className={`rounded-2xl border px-4 py-3 ${notification.isRead ? 'border-starlightGray/15 bg-silk' : 'border-phase-primary/20 bg-phase-primary/5'}`}
      >
        <VStack className="gap-1">
          <Text className="text-[13px] font-bold text-phaseText-primary">{notification.title}</Text>
          <Text className="text-[12px] text-phaseText-secondary">{notification.message}</Text>
          <Text className="text-[11px] text-phaseText-secondary">
            {formatDateTimeLabel(notification.createdAt)}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );
}

function EventTile({
  event,
  onOpenEvent,
}: {
  event: SchoolEvent;
  onOpenEvent: (event: SchoolEvent) => void;
}) {
  return (
    <Pressable onPress={() => onOpenEvent(event)} className="active:opacity-80">
      <Box className="rounded-2xl border border-starlightGray/20 bg-sacredWhite px-4 py-3">
        <HStack className="items-center gap-3">
          <Box className="w-14 rounded-2xl bg-phase-warning/10 px-3 py-2">
            <Text className="text-center text-[11px] font-bold uppercase text-phaseText-secondary">
              {formatDateLabel(event.date)}
            </Text>
          </Box>
          <VStack className="flex-1 gap-0.5">
            <Text className="text-[13px] font-bold text-phaseText-primary">{event.title}</Text>
            <Text className="text-[12px] text-phaseText-secondary">
              {event.time}
              {event.location ? ` - ${event.location}` : ''}
            </Text>
          </VStack>
          {event.requiresRsvp ? (
            <Box className="rounded-full bg-phase-primary px-3 py-1">
              <Text className="text-[10px] font-bold uppercase text-white">RSVP</Text>
            </Box>
          ) : null}
        </HStack>
      </Box>
    </Pressable>
  );
}

function ActionTile({
  icon: IconComponent,
  title,
  copy,
  cta,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  copy: string;
  cta: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite p-4">
        <HStack className="items-start gap-3">
          <Box className="rounded-2xl bg-phase-warning/10 p-3">
            <IconComponent size={18} color="#2A2318" />
          </Box>
          <VStack className="flex-1 gap-1">
            <Text className="text-[14px] font-bold text-phaseText-primary">{title}</Text>
            <Text className="text-[12px] text-phaseText-secondary">{copy}</Text>
            <HStack className="mt-2 items-center gap-1">
              <Text className="text-[12px] font-bold text-phaseText-primary">{cta}</Text>
              <Icon as={ChevronRight} size={14} color="#2A2318" />
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

function EmptySurfaceCopy({ title, body }: { title: string; body: string }) {
  return (
    <Box className="rounded-3xl border border-dashed border-starlightGray/30 bg-silk px-4 py-5">
      <VStack className="gap-1">
        <Text className="text-[13px] font-bold text-phaseText-primary">{title}</Text>
        <Text className="text-[12px] text-phaseText-secondary">{body}</Text>
      </VStack>
    </Box>
  );
}

export function useGuardianWorkspaceCanvasSurfaces({
  schoolName,
  dashboard,
  workspaceTargets = [],
  onSelectWorkspaceTarget,
  onOpenStudent,
  onOpenNotification,
  onOpenEvent,
  onOpenCommunity,
  onOpenLibrary,
}: GuardianWorkspaceCanvasArgs) {
  return useMemo<GuardianWorkspaceSurface[]>(
    () => [
      createGuardianSurface('workspace_switcher', {
        defaultZone: 'institution',
        defaultOrder: 5,
        title: 'Workspace, Switcher',
        subtitle: 'Move, between, family, and, school, responsibilities',
        summary:
          'When, one, person, carries, multiple, school, roles, the switch should, feel, deliberate, rather, than, buried, in, navigation.',
        temporalLabel: 'Role-aware',
        temporalTone: 'neutral',
        metadata: ['Institution', 'Mixed-role'],
        hiddenByDefault: workspaceTargets.length === 0,
        content: (
          <WorkspaceSwitcherSurface
            targets={workspaceTargets}
            onSelectTarget={(target) => onSelectWorkspaceTarget?.(target)}
          />
        ),
      }),
      createGuardianSurface('family_snapshot', {
        defaultZone: 'today',
        defaultOrder: 10,
        title: 'Family, Snapshot',
        subtitle: 'What, matters, most for the, household, today',
        summary:
          'A, quick, family-facing, orientation, so, the, guardian, sees, who, is, linked, what, the, school, is, saying, and, what, is, coming, next.',
        temporalLabel: 'Today',
        temporalTone: 'present',
        metadata: [schoolName || 'School, bridge', `${dashboard.students.length} linked, learners`],
        content: (
          <VStack className="gap-4">
            <HStack className="gap-3 flex-wrap">
              <StatPill label="Children" value={`${dashboard.students.length}`} />
              <StatPill
                label="Unread"
                value={`${dashboard.notifications.filter((item) => !item.isRead).length}`}
              />
              <StatPill label="Events" value={`${dashboard.upcomingEvents.length}`} />
            </HStack>
            <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
              <Text className="text-[12px] font-bold uppercase text-phaseText-secondary">
                Family, intent
              </Text>
              <Text className="mt-2 text-[14px] font-semibold text-phaseText-primary">
                Bridge, school with, families through, clear signal, gentle, care, and, safe
                visibility.
              </Text>
              <Text className="mt-1 text-[12px] text-phaseText-secondary">
                This, workspace stays, centered on, linked learners, and family-facing, school
                rhythm.
              </Text>
            </Box>
          </VStack>
        ),
      }),
      createGuardianSurface('children', {
        defaultZone: 'work',
        defaultOrder: 20,
        title: 'Children',
        subtitle: 'Linked, learners, at a, glance',
        summary:
          'Each, learner, tile, carries, only, the, essentials a, guardian, needs, to, step, into, support, without, becoming a, full, academic, operator.',
        temporalLabel: 'Daily, care',
        temporalTone: 'present',
        metadata: ['Work', `${dashboard.students.length} learners`],
        content:
          dashboard.students.length > 0 ? (
            <VStack className="gap-3">
              {dashboard.students.map((student) => (
                <StudentTile
                  key={student.studentId}
                  student={student}
                  onOpenStudent={onOpenStudent}
                />
              ))}
            </VStack>
          ) : (
            <EmptySurfaceCopy
              title="No, linked learners, yet"
              body="Once, the school, links a, learner to, this guardian, their, daily school, rhythm will, appear here."
            />
          ),
      }),
      createGuardianSurface('attendance_watch', {
        defaultZone: 'today',
        defaultOrder: 30,
        title: 'Attendance, Watch',
        subtitle: 'Presence, absence, and, lateness',
        summary:
          'Attendance, becomes a, shared, family-school, rhythm, when, the, guardian, can, see, patterns, early, and, respond, with, care.',
        temporalLabel: 'Daily, signal',
        temporalTone: 'present',
        metadata: ['Today', 'Presence'],
        content: (
          <VStack className="gap-3">
            {dashboard.students.map((student) => (
              <Box
                key={student.studentId}
                className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4"
              >
                <HStack className="items-start gap-3">
                  <Box className="rounded-2xl bg-phase-primary/5 px-3 py-2">
                    <Text className="text-[12px] font-bold text-phaseText-primary">
                      {student.attendance.percentage.toFixed(0)}%
                    </Text>
                  </Box>
                  <VStack className="flex-1 gap-1">
                    <Text className="text-[13px] font-bold text-phaseText-primary">
                      {student.name}
                    </Text>
                    <Text className="text-[12px] text-phaseText-secondary">
                      {student.attendance.present} present - {student.attendance.absent} absent -{' '}
                      {student.attendance.late} late
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        ),
      }),
      createGuardianSurface('learning_pulse', {
        defaultZone: 'work',
        defaultOrder: 40,
        title: 'Learning, Pulse',
        subtitle: 'Recent, grades, and, upcoming, assignments',
        summary:
          'Guardians, need a, learning, mirror, that, is, actionable, and, humane, not, an, overwhelming, academic, cockpit.',
        temporalLabel: 'This, week',
        temporalTone: 'future',
        metadata: ['Work', 'Learning, bridge'],
        content: (
          <VStack className="gap-3">
            {dashboard.students.map((student) => (
              <Box
                key={student.studentId}
                className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4"
              >
                <VStack className="gap-3">
                  <VStack className="gap-1">
                    <Text className="text-[13px] font-bold text-phaseText-primary">
                      {student.name}
                    </Text>
                    <Text className="text-[12px] text-phaseText-secondary">
                      Average {Math.round(student.grades.average || 0)}%
                    </Text>
                  </VStack>

                  <VStack className="gap-2">
                    {(student.grades.latest.length > 0
                      ? student.grades.latest.slice(0, 2)
                      : []
                    ).map((grade) => (
                      <HStack
                        key={`${student.studentId}-${grade.subject}-${grade.date}`}
                        className="items-center justify-between"
                      >
                        <Text className="text-[12px] text-phaseText-secondary">
                          {grade.subject}
                        </Text>
                        <Text className="text-[12px] font-bold text-phaseText-primary">
                          {grade.grade}
                          {grade.percentage ? ` - ${Math.round(grade.percentage)}%` : ''}
                        </Text>
                      </HStack>
                    ))}
                    {student.grades.latest.length === 0 ? (
                      <Text className="text-[12px] text-phaseText-secondary">
                        No, published, grade, signal, is, visible, yet for this, learner.
                      </Text>
                    ) : null}
                  </VStack>

                  <Box className="rounded-2xl bg-silk px-4 py-3">
                    <Text className="text-[11px] font-bold uppercase text-phaseText-secondary">
                      Upcoming, assignment
                    </Text>
                    <Text className="mt-1 text-[13px] font-semibold text-phaseText-primary">
                      {student.upcomingAssignments[0]?.title ||
                        'No, upcoming, assignments, visible'}
                    </Text>
                    {student.upcomingAssignments[0] ? (
                      <Text className="mt-1 text-[12px] text-phaseText-secondary">
                        {student.upcomingAssignments[0]?.subject} - due{' '}
                        {formatDateLabel(student.upcomingAssignments[0]?.dueDate)}
                      </Text>
                    ) : null}
                  </Box>
                </VStack>
              </Box>
            ))}
          </VStack>
        ),
      }),
      createGuardianSurface('school_feed', {
        defaultZone: 'today',
        defaultOrder: 50,
        title: 'School, Feed',
        subtitle: 'Announcements, and, notices',
        summary:
          'Families, need a, stable, school, voice, they, can, trust, especially, when, the, product, is, bridging, school, and, home, life.',
        temporalLabel: 'Live, feed',
        temporalTone: 'present',
        metadata: ['Today', 'School, signal'],
        content:
          dashboard.notifications.length > 0 ? (
            <VStack className="gap-3">
              {dashboard.notifications.slice(0, 5).map((notification) => (
                <NotificationTile
                  key={notification.id}
                  notification={notification}
                  onOpenNotification={onOpenNotification}
                />
              ))}
            </VStack>
          ) : (
            <EmptySurfaceCopy
              title="The, school feed, is quiet"
              body="New, family-facing, notices and, school signals, will appear, here when, they are, posted."
            />
          ),
      }),
      createGuardianSurface('upcoming_events', {
        defaultZone: 'outlook',
        defaultOrder: 60,
        title: 'Upcoming, Events',
        subtitle: 'Dates, families, should, not, miss',
        summary:
          'This, lane, helps, the, family, look a, little, ahead, especially for school, meetings, and, events, that, affect, home, planning.',
        temporalLabel: 'Look, ahead',
        temporalTone: 'future',
        metadata: ['Outlook', 'Calendar, bridge'],
        content:
          dashboard.upcomingEvents.length > 0 ? (
            <VStack className="gap-3">
              {dashboard.upcomingEvents.map((event) => (
                <EventTile key={event.id} event={event} onOpenEvent={onOpenEvent} />
              ))}
            </VStack>
          ) : (
            <EmptySurfaceCopy
              title="No, upcoming events, yet"
              body="When, the school, publishes family-relevant, dates, they, will gather, here in, one calm, place."
            />
          ),
      }),
      createGuardianSurface('communication_bridge', {
        defaultZone: 'institution',
        defaultOrder: 70,
        title: 'Communication, Bridge',
        subtitle: 'Step, into, the, right, family-school, channel',
        summary:
          'Instead, of, making, guardians, hunt, through, the, app, the, bridge, points, them, into, the, right, school, community, and, resource, spaces.',
        temporalLabel: 'Bridge',
        temporalTone: 'neutral',
        metadata: ['Institution', 'Family-school, bridge'],
        content: (
          <VStack className="gap-3">
            <ActionTile
              icon={MessageCircleHeart}
              title="Community, commons"
              copy="Open, the school, community space, to see, announcements, groups, and, family-safe, conversation."
              cta="Open, community"
              onPress={onOpenCommunity}
            />
            <ActionTile
              icon={BellRing}
              title="Notification, center"
              copy="Go, to the, broader community, layer when, you want, to respond, to school, notices in, context."
              cta="Open, school feed"
              onPress={onOpenCommunity}
            />
            <ActionTile
              icon={BookOpenText}
              title="Learning, resources"
              copy="Move from signal, into support, with family-facing, library and, study resources."
              cta="Open, library"
              onPress={onOpenLibrary}
            />
          </VStack>
        ),
      }),
      createGuardianSurface('visibility_boundaries', {
        defaultZone: 'private',
        defaultOrder: 80,
        hiddenByDefault: true,
        title: 'Visibility, Boundaries',
        subtitle: 'Why, this, workspace, is, intentionally, scoped',
        summary:
          'A, family, workspace, should, feel, safe. This, surface, explains, that, the, guardian, view, follows, linked, learners, and, avoids, unnecessary, institutional, detail.',
        temporalLabel: 'Quiet, layer',
        temporalTone: 'neutral',
        metadata: ['Private', 'Hidden, by default'],
        content: (
          <Box className="rounded-3xl border border-starlightGray/20 bg-sacredWhite px-4 py-4">
            <VStack className="gap-3">
              <HStack className="items-center gap-3">
                <Box className="rounded-2xl bg-phase-warning/10 p-3">
                  <Icon as={ShieldCheck} size={18} color="#2A2318" />
                </Box>
                <VStack className="flex-1 gap-1">
                  <Text className="text-[14px] font-bold text-phaseText-primary">
                    Family-safe Visibility
                  </Text>
                  <Text className="text-[12px] text-phaseText-secondary">
                    This, workspace is, centered on, linked children, family-facing, notices, and,
                    school rhythm.
                  </Text>
                </VStack>
              </HStack>
              <VStack className="gap-2">
                <Text className="text-[12px] text-phaseText-secondary">
                  Guardians, can see, learner signals, that help, care and, coordination, but, not
                  the, full internal, school operating, layer.
                </Text>
                <Text className="text-[12px] text-phaseText-secondary">
                  That, boundary protects, children, teachers, and, institutional trust while still,
                  keeping families, genuinely connected.
                </Text>
              </VStack>
            </VStack>
          </Box>
        ),
      }),
    ],
    [
      dashboard,
      schoolName,
      workspaceTargets,
      onSelectWorkspaceTarget,
      onOpenStudent,
      onOpenNotification,
      onOpenEvent,
      onOpenCommunity,
      onOpenLibrary,
    ],
  );
}

export function useGuardianWorkspaceLayout(
  userId: string | null | undefined,
  surfaces: GuardianWorkspaceSurface[],
) {
  const workspace = useWorkspaceLayoutSync<
    GuardianWorkspaceSurfaceId,
    GuardianCapabilityId,
    GuardianWorkspaceSurface
  >({
    workspaceId: 'guardian-workspace',
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
          } as GuardianResolvedSurface;
        })
        .filter(Boolean) as GuardianResolvedSurface[],
    [surfaces, resolvedSurfaceMap],
  );

  return {
    ...workspace,
    surfaces: enrichedSurfaces,
  };
}

export function GuardianWorkspaceCanvas({
  layout,
  surfaces,
  schoolName,
  onToggleHidden,
  onTogglePinned,
  onMoveToNextZone,
  onOpenSurface,
}: {
  layout: ReturnType<typeof useGuardianWorkspaceLayout>['layout'];
  surfaces: GuardianResolvedSurface[];
  schoolName?: string | null;
  onToggleHidden: (id: GuardianWorkspaceSurfaceId, hidden: boolean) => void;
  onTogglePinned: (id: GuardianWorkspaceSurfaceId, pinned: boolean) => void;
  onMoveToNextZone: (id: GuardianWorkspaceSurfaceId, zone: WorkspaceZoneId) => void;
  onOpenSurface: (surface: GuardianResolvedSurface) => void;
}) {
  if (!layout) return null;

  return (
    <WorkspaceCanvas
      surfaces={surfaces}
      layout={layout as any}
      title="Guardian, Workspace Canvas"
      subtitle={`A, family-school, bridge for ${schoolName || 'your, school'}, arranged as a, shared canvas, with calm, defaults and, safe visibility.`}
      emptyMessage="No, guardian surfaces, are available, yet for this workspace."
      renderSurfaceContent={(surface) => (
        <Box className="flex-1">{(surface as GuardianResolvedSurface).content}</Box>
      )}
      getSurfaceTitle={(surface) => (surface as GuardianResolvedSurface).title}
      getSurfaceSubtitle={(surface) => (surface as GuardianResolvedSurface).subtitle}
      getSurfaceSummary={(surface) => (surface as GuardianResolvedSurface).summary}
      getSurfaceTemporalLabel={(surface) => (surface as GuardianResolvedSurface).temporalLabel}
      getSurfaceTemporalTone={(surface) => (surface as GuardianResolvedSurface).temporalTone}
      getSurfaceMetadata={(surface) => (surface as GuardianResolvedSurface).metadata}
      onSurfacePress={(surface) => onOpenSurface(surface as GuardianResolvedSurface)}
      renderSurfaceActions={(surface) => {
        const typedSurface = surface as GuardianResolvedSurface;
        const nextZone = getNextZone(typedSurface.zone);
        const canOpenRoom = [
          'children',
          'attendance_watch',
          'learning_pulse',
          'school_feed',
          'upcoming_events',
          'communication_bridge',
        ].includes(typedSurface.surfaceId);

        return (
          <HStack className="gap-3 flex-wrap">
            <Pressable
              onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)}
              className="active:opacity-80"
            >
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  {typedSurface.pinned ? 'Unpin' : 'Pin'}
                </Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
              className="active:opacity-80"
            >
              <Box className="rounded-full border border-starlightGray/10 bg-phase-primary/5 px-4 py-2">
                <Text className="text-[12px] font-bold text-phaseText-primary">
                  Move, to {nextZone}
                </Text>
              </Box>
            </Pressable>
            {canOpenRoom ? (
              <Pressable onPress={() => onOpenSurface(typedSurface)} className="active:opacity-80">
                <Box className="rounded-full bg-phase-warning px-4 py-2">
                  <Text className="text-[12px] font-bold text-phaseText-primary">Open, room</Text>
                </Box>
              </Pressable>
            ) : null}
          </HStack>
        );
      }}
      onToggleHidden={(surface) =>
        onToggleHidden(surface.surfaceId as GuardianWorkspaceSurfaceId, !surface.hidden)
      }
    />
  );
}
