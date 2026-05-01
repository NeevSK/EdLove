import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '@repo/core/logic';
import { useBanyanGrowth, useJourneyHistory } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';

import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import { VStack } from '@repo/ui/primitives';
import { useTheme } from '@repo/ui/primitives';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import DailyRhythm from '../../components/DailyRhythm';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import FireJournal from '../../components/FireJournal';
import GratitudeGlimmers from '../../components/GratitudeGlimmers';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import JoyJar from '../../components/JoyJar';

// Legacy/Role Components
import MoodLotus from '../../components/MoodLotus';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { PulseDashboard } from '../../components/PulseDashboard';
import RemindersManager from '../../components/RemindersManager';
import SleepTracker from '../../components/SleepTracker';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import WelcomeModal from '../../components/WelcomeModal';
import WindDownRitual from '../../components/WindDownRitual';
import WisdomSeeds from '../../components/WisdomSeeds';
import { useEnergyForecast } from '../../hooks/useEnergyForecast';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection, TeacherPulse } from '../../views/sections';

export default function TeacherSelfView() {
  const { t } = useTranslation();
  const _navigation = useNavigation<any>();
  const _colors = useTheme().scene;

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

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodHistory} loading={loadingMoods} />
      <TeacherPulse banyan={banyan} loading={banyanLoading} />
    </VStack>
  );

  const handleMoodSelect = async (mood: any, note: string) => {
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
        description={t('self.teacherDescription', 'Refine your craft, nurture your spirit.')}
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
                id: 'pulse',
                label: 'Daily Pulse',
                content: <PulseDashboard onEnterDetails={() => {}} />,
              },
              {
                id: 'mood-lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodHistory} loading={loadingMoods} />,
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
                id: 'fire-journal',
                label: 'Fire Journal',
                content: <FireJournal userId={userId ?? undefined} />,
                historyContent: (
                  <JournalSection entries={journalEntries} loading={loadingJournals} />
                ),
              },
              {
                id: 'voice',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
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
                  />
                ),
              },
              {
                id: 'joy-jar',
                label: 'Joy Jar',
                content: <JoyJar userId={userId ?? undefined} />,
              },
              {
                id: 'gratitude',
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
                id: 'wind-down',
                label: 'Restorative Ritual',
                content: <WindDownRitual userId={userId ?? undefined} />,
              },
              {
                id: 'sleep',
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
                id: 'daily-rhythm',
                label: 'Working Pace',
                content: <DailyRhythm />,
              },
              {
                id: 'tomorrow',
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
