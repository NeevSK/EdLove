import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    VStack,
    Box,
    useThemedColors,
    ScreenWrapper,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import {
    useStore,
    useUserRole
} from '@repo/core';

// Kernel Imports from @repo/self
import {
    BaseSelfView,
    MoodPickerCard,
    EnergyBarChart,
    WarmMirrorCard,
    ImpactRipplesCard,
    useWellbeingEnrichment,
} from '../../index';

// Role Components
import MoodLotus from '../../components/MoodLotus';
import ShadowAgentDrawer from '../../components/ShadowAgentDrawer';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import WisdomSeeds from '../../components/WisdomSeeds';

export default function FounderSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();

    // State & Kernel Hooks
    const { userId } = useUserRole();
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);
    const { logs: moodHistory, addMoodLog, isLoading: loadingMoods } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: loadingEnergy } = useEnergyForecast(userId ?? undefined);

    // Derived State
    const latestMood = moodHistory[0];

    // UI State
    const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);
    const [isSavingMood, setIsSavingMood] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

    const handleMoodSelect = async (mood: any, note: string) => {
        setIsSavingMood(true);
        try {
            await addMoodLog(mood, note);
            setIsMoodPickerOpen(false);
        } finally {
            setIsSavingMood(false);
        }
    };

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            <BaseSelfView
                role="founder"
                description={t('self.founderDescription', 'The steady eye of the hurricane - a space for vision and personal pulse.')}
                personalLayer={
                    <VStack space="xl">
                        {/* Mood Resonance (Kernel Component) */}
                        <MoodPickerCard
                            isOpen={isMoodPickerOpen}
                            onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                            onSelect={handleMoodSelect}
                            isSaving={isSavingMood}
                            latestMood={latestMood}
                            isLoading={loadingMoods}
                            accent="fire" // Dynamic fire accent for the founder
                        />

                        {/* Energy Pulse (Kernel Component) */}
                        <Box sx={{ p: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                            <EnergyBarChart
                                bars={forecasts.slice().reverse()}
                                height={80}
                            />
                        </Box>

                        <MoodLotus userId={userId ?? undefined} />
                        <WisdomSeeds userId={userId ?? undefined} />
                    </VStack>
                }
                workingLayer={
                    <VStack space="xl">
                        {/* Vision alignment and other high-level philosophy tools would go here */}
                    </VStack>
                }
                sideBar={
                    <VStack space="lg">
                        {/* Mirrors (Kernel Components) */}
                        <WarmMirrorCard text={warmMirrorText} />
                        <ImpactRipplesCard ripples={ripples} />
                    </VStack>
                }
            />

            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}
