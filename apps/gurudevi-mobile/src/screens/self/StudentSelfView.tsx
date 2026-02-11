/**
 * StudentSelfView Component
 * 
 * Student-focused wellbeing features emphasizing growth and reflection
 * Core: Mood check-in, Daily goals, Study rhythm
 * More Tools: Learning reflections, Progress tracker
 */

import React, { useState } from 'react';
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
} from "@/ui";
import { Target, BookOpen, Flower, TrendingUp, Brain } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { MoodLotus, ShadowAgentDrawer } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';

// Student-specific core features
const STUDENT_CORE_FEATURES = [
    { id: 'mood', label: 'Mood Check', icon: Flower, category: 'core' },
    { id: 'goals', label: 'Daily Goals', icon: Target, category: 'core' },
    { id: 'study', label: 'Study Rhythm', icon: BookOpen, category: 'core' },
];

const STUDENT_MORE_TOOLS = [
    { id: 'reflection', label: 'Learning Reflection', icon: Brain, category: 'discover' },
    { id: 'progress', label: 'My Progress', icon: TrendingUp, category: 'discover' },
];

export default function StudentSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('mood');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
            case 'goals':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('student.dailyGoals')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('student.dailyGoalsDesc')}
                            </Text>
                        </VStack>

                        <Box
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 150
                            }}
                        >
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                Daily Goals feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'study':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('student.studyRhythm')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('student.studyRhythmDesc')}
                            </Text>
                        </VStack>

                        <Box
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 150
                            }}
                        >
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                Study Rhythm feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'reflection':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('student.learningReflection')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('student.learningReflectionDesc')}
                            </Text>
                        </VStack>

                        <Box
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 150
                            }}
                        >
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                Learning Reflection feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'progress':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('student.myProgress')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('student.myProgressDesc')}
                            </Text>
                        </VStack>

                        <Box
                            p={Theme.spacing.md}
                            sx={{
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                minHeight: 150
                            }}
                        >
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                Progress Tracker feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            default:
                return <MoodLotus userId={userId ?? undefined} />;
        }
    };

    const allFeatures = showMoreTools
        ? [...STUDENT_CORE_FEATURES, ...STUDENT_MORE_TOOLS]
        : STUDENT_CORE_FEATURES;

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader showGreeting={true} />
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}>
                {/* Daily Content Section */}
                <Box px="$6" mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

                {/* Feature Carousel */}
                <Box sx={{ height: 100 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
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
                                            : Theme.colors.deepIndigo,
                                        borderWidth: 1,
                                        borderColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.transparent,
                                    }}
                                >
                                    <feature.icon
                                        color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.dimGray}
                                        size={24}
                                    />
                                    <Text
                                        size="xs"
                                        bold={activeFeature === feature.id}
                                        color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.mistGray}
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
                                        : Theme.colors.deepIndigo,
                                    borderWidth: 1,
                                    borderColor: showMoreTools
                                        ? Theme.colors.sanctuarySaffron
                                        : Theme.colors.dimGray,
                                    borderStyle: 'dashed'
                                }}
                            >
                                <Text fontSize="$2xl">
                                    {showMoreTools ? '−' : '+'}
                                </Text>
                                <Text
                                    size="xs"
                                    bold={showMoreTools}
                                    color={showMoreTools ? Theme.colors.white : Theme.colors.mistGray}
                                    textAlign="center"
                                >
                                    {showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                </Text>
                            </VStack>
                        </Pressable>
                    </ScrollView>
                </Box>

                {/* Dynamic Content */}
                <Box px="$6" mt="$6">
                    <Box
                        p={Theme.spacing.xl}
                        sx={{
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                            minHeight: 300
                        }}
                    >
                        {renderFeature()}
                    </Box>
                </Box>
            </ScrollView>

            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </Box>
    );
}
