import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import { describe, expect, it } from 'vitest';

describe('route flow parity', () => {
  it('returns the same route decision for mobile and web entry points', () => {
    const mobile = getAuthRouteTarget({
      pathname: '/profile',
      bootstrapReady: true,
      sessionMode: 'unauthenticated',
      onboardingCompleted: false,
      hasSession: false,
    });

    const web = getAuthRouteTarget({
      pathname: '/profile',
      bootstrapReady: true,
      sessionMode: 'unauthenticated',
      onboardingCompleted: false,
      hasSession: false,
    });

    expect(mobile).toEqual(web);
    expect(mobile.redirectTo).toBe('/welcome');
    expect(mobile.policy.reason).toBe('no-session');
  });
});
