/**
 * FounderSchoolView Component
 * 
 * Platform Vision and Executive Oversight for Founders
 * Features:
 * - Ecology Health (Cross-department trends)
 * - Visionary Metrics (Growth, Impact)
 * - Executive Announcements
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    Spinner,
} from '@/ui';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../hooks/useUserRole';
import { api } from '../../lib/api';
import { SchoolStats, School } from '../../lib/api/school';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { Compass, Zap, Globe, Heart } from 'lucide-react-native';

interface FounderSchoolViewProps {
    schoolId: string;
    userId: string;
}

export default function FounderSchoolView({ schoolId, userId }: FounderSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [stats, setStats] = useState<SchoolStats | null>(null);
    const [school, setSchool] = useState<School | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [schoolId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [schoolData, statsData] = await Promise.all([
                api.school.getSchool(schoolId),
                api.school.getSchoolStats(schoolId),
            ]);
            setSchool(schoolData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load founder view data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('founder.platformVision')}
                subtitle={school?.name || t('founder.educationalEcology')}
            />
            <ScrollView>
                <VStack space="xl" sx={{ padding: Theme.spacing.lg }}>
                    {/* Visionary Summary */}
                    <Box
                        sx={{
                            padding: Theme.spacing.xl,
                            backgroundColor: colors.action,
                            borderRadius: Theme.corners.generous,
                            ...Theme.shadows.lg
                        }}
                    >
                        <VStack space="sm">
                            <HStack space="sm" alignItems="center">
                                <Compass color={Theme.colors.white} size={24} />
                                <Text color={Theme.colors.white} bold size="lg">
                                    {t('founder.ecologyStatus', { status: 'Balanced' })}
                                </Text>
                            </HStack>
                            <Text color="rgba(255,255,255,0.85)" size="sm">
                                {t('founder.visionManifesting', { count: stats?.total_sections || 0 })}
                            </Text>
                        </VStack>
                    </Box>

                    {/* Platform Metrics */}
                    <VStack space="md">
                        <Heading size="md" color={colors.text}>{t('founder.executiveOversight')}</Heading>
                        <HStack space="md">
                            <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                                <Globe color={colors.action} size={20} />
                                <Text color={colors.text} bold size="xl" mt="$2">{stats?.total_students || 0}</Text>
                                <Text color={colors.textSecondary} size="xs">{t('founder.totalSouls')}</Text>
                            </Box>
                            <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                                <Zap color={colors.warning} size={20} />
                                <Text color={colors.text} bold size="xl" mt="$2">{stats?.total_teachers || 0}</Text>
                                <Text color={colors.textSecondary} size="xs">{t('founder.guidingSpirits')}</Text>
                            </Box>
                        </HStack>
                    </VStack>

                    {/* Ecology Health (Simulated Cross-School/Platform Trends) */}
                    <VStack space="md" mt="$4">
                        <Heading size="sm" color={colors.textSecondary}>{t('founder.visionaryInsights')}</Heading>
                        <Box p="$4" bg={colors.secondary} borderRadius={Theme.corners.comfortable} borderWidth={1} borderColor={colors.border}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <VStack space="xs">
                                    <Text color={colors.text} bold>{t('founder.wellnessIndex')}</Text>
                                    <Text color={colors.success} size="xs">{t('founder.wellnessIncrease', { percent: 12 })}</Text>
                                </VStack>
                                <Heart color={colors.error} size={24} fill={colors.error} />
                            </HStack>
                        </Box>
                    </VStack>

                    {isLoading && <Spinner color={colors.action} />}
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
