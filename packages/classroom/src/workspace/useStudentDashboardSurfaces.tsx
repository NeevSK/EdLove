import React, { useMemo } from 'react';
import {
    Box,
    HStack,
    PositiveInvitation,
    TemporalNavigator,
    Text,
    Theme,
    VStack,
    type WorkspaceSurfaceDefinition,
} from '@repo/ui';
import { BookOpen, ClipboardCheck, Layout, MessageSquare, Star, Wind, Zap } from 'lucide-react-native';
import { ClassroomList } from '../components';

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

export type StudentDashboardSurface = WorkspaceSurfaceDefinition    StudentDashboardSurfaceId,
    StudentDashboardCapabilityKey
> & {
    title: string;
    subtitle?: string;
    summary?: string;
    temporalLabel?: string;
    metadata?: string[];
    hiddenByDefault?: boolean;
    content: React.ReactNode;
};

const DEMO_ASSIGNMENTS = [
    { title: 'Wave Function Practice', classroom: 'Grade 10 Mathematics', daysLeft: 3 },
    { title: 'Lab Report: Photosynthesis', classroom: 'Grade 11 Science', daysLeft: 5 },
];

const DEMO_GOALS = [
    { text: 'Complete all pending assignments this week', progress: 65 },
    { text: 'Improve mathematics score to A grade', progress: 40 },
    { text: 'Read one library resource daily', progress: 80 },
];

type Args = {
    colors: any;
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
    onOpenClassroom: (classroom: { id: string; name: string }) => void;
    onOpenGuestAuth: () => void;
};

function QuickAction({
    icon: LucideIcon,
    label,
    onPress,
    color,
    disabled,
    colors,
}: {
    icon: any;
    label: string;
    onPress: () => void;
    color?: string;
    disabled?: boolean;
    colors: any;
}) {
    return (
        <VStack
            alignItems="center"
            sx={{
                flex: 1,
                gap: Theme.spacing.xs,
                opacity: disabled ? 0.5 : 1,>
            }}
                    <Box
                asChild
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,>
                }}
                            <button onClick={disabled ? undefined : onPress as any}                    <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} /                ></button            </Box            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 10, fontWeight: '700' }}                {label}
            </Text        </VStack    );
}

function StatWidget({
    icon: LucideIcon,
    label,
    value,
    color,
    colors,
}: {
    icon: any;
    label: string;
    value: number | string;
    color?: string;
    colors: any;
}) {
    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100,>
            }}
                    <VStack sx={{ gap: 4 }}                <LucideIcon color={color || colors.textSecondary} size={20} /                ><Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}                    {label}
                </Text                <Text color={colors.text} sx={{ fontSize: 24, fontWeight: '700' }}                    {value}
                </Text            </VStack        </Box    );
}

export function useStudentDashboardSurfaces({
    colors,
    isGuest,
    isPastView,
    isDemoExperience,
    stats,
    onOpenLibrary,
    onOpenCommunity,
    onOpenRewards,
    onOpenTimetable,
    onOpenBreathing,
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
                mobileSupport: true,
                webSupport: true,
                title: 'Learning shortcuts',
                subtitle: 'Quick actions',
                summary: 'Jump quickly into study tools, communities, breathing, and future rewards.',
                temporalLabel: isPastView ? 'Past view' : 'Ready',
                metadata: ['Library', 'Sanctuaries', 'Breathing'],
                content: (
                    <HStack sx={{ gap: Theme.spacing.md, justifyContent: 'space-between' }}                        <QuickAction icon={BookOpen} label="Library" onPress={onOpenLibrary} color={Theme.colors.amberGlow} disabled={isPastView} colors={colors} /                        ><QuickAction icon={MessageSquare} label="Sanctuaries" onPress={onOpenCommunity} color={Theme.colors.gurudeviBlue} disabled={isPastView} colors={colors} /                        ><QuickAction icon={Star} label="Rewards" onPress={onOpenRewards} color={Theme.colors.sanctuarySaffron} disabled={isPastView} colors={colors} /                        ><QuickAction icon={Layout} label="Timetable" onPress={onOpenTimetable} color={Theme.colors.sageGreen} disabled={isPastView} colors={colors} /                        ><QuickAction icon={Wind} label="Breathing" onPress={onOpenBreathing} color={Theme.colors.lotusDeepPink} disabled={isPastView} colors={colors} /                    ></HStack                ),
            },
            {
                surfaceId: 'learning-pulse',
                workspaceId: 'student-dashboard',
                capabilityKey: 'StudentLearningPulse',
                ownerPackage: 'classroom',
                defaultZone: 'today',
                defaultOrder: 30,
                mobileSupport: true,
                webSupport: true,
                title: 'Learning pulse',
                subtitle: 'Current study state',
                summary: 'Classes, pending assignments, and growth progress at a glance.',
                temporalLabel: stats.pendingAssignments > 0 ? 'Due soon' : 'On track',
                metadata: [`Classes ${stats.enrolledClasses}`, `Pending ${stats.pendingAssignments}`, `Growth ${stats.growthPoints}`],
                content: (
                    <HStack sx={{ gap: Theme.spacing.md }}                        <StatWidget icon={ClipboardCheck} label="My Classes" value={stats.enrolledClasses} color={Theme.colors.gurudeviBlue} colors={colors} /                        ><StatWidget icon={Zap} label="Assignments" value={stats.pendingAssignments} color={Theme.colors.amberGlow} colors={colors} /                    ></HStack                ),
            },
            {
                surfaceId: 'sanctuaries',
                workspaceId: 'student-dashboard',
                capabilityKey: 'StudentSanctuaries',
                ownerPackage: 'classroom',
                defaultZone: 'work',
                defaultOrder: 40,
                mobileSupport: true,
                webSupport: true,
                title: 'Your sanctuaries',
                subtitle: 'Classroom registry',
                summary: 'Enter the classrooms where your learning is actively happening.',
                temporalLabel: stats.enrolledClasses > 0 ? 'Live' : 'Join first',
                metadata: [`Classes ${stats.enrolledClasses}`, 'Registry', 'Learning flow'],
                content: (
                    <                        <ClassroomList
                            onClassroomPress={onOpenClassroom}
                            isNested={true}
                            emptyContent={
                                <PositiveInvitation
                                    context="classroom"
                                    title={isDemoExperience ? 'Join Your First Sanctuary' : undefined}
                                    description={isDemoExperience ? 'Welcome to the student sanctuary. Ready to officially join your classes and begin your quest? Connect with your teachers to get started.' : undefined}
                                    actionLabel={isDemoExperience ? 'Join a Classroom' : undefined}
                                    onAction={onOpenCommunity}
                                /                            >}
                        /                        >{isGuest ? (
                            <Box sx={{ marginTop: Theme.spacing.md }}                                <PositiveInvitation type="guest" context="classroom" onAction={onOpenGuestAuth} /                            ></Box                        ): null}
                    </                ),
            },
            {
                surfaceId: 'demo-assignments',
                workspaceId: 'student-dashboard',
                capabilityKey: 'StudentUpcomingAssignments',
                ownerPackage: 'classroom',
                defaultZone: 'outlook',
                defaultOrder: 50,
                mobileSupport: true,
                webSupport: true,
                hiddenByDefault: !isDemoExperience,
                title: 'Upcoming assignments',
                subtitle: 'Demo learning pressure',
                summary: 'A sample assignment queue for demo and onboarding states.',
                temporalLabel: 'Demo',
                metadata: ['Assignments', 'Demo'],
                content: (
                    <VStack sx => {{ gap: Theme.spacing.sm }}                        {DEMO_ASSIGNMENTS.map((assignment, index) => (
                            <Box key={index} sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, padding: Theme.spacing.md, borderWidth: 1, borderColor: colors.border }}                                <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.sm }}>{assignment.title}</Text                                ><Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.xs, marginTop: 2 }}>{assignment.classroom}</Text                                ><Text sx={{ fontSize: Theme.typography.fontSize.xs, color: Theme.colors.amberGlow, fontWeight: '700', marginTop: 4 }}                                    Due in {assignment.daysLeft} days
                                </Text                            </Box                        ))}
                    </VStack                ),
            },
            {
                surfaceId: 'demo-goals',
                workspaceId: 'student-dashboard',
                capabilityKey: 'StudentGoals',
                ownerPackage: 'classroom',
                defaultZone: 'private',
                defaultOrder: 60,
                mobileSupport: true,
                webSupport: true,
                hiddenByDefault: !isDemoExperience,
                title: 'My goals',
                subtitle: 'Demo growth goals',
                summary: 'A demo-only preview of student goals and self-tracking.',
                temporalLabel: 'Demo',
                metadata: ['Goals', 'Growth'],
                content: (
                    <VStack sx={{ gap: Theme.spacing.sm }}                        {DEMO_GOALS.map((goal, index) => (
                            <Box key={index} sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, padding: Theme.spacing.md, borderWidth: 1, borderColor: colors.border }}                                <Text color={colors.text} sx={{ fontSize: Theme.typography.fontSize.sm, marginBottom: 8 }}>{goal.text}</Text                                ><Box sx={{ height: 6, backgroundColor: colors.tertiary, borderRadius: 3, overflow: 'hidden' }}                                    <Box sx={{ width: `${goal.progress}%` as any, height: 6, backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 3 }} /                                ></Box                                <Text color={colors.textSecondary} sx={{ fontSize: 10, marginTop: 4, fontWeight: '700' }}                                    {goal.progress}% complete
                                </Text                            </Box                        ))}
                    </VStack                ),
            },
        ],
        [
            colors,
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
            onOpenClassroom,
            onOpenGuestAuth,
        ]
    );
}
