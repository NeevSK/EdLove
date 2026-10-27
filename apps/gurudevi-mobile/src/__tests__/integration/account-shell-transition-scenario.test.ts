import { describe, expect, it } from 'vitest';

import { type BootstrapRouteState, getBootstrapRouteTarget } from '@/entry/bootstrapRouteState';

function snapshot(
  userId: string | null,
  overrides: Partial<BootstrapRouteState> = {},
): BootstrapRouteState {
  return {
    entitlement: { manifestLoaded: false, readiness: 'unknown', snapshotUserId: null },
    hasActiveAccessToken: Boolean(userId),
    hasLiveCapacity: true,
    hasProfileName: true,
    principalId: userId,
    identityAvailability: userId ? 'active' : 'unknown',
    isProfileForSession: Boolean(userId),
    isProfileResolving: false,
    isSessionLoading: false,
    onboardingCompleted: true,
    pathname: '/self',
    profileError: null,
    session: userId
      ? ({
          access_token: 'active-access-token',
          expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
          user: { id: userId },
        } as BootstrapRouteState['session'])
      : null,
    ...overrides,
  };
}

describe('account-scoped shell transition scenario', () => {
  it('never lets account A shell state become account B chrome or public chrome', () => {
    const accountA = getBootstrapRouteTarget(snapshot('account-a'));
    expect(accountA).toMatchObject({ decision: 'app', redirectTo: null });

    const accountBWithAccountAProfile = getBootstrapRouteTarget(
      snapshot('account-b', {
        hasLiveCapacity: false,
        hasProfileName: false,
        isProfileForSession: false,
      }),
    );
    expect(accountBWithAccountAProfile).toMatchObject({ decision: 'booting', redirectTo: null });

    const incompleteAccountB = getBootstrapRouteTarget(
      snapshot('account-b', { hasProfileName: false, onboardingCompleted: false }),
    );
    expect(incompleteAccountB).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });

    const completeAccountB = getBootstrapRouteTarget(snapshot('account-b'));
    expect(completeAccountB).toMatchObject({ decision: 'app', redirectTo: null });

    const signedOut = getBootstrapRouteTarget(snapshot(null));
    expect(signedOut).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });
});
