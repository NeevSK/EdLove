/**
 * SelfScreen Component
 * 
 * Role-aware routing screen that displays different Self views based on user role:
 * - Student: Growth & reflection features (mood, goals, study rhythm)
 * - Principal: Leadership wellbeing features (energy, pulse, decisions)
 * - Teacher/Section Head/Grade Head: Teacher wellbeing features (current implementation)
 */

import React, { useEffect, useState } from 'react';
import { Box, Spinner } from "@gluestack-ui/themed";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';

// Import role-specific views
import { StudentSelfView, TeacherSelfView, PrincipalSelfView } from './self';

export default function SelfScreen() {
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Quick load - no async data needed for role routing
        setLoading(false);
    }, [role]);

    if (loading) {
        return (
            <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo, justifyContent: 'center', alignItems: 'center' }}>
                <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    }

    // Route to appropriate view based on role
    if (role === 'student') {
        return <StudentSelfView />;
    }

    if (role === 'principal') {
        return <PrincipalSelfView />;
    }

    // Default: Teacher view (includes teacher, section_head, grade_head)
    return <TeacherSelfView />;
}