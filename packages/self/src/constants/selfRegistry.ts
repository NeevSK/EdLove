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
}

export type UserRole = 'teacher' | 'principal' | 'founder' | 'admin' | 'student';

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
