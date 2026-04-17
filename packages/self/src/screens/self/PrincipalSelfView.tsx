import React, { useState } from 'react';
import { Box, PositiveInvitation, ScreenWrapper, VStack, hapticLight, useTheme, useThemedColors } from '@repo/ui';


import { useNavigation } from '@react-navigation/native';

import { useTranslation } from 'react-i18next';
import { 
    useStore, 
    usePermissions, 
    useJourneyHistory 
} from '@repo/core';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useDecisionJournal } from '../../hooks/useDecisionJournal';
import { 
    JournalSection, 
    MoodSection, 
    PrincipalPulse,
    DecisionSection
} from '../../views/sections';


// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';

// Role Components
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import MoodLotus from '../../components/MoodLotus';
import DailyRhythm from '../../components/DailyRhythm';
import WisdomSeeds from '../../components/WisdomSeeds';
import VoiceJournaling from '../../components/VoiceJournaling';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import ResonancePatternCard from '../../components/ResonancePatternCard';

import { PulseDashboard } from '../../components/PulseDashboard';

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useTheme().scene;

    // State & Kernel Hooks
    const { context } = usePermissions();
    const userId = context.userId;
    const isGuest = !userId;
    const user = useStore(state => state.user);
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
    const { decisions, isLoading: loadingDecisions } = useDecisionJournal(userId ?? undefined);
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

    const holisticSection = (
        <VStack space="lg" style={{ padding: 20 }}>
            <JournalSection entries={journalEntries} loading={loadingJournals} />
            <MoodSection logs={moodHistory} loading={loadingMoods} />
            <PrincipalPulse energy={null} decisions={decisions} loading={loadingDecisions} />
            <DecisionSection decisions={decisions} loading={loadingDecisions} />
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
                perspective="principal"
                description={t('self.principalDescription', 'A restorative space for leadership clarity and personal rhythm.')}
                domains={[{
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#F59E0B',
                        content: holisticSection},
                    {
                        id: 'pulse',
                        title: 'Inner Pulse',
                        accentColor: '#8B5CF6',
                        features: [
                            {
                                id: 'pulse',
                                label: 'Daily Pulse',
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
                            }
                        ]
                    },
                    {
                        id: 'physical',
                        title: 'Physical Sanctuary',
                        accentColor: '#3B82F6', // Water/Blue
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
                                        accent="water"
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
                                id: 'daily-rhythm',
                                label: 'Daily Rhythm',
                                content: <DailyRhythm />
                            }
                        ]
                    },
                    {
                        id: 'working',
                        title: 'Working Rhythm',
                        accentColor: '#10B981', // Moss/Teal
                        features: [
                            {
                                id: 'decisions',
                                label: 'Decision Journal',
                                content: <DecisionJournalSection userId={userId} colors={colors} t={t} />
                            },
                            {
                                id: 'resonance',
                                label: 'Resonance Patterns',
                                content: user ? (
                                    <ResonancePatternCard
                                        orientationSeeds={(user as any).orientation_seeds}
                                        moodLogs={moodHistory}
                                        energyForecasts={forecasts}
                                    />
                                ) : null
                            },
                            {
                                id: 'wisdom',
                                label: 'Leadership Wisdom',
                                content: <WisdomSeeds userId={userId ?? undefined} />
                            },
                            {
                                id: 'monthly',
                                label: 'Monthly Reflection',
                                content: (
                                    <PositiveInvitation
                                        context="self"
                                        title={t('principal.monthlyComingSoon', 'Architect of Growth')}
                                        description={t('principal.monthlyComingSoonDesc', 'A deep reflection module for your monthly milestones is on its way.')}
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

