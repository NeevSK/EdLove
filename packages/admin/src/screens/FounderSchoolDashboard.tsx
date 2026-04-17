/**
 * FounderSchoolView Component
 * 
 * Platform Vision and Executive Oversight for Founders
 * Features:
 * - Ecology Health (Cross-department trends)
 * - Visionary Metrics (Growth, Impact)
 * - Executive Announcements
 */

import React, { useState } from 'react';
import { Icon, useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    
    GlobalHeader,
    useThemedColors,
    ScreenWrapper,
    SandboxBanner,
    SkeletonCard,
    PositiveInvitation,
    hapticLight } from '@repo/ui';
import { useStore, useFeatureAccess, type FounderStackParamList } from '@repo/core';
import { Compass, Zap, Globe, Heart, Plus } from 'lucide-react-native';
import { CreateSchoolModal } from '../components';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFounderSchoolStats } from '../bridge/founderWorkspace';

interface FounderSchoolDashboardProps {
    schoolId: string;
    userId: string;
    onRefresh?: () => void;
}

export default function FounderSchoolDashboard({ schoolId, userId }: FounderSchoolDashboardProps) {
    const { t } = useTranslation();
    const colors = useTheme().scene;
    const { isGuest } = useFeatureAccess();
    const navigation = useNavigation<NativeStackNavigationProp<FounderStackParamList>>();

    const { school, stats, isLoading, refreshData } = useFounderSchoolStats(schoolId);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { isDemoMode } = useStore();

    return (
        <ScreenWrapper noTopInset={true}>
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
                                    backgroundColor: (amberGlow || '#ffc107') + '22',
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: amberGlow || '#ffc107',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: Theme.spacing.sm,
                                    marginBottom: Theme.spacing.sm
                                }}>
                                    <Zap size={16} color={amberGlow || '#ffc107'} fill={amberGlow || '#ffc107'} />
                                    <Text sx={{ fontSize: 13, color: amberGlow || '#ffc107', fontWeight: '700' }}>
                                        {t('demoMode.visionaryEcology') || "VISIONARY ECOLOGY: Previewing platform potential"}
                                    </Text>
                                </Box>
                            )}

                            {/* Visionary Summary */}
                            <Box
                                sx={{
                                    padding: Theme.spacing.xl,
                                    backgroundColor: colors?.action || '#2196f3',
                                    borderRadius: Theme.corners.generous,
                                    ...Theme.shadows.lg
                                }}
                            >
                                <VStack sx={{ gap: Theme.spacing.sm }}>
                                    <HStack sx={{ alignItems: "center", gap: Theme.spacing.sm }}>
                                        <Icon as={Compass} color={white || '#fff'} size={24} />
                                        <Text sx={{ color: white || '#fff', fontWeight: '700', fontSize: Theme.typography.fontSize.lg }}>
                                            {t('founder.ecologyStatus', { status: 'Balanced' })}
                                        </Text>
                                    </HStack>
                                    <Text sx={{ color: "rgba(255,255,255,0.85)", fontSize: Theme.typography.fontSize.sm }}>
                                        {t('founder.visionManifesting', { count: stats?.total_sections || 0 })}
                                    </Text>
                                </VStack>
                            </Box>

                            {/* Platform Metrics */}
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <Heading sx={{ color: colors?.text || '#fff', fontSize: Theme.typography.fontSize.md }}>
                                    {t('founder.executiveOversight')}
                                </Heading>
                                <HStack sx={{ gap: Theme.spacing.md }}>
                                    <Box sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors?.secondary || '#111', borderRadius: Theme.corners.comfortable }}>
                                        <HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <Icon as={Globe} color={colors?.action || '#2196f3'} size={20} />
                                            {isDemoMode && <Zap size={12} color={sanctuarySaffron || '#ff9800'} fill={sanctuarySaffron || '#ff9800'} />}
                                        </HStack>
                                        <Text sx={{ color: colors?.text || '#fff', fontWeight: '700', fontSize: Theme.typography.fontSize.xl, marginTop: Theme.spacing.sm }}>
                                            {stats?.total_students || 0}
                                        </Text>
                                        <Text sx={{ color: colors?.textSecondary || '#aaa', fontSize: Theme.typography.fontSize.xs }}>
                                            {t('founder.totalSouls')}
                                        </Text>
                                    </Box>
                                    <Box sx={{ flex: 1, padding: Theme.spacing.md, backgroundColor: colors?.secondary || '#111', borderRadius: Theme.corners.comfortable }}>
                                        <Zap color={colors?.warning || '#ff9800'} size={20} />
                                        <Text sx={{ color: colors?.text || '#fff', fontWeight: '700', fontSize: Theme.typography.fontSize.xl, marginTop: Theme.spacing.sm }}>
                                            {stats?.total_teachers || 0}
                                        </Text>
                                        <Text sx={{ color: colors?.textSecondary || '#aaa', fontSize: Theme.typography.fontSize.xs }}>
                                            {t('founder.guidingSpirits')}
                                        </Text>
                                    </Box>
                                </HStack>
                            </VStack>

                            {/* Ecology Health */}
                            <VStack sx={{ gap: Theme.spacing.md }}>
                                <Heading sx={{ color: colors?.textSecondary || '#aaa', fontSize: Theme.typography.fontSize.sm }}>
                                    {t('founder.visionaryInsights')}
                                </Heading>
                                <Box sx={{ padding: Theme.spacing.md, backgroundColor: colors?.secondary || '#111', borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors?.border || 'rgba(255,255,255,0.1)' }}>
                                    <HStack sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                        <VStack sx={{ gap: Theme.spacing.xs }}>
                                            <Text sx={{ color: colors?.text || '#fff', fontWeight: '700' }}>
                                                {t('founder.wellnessIndex')}
                                            </Text>
                                            <Text sx={{ color: colors?.success || '#4caf50', fontSize: Theme.typography.fontSize.xs }}>
                                                {t('founder.wellnessIncrease', { percent: 12 })}
                                            </Text>
                                        </VStack>
                                        <Heart color={colors?.error || '#f44336'} size={24} fill={colors?.error || '#f44336'} />
                                    </HStack>
                                </Box>
                            </VStack>

                            {/* Operational Shortcut for Founders */}
                            <TouchableOpacity
                                onPress={() => {
                                    hapticLight();
                                    (navigation as any).navigate('PrincipalDashboard', {
                                        schoolId: schoolId,
                                        userId: userId
                                    });
                                }}
                            >
                                <Box sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: colors?.secondary || '#111',
                                    borderRadius: Theme.corners.comfortable,
                                    borderWidth: 1,
                                    borderColor: colors?.action || '#2196f3',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: Theme.spacing.md
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: (colors?.action || '#2196f3') + '11',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Zap color={colors?.action || '#2196f3'} size={20} />
                                    </Box>
                                    <VStack sx={{ flex: 1 }}>
                                        <Text sx={{ color: colors?.text || '#fff', fontWeight: '700' }}>
                                            {t('founder.principalsOffice') || "Principal's Office"}
                                        </Text>
                                        <Text sx={{ color: colors?.textSecondary || '#aaa', fontSize: 12 }}>
                                            {t('founder.manageOperations') || "Manage staff, students, and operations"}
                                        </Text>
                                    </VStack>
                                    <Icon as={Compass} color={colors?.textSecondary || '#aaa'} size={20} />
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
                                <Box sx={{ flex: 1 }}>
                                    <SkeletonCard height={100} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <SkeletonCard height={100} />
                                </Box>
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
                    backgroundColor: sanctuarySaffron || '#ff9800',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...Theme.shadows.md,
                    zIndex: 10
                }}
            >
                <Icon as={Plus} size={24} color="white" />
            </TouchableOpacity>

            <CreateSchoolModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refreshData();
                }}
            />
        </ScreenWrapper>
    );
}
