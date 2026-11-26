import type { Bond } from '@repo/core/logic/schemas/identity.schema';

export type CitizenshipTier = 'FIRST_CLASS' | 'SECOND_CLASS' | 'THIRD_CLASS';

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
