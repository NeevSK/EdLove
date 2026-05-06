import { User } from './User';

/**
 * Capacity: The functional role within a Bond.
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
  | 'staff'
  | 'member'
  | 'guest';

/**
 * Bond: A relationship between a User and an Entity.
 * The core of ReBAC.
 */
export interface Bond {
  id: string;
  userId: string;
  entityId: string; // Could be a School ID, Classroom ID, or 'GLOBAL'
  entityType: 'PLATFORM' | 'SCHOOL' | 'CLASSROOM' | 'COMMUNITY';
  capacity: Capacity;
  status: 'active' | 'archived' | 'pending';
  validFrom?: string;
  validUntil?: string;
  metadata?: Record<string, any>;
}

/**
 * Perspective: The lens through which a User is currently interacting with the platform.
 * Represents the "Authority in Reality".
 */
export interface Perspective {
  activeBond: Bond;
  availableBonds: Bond[];
}
