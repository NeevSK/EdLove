import { useBanyanGrowth, useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';

import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import type {
  DerivedHistoryEntry,
  DerivedHistoryPoint,
} from '@repo/ui/components/DerivedHistoryView';
import { Box, VStack } from '@repo/ui/primitives';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import DailyRhythm from '@repo/self/components/DailyRhythm';
import DecisionJournalSection from '@repo/self/components/DecisionJournalSection';
import { EnergyBarChart } from '@repo/self/components/EnergyBarChart';
import FireJournal from '@repo/self/components/FireJournal';
import GratitudeGlimmers from '@repo/self/components/GratitudeGlimmers';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
import JoyJar from '@repo/self/components/JoyJar';

// Legacy/Role Components
import MoodLotus from '@repo/self/components/MoodLotus';
import { MoodPickerCard } from '@repo/self/components/MoodPickerCard';
import { PulseDashboard } from '@repo/self/components/PulseDashboard';
import RemindersManager from '@repo/self/components/RemindersManager';
import SleepTracker from '@repo/self/components/SleepTracker';
import TeachingHistoryTimeline from '@repo/self/components/TeachingHistoryTimeline';
import TomorrowPrep from '@repo/self/components/TomorrowPrep';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
import WelcomeModal from '@repo/self/components/WelcomeModal';
import WindDownRitual from '@repo/self/components/WindDownRitual';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useEnergyForecast } from '@repo/self/hooks/useEnergyForecast';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection, TeacherPulse } from '@repo/self/views/sections';

export default function TeacherSelfView() {
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
  const [_isPulseDashboardOpen, _setIsPulseDashboardOpen] = useState(true);
  const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();
  const { banyan, isLoading: banyanLoading } = useBanyanGrowth();

  const moodHistoryPoints: DerivedHistoryPoint[] = moodHistory
    .slice(0, 7)
    .reverse()
    .map((log) => ({
      id: log.id,
      label: new Date(log.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
      value: log.mood_score * 20,
      detail: log.mood,
    }));
  const moodHistoryEntries: DerivedHistoryEntry[] = moodHistory.slice(0, 10).map((log) => ({
    id: log.id,
    title: log.mood ? `${log.mood} mood` : 'Mood check-in',
    timestamp: new Date(log.created_at).toLocaleDateString(),
    description: log.note,
    kind: 'reflection',
  }));

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodHistory} loading={loadingMoods} />
      <TeacherPulse banyan={banyan} loading={banyanLoading} />
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
        perspective="teacher"
        description={t('self.teacherDescription')}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#10B981',
            content: holisticSection,
          },
          {
            id: 'pulse',
            title: 'Inner Pulse',
            accentColor: '#8B5CF6',
            features: [
              {
                id: 'daily_pulse',
                label: 'Daily Pulse',
                content: <PulseDashboard />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodHistory} loading={loadingMoods} />,
                temporalView: {
                  summary: latestMood?.mood ? `Latest: ${latestMood.mood}` : 'Mood history',
                  points: moodHistoryPoints,
                  entries: moodHistoryEntries,
                  emptyHistoryLabel: 'Log a mood to begin your personal history.',
                },
              },
              {
                id: 'wisdom',
                label: 'Wisdom Seeds',
                content: <WisdomSeeds userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'personal',
            title: 'Personal Sanctuary',
            accentColor: '#EF4444',
            features: [
              {
                id: 'fire_journal',
                label: 'Fire Journal',
                content: <FireJournal userId={userId ?? undefined} />,
                historyContent: (
                  <JournalSection entries={journalEntries} loading={loadingJournals} />
                ),
              },
              {
                id: 'voice_journal',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'mood_checkin',
                label: 'Mood Tracking',
                content: (
                  <MoodPickerCard
                    isOpen={isMoodPickerOpen}
                    onToggle={() => setIsMoodPickerOpen(!isMoodPickerOpen)}
                    onSelect={handleMoodSelect}
                    isSaving={isSavingMood}
                    latestMood={latestMood}
                    isLoading={loadingMoods}
                  />
                ),
              },
              {
                id: 'joy_jar',
                label: 'Joy Jar',
                content: <JoyJar userId={userId ?? undefined} />,
              },
              {
                id: 'gratitude_glimmers',
                label: 'Gratitude Glimmers',
                content: <GratitudeGlimmers userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'physical',
            title: 'Physical Rhythm',
            accentColor: '#F59E0B',
            features: [
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
                id: 'wind_down_ritual',
                label: 'Restorative Ritual',
                content: <WindDownRitual userId={userId ?? undefined} />,
              },
              {
                id: 'sleep_tracker',
                label: 'Sleep Tracker',
                content: <SleepTracker userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'working',
            title: 'Working Rhythm',
            accentColor: '#10B981',
            features: [
              {
                id: 'daily_rhythm',
                label: 'Working Pace',
                content: <DailyRhythm />,
              },
              {
                id: 'tomorrow_prep',
                label: 'Tomorrow Prep',
                content: <TomorrowPrep userId={userId ?? undefined} />,
              },
              {
                id: 'reminders',
                label: 'Reminders',
                content: <RemindersManager userId={userId ?? undefined} />,
              },
              {
                id: 'decisions',
                label: 'Decision Journal',
                content: <DecisionJournalSection userId={userId} />,
              },
              {
                id: 'professional_history',
                label: 'Professional History',
                content: <TeachingHistoryTimeline userId={userId ?? ''} />,
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
