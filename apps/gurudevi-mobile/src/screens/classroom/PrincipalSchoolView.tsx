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
} from '@gluestack-ui/themed';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { SchoolStats, School } from '../../lib/api/school';
import HierarchyBuilder from '../../components/principal/HierarchyBuilder';
import InviteManager from '../../components/principal/InviteManager';

interface PrincipalSchoolViewProps {
    schoolId: string;
    userId: string;
}

export default function PrincipalSchoolView({ schoolId, userId }: PrincipalSchoolViewProps) {
    const { t } = useTranslation();
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
            <HierarchyBuilder
                schoolId={schoolId}
                onBack={() => setActiveView('dashboard')}
            />
        );
    }

    if (activeView === 'invites') {
        return (
            <InviteManager
                schoolId={schoolId}
                userId={userId}
                onBack={() => setActiveView('dashboard')}
            />
        );
    }

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: Theme.colors.voidIndigo,
            }}
        >
            <ScrollView>
                <VStack
                    space="lg"
                    sx={{ padding: Theme.spacing.lg }}
                >
                    {/* Header */}
                    <Heading size="2xl" color={Theme.colors.sanctuarySaffron}>
                        {t('classroom.schoolOverview') || 'School Overview'}
                    </Heading>

                    {/* School Name */}
                    {school && (
                        <Text size="lg" color={Theme.colors.pearlGray}>
                            {school.name}
                        </Text>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.xl,
                                alignItems: 'center',
                            }}
                        >
                            <Spinner color={Theme.colors.sanctuarySaffron} />
                        </Box>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Box
                            sx={{
                                padding: Theme.spacing.md,
                                backgroundColor: Theme.colors.emberRed,
                                borderRadius: Theme.corners.medium,
                            }}
                        >
                            <Text color={Theme.colors.sacredWhite}>{error}</Text>
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
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.medium,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sanctuarySaffron,
                                    }}
                                >
                                    <Text size="sm" color={Theme.colors.mistGray}>
                                        {t('principal.stats.totalStudents') || 'Total Students'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={Theme.colors.sacredWhite}
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
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.medium,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.sageGreen,
                                    }}
                                >
                                    <Text size="sm" color={Theme.colors.mistGray}>
                                        {t('principal.stats.totalTeachers') || 'Total Teachers'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={Theme.colors.sacredWhite}
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
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.medium,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.twilightPurple,
                                    }}
                                >
                                    <Text size="sm" color={Theme.colors.mistGray}>
                                        {t('principal.stats.activeClassrooms') || 'Active Classes'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={Theme.colors.sacredWhite}
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
                                        backgroundColor: Theme.colors.deepIndigo,
                                        borderRadius: Theme.corners.medium,
                                        borderLeftWidth: 4,
                                        borderLeftColor: Theme.colors.amberGlow,
                                    }}
                                >
                                    <Text size="sm" color={Theme.colors.mistGray}>
                                        {t('principal.stats.totalSections') || 'Sections'}
                                    </Text>
                                    <Text
                                        size="3xl"
                                        color={Theme.colors.sacredWhite}
                                        sx={{ fontWeight: '700', marginTop: Theme.spacing.xs }}
                                    >
                                        {stats.total_sections}
                                    </Text>
                                </Box>
                            </HStack>
                        </VStack>
                    )}

                    {/* Quick Actions */}
                    <VStack space="md" sx={{ marginTop: Theme.spacing.md }}>
                        <Text
                            size="lg"
                            color={Theme.colors.pearlGray}
                            sx={{ fontWeight: '600' }}
                        >
                            {t('principal.quickActions') || 'Quick Actions'}
                        </Text>

                        <Button
                            sx={{
                                backgroundColor: Theme.colors.sanctuarySaffron,
                                padding: Theme.spacing.lg,
                            }}
                            onPress={() => setActiveView('hierarchy')}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('principal.actions.manageHierarchy') ||
                                    '🏫 Manage School Hierarchy'}
                            </ButtonText>
                        </Button>

                        <Button
                            sx={{
                                backgroundColor: Theme.colors.sageGreen,
                                padding: Theme.spacing.lg,
                            }}
                            onPress={() => setActiveView('invites')}
                        >
                            <ButtonText color={Theme.colors.sacredWhite}>
                                {t('principal.actions.inviteStaff') ||
                                    '✉️ Invite Staff & Students'}
                            </ButtonText>
                        </Button>
                    </VStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
