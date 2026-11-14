import { describe, expect, it } from 'vitest';
import { entryAccessFor } from '@/entry/entryAccess';

describe('entryAccessFor / G1, real admission rule and route catalogue', () => {
  it('admits the app routes once the person is admitted, and while booting', () => {
    expect(entryAccessFor('app', null).appRoutes).toBe(true);
    expect(entryAccessFor('booting', null).appRoutes).toBe(true);
  });

  it('refuses them otherwise, redirecting where the gate already sends the person', () => {
    expect(entryAccessFor('public', '/auth')).toEqual({ appRoutes: false, redirectTo: '/auth' });
    expect(entryAccessFor('onboarding', null)).toEqual({
      appRoutes: false,
      redirectTo: '/onboarding',
    });
    expect(entryAccessFor('inactive-account', null)).toEqual({
      appRoutes: false,
      redirectTo: '/welcome',
    });
  });

  it('never redirects to a destination that fails the navigation guard', () => {
    expect(entryAccessFor('public', 'https://evil.example').redirectTo).toBe('/welcome');
    expect(entryAccessFor('public', '/no-such-screen').redirectTo).toBe('/welcome');
  });
});
