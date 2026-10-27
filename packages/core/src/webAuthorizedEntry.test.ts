import { describe, expect, it } from 'vitest';
import { mapAuthorizedEntry } from './webAuthorizedEntry';

const activeScope = {
  bondId: 'bond-1',
  entityId: 'personal-sanctuary-1',
  entityType: 'PERSONAL_CLASSROOM',
  roles: ['TEACHER'],
} as const;
const accountId = '01234567-89ab-8101-8000-010203040506';

describe('mapAuthorizedEntry', () => {
  it('maps complete authoritative facts into a route-safe ready result', () => {
    expect(
      mapAuthorizedEntry({
        kind: 'active',
        accountId,
        authSubjectId: 'auth-subject-1',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
        primaryScopeRole: 'TEACHER',
        activeScope,
      }),
    ).toEqual({
      kind: 'ready',
      accountId,
      authSubjectId: 'auth-subject-1',
      displayName: 'Nadeesha',
      activeCapacity: 'TEACHER',
      primaryScopeRole: 'TEACHER',
      activeScope,
    });
  });

  it.each([
    [
      'requires a display name',
      {
        kind: 'active',
        accountId,
        authSubjectId: 'subject',
        displayName: ' ',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
        primaryScopeRole: 'TEACHER',
        activeScope,
      },
      'missing-display-name',
    ],
    [
      'requires completed onboarding',
      {
        kind: 'active',
        accountId,
        authSubjectId: 'subject',
        displayName: 'Nadeesha',
        onboardingCompleted: false,
        activeCapacity: 'TEACHER',
        primaryScopeRole: 'TEACHER',
        activeScope,
      },
      'onboarding-incomplete',
    ],
    [
      'requires a server-selected active scope',
      {
        kind: 'active',
        accountId,
        authSubjectId: 'subject',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: null,
        primaryScopeRole: null,
        activeScope: null,
      },
      'missing-active-scope',
    ],
  ] as const)('%s', (_description, facts, reason) => {
    expect(mapAuthorizedEntry(facts)).toEqual({ kind: 'onboarding-required', reason });
  });

  it('rejects malformed active facts instead of authorizing a route', () => {
    expect(
      mapAuthorizedEntry({
        kind: 'active',
        accountId,
        authSubjectId: '',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
        primaryScopeRole: 'TEACHER',
        activeScope,
      }),
    ).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
  });

  it('rejects missing or malformed canonical account IDs', () => {
    expect(
      mapAuthorizedEntry({
        kind: 'active',
        accountId: 'not-a-uuid',
        authSubjectId: 'subject',
        displayName: 'Nadeesha',
        onboardingCompleted: true,
        activeCapacity: 'TEACHER',
        primaryScopeRole: 'TEACHER',
        activeScope,
      }),
    ).toMatchObject({ kind: 'unavailable', reason: 'invalid-authoritative-entry' });
  });

  it('preserves inactive state and makes upstream failures explicit', () => {
    expect(
      mapAuthorizedEntry({ kind: 'inactive', message: 'This account is deactivated.' }),
    ).toEqual({ kind: 'inactive', message: 'This account is deactivated.' });
    expect(
      mapAuthorizedEntry({ kind: 'unavailable', message: 'Identity service is offline.' }),
    ).toEqual({
      kind: 'unavailable',
      reason: 'profile-unavailable',
      message: 'Identity service is offline.',
    });
  });
});
