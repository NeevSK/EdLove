import { useBanyanGrowth, useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore, useTemporalStore } from '@repo/core/logic';
import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { MessageSquare, Users } from '@repo/ui/icons';
import { Icon } from '@repo/ui/primitives';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import DailyRhythm from '@repo/self/components/DailyRhythm';
import DecisionJournalSection from '@repo/self/components/DecisionJournalSection';
import FireJournal from '@repo/self/components/FireJournal';
import GratitudeGlimmers from '@repo/self/components/GratitudeGlimmers';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
import JoyJar from '@repo/self/components/JoyJar';
import MoodLotus from '@repo/self/components/MoodLotus';
import { MoodPickerCard } from '@repo/self/components/MoodPickerCard';
import { PulseDashboard } from '@repo/self/components/PulseDashboard';
import RemindersManager from '@repo/self/components/RemindersManager';
import { ResonanceTimeline } from '@repo/self/components/ResonanceTimeline';
import SleepTracker from '@repo/self/components/SleepTracker';
import { SpotlightEmpty } from '@repo/self/components/SpotlightEmpty';
import TeachingHistoryTimeline from '@repo/self/components/TeachingHistoryTimeline';
import TomorrowPrep from '@repo/self/components/TomorrowPrep';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
import WelcomeModal from '@repo/self/components/WelcomeModal';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { JournalSection, MoodSection, TeacherPulse } from '@repo/self/views/sections';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';

export default function TeacherSelfView() {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
  const { context } = usePermissions();
  const userId = context.userId;
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);
  const [isSavingMood, setIsSavingMood] = useState(false);
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
        isOpen={isMoodPickerOpen}
        onToggle={() => setIsMoodPickerOpen((open) => !open)}
        onSelect={async (mood: Parameters<typeof addMoodLog>[0], note: string) => {
          if (isSavingMood) return;
          setIsSavingMood(true);
          try {
            await addMoodLog(mood, note || undefined);
            setIsMoodPickerOpen(false);
          } catch {
            showToast({
              message: 'Your mood could not be saved. Please try again.',
              type: 'error',
            });
          } finally {
            setIsSavingMood(false);
          }
        }}
        isSaving={isSavingMood}
        isDisabled={isSavingMood}
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
          <a className="sidebar-item" href="#professional_history">
            <Icon as={Users} size={16} /> <span>Educational Ecology</span>
          </a>
          <a className="sidebar-item" href="#decisions">
            <Icon as={MessageSquare} size={16} /> <span>Faculty Resonance</span>
          </a>
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
        description={t('self.teacherDesc')}
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
                id: 'daily_pulse',
                label: 'Daily Pulse',
                content: <PulseDashboard />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
              },
              {
                id: 'wisdom_seeds',
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
                id: 'voice_journal',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
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
                id: 'sleep_tracker',
                label: 'Sleep Tracker',
                content: <SleepTracker userId={userId ?? undefined} />,
              },
              {
                id: 'wind_down_ritual',
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
                content: <DecisionJournalSection userId={userId ?? ''} />,
              },
              {
                id: 'professional_history',
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
