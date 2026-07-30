import { useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { VStack } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';

import { BaseSelfView } from '@self/components/BaseSelfView';
import DailyRhythm from '@self/components/DailyRhythm';
import FireJournal from '@self/components/FireJournal';
import GratitudeGlimmers from '@self/components/GratitudeGlimmers';
import { ImpactRipplesCard } from '@self/components/ImpactRipplesCard';
import JoyJar from '@self/components/JoyJar';
import MoodLotus from '@self/components/MoodLotus';
import RemindersManager from '@self/components/RemindersManager';
import SleepTracker from '@self/components/SleepTracker';
import TomorrowPrep from '@self/components/TomorrowPrep';
import VoiceJournaling from '@self/components/VoiceJournaling';
import { WarmMirrorCard } from '@self/components/WarmMirrorCard';
import WelcomeModal from '@self/components/WelcomeModal';
import WisdomSeeds from '@self/components/WisdomSeeds';
import { useJournalEntries } from '@self/hooks/useJournalEntries';
import { useMoodLogs } from '@self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@self/hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection } from '@self/views/sections';

export default function GuardianSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;
  const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

  const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);
  const { logs: moodLogs, loading: loadingMoods } = useMoodLogs(userId ?? undefined);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const {
    events: journeyEvents,
    holisticView,
    isLoading: journeyLoading,
    currentScale: viewScale,
  } = useJourneyHistory();

  const holisticSection = (
    <VStack space="lg" style={{ padding: 20 }}>
      <JourneyHistoryCard
        events={journeyEvents}
        summary={holisticView.summary}
        loading={journeyLoading}
        scale={viewScale === 'custom' ? 'day' : viewScale}
      />
      <JournalSection entries={journalEntries} loading={loadingJournals} />
      <MoodSection logs={moodLogs} loading={loadingMoods} />
    </VStack>
  );

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <BaseSelfView
        perspective="guardian"
        description={t('self.guardianDescription')}
        domains={[
          {
            id: 'journey',
            title: 'Family Journey',
            accentColor: '#8B5CF6',
            content: holisticSection,
          },
          {
            id: 'presence',
            title: 'Inner Presence',
            accentColor: '#10B981',
            features: [
              {
                id: 'mood-lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />,
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
                id: 'voice',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'wisdom',
                label: 'Wisdom Seeds',
                content: <WisdomSeeds userId={userId ?? undefined} />,
              },
            ],
          },
          {
            id: 'care',
            title: 'Care Rhythm',
            accentColor: '#F59E0B',
            features: [
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
              { id: 'rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
              {
                id: 'sleep',
                label: 'Sleep Tracker',
                content: <SleepTracker userId={userId ?? undefined} />,
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
