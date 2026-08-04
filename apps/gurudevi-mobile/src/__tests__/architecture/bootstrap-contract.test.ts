import { getBootstrapSessionState } from '@repo/core/logic/auth/bootstrapContract';
import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import { describe, expect, it } from 'vitest';

describe('bootstrap contract', () => {
  it('classifies the session bootstrap state', () => {
    expect(
      getBootstrapSessionState({
        bootstrapReady: false,
        sessionMode: null,
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toBe('booting');

    expect(
      getBootstrapSessionState({
        bootstrapReady: true,
        sessionMode: 'unauthenticated',
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toBe('public');

    expect(
      getBootstrapSessionState({
        bootstrapReady: true,
        sessionMode: 'guest',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toBe('onboarding-needed');

    expect(
      getBootstrapSessionState({
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toBe('onboarding-needed');

    expect(
      getBootstrapSessionState({
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: true,
        hasActiveCapacity: true,
        hasSession: true,
      }),
    ).toBe('ready');
  });

  it('returns a richer route policy for app entry and logout', () => {
    const onboarding = getAuthRouteTarget({
      pathname: '/self',
      bootstrapReady: true,
      sessionMode: 'authenticated',
      onboardingCompleted: false,
      hasActiveCapacity: false,
      hasSession: true,
    });

    expect(onboarding.policy.state).toBe('onboarding-needed');
    expect(onboarding.redirectTo).toBe('/onboarding');

    const guestOnboarding = getAuthRouteTarget({
      pathname: '/self',
      bootstrapReady: true,
      sessionMode: 'guest',
      onboardingCompleted: false,
      hasSession: true,
    });

    expect(guestOnboarding.policy.state).toBe('onboarding-needed');
    expect(guestOnboarding.redirectTo).toBe('/onboarding');

    const logout = getAuthRouteTarget({
      pathname: '/self',
      bootstrapReady: true,
      sessionMode: 'unauthenticated',
      onboardingCompleted: false,
      hasSession: false,
    });

    expect(logout.policy.state).toBe('public');
    expect(logout.redirectTo).toBe('/welcome');
  });

  it('routes an onboarded user without an active capacity back to capacity onboarding', () => {
    const target = getAuthRouteTarget({
      pathname: '/self',
      bootstrapReady: true,
      sessionMode: 'authenticated',
      onboardingCompleted: true,
      hasActiveCapacity: false,
      hasSession: true,
    });

    expect(target).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });
  });
});
