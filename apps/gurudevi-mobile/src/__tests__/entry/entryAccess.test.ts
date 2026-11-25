import { describe, expect, it } from 'vitest';
import { entryAccessFor } from '@/entry/entryAccess';

describe('entryAccessFor — 5-zone Stack.Protected topology', () => {
  it('closes app routes during booting so tabs never mount under the splash', () => {
    const access = entryAccessFor('booting', null);
    expect(access).toMatchObject({
      decision: 'booting',
      publicAuthRoutes: true,
      recoveryRoutes: false,
      onboardingRoutes: false,
      appRoutes: false,
      redirectTo: '/welcome',
      appEntryHref: '/self',
    });
  });

  it('routes signed-out returning devices with remembered accounts to /auth', () => {
    const access = entryAccessFor('public', null, { hasRememberedAccounts: true });
    expect(access).toMatchObject({
      publicAuthRoutes: true,
      recoveryRoutes: true,
      onboardingRoutes: false,
      appRoutes: false,
      redirectTo: '/auth',
    });
  });

  it('never opens onboarding for standalone public state without auth or guest session', () => {
    const access = entryAccessFor('public', null, { guestOnboardingIntent: true });
    expect(access.onboardingRoutes).toBe(false);
    expect(access.appRoutes).toBe(false);
  });

  it('isolates inactive accounts to recovery and closes app/public/onboarding zones', () => {
    const access = entryAccessFor('inactive-account', '/account-recovery');
    expect(access).toMatchObject({
      publicAuthRoutes: false,
      recoveryRoutes: true,
      onboardingRoutes: false,
      appRoutes: false,
      redirectTo: '/account-recovery',
    });
  });

  it('isolates onboarding and preserves institutional appEntryHref', () => {
    const access = entryAccessFor('onboarding', '/onboarding', { appEntryPath: '/workspace' });
    expect(access).toMatchObject({
      publicAuthRoutes: false,
      recoveryRoutes: false,
      onboardingRoutes: true,
      appRoutes: false,
      redirectTo: '/onboarding',
      appEntryHref: '/workspace',
    });
  });

  it('closes public/onboarding/recovery for admitted cloud accounts', () => {
    const access = entryAccessFor('app', null, {
      isGuestSession: false,
      appEntryPath: '/workspace',
    });
    expect(access).toMatchObject({
      publicAuthRoutes: false,
      recoveryRoutes: false,
      onboardingRoutes: false,
      appRoutes: true,
      appEntryHref: '/workspace',
    });
  });

  it('keeps public/auth open for admitted guests so they can upgrade to a cloud account', () => {
    const access = entryAccessFor('app', null, { isGuestSession: true });
    expect(access).toMatchObject({
      publicAuthRoutes: true,
      recoveryRoutes: false,
      onboardingRoutes: false,
      appRoutes: true,
    });
  });
});
