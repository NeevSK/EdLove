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
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { api } from '../../lib/api';
import { SchoolStats, School } from '../../lib/api/school';
import HierarchyBuilder from '../../components/principal/HierarchyBuilder';
import InviteManager from '../../components/principal/InviteManager';
import ResourceNeedsDashboard from '../../components/principal/ResourceNeedsDashboard';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
}

export default function PrincipalSchoolView({ schoolId, userId }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
    const { role } = useUserRole();
    const colors = useThemedColors();
    const [stats, setStats] = useState<SchoolStats | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'dashboard' | 'hierarchy' | 'invites'>('dashboard');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSchoolData();
    }, [schoolId]);

    const loadSchoolData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [schoolData, statsData] = await Promise.all([
                api.school.getSchool(schoolId),
                api.school.getSchoolStats(schoolId),
            ]);
            setSchool(schoolData);
            setStats(statsData);
        } catch (err: any) {
            console.error('Failed to load school data:', err);
            setError(err.message || 'Failed to load school data');
        } finally {
            setIsLoading(false);
        }
    };

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
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={colors.action} />
                        </Box>
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

                    {/* Stats Cards */}
                    {stats && !isLoading && (
                        <VStack space="md">
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
                                    <Text size="sm" color={colors.textTertiary}>
                                        {t('principal.stats.totalStudents') || 'Total Students'}
                                    </Text>
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
                        </VStack>
                    )}

                    {/* Resource Needs Dashboard - Primary Focus */}
                    {!isLoading && (
                        <Box sx={{ marginTop: Theme.spacing.lg }}>
                            <ResourceNeedsDashboard schoolId={schoolId} />
                        </Box>
                    )}

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
                                {t('principal.actions.manageHierarchy') ||
                                    '🏫 Manage School Hierarchy'}
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
                                {t('principal.actions.inviteStaff') ||
                                    '✉️ Invite Staff & Students'}
                            </ButtonText>
                        </Button>
                    </VStack>
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
