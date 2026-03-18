import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    useUserRole, 
    useStore, 
    useResonanceStore,
    useJourneyHistory
} from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { 
    TemporalNavigator,
    ResonanceProvider,
    JourneyHistoryCard,
    ResonanceShield
} from '@repo/ui';
import { 
    useMoodLogs, 
    useJournalEntries, 
    useWisdom,
    ResonanceTimeline,
    SpotlightEmpty,
    JournalSection,
    MoodSection,
    MoodPickerCard,
    ImpactRipplesCard,
    WarmMirrorCard,
    MoodLotus,
    WelcomeModal,
    BaseSelfView,
    VisionSection,
    PhilosophySection,
    PulseDashboard
} from '@repo/self';
import {
    Sparkles,
    Lightbulb
} from 'lucide-react-native';

/**
 * FounderSelfView (Web)
 * 
 * Refactored to restore the Discovery Hub (circular features)
 * while maintaining the holistic JourneyHistoryCard.
 */
export const FounderSelfView: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { userId } = useUserRole();
    const { viewMode, resonanceDate, viewScale, setScale } = useResonanceStore();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    // Data Hooks
    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries();
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom();
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
            
            <ResonanceShield label="ECOSYSTEM VISION">
                 <VisionSection />
            </ResonanceShield>
            
            <ResonanceShield label="PHILOSOPHICAL ANCHORS">
                 <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
            </ResonanceShield>
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
                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '16px' }}>Ecosystem Flux</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="sidebar-item" onClick={() => {}}><Sparkles size={16} /> <span>Vision Alignment</span></button>
                    <button className="sidebar-item" onClick={() => {}}><Lightbulb size={16} /> <span>Philosophy Lab</span></button>
                </div>
            </div>
            <ImpactRipplesCard ripples={[]} />
            <WarmMirrorCard text="Your vision is the horizon of this ecology." />
        </>
    );

    return (
        <ResonanceProvider>
             <div style={{ padding: '20px 40px 0' }}>
                <TemporalNavigator />
            </div>
            <BaseSelfView
                role="founder"
                description={t('self.founderDesc', "Navigate the vast currents of the educational ecosystem.")}
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
                                historyContent: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
                            },
                            { id: 'ecosystem_dash', label: 'Global Dash', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            { 
                                id: 'mood_lotus', 
                                label: 'Mood Lotus', 
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />
                            },
                        ]
                    }
                ]}
                sideBar={sideBar}
            />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ResonanceProvider>
    );
};

export default FounderSelfView;
