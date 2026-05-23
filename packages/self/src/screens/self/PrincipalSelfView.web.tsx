import { useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { Icon } from '@repo/ui/primitives';

import { Activity, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '../../components/BaseSelfView';
import DailyRhythm from '../../components/DailyRhythm';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import GovernanceHistoryTimeline from '../../components/GovernanceHistoryTimeline';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import MoodLotus from '../../components/MoodLotus';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { PulseDashboard } from '../../components/PulseDashboard';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import WelcomeModal from '../../components/WelcomeModal';
import WisdomSeeds from '../../components/WisdomSeeds';
import { useDecisionJournal } from '../../hooks/useDecisionJournal';
import { useEnergyForecast as useCoreEnergyForecast } from '../../hooks/useEnergyForecast';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import { DecisionSection, MoodSection, PrincipalPulse } from '../../views/sections';

export default function PrincipalSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;
  const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);
  const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

  const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
  useJournalEntries();
  const { decisions, isLoading: decisionLoading } = useDecisionJournal();
  const { forecasts, isLoading: energyLoading } = useCoreEnergyForecast();
  const {
    events: journeyEvents,
    holisticView,
    isLoading: journeyLoading,
    currentScale: viewScale,
  } = useJourneyHistory();

  const holisticSection = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <JourneyHistoryCard
        events={journeyEvents}
        summary={holisticView.summary}
        loading={journeyLoading}
        scale={viewScale === 'custom' ? 'day' : viewScale}
      />
      <TemporalShield label="LEADERSHIP ENERGY">
        <PrincipalPulse
          energy={forecasts[0]}
          decisions={decisions}
          loading={energyLoading || decisionLoading}
        />
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
        onSelect={async (mood: Parameters<typeof addMoodLog>[0], note: string) => {
          await addMoodLog(mood, note || undefined);
        }}
        isSaving={false}
        isDisabled={false}
        latestMood={moodLogs[0]}
        isLoading={moodLoading}
        accent="dark"
      />
      <div className="sanctuary-card" style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '800',
            textTransform: 'uppercase',
            color: 'var(--ink-ghost)',
            marginBottom: '16px',
          }}
        >
          Leadership ecology
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="button" className="sidebar-item" onClick={() => {}}>
            <Icon as={Activity} size={16} /> <span>Leadership Ecology</span>
          </button>
          <button type="button" className="sidebar-item" onClick={() => {}}>
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
        description={t(
          'self.principalDesc',
          'Orchestrate systemic harmony from a place of centered wisdom.',
        )}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#F59E0B',
            content: holisticSection,
            historyContent: <ResonanceTimeline />,
          },
          {
            id: 'pulse',
            title: 'Inner Pulse',
            accentColor: '#8B5CF6',
            features: [
              {
                id: 'pulse',
                label: 'Personal Pulse',
                content: <PulseDashboard onEnterDetails={() => {}} />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
              },
            ],
          },
          {
            id: 'physical',
            title: 'Physical Sanctuary',
            accentColor: '#3B82F6',
            features: [
              {
                id: 'energy_forecast',
                label: 'Energy Forecast',
                content: (
                  <PrincipalPulse
                    energy={forecasts[0]}
                    decisions={decisions}
                    loading={energyLoading || decisionLoading}
                  />
                ),
              },
              {
                id: 'daily_rhythm',
                label: 'Daily Rhythm',
                content: <DailyRhythm />,
              },
            ],
          },
          {
            id: 'working',
            title: 'Working Rhythm',
            accentColor: '#10B981',
            features: [
              {
                id: 'decisions',
                label: 'Decision Mirror',
                content: <DecisionJournalSection userId={userId ?? ''} />,
                historyContent: <DecisionSection decisions={decisions} loading={decisionLoading} />,
              },
              {
                id: 'wisdom',
                label: 'Leadership Wisdom',
                content: <WisdomSeeds userId={userId ?? undefined} />,
              },
              {
                id: 'monthly_reflection',
                label: 'Monthly Reflection',
                content: (
                  <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        marginBottom: '10px',
                        color: 'var(--ink)',
                      }}
                    >
                      {t('principal.monthlyComingSoon', 'Architect of Growth')}
                    </h3>
                    <p
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'var(--ink-ghost)',
                      }}
                    >
                      {t(
                        'principal.monthlyComingSoonDesc',
                        'A deep reflection module for your monthly milestones is on its way.',
                      )}
                    </p>
                  </div>
                ),
              },
              {
                id: 'history',
                label: 'Governance History',
                content: <GovernanceHistoryTimeline userId={userId ?? ''} />,
              },
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
