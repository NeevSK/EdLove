import React, { useMemo } from 'react';
import {
    Box,
    HStack,
    PositiveInvitation,
    Pressable,
    TemporalNavigator,
    Text,
    Theme,
    VStack,
    type WorkspaceSurfaceDefinition,
} from '@repo/ui';
import { BookOpen, ClipboardList, MessageCircle, Plus, ScanLine, School, ShieldCheck, Users, Wind, Zap } from 'lucide-react-native';
import { ClassroomList } from '../components';

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

export type TeacherDashboardSurface = WorkspaceSurfaceDefinition    TeacherDashboardSurfaceId,
    TeacherDashboardCapabilityKey
> & {
    title: string;
    subtitle?: string;
    summary?: string;
    temporalLabel?: string;
    metadata?: string[];
    content: React.ReactNode;
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
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            sx={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.secondary,
                padding: Theme.spacing.md,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: disabled ? 0.5 : 1,
                minHeight: 112,
            }}
                    <Box
                sx={{
                    padding: Theme.spacing.sm,
                    borderRadius: Theme.corners.comfortable,
                    backgroundColor: colors.tertiary,
                    marginBottom: Theme.spacing.sm,
                }}
                            <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={22} /            </Box            <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 12, fontWeight: '700' }}                {label}
            </Text        </Pressable    );
}

function StatCard({
    icon: LucideIcon,
    label,
    value,
    isDemoMode,
    colors,
}: {
    icon: any;
    label: string;
    value: number | string;
    isDemoMode: boolean;
    colors: any;
}) {
    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden',
            }}
                    <VStack sx={{ zIndex: 1, gap: Theme.spacing.xs }}                <Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}                    {label}
                </Text                <Text color={colors.text} sx={{ fontSize: 32, fontWeight: '700' }}                    {value}
                    {isDemoMode ? '*' : ''}
                </Text            </VStack            {isDemoMode ? (
                <Box sx={{ position: 'absolute', top: 5, right: 5 }}                    <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} /                </Box            ) : null}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1,
                }}
                            <LucideIcon color={colors.text} size={80} /            </Box        </Box    );
}

type Args = {
    colors: any;
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
    handleClassroomsLoaded: (classrooms: Array<{ id: string; name: string; student_count?: number | null }>) => void;
    onOpenClassroom: (classroom: { id: string; name: string }) => void;
};

export function useTeacherDashboardSurfaces({
    colors,
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
                summary: 'The first teacher moves. Everything else should support them, not compete with them.',
                temporalLabel: isPastView ? 'Past view' : 'Action ready',
                metadata: ['Create', 'Join', 'Scan'],
                content: (
                    <HStack sx={{ gap: Theme.spacing.md }}                        <QuickAction icon={Plus} label="Create Class" onPress={() => openCreateFlow('create')} disabled={isPastView} colors={colors} /                        <QuickAction icon={Users} label="Join Class" onPress={() => openCreateFlow('join')} color={Theme.colors.sanctuarySaffron} disabled={isPastView} colors={colors} /                        <QuickAction icon={ScanLine} label="Scan QR" onPress={() => setIsScannerOpen(true)} color={Theme.colors.amberGlow} disabled={isPastView} colors={colors} /                    </HStack                ),
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
                summary: 'Administrative, reflective, and message-oriented actions stay close, but quieter than the main classroom workflow.',
                temporalLabel: 'Support',
                metadata: ['Admin', 'Echoes', 'Breathing'],
                content: (
                    <HStack sx={{ gap: Theme.spacing.md, flexWrap: 'wrap', justifyContent: 'space-between' }}                        <Box sx={{ width: '48%' }}><QuickAction icon={ShieldCheck} label="Admin" onPress={() => setIsAdminModalOpen(true)} color={Theme.colors.sageGreen} colors={colors} /></Box                        <Box sx={{ width: '48%' }}><QuickAction icon={BookOpen} label="Library" onPress={onOpenLibrary} color={Theme.colors.amberGlow} colors={colors} /></Box                        <Box sx={{ width: '48%' }}><QuickAction icon={MessageCircle} label="Principal Echo" onPress={() => setIsFeedbackModalOpen(true)} color={Theme.colors.emberRed} colors={colors} /></Box                        <Box sx={{ width: '48%' }}><QuickAction icon={ClipboardList} label="My Echoes" onPress={() => setShowEchoHistory(true)} color={colors.action} colors={colors} /></Box                        <Box sx={{ width: '48%' }}><QuickAction icon={Wind} label="Breathing" onPress={() => setIsBreathingOpen(true)} color={colors.success} colors={colors} /></Box                    </HStack                ),
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
                summary: 'Stats support the registry. They should orient you, not become a competing dashboard.',
                temporalLabel: 'Snapshot',
                metadata: [`Classes ${stats.activeClasses}`, `Students ${stats.totalStudents}`],
                content: (
                    <HStack sx={{ gap: Theme.spacing.md }}                        <StatCard icon={School} label="Active Classes" value={stats.activeClasses} isDemoMode={isDemoMode} colors={colors} /                        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} isDemoMode={isDemoMode} colors={colors} /                    </HStack                ),
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
                summary: 'This is the main working lane. Open a sanctuary, move into the live dashboard, and keep the day flowing from here.',
                temporalLabel: stats.activeClasses > 0 ? 'Live' : 'Onboarding',
                metadata: [`Classes ${stats.activeClasses}`, 'Registry', 'Daily work'],
                content: (
                    <                        <ClassroomList
                            onClassroomPress={onOpenClassroom}
                            onDataLoaded={handleClassroomsLoaded}
                            isNested={true}
                            refreshTrigger={refreshTrigger}
                            emptyContent={
                                <PositiveInvitation
                                    context="classroom"
                                    title={isDemoMode ? 'Create Your First Sanctuary' : undefined}
                                    description={isDemoMode ? 'Ready to lead your first classroom? Generate a sanctuary for your students to begin their journey.' : undefined}
                                    actionLabel={isDemoMode ? 'Create My First Classroom' : undefined}
                                    onAction={() => openCreateFlow('create')}
                                /                            }
                        /                        {isGuest ? (
                            <Box sx={{ marginTop: Theme.spacing.md }}                                <PositiveInvitation type="guest" onAction={() => {}} /                            </Box                        ) : null}
                    </                ),
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
        ]
    );
}
