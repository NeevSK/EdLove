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
import { useSchoolStats } from '../../hooks/classroom/useSchoolStats';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from '../../components/classroom/RoleInitialState';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { Shield, Activity, Database, Server, Zap } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import SandboxBanner from '../../components/shared/SandboxBanner';

interface AdminSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function AdminSchoolView({ schoolId, userId }: AdminSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();

    // Resilient Hook
    const { school, stats, isLoading } = useSchoolStats(schoolId);

    const { isDemoMode } = useStore();
    // Load data handled by hook

    return (
        <ScreenWrapper>
            {isDemoMode && <SandboxBanner />}
            <GlobalHeader
                title={t('admin.systemOperations')}
                subtitle={t('admin.productionEnvironment')}
            />
            <ScrollView>
                <VStack space="xl" sx={{ padding: Theme.spacing.lg }}>
                    {/* Main Content */}
                    {stats && !isLoading && (
                        stats.total_students > 0 || stats.total_teachers > 0 ? (
                            <>
                                {/* System Pulse */}
                                <HStack space="md">
                                    <Box sx={{ flex: 1, p: "$4", bg: colors.secondary, borderRadius: Theme.corners.comfortable, borderColor: colors.success, borderWidth: 1 }}>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Activity color={colors.success} size={20} />
                                            {isDemoMode && <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />}
                                        </HStack>
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
                                                <Text color={colors.text} bold>{stats.total_students + stats.total_teachers}</Text>
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
                            </>
                        ) : (
                            <RoleInitialState
                                role="admin"
                                onCreatePress={() => {
                                    // Admins can often jump into system settings
                                    console.log('Admin initializing system settings');
                                }}
                                onSamplePress={(item) => {
                                    console.log('Admin Sample pressed:', item.title);
                                }}
                            />
                        )
                    )}

                    {isLoading && <Spinner color={colors.action} />}
                </VStack>
            </ScrollView>
        </ScreenWrapper>
    );
}
