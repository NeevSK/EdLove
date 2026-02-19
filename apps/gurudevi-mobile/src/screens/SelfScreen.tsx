/**
 * SelfScreen Component
 * 
 * Role-aware routing screen that displays different Self views based on user role:
 * - Student: Growth & reflection features (mood, goals, study rhythm)
 * - Principal: Leadership wellbeing features (energy, pulse, decisions)
 * - Teacher/Section Head/Grade Head: Teacher wellbeing features (current implementation)
 */

import React from 'react';
import { useUserRole } from '@repo/core';

// Import role-specific views
import { StudentSelfView, TeacherSelfView, PrincipalSelfView, FounderSelfView, AdminSelfView } from './self';

export default function SelfScreen() {
    const { role } = useUserRole();

    // Route to appropriate view based on role
    if (role === 'student') {
        return <StudentSelfView />;
    }

    if (role === 'principal') {
        return <PrincipalSelfView />;
    }

    if (role === 'founder') {
        return <FounderSelfView />;
    }

    if (role === 'admin') {
        return <AdminSelfView />;
    }

    // Default: Teacher view (includes teacher, section_head, grade_head)
    return <TeacherSelfView />;
}