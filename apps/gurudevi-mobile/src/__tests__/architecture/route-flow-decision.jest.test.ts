import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';

describe('route flow decisions', () => {
  it('sends logout or unauthenticated users back to welcome', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/self',
        bootstrapReady: true,
        sessionMode: 'guest',
        onboardingCompleted: false,
        hasSession: false,
      }),
    ).toMatchObject({ decision: 'public', redirectTo: '/welcome' });
  });

  it('sends onboarded users into the app after login', () => {
    expect(
      getAuthRouteTarget({
        pathname: '/auth',
        bootstrapReady: true,
        sessionMode: 'authenticated',
        onboardingCompleted: true,
        hasSession: true,
      }),
    ).toMatchObject({ decision: 'app', redirectTo: '/self' });
  });

  it('sends signed-in users without onboarding to onboarding', () => {
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
});
