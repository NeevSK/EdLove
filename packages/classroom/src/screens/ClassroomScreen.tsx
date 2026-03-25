/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import { supabase, useStore, FeatureGuard } from '@repo/core';

import React, { useEffect, useState } from 'react';
import { 
    Box, VStack, HStack, Text, Theme, useThemedColors, SkeletonCard,
    GlobalHeader, ScreenWrapper, PositiveInvitation, hapticLight,
    SanctuaryNudge, SandboxBanner,
} from '@repo/ui';
import { BreathGuide } from '@repo/self';
import PrincipalDashboard from './PrincipalDashboard';
import SectionHeadDashboard from './SectionHeadDashboard';
import GradeHeadDashboard from './GradeHeadDashboard';
import FounderSchoolDashboard from './FounderSchoolDashboard';
import FounderDashboard from './FounderDashboard';
import { 
    ClassroomList, 
    TeacherOnboardingView,
    StudentOnboardingView,
    PrincipalOnboardingView,
    CreateSchoolModal,
    CreateClassroomModal,
    ClaimInviteModal
} from '../components';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { useClassroomRoleData } from '../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Wind, Heart, Zap, Sparkles } from 'lucide-react-native';

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { schoolId: storeSchoolId, userId: storeUserId } = useStore(state => ({
        schoolId: state.user?.school_id,
        userId: state.user?.id
    }));
    const { setBreathingOpen } = useStore();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { data: classroomData, loading, fetchRoleData } = useClassroomRoleData(refreshTrigger);
    const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
    const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);
    const [isClaimInviteOpen, setIsClaimInviteOpen] = useState(false);
    const [isDemoModeTriggered, setIsDemoModeTriggered] = useState(false);

    useEffect(() => {
        fetchRoleData();
    }, [storeSchoolId, storeUserId]);

    // Use focus effect to refresh data when navigating back to this screen
    // This ensures that if a student joins a class in another screen, the onboarding view updates instantly
    useFocusEffect(
        React.useCallback(() => {
            fetchRoleData();
        }, [])
    );

    // Nudge system - pro-active well-being suggestions
    const renderNudge = () => {
        if (classroomData && !classroomData.profileCompleted && !isGuest) {
            return (
                <SanctuaryNudge
                    title="Sanctuary Entry"
                    description="Complete your profile to unlock full school features."
                    actionLabel="Finish"
                    onAction={() => navigation.navigate('Profile')}
                    icon="🌿"
                />
            );
        }
        
        // Proactive Breathing Reset Nudges for different roles
        return (
            <>
                <FeatureGuard action="read" subject="TeacherPulse">
                    <SanctuaryNudge
                        title={t('classroom.nudges.breathing.title') || "Feeling Overwhelmed?"}
                        description={t('classroom.nudges.breathing.message') || "Take a 60-second breathing reset to center yourself before your next session."}
                        actionLabel={t('classroom.nudges.breathing.action') || "Start Reset"}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    />
                </FeatureGuard>
                <FeatureGuard action="read" subject="PrincipalPulse">
                    <SanctuaryNudge
                        title={t('principal.nudges.breathing.title') || "Leadership Clarity"}
                        description={t('principal.nudges.breathing.message') || "Principals carry the weight of the institution. A minute of breathing restores focus."}
                        actionLabel={t('principal.nudges.breathing.action') || "Pause & Breathe"}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    />
                </FeatureGuard>
                <FeatureGuard action="read" subject="FounderPulse">
                    <SanctuaryNudge
                        title={t('founder.nudges.breathing.title') || "Visionary Pulse"}
                        description={t('founder.nudges.breathing.message') || "Taking a moment for yourself is the best way to lead by example for your ecosystem."}
                        actionLabel={t('founder.nudges.breathing.action') || "Mindful Reset"}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    />
                </FeatureGuard>
                <FeatureGuard action="read" subject="StudentPulse">
                    <SanctuaryNudge
                        title={t('student.nudges.breathing.title') || "Learning Fuel"}
                        description={t('student.nudges.breathing.message') || "Studies are easier when your mind is calm. Reset your breath to improve focus."}
                        actionLabel={t('student.nudges.breathing.action') || "Breathe Now"}
                        onAction={() => setBreathingOpen(true)}
                        icon={Wind}
                    />
                </FeatureGuard>
            </>
        );

        return null;
    };

    // 2. Main Render Logic
    const renderContent = () => {
        // A. Loading state (only if no data at all)
        if (loading && !classroomData) {
            return (
                <ScreenWrapper scroll={false} noTopInset={true}>
                    <VStack sx={{ gap: Theme.spacing.md, padding: Theme.spacing.lg }}>
                        <SkeletonCard height={60} />
                        <SkeletonCard height={200} />
                        <SkeletonCard height={120} />
                    </VStack>
                </ScreenWrapper>
            );
        }

        // B. Role-based routing (Explicit matches)
        // B. Role-based routing via FeatureGuards
        if (classroomData) {
            return (
                <Box sx={{ flex: 1 }}>
                    <FeatureGuard action="manage" subject="FounderDashboard">
                        <FounderDashboard />
                    </FeatureGuard>

                    <FeatureGuard action="manage" subject="PrincipalDashboard">
                        {(() => {
                            const schoolIdToUse = (classroomData.schoolId || storeSchoolId);
                            if (!schoolIdToUse && !isDemoModeTriggered) {
                                return (
                                    <PrincipalOnboardingView 
                                        isGuest={false}
                                        onTryDemo={() => setIsDemoModeTriggered(true)}
                                        onCreateSchool={() => setIsCreateSchoolOpen(true)}
                                        onJoinSchool={() => navigation.navigate('Search' as any)}
                                    />
                                );
                            }
                            return (
                                <PrincipalDashboard
                                    schoolId={schoolIdToUse || 'demo-school'}
                                    userId={classroomData.userId}
                                    onRefresh={fetchRoleData}
                                />
                            );
                        })()}
                    </FeatureGuard>

                    <FeatureGuard action="manage" subject="TeacherDashboard">
                        {classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
                            <TeacherOnboardingView 
                                isGuest={false}
                                onTryDemo={() => setIsDemoModeTriggered(true)}
                                onCreateClassroom={() => setIsCreateClassroomOpen(true)}
                                onJoinSchool={() => navigation.navigate('Search' as any)}
                            />
                        ) : (
                            <ScreenWrapper scroll={false} noTopInset={true}>
                                <Box sx={{ flex: 1 }}>
                                    <GlobalHeader title="Classroom 💛" subtitle={undefined} />
                                    {renderNudge()}
                                    {isDemoModeTriggered && <SandboxBanner />}
                                    <TeacherDashboard
                                        schoolId={classroomData?.schoolId || undefined}
                                        userId={classroomData?.userId}
                                        onRefresh={fetchRoleData}
                                    />
                                </Box>
                            </ScreenWrapper>
                        )}
                    </FeatureGuard>

                    <FeatureGuard action="manage" subject="StudentDashboard">
                        {classroomData.realClassCount === 0 && !isDemoModeTriggered ? (
                            <StudentOnboardingView 
                                isGuest={false}
                                onTryDemo={() => setIsDemoModeTriggered(true)}
                                onJoinClass={() => setIsClaimInviteOpen(true)}
                                onFindSchool={() => navigation.navigate('Search' as any)}
                            />
                        ) : (
                            <ScreenWrapper scroll={false} noTopInset={true}>
                                <Box sx={{ flex: 1 }}>
                                    <GlobalHeader title={t('classroom.mySanctuaries') || 'My Sanctuaries'} subtitle={undefined} />
                                    {renderNudge()}
                                    {isDemoModeTriggered && <SandboxBanner />}
                                    <StudentDashboard
                                        schoolId={classroomData?.schoolId || undefined}
                                        userId={classroomData?.userId}
                                        onRefresh={fetchRoleData}
                                    />
                                </Box>
                            </ScreenWrapper>
                        )}
                    </FeatureGuard>

                    {/* Modals for onboarding */}
                    <CreateSchoolModal 
                        isOpen={isCreateSchoolOpen} 
                        onClose={() => setIsCreateSchoolOpen(false)} 
                        onSuccess={() => {
                            setIsCreateSchoolOpen(false);
                            fetchRoleData();
                        }} 
                    />
                    <CreateClassroomModal 
                        isOpen={isCreateClassroomOpen}
                        mode="create"
                        onClose={() => setIsCreateClassroomOpen(false)}
                        onSuccess={() => {
                            setIsCreateClassroomOpen(false);
                            fetchRoleData();
                        }}
                    />
                    <ClaimInviteModal 
                        isOpen={isClaimInviteOpen}
                        onClose={() => setIsClaimInviteOpen(false)}
                        onSuccess={() => {
                            setIsClaimInviteOpen(false);
                            fetchRoleData();
                        }}
                    />
                </Box>
            );
        }

        // C. Default/Guest View (Fallback/Wanderer)
        return (
            <FeatureGuard 
                action="read" 
                subject="ClassroomList"
                fallback={
                    <ScreenWrapper scroll={false} noTopInset={true}>
                        <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
                            <GlobalHeader title={t('classroom.welcome') || 'Welcome to Sanctuary'} subtitle={undefined} />
                            <PositiveInvitation
                                type="guest"
                                onAction={() => {
                                    hapticLight();
                                    navigation.navigate('Auth' as never);
                                }}
                            />
                        </Box>
                    </ScreenWrapper>
                }
            >
                <ScreenWrapper scroll={false} noTopInset={true}>
                    <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
                        <GlobalHeader title={t('classroom.journeyTitle') || 'Learning Journey'} subtitle={t('classroom.mySanctuary') || 'My Sanctuary'} />
                        {renderNudge()}
                        <ClassroomList
                            refreshTrigger={refreshTrigger}
                            onClassroomPress={(classroom) => {
                                // Dynamic internal navigation still needs a check, but we can use usePermissions here if needed
                                navigation.navigate('Classroom' as any, {
                                    screen: 'ClassroomDashboard', // Universal dashboard
                                    params: { classroomId: classroom.id, classroomName: classroom.name }
                                });
                            }}
                        />
                    </Box>
                </ScreenWrapper>
            </FeatureGuard>
        );
    };

    return renderContent();
}
