import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ResonanceProvider, 
    ResonanceShield, 
    TemporalNavigator,
    JourneyHistoryCard
} from '@repo/ui';
import { 
    useMoodLogs, 
    useJournalEntries, 
    ResonanceTimeline,
    SpotlightEmpty,
    JournalSection,
    MoodSection,
    GoalSection,
    IdentitySection,
    TeacherFeedbackSection,
    NatureSection,
    BaseSelfView,
    MoodLotus,
    StudentGoals,
    MyGradesView,
    BreathGuide,
    JoyJar,
    WisdomSeeds,
    SleepTracker,
    FireJournal,
    TomorrowPrep,
    VoiceJournaling,
    RemindersManager
} from '@repo/self';

import { 
    useUserRole, 
    useStore, 
    useResonanceStore,
    useNaturePaths,
    useStudentGoals,
    useJourneyHistory
} from '@repo/core';
import { useNavigation } from '@react-navigation/native';

/**
 * StudentSelfView (Web)
 * 
 * The journey-centric dashboard for students.
 * Restored the "Discovery Hub" to ensure all 10+ features are accessible,
 * while keeping the JourneyHistoryCard as the holistic temporal lens.
 */
export const StudentSelfView: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { userId } = useUserRole();
    const { viewMode, resonanceDate, viewScale, setScale } = useResonanceStore();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    // Data Hooks for Holistic View
    const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
    const { logs: moodLogs, loading: loadingMoods } = useMoodLogs();
    const { goals, isLoading: loadingGoals } = useStudentGoals();
    const { paths, isLoading: loadingPaths } = useNaturePaths();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

    const holisticSection = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '-8px' }}>
                {(['day', 'week', 'month', 'year'] as const).map(scale => (
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
                            textTransform: 'uppercase'
                        }}
                    >
                        {scale}
                    </button>
                ))}
            </div>
            <JourneyHistoryCard 
                events={journeyEvents} 
                summary={holisticView.summary}
                loading={journeyLoading}
                scale={viewScale as any}
            />
            
            {/* Holistic Sections as "Snapshots" */}
            <ResonanceShield label="JOURNAL RESONANCE">
                <JournalSection entries={journalEntries} loading={loadingJournals} />
            </ResonanceShield>

            <ResonanceShield label="MOOD RESONANCE">
                <MoodSection logs={moodLogs} loading={loadingMoods} />
            </ResonanceShield>

            <GoalSection goals={goals} loading={loadingGoals} />
            <NatureSection paths={paths} loading={loadingPaths} />
        </div>
    );

    return (
        <ResonanceProvider>
            <div style={{ padding: '20px 40px 0' }}>
                <TemporalNavigator />
            </div>
            
            <BaseSelfView
                role="student"
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
                                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />
                            },
                            { 
                                id: 'goals', 
                                label: 'Growth Goals', 
                                content: <StudentGoals userId={userId ?? undefined} />,
                                historyContent: <GoalSection goals={goals} loading={loadingGoals} />
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
                        ]
                    }
                ]}
            />
        </ResonanceProvider>
    );
};

export default StudentSelfView;
