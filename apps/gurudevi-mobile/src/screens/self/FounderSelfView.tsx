/**
 * FounderSelfView Component
 * 
 * Sanctuary for the Founder - focus on Vision, Philosophy, and Legacy
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
    Pressable
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Sparkles, Compass, Zap, Lightbulb, Globe, Heart } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { hapticLight } from '@repo/ui';
import { MoodLotus, ShadowAgentDrawer, EnergyForecast, WisdomSeeds } from '../../components/self';
import { GlobalHeader } from '@repo/ui';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';
import EditProfileModal from '../../components/profile/EditProfileModal';

const FOUNDER_CORE_FEATURES = [
    { id: 'vision', label: 'founder.platformVision', icon: Compass, category: 'core' },
    { id: 'mood', label: 'common.moodLotus', icon: Sparkles, category: 'core' },
    { id: 'energy', label: 'principal.energy', icon: Zap, category: 'core' },
];

const FOUNDER_MORE_TOOLS = [
    { id: 'philosophy', label: 'principal.wisdom', icon: Lightbulb, category: 'discover' },
    { id: 'ecosystem', label: 'founder.educationalEcology', icon: Globe, category: 'discover' },
    { id: 'legacy', label: 'founder.executiveOversight', icon: Heart, category: 'discover' },
];

export default function FounderSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [activeFeature, setActiveFeature] = useState('vision');
    const [userId, setUserId] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();

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
                            role: user.user_metadata?.role || 'founder',
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
        if (!userId && activeFeature !== 'vision') {
            return <PositiveInvitation type="guest" onAction={() => { }} />;
        }

        switch (activeFeature) {
            case 'vision':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">Vision Alignment</Heading>
                            <Text color={colors.textSecondary} size="sm">Connecting today's recursion to the infinite dream.</Text>
                        </VStack>
                        <PositiveInvitation
                            context="community"
                            title={t('founder.visionComingSoon', 'Architecting the Future')}
                            description={t('founder.visionComingSoonDesc', 'The vision alignment dashboard is currently being synthesized.')}
                        />
                    </VStack>
                );
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
            case 'energy':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'philosophy':
                return <WisdomSeeds userId={userId ?? undefined} />;
            default:
                return (
                    <Box p={Theme.spacing.md}>
                        <Text color={colors.textSecondary} textAlign="center">{t('common.comingSoon')}</Text>
                    </Box>
                );
        }
    };

    const allFeatures = showMoreTools ? [...FOUNDER_CORE_FEATURES, ...FOUNDER_MORE_TOOLS] : FOUNDER_CORE_FEATURES;

    return (
        <ScreenWrapper>
            <GlobalHeader
                isSelfView
                avatarUrl={userProfile?.avatar_url}
                subtitle={t('self.founderSubtitle') || 'Platform Visionary'}
            />
            <ScrollView
                sx={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
            >

                <Box mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

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
                                        {t(feature.label)}
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

            <ShadowAgentDrawer />
            <WelcomeModal isOpen={justFinishedOnboarding} onClose={() => setJustFinishedOnboarding(false)} />
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={() => {
                    setLoadingUser(true);
                    // Re-fetch logic
                }}
                currentProfile={userProfile}
            />
        </ScreenWrapper>
    );
}
