import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { TemporalNavigator } from '@repo/ui/components/TemporalNavigator';
import { useThemedColors } from '@repo/ui/hooks';
import {
  BookOpen,
  ClipboardList,
  MessageCircle,
  Plus,
  ScanLine,
  School,
  ShieldCheck,
  Users,
  Wind,
  Zap,
} from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import type { ComponentType, ReactNode } from 'react';
import { useMemo } from 'react';
import { ClassroomList } from '@/components';

export type TeacherDashboardSurfaceId =
  | 'temporal-context'
  | 'primary-actions'
  | 'support-tools'
  | 'pulse'
  | 'classroom-registry';

export type TeacherDashboardCapabilityKey =
  | 'TeacherTemporalContext'
  | 'TeacherPrimaryActions'
  | 'TeacherSupportTools'
  | 'TeacherPulse'
  | 'TeacherClassroomRegistry';

export type TeacherDashboardSurface = WorkspaceSurfaceDefinition<
  TeacherDashboardSurfaceId,
  TeacherDashboardCapabilityKey
> & {
  title: string;
  subtitle?: string;
  summary?: string;
  temporalLabel?: string;
  metadata?: string[];
  content: ReactNode;
};

// ─── Helper Components ───────────────────────────────────────────────────────

function QuickAction({
  icon: LucideIcon,
  label,
  onPress,
  color,
  disabled,
}: {
  icon: ComponentType<any>;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`
                flex-1 items-center justify-center rounded-[24px] border min-h-[112px]
                ${disabled ? 'opacity-50' : 'opacity-100'}
                bg-phase-surface-secondary border-phase-border
            `}
    >
      <Box className="p-3 rounded-xl bg-phase-surface-tertiary mb-2">
        <Icon
          as={LucideIcon}
          className={color ? '' : 'text-sanctuarySaffron'}
          style={color ? { color } : {}}
          size={22}
        />
      </Box>
      <Text className="text-center text-[10px] font-black uppercase tracking-wider text-phase-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}

function StatCard({
  icon: LucideIcon,
  label,
  value,
  isDemoMode,
}: {
  icon: ComponentType<any>;
  label: string;
  value: number | string;
  isDemoMode: boolean;
}) {
  return (
    <Box className="flex-1 bg-phase-surface-secondary p-6 rounded-[24px] border border-phase-border relative overflow-hidden min-h-[100px]">
      <VStack className="z-10 gap-1">
        <Text className="text-[10px] font-black uppercase tracking-wider text-phase-text-secondary">
          {label}
        </Text>
        <Text className="text-3xl font-black text-phase-text-primary">
          {value}
          {isDemoMode ? '*' : ''}
        </Text>
      </VStack>

      {isDemoMode && (
        <Box className="absolute top-2 right-2">
          <Icon as={Zap} size={12} className="text-sanctuarySaffron" fill="#F6BF8C" />
        </Box>
      )}

      <Box className="absolute -right-2 -bottom-2 opacity-[0.05]">
        <Icon as={LucideIcon} className="text-phase-text-primary" size={80} />
      </Box>
    </Box>
  );
}

// ─── Hook Definition ─────────────────────────────────────────────────────────

type Args = {
  isDemoMode: boolean;
  isGuest: boolean;
  isPastView: boolean;
  stats: { activeClasses: number; totalStudents: number };
  refreshTrigger: number;
  openCreateFlow: (mode: 'create' | 'join') => void;
  setIsScannerOpen: (value: boolean) => void;
  setIsAdminModalOpen: (value: boolean) => void;
  setIsFeedbackModalOpen: (value: boolean) => void;
  setShowEchoHistory: (value: boolean) => void;
  setIsBreathingOpen: (value: boolean) => void;
  onOpenLibrary: () => void;
  handleClassroomsLoaded: (
    classrooms: Array<{
      id: string;
      name: string;
      student_count?: number | null;
    }>,
  ) => void;
  onOpenClassroom: (classroom: { id: string; name: string }) => void;
};

export function useTeacherDashboardSurfaces({
  isDemoMode,
  isGuest,
  isPastView,
  stats,
  refreshTrigger,
  openCreateFlow,
  setIsScannerOpen,
  setIsAdminModalOpen,
  setIsFeedbackModalOpen,
  setShowEchoHistory,
  setIsBreathingOpen,
  onOpenLibrary,
  handleClassroomsLoaded,
  onOpenClassroom,
}: Args) {
  const colors = useThemedColors();

  return useMemo<TeacherDashboardSurface[]>(
    () => [
      {
        surfaceId: 'temporal-context',
        workspaceId: 'teacher-dashboard',
        capabilityKey: 'TeacherTemporalContext',
        ownerPackage: 'classroom',
        defaultZone: 'today',
        defaultOrder: 10,
        mobileSupport: true,
        webSupport: true,
        title: 'Move with the day',
        subtitle: 'Temporal context',
        summary: 'Keep the classroom rhythm visible before deciding what needs attention next.',
        temporalLabel: 'Today',
        metadata: ['Temporal', 'Context'],
        content: <TemporalNavigator />,
      },
      {
        surfaceId: 'primary-actions',
        workspaceId: 'teacher-dashboard',
        capabilityKey: 'TeacherPrimaryActions',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 20,
        mobileSupport: true,
        webSupport: true,
        title: 'Begin, invite, or enter',
        subtitle: 'Primary actions',
        summary:
          'The first teacher moves. Everything else should support them, not compete with them.',
        temporalLabel: isPastView ? 'Past view' : 'Action ready',
        metadata: ['Create', 'Join', 'Scan'],
        content: (
          <HStack className="gap-4">
            <QuickAction
              icon={Plus}
              label="Create Class"
              onPress={() => openCreateFlow('create')}
              disabled={isPastView}
            />
            <QuickAction
              icon={Users}
              label="Join Class"
              onPress={() => openCreateFlow('join')}
              color={Theme.colors.sanctuarySaffron}
              disabled={isPastView}
            />
            <QuickAction
              icon={ScanLine}
              label="Scan QR"
              onPress={() => setIsScannerOpen(true)}
              color={Theme.colors.amberGlow}
              disabled={isPastView}
            />
          </HStack>
        ),
      },
      {
        surfaceId: 'support-tools',
        workspaceId: 'teacher-dashboard',
        capabilityKey: 'TeacherSupportTools',
        ownerPackage: 'classroom',
        defaultZone: 'private',
        defaultOrder: 30,
        mobileSupport: true,
        webSupport: true,
        title: 'Secondary utilities',
        subtitle: 'Support tools',
        summary:
          'Administrative, reflective, and message-oriented actions stay close, but quieter than the main classroom workflow.',
        temporalLabel: 'Support',
        metadata: ['Admin', 'Echoes', 'Breathing'],
        content: (
          <HStack className="gap-4 flex-wrap justify-between">
            <Box className="w-[48%]">
              <QuickAction
                icon={ShieldCheck}
                label="Admin"
                onPress={() => setIsAdminModalOpen(true)}
                color={Theme.colors.sageGreen}
              />
            </Box>
            <Box className="w-[48%]">
              <QuickAction
                icon={BookOpen}
                label="Library"
                onPress={onOpenLibrary}
                color={Theme.colors.amberGlow}
              />
            </Box>
            <Box className="w-[48%]">
              <QuickAction
                icon={MessageCircle}
                label="Principal Echo"
                onPress={() => setIsFeedbackModalOpen(true)}
                color={Theme.colors.emberRed}
              />
            </Box>
            <Box className="w-[48%]">
              <QuickAction
                icon={ClipboardList}
                label="My Echoes"
                onPress={() => setShowEchoHistory(true)}
                color={colors.action}
              />
            </Box>
            <Box className="w-[48%]">
              <QuickAction
                icon={Wind}
                label="Breathing"
                onPress={() => setIsBreathingOpen(true)}
                color={colors.success}
              />
            </Box>
          </HStack>
        ),
      },
      {
        surfaceId: 'pulse',
        workspaceId: 'teacher-dashboard',
        capabilityKey: 'TeacherPulse',
        ownerPackage: 'classroom',
        defaultZone: 'outlook',
        defaultOrder: 40,
        mobileSupport: true,
        webSupport: true,
        title: 'A quick read before you enter',
        subtitle: 'Pulse',
        summary:
          'Stats support the registry. They should orient you, not become a competing dashboard.',
        temporalLabel: 'Snapshot',
        metadata: [`Classes ${stats.activeClasses}`, `Students ${stats.totalStudents}`],
        content: (
          <HStack className="gap-4">
            <StatCard
              icon={School}
              label="Active Classes"
              value={stats.activeClasses}
              isDemoMode={isDemoMode}
            />
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats.totalStudents}
              isDemoMode={isDemoMode}
            />
          </HStack>
        ),
      },
      {
        surfaceId: 'classroom-registry',
        workspaceId: 'teacher-dashboard',
        capabilityKey: 'TeacherClassroomRegistry',
        ownerPackage: 'classroom',
        defaultZone: 'work',
        defaultOrder: 50,
        mobileSupport: true,
        webSupport: true,
        title: 'Your classrooms',
        subtitle: 'Classroom registry',
        summary:
          'This is the main working lane. Open a sanctuary, move into the live dashboard, and keep the day flowing from here.',
        temporalLabel: stats.activeClasses > 0 ? 'Live' : 'Onboarding',
        metadata: [`Classes ${stats.activeClasses}`, 'Registry', 'Daily work'],
        content: (
          <VStack className="gap-6">
            <ClassroomList
              onClassroomPress={onOpenClassroom}
              onDataLoaded={handleClassroomsLoaded}
              isNested={true}
              refreshTrigger={refreshTrigger}
              emptyContent={
                <PositiveInvitation
                  context="classroom"
                  title={isDemoMode ? 'Create Your First Sanctuary' : undefined}
                  description={
                    isDemoMode
                      ? 'Ready to lead your first classroom? Generate a sanctuary for your students to begin their journey.'
                      : undefined
                  }
                  actionLabel={isDemoMode ? 'Create My First Classroom' : undefined}
                  onAction={() => openCreateFlow('create')}
                />
              }
            />
            {isGuest && (
              <Box className="mt-4">
                <PositiveInvitation type="anonymous" onAction={() => {}} />
              </Box>
            )}
          </VStack>
        ),
      },
    ],
    [
      colors,
      isDemoMode,
      isGuest,
      isPastView,
      stats.activeClasses,
      stats.totalStudents,
      refreshTrigger,
      openCreateFlow,
      setIsScannerOpen,
      setIsAdminModalOpen,
      setIsFeedbackModalOpen,
      setShowEchoHistory,
      setIsBreathingOpen,
      onOpenLibrary,
      handleClassroomsLoaded,
      onOpenClassroom,
    ],
  );
}
