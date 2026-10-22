type BrowserFeatureRegistration = Readonly<{
  taskKind: 'task' | 'modal';
  renderer:
    | 'fire-journal'
    | 'mood-lotus'
    | 'breath-guide'
    | 'joy-jar'
    | 'gratitude-glimmers'
    | 'wisdom-seeds'
    | 'tomorrow-prep'
    | 'sleep-tracker'
    | 'student-goals'
    | 'daily-rhythm'
    | 'progress-tree'
    | 'energy-forecast'
    | 'voice-journal'
    | 'reminders'
    | 'wind-down-ritual'
    | 'warm-mirror'
    | 'resonance-pattern'
    | 'my-grades'
    | 'daily-content'
    | 'reframe'
    | 'decisions'
    | 'professional-history'
    | 'pulse-dashboard';
}>;

/**
 * This is an application delivery registry, not a second feature catalog.
 * The shared catalog owns identity, access and spatial metadata. This map only
 * records which existing browser implementations can safely render in Next.
 */
export const BROWSER_SELF_FEATURES: Readonly<Record<string, BrowserFeatureRegistration>> = {
  fire_journal: {
    renderer: 'fire-journal',
    taskKind: 'task',
  },
  mood_lotus: {
    renderer: 'mood-lotus',
    taskKind: 'modal',
  },
  daily_pulse: {
    renderer: 'pulse-dashboard',
    taskKind: 'task',
  },
  breath_guide: {
    renderer: 'breath-guide',
    taskKind: 'modal',
  },
  joy_jar: {
    renderer: 'joy-jar',
    taskKind: 'task',
  },
  gratitude_glimmers: {
    renderer: 'gratitude-glimmers',
    taskKind: 'task',
  },
  wisdom_seeds: {
    renderer: 'wisdom-seeds',
    taskKind: 'task',
  },
  tomorrow_prep: {
    renderer: 'tomorrow-prep',
    taskKind: 'task',
  },
  sleep_tracker: {
    renderer: 'sleep-tracker',
    taskKind: 'task',
  },
  personal_goals: {
    renderer: 'student-goals',
    taskKind: 'task',
  },
  study_rhythm: {
    renderer: 'daily-rhythm',
    taskKind: 'task',
  },
  daily_rhythm: {
    renderer: 'daily-rhythm',
    taskKind: 'task',
  },
  governance_history: {
    renderer: 'progress-tree',
    taskKind: 'task',
  },
  energy_forecast: {
    renderer: 'energy-forecast',
    taskKind: 'task',
  },
  voice_journal: {
    renderer: 'voice-journal',
    taskKind: 'task',
  },
  reminders: {
    renderer: 'reminders',
    taskKind: 'task',
  },
  wind_down_ritual: {
    renderer: 'wind-down-ritual',
    taskKind: 'task',
  },
  monthly_reflection: {
    renderer: 'warm-mirror',
    taskKind: 'task',
  },
  resonance_patterns: {
    renderer: 'resonance-pattern',
    taskKind: 'task',
  },
  academic_grades: {
    renderer: 'my-grades',
    taskKind: 'task',
  },
  daily_content: {
    renderer: 'daily-content',
    taskKind: 'task',
  },
  reframe: {
    renderer: 'reframe',
    taskKind: 'task',
  },
  decisions: {
    renderer: 'decisions',
    taskKind: 'task',
  },
  professional_history: {
    renderer: 'professional-history',
    taskKind: 'task',
  },
};

function browserSelfFeature(featureId: string): BrowserFeatureRegistration | null {
  return BROWSER_SELF_FEATURES[featureId] ?? null;
}

export function getBrowserSelfFeature(featureId: string): BrowserFeatureRegistration | null {
  return browserSelfFeature(featureId);
}

export function isBrowserSelfFeatureDelivered(featureId: string): boolean {
  return browserSelfFeature(featureId) !== null;
}
