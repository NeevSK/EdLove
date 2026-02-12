/**
 * FounderSelfView Component
 * 
 * Sanctuary for the Founder - focus on Vision, Philosophy, and Legacy
 */

import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    ScrollView,
    Pressable
} from "@/ui";
import { Sparkles, Compass, Zap, Lightbulb, Globe, Heart } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { MoodLotus, ShadowAgentDrawer, EnergyForecast, WisdomSeeds } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';

const FOUNDER_CORE_FEATURES = [
    { id: 'vision', label: 'Vision Align', icon: Compass, category: 'core' },
    { id: 'mood', label: 'Self Check-in', icon: Sparkles, category: 'core' },
    { id: 'energy', label: 'Leadership', icon: Zap, category: 'core' },
];

const FOUNDER_MORE_TOOLS = [
    { id: 'philosophy', label: 'Philosophy', icon: Lightbulb, category: 'discover' },
    { id: 'ecosystem', label: 'Ecology Health', icon: Globe, category: 'discover' },
    { id: 'legacy', label: 'Legacy Journal', icon: Heart, category: 'discover' },
];

export default function FounderSelfView() {
    const [activeFeature, setActiveFeature] = useState('vision');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, []);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'vision':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">Vision Alignment</Heading>
                            <Text color={Theme.colors.mistGray} size="sm">Connecting today's recursion to the infinite dream.</Text>
                        </VStack>
                        <Box p={Theme.spacing.md} sx={{ backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable, minHeight: 150 }}>
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                Vision Alignment tool coming soon... Focus on the Kleinian Ego.
                            </Text>
                        </Box>
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
                        <Text color={Theme.colors.mistGray} textAlign="center">Feature coming soon...</Text>
                    </Box>
                );
        }
    };

    const allFeatures = showMoreTools ? [...FOUNDER_CORE_FEATURES, ...FOUNDER_MORE_TOOLS] : FOUNDER_CORE_FEATURES;

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader showGreeting={true} />
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}>
                <Box px="$6" mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

                <Box sx={{ height: 100 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
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
                                        backgroundColor: activeFeature === feature.id ? Theme.colors.sanctuarySaffron : Theme.colors.deepIndigo,
                                        borderWidth: 1, borderColor: activeFeature === feature.id ? Theme.colors.sanctuarySaffron : Theme.colors.transparent,
                                    }}
                                >
                                    <feature.icon color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.dimGray} size={24} />
                                    <Text size="xs" bold={activeFeature === feature.id} color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.mistGray}>
                                        {feature.label}
                                    </Text>
                                </VStack>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => { hapticLight(); setShowMoreTools(!showMoreTools); }}>
                            <VStack alignItems="center" justifyContent="center" space="xs" sx={{ width: 100, height: 80, borderRadius: Theme.corners.generous, backgroundColor: Theme.colors.deepIndigo, borderWidth: 1, borderColor: Theme.colors.dimGray, borderStyle: 'dashed' }}>
                                <Text fontSize="$2xl">{showMoreTools ? '−' : '+'}</Text>
                                <Text size="xs" color={Theme.colors.mistGray}>{showMoreTools ? 'Less' : 'More'}</Text>
                            </VStack>
                        </Pressable>
                    </ScrollView>
                </Box>

                <Box px="$6" mt="$6">
                    <Box p={Theme.spacing.xl} sx={{ backgroundColor: Theme.colors.midnightBlue, borderRadius: Theme.corners.generous, minHeight: 300 }}>
                        {renderFeature()}
                    </Box>
                </Box>
            </ScrollView>

            <ShadowAgentDrawer />
            <WelcomeModal isOpen={justFinishedOnboarding} onClose={() => setJustFinishedOnboarding(false)} />
        </Box>
    );
}
