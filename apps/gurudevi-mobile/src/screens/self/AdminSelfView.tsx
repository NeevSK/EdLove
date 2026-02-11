/**
 * AdminSelfView Component
 * 
 * Sanctuary for the Admin - focus on System Balance and Operational Harmony
 */

import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable
} from "@/ui";
import { Shield, Settings, Activity, Cpu, Database, Layout } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { MoodLotus, ShadowAgentDrawer, EnergyForecast } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';

const ADMIN_CORE_FEATURES = [
    { id: 'balance', label: 'System Health', icon: Activity, category: 'core' },
    { id: 'mood', label: 'Personal Mood', icon: Heart, category: 'core' },
    { id: 'config', label: 'Stability', icon: Settings, category: 'core' },
];

const ADMIN_MORE_TOOLS = [
    { id: 'security', label: 'Security Pulse', icon: Shield, category: 'discover' },
    { id: 'data', label: 'Data Ecology', icon: Database, category: 'discover' },
    { id: 'ui', label: 'UI Harmony', icon: Layout, category: 'discover' },
];

import { Heart } from 'lucide-react-native';

export default function AdminSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('balance');
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
            case 'balance':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={Theme.colors.sacredWhite} size="lg">System Balance</Heading>
                            <Text color={Theme.colors.mistGray} size="sm">Monitoring the stability of the Educational Ecology.</Text>
                        </VStack>
                        <Box p={Theme.spacing.md} sx={{ backgroundColor: Theme.colors.deepIndigo, borderRadius: Theme.corners.comfortable, minHeight: 150 }}>
                            <Text color={Theme.colors.mistGray} size="md" textAlign="center">
                                System Health Dashboard coming soon...
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
            default:
                return (
                    <Box p={Theme.spacing.md}>
                        <Text color={Theme.colors.mistGray} textAlign="center">Feature coming soon...</Text>
                    </Box>
                );
        }
    };

    const allFeatures = showMoreTools ? [...ADMIN_CORE_FEATURES, ...ADMIN_MORE_TOOLS] : ADMIN_CORE_FEATURES;

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
