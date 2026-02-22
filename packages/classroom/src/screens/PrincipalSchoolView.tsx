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
    useThemedColors
} from '@repo/ui';
import {
    Plus,
    Users,
    Zap,
    FileText,
    CalendarCheck,
    AlertCircle
} from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useSchoolStats } from '../hooks/classroom/useSchoolStats';
import {
    HierarchyBuilder,
    InviteManager,
    ResourceNeedsDashboard,
    DashboardEcho,
    CurriculumPulse,
    PrincipalAdminWidget
} from '../components';
import RoleInitialState from '../components/RoleInitialState';

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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'hierarchy' | 'invites'>('dashboard');

    if (activeView === 'hierarchy') {
        return (
            <ScreenWrapper>
                <HierarchyBuilder
                    schoolId={schoolId}
                    onBack={() => setActiveView('dashboard')}
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
                    onBack={() => setActiveView('dashboard')}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
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

                    {/* Stats Dashboard */}
                    {stats && !isLoading ? (
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            {/* Sandbox Alert and Call to Action */}
                            {(stats as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    marginBottom: Theme.spacing.sm,
                                }}>
                                    <HStack sx={{ alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: Theme.spacing.sm }}>
                                        <Zap size={16} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                        <Text sx={{ fontSize: 13, color: Theme.colors.amberGlow, fontWeight: '700' }}>
                                            {t('demoMode.sandboxPerspective') || "VISIONARY SANDBOX: Institution Patterns"}
                                        </Text>
                                    </HStack>
                                    <Text color={colors.textSecondary} sx={{ fontSize: 13, textAlign: 'center', marginBottom: Theme.spacing.md }}>
                                        Play around with this demo school data to see how the platform works.
                                    </Text>
                                    <SanctuaryButton
                                        onPress={() => navigation.navigate('SchoolCreation' as any)}
                                        action="primary"
                                        size="lg"
                                        fullWidth
                                    >
                                        Establish Your School
                                    </SanctuaryButton>
                                </Box>
                            )}

                            {/* Row 1: Students & Teachers */}
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <Box
                                    sx={{
                                        flex: 1,
                                        padding: Theme.spacing.lg,
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: colors.action,
                                    }}
                                >
                                    <HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                        <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.textTertiary}>
                                            {t('principal.stats.totalStudents') || 'Students'}
                                        </Text>
                                        {isDemoMode && <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />}
                                    </HStack>
                                    <Text
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs, fontSize: Theme.typography.fontSize['2xl'] }}
                                    >
                                        {stats.total_students}
                                    </Text>
                                </Box>

                                <Box
                                    sx={{
                                        flex: 1,
                                        padding: Theme.spacing.lg,
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: colors.success,
                                    }}
                                >
                                    <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.textTertiary}>
                                        {t('principal.stats.totalTeachers') || 'Teachers'}
                                    </Text>
                                    <Text
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs, fontSize: Theme.typography.fontSize['2xl'] }}
                                    >
                                        {stats.total_teachers}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Row 2: Classes & Sections */}
                            <HStack sx={{ gap: Theme.spacing.md }}>
                                <Box
                                    sx={{
                                        flex: 1,
                                        padding: Theme.spacing.lg,
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: colors.tertiary,
                                    }}
                                >
                                    <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.textTertiary}>
                                        {t('principal.stats.activeClassrooms') || 'Classes'}
                                    </Text>
                                    <Text
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs, fontSize: Theme.typography.fontSize['2xl'] }}
                                    >
                                        {stats.total_classrooms}
                                    </Text>
                                </Box>

                                <Box
                                    sx={{
                                        flex: 1,
                                        padding: Theme.spacing.lg,
                                        backgroundColor: colors.secondary,
                                        borderRadius: Theme.corners.comfortable,
                                        borderLeftWidth: 4,
                                        borderLeftColor: colors.warning,
                                    }}
                                >
                                    <Text sx={{ fontSize: Theme.typography.fontSize.sm }} color={colors.textTertiary}>
                                        {t('principal.stats.totalSections') || 'Sections'}
                                    </Text>
                                    <Text
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs, fontSize: Theme.typography.fontSize['2xl'] }}
                                    >
                                        {stats.total_sections}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Agentic Structural Repair: Timetable */}
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

                            {/* Resource Needs Section */}
                            <Box sx={{ marginTop: Theme.spacing.md }}>
                                <PrincipalAdminWidget onAction={(action) => console.log('Principal Admin Action:', action)} />
                            </Box>

                            {/* Resource Needs Section */}
                            <Box sx={{ marginTop: Theme.spacing.md }}>
                                <ResourceNeedsDashboard schoolId={schoolId} />
                            </Box>

                            {/* School Echo (Feedback Loop) */}
                            <Box sx={{ marginTop: Theme.spacing.lg }}>
                                <DashboardEcho schoolId={schoolId} />
                            </Box>

                            {/* Curriculum Pulse (Syllabus Tracking) */}
                            <Box sx={{ marginTop: Theme.spacing.lg }}>
                                <CurriculumPulse schoolId={schoolId} />
                            </Box>

                            {/* Utility Actions */}
                            <VStack sx={{ gap: Theme.spacing.md, marginTop: Theme.spacing.md }}>
                                <Heading sx={{ fontSize: Theme.typography.fontSize.xl }} color={colors.textSecondary}>
                                    {t('principal.school.quickActions') || 'Institutional Actions'}
                                </Heading>
                                <SanctuaryButton
                                    fullWidth
                                    onPress={() => setActiveView('hierarchy')}
                                    action="primary"
                                    size="lg"
                                >
                                    {`🏫 ${t('principal.actions.manageHierarchy') || 'Manage School Hierarchy'}`}
                                </SanctuaryButton>

                                <SanctuaryButton
                                    fullWidth
                                    onPress={() => setActiveView('invites')}
                                    action="positive"
                                    size="lg"
                                >
                                    {`✉️ ${t('principal.actions.inviteStaff') || 'Invite Staff & Students'}`}
                                </SanctuaryButton>

                                <SanctuaryButton
                                    fullWidth
                                    onPress={() => { }}
                                    variant="outline"
                                    size="lg"
                                >
                                    {`📊 ${t('principal.actions.divisionalReport') || 'Generate Divisional Report'}`}
                                </SanctuaryButton>
                            </VStack>

                            {/* Footer Info */}
                            <HStack sx={{ justifyContent: 'center', gap: Theme.spacing.md, padding: Theme.spacing.lg }}>
                                <Icon as={Users as any} color={colors.textTertiary} />
                                <Icon as={FileText as any} color={colors.textTertiary} />
                            </HStack>
                        </VStack>
                    ) : (
                        !isLoading && (
                            <RoleInitialState
                                role="principal"
                                onCreatePress={() => navigation.navigate('SchoolCreation' as any)}
                            />
                        )
                    )}
                </VStack>
            </ScrollView>

            <LotusPetalFAB
                currentTab="principal"
                onPress={() => navigation.navigate('SchoolCreation' as any)}
            />

            {/* CreateSchoolModal removed - now uses SchoolCreationScreen */}
        </ScreenWrapper>
    );
}
