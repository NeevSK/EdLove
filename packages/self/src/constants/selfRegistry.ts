/**
 * SelfSection Registry
 * Defines the logical layering for each user role.
 */

export interface SelfModuleRegistry {
    id: string;
    label: string;
    description: string;
    layer: 'personal' | 'working';
    required?: boolean;
    discoveryInfo?: {
        whatIsIt: string;
        whereToFind: string;
    };
}

export type UserRole = 'teacher' | 'principal' | 'founder' | 'admin' | 'student';

/**
 * Feature Discovery Metadata
 * Provides friendly explanations for each feature.
 */
export const FEATURE_DISCOVERY_DATA: Record<string, { whatIsIt: string; whereToFind: string }> = {
    'energy_pulse': {
        whatIsIt: 'A daily check-in to track your physical and mental energy levels, helping you find your optimal study rhythm.',
        whereToFind: 'Located in your Personal Sanctuary hub.'
    },
    'mood_checkin': {
        whatIsIt: 'A space to log your emotions and see patterns over time. Understanding your mood is the first step to emotional resonance.',
        whereToFind: 'Top of your Self screen, accessible anytime for a quick reflection.'
    },
    'study_rhythm': {
        whatIsIt: 'Tracks your focus periods and rest cycles to ensure you are learning with "Breath-like Motion".',
        whereToFind: 'Under the Growth domain in your Self dashboard.'
    },
    'goals': {
        whatIsIt: 'Your personal quest log. Set intentions for your growth, academic or personal.',
        whereToFind: 'In the Working domain of your Self section.'
    },
    'grades': {
        whatIsIt: 'A "Academic Mirror" that shows your progress without the pressure of raw numbers, focusing on growth trends.',
        whereToFind: 'Found in the Working domain, reflecting your scholastic journey.'
    },
    'voice_journaling': {
        whatIsIt: 'Speak your heart. A hands-free way to capture reflections through the "Voice of the Soul".',
        whereToFind: 'Accessible via the microphone icon in your daily rituals.'
    }
};

export const ROLE_LAYERS: Record<UserRole, { personal: string[]; working: string[] }> = {
    principal: {
        personal: ['energy_pulse', 'voice_journaling'],
        working: ['school_pulse', 'decisions', 'wisdom', 'reflections']
    },
    teacher: {
        personal: ['energy_pulse', 'breath_presence', 'journal', 'voice_journaling'],
        working: ['banyan_path', 'faculty_resonance']
    },
    student: {
        personal: ['mood_checkin', 'study_rhythm'],
        working: ['goals', 'grades']
    },
    founder: {
        personal: ['energy_pulse', 'voice_journaling'],
        working: ['systemic_overview', 'strategic_wisdom']
    },
    admin: {
        personal: ['energy_pulse'],
        working: ['system_health', 'user_resonance']
    }
};
