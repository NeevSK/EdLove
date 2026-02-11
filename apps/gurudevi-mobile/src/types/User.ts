/**
 * User Type Definitions
 * Defines user roles and user profile structure for Gurudevi
 */

/**
 * User Roles
 * - principal: School-wide access, can view all sections
 * - section_head: Section-level access (Primary/Junior/Senior)
 * - grade_head: Grade-level access (specific grade)
 * - teacher: Class-level access, can create lessons, manage classrooms
 * - student: Can view lessons, submit assignments
 * - developer: Full access for development and testing
 */
export type UserRole = 'principal' | 'section_head' | 'grade_head' | 'teacher' | 'student' | 'developer' | 'admin' | 'founder';

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
