import { describe, expect, it } from 'vitest';

import { type BootstrapRouteState, getBootstrapRouteTarget } from '@/entry/bootstrapRouteState';
import { getEntryPresentation } from '@/entry/entryPresentation';

const activeSession = {
  access_token: 'active-access-token',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  user: { id: 'account-a' },
} as BootstrapRouteState['session'];

const anonymousSession = {
  access_token: 'anonymous-access-token',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  user: { id: 'guest-a', is_anonymous: true },
} as BootstrapRouteState['session'];

function snapshot(overrides: Partial<BootstrapRouteState> = {}): BootstrapRouteState {
  return {
    entitlement: { manifestLoaded: false, readiness: 'unknown', snapshotUserId: null },
    hasActiveAccessToken: true,
    hasLiveCapacity: true,
    hasProfileName: true,
    isGuestRouteStateLoading: false,
    isLocalGuestReady: false,
    isProfileForSession: true,
    identityAvailability: 'active',
    isProfileResolving: false,
    isSessionLoading: false,
    onboardingCompleted: true,
    pathname: '/',
    profileError: null,
    session: activeSession,
    ...overrides,
  };
}

describe('entry route matrix', () => {
  it.each([
    {
      name: 'cold signed-out launch',
      state: snapshot({
        hasActiveAccessToken: false,
        hasLiveCapacity: false,
        hasProfileName: false,
        identityAvailability: 'unknown',
        onboardingCompleted: false,
        session: null,
      }),
      decision: 'public',
      redirectTo: '/welcome',
      presentation: 'transition',
    },
    {
      name: 'active teacher reaches institutional dispatcher',
      state: snapshot({ activeCapacity: 'teacher' }),
      decision: 'app',
      redirectTo: '/workspace',
      presentation: 'transition',
    },
    {
      name: 'active learner reaches personal continuation',
      state: snapshot({ activeCapacity: 'student' }),
      decision: 'app',
      redirectTo: '/self',
      presentation: 'transition',
    },
    {
      name: 'onboarding-required account cannot enter protected content',
      state: snapshot({ onboardingCompleted: false, pathname: '/self' }),
      decision: 'onboarding',
      redirectTo: '/onboarding',
      presentation: 'transition',
    },
    {
      name: 'inactive account reaches account recovery',
      state: snapshot({ identityAvailability: 'inactive', pathname: '/self' }),
      decision: 'inactive-account',
      redirectTo: '/account-recovery',
      presentation: 'transition',
    },
    {
      name: 'account-mismatched cached capability snapshot cannot admit content',
      state: snapshot({
        entitlement: { manifestLoaded: true, readiness: 'cached', snapshotUserId: 'account-b' },
        hasLiveCapacity: false,
        isProfileForSession: false,
        isProfileResolving: true,
        pathname: '/self',
      }),
      decision: 'booting',
      redirectTo: null,
      presentation: 'restoring',
    },
    {
      name: 'matching offline snapshot can restore the same account',
      state: snapshot({
        entitlement: { manifestLoaded: true, readiness: 'cached', snapshotUserId: 'account-a' },
        hasLiveCapacity: false,
        isProfileResolving: true,
        pathname: '/self',
      }),
      decision: 'app',
      redirectTo: null,
      presentation: 'content',
    },
    {
      name: 'completed local guest admission can open protected content',
      state: snapshot({
        hasLiveCapacity: false,
        hasProfileName: false,
        isLocalGuestReady: true,
        onboardingCompleted: true,
        pathname: '/self',
        session: anonymousSession,
      }),
      decision: 'app',
      redirectTo: null,
      presentation: 'content',
    },
    {
      name: 'anonymous session without local admission cannot open protected content',
      state: snapshot({
        hasLiveCapacity: false,
        hasProfileName: false,
        onboardingCompleted: false,
        pathname: '/self',
        session: anonymousSession,
      }),
      decision: 'public',
      redirectTo: '/welcome',
      presentation: 'transition',
    },
  ])('$name', ({ state, decision, redirectTo, presentation }) => {
    const routeTarget = getBootstrapRouteTarget(state);
    const result = getEntryPresentation({
      pathname: state.pathname,
      profileError: state.profileError,
      routeTarget,
    });

    expect(routeTarget).toMatchObject({ decision, redirectTo });
    expect(result.kind).toBe(presentation);
  });
});
