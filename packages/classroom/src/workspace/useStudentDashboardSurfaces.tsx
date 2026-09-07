import { ClassroomList } from '@repo/classroom/components';
import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import {
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  NotebookPen,
  PanelsTopLeft,
  Star,
  Wind,
  Zap,
} from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { type ComponentType, type ReactNode, useMemo } from 'react';

export type StudentDashboardSurfaceId =
  | 'temporal-context'
  | 'quick-actions'
  | 'learning-pulse'
  | 'sanctuaries'
  | 'demo-assignments'
  | 'demo-goals';

export type StudentDashboardCapabilityKey =
  | 'StudentTemporalContext'
  | 'StudentQuickActions'
  | 'StudentLearningPulse'
  | 'StudentSanctuaries'
  | 'StudentUpcomingAssignments'
  | 'StudentGoals';

export type StudentDashboardSurface = WorkspaceSurfaceDefinition<
  StudentDashboardSurfaceId,
  StudentDashboardCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
  hiddenByDefault?: boolean;
  content: ReactNode;
};

const DEMO_ASSIGNMENTS = [
  {
    title: 'Wave Function Practice',
    classroom: 'Grade 10 Mathematics',
    daysLeft: 3,
  },
  {
    title: 'Lab Report: Photosynthesis',
    classroom: 'Grade 11 Science',
    daysLeft: 5,
  },
];

const DEMO_GOALS = [
  { text: 'Complete all pending assignments this week', progress: 65 },
  { text: 'Improve mathematics score to A grade', progress: 40 },
  { text: 'Read one library resource daily', progress: 80 },
];

type Args = {
  isGuest: boolean;
  isPastView: boolean;
  isDemoExperience: boolean;
  stats: {
    enrolledClasses: number;
    pendingAssignments: number;
    growthPoints: number;
  };
  onOpenLibrary: () => void;
  onOpenCommunity: () => void;
  onOpenRewards: () => void;
  onOpenTimetable: () => void;
  onOpenBreathing: () => void;
  onOpenReflect: () => void;
  onOpenClassroom: (classroom: { id: string; name: string }) => void;
  onOpenGuestAuth: () => void;
};

function QuickAction({
  icon: LucideIcon,
  label,
  onPress,
  iconColorClass = 'text-templeGold',
  disabled,
}: {
  icon: ComponentType<any>;
  label: string;
  onPress: () => void;
  iconColorClass?: string;
  disabled?: boolean;
}) {
  return (
    <VStack className={`items-center flex-1 gap-1.5 ${disabled ? 'opacity-40' : ''}`}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && !disabled ? { transform: [{ scale: 0.95 }] } : null,
        ]}
      >
        <Box className="w-[52px] h-[52px] rounded-[16px] bg-phase-surface border border-phase-border items-center justify-center shadow-sm">
          <Icon as={LucideIcon} className={iconColorClass} size="md" />
        </Box>
      </Pressable>
      <Text className="text-phaseText-primary text-center text-[10px] font-bold uppercase tracking-widest">
        {label}
      </Text>
    </VStack>
  );
}

function StatWidget({
  icon: LucideIcon,
  label,
  value,
  iconColorClass = 'text-phaseText-secondary',
}: {
  icon: ComponentType<any>;
  label: string;
  value: number | string;
  iconColorClass?: string;
}) {
  return (
    <Box className="flex-1 bg-phase-surface p-5 rounded-[24px] border border-phase-border min-h-[110px] shadow-sm">
      <VStack className="gap-2">
        <Box className="w-8 h-8 rounded-full bg-phase-interactive/5 items-center justify-center">
          <Icon as={LucideIcon} className={iconColorClass} size="sm" />
        </Box>
        <VStack className="gap-0">
          <Text className="text-phaseText-ghost text-[10px] font-bold uppercase tracking-wider">
            {label}
          </Text>
          <Text className="text-phaseText-primary text-2xl font-black tracking-tight">{value}</Text>
        </VStack>
      </VStack>
    </Box>
  );
}

export function useStudentDashboardSurfaces({
  isGuest,
  isPastView,
  isDemoExperience,
  stats,
  onOpenLibrary,
  onOpenCommunity,
  onOpenRewards,
  onOpenTimetable,
  onOpenBreathing,
  onOpenReflect,
  onOpenClassroom,
  onOpenGuestAuth,
}: Args) {
  return useMemo<StudentDashboardSurface[]>(
    () => [
      {
        surfaceId: 'temporal-context',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentTemporalContext',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 10,
        kind: 'widget',
        domain: 'temporal',
        groupId: 'today',
        mobileSupport: true,
        webSupport: true,
        title: 'Move with the day',
        subtitle: 'Temporal context',
        summary: 'See your current learning moment before deciding what to open next.',
        temporalLabel: 'Today',
        metadata: ['Temporal', 'Learning'],
        content: <TemporalNavigator />,
      },
      {
        surfaceId: 'quick-actions',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentQuickActions',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 20,
        kind: 'widget',
        domain: 'actions',
        groupId: 'work',
        mobileSupport: true,
        webSupport: true,
        title: 'Learning shortcuts',
        subtitle: 'Quick actions',
        summary: 'Jump quickly into study tools, communities, breathing, and future rewards.',
        temporalLabel: isPastView ? 'Past view' : 'Ready',
        metadata: ['Library', 'Sanctuaries', 'Breathing'],
        content: (
          <HStack className="gap-2 justify-between p-1">
            <QuickAction
              icon={BookOpen}
              label="Library"
              onPress={onOpenLibrary}
              iconColorClass="text-phase-accent"
              disabled={isPastView}
            />
            <QuickAction
              icon={MessageSquare}
              label="Sanctuary"
              onPress={onOpenCommunity}
              iconColorClass="text-phase-interactive"
              disabled={isPastView}
            />
            <QuickAction
              icon={NotebookPen}
              label="Reflect"
              onPress={onOpenReflect}
              iconColorClass="text-phase-accent"
              disabled={isPastView}
            />
            <QuickAction
              icon={Star}
              label="Rewards"
              onPress={onOpenRewards}
              iconColorClass="text-templeGold"
              disabled={isPastView}
            />
            <QuickAction
              icon={PanelsTopLeft}
              label="Timetable"
              onPress={onOpenTimetable}
              iconColorClass="text-phase-reward"
              disabled={isPastView}
            />
            <QuickAction
              icon={Wind}
              label="Breathing"
              onPress={onOpenBreathing}
              iconColorClass="text-phase-danger"
              disabled={isPastView}
            />
          </HStack>
        ),
      },
      {
        surfaceId: 'learning-pulse',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentLearningPulse',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 30,
        kind: 'widget',
        domain: 'pulse',
        groupId: 'today',
        mobileSupport: true,
        webSupport: true,
        title: 'Learning pulse',
        subtitle: 'Current study state',
        summary: 'Classes, pending assignments, and growth progress at a glance.',
        temporalLabel: stats.pendingAssignments > 0 ? 'Due soon' : 'On track',
        metadata: [
          `Classes ${stats.enrolledClasses}`,
          `Pending ${stats.pendingAssignments}`,
          `Growth ${stats.growthPoints}`,
        ],
        content: (
          <HStack className="gap-4">
            <StatWidget
              icon={ClipboardCheck}
              label="My Classes"
              value={stats.enrolledClasses}
              iconColorClass="text-phase-interactive"
            />
            <StatWidget
              icon={Zap}
              label="Assignments"
              value={stats.pendingAssignments}
              iconColorClass="text-phase-accent"
            />
          </HStack>
        ),
      },
      {
        surfaceId: 'sanctuaries',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentSanctuaries',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 40,
        kind: 'section',
        domain: 'registry',
        groupId: 'work',
        mobileSupport: true,
        webSupport: true,
        title: 'Your sanctuaries',
        subtitle: 'Classroom registry',
        summary: 'Enter the classrooms where your learning is actively happening.',
        temporalLabel: stats.enrolledClasses > 0 ? 'Live' : 'Join first',
        metadata: [`Classes ${stats.enrolledClasses}`, 'Registry', 'Learning flow'],
        content: (
          <VStack className="gap-4">
            <ClassroomList
              onClassroomPress={onOpenClassroom}
              isNested={true}
              emptyContent={
                <PositiveInvitation
                  context="classroom"
                  title={isDemoExperience ? 'Join Your First Sanctuary' : undefined}
                  description={
                    isDemoExperience
                      ? 'Welcome to the student sanctuary. Ready to officially join your classes and begin your quest? Connect with your teachers to get started.'
                      : undefined
                  }
                  actionLabel={isDemoExperience ? 'Join a Classroom' : undefined}
                  onAction={onOpenCommunity}
                />
              }
            />
            {isGuest && (
              <Box className="mt-4">
                <PositiveInvitation
                  type="anonymous"
                  context="classroom"
                  onAction={onOpenGuestAuth}
                />
              </Box>
            )}
          </VStack>
        ),
      },
      {
        surfaceId: 'demo-assignments',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentUpcomingAssignments',
        ownerPackage: 'classroom',
        defaultZone: 'outlook',
        defaultOrder: 50,
        kind: 'widget',
        domain: 'assignments',
        groupId: 'outlook',
        mobileSupport: true,
        webSupport: true,
        hiddenByDefault: !isDemoExperience,
        title: 'Upcoming assignments',
        subtitle: 'Demo learning pressure',
        summary: 'A sample assignment queue for demo and onboarding states.',
        temporalLabel: 'Demo',
        metadata: ['Assignments', 'Demo'],
        content: (
          <VStack className="gap-3">
            {DEMO_ASSIGNMENTS.map((assignment, index) => (
              <Box
                key={index}
                className="bg-phase-surface rounded-[24px] p-5 border border-phase-border shadow-sm"
              >
                <VStack className="gap-1">
                  <Text className="text-phaseText-primary font-black text-lg tracking-tight">
                    {assignment.title}
                  </Text>
                  <Text className="text-phaseText-secondary text-sm font-medium">
                    {assignment.classroom}
                  </Text>
                  <Text className="text-templeGold font-bold text-xs mt-2 uppercase tracking-widest">
                    Due in {assignment.daysLeft} days
                  </Text>
                </VStack>
              </Box>
            ))}
          </VStack>
        ),
      },
      {
        surfaceId: 'demo-goals',
        workspaceId: 'student-dashboard',
        capabilityKey: 'StudentGoals',
        ownerPackage: 'classroom',
        defaultZone: 'private',
        defaultOrder: 60,
        kind: 'widget',
        domain: 'goals',
        groupId: 'private',
        mobileSupport: true,
        webSupport: true,
        hiddenByDefault: !isDemoExperience,
        title: 'My goals',
        subtitle: 'Demo growth goals',
        summary: 'A demo-only preview of student goals and self-tracking.',
        temporalLabel: 'Demo',
        metadata: ['Goals', 'Growth'],
        content: (
          <VStack className="gap-3">
            {DEMO_GOALS.map((goal, index) => (
              <Box
                key={index}
                className="bg-phase-surface rounded-[24px] p-5 border border-phase-border shadow-sm"
              >
                <VStack className="gap-3">
                  <Text className="text-phaseText-primary text-base font-bold leading-snug">
                    {goal.text}
                  </Text>
                  <VStack className="gap-2">
                    <Box className="h-2.5 bg-phase-interactive/10 rounded-full overflow-hidden">
                      <Box
                        className="h-full bg-templeGold rounded-full"
                        style={{ width: `${goal.progress}%` } as any}
                      />
                    </Box>
                    <Text className="text-phaseText-ghost font-bold text-[10px] uppercase tracking-widest">
                      {goal.progress}% complete
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        ),
      },
    ],
    [
      isGuest,
      isPastView,
      isDemoExperience,
      stats.enrolledClasses,
      stats.pendingAssignments,
      stats.growthPoints,
      onOpenLibrary,
      onOpenCommunity,
      onOpenRewards,
      onOpenTimetable,
      onOpenBreathing,
      onOpenReflect,
      onOpenClassroom,
      onOpenGuestAuth,
    ],
  );
}
