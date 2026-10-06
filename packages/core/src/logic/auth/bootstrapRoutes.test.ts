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

  it('allows a cold anonymous root launch to resume /self if a prior guest completed onboarding and is ready', () => {
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
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });

  it('keeps an incomplete anonymous guest on welcome on root launch', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasActiveCapacity: false,
        hasSession: true,
        onboardingCompleted: false,
        pathname: '/',
        sessionMode: 'anonymous',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });

  it('allows an anonymous guest to visit auth without redirecting to self', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasActiveCapacity: true,
        hasSession: true,
        onboardingCompleted: true,
        pathname: '/auth',
        sessionMode: 'anonymous',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('allows an anonymous guest to exchange an auth callback without redirecting to self', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveAccessToken: true,
        hasActiveCapacity: true,
        hasSession: true,
        onboardingCompleted: true,
        pathname: '/auth/callback',
        sessionMode: 'anonymous',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });
});

