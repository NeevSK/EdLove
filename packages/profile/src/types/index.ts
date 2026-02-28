import { UserRole, SocialLink, StaffAttendance, StaffLeave } from '@repo/core';

export interface ProfileStats {
    classes_taught?: number;
    students_count?: number;
    assignments_graded?: number;
    attendance_streak?: number;
    assignments_completed?: number;
    assignments_count?: number;
    guru_points?: number;
}

/**
 * OrientationSeeds — a private, four-dimensional fingerprint of how the user
 * tends to orient towards learning and energy.
 *
 * These are TENDENCIES, not types. All values are 0–100 continuous scores.
 * They are never shown as labels; they influence content ordering and the
 * ResonancePatternCard visualization only.
 *
 * • depth_breadth  — 0 = loves going very deep on one thing,
 *                    100 = loves exploring wide across many things
 * • reflect_act    — 0 = prefers to reflect/observe before engaging,
 *                    100 = prefers to jump in and learn by doing
 * • solo_social    — 0 = recharges and thinks best alone,
 *                    100 = energised and thinks best with others
 * • steady_surge   — 0 = prefers a steady, predictable rhythm,
 *                    100 = thrives on bursts of intense focus then rest
 *
 * source — 'seeded' means the user answered the onboarding orientation step;
 *          'inferred' means derived purely from behavioral signals.
 */
export interface OrientationSeeds {
    depth_breadth: number;   // 0–100
    reflect_act: number;     // 0–100
    solo_social: number;     // 0–100
    steady_surge: number;    // 0–100
    source: 'seeded' | 'inferred' | 'mixed';
    seeded_at?: string;      // ISO timestamp
    last_updated?: string;
}

export interface UserProfile extends ProfileStats {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    avatar_url?: string;
    is_anonymous?: boolean;
    profile_completed?: boolean;
    bio?: string;
    index_number?: string;
    nic_number?: string;
    school_id?: string;
    school_name?: string;
    is_thuthimal?: boolean;
    thuthimal_gifter?: string;
    thuthimal_gifted_at?: string;
    level?: number;
    phone?: string;
    created_at?: string;
    experience_years?: number;
    subjects_taught?: string | string[];
    qualifications?: string | string[];
    social_links?: SocialLink[];
    /**
     * Private orientation fingerprint — never shown as a type label.
     * Used to subtly personalize content ordering and self-section visuals.
     */
    orientation_seeds?: OrientationSeeds | null;
}
