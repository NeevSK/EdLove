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
import { Box, Text, Center, Heading, Spinner, HStack, VStack } from "@gluestack-ui/themed";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';
import { supabase } from '../lib/supabase';
import { QrCode } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { ClaimInviteModal } from '../components/classroom/ClaimInviteModal';
import { ClassroomStudent, api } from '../lib/api';
import { hapticLight } from '../utils/haptics';
import { useStore } from '../store/useStore';

// Import role-specific views
import { PrincipalSchoolView, SectionHeadView, GradeHeadView } from './classroom';
import { ClassroomList, TeacherDashboard } from '../components/classroom';
import GlobalHeader from '../components/shared/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    backgroundColor: Theme.colors.voidIndigo,
    padding: Theme.spacing.lg,
};

export default function ClassroomScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [principalData, setPrincipalData] = useState<{ schoolId: string, userId: string } | null>(null);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (role === 'principal') {
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
            <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo, justifyContent: 'center', alignItems: 'center' }}>
                <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    }

    // Route to appropriate view based on role
    if (role === 'principal' && principalData) {
        return <PrincipalSchoolView schoolId={principalData.schoolId} userId={principalData.userId} />;
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
            <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
                <TeacherDashboard />
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('classroom.myClassrooms') || 'My Classrooms'}
                subtitle="Enrolled"
                rightAction={(
                    <Pressable
                        onPress={() => {
                            hapticLight();
                            setIsClaimModalOpen(true);
                        }}
                    >
                        <HStack space="xs" alignItems="center" sx={{
                            backgroundColor: Theme.colors.sanctuarySaffron,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: Theme.corners.comfortable,
                            ...Theme.shadows.sm
                        }}>
                            <QrCode size={16} color="white" />
                            <Text color="white" size="xs" bold>Claim Invite</Text>
                        </HStack>
                    </Pressable>
                )}
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

            <ClaimInviteModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                onSuccess={() => {
                    setIsClaimModalOpen(false);
                    setRefreshTrigger(prev => prev + 1);
                }}
            />
        </Box>
    );
}
