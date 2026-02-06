/**
 * SelfScreen Component
 * 
 * Role-aware routing screen that displays different Self views based on user role:
 * - Student: Growth & reflection features (mood, goals, study rhythm)
 * - Principal: Leadership wellbeing features (energy, pulse, decisions)
 * - Teacher/Section Head/Grade Head: Teacher wellbeing features (current implementation)
 */

import React from 'react';
import { useUserRole } from '../hooks/useUserRole';

// Import role-specific views
import { StudentSelfView, TeacherSelfView, PrincipalSelfView } from './self';

export default function SelfScreen() {
    const { role } = useUserRole();

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