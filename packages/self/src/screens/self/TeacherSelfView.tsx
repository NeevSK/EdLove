import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    useThemedColors,
    ScreenWrapper,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
import {
    supabase,
    useStore,
    usePermissions,
    useTemporalStore,
    useJourneyHistory,
    useBanyanGrowth
} from '@repo/core';

import { useJournalEntries } from '../../hooks/useJournalEntries';

import { 
    JournalSection, 
    MoodSection, 
    TeacherPulse,
} from '../../views/sections';

// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';

// Legacy/Role Components
import MoodLotus from '../../components/MoodLotus';
import FireJournal from '../../components/FireJournal';
import DailyRhythm from '../../components/DailyRhythm';
import WindDownRitual from '../../components/WindDownRitual';
import WisdomSeeds from '../../components/WisdomSeeds';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import VoiceJournaling from '../../components/VoiceJournaling';

import { PulseDashboard } from '../../components/PulseDashboard';

export default function TeacherSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();

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
    const [isPulseDashboardOpen, setIsPulseDashboardOpen] = useState(true);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const { viewScale, setScale } = useTemporalStore();
    const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();
    const { banyan, isLoading: banyanLoading } = useBanyanGrowth();

    const holisticSection = (
        <VStack space="lg" sx={{ p: 20 }}>
            <HStack justifyContent="flex-end" space="xs">
                {(['day', 'week', 'month', 'year'] as const).map(scale => (
                    <Box >
                        key={scale}
                        sx={{ 
                            bg: viewScale === scale ? '$amber400' : 'rgba(255,255,255,0.05)', 
                            px: 12, 
                            py: 4, 
                            borderRadius: 12 
                        }}
                    
                        <Pressable onPress={() => setScale(scale)}
                            <Text sx={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{scale.toUpperCase()}</Text
                        ></Pressable>
                    </Box>
                ))}
            </HStack>

            <JournalSection entries={journalEntries} loading={loadingJournals} />
            <MoodSection logs={moodHistory} loading={loadingMoods} />
            <TeacherPulse banyan={banyan} loading={banyanLoading} />
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
            <BaseSelfView/>
                perspective="teacher"
                description={t('self.teacherDescription', 'Refine your craft, nurture your spirit.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#10B981',
                        content: holisticSection,
                    },
                    {
                        id: 'pulse',
                        title: 'Inner Pulse',
                        accentColor: '#8B5CF6',
                        features: [
                            {
                                id: 'pulse',
                                label: 'Daily Pulse',
                                content: <PulseDashboard onEnterDetails={() => { }} /
                            },
                            {
                                id: 'mood-lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} /
                            >},
                            {
                                id: 'wisdom',
                                label: 'Wisdom Seeds',
                                content: <WisdomSeeds userId={userId ?? undefined} /
                            >}
                        ]
                    },
                    {
                        id: 'personal',
                        title: 'Personal Sanctuary',
                        accentColor: '#EF4444',
                        features: [
                            {
                                id: 'fire-journal',
                                label: 'Fire Journal',
                                content: <FireJournal userId={userId ?? undefined} /
                            >},
                            {
                                id: 'voice',
                                label: 'Voice Journal',
                                content: <VoiceJournaling userId={userId ?? undefined} /
                            >},
                            {
                                id: 'mood-picker',
                                label: 'Mood Tracking',
                                content: (
                                    <MoodPickerCard/>
                                        isOpen={isMoodPickerOpen}
                                        onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                                        onSelect={handleMoodSelect}
                                        isSaving={isSavingMood}
                                        latestMood={latestMood}
                                        isLoading={loadingMoods}
                                    /
                                )
                            }
                        ]
                    },
                    {
                        id: 'physical',
                        title: 'Physical Rhythm',
                        accentColor: '#F59E0B',
                        features: [
                            {
                                id: 'energy-forecast',
                                label: 'Energy Rhythm',
                                content: (
                                    <Box sx={{ p: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                                        <EnergyBarChart/>
                                            bars={forecasts.slice().reverse()}
                                            height={80}
                                        /
                                    </Box>
                                )
                            },
                            {
                                id: 'wind-down',
                                label: 'Restorative Ritual',
                                content: <WindDownRitual userId={userId ?? undefined} /
                            >}
                        ]
                    },
                    {
                        id: 'working',
                        title: 'Working Rhythm',
                        accentColor: '#10B981',
                        features: [
                            {
                                id: 'daily-rhythm',
                                label: 'Working Pace',
                                content: <DailyRhythm /
                            >}
                        ]
                    }
                ]}
                sideBar={
                    <VStack space="lg">
                        <WarmMirrorCard text={warmMirrorText} />
                        <ImpactRipplesCard ripples={ripples} />
                    </VStack>
                }
            /


            <WelcomeModal>
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            /
        </ScreenWrapper>
    );
}
