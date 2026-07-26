/**
 * OnboardingState - Explicit states for the user onboarding journey.
 * Following the Sovereign Kernel architectural roadmap.
 */
export type OnboardingState =
  | 'ARRIVAL' // Step 0: User has landed, needs to enter name
  | 'IDENTITY_SELECTION' // Step 1: Name is set, needs to select capacity
  | 'SANCTUARY_INIT' // Step 2-6: Capacity is set, completing the sanctuary tour
  | 'COMPLETED'; // Onboarding finished, profile synced

export const OnboardingStates = {
  ARRIVAL: 'ARRIVAL',
  IDENTITY_SELECTION: 'IDENTITY_SELECTION',
  SANCTUARY_INIT: 'SANCTUARY_INIT',
  COMPLETED: 'COMPLETED',
} as const;

import type { Bond } from '@/types/Identity';

/**
 * Maps raw user profile data to an explicit onboarding state.
 * This is the single source of truth for "where" a user is in their journey.
 */
export function getOnboardingState(
  user:
    | {
        display_name?: string | null;
        onboarding_completed?: boolean | null;
      }
    | null
    | undefined,
  activeBond: Bond | null | undefined,
): OnboardingState {
  if (!user) return 'ARRIVAL';

  if (user.onboarding_completed) {
    return 'COMPLETED';
  }

  // Step 0 -> 1 Transition: Name entry
  const name = user.display_name?.trim();
  if (!name || name === '' || name === 'Guest User') {
    return 'ARRIVAL';
  }

  // Step 1 -> 2 Transition: Identity Orientation (ReBAC)
  // If they have a name but NO active relationship bond, they need to select one
  if (!activeBond) {
    return 'IDENTITY_SELECTION';
  }

  // Step 2 -> 6 + Finish: Sanctuary Tour
  // If they have name and a Bond but haven't marked completed, they are in SANCTUARY_INIT
  return 'SANCTUARY_INIT';
}

/**
 * Defines the progression order of states.
 */
export const OnboardingProgression: OnboardingState[] = [
  'ARRIVAL',
  'IDENTITY_SELECTION',
  'SANCTUARY_INIT',
  'COMPLETED',
];

/**
 * Checks if a user has reached or passed a certain state.
 */
export function hasReachedState(current: OnboardingState, target: OnboardingState): boolean {
  return OnboardingProgression.indexOf(current) >= OnboardingProgression.indexOf(target);
}
