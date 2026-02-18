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

import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    Button,
    ButtonText,
    ScrollView,
    Spinner,
    Pressable,
} from '@/ui';
import {
    Plus,
    Users,
    UserCheck,
    Layout,
    Layers,
    ChevronRight,
    Search,
    Zap,
    X,
    Edit2,
    Trash2
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { hapticLight } from '../../utils/haptics';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { useSchoolStats } from '../../hooks/classroom/useSchoolStats';
import HierarchyBuilder from '../../components/principal/HierarchyBuilder';
import InviteManager from '../../components/principal/InviteManager';
import ResourceNeedsDashboard from '../../components/principal/ResourceNeedsDashboard';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from '../../components/classroom/RoleInitialState';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import SandboxBanner from '../../components/shared/SandboxBanner';
import { CreateSchoolModal } from '../../components/classroom';
import { SkeletonCard } from '../../components/shared/SkeletonLoader';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function PrincipalSchoolView({ schoolId, userId, onRefresh }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const colors = useThemedColors();
    const { isDemoMode } = useStore();


    // Resilient Hook
    const { school, stats, isLoading, error, refreshData } = useSchoolStats(schoolId);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'hierarchy' | 'invites'>('dashboard');

    // Load data handled by hook

    // Show different views based on activeView
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
                <VStack
                    space="lg"
                    sx={{ padding: Theme.spacing.lg }}
                >
                    {/* Loading State */}
                    {isLoading && (
                        <VStack space="md">
                            <SkeletonCard height={100} />
                            <HStack space="md">
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                                <SkeletonCard height={120} style={{ flex: 1 }} />
                            </HStack>
                            <HStack space="md">
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

                    {/* Stats Cards or Initial State */}
                    {stats && !isLoading ? (
                        <VStack space="md">
                            {(stats as any).is_sample && (
                                <Box sx={{
                                    backgroundColor: Theme.colors.amberGlow + '22',
                                    p: "$3",
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.amberGlow,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    mb: "$2"
                                }}>
                                    <Zap size={16} color={Theme.colors.amberGlow} fill={Theme.colors.amberGlow} />
                                    <Text sx={{ fontSize: 13, color: Theme.colors.amberGlow, fontWeight: '700' }}>
                                        {t('demoMode.sandboxPerspective') || "VISIONARY SANDBOX: Previewing potential institutional patterns"}
                                    </Text>
                                </Box>
                            )}

                            {/* Row 1: Students & Teachers */}
                            <HStack space="md">
                                {/* Total Students Card */}
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
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text size="sm" color={colors.textTertiary}>
                                            {t('principal.stats.totalStudents') || 'Total Students'}
                                        </Text>
                                        {isDemoMode && <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />}
                                    </HStack>
                                    <Text
                                        size="3xl"
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs }}
                                    >
                                        {stats.total_students}
                                    </Text>
                                </Box>

                                {/* Total Teachers Card */}
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
                                    <Text size="sm" color={colors.textTertiary}>
                                        {t('principal.stats.totalTeachers') || 'Total Teachers'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs }}
                                    >
                                        {stats.total_teachers}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Row 2: Classrooms & Sections */}
                            <HStack space="md">
                                {/* Active Classrooms Card */}
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
                                    <Text size="sm" color={colors.textTertiary}>
                                        {t('principal.stats.activeClassrooms') || 'Active Classes'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs }}
                                    >
                                        {stats.total_classrooms}
                                    </Text>
                                </Box>

                                {/* Total Sections Card */}
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
                                    <Text size="sm" color={colors.textTertiary}>
                                        {t('principal.stats.totalSections') || 'Sections'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={colors.text}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs }}
                                    >
                                        {stats.total_sections}
                                    </Text>
                                </Box>
                            </HStack>

                            {/* Resource Needs Dashboard - Primary Focus */}
                            <Box sx={{ marginTop: Theme.spacing.lg }}>
                                <ResourceNeedsDashboard schoolId={schoolId} />
                            </Box>

                            {/* Quick Actions */}
                            <VStack space="md" sx={{ marginTop: Theme.spacing.md }}>
                                <Text
                                    size="lg"
                                    color={colors.textSecondary}
                                    sx={{ fontWeight: '600' }}
                                >
                                    {t('principal.quickActions') || 'Quick Actions'}
                                </Text>

                                <Button
                                    sx={{
                                        backgroundColor: colors.action,
                                        padding: Theme.spacing.lg,
                                    }}
                                    onPress={() => setActiveView('hierarchy')}
                                >
                                    <ButtonText color={colors.text}>
                                        {isDemoMode ? `⚡ (${t('demoMode.simulationAlert')}) ` : ''}
                                        {t('principal.actions.manageHierarchy') || '🏫 Manage School Hierarchy'}
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
                                        {isDemoMode ? `⚡ (${t('demoMode.simulationAlert')}) ` : ''}
                                        {t('principal.actions.inviteStaff') || '✉️ Invite Staff & Students'}
                                    </ButtonText>
                                </Button>
                            </VStack>
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
                    ...Theme.shadows.md,
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
