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

import { useStore } from '@repo/core';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    Button,
    ButtonText,
    ScrollView,
    Icon,
} from '@repo/ui';
import {
    Plus,
    Users,
    Zap,
    FileText
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
import { GlobalHeader } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import RoleInitialState from '../components/RoleInitialState';
import { ScreenWrapper, SandboxBanner, SkeletonCard } from '@repo/ui';
import { CreateSchoolModal } from '../components';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function PrincipalSchoolView({ schoolId, userId, onRefresh }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();

    // Resilient Hook
    const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);

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
                            {/* Sandbox Alert */}
                            {(stats as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    marginBottom: Theme.spacing.sm,
                                }}>
                                    <Zap size={16} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                    <Text sx={{ fontSize: 13, color: Theme.colors.amberGlow, fontWeight: '700' }}>
                                        {t('demoMode.sandboxPerspective') || "VISIONARY SANDBOX: Institution Patterns"}
                                    </Text>
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
                                <Button
                                    sx={{
                                        backgroundColor: colors.action,
                                        padding: Theme.spacing.lg,
                                    }}
                                    onPress={() => setActiveView('hierarchy')}
                                >
                                    <ButtonText color={colors.text}>
                                        🏫 {t('principal.actions.manageHierarchy') || 'Manage School Hierarchy'}
                                    </ButtonText>
                                </Button>

                                <Button
                                    sx={{
                                        backgroundColor: colors.success,
                                        padding: Theme.spacing.lg,
                                    }}
                                    onPress={() => setActiveView('invites')}
                                >
                                    <ButtonText color={colors.text}>
                                        ✉️ {t('principal.actions.inviteStaff') || 'Invite Staff & Students'}
                                    </ButtonText>
                                </Button>

                                <Button
                                    sx={{
                                        backgroundColor: colors.tertiary,
                                        padding: Theme.spacing.lg,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                    onPress={() => { }}
                                >
                                    <ButtonText color={colors.textSecondary}>
                                        📊 {t('principal.actions.divisionalReport') || 'Generate Divisional Report'}
                                    </ButtonText>
                                </Button>
                            </VStack>

                            {/* Footer Info */}
                            <HStack sx={{ justifyContent: 'center', gap: Theme.spacing.md, padding: Theme.spacing.lg }}>
                                <Icon as={Users} color={colors.textTertiary} />
                                <Icon as={FileText} color={colors.textTertiary} />
                            </HStack>
                        </VStack>
                    ) : (
                        !isLoading && (
                            <RoleInitialState
                                role="principal"
                                onCreatePress={() => setIsCreateModalOpen(true)}
                            />
                        )
                    )}
                </VStack>
            </ScrollView>

            <TouchableOpacity
                onPress={() => setIsCreateModalOpen(true)}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: Theme.colors.sanctuarySaffron,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    zIndex: 10
                }}
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>

            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                    else refreshData();
                }}
            />
        </ScreenWrapper>
    );
}
