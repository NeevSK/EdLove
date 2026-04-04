import React from 'react';
import { usePermissions, useStore } from '@repo/core';
import {
    Box, ScreenWrapper, WebScreenHeader
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { ArrowRight } from 'lucide-react-native';

// Direct imports for sub-views
import StudentDashboardWeb from './StudentDashboard.web';
import TeacherDashboardWeb from './TeacherDashboard.web';
import { PrincipalDashboardWeb, DashboardContent, CreateSchoolModal } from '@repo/admin';
import PrincipalOnboardingView from '../components/onboarding/PrincipalOnboardingView.web';
import CreateClassroomModal from '../components/CreateClassroomModal';

/**
 * ClassroomScreen.web.tsx (POA 100% Realized)
 * 
 * Purged of Intent system. Uses direct component resolution 
 * driven by usePermissions hook.
 */
export default function ClassroomScreenWeb() {
    const { can, context } = usePermissions();
    const { user } = useStore();
    const navigation = useNavigation<any>();

    const isWanderer = context.isAnonymous;
    const hasContext = true; // Simplified for restoration context
    const hasSchoolId = !!user?.school_id && user.school_id !== 'mock-school';

    const isTeacherLike = can('manage', 'TeacherDashboard');
    const isPrincipalLike = can('manage', 'PrincipalDashboard');
    const isStudentLike = can('manage', 'StudentDashboard');

    const isCitizenReady = !isWanderer && !!user && (isTeacherLike || isPrincipalLike || isStudentLike) && hasSchoolId;

    // 1. Edge Case: No Role / Onboarding Need
    if (context.roles.length === 0 || (!hasSchoolId && !isWanderer)) {
        return (
            <ScreenWrapper>
                <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
                    <Box sx={{ fontSize: 48 }}>=K</Box>
                    <Box sx={{ fontSize: 24, fontWeight: '800' }}>Welcome to Gurudevi</Box>
                    <Box sx={{ color: '$textLight', maxWidth: 400 }}>
                        {context.roles.length === 0 
                            ? "Let's get you set up. Choose your role to get started."
                            : "Welcome! To access your classroom workspace, please join your school first."}
                    </Box>
                    <Box 
                        as="button"
                        sx={{ background: '$primary', padding: 12, borderRadius: 8, color: 'white', flexDirection: 'row', alignItems: 'center', gap: 8 }}
                        onClick={() => navigation.navigate('Auth')}
                    >
                        {context.roles.length === 0 ? "Get started" : "Join School"} <ArrowRight size={16} />
                    </Box>
                </Box>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
                <WebScreenHeader 
                    title="The Academy"
                    note={isPrincipalLike ? "Institutional Oversight" : "Growth & Mastery"}
                    showPersonalizedGreeting={true}
                />
                
                <Box sx={{ marginTop: 24 }}>
                    {/* Path 1: Anonymous guest or wanderer */}
                    {isWanderer && (
                        <Box sx={{ padding: 40, alignItems: 'center', opacity: 0.8 }}>
                            <Box sx={{ fontSize: 32, marginBottom: 16 }}>=-</Box>
                            <Box sx={{ fontSize: 18, fontWeight: '600' }}>Welcome, Wanderer</Box>
                            <Box sx={{ color: '$textLight' }}>Exploring the public curriculum and library.</Box>
                        </Box>
                    )}

                    {/* Path 2: 1st Class Citizen - Direct Component Resolution */}
                    {isCitizenReady && (
                        <>
                            {isPrincipalLike && (
                                <PrincipalDashboardWeb 
                                    DashboardContentComponent={DashboardContent}
                                    PrincipalOnboardingViewComponent={PrincipalOnboardingView}
                                    CreateSchoolModalComponent={CreateSchoolModal as any}
                                    CreateClassroomModalComponent={CreateClassroomModal as any}
                                />
                            )}
                            {isTeacherLike && !isPrincipalLike && <TeacherDashboardWeb />}
                            {isStudentLike && !isTeacherLike && !isPrincipalLike && <StudentDashboardWeb />}
                        </>
                    )}
                </Box>
            </Box>
        </ScreenWrapper>
    );
}
