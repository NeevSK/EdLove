import React from 'react';
import { Icon, JourneyHistoryCard, TemporalProvider, TemporalShield, ink, useTheme, useThemedColors } from '@repo/ui';


import { useTranslation  } from 'react-i18next';
import {
    usePermissions,
    useStore,
    useTemporalStore,
    useJourneyHistory} from '@repo/core';
import { useNavigation } from '@react-navigation/native';

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
import WisdomSeeds from '../../components/WisdomSeeds';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import {
    MoodSection,
    PrincipalPulse,
    DecisionSection} from '../../views/sections';

export default function PrincipalSelfView() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { can, context } = usePermissions();
    const userId = context.userId;
    const colors = useTheme().scene;
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

    const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
    useJournalEntries();
    const { decisions, isLoading: decisionLoading } = useDecisionJournal();
    const { forecasts, isLoading: energyLoading } = useCoreEnergyForecast();
    const { events: journeyEvents, holisticView, isLoading: journeyLoading, currentScale: viewScale } = useJourneyHistory();

    const holisticSection = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <JourneyHistoryCard
                events={journeyEvents}
                summary={holisticView.summary}
                loading={journeyLoading}
                scale={viewScale as any}
            />
            <TemporalShield label="LEADERSHIP ENERGY">
                <PrincipalPulse energy={forecasts[0]} decisions={decisions} loading={energyLoading || decisionLoading} />
            </TemporalShield>
            <TemporalShield label="STRATEGIC DECISIONS">
                <DecisionSection decisions={decisions} loading={decisionLoading} />
            </TemporalShield>
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
                    Leadership ecology
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Community' })}>
                        <Icon as={Activity} size={16} /> <span>Leadership Ecology</span>
                    </button>
                    <button className="sidebar-item" onClick={() => navigation.navigate('Main', { screen: 'Community' })}>
                        <Icon as={BookOpen} size={16} /> <span>Governance Ledger</span>
                    </button>
                </div>
            </div>
            <ImpactRipplesCard ripples={ripples} />
            <WarmMirrorCard text={warmMirrorText ?? 'Your clarity guides the entire ecosystem.'} />
        </>
    );

    return (
        <TemporalProvider>
            <BaseSelfView
                perspective="principal"
                description={t('self.principalDesc', 'Orchestrate systemic harmony from a place of centered wisdom.')}
                domains={[{
                        id: 'journey',
                        title: 'Journey Overview',
                        accentColor: '#F59E0B',
                        content: holisticSection,
                        historyContent: <ResonanceTimeline />},
                    {
                        id: 'tools',
                        title: 'Leadership Tools',
                        accentColor: '#8B5CF6',
                        features: [
                            { id: 'pulse', label: 'Personal Pulse', content: <PulseDashboard onEnterDetails={() => {}} /> },
                            { id: 'energy_forecast', label: 'Energy Forecast', content: <PrincipalPulse energy={forecasts[0]} decisions={decisions} loading={energyLoading || decisionLoading} /> },
                            {
                                id: 'decision_mirror',
                                label: 'Decision Mirror',
                                content: <DecisionJournalSection userId={userId ?? ''} colors={colors} t={t} />,
                                historyContent: <DecisionSection decisions={decisions} loading={decisionLoading} />},
                            {
                                id: 'mood_lotus',
                                label: 'Mood Lotus',
                                content: <MoodLotus userId={userId ?? undefined} />,
                                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />},
                            { id: 'daily_rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
                            { id: 'wisdom', label: 'Leadership Wisdom', content: <WisdomSeeds userId={userId ?? undefined} /> },
                            {
                                id: 'monthly_reflection',
                                label: 'Monthly Reflection',
                                content: (
                                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px', color: 'var(--ink)' }}>
                                            {t('principal.monthlyComingSoon', 'Architect of Growth')}
                                        </h3>
                                        <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ink-ghost)' }}>
                                            {t('principal.monthlyComingSoonDesc', 'A deep reflection module for your monthly milestones is on its way.')}
                                        </p>
                                    </div>
                                )},
                        ]},
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

