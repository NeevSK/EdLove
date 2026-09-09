import { describe, expect, it } from 'vitest';

import { type BootstrapRouteState, getBootstrapRouteTarget } from '@/entry/bootstrapRouteState';

const authenticatedSession = {
  user: { id: 'account-a' },
} as BootstrapRouteState['session'];

function routeState(overrides: Partial<BootstrapRouteState> = {}): BootstrapRouteState {
  return {
    entitlement: {
      manifestLoaded: false,
      readiness: 'unknown',
      snapshotUserId: null,
    },
    hasLiveCapacity: true,
    hasProfileName: true,
    isProfileForSession: true,
    identityAvailability: 'active',
    isProfileResolving: false,
    isSessionLoading: false,
    onboardingCompleted: true,
    pathname: '/self',
    profileError: null,
    session: authenticatedSession,
    ...overrides,
  };
}

describe('bootstrap route-state adapter', () => {
  it('permits an offline return only when the entitlement snapshot belongs to the restored session', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        hasLiveCapacity: false,
        isProfileResolving: true,
        entitlement: {
          manifestLoaded: true,
          readiness: 'cached',
          snapshotUserId: 'account-a',
        },
      }),
    );

    expect(target).toMatchObject({ decision: 'app', redirectTo: null });
  });

  it('holds route authority while a mismatched cached snapshot cannot establish capacity', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        hasLiveCapacity: false,
        isProfileResolving: true,
        entitlement: {
          manifestLoaded: true,
          readiness: 'cached',
          snapshotUserId: 'account-b',
        },
      }),
    );

    expect(target).toMatchObject({ decision: 'booting', redirectTo: null });
  });

  it('routes a resolved unauthenticated session to the public shell', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        hasLiveCapacity: false,
        identityAvailability: 'unknown',
        onboardingCompleted: false,
        pathname: '/self',
        session: null,
      }),
    );

    expect(target).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });

  it('holds the current route while bootstrap inputs are still resolving', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        isSessionLoading: true,
        pathname: '/self',
      }),
    );

    expect(target).toMatchObject({ decision: 'booting', redirectTo: null });
  });

  it('routes an authenticated account without onboarding to onboarding', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        onboardingCompleted: false,
        pathname: '/self',
      }),
    );

    expect(target).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });
  });

  it('routes an active account with no display name to onboarding', () => {
    const target = getBootstrapRouteTarget(
      routeState({ hasProfileName: false, pathname: '/self' }),
    );

    expect(target).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });
  });

  it('holds a protected route while the loaded profile belongs to another account', () => {
    const target = getBootstrapRouteTarget(
      routeState({ hasLiveCapacity: false, hasProfileName: false, isProfileForSession: false }),
    );

    expect(target).toMatchObject({ decision: 'booting', redirectTo: null });
  });

  it('routes an inactive account to recovery instead of rendering app content', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        identityAvailability: 'inactive',
        pathname: '/self',
      }),
    );

    expect(target).toMatchObject({ decision: 'inactive-account', redirectTo: '/account-recovery' });
  });

  it('returns an authenticated user from the app entry path to the self shell', () => {
    const target = getBootstrapRouteTarget(
      routeState({
        pathname: '/',
      }),
    );

    expect(target).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });
});
