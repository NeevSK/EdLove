import { UserRole } from '../constants/SriLankanSchools';
export type { UserRole };

/**
 * User Profile Interface
 * Represents a Gurudevi user with role and school context
 */
export interface User {
    id: string;                  // UUID from Supabase auth
    email: string;               // User's email address
    full_name: string;           // Display name
    role: UserRole;              // User's role in the system
    school_id: string;           // UUID of the school they belong to
    created_at: string;          // ISO timestamp
    updated_at?: string;         // ISO timestamp (optional)
    avatar_url?: string;         // Profile picture URL (optional)
    is_anonymous?: boolean;      // NEW: Flag for anonymous/guest users
    profile_completed: boolean;  // NEW: Flag for "No Trust" barrier
    bio?: string;                // User bio
    role_label?: string;         // Personalized role label (e.g. "Physics Teacher")
    index_number?: string;       // NEW: Mandatory for students
    nic_number?: string;         // NEW: Mandatory for teachers
    onboarding_completed?: boolean; // Flag indicating if user has completed onboarding
    onboarding_completed_at?: string; // Timestamp when onboarding was completed
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
