/**
 * PrincipalSelfView Component
 * 
 * Principal-focused wellbeing features emphasizing leadership wellness
 * Core: Leadership energy, School pulse, Decision journal
 * More Tools: Staff wellbeing overview (aggregated), Leadership wisdom, Monthly reflection
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
    InputField
} from "@/ui";
import { Battery, Activity, BookOpen, Users, Lightbulb, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { ShadowAgentDrawer, EnergyForecast } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';

// Principal-specific core features
const PRINCIPAL_CORE_FEATURES = [
    { id: 'energy', label: 'Leadership Energy', icon: Battery, category: 'core' },
    { id: 'pulse', label: 'School Pulse', icon: Activity, category: 'core' },
    { id: 'decisions', label: 'Decision Journal', icon: BookOpen, category: 'core' },
];

const PRINCIPAL_MORE_TOOLS = [
    { id: 'staffWellbeing', label: 'Staff Wellbeing', icon: Users, category: 'discover' },
    { id: 'wisdom', label: 'Leadership Wisdom', icon: Lightbulb, category: 'discover' },
    { id: 'monthly', label: 'Monthly Reflection', icon: Calendar, category: 'discover' },
];

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('energy');
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
            case 'energy':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'pulse':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('principal.schoolPulse')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('principal.schoolPulseDesc')}
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
                                School Pulse feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'decisions':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('principal.decisionJournal')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('principal.decisionJournalDesc')}
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
                            <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                                <InputField
                                    placeholder={t('principal.decisionPlaceholder')}
                                    multiline
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
                                    sx={{ textAlignVertical: 'top', minHeight: 100 }}
                                />
                            </Input>
                        </Box>
                    </VStack>
                );
            case 'staffWellbeing':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('principal.staffWellbeing')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('principal.staffWellbeingDesc')}
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
                                Staff Wellbeing Overview feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'wisdom':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('principal.leadershipWisdom')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('principal.leadershipWisdomDesc')}
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
                                Leadership Wisdom feature coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'monthly':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                {t('principal.monthlyReflection')}
                            </Heading>
                            <Text color={Theme.colors.mistGray} size="sm">
                                {t('principal.monthlyReflectionDesc')}
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
                                Monthly Reflection feature coming soon...
                            </Text>
                        </Box>
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
