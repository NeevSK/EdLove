/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import React, { useEffect, useState } from 'react';
import { Box, VStack } from "@/ui";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';
import { supabase } from '../lib/supabase';
import { PrincipalSchoolView, SectionHeadView, GradeHeadView, FounderSchoolView, AdminSchoolView } from './classroom';
import { ClassroomList, TeacherDashboard } from '../components/classroom';
import { SkeletonCard } from '../components/shared/SkeletonLoader';
import GlobalHeader from '../components/shared/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import { hasRole, ADMIN_ROLES, MANAGEMENT_ROLES } from '../utils/permissions';
import { useThemedColors } from '../hooks/useThemedColors';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import PositiveInvitation from '../components/shared/PositiveInvitation';
import { hapticLight } from '../utils/haptics';

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useFeatureAccess();
    const [loading, setLoading] = useState(true);
    const [principalData, setPrincipalData] = useState<{ schoolId: string, userId: string } | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (hasRole(role, ADMIN_ROLES) || hasRole(role, MANAGEMENT_ROLES)) {
            fetchPrincipalData();
        } else {
            setLoading(false);
        }
    }, [role]);

    const fetchPrincipalData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('school_id')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setPrincipalData({
                        userId: user.id,
                        schoolId: data.school_id
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching principal data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <VStack space="md" p={Theme.spacing.lg}>
                    <SkeletonCard height={60} />
                    <SkeletonCard height={200} />
                    <SkeletonCard height={120} />
                </VStack>
            </ScreenWrapper>
        );
    }

    // Role-based routing
    if (principalData) {
        if (role === 'founder') return <FounderSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchPrincipalData} />;
        if (role === 'admin') return <AdminSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchPrincipalData} />;
        if (role === 'principal' || role === 'developer') return <PrincipalSchoolView schoolId={principalData.schoolId} userId={principalData.userId} onRefresh={fetchPrincipalData} />;
    }

    if (role === 'section_head') return <SectionHeadView schoolId={principalData?.schoolId} userId={principalData?.userId} />;
    if (role === 'grade_head') return <GradeHeadView schoolId={principalData?.schoolId} userId={principalData?.userId} />;

    // Teacher View
    if (role === 'teacher') {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Classroom 💛" subtitle={undefined} />
                <Box sx={{ flex: 1 }}>
                    <TeacherDashboard onRefresh={fetchPrincipalData} />
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
