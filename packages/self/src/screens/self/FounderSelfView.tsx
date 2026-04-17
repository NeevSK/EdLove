import React, { useState } from 'react';
import { Box, PositiveInvitation, ScreenWrapper, VStack, useTheme, useThemedColors } from '@repo/ui';


import { useNavigation } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { 
    useStore, 
    usePermissions, 
    useJourneyHistory
} from '@repo/core';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useWisdom } from '../../hooks/useWisdom';
import { 
    JournalSection, 
    MoodSection, 
    VisionSection,
    PhilosophySection
} from '../../views/sections';

// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';

// Role Components
import MoodLotus from '../../components/MoodLotus';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import WisdomSeeds from '../../components/WisdomSeeds';
import VoiceJournaling from '../../components/VoiceJournaling';

import { PulseDashboard } from '../../components/PulseDashboard';

export default function FounderSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useTheme().scene;

    // State & Kernel Hooks
    const { context } = usePermissions();
    const userId = context.userId;
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
    const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

    const holisticSection = (
        <VStack space="lg" style={{ padding: 20 }}>
            <JournalSection entries={journalEntries} loading={loadingJournals} />
            <MoodSection logs={moodHistory} loading={loadingMoods} />
            <VisionSection />
            <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
        </VStack>
    );

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
                perspective="founder"
                description={t('self.founderDescription', 'The steady eye of the hurricane - a space for vision and personal pulse.')}
                domains={[{
                        id: 'journey',
                        title: 'Ecosystem Journey',
                        accentColor: '#FBBF24',
                        content: holisticSection},
                    {
                        id: 'pulse',
                        title: 'Ecosystem Pulse',
                        accentColor: '#8B5CF6',
                        features: [
                            {
                                id: 'pulse',
                                label: 'Ecosystem Dash',
                                content: <PulseDashboard onEnterDetails={() => { }} />
                            },
                            {
                                id: 'voice',
                                label: 'Voice Journal',
                                content: <VoiceJournaling userId={userId ?? undefined} />
                            },
                            {
                                id: 'mood-lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodHistory} loading={loadingMoods} />
                            },
                            {
                                id: 'wisdom',
                                label: 'Wisdom Seeds',
                                content: <WisdomSeeds userId={userId ?? undefined} />
                            }
                        ]
                    },
                    {
                        id: 'physical',
                        title: 'Physical Rhythm',
                        accentColor: '#3B82F6',
                        features: [
                            {
                                id: 'mood-picker',
                                label: 'Mood Tracking',
                                content: (
                                    <MoodPickerCard
                                        isOpen={isMoodPickerOpen}
                                        onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                                        onSelect={handleMoodSelect}
                                        isSaving={isSavingMood}
                                        latestMood={latestMood}
                                        isLoading={loadingMoods}
                                        accent="dark"
                                    />
                                )
                            },
                            {
                                id: 'energy-forecast',
                                label: 'Energy Rhythm',
                                content: (
                                    <Box style={{ padding: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                                        <EnergyBarChart
                                            bars={forecasts.slice().reverse()}
                                            height={80}
                                        />
                                    </Box>
                                )
                            },
                            {
                                id: 'vision',
                                label: 'Vision Alignment',
                                content: <VisionSection />
                            },
                            {
                                id: 'philosophy',
                                label: 'Philosophical Anchors',
                                content: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
                            },
                            {
                                id: 'monthly',
                                label: 'Monthly Reflection',
                                content: (
                                    <PositiveInvitation
                                        context="self"
                                        title={t('founder.visionComingSoon', 'Architecting the Future')}
                                        description={t('founder.visionComingSoonDesc', 'The vision alignment dashboard is currently being synthesized.')}
                                    />
                                )
                            }
                        ]
                    }
                ]}
                sideBar={
                    <VStack space="lg">
                        <WarmMirrorCard text={warmMirrorText} />
                        <ImpactRipplesCard ripples={ripples} />
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

