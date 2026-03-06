/**
 * FounderSchoolView Component
 * 
 * Platform Vision and Executive Oversight for Founders
 * Features:
 * - Ecology Health (Cross-department trends)
 * - Visionary Metrics (Growth, Impact)
 * - Executive Announcements
 */

import { useStore, useUserRole, useFeatureAccess } from '@repo/core';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    Spinner,
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { useClassroomRoleData } from '../hooks/useClassroomRoleData';
import { useSchoolStats } from '../hooks/useSchoolStats';
import { useEcosystemStats } from '../hooks/useEcosystemStats';
import { useTranslation } from 'react-i18next';
import { GlobalHeader } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import RoleInitialState from '../components/RoleInitialState';
import { ScreenWrapper } from '@repo/ui';
import { Compass, Zap, Globe, Heart, Plus } from 'lucide-react-native';
import { SandboxBanner } from '@repo/ui';
import { CreateSchoolModal } from '../components';
import { TouchableOpacity } from 'react-native';
import { SkeletonCard, PositiveInvitation, hapticLight } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';


interface FounderSchoolViewProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function FounderSchoolView({ schoolId, userId }: FounderSchoolViewProps) {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const { isGuest } = useFeatureAccess();
    const navigation = useNavigation<any>();


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
                <VStack sx={{ padding: Theme.spacing.lg, gap: Theme.spacing.lg }}>
                    {/* Main Content */}
                    {stats && !isLoading && (
                        <VStack sx={{ gap: Theme.spacing.lg }}>
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
                                    gap: Theme.spacing.sm,
                                    marginBottom: Theme.spacing.sm
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
                                <VStack sx={{ gap: Theme.spacing.sm }}>
                                    <HStack alignItems="center" sx={{ gap: Theme.spacing.sm }}>
                                        <Compass color={Theme.colors.white} size={24} />
                                        <Text color={Theme.colors.white} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.lg }}>
                                            {t('founder.ecologyStatus', { status: 'Balanced' })}
                                        </Text>
                                    </HStack>
                                    <Text color="rgba(255,255,255,0.85)" sx={{ fontSize: Theme.typography.fontSize.sm }}>
                                        {t('founder.visionManifesting', { count: stats?.total_sections || 0 })}
                                    </Text>
                                </VStack>
                            </Box>

                            {/* Platform Metrics */}
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <Heading color={colors.text} sx={{ fontSize: Theme.typography.fontSize.md }}>{t('founder.executiveOversight')}</Heading>
                                <HStack sx={{ gap: Theme.spacing.md }}>
                                    <Box sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                                        <HStack justifyContent="space-between" alignItems="center">
                                            <Globe color={colors.action} size={20} />
                                            {isDemoMode && <Zap size={12} color={Theme.colors.sanctuarySaffron} fill={Theme.colors.sanctuarySaffron} />}
                                        </HStack>
                                        <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.xl, marginTop: Theme.spacing.sm }}>{stats?.total_students || 0}</Text>
                                        <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.xs }}>{t('founder.totalSouls')}</Text>
                                    </Box>
                                    <Box sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable }}>
                                        <Zap color={colors.warning} size={20} />
                                        <Text color={colors.text} sx={{ fontWeight: '700', fontSize: Theme.typography.fontSize.xl, marginTop: Theme.spacing.sm }}>{stats?.total_teachers || 0}</Text>
                                        <Text color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.xs }}>{t('founder.guidingSpirits')}</Text>
                                    </Box>
                                </HStack>
                            </VStack>

                            {/* Ecology Health (Simulated Cross-School/Platform Trends) */}
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <Heading color={colors.textSecondary} sx={{ fontSize: Theme.typography.fontSize.sm }}>{t('founder.visionaryInsights')}</Heading>
                                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors.secondary, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors.border }}>
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <VStack sx={{ gap: Theme.spacing.xs }}>
                                            <Text color={colors.text} sx={{ fontWeight: '700' }}>{t('founder.wellnessIndex')}</Text>
                                            <Text color={colors.success} sx={{ fontSize: Theme.typography.fontSize.xs }}>{t('founder.wellnessIncrease', { percent: 12 })}</Text>
                                        </VStack>
                                        <Heart color={colors.error} size={24} fill={colors.error} />
                                    </HStack>
                                </Box>
                            </VStack>

                            {/* Operational Shortcut for Founders */}
                            <TouchableOpacity
                                onPress={() => {
                                    hapticLight();
                                    navigation.navigate('PrincipalSchoolView', {
                                        schoolId: schoolId,
                                        userId: userId
                                    });
                                }}
                            >
                                <Box sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: colors.secondary,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: colors.action,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: Theme.spacing.md
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: colors.action + '11',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Zap color={colors.action} size={20} />
                                    </Box>
                                    <VStack sx={{ flex: 1 }}>
                                        <Text color={colors.text} sx={{ fontWeight: '700' }}>{t('founder.principalsOffice') || "Principal's Office"}</Text>
                                        <Text color={colors.textSecondary} sx={{ fontSize: 12 }}>{t('founder.manageOperations') || "Manage staff, students, and operations"}</Text>
                                    </VStack>
                                    <Compass color={colors.textSecondary} size={20} />
                                </Box>
                            </TouchableOpacity>


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
                        <VStack sx={{ gap: Theme.spacing.md }}>
                            <SkeletonCard height={120} />
                            <HStack sx={{ gap: Theme.spacing.md }}>
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
