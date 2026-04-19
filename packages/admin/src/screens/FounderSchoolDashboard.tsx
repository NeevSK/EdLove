import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Text,
    Heading,
    VStack,
    HStack,
    ScrollView,
    Icon,
    GlobalHeader,
    useThemedColors,
    useTheme,
    ScreenWrapper,
    SandboxBanner,
    SkeletonCard,
    PositiveInvitation,
    hapticLight,
    Theme,
    Pressable
} from '@repo/ui';
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
    const colors = useThemedColors();
    const theme = useTheme();
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
            
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="p-6 gap-6">
                    {/* Main Content */}
                    {stats && !isLoading && (
                        <VStack className="gap-6">
                            {(stats as any).is_sample && (
                                <Box 
                                    className="p-4 rounded-xl border items-center justify-center flex-row gap-2 mb-2"
                                    style={{
                                        backgroundColor: (theme.accent.reward || '#ffc107') + '22',
                                        borderColor: theme.accent.reward || '#ffc107',
                                    }}
                                >
                                    <Icon as={Zap} size="sm" color={theme.accent.reward} fill={theme.accent.reward} />
                                    <Text className="text-xs font-bold" style={{ color: theme.accent.reward }}>
                                        {t('demoMode.visionaryEcology') || "VISIONARY ECOLOGY: Previewing platform potential"}
                                    </Text>
                                </Box>
                            )}

                            {/* Visionary Summary */}
                            <Box
                                className="p-8 rounded-3xl"
                                style={{
                                    backgroundColor: colors.action,
                                    ...Theme.shadows.lg
                                }}
                            >
                                <VStack className="gap-2">
                                    <HStack className="items-center gap-2">
                                        <Icon as={Compass} color={theme.text.inverse} size="lg" />
                                        <Text 
                                            className="font-bold text-lg"
                                            style={{ color: theme.text.inverse }}
                                        >
                                            {t('founder.ecologyStatus', { status: 'Balanced' })}
                                        </Text>
                                    </HStack>
                                    <Text className="text-sm opacity-90" style={{ color: theme.text.inverse }}>
                                        {t('founder.visionManifesting', { count: stats?.total_sections || 0 })}
                                    </Text>
                                </VStack>
                            </Box>

                            {/* Platform Metrics */}
                            <VStack className="gap-4">
                                <Heading className="text-base" style={{ color: theme.text.primary }}>
                                    {t('founder.executiveOversight')}
                                </Heading>
                                <HStack className="gap-4">
                                    <Box className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.secondary }}>
                                        <HStack className="justify-between items-center">
                                            <Icon as={Globe} color={colors.action} size="md" />
                                            {isDemoMode && <Icon as={Zap} size="xs" color={theme.accent.reward} fill={theme.accent.reward} />}
                                        </HStack>
                                        <Text className="font-bold text-2xl mt-2" style={{ color: theme.text.primary }}>
                                            {stats?.total_students || 0}
                                        </Text>
                                        <Text className="text-xs" style={{ color: theme.text.secondary }}>
                                            {t('founder.totalSouls')}
                                        </Text>
                                    </Box>
                                    <Box className="flex-1 p-4 rounded-xl" style={{ backgroundColor: colors.secondary }}>
                                        <Icon as={Zap} color={colors.warning} size="md" />
                                        <Text className="font-bold text-2xl mt-2" style={{ color: theme.text.primary }}>
                                            {stats?.total_teachers || 0}
                                        </Text>
                                        <Text className="text-xs" style={{ color: theme.text.secondary }}>
                                            {t('founder.guidingSpirits')}
                                        </Text>
                                    </Box>
                                </HStack>
                            </VStack>

                            {/* Ecology Health */}
                            <VStack className="gap-4">
                                <Heading className="text-sm" style={{ color: theme.text.secondary }}>
                                    {t('founder.visionaryInsights')}
                                </Heading>
                                <Box 
                                    className="p-4 rounded-xl border"
                                    style={{ 
                                        backgroundColor: colors.secondary,
                                        borderColor: colors.border
                                    }}
                                >
                                    <HStack className="justify-between items-center">
                                        <VStack className="gap-1">
                                            <Text className="font-bold" style={{ color: theme.text.primary }}>
                                                {t('founder.wellnessIndex')}
                                            </Text>
                                            <Text className="text-xs" style={{ color: colors.success }}>
                                                {t('founder.wellnessIncrease', { percent: 12 })}
                                            </Text>
                                        </VStack>
                                        <Icon as={Heart} color={colors.error} size={24} fill={colors.error} />
                                    </HStack>
                                </Box>
                            </VStack>

                            {/* Operational Shortcut for Founders */}
                            <Pressable
                                onPress={() => {
                                    hapticLight();
                                    (navigation as any).navigate('PrincipalDashboard', {
                                        schoolId: schoolId,
                                        userId: userId
                                    });
                                }}
                            >
                                <Box 
                                    className="p-4 rounded-xl border flex-row items-center gap-4 active:bg-ink/5"
                                    style={{
                                        backgroundColor: colors.secondary,
                                        borderColor: colors.action
                                    }}
                                >
                                    <Box 
                                        className="w-10 h-10 rounded-full justify-center items-center"
                                        style={{ backgroundColor: colors.action + '11' }}
                                    >
                                        <Icon as={Zap} color={colors.action} size="md" />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text className="font-bold" style={{ color: theme.text.primary }}>
                                            {t('founder.principalsOffice') || "Principal's Office"}
                                        </Text>
                                        <Text className="text-xs" style={{ color: theme.text.secondary }}>
                                            {t('founder.manageOperations') || "Manage staff, students, and operations"}
                                        </Text>
                                    </VStack>
                                    <Icon as={Compass} color={theme.text.secondary} size="md" />
                                </Box>
                            </Pressable>

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
                        <VStack className="gap-4">
                            <SkeletonCard height={120} />
                            <HStack className="gap-4">
                                <Box className="flex-1">
                                    <SkeletonCard height={100} />
                                </Box>
                                <Box className="flex-1">
                                    <SkeletonCard height={100} />
                                </Box>
                            </HStack>
                            <SkeletonCard height={80} />
                        </VStack>
                    )}
                </VStack>
            </ScrollView>

            <Pressable
                onPress={() => setIsCreateModalOpen(true)}
                className="absolute bottom-5 right-5 w-14 h-14 rounded-full justify-center items-center z-10 bg-amber-500 active:scale-95 shadow-lg"
            >
                <Icon as={Plus} size="lg" color="white" />
            </Pressable>

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


