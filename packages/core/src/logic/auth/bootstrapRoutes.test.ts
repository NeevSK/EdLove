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

  it('preserves a caller-selected workspace entry route after a completed callback', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasActiveCapacity: true,
        hasSession: true,
        identityAvailability: 'active',
        onboardingCompleted: true,
        pathname: '/auth/callback',
        sessionMode: 'authenticated',
        appEntryPath: '/workspace',
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/workspace' });
  });

  it('admits guest onboarding only for an anonymous Auth session or local device guest', () => {
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
        hasLocalGuestSession: true,
        hasSession: false,
        onboardingCompleted: false,
        pathname: '/onboarding',
        sessionMode: 'unauthenticated',
        guestOnboardingIntent: true,
      }),
    ).toMatchObject({ decision: 'onboarding', redirectTo: null });

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
    ).toMatchObject({ decision: 'onboarding', redirectTo: null });
  });

  it('never treats /onboarding as a standalone public route without auth or guest session', () => {
    expect(isPublicBootstrapRoute('/onboarding')).toBe(false);
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasSession: false,
        onboardingCompleted: false,
        pathname: '/onboarding',
        sessionMode: 'unauthenticated',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });

  it('keeps an offline user with a verified profile admitted even if the access token expired', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasSession: true,
        hasActiveAccessToken: false,
        isOfflineWithVerifiedProfile: true,
        hasProfileForSession: true,
        hasProfileName: true,
        hasActiveCapacity: true,
        identityAvailability: 'active',
        onboardingCompleted: true,
        pathname: '/',
        sessionMode: 'authenticated',
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
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

  it('allows an admitted device-local guest to visit /auth and /auth/callback to upgrade', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasLocalGuestSession: true,
        hasActiveCapacity: true,
        hasSession: false,
        onboardingCompleted: true,
        pathname: '/auth',
        sessionMode: 'unauthenticated',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });

    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasLocalGuestSession: true,
        hasActiveCapacity: true,
        hasSession: false,
        onboardingCompleted: true,
        pathname: '/auth/callback',
        sessionMode: 'unauthenticated',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: null });
  });

  it('routes a signed-out returning device with remembered accounts to /auth', () => {
    expect(
      getAuthRouteTarget({
        bootstrapReady: true,
        hasSession: false,
        hasRememberedAccounts: true,
        onboardingCompleted: false,
        pathname: '/',
        sessionMode: 'unauthenticated',
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/auth' });
  });
});
