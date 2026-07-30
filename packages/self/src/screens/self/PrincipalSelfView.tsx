import { usePermissions, useStore } from '@repo/core/logic';

import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, VStack } from '@repo/ui/primitives';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import DailyRhythm from '@repo/self/components/DailyRhythm';
import DecisionJournalSection from '@repo/self/components/DecisionJournalSection';
import { EnergyBarChart } from '@repo/self/components/EnergyBarChart';
import GovernanceHistoryTimeline from '@repo/self/components/GovernanceHistoryTimeline';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
import MoodLotus from '@repo/self/components/MoodLotus';
import { MoodPickerCard } from '@repo/self/components/MoodPickerCard';
import { PulseDashboard } from '@repo/self/components/PulseDashboard';
import ResonancePatternCard from '@repo/self/components/ResonancePatternCard';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
// Role Components
import WelcomeModal from '@repo/self/components/WelcomeModal';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useDecisionJournal } from '@repo/self/hooks/useDecisionJournal';
import { useEnergyForecast } from '@repo/self/hooks/useEnergyForecast';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { DecisionSection, JournalSection, MoodSection, PrincipalPulse } from '@repo/self/views/sections';

export default function PrincipalSelfView() {
  const { t } = useTranslation();
  // State & Kernel Hooks
  const { context } = usePermissions();
  const userId = context.userId;
  const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);
  const {
    logs: moodHistory,
    addMoodLog,
    isLoading: loadingMoods,
  } = useMoodLogs(userId ?? undefined);
  const { forecasts, isLoading: loadingEnergy } = useEnergyForecast(userId ?? undefined);

  // Derived State
  const latestMood = moodHistory[0];

  // UI State
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
  const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const { decisions, isLoading: loadingDecisions } = useDecisionJournal(userId ?? undefined);

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodHistory} loading={loadingMoods} />
      <PrincipalPulse energy={null} decisions={decisions} loading={loadingDecisions} />
      <DecisionSection decisions={decisions} loading={loadingDecisions} />
    </VStack>
  );

  const handleMoodSelect = async (mood: Parameters<typeof addMoodLog>[0], note: string) => {
    setIsSavingMood(true);
    try {
      await addMoodLog(mood, note);
      setIsMoodPickerOpen(false);
    } finally {
      setIsSavingMood(false);
    }
  };

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <BaseSelfView
        perspective="principal"
        description={t('self.principalDescription')}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#F59E0B',
            content: holisticSection,
          },
          {
            id: 'pulse',
            title: 'Inner Pulse',
            accentColor: '#8B5CF6',
            features: [
              {
                id: 'pulse',
                label: 'Daily Pulse',
                content: <PulseDashboard onEnterDetails={() => {}} />,
              },
              {
                id: 'voice',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodHistory} loading={loadingMoods} />,
              },
            ],
          },
          {
            id: 'physical',
            title: 'Physical Sanctuary',
            accentColor: '#3B82F6', // Water/Blue
            features: [
              {
                id: 'mood_picker',
                label: 'Mood Tracking',
                content: (
                  <MoodPickerCard
                    isOpen={isMoodPickerOpen}
                    onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                    onSelect={handleMoodSelect}
                    isSaving={isSavingMood}
                    latestMood={latestMood}
                    isLoading={loadingMoods}
                    accent="water"
                  />
                ),
              },
              {
                id: 'energy_forecast',
                label: 'Energy Rhythm',
                content: (
                  <Box
                    style={{
                      padding: 24,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 16,
                    }}
                  >
                    <EnergyBarChart bars={forecasts.slice().reverse()} height={80} />
                  </Box>
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
            accentColor: '#10B981', // Moss/Teal
            features: [
              {
                id: 'decisions',
                label: 'Decision Journal',
                content: <DecisionJournalSection userId={userId} />,
              },
              {
                id: 'resonance',
                label: 'Resonance Patterns',
                content: (
                  <ResonancePatternCard
                    orientationSeeds={null}
                    moodLogs={moodHistory}
                    energyForecasts={forecasts}
                  />
                ),
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
                  <PositiveInvitation
                    context="self"
                    title={t('principal.monthlyComingSoon')}
                    description={t('principal.monthlyComingSoonDesc')}
                  />
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
