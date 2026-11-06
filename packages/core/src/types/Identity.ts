export type Capacity =
  | 'admin'
  | 'founder'
  | 'coFounder'
  | 'director'
  | 'developer'
  | 'systemEngineer'
  | 'teacher'
  | 'student'
  | 'principal'
  | 'assistantPrincipal'
  | 'gradeHead'
  | 'sectionHead'
  | 'parent'
  | 'guardian'
  | 'librarian'
  | 'nurse'
  | 'member';

export type CitizenshipTier = 'FIRST_CLASS' | 'SECOND_CLASS' | 'THIRD_CLASS';

/**
 * Bond: The atomic unit of ReBAC.
 * Relational covenant between a User and an Entity, conferring Capacity and Civic Standing.
 */
export interface Bond {
  id: string;
  user_id: string;
  entity_id: string; // School ID, Classroom ID, or 'GLOBAL'
  entity_type:
    | 'PLATFORM'
    | 'SCHOOL'
    | 'CLASSROOM'
    | 'COMMUNITY'
    | 'GROUP'
    | 'PERSONAL';
  capacity: Capacity;
  citizenship?: CitizenshipTier;
  status: 'active' | 'archived' | 'pending';
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, unknown>;
}

/** Citizenship is stored on each bond. No bond, or an unset value, is the lowest class. */
export function resolveBondCitizenship(
  bond: Pick<Bond, 'citizenship'> | null | undefined,
): CitizenshipTier {
  return bond?.citizenship ?? 'THIRD_CLASS';
}

/** Canonical identity projection used by the auth and relationship adapters. */
export interface Identity {
  id: string;
  email?: string | null;
  display_name?: string | null;
  onboarding_completed?: boolean;
  schoolId?: string | null;
  activeBond?: Bond | null;
  availableBonds: Bond[];
}

/**
 * Contextual bond slice (active and available bonds for a citizen).
 * Note: For workspace lenses, use `SanctuaryPerspective` from `@repo/core/types/Perspective`.
 */
export interface Perspective {
  activeBond?: Bond;
  availableBonds?: Bond[];
}
