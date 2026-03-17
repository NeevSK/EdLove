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
        whatIsIt: 'A space to log your emotions and see patterns over time. Understanding your mood is the first step up the emotional resonance ladder.',
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
    },
    'school_pulse': {
        whatIsIt: 'A real-time overview of your school\'s collective energy and engagement levels.',
        whereToFind: 'In the Working domain of the Principal dashboard.'
    },
    'decisions': {
        whatIsIt: 'A structured space to track and reflect on institutional choices using "Strategic Wisdom".',
        whereToFind: 'Found in your professional working layer.'
    },
    'wisdom': {
        whatIsIt: 'A curated repository of insights and philosophical foundations for your educational journey.',
        whereToFind: 'Under the Wisdom domain in your Self view.'
    },
    'reflections': {
        whatIsIt: 'Deeper insights generated from your activity, helping you mirror your inner self.',
        whereToFind: 'Located in the personal reflections layer.'
    },
    'breath_presence': {
        whatIsIt: 'Mindful breathing exercises designed to restore focus and presence between classes.',
        whereToFind: 'In your personal rituals section.'
    },
    'journal': {
        whatIsIt: 'A private space for written reflections and creative sparks.',
        whereToFind: 'Part of your personal growth layer.'
    },
    'banyan_path': {
        whatIsIt: 'A visual map of your professional development and pedagogical experiments.',
        whereToFind: 'In the working domain for educators.'
    },
    'faculty_resonance': {
        whatIsIt: 'Connect with fellow educators to share insights and foster collective growth.',
        whereToFind: 'The social hub of your professional layer.'
    },
    'systemic_overview': {
        whatIsIt: 'High-level analytics across the entire educational ecosystem.',
        whereToFind: 'Executive layer of the Founder dashboard.'
    },
    'strategic_wisdom': {
        whatIsIt: 'Long-term planning tools and philosophical guidance for institutional growth.',
        whereToFind: 'Under the Strategic domain for Founders.'
    },
    'system_health': {
        whatIsIt: 'Technical monitoring and operational status of the Gurudevi platform.',
        whereToFind: 'In the Working domain for Administrators.'
    },
    'user_resonance': {
        whatIsIt: 'Tools to monitor and improve the quality of interactions across the user base.',
        whereToFind: 'Admin dashboard, focusing on community health.'
    },
    'mirrors': {
        whatIsIt: 'A collection of "Life Reflections" derived from your interactions and moods.',
        whereToFind: 'The special Reflections tab in your Discovery Hub.'
    },
    'reminders': {
        whatIsIt: 'Timely prompts to keep you aligned with your daily rituals and goals.',
        whereToFind: 'The Reminders tab in your Discovery Hub.'
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
