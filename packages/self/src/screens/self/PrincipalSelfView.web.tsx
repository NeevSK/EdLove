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
import { Activity, BookOpen } from 'lucide-react-native';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useDecisionJournal } from '../../hooks/useDecisionJournal';
import { useEnergyForecast as useCoreEnergyForecast } from '../../hooks/useEnergyForecast';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import { BaseSelfView } from '../../components/BaseSelfView';
import MoodLotus from '../../components/MoodLotus';
import DailyRhythm from '../../components/DailyRhythm';
import WelcomeModal from '../../components/WelcomeModal';
import { PulseDashboard } from '../../components/PulseDashboard';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import {
    MoodSection,
    PrincipalPulse,
    DecisionSection,
} from '../../views/sections';

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { can, context } = usePermissions();
    const userId = context.userId;
    const { viewMode, viewScale, setScale } = useTemporalStore();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    useJournalEntries();
    const { decisions, isLoading: decisionLoading } = useDecisionJournal();
    const { forecasts, isLoading: energyLoading } = useCoreEnergyForecast();
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
            /            <TemporalShield label="LEADERSHIP ENERGY"                <PrincipalPulse energy={forecasts[0]} decisions={decisions} loading={energyLoading || decisionLoading} /            </TemporalShield            <TemporalShield label="STRATEGIC DECISIONS"                <DecisionSection decisions={decisions} loading={decisionLoading} /            </TemporalShield        </div    );

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
            /            <div className="sanctuary-card" style={{ padding: '24px' }}                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '16px' }}                    Leadership ecology
                </h3                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Community' })}                        <Activity size={16} /> <span>Systemic Health</span                    </button                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Community' })}                        <BookOpen size={16} /> <span>Governance Ledger</span                    </button                </div            </div            <ImpactRipplesCard ripples={[]} /            <WarmMirrorCard text="Your clarity guides the entire ecosystem." /        </    );

    return (
        <TemporalProvider            <div style={{ padding: '20px 40px 0' }}                <TemporalNavigator /            </div            <BaseSelfView
                perspective="principal"
                description={t('self.principalDesc', 'Orchestrate systemic harmony from a place of centered wisdom.')}
                domains={[
                    {
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#F59E0B',
                        content: viewMode === 'timeline' ? <ResonanceTimeline /> : holisticSection,
                    },
                    {
                        id: 'tools',
                        title: 'Leadership Tools',
                        accentColor: '#8B5CF6',
                        features: [
                            { id: 'school_pulse', label: 'School Pulse', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            { id: 'strategic_pulse', label: 'Strategic Pulse', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            {
                                id: 'decision_mirror',
                                label: 'Decision Mirror',
                                content: <DecisionJournalSection userId={userId ?? ''} colors={{ accent: '#F59E0B' }} t={t} />,
                                historyContent: <DecisionSection decisions={decisions} loading={decisionLoading} />,
                            },
                            {
                                id: 'mood_lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
                            },
                            { id: 'daily_rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
                        ],
                    },
                ]}
                sideBar={sideBar}
            /            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            /        </TemporalProvider    );
}
