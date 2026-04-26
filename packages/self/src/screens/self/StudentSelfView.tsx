import { useNavigation } from '@react-navigation/native';
import { useJourneyHistory, usePermissions, useStore } from '@repo/core';
import { Box, ScreenWrapper, useTheme, useThemedColors, VStack } from '@repo/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
// Kernel Imports from @repo/self (Breaking require cycle)
import { BaseSelfView } from '../../components/BaseSelfView';
import BreathGuide from '../../components/BreathGuide';
import DailyRhythm from '../../components/DailyRhythm';
import { EnergyBarChart } from '../../components/EnergyBarChart';
import FireJournal from '../../components/FireJournal';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import JoyJar from '../../components/JoyJar';
// Role Components
import MoodLotus from '../../components/MoodLotus';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import MyGradesView from '../../components/MyGradesView';
import ProgressTree from '../../components/ProgressTree';
import { PulseDashboard } from '../../components/PulseDashboard';
import RemindersManager from '../../components/RemindersManager';
import SleepTracker from '../../components/SleepTracker';
import StudentGoals from '../../components/StudentGoals';
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
import {
  GoalSection,
  IdentitySection,
  JournalSection,
  MoodSection,
  NatureSection,
  TeacherFeedbackSection,
} from '../../views/sections';

export default function StudentSelfView() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const colors = useTheme().scene;

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
  const { events: journeyEvents, holisticView, isLoading: journeyLoading } = useJourneyHistory();

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodHistory} loading={loadingMoods} />
      <GoalSection goals={[]} loading={false} />
      <NatureSection paths={null} loading={false} />
      <IdentitySection />
      <TeacherFeedbackSection />
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
        perspective="student"
        description={t('self.studentDescription', 'A steady space to grow your mind and heart.')}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#8B5CF6',
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
            id: 'growth',
            title: 'Growth Sanctuary',
            accentColor: '#10B981',
            features: [
              {
                id: 'goals',
                label: 'Growth Goals',
                content: <StudentGoals userId={userId ?? ''} />,
                historyContent: <GoalSection goals={[]} loading={false} />,
              },
              {
                id: 'progress',
                label: 'Growth Tree',
                content: <ProgressTree userId={userId ?? undefined} />,
              },
              {
                id: 'grades',
                label: 'Academic Mirror',
                content: <MyGradesView userId={userId ?? undefined} />,
              },
              {
                id: 'breath',
                label: 'Breath Guide',
                content: <BreathGuide />,
              },
            ],
          },
          {
            id: 'care',
            title: 'Care & Rhythm',
            accentColor: '#F59E0B',
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
                    accent="light"
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
            id: 'reflection',
            title: 'Reflection Tools',
            accentColor: '#EF4444',
            features: [
              {
                id: 'daily-rhythm',
                label: 'Working Pace',
                content: <DailyRhythm />,
              },
              {
                id: 'joy-jar',
                label: 'Joy Jar',
                content: <JoyJar userId={userId ?? undefined} />,
              },
              {
                id: 'fire-journal',
                label: 'Fire Journal',
                content: <FireJournal userId={userId ?? undefined} />,
                historyContent: (
                  <JournalSection entries={journalEntries} loading={loadingJournals} />
                ),
              },
              {
                id: 'tomorrow',
                label: 'Tomorrow Prep',
                content: <TomorrowPrep userId={userId ?? undefined} />,
              },
              {
                id: 'voice',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'reminders',
                label: 'Reminders',
                content: <RemindersManager userId={userId ?? undefined} />,
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
