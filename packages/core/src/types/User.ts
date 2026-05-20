import type { Bond } from './Identity';
import type { SocialLink } from './Social';
import type { Membership, TenantKind } from './Tenancy';

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
 * User Profile Interface
 * Represents a Gurudevi user with contextual identity and school context
 */
export interface User extends ProfileStats {
  id: string; // Internal Gurudevi User UUID (from public.users, resolved via auth_identities)
  email?: string | null; // User's email address
  display_name: string; // Canonical in-app display name
  full_name?: string | null; // Legacy mirror for older persisted rows only
  first_name?: string | null; // Preferred first name
  last_name?: string | null; // Preferred last name
  bonds?: Bond[]; // Sovereign Identity (ReBAC) Relationships
  school_id?: string | null; // UUID of the school they belong to
  username?: string | null; // Unique handle for the user
  created_at: string | Date; // ISO timestamp or Date object
  updated_at?: string | Date; // ISO timestamp or Date object (optional)
  avatar_url?: string | null; // Profile picture URL (optional)
  is_anonymous?: boolean | null; // Flag for anonymous/guest users
  identity_state?: 'anonymous' | 'onboarded' | 'verified' | string | null;
  profile_completed?: boolean; // Flag for "No Trust" barrier
  bio?: string | null; // User bio
  capacity_label?: string | null; // Personalized capacity label (e.g. "Physics Teacher")
  index_number?: string | null; // Mandatory for students
  nic_number?: string | null; // Mandatory for teachers
  organization_name?: string | null; // Name of the user's organization/school
  school_name?: string | null; // Alias for organization_name
  tenant_kind?: TenantKind | null; // Distinguishes internal, customer, demo, and sandbox tenants
  tier?: string | null;
  citizenship?: 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS' | string | null;
  pricing_tier?: 'FREE' | 'PRO' | 'INSTITUTIONAL' | string | null;
  features?: string[];
  flags?: Record<string, boolean | string>;
  onboarding_completed?: boolean | null; // Flag indicating if user has completed onboarding
  onboarding_completed_at?: string | Date | null; // Timestamp when onboarding was completed
  public_profile?: boolean | null; // Visibility flag for community profile (optional  defaults to false if absent)
  section_id?: string | null;
  grade_id?: string | null;
  classroom_id?: string | null;

  // Profile specific fields
  is_thuthimal?: boolean;
  thuthimal_gifter?: string;
  thuthimal_gifted_at?: string;
  level?: number;
  phone?: string;
  experience_years?: number;
  subjects_taught?: string | string[];
  qualifications?: string | string[];
  social_links?: SocialLink[];

  /**
   * Private orientation fingerprint  4-dimensional learning tendency vector.
   * Set during onboarding orientation step and updated via behavioral inference.
   * Never surfaced as a type label; used only for silent UX personalisation.
   * Keys: depth_breadth | reflect_act | solo_social | steady_surge (all 0100).
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
  avatar_url: string | null;
  username: string | null;
  full_name: string;
  initialCapacity?: string; // Optional - used to seed the first bond
  school_id?: string; // Optional - can be selected or created during signup
}

/**
 * Login Data
 */
export interface LoginData {
  email: string;
  password: string;
}
