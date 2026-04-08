import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    usePermissions,
    useStore,
    useTemporalStore,
    useBanyanGrowth,
    useJourneyHistory,
} from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import {
    TemporalProvider,
    JourneyHistoryCard,
    TemporalShield,
    useThemedColors,
} from '@repo/ui';
import { Users, MessageSquare } from 'lucide-react-native';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import { SpotlightEmpty } from '../../components/SpotlightEmpty';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { BaseSelfView } from '../../components/BaseSelfView';
import MoodLotus from '../../components/MoodLotus';
import DailyRhythm from '../../components/DailyRhythm';
import WelcomeModal from '../../components/WelcomeModal';
import FireJournal from '../../components/FireJournal';
import JoyJar from '../../components/JoyJar';
import GratitudeGlimmers from '../../components/GratitudeGlimmers';
import WisdomSeeds from '../../components/WisdomSeeds';
import TomorrowPrep from '../../components/TomorrowPrep';
import SleepTracker from '../../components/SleepTracker';
import RemindersManager from '../../components/RemindersManager';
import VoiceJournaling from '../../components/VoiceJournaling';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import {
    JournalSection,
    MoodSection,
    TeacherPulse,
} from '../../views/sections';

export default function TeacherSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { context } = usePermissions();
    const userId = context.userId;
    const { viewDate } = useTemporalStore();
    const colors = useThemedColors();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries();
    const { banyan, isLoading: banyanLoading } = useBanyanGrowth();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading, currentScale: viewScale } = useJourneyHistory();

    const personalLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TemporalShield label="JOURNAL HISTORY">
                <JournalSection entries={journalEntries} loading={journalLoading} />
            </TemporalShield>
            <MoodLotus userId={userId ?? undefined} />
        </div>
    );

    const workingLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <TeacherPulse banyan={banyan} loading={banyanLoading} />
            <DailyRhythm />
        </div>
    );

    const holisticSection = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <JourneyHistoryCard
                events={journeyEvents}
                summary={holisticView.summary}
                loading={journeyLoading}
                scale={viewScale as any}
            />
            {workingLayer}
            {personalLayer}
        </div>
    );

    const sideBar = (
        <>
            <MoodPickerCard
                isOpen={false}
                onToggle={() => {}}
                onSelect={async (mood, note) => {
                    await addMoodLog(mood, note || undefined);
                }}
                isSaving={false}
                isDisabled={false}
                latestMood={moodLogs[0]}
                isLoading={moodLoading}
                accent="dark"
            />
            <div className="sanctuary-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '16px' }}>
                    Professional Ecology
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Classroom' })}>
                        <Users size={16} /> <span>Educational Ecology</span>
                    </button>
                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Community' })}>
                        <MessageSquare size={16} /> <span>Faculty Resonance</span>
                    </button>
                </div>
            </div>
            <ImpactRipplesCard ripples={ripples} />
            <WarmMirrorCard text={warmMirrorText ?? 'Your presence is the root of this sanctuary.'} />
        </>
    );

    return (
        <TemporalProvider>
            <BaseSelfView
                perspective="teacher"
                description={t('self.teacherDesc', 'Radiate clarity from the center of your instructional practice.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#10B981',
                        content: holisticSection,
                        historyContent: <ResonanceTimeline />,
                    },
                    {
                        id: 'tools',
                        title: 'Instructional Tools',
                        accentColor: '#8B5CF6',
                        features: [
                            {
                                id: 'teacher_pulse',
                                label: 'Instructional Pulse',
                                content: <TeacherPulse banyan={banyan} loading={banyanLoading} />,
                                historyContent: <TeacherPulse banyan={banyan} loading={banyanLoading} />,
                            },
                            {
                                id: 'mood_lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
                            },
                            {
                                id: 'fire_journal',
                                label: 'Fire Journal',
                                content: <FireJournal userId={userId ?? undefined} />,
                                historyContent: <JournalSection entries={journalEntries} loading={journalLoading} />,
                            },
                            { id: 'daily_rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
                            { id: 'professional_growth', label: 'Banyan Growth', content: <SpotlightEmpty date={viewDate} /> },
                            { id: 'joy_jar', label: 'Joy Jar', content: <JoyJar userId={userId ?? undefined} /> },
                            { id: 'gratitude', label: 'Gratitude Glimmers', content: <GratitudeGlimmers userId={userId ?? undefined} /> },
                            { id: 'wisdom', label: 'Wisdom Seeds', content: <WisdomSeeds userId={userId ?? undefined} /> },
                            { id: 'tomorrow', label: 'Tomorrow Prep', content: <TomorrowPrep userId={userId ?? undefined} /> },
                            { id: 'sleep', label: 'Sleep Tracker', content: <SleepTracker userId={userId ?? undefined} /> },
                            { id: 'reminders', label: 'Reminders', content: <RemindersManager userId={userId ?? undefined} /> },
                            { id: 'voice', label: 'Voice Journal', content: <VoiceJournaling userId={userId ?? undefined} /> },
                            { id: 'decisions', label: 'Decision Journal', content: <DecisionJournalSection userId={userId} colors={colors} t={t} /> },
                        ],
                    },
                ]}
                sideBar={sideBar}
            />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </TemporalProvider>
    );
}
