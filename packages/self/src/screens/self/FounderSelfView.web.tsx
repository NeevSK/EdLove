import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    usePermissions,
    useStore,
    useTemporalStore,
    useJourneyHistory,
} from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import {
    TemporalNavigator,
    TemporalProvider,
    JourneyHistoryCard,
    TemporalShield,
} from '@repo/ui';
import { Sparkles, Lightbulb } from 'lucide-react-native';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useWisdom } from '../../hooks/useWisdom';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { BaseSelfView } from '../../components/BaseSelfView';
import MoodLotus from '../../components/MoodLotus';
import WelcomeModal from '../../components/WelcomeModal';
import { PulseDashboard } from '../../components/PulseDashboard';
import {
    VisionSection,
    PhilosophySection,
    MoodSection,
} from '../../views/sections';

export default function FounderSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { context } = usePermissions();
    const { userId } = context;
    const { viewMode, viewScale, setScale } = useTemporalStore();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    useJournalEntries();
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom();
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
            /            <TemporalShield label="ECOSYSTEM VISION"                <VisionSection /            </TemporalShield            <TemporalShield label="PHILOSOPHICAL ANCHORS"                <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} /            </TemporalShield        </div    );

    const sideBar = (
        <            <MoodPickerCard
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
            /            <div className="sanctuary-card" style={{ padding: '24px' }}                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '16px' }}                    Ecosystem Flux
                </h3                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}                    <button className="sidebar-item" onClick={() => {}}                        <Sparkles size={16} /> <span>Vision Alignment</span                    </button                    <button className="sidebar-item" onClick={() => {}}                        <Lightbulb size={16} /> <span>Philosophy Lab</span                    </button                </div            </div            <ImpactRipplesCard ripples={[]} /            <WarmMirrorCard text="Your vision is the horizon of this ecology." /        </    );

    return (
        <TemporalProvider            <div style={{ padding: '20px 40px 0' }}                <TemporalNavigator /            </div            <BaseSelfView
                perspective="founder"
                description={t('self.founderDesc', 'Navigate the vast currents of the educational ecosystem.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Ecosystem Overview',
                        accentColor: '#FBBF24',
                        content: viewMode === 'timeline' ? <ResonanceTimeline /> : holisticSection,
                    },
                    {
                        id: 'tools',
                        title: 'Visionary Tools',
                        accentColor: '#8B5CF6',
                        features: [
                            { id: 'vision_lab', label: 'Vision Lab', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            {
                                id: 'philosophy_lab',
                                label: 'Philosophy Lab',
                                content: <PulseDashboard onEnterDetails={() => {}} />,
                                historyContent: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />,
                            },
                            { id: 'ecosystem_dash', label: 'Global Dash', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            {
                                id: 'mood_lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
                            },
                        ],
                    },
                ]}
                sideBar={sideBar}
            /            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            /        </TemporalProvider    );
}
