/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import React from 'react';
import { Box, Text, Center, Heading } from "@gluestack-ui/themed";
import { useUserRole } from '../hooks/useUserRole';
import { Theme } from '../constants/Theme';

// Import role-specific views
import PrincipalSchoolView from './classroom/PrincipalSchoolView';
import SectionHeadView from './classroom/SectionHeadView';
import GradeHeadView from './classroom/GradeHeadView';

// Shared container styling for role-based views
const ROLE_VIEW_CONTAINER_STYLE = {
    flex: 1,
    backgroundColor: Theme.colors.voidIndigo,
    padding: Theme.spacing.lg,
};

export default function ClassroomScreen() {
    const { role } = useUserRole();

    // Route to appropriate view based on role
    if (role === 'principal') {
        return <PrincipalSchoolView />;
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
            <Center sx={{ flex: 1 }}>
                <Heading color={Theme.colors.sanctuarySaffron}>Classroom</Heading>
                <Text color={Theme.colors.pearlGray}>Your learning journey continues here.</Text>
            </Center>
        </Box>
    );
}

