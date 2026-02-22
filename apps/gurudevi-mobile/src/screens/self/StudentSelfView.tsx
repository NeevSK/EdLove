/**
 * StudentSelfView Component
 * 
 * Student-focused wellbeing features emphasizing growth and reflection
 * Core: Mood check-in, Daily goals, Study rhythm
 * More Tools: Learning reflections, Progress tracker
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
    Input,
    InputField,
    Button,
    ButtonText
} from '@repo/ui';
import { Target, BookOpen, Flower, TrendingUp, Brain } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { hapticLight } from '@repo/ui';
import { MoodLotus, ShadowAgentDrawer } from '../../components/self';
import { supabase, useStore } from '@repo/core';
import { GlobalHeader } from '@repo/ui';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { SkeletonCard, PositiveInvitation } from '@repo/ui';
import { useThemedColors, useBottomTabPadding } from '@repo/ui';
import { ScreenWrapper } from '@repo/ui';

// Student-specific core features
const STUDENT_CORE_FEATURES = [
    { id: 'mood', icon: Flower, category: 'core' },
    { id: 'goals', icon: Target, category: 'core' },
    { id: 'study', icon: BookOpen, category: 'core' },
];

const STUDENT_MORE_TOOLS = [
    { id: 'reflection', icon: Brain, category: 'discover' },
    { id: 'progress', icon: TrendingUp, category: 'discover' },
];

export default function StudentSelfView() {
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
                            role: user.user_metadata?.role || 'student',
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
            return (
                <PositiveInvitation
                    type="guest"
                    onAction={() => { }} // TODO: Navigate to Auth
                />
            );
        }

        switch (activeFeature) {
            case 'mood':
                return <MoodLotus userId={userId} />;
            case 'goals':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('student.dailyGoals')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('student.dailyGoalsDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('student.goalsComingSoon', 'Goal Setting Arriving Soon')}
                            description={t('student.goalsComingSoonDesc', 'We are building a beautiful space for your daily aspirations.')}
                        />
                    </VStack>
                );
            case 'study':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('student.studyRhythm')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('student.studyRhythmDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('student.studyComingSoon', 'Find Your Rhythm')}
                            description={t('student.studyComingSoonDesc', 'A gentle study timer and focus tool are in production.')}
                        />
                    </VStack>
                );
            case 'reflection':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('student.learningReflection')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('student.learningReflectionDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('student.reflectionComingSoon', 'Sacred Reflections')}
                            description={t('student.reflectionComingSoonDesc', 'A quiet corner for your daily insights is being prepared.')}
                        />
                    </VStack>
                );
            case 'progress':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">
                                {t('student.myProgress')}
                            </Heading>
                            <Text color={colors.textSecondary} size="sm">
                                {t('student.myProgressDesc')}
                            </Text>
                        </VStack>

                        <PositiveInvitation
                            context="self"
                            title={t('student.progressComingSoon', 'Watch Yourself Bloom')}
                            description={t('student.progressComingSoonDesc', 'Our growth visualization toolkit is on the way.')}
                        />
                    </VStack>
                );
            default:
                return <MoodLotus userId={userId} />;
        }
    };

    const allFeatures = showMoreTools
        ? [...STUDENT_CORE_FEATURES, ...STUDENT_MORE_TOOLS]
        : STUDENT_CORE_FEATURES;

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
                                        {t(`student.${feature.id}`)}
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
