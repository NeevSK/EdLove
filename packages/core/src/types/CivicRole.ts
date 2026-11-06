export type CivicRoleId = 'teacher' | 'student' | 'guardian';

export interface CivicRoleOption {
  readonly id: CivicRoleId;
  readonly label: string;
  readonly emoji: string;
  readonly verb: string;
}

/**
 * The One Canonical Civic Role dataset shared across all surfaces (Web & Mobile, Welcome & Onboarding).
 */
export const CANONICAL_CIVIC_ROLES: readonly CivicRoleOption[] = [
  { id: 'teacher', label: 'Teacher', emoji: '🧑‍🏫', verb: 'Teach & guide classes' },
  { id: 'student', label: 'Student', emoji: '🎒', verb: 'Learn & practice' },
  { id: 'guardian', label: 'Family & Guardian', emoji: '👨‍👩‍👧', verb: 'Follow student growth' },
] as const;
