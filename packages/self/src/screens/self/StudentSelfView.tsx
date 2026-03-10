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

// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';

// Role Components
import MoodLotus from '../../components/MoodLotus';
import ShadowAgentDrawer from '../../components/ShadowAgentDrawer';
import WelcomeModal from '../../components/WelcomeModal';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import DailyRhythm from '../../components/DailyRhythm';
import WindDownRitual from '../../components/WindDownRitual';
import WisdomSeeds from '../../components/WisdomSeeds';
import ProgressTree from '../../components/ProgressTree';
import MyGradesView from '../../components/MyGradesView';
import { PulseDashboard } from '../../components/PulseDashboard';

export default function StudentSelfView() {
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
                role="student"
                description={t('self.studentDescription', 'A steady space to grow your mind and heart.')}
                domains={[
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
                                id: 'mood-lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />
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
                        title: 'Physical Sanctuary',
                        accentColor: '#F59E0B',
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
                                        accent="light"
                                    />
                                )
                            },
                            {
                                id: 'energy-forecast',
                                label: 'Energy Rhythm',
                                content: (
                                    <Box sx={{ p: 24, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                                        <EnergyBarChart
                                            bars={forecasts.slice().reverse()}
                                            height={80}
                                        />
                                    </Box>
                                )
                            },
                            {
                                id: 'wind-down',
                                label: 'Restorative Ritual',
                                content: <WindDownRitual userId={userId ?? undefined} />
                            }
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
                                content: <DailyRhythm />
                            },
                            {
                                id: 'progress',
                                label: 'Growth Tree',
                                content: <ProgressTree userId={userId ?? undefined} />
                            },
                            {
                                id: 'grades',
                                label: 'Academic Mirror',
                                content: <MyGradesView userId={userId ?? undefined} />
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

            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}
