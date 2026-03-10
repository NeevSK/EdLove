/**
 * PrincipalSchoolView Component (Enhanced Dashboard)
 * 
 * School Overview Dashboard for Principals
 * Features:
 * - School statistics (students, teachers, classrooms)
 * - Quick actions (Add Section, Invite Staff)
 * - Access to hierarchy builder and invite manager
 * 
 * Mission 04: Principal's Office
 */

import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, ClassroomStackParamList, useAIAgent } from '@repo/core';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    SanctuaryButton,
    ScrollView,
    Icon,
    LotusPetalFAB,
    ScreenWrapper,
    SandboxBanner,
    SkeletonCard,
    GlobalHeader,
    useThemedColors,
    PositiveInvitation,
    hapticLight
} from '@repo/ui';
import {
    Plus,
    Users,
    Zap,
    FileText,
    CalendarCheck,
    AlertCircle,
    NotebookPen,
    School
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useGradebook } from '../hooks/useGradebook';
import { useSchoolStats } from '../hooks/useSchoolStats';
import {
    HierarchyBuilder,
    InviteManager,
    ResourceNeedsDashboard,
    DashboardEcho,
    CurriculumPulse,
    PulseDashboard,
    PrincipalAdminWidget,
    MorningSituationalBrief,
    TeacherCarousel,
    StudentPulseSection,
    LeaveApprovalSection,
    InstitutionalCalendarSection,
    PrincipalObservationsSection,
    ManagementStation,
} from '../components';
import PrincipalNotes from '../components/principal/PrincipalNotes';
import AcademicCycleManager from './AcademicCycleManager';
import AttendanceReportScreen from './AttendanceReportScreen';
import RoleInitialState from '../components/RoleInitialState';
import { api, useUserRole, SchoolStats, StudentAttendancePulse, useFeatureAccess } from '@repo/core';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function PrincipalSchoolView({ schoolId, userId, onRefresh }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();
    const navigation = useNavigation<NativeStackNavigationProp<ClassroomStackParamList>>(); // Added for navigation

    // Resilient Hook
    const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);
    const { generateTimetable, isThinking, lastTimetableDraft } = useAIAgent();
    const { isGuest } = useFeatureAccess();

    const [activeView, setActiveView] = useState<
        'main' | 'hierarchy' | 'invites' | 'notes' | 'cycles' | 'attendance_report'
    >('main');

    if (activeView === 'hierarchy') {
        return (
            <ScreenWrapper>
                <HierarchyBuilder
                    schoolId={schoolId}
                    onBack={() => setActiveView('main')}
                />
            </ScreenWrapper>
        );
    }

    if (activeView === 'invites') {
        return (
            <ScreenWrapper>
                <InviteManager
                    schoolId={schoolId}
                    userId={userId}
                    onBack={() => setActiveView('main')}
                />
            </ScreenWrapper>
        );
    }

    if (activeView === 'notes') {
        return (
            <PrincipalNotes
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    if (activeView === 'cycles') {
        return (
            <AcademicCycleManager
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    if (activeView === 'attendance_report') {
        return (
            <AttendanceReportScreen
                schoolId={schoolId}
                onBack={() => setActiveView('main')}
            />
        );
    }

    const QuickAction = ({ icon: LucideIcon, label, onPress, color, isAgentic }: any) => (
        <TouchableOpacity
            onPress={() => {
                hapticLight();
                onPress();
            }}
            style={{ flex: 1 }}
        >
            <Box
                sx={{
                    alignItems: 'center',
                    backgroundColor: colors.secondary,
                    padding: Theme.spacing.md,
                    borderRadius: Theme.corners.generous,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                <Box
                    sx={{
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: colors.tertiary,
                        marginBottom: Theme.spacing.sm,
                        position: 'relative'
                    }}
                >
                    <LucideIcon color={color || Theme.colors.sanctuarySaffron} size={24} />
                    {isAgentic && (
                        <Box sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            padding: 2,
                            borderRadius: 10,
                            backgroundColor: Theme.colors.gurudeviBlue
                        }}>
                            <Zap size={8} color="white" fill="white" />
                        </Box>
                    )}
                </Box>
                <Text color={colors.text} sx={{ textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                    {label}
                </Text>
            </Box>
        </TouchableOpacity>
    );

    const StatCard = ({ icon: LucideIcon, label, value, color }: any) => (
        <Box
            sx={{
                flex: 1,
                backgroundColor: colors.secondary,
                padding: Theme.spacing.lg,
                borderRadius: Theme.corners.generous,
                borderWidth: 1,
                borderColor: colors.border,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <VStack sx={{ zIndex: 1, gap: Theme.spacing.xs }}>
                <Text color={colors.textSecondary} sx={{ fontSize: 12, fontWeight: '700' }}>
                    {label}
                </Text>
                <Text color={colors.text} sx={{ fontSize: 32, fontWeight: '700' }}>
                    {value}{(isDemoMode || isGuest) && '*'}
                </Text>
            </VStack>
            {(isDemoMode || isGuest) && (
                <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />
                </Box>
            )}
            <Box
                sx={{
                    position: 'absolute',
                    right: -10,
                    bottom: -10,
                    opacity: 0.1
                }}
            >
                <LucideIcon color={colors.text} size={80} />
            </Box>
        </Box>
    );

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            {isDemoMode && <SandboxBanner />}
            <GlobalHeader
                title={t('classroom.schoolManagement') || 'School Management'}
                subtitle={school?.name}
            />
            <ScrollView>
                <VStack sx={{ gap: Theme.spacing.lg, padding: Theme.spacing.lg }}>
                    {/* Loading State */}
                    {isLoading && (
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <SkeletonCard height={100} />
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                            </HStack>
                        </VStack>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: colors.error,
                                borderRadius: Theme.corners.comfortable,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        >
                            <Text color={colors.text}>{error}</Text>
                        </Box>
                    )}

                    {/* Morning Brief — first thing principal sees */}
                    <MorningSituationalBrief
                        schoolId={schoolId}
                    />

                    {/* Top-level Topological Organization (Matching Teacher View) */}
                    <Animated.View entering={FadeInDown.delay(100)}>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.lg }}>
                                {t('principal.school.commandCenter') || 'Command Center'} 🏛️
                            </Heading>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <QuickAction
                                    icon={Users}
                                    label={t('principal.actions.hierarchy') || 'Hierarchy'}
                                    onPress={() => setActiveView('hierarchy')}
                                />
                                <QuickAction
                                    icon={FileText}
                                    label={t('principal.actions.invites') || 'Invites'}
                                    onPress={() => setActiveView('invites')}
                                    color={Theme.colors.sageGreen}
                                />
                                <QuickAction
                                    icon={CalendarCheck}
                                    label={t('principal.actions.timetable') || 'Timetable'}
                                    onPress={() => { }} // Timetable logic below
                                    color={Theme.colors.gurudeviBlue}
                                    isAgentic
                                />
                                <QuickAction
                                    icon={NotebookPen}
                                    label={t('principal.actions.notes') || 'Logbook'}
                                    onPress={() => setActiveView('notes')}
                                    color={Theme.colors.sanctuarySaffron}
                                />
                            </HStack>
                        </VStack>
                    </Animated.View>

                    {/* Stats Dashboard */}
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    icon={Users}
                                    label={t('principal.stats.totalStudents') || 'Students'}
                                    value={stats?.total_students || 0}
                                />
                                <StatCard
                                    icon={Zap}
                                    label={t('principal.stats.totalTeachers') || 'Teachers'}
                                    value={stats?.total_teachers || 0}
                                />
                            </HStack>
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <StatCard
                                    icon={Zap}
                                    label={t('principal.stats.activeClassrooms') || 'Classes'}
                                    value={stats?.total_classrooms || 0}
                                />
                                <StatCard
                                    icon={AlertCircle}
                                    label={t('principal.stats.totalSections') || 'Sections'}
                                    value={stats?.total_sections || 0}
                                />
                            </HStack>
                        </VStack>
                    </Animated.View>

                    {/* Operational Command Center (The Principal's Office) - Existing ManagementStation */}
                    <ManagementStation
                        onAction={(action) => setActiveView(action as any)}
                    />

                    {/* Teacher Faculty Carousel */}
                    <TeacherCarousel
                        schoolId={schoolId}
                    />

                    {/* Student Pulse */}
                    <StudentPulseSection
                        schoolId={schoolId}
                        onViewFullReport={() => setActiveView('attendance_report')}
                    />

                    {/* Leave Approvals */}
                    <LeaveApprovalSection schoolId={schoolId} principalId={userId} />

                    {/* Institutional Calendar */}
                    <InstitutionalCalendarSection schoolId={schoolId} principalId={userId} />

                    {/* Observation Notes */}
                    <PrincipalObservationsSection schoolId={schoolId} principalId={userId} />

                    {/* Timetable Drafting Section */}
                    {stats && (
                        <Box sx={{
                            marginTop: Theme.spacing.md,
                            padding: Theme.spacing.lg,
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            borderRadius: Theme.corners.generous,
                            borderWidth: 1,
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                        }}>
                            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm }}>
                                <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                    <CalendarCheck size={20} color={Theme.colors.gurudeviBlue} />
                                    <Text sx={{ fontWeight: '700', color: colors.text }}>Timetable Completion</Text>
                                </HStack>
                                <Box sx={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 12,
                                    backgroundColor: Theme.colors.gurudeviBlue + '33'
                                }}>
                                    <Text sx={{ fontSize: 10, color: Theme.colors.gurudeviBlue, fontWeight: '700' }}>AGENTIC</Text>
                                </Box>
                            </HStack>

                            {lastTimetableDraft ? (
                                <VStack sx={{ gap: 8 }}>
                                    <HStack sx={{ gap: 8, alignItems: 'center' }}>
                                        <AlertCircle size={16} color={Theme.colors.amberGlow} />
                                        <Text sx={{ fontSize: 13, color: colors.text }}>
                                            Draft generated with {lastTimetableDraft.conflicts} conflicts.
                                        </Text>
                                    </HStack>
                                    <SanctuaryButton
                                        onPress={() => console.log('Reviewing draft')}
                                        variant="solid"
                                        size="sm"
                                    >
                                        Review Draft Schedule
                                    </SanctuaryButton>
                                </VStack>
                            ) : (
                                <VStack sx={{ gap: Theme.spacing.md }}>
                                    <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                                        The annual schedule is incomplete. Your Agent can draft a balanced timetable based on current preferences.
                                    </Text>
                                    <SanctuaryButton
                                        onPress={() => generateTimetable(schoolId)}
                                        action="primary"
                                        size="md"
                                        isLoading={isThinking}
                                    >
                                        {isThinking ? 'Creating Draft...' : 'Draft Annual Timetable'}
                                    </SanctuaryButton>
                                </VStack>
                            )}
                        </Box>
                    )}

                    {/* Institutional Resonance Dashboard */}
                    <PulseDashboard schoolId={schoolId} />

                    {/* Resource Needs Section */}
                    <Box sx={{ marginTop: Theme.spacing.md }}>
                        <ResourceNeedsDashboard schoolId={schoolId} />
                    </Box>

                    {/* School Echo (Feedback Loop) */}
                    <Box sx={{ marginTop: Theme.spacing.lg }}>
                        <DashboardEcho schoolId={schoolId} />
                    </Box>

                    {/* Guest Invitation */}
                    {isGuest && (
                        <PositiveInvitation
                            type="guest"
                            context="classroom"
                            onAction={() => {
                                hapticLight();
                                navigation.navigate('SchoolCreation');
                            }}
                        />
                    )}

                    {/* Footer Info */}
                    <HStack sx={{ justifyContent: 'center', gap: Theme.spacing.md, padding: Theme.spacing.lg, paddingBottom: 100 }}>
                        <Icon as={Users as any} color={colors.textTertiary} />
                        <Icon as={FileText as any} color={colors.textTertiary} />
                    </HStack>
                </VStack>
            </ScrollView>

            <LotusPetalFAB
                currentTab="principal"
                onPress={() => navigation.navigate('SchoolCreation' as any)}
            />

            {/* CreateSchoolModal removed - now uses SchoolCreationScreen */}
        </ScreenWrapper >
    );
}
