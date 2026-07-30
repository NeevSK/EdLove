/**
 * Capacity: The functional capacity within a Bond.
 * Replaces the concept of a "Global Role".
 */
export type Capacity =
  | 'admin'
  | 'founder'
  | 'developer'
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

/**
 * Bond: A relationship between a User and an Entity.
 * The core of ReBAC.
 */
export interface Bond {
  id: string;
  user_id: string;
  entity_id: string; // Could be a School ID, Classroom ID, or 'GLOBAL'
  entity_type:
    | 'PLATFORM'
    | 'SCHOOL'
    | 'CLASSROOM'
    | 'COMMUNITY'
    | 'GROUP'
    | 'PERSONAL'
    | 'PERSONAL_CLASSROOM';
  capacity: Capacity;
  status: 'active' | 'archived' | 'pending';
  valid_from?: string;
  valid_until?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Perspective: The lens through which a User is currently interacting with the platform.
 * Represents the "Authority in Reality".
 */
export interface Perspective {
  activeBond?: Bond;
  availableBonds?: Bond[];
}
