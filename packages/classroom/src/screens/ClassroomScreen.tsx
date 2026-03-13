/**
 * ClassroomScreen Component
 * 
 * Role-aware routing screen that displays different views based on user role:
 * - Principal: School overview (all sections)
 * - Section Head: Section overview (Primary/Junior/Senior)
 * - Grade Head: Grade overview (all classes in grade)
 * - Teacher/Student: Classroom list (assigned classes)
 */

import { supabase, useUserRole, hasRole, ADMIN_ROLES, MANAGEMENT_ROLES, useRoleFeatures, useStore } from '@repo/core';

import React, { useEffect, useState } from 'react';
import { 
    Box, VStack, HStack, Text, Theme, useThemedColors, SkeletonCard,
    GlobalHeader, ScreenWrapper, PositiveInvitation, hapticLight,
} from '@repo/ui';
import { BreathGuide } from '@repo/self';
import PrincipalSchoolView from './PrincipalSchoolView';
import SectionHeadView from './SectionHeadView';
import GradeHeadView from './GradeHeadView';
import FounderSchoolView from './FounderSchoolView';
import FounderDashboard from './FounderDashboard';
import { ClassroomList, TeacherDashboard, StudentDashboard, NoSchoolOnboarding } from '../components';
import { useClassroomRoleData } from '../hooks';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SanctuaryNudge } from '@repo/ui';
import { Wind, Heart, Zap, Sparkles } from 'lucide-react-native';

export default function ClassroomScreen() {
    const colors = useThemedColors();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const storeSchoolId = useStore(state => state.user?.school_id);
    const { setBreathingOpen } = useStore();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { data: classroomData, loading, fetchRoleData } = useClassroomRoleData(refreshTrigger);

    useEffect(() => {
        fetchRoleData();
    }, [role]);

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
        if (role === 'teacher' && classroomData) {
            return (
                <SanctuaryNudge
                    title={t('classroom.nudges.breathing.title') || "Feeling Overwhelmed?"}
                    description={t('classroom.nudges.breathing.message') || "Take a 60-second breathing reset to center yourself before your next session."}
                    actionLabel={t('classroom.nudges.breathing.action') || "Start Reset"}
                    onAction={() => setBreathingOpen(true)}
                    icon={Wind}
                />
            );
        }

        if (role === 'principal' && classroomData) {
            return (
                <SanctuaryNudge
                    title={t('principal.nudges.breathing.title') || "Leadership Clarity"}
                    description={t('principal.nudges.breathing.message') || "Principals carry the weight of the institution. A minute of breathing restores focus."}
                    actionLabel={t('principal.nudges.breathing.action') || "Pause & Breathe"}
                    onAction={() => setBreathingOpen(true)}
                    icon={Wind}
                />
            );
        }

        if (role === 'founder' && classroomData) {
            return (
                <SanctuaryNudge
                    title={t('founder.nudges.breathing.title') || "Visionary Pulse"}
                    description={t('founder.nudges.breathing.message') || "Taking a moment for yourself is the best way to lead by example for your ecosystem."}
                    actionLabel={t('founder.nudges.breathing.action') || "Mindful Reset"}
                    onAction={() => setBreathingOpen(true)}
                    icon={Wind}
                />
            );
        }

        if (role === 'student' && classroomData) {
            return (
                <SanctuaryNudge
                    title={t('student.nudges.breathing.title') || "Learning Fuel"}
                    description={t('student.nudges.breathing.message') || "Studies are easier when your mind is calm. Reset your breath to improve focus."}
                    actionLabel={t('student.nudges.breathing.action') || "Breathe Now"}
                    onAction={() => setBreathingOpen(true)}
                    icon={Wind}
                />
            );
        }

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
        if (classroomData) {
            if (role === 'founder') return <FounderDashboard />;
            
            if (role === 'principal' || role === 'developer' || role === 'admin') {
                const schoolIdToUse = (classroomData.schoolId || storeSchoolId) || 'demo-school';
                return (
                    <PrincipalSchoolView
                        schoolId={schoolIdToUse}
                        userId={classroomData.userId}
                        onRefresh={fetchRoleData}
                    />
                );
            }

            if (role === 'section_head') return <SectionHeadView schoolId={classroomData?.schoolId || undefined} userId={classroomData?.userId} />;
            if (role === 'grade_head') return <GradeHeadView schoolId={classroomData?.schoolId || undefined} userId={classroomData?.userId} />;

            // Teacher View
            if (role === 'teacher') {
                return (
                    <ScreenWrapper scroll={false} noTopInset={true}>
                        <Box sx={{ flex: 1 }}>
                            <GlobalHeader title="Classroom 💛" subtitle={undefined} />
                            {renderNudge()}
                            <TeacherDashboard
                                schoolId={classroomData?.schoolId || undefined}
                                userId={classroomData?.userId}
                                onRefresh={fetchRoleData}
                            />
                        </Box>
                    </ScreenWrapper>
                );
            }

            // Student View (Instant Routing)
            if ((role as any) === 'student' || (isGuest && (role as any) === 'student')) {
                return (
                    <ScreenWrapper scroll={false} noTopInset={true}>
                        <Box sx={{ flex: 1 }}>
                            <GlobalHeader title={t('classroom.mySanctuaries') || 'My Sanctuaries'} subtitle={undefined} />
                            {renderNudge()}
                            <StudentDashboard
                                schoolId={classroomData?.schoolId || undefined}
                                userId={classroomData?.userId}
                                onRefresh={fetchRoleData}
                            />
                        </Box>
                    </ScreenWrapper>
                );
            }
        }

        // C. Default/Guest View (Fallback)
        const headerTitle = isGuest ? (t('classroom.welcome') || 'Welcome to Sanctuary') : (t('classroom.journeyTitle') || 'Learning Journey');
        const headerSubtitle = isGuest ? (t('classroom.explore') || 'Explore Sample Sanctuaries') : (t('classroom.mySanctuary') || 'My Sanctuary');

        return (
            <ScreenWrapper scroll={false} noTopInset={true}>
                <Box sx={{ flex: 1, padding: Theme.spacing.lg }}>
                    <GlobalHeader title={headerTitle} subtitle={isGuest ? undefined : headerSubtitle} />
                    {renderNudge()}
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
                                navigation.navigate('Auth' as never);
                            }}
                        />
                    )}
                </Box>
            </ScreenWrapper>
        );
    };

    return renderContent();
}
