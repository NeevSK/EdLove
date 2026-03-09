import { UserRole } from '../constants/SriLankanSchools';
export type { UserRole };

/**
 * User Profile Interface
 * Represents a Gurudevi user with role and school context
 */
export interface User {
    id: string;                  // Internal Gurudevi User UUID (from public.users, resolved via auth_identities)
    email: string;               // User's email address
    full_name: string;           // Display name
    role: UserRole;              // User's role in the system
    school_id: string;           // UUID of the school they belong to
    created_at: string;          // ISO timestamp
    updated_at?: string;         // ISO timestamp (optional)
    avatar_url?: string;         // Profile picture URL (optional)
    is_anonymous?: boolean;      // Flag for anonymous/guest users
    profile_completed: boolean;  // Flag for "No Trust" barrier
    bio?: string;                // User bio
    role_label?: string;         // Personalized role label (e.g. "Physics Teacher")
    index_number?: string;       // Mandatory for students
    nic_number?: string;         // Mandatory for teachers
    organization_name?: string;  // Name of the user's organization/school
    onboarding_completed?: boolean; // Flag indicating if user has completed onboarding
    onboarding_completed_at?: string; // Timestamp when onboarding was completed
    public_profile?: boolean;      // Visibility flag for community profile (optional — defaults to false if absent)
    /**
     * Private orientation fingerprint — 4-dimensional learning tendency vector.
     * Set during onboarding orientation step and updated via behavioral inference.
     * Never surfaced as a type label; used only for silent UX personalisation.
     * Keys: depth_breadth | reflect_act | solo_social | steady_surge (all 0–100).
     */
    orientation_seeds?: {
        depth_breadth: number;
        reflect_act: number;
        solo_social: number;
        steady_surge: number;
        source: 'seeded' | 'inferred' | 'mixed';
        seeded_at?: string;
        last_updated?: string;
    } | null;
}

/**
 * Auth Session (from Supabase)
 */
export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: User;
}

/**
 * Sign Up Data
 * Data required to create a new user account
 */
export interface SignUpData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    school_id?: string;          // Optional - can be selected or created during signup
}

/**
 * Login Data
 */
export interface LoginData {
    email: string;
    password: string;
}
