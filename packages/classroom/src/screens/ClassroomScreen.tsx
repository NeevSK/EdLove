/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import { supabase, useUserRole, hasRole, ADMIN_ROLES, MANAGEMENT_ROLES, useRoleFeatures } from '@repo/core';
import React, { useEffect, useState } from 'react';
import { Box, VStack, Theme, useThemedColors, SkeletonCard, GlobalHeader, ScreenWrapper, PositiveInvitation, hapticLight } from '@repo/ui';
import { PrincipalSchoolView, SectionHeadView, GradeHeadView, FounderSchoolView/*, AdminSchoolView*/ } from './';
import { ClassroomList, TeacherDashboard } from '../components';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const [loading, setLoading] = useState(true);
    const [principalData, setPrincipalData] = useState<{ schoolId: string, userId: string } | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchRoleData();
    }, [role]);

    const fetchRoleData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('school_id')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data) {
                    setPrincipalData({
                        userId: user.id,
                        schoolId: data.school_id
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching role data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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

    // Role-based routing
    if (principalData) {
        if (role === 'founder') return <FounderSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchRoleData} />;
        // if (role === 'admin') return <AdminSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchRoleData} />;
        if (role === 'principal' || role === 'developer') return <PrincipalSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchRoleData} />;
    }

    if (role === 'section_head') return <SectionHeadView schoolId={principalData?.schoolId} userId={principalData?.userId} />;
    if (role === 'grade_head') return <GradeHeadView schoolId={principalData?.schoolId} userId={principalData?.userId} />;

    // Teacher View
    if (role === 'teacher') {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Classroom 💛" subtitle={undefined} />
                <Box sx={{ flex: 1 }}>
                    <TeacherDashboard
                        schoolId={principalData?.schoolId}
                        userId={principalData?.userId}
                        onRefresh={fetchRoleData}
                    />
                </Box>
            </ScreenWrapper>
        );
    }

    // Default/Student View
    const isStudentRole = role === 'student';
    const headerTitle = isStudentRole ? (t('classroom.journeyTitle') || 'Learning Journey') : (t('classroom.initializing') || 'Sanctuary Initialization');
    const headerSubtitle = isStudentRole ? (t('classroom.mySanctuary') || 'My Sanctuary') : (t('classroom.identifyingRole') || 'Preparing your workspace...');

    return (
        <ScreenWrapper>
            <GlobalHeader title={headerTitle} subtitle={headerSubtitle} />
            <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
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
                            // TODO: Add auth navigation
                        }}
                    />
                )}
            </Box>
        </ScreenWrapper>
    );
}
