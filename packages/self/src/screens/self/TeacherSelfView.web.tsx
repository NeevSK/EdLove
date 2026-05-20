import { useBanyanGrowth, useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { Icon } from '@repo/ui/primitives';

import { MessageSquare, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '../../components/BaseSelfView';
import DailyRhythm from '../../components/DailyRhythm';
import DecisionJournalSection from '../../components/DecisionJournalSection';
import FireJournal from '../../components/FireJournal';
import GratitudeGlimmers from '../../components/GratitudeGlimmers';
import { ImpactRipplesCard } from '../../components/ImpactRipplesCard';
import JoyJar from '../../components/JoyJar';
import MoodLotus from '../../components/MoodLotus';
import { MoodPickerCard } from '../../components/MoodPickerCard';
import { PulseDashboard } from '../../components/PulseDashboard';
import RemindersManager from '../../components/RemindersManager';
import { ResonanceTimeline } from '../../components/ResonanceTimeline';
import SleepTracker from '../../components/SleepTracker';
import { SpotlightEmpty } from '../../components/SpotlightEmpty';
import TeachingHistoryTimeline from '../../components/TeachingHistoryTimeline';
import TomorrowPrep from '../../components/TomorrowPrep';
import VoiceJournaling from '../../components/VoiceJournaling';
import { WarmMirrorCard } from '../../components/WarmMirrorCard';
import WelcomeModal from '../../components/WelcomeModal';
import WisdomSeeds from '../../components/WisdomSeeds';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { useMoodLogs } from '../../hooks/useMoodLogs';
import { useWellbeingEnrichment } from '../../hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection, TeacherPulse } from '../../views/sections';

export default function TeacherSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;
  const { viewDate } = useTemporalStore();
  const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);
  const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

  const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
  const { entries: journalEntries, loading: journalLoading } = useJournalEntries();
  const { banyan, isLoading: banyanLoading } = useBanyanGrowth();
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
        scale={viewScale === 'custom' ? 'day' : viewScale}
      />
      <TeacherPulse banyan={banyan} loading={banyanLoading} />
      <TemporalShield label="JOURNAL HISTORY">
        <JournalSection entries={journalEntries} loading={journalLoading} />
      </TemporalShield>
      <TemporalShield label="MOOD HISTORY">
        <MoodSection logs={moodLogs} loading={moodLoading} />
      </TemporalShield>
    </div>
  );

  const sideBar = (
    <>
      <MoodPickerCard
        isOpen={false}
        onToggle={() => {}}
        onSelect={async (mood: Parameters<typeof addMoodLog>[0], note: string) => {
          await addMoodLog(mood, note || undefined);
        }}
        isSaving={false}
        isDisabled={false}
        latestMood={moodLogs[0]}
        isLoading={moodLoading}
        accent="dark"
      />
      <div className="sanctuary-card" style={{ padding: '24px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '800',
            textTransform: 'uppercase',
            color: 'var(--ink-ghost)',
            marginBottom: '16px',
          }}
        >
          Professional Ecology
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="sidebar-item" onClick={() => {}}>
            <Icon as={Users} size={16} /> <span>Educational Ecology</span>
          </button>
          <button className="sidebar-item" onClick={() => {}}>
            <Icon as={MessageSquare} size={16} /> <span>Faculty Resonance</span>
          </button>
        </div>
      </div>
      <ImpactRipplesCard ripples={ripples} />
      <WarmMirrorCard text={warmMirrorText ?? 'Your presence is the root of this sanctuary.'} />
    </>
  );

  return (
    <TemporalProvider>
      <BaseSelfView
        perspective="teacher"
        description={t(
          'self.teacherDesc',
          'Radiate clarity from the center of your instructional practice.',
        )}
        domains={[
          {
            id: 'journey',
            title: 'Journey Overview',
            accentColor: '#10B981',
            content: holisticSection,
            historyContent: <ResonanceTimeline />,
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
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
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
                  <JournalSection entries={journalEntries} loading={journalLoading} />
                ),
              },
              {
                id: 'voice',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
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
            ],
          },
          {
            id: 'physical',
            title: 'Physical Rhythm',
            accentColor: '#F59E0B',
            features: [
              {
                id: 'sleep',
                label: 'Sleep Tracker',
                content: <SleepTracker userId={userId ?? undefined} />,
              },
              {
                id: 'wind_down',
                label: 'Restorative Ritual',
                content: <SpotlightEmpty date={viewDate} />,
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
                label: 'Daily Rhythm',
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
                content: <DecisionJournalSection userId={userId ?? ''} />,
              },
              {
                id: 'history',
                label: 'Professional History',
                content: <TeachingHistoryTimeline userId={userId ?? ''} />,
              },
            ],
          },
        ]}
        sideBar={sideBar}
      />
      <WelcomeModal
        isOpen={justFinishedOnboarding}
        onClose={() => setJustFinishedOnboarding(false)}
      />
    </TemporalProvider>
  );
}
