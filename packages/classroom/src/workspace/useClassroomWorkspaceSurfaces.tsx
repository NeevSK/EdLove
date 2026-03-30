import React, { useMemo } from 'react';
import { Box, GlobalHeader, SandboxBanner, ScreenWrapper, SanctuaryNudge } from '@repo/ui';
import { FeatureGuard } from '@repo/core';
import type { WorkspaceSurfaceDefinition } from '@repo/core';
import { Wind } from 'lucide-react-native';
import PrincipalDashboard from '../screens/PrincipalDashboard';
import SectionHeadDashboard from '../screens/SectionHeadDashboard';
import GradeHeadDashboard from '../screens/GradeHeadDashboard';
import TeacherDashboard from '../screens/TeacherDashboard';
import StudentDashboard from '../screens/StudentDashboard';
import {
    TeacherOnboardingView,
    StudentOnboardingView,
    PrincipalOnboardingView,
} from '../components';

export type ClassroomWorkspaceSurfaceId =
    | 'principal'
    | 'section-head'
    | 'grade-head'
    | 'teacher'
    | 'student';

export type ClassroomWorkspaceCapabilityKey =
    | 'PrincipalDashboard'
    | 'SectionHeadDashboard'
    | 'GradeHeadDashboard'
    | 'TeacherDashboard'
    | 'StudentDashboard';

export type ClassroomWorkspaceSurface = WorkspaceSurfaceDefinition    ClassroomWorkspaceSurfaceId,
    ClassroomWorkspaceCapabilityKey
> & {
    content: React.ReactNode;
    title: string;
    subtitle?: string;
    summary?: string;
    temporalLabel?: string;
    metadata?: string[];
};

type UseClassroomWorkspaceSurfacesArgs = {
    can: (action: any, subject: any, field?: string) => boolean;
    t: (key: string) => string;
    isGuest: boolean;
    classroomData: {
        userId: string;
        schoolId: string | null;
        profileCompleted: boolean;
        realClassCount: number;
    } | null;
    schoolIdToUse?: string | null;
    isDemoModeTriggered: boolean;
    setIsDemoModeTriggered: (value: boolean) => void;
    setIsCreateSchoolOpen: (value: boolean) => void;
    setIsCreateClassroomOpen: (value: boolean) => void;
    setIsClaimInviteOpen: (value: boolean) => void;
    setBreathingOpen: (value: boolean) => void;
    fetchRoleData: () => void | Promise<void>;
    navigation: any;
    surfaceInsights?: Partial<Record<ClassroomWorkspaceSurfaceId, {
        summary?: string;
        temporalLabel?: string;
        metadata?: string[];
    }>>;
};

export function useClassroomWorkspaceSurfaces({
    can,
    t,
    isGuest,
    classroomData,
    schoolIdToUse,
    isDemoModeTriggered,
    setIsDemoModeTriggered,
    setIsCreateSchoolOpen,
    setIsCreateClassroomOpen,
    setIsClaimInviteOpen,
    setBreathingOpen,
    fetchRoleData,
    navigation,
    surfaceInsights,
}: UseClassroomWorkspaceSurfacesArgs) {
    const renderNudge = () => {
        if (classroomData && !classroomData.profileCompleted && !isGuest) {
            return (
                <SanctuaryNudge
                    title="Sanctuary Entry"
                    description="Complete your profile to unlock full school features."
                    actionLabel="Finish"
                    onAction={() => navigation.navigate('Profile')}
                    icon="profile"
                /            >);
        }

        return (
            <                <FeatureGuard action="read" subject="TeacherPulse"                    <SanctuaryNudge
                        title={t('classroom.nudges.breathing.title') || 'Feeling Overwhelmed?'}
                        description={t('classroom.nudges.breathing.message') || 'Take a 60-second breathing reset to center yourself before your next session.'}
                        actionLabel={t('classroom.nudges.breathing.action') || 'Start Reset'}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    /                ></FeatureGuard                <FeatureGuard action="read" subject="PrincipalPulse"                    <SanctuaryNudge
                        title={t('principal.nudges.breathing.title') || 'Leadership Clarity'}
                        description={t('principal.nudges.breathing.message') || 'Principals carry the weight of the institution. A minute of breathing restores focus.'}
                        actionLabel={t('principal.nudges.breathing.action') || 'Pause & Breathe'}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    /                </FeatureGuard                <FeatureGuard action="read" subject="FounderPulse"                    <SanctuaryNudge
                        title={t('founder.nudges.breathing.title') || 'Visionary Pulse'}
                        description={t('founder.nudges.breathing.message') || 'Taking a moment for yourself is the best way to lead by example for your ecosystem.'}
                        actionLabel={t('founder.nudges.breathing.action') || 'Mindful Reset'}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    /                </FeatureGuard                <FeatureGuard action="read" subject="StudentPulse"                    <SanctuaryNudge
                        title={t('student.nudges.breathing.title') || 'Learning Fuel'}
                        description={t('student.nudges.breathing.message') || 'Studies are easier when your mind is calm. Reset your breath to improve focus.'}
                        actionLabel={t('student.nudges.breathing.action') || 'Breathe Now'}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    /                </FeatureGuard            </        );
    };

    return useMemo<ClassroomWorkspaceSurface[]>(() => {
        if (!classroomData) return [];

        const surfaces: ClassroomWorkspaceSurface[] = [];

        if (can('manage', 'PrincipalDashboard')) {
            const principalContent =
                !schoolIdToUse && !isDemoModeTriggered ? (
                    <PrincipalOnboardingView
                        isGuest={isGuest}
                        onTryDemo={() => setIsDemoModeTriggered(true)}
                        onCreateSchool={() => setIsCreateSchoolOpen(true)}
                        onJoinSchool={() => navigation.navigate('Search' as any)}
                    /                >) : (
                    <PrincipalDashboard
                        schoolId={schoolIdToUse || 'demo-school'}
                        userId={classroomData.userId}
                        onRefresh={fetchRoleData}
                    /                >);

            surfaces.push({
                surfaceId: 'principal',
                workspaceId: 'classroom',
                capabilityKey: 'PrincipalDashboard',
                ownerPackage: 'admin',
                defaultZone: 'institution',
                defaultOrder: 10,
                mobileSupport: true,
                webSupport: true,
                title: 'Principal Shell',
                subtitle: 'Official school governance workspace',
                summary: surfaceInsights?.principal?.summary ?? 'Institutional pulse, observations, approvals, and published academic oversight.',
                temporalLabel: surfaceInsights?.principal?.temporalLabel ?? 'Official',
                metadata: surfaceInsights?.principal?.metadata ?? ['Admin-owned', 'Governance'],
                content: principalContent,
            });
        }

        if (can('manage', 'SectionHeadDashboard')) {
            surfaces.push({
                surfaceId: 'section-head',
                workspaceId: 'classroom',
                capabilityKey: 'SectionHeadDashboard',
                ownerPackage: 'classroom',
                defaultZone: 'work',
                defaultOrder: 20,
                mobileSupport: true,
                webSupport: true,
                title: 'Section Head Desk',
                subtitle: 'Section-level academic coordination',
                summary: 'Mixed teaching and coordination capability within the classroom holon.',
                temporalLabel: 'Work',
                metadata: ['Academic', 'Mixed-role'],
                content: <SectionHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />,
            });
        }

        if (can('manage', 'GradeHeadDashboard')) {
            surfaces.push({
                surfaceId: 'grade-head',
                workspaceId: 'classroom',
                capabilityKey: 'GradeHeadDashboard',
                ownerPackage: 'classroom',
                defaultZone: 'work',
                defaultOrder: 30,
                mobileSupport: true,
                webSupport: true,
                title: 'Grade Head Deck',
                subtitle: 'Grade-level academic stewardship',
                summary: 'Cross-class coordination for grade-wide rhythms, issues, and academic flow.',
                temporalLabel: 'Work',
                metadata: ['Academic', 'Mixed-role'],
                content: <GradeHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />,
            });
        }

        if (can('manage', 'TeacherDashboard')) {
            const teacherContent =
                classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
                    <TeacherOnboardingView
                        isGuest={isGuest}
                        onTryDemo={() => setIsDemoModeTriggered(true)}
                        onCreateClassroom={() => setIsCreateClassroomOpen(true)}
                        onJoinSchool={() => navigation.navigate('Search' as any)}
                    /                >) : (
                    <ScreenWrapper scroll={false} noTopInset={true}                        <Box sx={{ flex: 1 }}                            <GlobalHeader title="Classroom" subtitle={undefined} /                            >{renderNudge()}
                            {isDemoModeTriggered && <SandboxBanner />}
                            <TeacherDashboard
                                schoolId={schoolIdToUse || undefined}
                                userId={classroomData.userId}
                                onRefresh={fetchRoleData}
                            /                        ></Box                    </ScreenWrapper                );

            surfaces.push({
                surfaceId: 'teacher',
                workspaceId: 'classroom',
                capabilityKey: 'TeacherDashboard',
                ownerPackage: 'classroom',
                defaultZone: 'work',
                defaultOrder: 40,
                mobileSupport: true,
                webSupport: true,
                title: 'Teacher Studio',
                subtitle: 'Daily classroom authorship',
                summary: surfaceInsights?.teacher?.summary ?? 'Assignments, lessons, attendance, grading, and teacher-owned pedagogical signals.',
                temporalLabel: surfaceInsights?.teacher?.temporalLabel ?? 'Daily Work',
                metadata: surfaceInsights?.teacher?.metadata ?? ['Academic', 'Write owner'],
                content: teacherContent,
            });
        }

        if (can('manage', 'StudentDashboard')) {
            const studentContent =
                classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
                    <StudentOnboardingView
                        isGuest={isGuest}
                        onTryDemo={() => setIsDemoModeTriggered(true)}
                        onJoinClass={() => setIsClaimInviteOpen(true)}
                        onFindSchool={() => navigation.navigate('Search' as any)}
                    /                >) : (
                    <ScreenWrapper scroll={false} noTopInset={true}                        <Box sx={{ flex: 1 }}                            <GlobalHeader title={t('classroom.mySanctuaries') || 'My Sanctuaries'} subtitle={undefined} /                            >{renderNudge()}
                            {isDemoModeTriggered && <SandboxBanner />}
                            <StudentDashboard
                                schoolId={schoolIdToUse || undefined}
                                userId={classroomData.userId}
                                onRefresh={fetchRoleData}
                            /                        ></Box                    </ScreenWrapper                );

            surfaces.push({
                surfaceId: 'student',
                workspaceId: 'classroom',
                capabilityKey: 'StudentDashboard',
                ownerPackage: 'classroom',
                defaultZone: 'work',
                defaultOrder: 50,
                mobileSupport: true,
                webSupport: true,
                title: 'Student Journey',
                subtitle: 'Learning, submissions, and personal progress',
                summary: surfaceInsights?.student?.summary ?? 'Student-facing classroom flow across lessons, assignments, notes, and longitudinal story.',
                temporalLabel: surfaceInsights?.student?.temporalLabel ?? 'Journey',
                metadata: surfaceInsights?.student?.metadata ?? ['Academic', 'Student-owned'],
                content: studentContent,
            });
        }

        return surfaces;
    }, [
        can,
        classroomData,
        schoolIdToUse,
        isDemoModeTriggered,
        isGuest,
        t,
        navigation,
        fetchRoleData,
        setBreathingOpen,
        setIsClaimInviteOpen,
        setIsCreateClassroomOpen,
        setIsCreateSchoolOpen,
        setIsDemoModeTriggered,
    ]);
}
