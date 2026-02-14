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
import { useTranslation } from 'react-i18next';
import { Sparkles, Compass, Zap, Lightbulb, Globe, Heart } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { MoodLotus, ShadowAgentDrawer, EnergyForecast, WisdomSeeds } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

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
    const [activeFeature, setActiveFeature] = useState('vision');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();

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
                            <Heading color={colors.text} size="lg">Vision Alignment</Heading>
                            <Text color={colors.textSecondary} size="sm">Connecting today's recursion to the infinite dream.</Text>
                        </VStack>
                        <Box p={Theme.spacing.md} sx={{ backgroundColor: colors.tertiary, borderRadius: Theme.corners.comfortable, minHeight: 150 }}>
                            <Text color={colors.textSecondary} size="md" textAlign="center">
                                {t('common.comingSoon')}
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
                showGreeting={true}
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
                        {renderFeature()}
                    </Box>
                </Box>
            </ScrollView>

            <ShadowAgentDrawer />
            <WelcomeModal isOpen={justFinishedOnboarding} onClose={() => setJustFinishedOnboarding(false)} />
        </ScreenWrapper>
    );
}
