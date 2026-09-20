import type { ActiveCitizen } from '@repo/core/api/identity';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import { getSessionIdentityMode } from '@repo/core/logic/auth/identityState';
import type { AccountLifecycleStatus, AuthSession } from '@repo/core/logic/ports/auth.port';

export type AuthProfileResolution =
  | { kind: 'active'; identity: ActiveCitizen; schoolType: SchoolType | null }
  | { kind: 'inactive'; accountLifecycleStatus: AccountLifecycleStatus }
  | { kind: 'unavailable'; profileError: string | null };

export interface AuthProfileResolutionDependencies {
  getAccountLifecycleStatus: () => Promise<AccountLifecycleStatus>;
  getSchoolType: (schoolId: string) => Promise<SchoolType | null>;
  identifyActiveCitizen: () => Promise<ActiveCitizen | null>;
}

/** Resolves remote identity facts without applying React or store state. */
export async function resolveAuthProfile(
  session: AuthSession | null,
  {
    getAccountLifecycleStatus,
    getSchoolType,
    identifyActiveCitizen,
  }: AuthProfileResolutionDependencies,
): Promise<AuthProfileResolution> {
  const identity = await identifyActiveCitizen();

  if (identity) {
    return {
      kind: 'active',
      identity,
      schoolType: identity.schoolId ? await getSchoolType(identity.schoolId) : null,
    };
  }

  if (getSessionIdentityMode(session) !== 'authenticated') {
    return { kind: 'unavailable', profileError: null };
  }

  try {
    const accountLifecycleStatus = await getAccountLifecycleStatus();
    if (accountLifecycleStatus.status === 'deactivated') {
      return { kind: 'inactive', accountLifecycleStatus };
    }
  } catch (error) {
    return {
      kind: 'unavailable',
      profileError:
        error instanceof Error ? error.message : 'Unable to restore your account profile.',
    };
  }

  return { kind: 'unavailable', profileError: 'Unable to restore your account profile.' };
}
