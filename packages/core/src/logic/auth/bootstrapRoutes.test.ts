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
});
