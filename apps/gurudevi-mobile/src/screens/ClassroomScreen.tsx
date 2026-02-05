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
import { Box, Text, Center, Heading, Spinner } from "@gluestack-ui/themed";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';
import { supabase } from '../lib/supabase';

// Import role-specific views
import PrincipalSchoolView from './classroom/PrincipalSchoolView';
import SectionHeadView from './classroom/SectionHeadView';
import GradeHeadView from './classroom/GradeHeadView';
import ClassroomList from '../components/classroom/ClassroomList';

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    backgroundColor: Theme.colors.voidIndigo,
    padding: Theme.spacing.lg,
};

export default function ClassroomScreen() {
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [principalData, setPrincipalData] = useState<{ schoolId: string, userId: string } | null>(null);

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
    return (
        <Box sx={ROLE_VIEW_CONTAINER_STYLE}>
            <ClassroomList
                onClassroomPress={(classroom) => {
                    // TODO: Navigate to classroom details
                    console.log('Classroom pressed:', classroom);
                }}
            />
        </Box>
    );
}
