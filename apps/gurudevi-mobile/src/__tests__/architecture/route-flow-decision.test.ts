import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import { describe, expect, it } from 'vitest';

describe('route flow decision helper', () => {
  it('keeps public routes on welcome and sends others to welcome when unauthenticated', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/profile',
        bootstrapReady: true,
        sessionMode: 'unauthenticated',
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });

    expect(
      getAuthRouteTarget({
        pathname: '/welcome',
        bootstrapReady: true,
        sessionMode: 'unauthenticated',
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('routes authenticated users without onboarding to onboarding', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/self',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });
  });

  it('keeps a server-confirmed inactive account out of onboarding and app routes', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/onboarding',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        identityAvailability: 'inactive',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'inactive-account', redirectTo: '/account-recovery' });

    expect(
      getAuthRouteTarget({
        pathname: '/account-recovery',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        identityAvailability: 'inactive',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'inactive-account', redirectTo: null });
  });

  it('does not infer inactivity from an unknown identity resolution', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/self',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        identityAvailability: 'unknown',
        onboardingCompleted: false,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'onboarding', redirectTo: '/onboarding' });
  });

  it('keeps welcome visible while a remembered authenticated session restores', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/welcome',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: true,
        hasActiveCapacity: true,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'app', redirectTo: null });
  });

  it('keeps guest onboarding available after choosing to explore', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/onboarding',
        bootstrapReady: true,
        sessionMode: 'anonymous',
        onboardingCompleted: false,
        hasActiveCapacity: false,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('keeps the explicit guest handoff on onboarding while the old account snapshot drains', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/onboarding',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: true,
        hasActiveCapacity: true,
        hasActiveAccessToken: true,
        hasSession: true,
        guestOnboardingIntent: true,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('does not treat a completed anonymous session as a returning account at root', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/',
        bootstrapReady: true,
        sessionMode: 'anonymous',
        onboardingCompleted: true,
        hasActiveCapacity: true,
        hasActiveAccessToken: true,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });
});
