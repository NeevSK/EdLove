import { useJourneyHistory } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import { ImpactRipplesCard } from '@repo/self/components/ImpactRipplesCard';
import MoodLotus from '@repo/self/components/MoodLotus';
import { MoodPickerCard } from '@repo/self/components/MoodPickerCard';
import { PulseDashboard } from '@repo/self/components/PulseDashboard';
import { ResonanceTimeline } from '@repo/self/components/ResonanceTimeline';
import VoiceJournaling from '@repo/self/components/VoiceJournaling';
import { WarmMirrorCard } from '@repo/self/components/WarmMirrorCard';
import WelcomeModal from '@repo/self/components/WelcomeModal';
import WisdomSeeds from '@repo/self/components/WisdomSeeds';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useWellbeingEnrichment } from '@repo/self/hooks/useWellbeingEnrichment';
import { useWisdom } from '@repo/self/hooks/useWisdom';
import { MoodSection, PhilosophySection, VisionSection } from '@repo/self/views/sections';
import { JourneyHistoryCard } from '@repo/ui/components/JourneyHistoryCard';
import { TemporalProvider } from '@repo/ui/components/TemporalProvider';
import { TemporalShield } from '@repo/ui/components/TemporalShield';
import { Lightbulb, Sparkles } from '@repo/ui/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FounderSelfView() {
  const { t } = useTranslation();

  const { context } = usePermissions();
  const { userId } = context;
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);

  const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);
  const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

  const { logs: moodLogs, loading: moodLoading, addMoodLog } = useMoodLogs();
  useJournalEntries();
  const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom();
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
      <TemporalShield label="ECOSYSTEM VISION">
        <VisionSection />
      </TemporalShield>
      <TemporalShield label="PHILOSOPHICAL ANCHORS">
        <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />
      </TemporalShield>
    </div>
  );

  const sideBar = (
    <>
      <MoodPickerCard
        isOpen={isMoodPickerOpen}
        onToggle={() => setIsMoodPickerOpen((open) => !open)}
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
          Ecosystem Flux
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a className="sidebar-item" href="#vision_lab">
            <Sparkles size={16} /> <span>Vision Alignment</span>
          </a>
          <a className="sidebar-item" href="#philosophy_lab">
            <Lightbulb size={16} /> <span>Philosophy Lab</span>
          </a>
        </div>
      </div>
      <ImpactRipplesCard ripples={ripples} />
      <WarmMirrorCard text={warmMirrorText ?? 'Your vision is the horizon of this ecology.'} />
    </>
  );

  return (
    <TemporalProvider>
      <BaseSelfView
        perspective="founder"
        description={t('self.founderDesc')}
        domains={[
          {
            id: 'journey',
            title: 'Ecosystem Overview',
            accentColor: '#FBBF24',
            content: holisticSection,
            historyContent: <ResonanceTimeline />,
          },
          {
            id: 'tools',
            title: 'Visionary Tools',
            accentColor: '#8B5CF6',
            features: [
              {
                id: 'vision_lab',
                label: 'Vision Lab',
                content: <VisionSection />,
              },
              {
                id: 'philosophy_lab',
                label: 'Philosophy Lab',
                content: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />,
                historyContent: <PhilosophySection wisdom={wisdomNotes} loading={wisdomLoading} />,
              },
              {
                id: 'daily_pulse',
                label: 'Global Dash',
                content: <PulseDashboard />,
              },
              {
                id: 'mood_lotus',
                label: 'Mood Lotus',
                content: <MoodLotus userId={userId ?? undefined} />,
                historyContent: <MoodSection logs={moodLogs} loading={moodLoading} />,
              },
              {
                id: 'voice_journal',
                label: 'Voice Journal',
                content: <VoiceJournaling userId={userId ?? undefined} />,
              },
              {
                id: 'wisdom_seeds',
                label: 'Wisdom Seeds',
                content: <WisdomSeeds userId={userId ?? undefined} />,
              },
              {
                id: 'monthly_reflection',
                label: 'Monthly Reflection',
                content: (
                  <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        marginBottom: '10px',
                        color: 'var(--ink)',
                      }}
                    >
                      {t('founder.visionComingSoon')}
                    </h3>
                    <p
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: 'var(--ink-ghost)',
                      }}
                    >
                      {t('founder.visionComingSoonDesc')}
                    </p>
                  </div>
                ),
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
