import type { FeatureJourneySpec, FeatureJTBDGraph } from '@repo/core/types';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';
import type React from 'react';

// Lightweight component type — actual components are lazy-loaded by SelfFeatureRenderer
export type SelfFeatureComponentProps = {
  userId?: string;
  onClose?: () => void;
  compact?: boolean;
};
export type SelfFeatureComponent = React.ComponentType<SelfFeatureComponentProps>;

export type FeatureCategory = 'identity' | 'wellbeing' | 'growth' | 'practice' | 'professional';

export interface SelfFeatureDefinition {
  id: string;
  label: string;
  emoji: string;
  // Resolved lazily by SelfFeatureRenderer to avoid circular deps and heavy bundle
  componentId: string;
  category: FeatureCategory;
  domain: string;
  requiredCapabilities: string[];
  minCitizenship?: number;
  roleWeights?: Partial<Record<SelfViewRole, number>>;
  defaultZone: 'today' | 'private' | 'shared';
  defaultOrder: number;
  energyVibe: [string, string];
  timing?: { preferredPhase: 'morning' | 'afternoon' | 'night' };
  isPinnable: boolean;
  isHidable: boolean;
  practiceDocument?: Readonly<{ schemaId: string }>;
  journey?: FeatureJourneySpec;
  jtbdFlow?: FeatureJTBDGraph;
  flowId?: string;
}

/**
 * Canonical catalog — single source of truth for Self features.
 * Extends SELF_REGISTRY with component bindings, role affinity, and canvas metadata.
 * Add a feature here → it appears in resolver, canvas, and web/mobile automatically.
 */
export const FEATURE_CATALOG: Record<string, SelfFeatureDefinition> = {
  journey_timeline: {
    id: 'journey_timeline',
    label: 'Journey',
    emoji: '🧭',
    componentId: 'JourneyTimeline',
    category: 'identity',
    domain: 'journey',
    requiredCapabilities: ['read:SelfJourney'],
    minCitizenship: 3,
    roleWeights: { student: 70, teacher: 80, guardian: 60, principal: 50, founder: 50, admin: 40 },
    defaultZone: 'today',
    defaultOrder: 10,
    energyVibe: ['#ECFDF5', '#D1FAE5'],
    isPinnable: true,
    isHidable: false,
  },
  breath_guide: {
    id: 'breath_guide',
    label: 'Breath Guide',
    emoji: '🫁',
    componentId: 'BreathGuide',
    category: 'wellbeing',
    domain: 'pulse',
    requiredCapabilities: ['read:InnerPulse'],
    minCitizenship: 3,
    roleWeights: { student: 90, teacher: 95, guardian: 90, principal: 85, founder: 80, admin: 70 },
    defaultZone: 'today',
    defaultOrder: 19,
    energyVibe: ['#E0F2FE', '#BAE6FD'],
    timing: { preferredPhase: 'morning' },
    isPinnable: true,
    isHidable: true,
    flowId: 'flow:self:mindful_breath',
  },
  daily_pulse: {
    id: 'daily_pulse',
    label: 'Daily Pulse',
    emoji: '⚡',
    componentId: 'PulseDashboard',
    category: 'wellbeing',
    domain: 'pulse',
    requiredCapabilities: ['read:InnerPulse'],
    minCitizenship: 3,
    roleWeights: { student: 100, teacher: 85, guardian: 75, principal: 65, founder: 60, admin: 55 },
    defaultZone: 'today',
    defaultOrder: 20,
    energyVibe: ['#F5F3FF', '#EDE9FE'],
    timing: { preferredPhase: 'morning' },
    isPinnable: true,
    isHidable: true,
  },
  mood_lotus: {
    id: 'mood_lotus',
    label: 'Mood Lotus',
    emoji: '🪷',
    componentId: 'MoodLotus',
    category: 'wellbeing',
    domain: 'pulse',
    requiredCapabilities: ['read:InnerPulse'],
    minCitizenship: 3,
    roleWeights: { student: 90, teacher: 80, guardian: 85, principal: 70, founder: 65, admin: 60 },
    defaultZone: 'today',
    defaultOrder: 21,
    energyVibe: ['#F5F3FF', '#EDE9FE'],
    isPinnable: true,
    isHidable: true,
  },
  wisdom_seeds: {
    id: 'wisdom_seeds',
    label: 'Wisdom Seeds',
    emoji: '🌱',
    componentId: 'WisdomSeeds',
    category: 'wellbeing',
    domain: 'pulse',
    requiredCapabilities: ['read:InnerPulse'],
    minCitizenship: 3,
    roleWeights: { student: 75, teacher: 85, guardian: 80, principal: 90, founder: 85, admin: 70 },
    defaultZone: 'today',
    defaultOrder: 22,
    energyVibe: ['#F5F3FF', '#EDE9FE'],
    isPinnable: true,
    isHidable: true,
  },
  daily_content: {
    id: 'daily_content',
    label: 'Daily Insight',
    emoji: '✨',
    componentId: 'DailyContentCard',
    category: 'wellbeing',
    domain: 'pulse',
    requiredCapabilities: ['read:InnerPulse'],
    minCitizenship: 3,
    roleWeights: { student: 90, teacher: 85, guardian: 80, principal: 75, founder: 70, admin: 65 },
    defaultZone: 'today',
    defaultOrder: 15,
    energyVibe: ['#FEF3C7', '#FDE68A'],
    isPinnable: true,
    isHidable: true,
  },
  study_rhythm: {
    id: 'study_rhythm',
    label: 'Study Rhythm',
    emoji: '⏳',
    componentId: 'DailyRhythm',
    category: 'growth',
    domain: 'growth',
    requiredCapabilities: ['read:StudentDashboard'],
    minCitizenship: 3,
    roleWeights: { student: 100, guardian: 80, teacher: 65, principal: 55, founder: 50, admin: 50 },
    defaultZone: 'today',
    defaultOrder: 30,
    energyVibe: ['#EFF6FF', '#DBEAFE'],
    isPinnable: true,
    isHidable: true,
  },
  personal_goals: {
    id: 'personal_goals',
    label: 'Personal Goals',
    emoji: '🎯',
    componentId: 'StudentGoals',
    category: 'growth',
    domain: 'growth',
    requiredCapabilities: ['read:StudentDashboard'],
    minCitizenship: 3,
    roleWeights: { student: 100, teacher: 75, guardian: 70, principal: 70, founder: 80, admin: 65 },
    defaultZone: 'today',
    defaultOrder: 31,
    energyVibe: ['#EFF6FF', '#DBEAFE'],
    isPinnable: true,
    isHidable: true,
  },
  academic_grades: {
    id: 'academic_grades',
    label: 'My Grades',
    emoji: '📜',
    componentId: 'MyGradesView',
    category: 'growth',
    domain: 'growth',
    requiredCapabilities: ['read:StudentDashboard'],
    minCitizenship: 3,
    roleWeights: { student: 100, guardian: 85, teacher: 60, principal: 60, founder: 50, admin: 50 },
    defaultZone: 'shared',
    defaultOrder: 32,
    energyVibe: ['#EFF6FF', '#DBEAFE'],
    isPinnable: true,
    isHidable: true,
  },
  sleep_tracker: {
    id: 'sleep_tracker',
    label: 'Sleep Tracker',
    emoji: '💤',
    componentId: 'SleepTracker',
    category: 'wellbeing',
    domain: 'care',
    requiredCapabilities: ['read:SelfCare'],
    minCitizenship: 3,
    roleWeights: { student: 85, teacher: 85, guardian: 80, principal: 75, founder: 80, admin: 70 },
    defaultZone: 'today',
    defaultOrder: 40,
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    timing: { preferredPhase: 'night' },
    isPinnable: true,
    isHidable: true,
  },
  joy_jar: {
    id: 'joy_jar',
    label: 'Joy Jar',
    emoji: '🏺',
    componentId: 'JoyJar',
    category: 'wellbeing',
    domain: 'care',
    requiredCapabilities: ['read:SelfCare'],
    minCitizenship: 3,
    roleWeights: { student: 90, guardian: 85, teacher: 80, principal: 70, founder: 75, admin: 65 },
    defaultZone: 'today',
    defaultOrder: 41,
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    isPinnable: true,
    isHidable: true,
  },
  gratitude_glimmers: {
    id: 'gratitude_glimmers',
    label: 'Gratitude',
    emoji: '✨',
    componentId: 'GratitudeGlimmers',
    category: 'wellbeing',
    domain: 'care',
    requiredCapabilities: ['read:SelfCare'],
    minCitizenship: 3,
    roleWeights: { student: 80, teacher: 90, guardian: 85, principal: 80, founder: 80, admin: 75 },
    defaultZone: 'today',
    defaultOrder: 42,
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    isPinnable: true,
    isHidable: true,
  },
  energy_forecast: {
    id: 'energy_forecast',
    label: 'Energy Forecast',
    emoji: '📊',
    componentId: 'EnergyForecast',
    category: 'wellbeing',
    domain: 'care',
    requiredCapabilities: ['read:SelfCare'],
    minCitizenship: 3,
    roleWeights: { student: 80, teacher: 90, guardian: 75, principal: 85, founder: 85, admin: 75 },
    defaultZone: 'today',
    defaultOrder: 43,
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    timing: { preferredPhase: 'morning' },
    isPinnable: true,
    isHidable: true,
  },
  wind_down_ritual: {
    id: 'wind_down_ritual',
    label: 'Wind Down Ritual',
    emoji: '🌙',
    componentId: 'WindDownRitual',
    category: 'practice',
    domain: 'care',
    requiredCapabilities: ['read:SelfCare'],
    minCitizenship: 3,
    roleWeights: { student: 85, teacher: 90, guardian: 85, principal: 85, founder: 80, admin: 75 },
    defaultZone: 'today',
    defaultOrder: 44,
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    timing: { preferredPhase: 'night' },
    isPinnable: true,
    isHidable: true,
  },
  fire_journal: {
    id: 'fire_journal',
    practiceDocument: { schemaId: 'fire-journal-practice-v1' },
    label: 'Fire Journal',
    emoji: '🔥',
    componentId: 'FireJournal',
    category: 'practice',
    domain: 'reflection',
    requiredCapabilities: ['read:SelfReflection'],
    minCitizenship: 3,
    roleWeights: { student: 75, teacher: 85, guardian: 70, principal: 75, founder: 80, admin: 65 },
    defaultZone: 'private',
    defaultOrder: 50,
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    timing: { preferredPhase: 'night' },
    isPinnable: true,
    isHidable: true,
  },
  voice_journal: {
    id: 'voice_journal',
    label: 'Voice Journal',
    emoji: '🎙️',
    componentId: 'VoiceJournaling',
    category: 'practice',
    domain: 'reflection',
    requiredCapabilities: ['read:SelfReflection'],
    minCitizenship: 3,
    roleWeights: { student: 70, teacher: 80, guardian: 75, principal: 75, founder: 80, admin: 65 },
    defaultZone: 'private',
    defaultOrder: 51,
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    isPinnable: true,
    isHidable: true,
  },
  reframe: {
    id: 'reframe',
    label: 'Thought Reframe',
    emoji: '💡',
    componentId: 'ReframeWizard',
    category: 'practice',
    domain: 'reflection',
    requiredCapabilities: ['read:SelfReflection'],
    minCitizenship: 3,
    roleWeights: { student: 80, teacher: 85, guardian: 80, principal: 75, founder: 80, admin: 70 },
    defaultZone: 'private',
    defaultOrder: 53,
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    isPinnable: true,
    isHidable: true,
  },
  tomorrow_prep: {
    id: 'tomorrow_prep',
    label: 'Tomorrow Prep',
    emoji: '🌅',
    componentId: 'TomorrowPrep',
    category: 'practice',
    domain: 'reflection',
    requiredCapabilities: ['read:SelfReflection'],
    minCitizenship: 3,
    roleWeights: { student: 85, teacher: 95, guardian: 80, principal: 80, founder: 85, admin: 75 },
    defaultZone: 'private',
    defaultOrder: 52,
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    timing: { preferredPhase: 'night' },
    isPinnable: true,
    isHidable: true,
  },
  daily_rhythm: {
    id: 'daily_rhythm',
    label: 'Daily Rhythm',
    emoji: '⏳',
    componentId: 'DailyRhythm',
    category: 'professional',
    domain: 'working',
    requiredCapabilities: ['read:TeacherDashboard'],
    minCitizenship: 2,
    roleWeights: { teacher: 100, principal: 80, student: 70, guardian: 65, founder: 75, admin: 70 },
    defaultZone: 'today',
    defaultOrder: 60,
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    isPinnable: true,
    isHidable: true,
  },
  reminders: {
    id: 'reminders',
    label: 'Reminders & Care Alerts',
    emoji: '⏰',
    componentId: 'RemindersManager',
    category: 'practice',
    domain: 'working',
    requiredCapabilities: ['read:TeacherDashboard'],
    minCitizenship: 2,
    roleWeights: { teacher: 100, guardian: 95, student: 90, principal: 85, founder: 85, admin: 80 },
    defaultZone: 'private',
    defaultOrder: 61,
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    isPinnable: true,
    isHidable: true,
  },
  decisions: {
    id: 'decisions',
    label: 'Decisions',
    emoji: '⚖️',
    componentId: 'DecisionJournalSection',
    category: 'professional',
    domain: 'working',
    requiredCapabilities: ['read:TeacherDashboard'],
    minCitizenship: 2,
    roleWeights: { teacher: 85, principal: 100, founder: 95, student: 55, guardian: 65, admin: 85 },
    defaultZone: 'private',
    defaultOrder: 62,
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    isPinnable: true,
    isHidable: true,
  },
  professional_history: {
    id: 'professional_history',
    label: 'Teaching History',
    emoji: '📖',
    componentId: 'TeachingHistoryTimeline',
    category: 'professional',
    domain: 'working',
    requiredCapabilities: ['read:TeacherDashboard'],
    minCitizenship: 2,
    roleWeights: { teacher: 95, principal: 70, founder: 70, admin: 65, student: 40, guardian: 45 },
    defaultZone: 'shared',
    defaultOrder: 63,
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    isPinnable: true,
    isHidable: true,
  },
  resonance_patterns: {
    id: 'resonance_patterns',
    label: 'Resonance',
    emoji: '〰️',
    componentId: 'ResonancePatternCard',
    category: 'professional',
    domain: 'leadership',
    requiredCapabilities: ['read:PrincipalDashboard'],
    minCitizenship: 1,
    roleWeights: { principal: 100, founder: 90, teacher: 75, admin: 75, guardian: 60, student: 50 },
    defaultZone: 'today',
    defaultOrder: 70,
    energyVibe: ['#FFF7ED', '#FFEDD5'],
    isPinnable: true,
    isHidable: true,
  },
  monthly_reflection: {
    id: 'monthly_reflection',
    label: 'Monthly Reflection',
    emoji: '🌙',
    componentId: 'WarmMirrorCard',
    category: 'professional',
    domain: 'leadership',
    requiredCapabilities: ['read:PrincipalDashboard'],
    minCitizenship: 1,
    roleWeights: { principal: 100, founder: 85, teacher: 80, admin: 75, guardian: 70, student: 65 },
    defaultZone: 'private',
    defaultOrder: 71,
    energyVibe: ['#FFF7ED', '#FFEDD5'],
    timing: { preferredPhase: 'night' },
    isPinnable: true,
    isHidable: true,
  },
  governance_history: {
    id: 'governance_history',
    label: 'Governance',
    emoji: '🏛️',
    componentId: 'ProgressTree',
    category: 'professional',
    domain: 'leadership',
    requiredCapabilities: ['read:PrincipalDashboard'],
    minCitizenship: 1,
    roleWeights: { principal: 100, founder: 95, admin: 90, teacher: 65, guardian: 55, student: 50 },
    defaultZone: 'shared',
    defaultOrder: 72,
    energyVibe: ['#FFF7ED', '#FFEDD5'],
    isPinnable: true,
    isHidable: true,
  },
};

export const FEATURE_IDS = Object.keys(FEATURE_CATALOG);

export function getFeatureDefinition(id: string): SelfFeatureDefinition | undefined {
  return FEATURE_CATALOG[id];
}

export class FeatureCatalog {
  private readonly map: Readonly<Record<string, SelfFeatureDefinition>>;
  constructor(entries: Record<string, SelfFeatureDefinition> = FEATURE_CATALOG) {
    this.map = Object.freeze({ ...entries });
    Object.freeze(this);
  }
  get(id: string): SelfFeatureDefinition | undefined {
    return this.map[id];
  }
  all(): SelfFeatureDefinition[] {
    return Object.values(this.map);
  }
  byCategory(category: FeatureCategory): SelfFeatureDefinition[] {
    return this.all().filter((f) => f.category === category);
  }
  byZone(zone: SelfFeatureDefinition['defaultZone']): SelfFeatureDefinition[] {
    return this.all().filter((f) => f.defaultZone === zone);
  }
}

export const featureCatalog = new FeatureCatalog();
