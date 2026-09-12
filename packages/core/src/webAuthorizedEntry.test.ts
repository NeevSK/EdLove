import { describe, expect, it } from 'vitest';
import { mapAuthorizedEntry } from './webAuthorizedEntry';

describe('mapAuthorizedEntry', () => {
  it('maps complete authoritative facts into a route-safe ready result', () => {
    expect(
      mapAuthorizedEntry({
        kind: 'active',
        authSubjectId: 'auth-subject-1',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
      }),
    ).toEqual({
      kind: 'ready',
      authSubjectId: 'auth-subject-1',
      displayName: 'Nadeesha',
      activeCapacity: 'TEACHER',
    });
  });

  it.each([
    [
      'requires a display name',
      { kind: 'active', authSubjectId: 'subject', displayName: ' ', onboardingCompleted: true, activeCapacity: 'TEACHER' },
      'missing-display-name',
    ],
    [
      'requires completed onboarding',
      { kind: 'active', authSubjectId: 'subject', displayName: 'Nadeesha', onboardingCompleted: false, activeCapacity: 'TEACHER' },
      'onboarding-incomplete',
    ],
    [
      'requires an active capacity',
      { kind: 'active', authSubjectId: 'subject', displayName: 'Nadeesha', onboardingCompleted: true, activeCapacity: null },
      'missing-active-capacity',
    ],
  ] as const)('%s', (_description, facts, reason) => {
    expect(mapAuthorizedEntry(facts)).toEqual({ kind: 'onboarding-required', reason });
  });

  it('rejects malformed active facts instead of authorizing a route', () => {
    expect(
      mapAuthorizedEntry({
        kind: 'active',
        authSubjectId: '',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
      }),
    ).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
  });

  it('preserves inactive state and makes upstream failures explicit', () => {
    expect(mapAuthorizedEntry({ kind: 'inactive', message: 'This account is deactivated.' })).toEqual({ kind: 'inactive', message: 'This account is deactivated.' });
    expect(mapAuthorizedEntry({ kind: 'unavailable', message: 'Identity service is offline.' })).toEqual({ kind: 'unavailable', reason: 'profile-unavailable', message: 'Identity service is offline.' });
  });
});
