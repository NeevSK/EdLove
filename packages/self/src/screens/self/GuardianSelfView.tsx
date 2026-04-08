import React, { useState } from 'react';
import { VStack, Box, ScreenWrapper } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { useStore, usePermissions, useJourneyHistory } from '@repo/core';

import { BaseSelfView } from '../../components/BaseSelfView';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useJournalEntries } from '../../hooks/useJournalEntries';

import WelcomeModal from '../../components/WelcomeModal';
import MoodLotus from '../../components/MoodLotus';
import FireJournal from '../../components/FireJournal';
import WisdomSeeds from '../../components/WisdomSeeds';
import JoyJar from '../../components/JoyJar';
import GratitudeGlimmers from '../../components/GratitudeGlimmers';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import RemindersManager from '../../components/RemindersManager';
import DailyRhythm from '../../components/DailyRhythm';
import SleepTracker from '../../components/SleepTracker';
import { JournalSection, MoodSection } from '../../views/sections';
import { JourneyHistoryCard } from '@repo/ui';

export default function GuardianSelfView() {
    const { t } = useTranslation();
    const { context } = usePermissions();
    const userId = context.userId;
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);
    const { logs: moodLogs, loading: loadingMoods } = useMoodLogs(userId ?? undefined);
    const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading, currentScale: viewScale } = useJourneyHistory();

    const holisticSection = (
        <VStack space="lg" style={{ padding: 20 }}>
            <JourneyHistoryCard
                events={journeyEvents}
                summary={holisticView.summary}
                loading={journeyLoading}
                scale={viewScale as any}
            />
            <JournalSection entries={journalEntries} loading={loadingJournals} />
            <MoodSection logs={moodLogs} loading={loadingMoods} />
        </VStack>
    );

    return (
        <ScreenWrapper scroll={false} noTopInset={true}>
            <BaseSelfView
                perspective="guardian"
                description={t(
                    'self.guardianDescription',
                    'A steady sanctuary for parents and guardians to stay centered while caring for their children.'
                )}
                domains={[
                    {
                        id: 'journey',
                        title: 'Family Journey',
                        accentColor: '#8B5CF6',
                        content: holisticSection,
                    },
                    {
                        id: 'presence',
                        title: 'Inner Presence',
                        accentColor: '#10B981',
                        features: [
                            {
                                id: 'mood-lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />,
                            },
                            {
                                id: 'fire-journal',
                                label: 'Fire Journal',
                                content: <FireJournal userId={userId ?? undefined} />,
                                historyContent: <JournalSection entries={journalEntries} loading={loadingJournals} />,
                            },
                            {
                                id: 'voice',
                                label: 'Voice Journal',
                                content: <VoiceJournaling userId={userId ?? undefined} />,
                            },
                            {
                                id: 'wisdom',
                                label: 'Wisdom Seeds',
                                content: <WisdomSeeds userId={userId ?? undefined} />,
                            },
                        ],
                    },
                    {
                        id: 'care',
                        title: 'Care Rhythm',
                        accentColor: '#F59E0B',
                        features: [
                            { id: 'joy-jar', label: 'Joy Jar', content: <JoyJar userId={userId ?? undefined} /> },
                            {
                                id: 'gratitude',
                                label: 'Gratitude Glimmers',
                                content: <GratitudeGlimmers userId={userId ?? undefined} />,
                            },
                            { id: 'tomorrow', label: 'Tomorrow Prep', content: <TomorrowPrep userId={userId ?? undefined} /> },
                            { id: 'reminders', label: 'Reminders', content: <RemindersManager userId={userId ?? undefined} /> },
                            { id: 'rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
                            { id: 'sleep', label: 'Sleep Tracker', content: <SleepTracker userId={userId ?? undefined} /> },
                        ],
                    },
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
