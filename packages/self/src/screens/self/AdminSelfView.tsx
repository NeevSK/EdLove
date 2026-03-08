/**
 * AdminSelfView Component
 * 
 * Sanctuary for the Admin - focus on System Balance and Operational Harmony
 */

import { supabase, useStore } from '@repo/core';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    Box,
    VStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    GlobalHeader
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Shield, Settings, Activity, Database, Layout, Heart } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { hapticLight } from '@repo/ui';
import MoodLotus from '../../components/MoodLotus';
import ShadowAgentDrawer from '../../components/ShadowAgentDrawer';
import DailyContentCard from '../../components/DailyContentCard';
import ResonancePatternCard from '../../components/ResonancePatternCard';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useThemedColors, useBottomTabPadding, ScreenWrapper, AdaptiveLayout } from '@repo/ui';

const ADMIN_CORE_FEATURES = [
    { id: 'balance', icon: Activity, category: 'core' },
    { id: 'mood', icon: Heart, category: 'core' },
    { id: 'config', icon: Settings, category: 'core' },
];

const ADMIN_MORE_TOOLS = [
    { id: 'security', icon: Shield, category: 'discover' },
    { id: 'data', icon: Database, category: 'discover' },
    { id: 'ui', icon: Layout, category: 'discover' },
];

export default function AdminSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [activeFeature, setActiveFeature] = useState('balance');
    const [userId, setUserId] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();

    // Behavioral signal hooks — feed into ResonancePatternCard inference
    const { logs: moodLogs } = useMoodLogs();
    const { forecasts: energyForecasts } = useEnergyForecast(userId ?? undefined);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);
                    const { data: profile } = await supabase
                        .from('users')
                        .select(`
                            *,
                            schools (
                                name
                            )
                        `)
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        setUserProfile({
                            ...profile,
                            school_name: profile.schools?.name || null
                        });
                    } else {
                        setUserProfile({
                            id: user.id,
                            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                            email: user.email,
                            role: user.user_metadata?.role || 'admin',
                            school_name: null
                        });
                    }
                }
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    const renderFeature = () => {
        if (!userId) {
            return <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />;
        }

        switch (activeFeature) {
            case 'balance':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">{t('admin.balance')}</Heading>
                            <Text color={colors.textSecondary} size="sm">Monitoring the stability of the Educational Ecology.</Text>
                        </VStack>
                        <PositiveInvitation
                            context="self"
                            title={t('admin.balanceComingSoon', 'System Pulse Arriving')}
                            description={t('admin.balanceComingSoonDesc', 'A dashboard for operational harmony is being calibrated.')}
                        />
                    </VStack>
                );
            case 'mood':
                return <MoodLotus userId={userId} />;
            default:
                return (
                    <Box p={Theme.spacing.md}>
                        <Text color={colors.textSecondary} textAlign="center">{t('common.comingSoon')}</Text>
                    </Box>
                );
        }
    };

    const allFeatures = showMoreTools ? [...ADMIN_CORE_FEATURES, ...ADMIN_MORE_TOOLS] : ADMIN_CORE_FEATURES;

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            <GlobalHeader
                isSelfView
                avatarUrl={userProfile?.avatar_url}
                subtitle={t('self.adminSubtitle') || 'System Architect'}
            />
            <AdaptiveLayout
                renderSidebar={() => (
                    <VStack space="lg" sx={{ p: Theme.spacing.lg }}>
                        {/* Daily Content Section */}
                        <VStack space="md">
                            <DailyContentCard type="motivation" />
                            <DailyContentCard type="did_you_know" />
                        </VStack>

                        {/* Resonance Pattern */}
                        {userProfile && (
                            <Box sx={{ mt: Theme.spacing.md }}>
                                <ResonancePatternCard
                                    orientationSeeds={userProfile?.orientation_seeds ?? null}
                                    moodLogs={moodLogs}
                                    energyForecasts={energyForecasts}
                                />
                            </Box>
                        )}

                        {/* Feature Grid (Vertical on Tablet) */}
                        <VStack space="md" sx={{ mt: Theme.spacing.md }}>
                            <Heading size="sm" color={colors.textSecondary}>System Controls</Heading>
                            <Box sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                {allFeatures.map((feature) => (
                                    <Pressable
                                        key={feature.id}
                                        onPress={() => {
                                            hapticLight();
                                            setActiveFeature(feature.id);
                                        }}
                                        sx={{ width: '45%' }}
                                    >
                                        <VStack
                                            alignItems="center"
                                            justifyContent="center"
                                            space="xs"
                                            sx={{
                                                height: 80,
                                                borderRadius: Theme.corners.generous,
                                                backgroundColor: activeFeature === feature.id
                                                    ? colors.action
                                                    : colors.secondary,
                                                borderWidth: 1,
                                                borderColor: activeFeature === feature.id
                                                    ? colors.action
                                                    : colors.border,
                                            }}
                                        >
                                            <feature.icon
                                                color={activeFeature === feature.id ? Theme.colors.white : colors.textSecondary}
                                                size={24}
                                            />
                                            <Text
                                                size="xs"
                                                bold={activeFeature === feature.id}
                                                color={activeFeature === feature.id ? Theme.colors.white : colors.text}
                                                textAlign="center"
                                            >
                                                {t(`admin.${feature.id}`)}
                                            </Text>
                                        </VStack>
                                    </Pressable>
                                ))}
                            </Box>
                        </VStack>
                    </VStack>
                )}
                renderContent={() => (
                    <Box p={Theme.spacing.xl}>
                        <Box
                            p={Theme.spacing.xl}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                minHeight: 500
                            }}
                        >
                            {loadingUser ? (
                                <VStack space="md">
                                    <SkeletonCard height={40} />
                                    <SkeletonCard height={150} />
                                    <SkeletonCard height={40} />
                                </VStack>
                            ) : renderFeature()}
                        </Box>
                    </Box>
                )}
            >
                <ScrollView
                    sx={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottomPadding, paddingTop: Theme.spacing.lg }}
                    showsVerticalScrollIndicator={false}
                >

                    <Box mb="$4">
                        <DailyContentCard type="motivation" />
                        <DailyContentCard type="did_you_know" />
                    </Box>

                    {/* Resonance Pattern */}
                    {userProfile && (
                        <Box sx={{ paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
                            <ResonancePatternCard
                                orientationSeeds={userProfile?.orientation_seeds ?? null}
                                moodLogs={moodLogs}
                                energyForecasts={energyForecasts}
                            />
                        </Box>
                    )}

                    <Box sx={{ height: 100 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 12 }}>
                            {allFeatures.map((feature) => (
                                <Pressable
                                    key={feature.id}
                                    onPress={() => { hapticLight(); setActiveFeature(feature.id); }}
                                >
                                    <VStack
                                        alignItems="center"
                                        justifyContent="center"
                                        space="xs"
                                        sx={{
                                            width: 100, height: 80, borderRadius: Theme.corners.generous,
                                            backgroundColor: activeFeature === feature.id ? colors.action : colors.secondary,
                                            borderWidth: 1, borderColor: activeFeature === feature.id ? colors.action : colors.border,
                                        }}
                                    >
                                        <feature.icon color={activeFeature === feature.id ? Theme.colors.white : colors.textSecondary} size={24} />
                                        <Text size="xs" bold={activeFeature === feature.id} color={activeFeature === feature.id ? Theme.colors.white : colors.text} textAlign="center">
                                            {t(`admin.${feature.id}`)}
                                        </Text>
                                    </VStack>
                                </Pressable>
                            ))}
                            <Pressable onPress={() => { hapticLight(); setShowMoreTools(!showMoreTools); }}>
                                <VStack alignItems="center" justifyContent="center" space="xs" sx={{ width: 100, height: 80, borderRadius: Theme.corners.generous, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }}>
                                    <Text fontSize="$2xl" color={colors.text}>{showMoreTools ? '−' : '+'}</Text>
                                    <Text size="xs" color={colors.textSecondary}>{showMoreTools ? t('self.lessTools') : t('self.moreTools')}</Text>
                                </VStack>
                            </Pressable>
                        </ScrollView>
                    </Box>

                    <Box mt="$6">
                        <Box p={Theme.spacing.xl} sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous, minHeight: 300 }}>
                            {loadingUser ? (
                                <VStack space="md">
                                    <SkeletonCard height={40} />
                                    <SkeletonCard height={150} />
                                    <SkeletonCard height={40} />
                                </VStack>
                            ) : renderFeature()}
                        </Box>
                    </Box>
                </ScrollView>
            </AdaptiveLayout>

            <ShadowAgentDrawer />
            <WelcomeModal isOpen={justFinishedOnboarding} onClose={() => setJustFinishedOnboarding(false)} />
        </ScreenWrapper>
    );
}
