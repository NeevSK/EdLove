import { useJourneyHistory, usePermissions } from '@repo/core';
import { JourneyHistoryCard, TemporalProvider, TemporalShield } from '@repo/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '../../components/BaseSelfView';
import DailyRhythm from '../../components/DailyRhythm';
import FireJournal from '../../components/FireJournal';
import GratitudeGlimmers from '../../components/GratitudeGlimmers';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import JoyJar from '../../components/JoyJar';
import MoodLotus from '../../components/MoodLotus';
import RemindersManager from '../../components/RemindersManager';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import SleepTracker from '../../components/SleepTracker';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import WisdomSeeds from '../../components/WisdomSeeds';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection } from '../../views/sections';

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
        description={t(
          'self.guardianDescription',
          'A steady sanctuary for parents and guardians to stay centered while caring for their children.',
        )}
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
              { id: 'joy_jar', label: 'Joy Jar', content: <JoyJar userId={userId ?? undefined} /> },
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
              { id: 'daily_rhythm', label: 'Daily Rhythm', content: <DailyRhythm /> },
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
