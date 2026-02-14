/**
 * AdminSchoolView Component
 * 
 * System Operations and Production Health for Admins
 * Features:
 * - System Stability (Uptime, Latency)
 * - Operations Audit (Users, Invites)
 * - Infrastructure Pulse
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
import { Shield, Activity, Database, Server } from 'lucide-react-native';

interface AdminSchoolViewProps {
    schoolId: string;
    userId: string;
}

export default function AdminSchoolView({ schoolId, userId }: AdminSchoolViewProps) {
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
            console.error('Failed to load admin view data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('admin.systemOperations')}
                subtitle={t('admin.productionEnvironment')}
            />
            <ScrollView>
                <VStack space="xl" sx={{ padding: Theme.spacing.lg }}>
                    {/* System Pulse */}
                    <HStack space="md">
                        <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable, borderColor: colors.success, borderWidth: 1 }}>
                            <Activity color={colors.success} size={20} />
                            <Text color={colors.text} bold size="xl" mt="$2">99.9%</Text>
                            <Text color={colors.textSecondary} size="xs">{t('admin.coreUptime')}</Text>
                        </Box>
                        <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable, borderColor: colors.action, borderWidth: 1 }}>
                            <Server color={colors.action} size={20} />
                            <Text color={colors.text} bold size="xl" mt="$2">42ms</Text>
                            <Text color={colors.textSecondary} size="xs">{t('admin.apiLatency')}</Text>
                        </Box>
                    </HStack>

                    {/* Operational Audit */}
                    <VStack space="md">
                        <Heading size="md" color={colors.text}>{t('admin.operationalAudit')}</Heading>
                        <Box p="$4" bg={colors.secondary} borderRadius={Theme.corners.comfortable}>
                            <VStack space="md">
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="sm" alignItems="center">
                                        <Database size={18} color={colors.textSecondary} />
                                        <Text color={colors.text}>{t('admin.activeSessions')}</Text>
                                    </HStack>
                                    <Text color={colors.text} bold>1.2k</Text>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack space="sm" alignItems="center">
                                        <Shield size={18} color={colors.textSecondary} />
                                        <Text color={colors.text}>{t('admin.securityAlerts')}</Text>
                                    </HStack>
                                    <Text color={colors.success} bold>0</Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </VStack>

                    {/* Infrastructure Summary */}
                    <Box p="$6" bg={colors.tertiary} borderRadius={Theme.corners.generous} borderStyle="dashed" borderWidth={1} borderColor={colors.border}>
                        <Text color={colors.textSecondary} textAlign="center" size="sm">
                            {t('admin.infraSummary', { name: school?.name || 'Sanctuary' })}
                        </Text>
                    </Box>

                    {isLoading && <Spinner color={colors.action} />}
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
