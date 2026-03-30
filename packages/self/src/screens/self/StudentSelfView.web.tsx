import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    TemporalProvider,
    TemporalShield,
    TemporalNavigator,
    JourneyHistoryCard,
} from '@repo/ui';
import {
    usePermissions,
    useTemporalStore,
    useNaturePaths,
    useStudentGoals,
    useJourneyHistory,
} from '@repo/core';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import { BaseSelfView } from '../../components/BaseSelfView';
import MoodLotus from '../../components/MoodLotus';
import StudentGoals from '../../components/StudentGoals';
import MyGradesView from '../../components/MyGradesView';
import BreathGuide from '../../components/BreathGuide';
import JoyJar from '../../components/JoyJar';
import WisdomSeeds from '../../components/WisdomSeeds';
import SleepTracker from '../../components/SleepTracker';
import FireJournal from '../../components/FireJournal';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import RemindersManager from '../../components/RemindersManager';
import {
    JournalSection,
    MoodSection,
    GoalSection,
    NatureSection,
} from '../../views/sections';

export default function StudentSelfView() {
    const { t } = useTranslation();
    const { context } = usePermissions();
    const userId = context.userId;
    const { viewMode, viewScale, setScale } = useTemporalStore();

    const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
    const { logs: moodLogs, loading: loadingMoods } = useMoodLogs();
    const { goals, isLoading: loadingGoals } = useStudentGoals();
    const { paths, isLoading: loadingPaths } = useNaturePaths();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

    const holisticSection = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '-8px' }}                {(['day', 'week', 'month', 'year'] as const).map((scale) => (
                    <button
                        key={scale}
                        className={`sanctuary-chip ${viewScale === scale ? 'active' : ''}`}
                        onClick={() => setScale(scale)}
                        style={{
                            background: viewScale === scale ? 'var(--saffron-glass)' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                        }}
                                            {scale}
                    </button                ))}
            </div            <JourneyHistoryCard
                events={journeyEvents}
                summary={holisticView.summary}
                loading={journeyLoading}
                scale={viewScale as any}
            /
            <TemporalShield label="JOURNAL HISTORY"                <JournalSection entries={journalEntries} loading={loadingJournals} /            </TemporalShield
            <TemporalShield label="MOOD HISTORY"                <MoodSection logs={moodLogs} loading={loadingMoods} /            </TemporalShield
            <GoalSection goals={goals} loading={loadingGoals} /            <NatureSection paths={paths} loading={loadingPaths} /        </div    );

    return (
        <TemporalProvider            <div style={{ padding: '20px 40px 0' }}                <TemporalNavigator /            </div
            <BaseSelfView
                perspective="student"
                description={t('self.studentDesc', 'A steady space to grow your mind and heart.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#8B5CF6',
                        content: viewMode === 'timeline' ? <ResonanceTimeline /> : holisticSection,
                    },
                    {
                        id: 'discovery',
                        title: 'My Tools',
                        accentColor: '#10B981',
                        features: [
                            {
                                id: 'mood_lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />,
                            },
                            {
                                id: 'goals',
                                label: 'Growth Goals',
                                content: <StudentGoals userId={userId ?? ''} />,
                                historyContent: <GoalSection goals={goals} loading={loadingGoals} />,
                            },
                            { id: 'grades', label: 'My Grades', content: <MyGradesView /> },
                            { id: 'breath', label: 'Breath Guide', content: <BreathGuide /> },
                            { id: 'joy_jar', label: 'Joy Jar', content: <JoyJar /> },
                            { id: 'wisdom', label: 'Wisdom Seeds', content: <WisdomSeeds /> },
                            { id: 'sleep', label: 'Sleep Tracker', content: <SleepTracker /> },
                            { id: 'fire_journal', label: 'Fire Journal', content: <FireJournal /> },
                            { id: 'tomorrow', label: 'Tomorrow Prep', content: <TomorrowPrep /> },
                            { id: 'voice', label: 'Voice Journal', content: <VoiceJournaling /> },
                            { id: 'reminders', label: 'Reminders', content: <RemindersManager /> },
                        ],
                    },
                ]}
            /        </TemporalProvider    );
}
