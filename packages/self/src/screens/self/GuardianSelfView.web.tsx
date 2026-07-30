import { useJourneyHistory } from '@repo/core/hooks';
import { usePermissions } from '@repo/core/logic';

import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import DailyRhythm from '@repo/self/components/DailyRhythm';
import FireJournal from '@repo/self/components/FireJournal';
import GratitudeGlimmers from '@repo/self/components/GratitudeGlimmers';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
import JoyJar from '@repo/self/components/JoyJar';
import MoodLotus from '@repo/self/components/MoodLotus';
import RemindersManager from '@repo/self/components/RemindersManager';
import { ResonanceTimeline } from '@repo/self/components/ResonanceTimeline';
import SleepTracker from '@repo/self/components/SleepTracker';
import TomorrowPrep from '@repo/self/components/TomorrowPrep';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection } from '@repo/self/views/sections';

export default function GuardianSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <JourneyHistoryCard
        events={journeyEvents}
        summary={holisticView.summary}
        loading={journeyLoading}
        scale={viewScale as any}
      />
      <TemporalShield label="JOURNAL HISTORY">
        <JournalSection entries={journalEntries} loading={loadingJournals} />
      </TemporalShield>
      <TemporalShield label="MOOD HISTORY">
        <MoodSection logs={moodLogs} loading={loadingMoods} />
      </TemporalShield>
    </div>
  );

  return (
    <TemporalProvider>
      <BaseSelfView
        perspective="guardian"
        description={t('self.guardianDescription')}
        domains={[
          {
            id: 'journey',
            title: 'Family Journey',
            accentColor: '#8B5CF6',
            content: holisticSection,
            historyContent: <ResonanceTimeline />,
          },
          {
            id: 'presence',
            title: 'Inner Presence',
            accentColor: '#10B981',
            features: [
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />,
              },
              {
                id: 'fire_journal',
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
                id: 'joy_jar',
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
              {
                id: 'daily_rhythm',
                label: 'Daily Rhythm',
                content: <DailyRhythm />,
              },
              {
                id: 'sleep',
                label: 'Sleep Tracker',
                content: <SleepTracker userId={userId ?? undefined} />,
              },
            ],
          },
        ]}
        sideBar={
          <>
            <WarmMirrorCard text={warmMirrorText} />
            <ImpactRipplesCard ripples={ripples} />
          </>
        }
      />
    </TemporalProvider>
  );
}
