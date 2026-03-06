/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import { supabase, useUserRole, hasRole, ADMIN_ROLES, MANAGEMENT_ROLES, useRoleFeatures, useStore } from '@repo/core';

import React, { useEffect, useState } from 'react';
import { Box, VStack, Theme, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, hapticLight } from '@repo/ui';
import PrincipalSchoolView from './PrincipalSchoolView';
import SectionHeadView from './SectionHeadView';
import GradeHeadView from './GradeHeadView';
import FounderSchoolView from './FounderSchoolView';
import FounderDashboard from './FounderDashboard';
import { ClassroomList, TeacherDashboard, StudentDashboard, NoSchoolOnboarding } from '../components';
import { useClassroomRoleData } from '../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SanctuaryNudge } from '@repo/ui';

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { data: classroomData, loading, fetchRoleData } = useClassroomRoleData(refreshTrigger);

    useEffect(() => {
        fetchRoleData();
    }, [role]);

    // 1. Loading state (only if no data at all)
    if (loading && !classroomData) {
        return (
            <ScreenWrapper>
                <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.lg }}>
                    <SkeletonCard height={60} />
                    <SkeletonCard height={200} />
                    <SkeletonCard height={120} />
                </VStack>
            </ScreenWrapper>
        );
    }

    // Nudge for incomplete profiles
    const renderNudge = () => {
        if (classroomData && !classroomData.profileCompleted && !isGuest) {
            return (
                <SanctuaryNudge
                    title="Sanctuary Entry"
                    description="Complete your profile to unlock full school features."
                    actionLabel="Finish"
                    onAction={() => navigation.navigate('Profile')}
                    icon="🌿"
                />
            );
        }
        return null;
    };

    // 2. Role-based routing
    if (classroomData) {
        if (role === 'founder') return <FounderDashboard />;
        if (role === 'principal' || role === 'developer' || role === 'admin') {
            return (
                <PrincipalSchoolView
                    schoolId={classroomData.schoolId || useStore.getState().user?.school_id || ''}
                    userId={classroomData.userId}
                    onRefresh={fetchRoleData}
                />
            );
        }
    }


    if (role === 'section_head') return <SectionHeadView schoolId={classroomData?.schoolId || undefined} userId={classroomData?.userId} />;
    if (role === 'grade_head') return <GradeHeadView schoolId={classroomData?.schoolId || undefined} userId={classroomData?.userId} />;

    // Teacher View
    if (role === 'teacher') {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Classroom 💛" subtitle={undefined} />
                <Box sx={{ flex: 1 }}>
                    {renderNudge()}
                    <TeacherDashboard
                        schoolId={classroomData?.schoolId || undefined}
                        userId={classroomData?.userId}
                        onRefresh={fetchRoleData}
                    />
                </Box>
            </ScreenWrapper>
        );
    }

    // Student View (Instant Routing)
    if ((role as any) === 'student' || (isGuest && (role as any) === 'student')) {
        return (
            <ScreenWrapper>
                <GlobalHeader title={t('classroom.mySanctuaries') || 'My Sanctuaries'} subtitle={undefined} />
                <Box sx={{ flex: 1 }}>
                    {renderNudge()}
                    <StudentDashboard
                        schoolId={classroomData?.schoolId || undefined}
                        userId={classroomData?.userId}
                        onRefresh={fetchRoleData}
                    />
                </Box>
            </ScreenWrapper>
        );
    }

    // Default/Guest View
    const headerTitle = isGuest ? (t('classroom.welcome') || 'Welcome to Sanctuary') : (t('classroom.journeyTitle') || 'Learning Journey');
    const headerSubtitle = isGuest ? (t('classroom.explore') || 'Explore Sample Sanctuaries') : (t('classroom.mySanctuary') || 'My Sanctuary');

    return (
        <ScreenWrapper>
            <GlobalHeader title={headerTitle} subtitle={isGuest ? undefined : headerSubtitle} />
            <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
                {renderNudge()}
                <ClassroomList
                    refreshTrigger={refreshTrigger}
                    onClassroomPress={(classroom) => {
                        navigation.navigate('Classroom' as any, {
                            screen: 'ClassroomDetails',
                            params: { classroomId: classroom.id, classroomName: classroom.name }
                        });
                    }}
                />

                {isGuest && (
                    <PositiveInvitation
                        type="guest"
                        onAction={() => {
                            hapticLight();
                            navigation.navigate('Auth' as never);
                        }}
                    />
                )}
            </Box>
        </ScreenWrapper>
    );
}
