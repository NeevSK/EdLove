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
import { Box, Text, Center, Heading, Spinner, HStack, VStack, Pressable } from "@/ui";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';
import { supabase } from '../lib/supabase';
import { QrCode } from 'lucide-react-native';
import { ClassroomStudent, api } from '../lib/api';
import { hapticLight } from '../utils/haptics';
import { useStore } from '../store/useStore';

// Import role-specific views
import { PrincipalSchoolView, SectionHeadView, GradeHeadView, FounderSchoolView, AdminSchoolView } from './classroom';
import { ClassroomList, TeacherDashboard } from '../components/classroom';
import GlobalHeader from '../components/shared/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/shared/ScreenWrapper';
import { hasRole, ADMIN_ROLES } from '../utils/permissions';
import { useThemedColors } from '../hooks/useThemedColors';

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    padding: Theme.spacing.lg,
};

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [principalData, setPrincipalData] = useState<{ schoolId: string, userId: string } | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (hasRole(role, ADMIN_ROLES)) {
            fetchPrincipalData();
        } else {
            setLoading(false);
        }
    }, [role]);

    const fetchPrincipalData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch user's school_id
                const { data, error } = await supabase
                    .from('users')
                    .select('school_id')
                    .eq('id', user.id)
                    .single();

                if (data && data.school_id) {
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
                <Center sx={{ flex: 1 }}>
                    <Spinner size="large" color={colors.action} />
                </Center>
            </ScreenWrapper>
        );
    }

    // Role-based views
    if (principalData) {
        if (role === 'founder') {
            return <FounderSchoolView schoolId={principalData.schoolId} userId={principalData.userId} />;
        }
        if (role === 'admin') {
            return <AdminSchoolView schoolId={principalData.schoolId} userId={principalData.userId} />;
        }
        if (role === 'principal' || role === 'developer') {
            return <PrincipalSchoolView schoolId={principalData.schoolId} userId={principalData.userId} />;
        }
    }

    if (role === 'section_head') {
        return <SectionHeadView />;
    }

    if (role === 'grade_head') {
        return <GradeHeadView />;
    }

    // Default view for teachers and students
    if (role === 'teacher') {
        return (
            <ScreenWrapper>
                <TeacherDashboard />
            </ScreenWrapper>
        );
    }

    // Student View
    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('classroom.learningJourney') || 'Learning Journey'}
                subtitle={t('classroom.mySanctuary') || 'My Sanctuary'}
            />
            <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
                <ClassroomList
                    refreshTrigger={refreshTrigger}
                    onClassroomPress={(classroom) => {
                        navigation.navigate('Classroom' as any, {
                            screen: 'ClassroomDetails',
                            params: {
                                classroomId: classroom.id,
                                classroomName: classroom.name
                            }
                        });
                    }}
                />
            </Box>
        </ScreenWrapper>
    );
}
