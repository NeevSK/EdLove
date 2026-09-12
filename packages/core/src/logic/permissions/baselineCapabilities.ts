import type { Action } from '@repo/core/types/authorization';

/**
 * Read-only surfaces that remain useful while remote capability state hydrates.
 *
 * This is presentation policy only. It does not authorize writes or replace
 * server-side Cedar checks for protected data operations.
 */
const BASELINE_READ_SUBJECTS: ReadonlySet<string> = new Set([
  'SelfJourney',
  'InnerPulse',
  'SelfCare',
  'SelfReflection',
  'CommunityFeed',
  'CommunityGroups',
  'CommunityPost',
  'Library',
  'LibraryResource',
  'LibrarySearch',
  'PublicLibrary',
]);

const LOCAL_ONLY_MUTATION_SUBJECTS: ReadonlySet<string> = new Set([
  'SelfJourney',
  'InnerPulse',
  'SelfCare',
  'SelfReflection',
]);

export function isBaselineReadCapability(action: Action | string, subject: string) {
  return action === 'read' && BASELINE_READ_SUBJECTS.has(subject);
}

export function isLocalOnlyMutation(action: Action | string, subject: string) {
  return (
    ['create', 'update', 'delete'].includes(action) && LOCAL_ONLY_MUTATION_SUBJECTS.has(subject)
  );
}
