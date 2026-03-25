import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    usePermissions,
    useStore,
    useResonanceStore,
    useBanyanGrowth,
    useJourneyHistory,
} from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import {
    TemporalNavigator,
    ResonanceProvider,
    JourneyHistoryCard,
    ResonanceShield,
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
    const { viewMode, resonanceDate, viewScale, setScale } = useResonanceStore();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries();
    const { banyan, isLoading: banyanLoading } = useBanyanGrowth();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

    const personalLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ResonanceShield label="JOURNAL RESONANCE">
                <JournalSection entries={journalEntries} loading={journalLoading} />
            </ResonanceShield>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '-8px' }}>
                {(['day', 'week', 'month', 'year'] as const).map((scale) => (
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
            <ImpactRipplesCard ripples={[]} />
            <WarmMirrorCard text="Your presence is the root of this sanctuary." />
        </>
    );

    return (
        <ResonanceProvider>
            <div style={{ padding: '20px 40px 0' }}>
                <TemporalNavigator />
            </div>
            <BaseSelfView
                perspective="teacher"
                description={t('self.teacherDesc', 'Radiate clarity from the center of your instructional practice.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#10B981',
                        content: viewMode === 'timeline' ? <ResonanceTimeline /> : holisticSection,
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
                            { id: 'daily_rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
                            { id: 'professional_growth', label: 'Banyan Growth', content: <SpotlightEmpty date={resonanceDate} /> },
                        ],
                    },
                ]}
                sideBar={sideBar}
            />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ResonanceProvider>
    );
}
