import { usePermissions, useStore } from '@repo/core/logic';

import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, VStack } from '@repo/ui/primitives';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '@/components/BaseSelfView';
import { EnergyBarChart } from '@/components/EnergyBarChart';
import { ImpactRipplesCard } from '@/components/ImpactRipplesCard';
// Role Components
import MoodLotus from '@/components/MoodLotus';
import { MoodPickerCard } from '@/components/MoodPickerCard';
import { PulseDashboard } from '@/components/PulseDashboard';
import ResonancePatternCard from '@/components/ResonancePatternCard';
import VoiceJournaling from '@/components/VoiceJournaling';
import { WarmMirrorCard } from '@/components/WarmMirrorCard';
import WelcomeModal from '@/components/WelcomeModal';
import { useEnergyForecast } from '@/hooks/useEnergyForecast';
import { useMoodLogs } from '@/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@/hooks/useWellbeingEnrichment';

export default function AdminSelfView() {
  const { t } = useTranslation();

  // State & Kernel Hooks
  const { context } = usePermissions();
  const userId = context.userId;
  const user = useStore((state) => state.user);
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
        perspective="admin"
        description={t('self.adminDescription')}
        domains={[
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
            ],
          },
          {
            id: 'physical',
            title: 'Physical Sanctuary',
            accentColor: '#F59E0B', // Earth/Amber
            features: [
              {
                id: 'mood-picker',
                label: 'Mood Tracking',
                content: (
                  <MoodPickerCard
                    isOpen={isMoodPickerOpen}
                    onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                    onSelect={handleMoodSelect}
                    isSaving={isSavingMood}
                    latestMood={latestMood}
                    isLoading={loadingMoods}
                    accent="earth"
                  />
                ),
              },
              {
                id: 'energy-forecast',
                label: 'Energy Rhythm',
                content: (
                  <Box className="p-6 bg-white/5 rounded-2xl">
                    <EnergyBarChart bars={forecasts.slice().reverse()} height={80} />
                  </Box>
                ),
              },
              {
                id: 'mood-lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'working',
            title: 'Working Rhythm',
            accentColor: '#10B981', // Moss/Teal
            features: [
              {
                id: 'resonance',
                label: 'Resonance Patterns',
                content: user ? (
                  <ResonancePatternCard
                    orientationSeeds={(user as any).orientation_seeds}
                    moodLogs={moodHistory}
                    energyForecasts={forecasts}
                  />
                ) : null,
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

export { AdminSelfView };
