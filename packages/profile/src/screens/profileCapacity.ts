import type { Capacity } from '@repo/core/types';

const PROFILE_CAPACITIES: readonly Capacity[] = [
  'student',
  'teacher',
  'gradeHead',
  'sectionHead',
  'principal',
  'assistantPrincipal',
  'parent',
  'guardian',
  'admin',
  'developer',
  'founder',
  'librarian',
  'nurse',
  'member',
];

/** Reject an unrecognized permission string before it reaches role-specific UI. */
export function toProfileCapacity(value: string | null | undefined): Capacity | null {
  return PROFILE_CAPACITIES.find((capacity) => capacity === value) ?? null;
}
