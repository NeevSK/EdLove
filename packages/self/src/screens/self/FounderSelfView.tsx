import { useJourneyHistory } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';
import { useUIStore } from '@repo/core/store/useUIStore';
// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import { EnergyBarChart } from '@repo/self/components/EnergyBarChart';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
// Role Components
import MoodLotus from '@repo/self/components/MoodLotus';
import { MoodPickerCard } from '@repo/self/components/MoodPickerCard';
import { PulseDashboard } from '@repo/self/components/PulseDashboard';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
import WelcomeModal from '@repo/self/components/WelcomeModal';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useEnergyForecast } from '@repo/self/hooks/useEnergyForecast';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { useWisdom } from '@repo/self/hooks/useWisdom';
import {
  JournalSection,
  MoodSection,
  PhilosophySection,
  VisionSection,
} from '@repo/self/views/sections';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box, VStack } from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FounderSelfView() {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();

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
  const justFinishedOnboarding = useUIStore((state) => state.justFinishedOnboarding);
  const setJustFinishedOnboarding = useUIStore((state) => state.setJustFinishedOnboarding);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom();
  const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodHistory} loading={loadingMoods} />
      <VisionSection />
      <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
    </VStack>
  );

  const handleMoodSelect = async (mood: Parameters<typeof addMoodLog>[0], note: string) => {
    setIsSavingMood(true);
    try {
      await addMoodLog(mood, note);
      setIsMoodPickerOpen(false);
    } catch {
      showToast({ message: 'Your mood could not be saved. Please try again.', type: 'error' });
    } finally {
      setIsSavingMood(false);
    }
  };

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <BaseSelfView
        perspective="founder"
        description={t('self.founderDescription')}
        domains={[
          {
            id: 'journey',
            title: 'Ecosystem Journey',
            accentColor: '#FBBF24',
            content: holisticSection,
          },
          {
            id: 'pulse',
            title: 'Ecosystem Pulse',
            accentColor: '#8B5CF6',
            features: [
              {
                id: 'pulse',
                label: 'Ecosystem Dash',
                content: <PulseDashboard />,
              },
              {
                id: 'voice_journal',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodHistory} loading={loadingMoods} />,
              },
              {
                id: 'wisdom_seeds',
                label: 'Wisdom Seeds',
                content: <WisdomSeeds userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'physical',
            title: 'Physical Rhythm',
            accentColor: '#3B82F6',
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
                    accent="dark"
                  />
                ),
              },
              {
                id: 'energy-forecast',
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
                id: 'vision',
                label: 'Vision Alignment',
                content: <VisionSection />,
              },
              {
                id: 'philosophy',
                label: 'Philosophical Anchors',
                content: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />,
              },
              {
                id: 'monthly',
                label: 'Monthly Reflection',
                content: (
                  <PositiveInvitation
                    context="self"
                    title={t('founder.visionComingSoon')}
                    description={t('founder.visionComingSoonDesc')}
                  />
                ),
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
