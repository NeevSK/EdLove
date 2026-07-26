import { useBanyanGrowth, useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { useTranslation } from 'react-i18next';

import { BaseSelfView } from '@/components/BaseSelfView';
import DailyRhythm from '@/components/DailyRhythm';
import FireJournal from '@/components/FireJournal';
import JoyJar from '@/components/JoyJar';
import MoodLotus from '@/components/MoodLotus';
import SleepTracker from '@/components/SleepTracker';
import TomorrowPrep from '@/components/TomorrowPrep';
import VoiceJournaling from '@/components/VoiceJournaling';
import WelcomeModal from '@/components/WelcomeModal';
import WisdomSeeds from '@/components/WisdomSeeds';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useMoodLogs } from '@/hooks/useMoodLogs';
import { useSanctuaryRegistry } from '@/hooks/useSanctuaryRegistry';
import { JournalSection, MoodSection, StudentPulse } from '@/views/sections';

export default function StudentSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;

  const { domains: registeredDomains } = useSanctuaryRegistry();

  const { logs: moodLogs, loading: moodLoading } = useMoodLogs();
  const { entries: journalEntries, loading: journalLoading } = useJournalEntries();
  const { banyan, isLoading: banyanLoading } = useBanyanGrowth();
  const { holisticView, isLoading: journeyLoading } = useJourneyHistory();

  const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

  const domainContent = registeredDomains.map((domain) => {
    const features = domain.features.map((fId) => {
      switch (fId) {
        case 'daily_pulse':
          return {
            id: fId,
            label: 'Inner Pulse',
            content: <StudentPulse banyan={banyan} loading={banyanLoading} />,
          };
        case 'mood_lotus':
          return {
            id: fId,
            label: 'Mood Lotus',
            content: <MoodLotus userId={userId ?? undefined} />,
            historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
          };
        case 'wisdom_seeds':
          return {
            id: fId,
            label: 'Wisdom Seeds',
            content: <WisdomSeeds userId={userId ?? undefined} />,
          };
        case 'study_rhythm':
          return { id: fId, label: 'Study Rhythm', content: <DailyRhythm /> };
        case 'sleep_tracker':
          return {
            id: fId,
            label: 'Sleep Tracker',
            content: <SleepTracker userId={userId ?? undefined} />,
          };
        case 'joy_jar':
          return { id: fId, label: 'Joy Jar', content: <JoyJar userId={userId ?? undefined} /> };
        case 'fire_journal':
          return {
            id: fId,
            label: 'Fire Journal',
            content: <FireJournal userId={userId ?? undefined} />,
            historyContent: <JournalSection entries={journalEntries} loading={journalLoading} />,
          };
        case 'voice_journal':
          return {
            id: fId,
            label: 'Voice Journal',
            content: <VoiceJournaling userId={userId ?? undefined} />,
          };
        case 'tomorrow_prep':
          return {
            id: fId,
            label: 'Tomorrow Prep',
            content: <TomorrowPrep userId={userId ?? undefined} />,
          };
        default:
          return { id: fId, label: fId, content: null };
      }
    });
    return { ...domain, features };
  });

  return (
    <>
      <BaseSelfView
        perspective="student"
        description={t('self.studentDesc')}
        domains={domainContent as any}
      />
      <WelcomeModal
        isOpen={justFinishedOnboarding}
        onClose={() => setJustFinishedOnboarding(false)}
      />
    </>
  );
}
