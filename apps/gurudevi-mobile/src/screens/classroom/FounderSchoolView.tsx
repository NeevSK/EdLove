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
import { useSchoolStats } from '../../hooks/classroom/useSchoolStats';
import GlobalHeader from '../../components/shared/GlobalHeader';
import { useThemedColors } from '../../hooks/useThemedColors';
import RoleInitialState from '../../components/classroom/RoleInitialState';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import { Compass, Zap, Globe, Heart, Plus } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import SandboxBanner from '../../components/shared/SandboxBanner';
import { CreateSchoolModal } from '../../components/classroom';
import { TouchableOpacity } from 'react-native';
import { SkeletonCard } from '../../components/shared/SkeletonLoader';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import PositiveInvitation from '../../components/shared/PositiveInvitation';
import { hapticLight } from '../../utils/haptics';

interface FounderSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function FounderSchoolView({ schoolId, userId }: FounderSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isGuest } = useFeatureAccess();

    // Resilient Hook
    const { school, stats, isLoading, refreshData } = useSchoolStats(schoolId);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { isDemoMode } = useStore();

    // Load data handled by hook

    return (
        <ScreenWrapper>
            {isDemoMode && <SandboxBanner />}
            <GlobalHeader
                title={t('founder.platformVision')}
                subtitle={school?.name || t('founder.educationalEcology')}
            />
            <ScrollView>
                <VStack space="xl" sx={{ padding: Theme.spacing.lg }}>
                    {/* Main Content */}
                    {stats && !isLoading && (
                        <VStack space="xl">
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
                                        {t('demoMode.visionaryEcology') || "VISIONARY ECOLOGY: Previewing platform potential"}
                                    </Text>
                                </Box>
                            )}

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
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Globe color={colors.action} size={20} />
                                            {isDemoMode && <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />}
                                        </HStack>
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

                            {isGuest && (
                                <PositiveInvitation
                                    type="guest"
                                    onAction={() => {
                                        hapticLight();
                                    }}
                                />
                            )}
                        </VStack>
                    )}

                    {isLoading && (
                        <VStack space="md">
                            <SkeletonCard height={120} />
                            <HStack space="md">
                                <SkeletonCard height={100} style={{ flex: 1 }} />
                                <SkeletonCard height={100} style={{ flex: 1 }} />
                            </HStack>
                            <SkeletonCard height={80} />
                        </VStack>
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
                onSuccess={(newSchool) => {
                    refreshData();
                }}
            />
        </ScreenWrapper>
    );
}
