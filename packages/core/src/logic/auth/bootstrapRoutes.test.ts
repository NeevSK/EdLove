import { describe, expect, it } from 'vitest';
import { getAuthRouteTarget, isPublicBootstrapRoute } from './bootstrapRoutes';

describe('web auth callback bootstrap route', () => {
  it('remains available to exchange a callback before a session exists', () => {
    expect(isPublicBootstrapRoute('/auth/callback')).toBe(true);
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasSession: false,
        onboardingCompleted: false,
        pathname: '/auth/callback',
        sessionMode: 'unauthenticated',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('hands a completed callback to the established app entry route', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveCapacity: true,
        hasSession: true,
        identityAvailability: 'active',
        onboardingCompleted: true,
        pathname: '/auth/callback',
        sessionMode: 'authenticated',
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });

  it('admits guest onboarding only for an anonymous session', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasSession: false,
        onboardingCompleted: false,
        pathname: '/onboarding',
        sessionMode: 'unauthenticated',
        guestOnboardingIntent: true,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });

    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasSession: true,
        onboardingCompleted: false,
        pathname: '/onboarding',
        sessionMode: 'anonymous',
        guestOnboardingIntent: true,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('resumes a completed anonymous guest after an explicit Explore action', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasActiveCapacity: true,
        hasSession: true,
        onboardingCompleted: true,
        pathname: '/onboarding',
        sessionMode: 'anonymous',
        guestOnboardingIntent: true,
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });

  it('never treats an anonymous session alone as admission to a protected route', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasSession: true,
        onboardingCompleted: false,
        pathname: '/self',
        sessionMode: 'anonymous',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });

  it('keeps a cold anonymous root launch on welcome even if a prior guest completed onboarding', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasActiveCapacity: true,
        hasSession: true,
        onboardingCompleted: true,
        pathname: '/',
        sessionMode: 'anonymous',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });
});
