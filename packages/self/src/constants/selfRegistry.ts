import type { DomainEntry } from '@repo/core/logic/registry/domainEntry';

/**
 * SelfSection Registry
 * Defines the logical layering and capability mapping for the Sanctuary.
 */

export interface SelfFeature {
  id: string;
  label: string;
  discoveryInfo?: {
    whatIsIt: string;
    whereToFind: string;
  };
}

export interface SelfDomain {
  id: string;
  title: string;
  accentColor: string;
  /** Gradient colors for the 'Energy Sensing' UI (2026 Pattern) */
  energyVibe?: [string, string];
  traitRequirement?: string; // ReBAC Trait (e.g., 'role:student', 'capability:somatic')
  capabilityRequirement?: { action: string; subject: string }; // 2026 Dynamic Cedar alignment
  features: string[]; // IDs of features in this domain
}

/**
 * Global Registry of all possible Domains.
 */
export const SANCTUARY_DOMAINS: Record<string, SelfDomain> = {
  journey: {
    id: 'journey',
    title: 'Journey Overview',
    accentColor: '#10B981',
    energyVibe: ['#ECFDF5', '#D1FAE5'],
    features: ['journey_timeline'],
  },
  pulse: {
    id: 'pulse',
    title: 'Inner Pulse',
    accentColor: '#8B5CF6',
    energyVibe: ['#F5F3FF', '#EDE9FE'],
    features: ['daily_pulse', 'mood_lotus', 'wisdom_seeds'],
  },
  growth: {
    id: 'growth',
    title: 'Growth Sanctuary',
    accentColor: '#3B82F6',
    energyVibe: ['#EFF6FF', '#DBEAFE'],
    traitRequirement: 'role:student',
    capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
    features: ['study_rhythm', 'personal_goals', 'academic_grades'],
  },
  care: {
    id: 'care',
    title: 'Care & Rhythm',
    accentColor: '#EF4444',
    energyVibe: ['#FEF2F2', '#FEE2E2'],
    features: ['sleep_tracker', 'joy_jar', 'gratitude_glimmers'],
  },
  reflection: {
    id: 'reflection',
    title: 'Reflection Tools',
    accentColor: '#F59E0B',
    energyVibe: ['#FFFBEB', '#FEF3C7'],
    features: ['fire_journal', 'voice_journal', 'tomorrow_prep'],
  },
  working: {
    id: 'working',
    title: 'Working Rhythm',
    accentColor: '#10B981',
    energyVibe: ['#F0FDF4', '#DCFCE7'],
    traitRequirement: 'role:teacher',
    capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' },
    features: ['daily_rhythm', 'tomorrow_prep', 'reminders', 'decisions', 'professional_history'],
  },
  leadership: {
    id: 'leadership',
    title: 'Leadership Focus',
    accentColor: '#F59E0B',
    energyVibe: ['#FFF7ED', '#FFEDD5'],
    traitRequirement: 'role:principal',
    capabilityRequirement: { action: 'read', subject: 'PrincipalDashboard' },
    features: [
      'decisions',
      'resonance_patterns',
      'wisdom_seeds',
      'monthly_reflection',
      'governance_history',
    ],
  },
};

export const SELF_REGISTRY: Record<string, DomainEntry> = {
  journey: {
    id: 'journey',
    label: 'Journey Overview',
    description: 'Personal timeline and journey progress',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 3, // Open to all (Third Class)
    capabilityRequirement: { action: 'read', subject: 'SelfJourney' },
    tabDomain: 'self',
    surfaceId: 'journey',
    defaultOrder: 10,
    analyticsKey: 'self.journey',
  },
  pulse: {
    id: 'pulse',
    label: 'Inner Pulse',
    description: 'Daily check-in and Lotus energy sensing',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 3,
    capabilityRequirement: { action: 'read', subject: 'InnerPulse' },
    tabDomain: 'self',
    surfaceId: 'pulse',
    defaultOrder: 20,
    analyticsKey: 'self.pulse',
  },
  growth: {
    id: 'growth',
    label: 'Growth Sanctuary',
    description: 'Study rhythms and goals tracking',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 3,
    capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
    tabDomain: 'self',
    surfaceId: 'growth',
    defaultOrder: 30,
    analyticsKey: 'self.growth',
  },
  care: {
    id: 'care',
    label: 'Care & Rhythm',
    description: 'Sleep, gratitude, and joy tracking',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 3,
    capabilityRequirement: { action: 'read', subject: 'SelfCare' },
    tabDomain: 'self',
    surfaceId: 'care',
    defaultOrder: 40,
    analyticsKey: 'self.care',
  },
  reflection: {
    id: 'reflection',
    label: 'Reflection Tools',
    description: 'Voice and fire journaling',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 3,
    capabilityRequirement: { action: 'read', subject: 'SelfReflection' },
    tabDomain: 'self',
    surfaceId: 'reflection',
    defaultOrder: 50,
    analyticsKey: 'self.reflection',
  },
  working: {
    id: 'working',
    label: 'Working Rhythm',
    description: 'Professional teacher tools and scheduling',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 2, // Second Class (signed up teachers)
    capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' },
    tabDomain: 'self',
    surfaceId: 'working',
    defaultOrder: 60,
    analyticsKey: 'self.working',
  },
  leadership: {
    id: 'leadership',
    label: 'Leadership Focus',
    description: 'Governance and resonance reflection for principals',
    ownerPackage: 'self',
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    citizenshipRequired: 1, // First Class (Institutional)
    capabilityRequirement: { action: 'read', subject: 'PrincipalDashboard' },
    tabDomain: 'self',
    surfaceId: 'leadership',
    defaultOrder: 70,
    analyticsKey: 'self.leadership',
  },
};

/**
 * Emoji mapping for common features to add soul to the UI.
 */
export const FEATURE_EMOJIS: Record<string, string> = {
  energy_pulse: '⚡',
  daily_pulse: '⚡',
  mood_checkin: '🪷',
  mood_lotus: '🪷',
  study_rhythm: '⏳',
  daily_rhythm: '⏳',
  personal_goals: '🎯',
  academic_grades: '📜',
  voice_journal: '🎙️',
  school_pulse: '📈',
  teacher_pulse: '📈',
  decisions: '⚖️',
  wisdom_seeds: '🌱',
  fire_journal: '🔥',
  tomorrow_prep: '🌅',
  professional_growth: '🌳',
  joy_jar: '🏺',
  sleep_tracker: '💤',
  gratitude_glimmers: '✨',
};

/**
 * Feature Discovery Metadata
 */
export const FEATURE_DISCOVERY_DATA: Record<string, { whatIsIt: string; whereToFind: string }> = {
  daily_pulse: {
    whatIsIt: 'A daily check-in to track your physical and mental energy levels.',
    whereToFind: 'Located in your Inner Pulse domain.',
  },
  mood_lotus: {
    whatIsIt: 'An interactive visualization of your emotional state over time.',
    whereToFind: 'Top of your Self screen.',
  },
  study_rhythm: {
    whatIsIt: 'Tracks your focus periods and rest cycles to ensure balanced learning.',
    whereToFind: 'Under the Growth domain.',
  },
  personal_goals: {
    whatIsIt: 'Your personal quest log for academic and personal intentions.',
    whereToFind: 'In the Growth sanctuary.',
  },
  academic_grades: {
    whatIsIt: 'A growth-focused view of your progress trends.',
    whereToFind: 'In the Growth sanctuary.',
  },
  decisions: {
    whatIsIt: 'A structured space to track and reflect on institutional choices.',
    whereToFind: 'Found in your professional working layer.',
  },
};
