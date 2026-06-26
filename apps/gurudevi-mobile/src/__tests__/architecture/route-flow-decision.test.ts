import { describe, expect, it } from 'vitest';
import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';

describe('route flow decision helper', () => {
  it('keeps public routes on welcome and sends others to welcome when unauthenticated', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/profile',
        bootstrapReady: true,
        sessionMode: 'guest',
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });

    expect(
      getAuthRouteTarget({
        pathname: '/welcome',
        bootstrapReady: true,
        sessionMode: 'guest',
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

  it('routes onboarded authenticated users away from public entry points', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/welcome',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: true,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });
});
