import { canonicalSelfFeatureId } from '@repo/self/constants/selfRegistry';
import EmptyState from '@repo/ui/components/EmptyState';
import { Sparkles } from '@repo/ui/icons';
import React from 'react';

// Lazy-loaded components for better performance
const MoodLotus = React.lazy(() => import('./MoodLotus'));
const FireJournal = React.lazy(() => import('./FireJournal'));
const WisdomSeeds = React.lazy(() => import('./WisdomSeeds'));
const DailyRhythm = React.lazy(() => import('./DailyRhythm'));
const SleepTracker = React.lazy(() => import('./SleepTracker'));
const JoyJar = React.lazy(() => import('./JoyJar'));
const TomorrowPrep = React.lazy(() => import('./TomorrowPrep'));
const VoiceJournaling = React.lazy(() => import('./VoiceJournaling'));
const RemindersManager = React.lazy(() => import('./RemindersManager'));
const ReframeWizard = React.lazy(() => import('./ReframeWizard'));

/**
 * FeatureRegistry - The central hub for mapping feature IDs to their actual UI components.
 * This ensures that adding a new capability only requires a single update here.
 */
export const FEATURE_COMPONENT_MAP: Record<
  string,
  (props: { userId?: string }) => React.ReactElement
> = {
  mood_lotus: (props) => <MoodLotus {...props} />,
  fire_journal: (props) => <FireJournal {...props} />,
  wisdom_seeds: (props) => <WisdomSeeds {...props} />,
  study_rhythm: () => <DailyRhythm />,
  daily_rhythm: () => <DailyRhythm />,
  sleep_tracker: (props) => <SleepTracker {...props} />,
  joy_jar: (props) => <JoyJar {...props} />,
  tomorrow_prep: (props) => <TomorrowPrep {...props} />,
  voice_journal: (props) => <VoiceJournaling {...props} />,
  reminders: (props) => <RemindersManager {...props} />,
  reframe: (props) => <ReframeWizard {...props} />,
};

/**
 * Helper to resolve a feature's content.
 */
export function resolveFeatureContent(id: string, userId?: string) {
  const Renderer = FEATURE_COMPONENT_MAP[canonicalSelfFeatureId(id)];
  if (!Renderer) {
    return (
      <EmptyState
        icon={<Sparkles size={48} />}
        title="This feature is not available here"
        description="The current role does not have a readable surface for this capability yet."
      />
    );
  }

  return (
    <React.Suspense fallback={null}>
      <Renderer userId={userId} />
    </React.Suspense>
  );
}
