import { usePermissions } from '@repo/core/logic';
import { useJourneyHistory, useNaturePaths, useStudentGoals } from '@repo/core/hooks';

import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '../../components/BaseSelfView';
import BreathGuide from '../../components/BreathGuide';
import FireJournal from '../../components/FireJournal';
import JoyJar from '../../components/JoyJar';
import MoodLotus from '../../components/MoodLotus';
import MyGradesView from '../../components/MyGradesView';
import RemindersManager from '../../components/RemindersManager';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import SleepTracker from '../../components/SleepTracker';
import StudentGoals from '../../components/StudentGoals';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import WisdomSeeds from '../../components/WisdomSeeds';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { GoalSection, JournalSection, MoodSection, NatureSection } from '../../views/sections';

export default function StudentSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;

  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const { logs: moodLogs, loading: loadingMoods } = useMoodLogs();
  const { goals, isLoading: loadingGoals } = useStudentGoals();
  const { paths, isLoading: loadingPaths } = useNaturePaths();
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
      <GoalSection goals={goals} loading={loadingGoals} />
      <NatureSection paths={paths} loading={loadingPaths} />
    </div>
  );

  return (
    <TemporalProvider>
      <BaseSelfView
        perspective="student"
        description={t('self.studentDesc', 'A steady space to grow your mind and heart.')}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#8B5CF6',
            content: holisticSection,
            historyContent: <ResonanceTimeline />,
          },
          {
            id: 'discovery',
            title: 'My Tools',
            accentColor: '#10B981',
            features: [
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={loadingMoods} />,
              },
              {
                id: 'goals',
                label: 'Growth Goals',
                content: <StudentGoals userId={userId ?? ''} />,
                historyContent: <GoalSection goals={goals} loading={loadingGoals} />,
              },
              { id: 'grades', label: 'My Grades', content: <MyGradesView /> },
              { id: 'breath', label: 'Breath Guide', content: <BreathGuide /> },
              { id: 'joy_jar', label: 'Joy Jar', content: <JoyJar /> },
              { id: 'wisdom', label: 'Wisdom Seeds', content: <WisdomSeeds /> },
              { id: 'sleep', label: 'Sleep Tracker', content: <SleepTracker /> },
              { id: 'fire_journal', label: 'Fire Journal', content: <FireJournal /> },
              { id: 'tomorrow', label: 'Tomorrow Prep', content: <TomorrowPrep /> },
              { id: 'voice', label: 'Voice Journal', content: <VoiceJournaling /> },
              { id: 'reminders', label: 'Reminders', content: <RemindersManager /> },
            ],
          },
        ]}
      />
    </TemporalProvider>
  );
}
