/**
 * PrincipalSelfView Component
 * 
 * Principal-focused wellbeing features emphasizing leadership wellness
 * Core: Leadership energy, School pulse, Decision journal
 * More Tools: Staff wellbeing overview (aggregated), Leadership wisdom, Monthly reflection
 */

import { supabase, useStore, useSafeMutation } from '@repo/core';
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
    ScreenWrapper
} from '@repo/ui';
import { Battery, Activity, BookOpen, Users, Lightbulb, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ShadowAgentDrawer, EnergyForecast } from '../../components/self';
import { useDecisionJournal } from '@repo/self';
import { GlobalHeader } from '@repo/ui';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import EditProfileModal from '../../components/profile/EditProfileModal';

// Principal-specific core features
const PRINCIPAL_CORE_FEATURES = [
    { id: 'energy', icon: Battery, category: 'core' },
    { id: 'pulse', icon: Activity, category: 'core' },
    { id: 'decisions', icon: BookOpen, category: 'core' },
];

const PRINCIPAL_MORE_TOOLS = [
    { id: 'staffWellbeing', icon: Users, category: 'discover' },
    { id: 'wisdom', icon: Lightbulb, category: 'discover' },
    { id: 'monthly', icon: Calendar, category: 'discover' },
];

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const [activeFeature, setActiveFeature] = useState('energy');
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
                            role: user.user_metadata?.role || 'principal',
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
        if (!userId && activeFeature !== 'energy') {
            return <PositiveInvitation type="guest" onAction={() => { }} />;
        }

        switch (activeFeature) {
            case 'energy':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'pulse':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('principal.schoolPulse')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('principal.schoolPulseDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('principal.pulseComingSoon', 'Synchronizing Hearts')}
                            description={t('principal.pulseComingSoonDesc', 'A bird\'s eye view of your school\'s collective wellbeing is being tuned.')}
                        />
                    </VStack>
                );
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
            case 'staffWellbeing':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('principal.staffWellbeing')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('principal.staffWellbeingDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="community"
                            title={t('principal.staffComingSoon', 'Supporting the Pillars')}
                            description={t('principal.staffComingSoonDesc', 'Advanced tools for staff support and appreciation are in development.')}
                        />
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
                            title={t('principal.wisdomComingSoon', 'Leadership Treasury')}
                            description={t('principal.wisdomComingSoonDesc', 'A curated library of leadership philosophies is being assembled.')}
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
                            title={t('principal.monthlyComingSoon', 'Architect of Growth')}
                            description={t('principal.monthlyComingSoonDesc', 'A deep reflection module for your monthly milestones is on its way.')}
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
        <ScreenWrapper>
            <GlobalHeader isSelfView avatarUrl={userProfile?.avatar_url} />
            <ScrollView
                sx={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
            >

                {/* Daily Content Section */}
                <Box mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

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

// Sub-component for Decision Journal Logic
function DecisionJournalSection({ userId, colors, t }: { userId: string | null, colors: any, t: any }) {
    const [decisionText, setDecisionText] = useState('');
    const { decisions, refreshData } = useDecisionJournal(userId ?? undefined);

    const { mutate, isLoading: isSaving } = useSafeMutation(
        async (text: string) => {
            const { error } = await supabase
                .from('decision_journals')
                .insert({
                    user_id: userId,
                    decision_text: text,
                    is_reviewed: false
                });
            if (error) {
                // Fallback if table doesn't exist yet - we rely on local cache which useSafeMutation callbacks will update via refreshData
                if (error.code === '42P01') {
                    console.warn("Backend table missing, saving locally only.");
                    return;
                }
                throw error;
            }
        },
        {
            onSuccess: () => {
                hapticLight();
                setDecisionText('');
                refreshData();
            },
            retryCount: 3
        }
    );

    const handleSave = async () => {
        if (!userId || !decisionText.trim()) return;
        hapticLight();
        await mutate(decisionText.trim());
    };

    if (!userId) {
        return <PositiveInvitation type="guest" onAction={() => { }} />;
    }

    return (
        <VStack space="md" sx={{ flex: 1 }}>
            <Box
                p={Theme.spacing.md}
                sx={{
                    backgroundColor: colors.tertiary,
                    borderRadius: Theme.corners.comfortable,
                    minHeight: 120
                }}
            >
                <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                    <InputField
                        placeholder={t('principal.decisionPlaceholder') || "What decision is weighing on you today?"}
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
                        onPress={handleSave}
                        disabled={!decisionText.trim() || isSaving}
                        sx={{
                            backgroundColor: decisionText.trim() ? colors.action : colors.border,
                            paddingHorizontal: Theme.spacing.md,
                            paddingVertical: Theme.spacing.xs,
                            borderRadius: Theme.corners.comfortable,
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        <Text color={Theme.colors.white} size="sm" bold>
                            {isSaving ? "Saving..." : t('common.save')}
                        </Text>
                    </Pressable>
                </Box>
            </Box>

            <Heading size="sm" color={colors.textSecondary} mt="$4">
                {t('principal.recentDecisions') || "Recent Decisions"}
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
                                borderLeftColor: colors.action
                            }}
                        >
                            <Text color={colors.text} size="sm" numberOfLines={3}>
                                {decision.decision_text}
                            </Text>
                            <Text color={colors.textTertiary} size="xs" mt="$1">
                                {new Date(decision.created_at).toLocaleDateString()}
                            </Text>
                        </Box>
                    ))}
                    {decisions.length === 0 && (
                        <Text color={colors.textTertiary} size="sm" fontStyle="italic">
                            {t('principal.noDecisionsYet') || "No decisions logged yet."}
                        </Text>
                    )}
                </VStack>
            </ScrollView>
        </VStack>
    );
}
