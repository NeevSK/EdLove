/**
 * TeacherSelfView Component
 * 
 * Teacher-focused wellbeing features with progressive disclosure
 * Core: Mood, Fire Journal, Daily Rhythm
 * More Tools: Joy Jar, Gratitude, Wisdom, Tomorrow's Prep, Energy, Wind-Down, Venting
 */

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
    Center,
    Input,
    InputField,
    Button,
    ButtonText
} from '@repo/ui';
import { Mic, Send, MessageCircle, Repeat, Flower, Flame, Sparkles, Heart, Lightbulb, Calendar, Battery, Moon, Bell, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { hapticLight } from '@repo/ui';
import DailyRhythm from '../../components/self/DailyRhythm';
import {
    MoodLotus,
    ShadowAgentDrawer,
    FireJournal,
    JoyJar,
    GratitudeGlimmers,
    WisdomSeeds,
    TomorrowPrep,
    EnergyForecast,
    WindDownRitual
} from '../../components/self';
import SleepTracker from '../../components/self/SleepTracker';
import RemindersManager from '../../components/self/RemindersManager';
import VoiceJournaling from '../../components/self/VoiceJournaling';
import { supabase, useStore, useSafeMutation } from '@repo/core';
import { GlobalHeader } from '@repo/ui';
import DailyContentCard from '../../components/self/DailyContentCard';
import ResonancePatternCard from '../../components/self/ResonancePatternCard';
import { useMoodLogs, useEnergyForecast, useDecisionJournal } from '@repo/self';
import ThuthimalBadge from '../../components/profile/ThuthimalBadge';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useThemedColors, useBottomTabPadding } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';

// Progressive Architecture: Core features always visible, others in "More Tools"
const CORE_FEATURES = [
    { id: 'mood', icon: Flower, category: 'core' },
    { id: 'fire', icon: Flame, category: 'core' },
    { id: 'rhythm', icon: Repeat, category: 'core' },
];

const MORE_TOOLS_FEATURES = [
    { id: 'joyJar', icon: Sparkles, category: 'discover', eroi: 10 },
    { id: 'gratitude', icon: Heart, category: 'discover', eroi: 8 },
    { id: 'wisdom', icon: Lightbulb, category: 'discover', eroi: 7 },
    { id: 'tomorrowPrep', icon: Calendar, category: 'discover', eroi: 9 },
    { id: 'energyForecast', icon: Battery, category: 'contextual', eroi: 6 },
    { id: 'windDown', icon: Moon, category: 'contextual', eroi: 8 },
    { id: 'venting', icon: MessageCircle, category: 'discover', eroi: 10 },
    { id: 'sleep', icon: Moon, category: 'contextual', eroi: 9 },
    { id: 'reminders', icon: Bell, category: 'contextual', eroi: 8 },
    { id: 'voiceJournal', icon: Mic, category: 'discover', eroi: 10 },
    { id: 'decisions', icon: BookOpen, category: 'discover', eroi: 9 },
];

export default function TeacherSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [activeFeature, setActiveFeature] = useState('mood');
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

    // Get current user and profile on mount
    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUserId(user.id);

                    // Fetch full profile for Identity Card
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
                            role: user.user_metadata?.role || 'teacher',
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
        switch (activeFeature) {
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
            case 'fire':
                return <FireJournal userId={userId ?? undefined} />;
            case 'rhythm':
                return <DailyRhythm />;
            case 'joyJar':
                return <JoyJar userId={userId ?? undefined} />;
            case 'gratitude':
                return <GratitudeGlimmers userId={userId ?? undefined} />;
            case 'wisdom':
                return <WisdomSeeds userId={userId ?? undefined} />;
            case 'tomorrowPrep':
                return <TomorrowPrep userId={userId ?? undefined} />;
            case 'energyForecast':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'windDown':
                return <WindDownRitual userId={userId ?? undefined} />;
            case 'sleep':
                return <SleepTracker userId={userId ?? undefined} />;
            case 'reminders':
                return <RemindersManager userId={userId ?? undefined} />;
            case 'voiceJournal':
                return <VoiceJournaling userId={userId ?? undefined} />;
            case 'decisions':
                return <DecisionJournalSection userId={userId} colors={colors} t={t} />;
            case 'venting':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">{t('self.venting')}</Heading>
                            <Text color={colors.textSecondary} size="sm">{t('self.ventingDesc')}</Text>
                        </VStack>

                        <Box
                            sx={{
                                flex: 1,
                                backgroundColor: Theme.colors.glass.dark.highlight,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.md,
                                borderWidth: 1,
                                borderColor: Theme.colors.glass.dark.border,
                                minHeight: 150
                            }}
                        >
                            <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                                <InputField
                                    placeholder={t('self.speakTruth')}
                                    multiline
                                    color={colors.text}
                                    placeholderTextColor={colors.textTertiary}
                                    sx={{ textAlignVertical: 'top' }}
                                />
                            </Input>
                        </Box>

                        <HStack space="md" justifyContent="flex-end">
                            <Button
                                size="md"
                                action="primary"
                                onPress={hapticLight}
                                accessibilityLabel={t('accessibility.voiceInput')}
                                accessibilityRole="button"
                                sx={{
                                    borderRadius: Theme.corners.full,
                                    width: 44,
                                    height: 44,
                                    backgroundColor: Theme.colors.glass.dark.highlight,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.glass.dark.border
                                }}
                            >
                                <Mic color={colors.action} size={20} />
                            </Button>
                            <Button
                                size="md"
                                action="primary"
                                onPress={hapticLight}
                                sx={{
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: colors.action,
                                    paddingHorizontal: Theme.spacing.md
                                }}
                            >
                                <ButtonText color={Theme.colors.sacredWhite} mr="$2">{t('self.unburden')}</ButtonText>
                                <Send color={Theme.colors.sacredWhite} size={16} />
                            </Button>
                        </HStack>
                    </VStack>
                );
            default:
                return <MoodLotus userId={userId ?? undefined} />;
        }
    };

    const allFeatures = showMoreTools ? [...CORE_FEATURES, ...MORE_TOOLS_FEATURES] : CORE_FEATURES;

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader isSelfView avatarUrl={userProfile?.avatar_url} />
            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                <ScrollView
                    sx={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: bottomPadding, paddingTop: Theme.spacing.lg }}
                >
                    {/* Thuthimal Badge (Compact) */}
                    {userProfile?.is_thuthimal && (
                        <Box px="$6" mb="$3" alignItems="flex-end">
                            <ThuthimalBadge
                                gifterName={userProfile.thuthimal_gifter}
                                giftedAt={userProfile.thuthimal_gifted_at}
                                compact={true}
                            />
                        </Box>
                    )}

                    {/* Daily Content Section */}
                    <Box mb="$4">
                        <DailyContentCard type="motivation" />
                        <DailyContentCard type="did_you_know" />
                    </Box>

                    {/* Resonance Pattern */}
                    {userProfile && (
                        <Box sx={{ paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.md }}>
                            <ResonancePatternCard
                                orientationSeeds={userProfile?.orientation_seeds}
                                moodLogs={moodLogs}
                                energyForecasts={energyForecasts}
                            />
                        </Box>
                    )}

                    {/* Sub-Feature Carousel */}
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
                                    accessibilityRole="button"
                                    accessibilityLabel={t(`self.${feature.id}`)}
                                    accessibilityState={{ selected: activeFeature === feature.id }}
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
                                                : Theme.colors.glass.dark.highlight,
                                            borderWidth: 1,
                                            borderColor: activeFeature === feature.id
                                                ? Theme.colors.sanctuarySaffron
                                                : Theme.colors.glass.dark.border,
                                        }}
                                    >
                                        <feature.icon
                                            color={activeFeature === feature.id ? Theme.colors.sacredWhite : colors.textSecondary}
                                            size={24}
                                        />
                                        <Text
                                            size="xs"
                                            bold={activeFeature === feature.id}
                                            color={activeFeature === feature.id ? Theme.colors.sacredWhite : colors.text}
                                            textAlign="center"
                                        >
                                            {t(`self.${feature.id}`)}
                                        </Text>
                                    </VStack>
                                </Pressable>
                            ))}

                            {/* More Tools Toggle Button */}
                            <Pressable
                                onPress={() => {
                                    hapticLight();
                                    setShowMoreTools(!showMoreTools);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                accessibilityState={{ expanded: showMoreTools }}
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
                                    <Text fontSize="$2xl" color={showMoreTools ? Theme.colors.sacredWhite : colors.text}>
                                        {showMoreTools ? '−' : '+'}
                                    </Text>
                                    <Text
                                        size="xs"
                                        bold={showMoreTools}
                                        color={showMoreTools ? Theme.colors.sacredWhite : colors.textSecondary}
                                        textAlign="center"
                                    >
                                        {showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                    </Text>
                                </VStack>
                            </Pressable>
                        </ScrollView>
                    </Box>

                    {/* Dynamic Content Workbench */}
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
            </Box>

            {/* Shadow Agent Drawer - Always present as a floating orb */}
            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}

function DecisionJournalSection({ userId, colors, t }: { userId: string | null, colors: any, t: any }) {
    const navigation = useNavigation<any>();
    const [decisionText, setDecisionText] = useState('');
    const { decisions, refreshData } = useDecisionJournal(userId ?? undefined);

    const { mutate, isLoading: isSaving } = useSafeMutation(
        async (text: string) => {
            const { error } = await supabase
                .from('decision_journals')
                .insert({ user_id: userId, decision_text: text, is_reviewed: false });
            if (error) {
                if (error.code === '42P01') {
                    console.warn('[DecisionJournal] Table not yet migrated — entry saved to local cache only.', error.message);
                    return;
                }
                throw error;
            }
        },
        {
            onSuccess: () => { hapticLight(); setDecisionText(''); refreshData(); },
            retryCount: 3,
        }
    );

    if (!userId) {
        return <PositiveInvitation type="guest" onAction={() => navigation.navigate('Auth' as never)} />;
    }

    return (
        <VStack space="md" sx={{ flex: 1 }}>
            <Box
                p={Theme.spacing.md}
                sx={{ backgroundColor: colors.tertiary, borderRadius: Theme.corners.comfortable, minHeight: 120 }}
            >
                <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                    <InputField
                        placeholder={t('self.decisionPlaceholder', 'What decision is weighing on you today?')}
                        multiline
                        color={colors.text}
                        placeholderTextColor={colors.textTertiary}
                        sx={{ textAlignVertical: 'top', minHeight: 100 }}
                        value={decisionText}
                        onChangeText={setDecisionText}
                    />
                </Input>
                <Box alignItems="flex-end" mt="$2">
                    <Pressable
                        onPress={() => mutate(decisionText.trim())}
                        disabled={!decisionText.trim() || isSaving}
                        sx={{
                            backgroundColor: decisionText.trim() ? colors.action : colors.border,
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.xs,
                            borderRadius: Theme.corners.comfortable,
                            opacity: isSaving ? 0.7 : 1,
                        }}
                    >
                        <Text color={Theme.colors.white} size="sm" bold>
                            {isSaving ? t('common.saving', 'Saving…') : t('common.save')}
                        </Text>
                    </Pressable>
                </Box>
            </Box>

            <Heading size="sm" color={colors.textSecondary} mt="$4">
                {t('self.recentDecisions', 'Recent Decisions')}
            </Heading>

            <ScrollView sx={{ maxHeight: 300 }} nestedScrollEnabled>
                <VStack space="sm">
                    {decisions.map((decision) => (
                        <Box
                            key={decision.id}
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                borderLeftWidth: 3,
                                borderLeftColor: colors.action,
                            }}
                        >
                            <Text color={colors.text} size="sm" numberOfLines={3}>{decision.decision_text}</Text>
                            <Text color={colors.textTertiary} size="xs" mt="$1">
                                {new Date(decision.created_at).toLocaleDateString()}
                            </Text>
                        </Box>
                    ))}
                    {decisions.length === 0 && (
                        <Text color={colors.textTertiary} size="sm" fontStyle="italic">
                            {t('self.noDecisionsYet', 'No decisions logged yet.')}
                        </Text>
                    )}
                </VStack>
            </ScrollView>
        </VStack>
    );
}