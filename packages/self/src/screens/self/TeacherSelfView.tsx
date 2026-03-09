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
    supabase,
    useStore,
    useSafeMutation,
    warmMirrorAPI,
    impactRipplesAPI,
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

// Legacy/Role Components
import MoodLotus from '../../components/MoodLotus';
import FireJournal from '../../components/FireJournal';
import DailyRhythm from '../../components/DailyRhythm';
import ShadowAgentDrawer from '../../components/ShadowAgentDrawer';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import VoiceJournaling from '../../components/VoiceJournaling';

export default function TeacherSelfView() {
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
                role="teacher"
                description={t('self.teacherDescription', 'Your inner room for presence and classroom resonance.')}
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
                            accent="dark"
                        />

                        {/* Energy Pulse (Kernel Component) */}
                        <Box sx={{ p: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                            <EnergyBarChart
                                bars={forecasts.slice().reverse()} // oldest to newest
                                height={80}
                            />
                        </Box>

                        {/* Traditional Tools */}
                        <MoodLotus userId={userId ?? undefined} />
                    </VStack>
                }
                fireJournal={<FireJournal userId={userId ?? undefined} />}
                voiceJournal={<VoiceJournaling userId={userId ?? undefined} />}
                workingLayer={
                    <VStack space="xl">
                        <DailyRhythm />
                        {/* Future Banyan Path integration will go here */}
                    </VStack>
                }
                sideBar={
                    <VStack space="lg">
                        {/* Mirrors (Kernel Components) */}
                        <WarmMirrorCard text={warmMirrorText} />
                        <ImpactRipplesCard ripples={ripples} />
                        <ShadowAgentDrawer />
                    </VStack>
                }
            />

            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}
