import type { SelfViewFeature } from '@repo/self/components/BaseSelfView.types';

const CALM_FEATURE_LABELS: Record<string, string> = {
  daily_pulse: 'Pulse',
  mood_lotus: 'Mood',
  mood_checkin: 'Check in',
  wisdom_seeds: 'Wisdom',
  fire_journal: 'Release',
  voice_journal: 'Voice note',
  gratitude_glimmers: 'Gratitude',
  joy_jar: 'Joy',
  sleep_tracker: 'Sleep',
  daily_rhythm: 'Rhythm',
  tomorrow_prep: 'Tomorrow',
  professional_history: 'Work history',
  decisions: 'Decisions',
  reminders: 'Reminders',
};

export function getCalmFeatureLabel(feature: Pick<SelfViewFeature, 'id' | 'label'>) {
  return (
    CALM_FEATURE_LABELS[feature.id] ?? feature.label.replace(/\s+(sanctuary|overview|tools)$/i, '')
  );
}

export function getShortcutToastMessage(
  feature: Pick<SelfViewFeature, 'id' | 'label'>,
  isPinned: boolean,
) {
  return `${getCalmFeatureLabel(feature)} ${isPinned ? 'removed from' : 'saved to'} your shortcuts.`;
}

export function getHistoryNotice(scale: string) {
  return `History is read-only for the ${scale} view.`;
}
