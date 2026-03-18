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
 * Emoji mapping for common features to add soul to the UI.
 */
export const FEATURE_EMOJIS: Record<string, string> = {
    'energy_pulse': '⚡',
    'mood_checkin': '🪷',
    'mood_lotus': '🪷',
    'study_rhythm': '⏳',
    'daily_rhythm': '⏳',
    'goals': '🎯',
    'grades': '📜',
    'voice_journaling': '🎙️',
    'voice': '🎙️',
    'school_pulse': '📈',
    'teacher_pulse': '📈',
    'decisions': '⚖️',
    'decision_mirror': '⚖️',
    'wisdom': '🌱',
    'reflections': '🪞',
    'breath_presence': '🌬️',
    'breath': '🌬️',
    'journal': '📓',
    'banyan_path': '🌳',
    'professional_growth': '🌳',
    'faculty_resonance': '🌀',
    'systemic_overview': '🌐',
    'ecosystem_dash': '🌐',
    'strategic_wisdom': '🗺️',
    'strategic_pulse': '🗺️',
    'system_health': '🛠️',
    'user_resonance': '👥',
    'mirrors': '🪞',
    'reminders': '🔔',
    'holistic_history': '📜',
    'joy_jar': '🏺',
    'sleep': '😴',
    'fire_journal': '🔥',
    'tomorrow': '🌅',
    'vision_lab': '🔬',
    'philosophy_lab': '🏛️',
};

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
    },
    'teacher_pulse': {
        whatIsIt: 'A real-time reflection of your instructional impact and professional growth.',
        whereToFind: 'Located in the working layer of your Teacher sanctuary.'
    },
    'mood_lotus': {
        whatIsIt: 'An interactive visualization of your emotional state over time.',
        whereToFind: 'Found in your personal growth layer.'
    },
    'daily_rhythm': {
        whatIsIt: 'A visualization of your daily flow, balancing rest and focus.',
        whereToFind: 'In your daily rituals section.'
    },
    'professional_growth': {
        whatIsIt: 'A map of your journey through the pedagogical landscape.',
        whereToFind: 'In the working domain for educators.'
    },
    'joy_jar': {
        whatIsIt: 'A collection of "Glimmers" — small moments of shared joy and connection.',
        whereToFind: 'In your personal sanctuary.'
    },
    'sleep': {
        whatIsIt: 'Track your rest pattern to understand how it fuels your daily energy.',
        whereToFind: 'In your personal rituals section.'
    },
    'fire_journal': {
        whatIsIt: 'A space for transformative reflections and clearing mental space.',
        whereToFind: 'Part of your private journaling tools.'
    },
    'tomorrow': {
        whatIsIt: 'Set intentions and prepare your heart for the coming day.',
        whereToFind: 'In your evening ritual section.'
    },
    'strategic_pulse': {
        whatIsIt: 'High-level orchestration of institutional health and direction.',
        whereToFind: 'Leadership hub for Principals and Founders.'
    },
    'decision_mirror': {
        whatIsIt: 'Reflect on the legacy of your choices through the lens of Strategic Wisdom.',
        whereToFind: 'Governance layer of the Principal dashboard.'
    },
    'vision_lab': {
        whatIsIt: 'A technical and philosophical space for prototyping the future of Gurudevi.',
        whereToFind: 'Reserved for the Founder core.'
    },
    'philosophy_lab': {
        whatIsIt: 'A workspace for refining the foundational principles of our educational ecosystem.',
        whereToFind: 'Founder and Principal wisdom layers.'
    },
    'ecosystem_dash': {
        whatIsIt: 'Collective analytics representing the health of the entire Gurudevi biosphere.',
        whereToFind: 'Global dashboard for Founders.'
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
