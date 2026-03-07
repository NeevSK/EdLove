/**
 * PrincipalSelfView Component
 *
 * Personal wellbeing sanctuary for principals.
 * Scope: Individual wellness only — mood, energy, personal decisions, leadership wisdom.
 *
 * Institutional features (school pulse, staff wellbeing aggregates) deliberately
 * live in PrincipalSchoolView so Self stays a genuine personal sanctuary.
 *
 * Core:    Personal Pulse (mood/energy overview), Energy Forecast, Decision Journal
 * Discover: Leadership Wisdom, Monthly Reflection
 */

import { supabase, useStore, useSafeMutation, useUserRole } from '@repo/core';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Input,
    InputField,
    Theme,
    hapticLight,
    SkeletonCard,
    PositiveInvitation,
    useThemedColors,
    ScreenWrapper,
    useBottomTabPadding
} from '@repo/ui';
import { Battery, Activity, BookOpen, Lightbulb, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ShadowAgentDrawer from '../../components/ShadowAgentDrawer';
import EnergyForecast from '../../components/EnergyForecast';
import DailyContentCard from '../../components/DailyContentCard';
import ResonancePatternCard from '../../components/ResonancePatternCard';
import WelcomeModal from '../../components/WelcomeModal';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import PulseDashboard from '../../components/PulseDashboard';
import { GlobalHeader } from '@repo/ui';

// Principal core features — personal wellbeing only
const PRINCIPAL_CORE_FEATURES = [
    { id: 'pulse', icon: Activity, category: 'core' },
    { id: 'energy', icon: Battery, category: 'core' },
    { id: 'decisions', icon: BookOpen, category: 'core' },
];

// Discover tools — personal growth, not school management
const PRINCIPAL_MORE_TOOLS = [
    { id: 'wisdom', icon: Lightbulb, category: 'discover' },
    { id: 'monthly', icon: Calendar, category: 'discover' },
];

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { userId, role, isGuest } = useUserRole();
    const user = useStore(state => state.user);
    const [activeFeature, setActiveFeature] = useState('pulse');
    const [showMoreTools, setShowMoreTools] = useState(false);

    // We rely mostly on the offline store now for fast render
    const userProfile = user ? {
        id: user.id,
        full_name: user.full_name || user.email?.split('@')[0],
        email: user.email,
        role: user.role || 'principal',
        avatar_url: user.avatar_url,
        orientation_seeds: (user as any).orientation_seeds ?? null,
        school_name: null // Simplified, will add actual lookup if needed
    } : null;

    // Remove the slow, manual loading effect
    const loadingUser = false;

    // Behavioral signal hooks — feed into ResonancePatternCard inference
    const { logs: moodLogs } = useMoodLogs();
    const { forecasts: energyForecasts } = useEnergyForecast(userId ?? undefined);

    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();
    const bottomPadding = useBottomTabPadding();


    const renderFeature = () => {
        if (!userId && activeFeature !== 'pulse') {
            return <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />;
        }

        switch (activeFeature) {
            case 'pulse':
                return (
                    <PulseDashboard
                        onEnterDetails={() => setActiveFeature('energy')}
                    />
                );
            case 'energy':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'decisions':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('principal.decisionJournal')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('principal.decisionJournalDesc')}
                            </Text>
                        </VStack>

                        <DecisionJournalSection userId={userId} colors={colors} t={t} />
                    </VStack>
                );
            case 'wisdom':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('principal.leadershipWisdom')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('principal.leadershipWisdomDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('principal.wisdomComingSoon')}
                            description={t('principal.wisdomComingSoonDesc')}
                        />
                    </VStack>
                );
            case 'monthly':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('principal.monthlyReflection')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('principal.monthlyReflectionDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('principal.monthlyComingSoon')}
                            description={t('principal.monthlyComingSoonDesc')}
                        />
                    </VStack>
                );
            default:
                return <EnergyForecast userId={userId ?? undefined} />;
        }
    };

    const allFeatures = showMoreTools
        ? [...PRINCIPAL_CORE_FEATURES, ...PRINCIPAL_MORE_TOOLS]
        : PRINCIPAL_CORE_FEATURES;

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader isSelfView avatarUrl={userProfile?.avatar_url} />
            <ScrollView
                sx={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: bottomPadding, paddingTop: Theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
            >

                {/* Daily Content Section */}
                <Box mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

                {/* Resonance Pattern */}
                {userProfile && (
                    <Box sx={{ paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
                        <ResonancePatternCard
                            orientationSeeds={userProfile.orientation_seeds}
                            moodLogs={moodLogs}
                            energyForecasts={energyForecasts}
                        />
                    </Box>
                )}

                {/* Feature Carousel */}
                <Box sx={{ height: 100 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 12 }}
                    >
                        {allFeatures.map((feature) => (
                            <Pressable
                                key={feature.id}
                                onPress={() => {
                                    hapticLight();
                                    setActiveFeature(feature.id);
                                }}
                            >
                                <VStack
                                    alignItems="center"
                                    justifyContent="center"
                                    space="xs"
                                    sx={{
                                        width: 100,
                                        height: 80,
                                        borderRadius: Theme.corners.generous,
                                        backgroundColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.secondary,
                                        borderWidth: 1,
                                        borderColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
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
                                        {t(`principal.${feature.id}`)}
                                    </Text>
                                </VStack>
                            </Pressable>
                        ))}

                        {/* More Tools Toggle */}
                        <Pressable
                            onPress={() => {
                                hapticLight();
                                setShowMoreTools(!showMoreTools);
                            }}
                        >
                            <VStack
                                alignItems="center"
                                justifyContent="center"
                                space="xs"
                                sx={{
                                    width: 100,
                                    height: 80,
                                    borderRadius: Theme.corners.generous,
                                    backgroundColor: showMoreTools
                                        ? Theme.colors.sanctuarySaffron
                                        : colors.secondary,
                                    borderWidth: 1,
                                    borderColor: showMoreTools
                                        ? Theme.colors.sanctuarySaffron
                                        : colors.border,
                                    borderStyle: 'dashed'
                                }}
                            >
                                <Text fontSize="$2xl" color={showMoreTools ? Theme.colors.white : colors.text}>
                                    {showMoreTools ? '−' : '+'}
                                </Text>
                                <Text
                                    size="xs"
                                    bold={showMoreTools}
                                    color={showMoreTools ? Theme.colors.white : colors.textSecondary}
                                    textAlign="center"
                                >
                                    {showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                </Text>
                            </VStack>
                        </Pressable>
                    </ScrollView>
                </Box>

                {/* Dynamic Content */}
                <Box mt="$6">
                    <Box
                        p={Theme.spacing.xl}
                        sx={{
                            backgroundColor: colors.secondary,
                            borderRadius: Theme.corners.generous,
                            minHeight: 300
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
            </ScrollView>

            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}
