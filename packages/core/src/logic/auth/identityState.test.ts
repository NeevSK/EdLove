import { describe, expect, it } from 'vitest';
import {
  isActiveIdentityProfile,
  isCurrentAuthBootstrapGeneration,
  isCurrentIdentityResolutionGeneration,
  isResolvedAuthSubjectCurrent,
} from './identityState';

describe('identity activity boundary', () => {
  it('accepts an active profile', () => {
    expect(isActiveIdentityProfile({ deleted_at: null })).toBe(true);
    expect(isActiveIdentityProfile({})).toBe(true);
  });

  it('rejects a soft-deactivated profile', () => {
    expect(isActiveIdentityProfile({ deleted_at: '2026-09-01T00:00:00.000Z' })).toBe(false);
  });

  it('rejects a missing profile', () => {
    expect(isActiveIdentityProfile(null)).toBe(false);
    expect(isActiveIdentityProfile(undefined)).toBe(false);
  });
});

describe('auth bootstrap freshness', () => {
  it('accepts an initial session result when no newer auth event occurred', () => {
    expect(isCurrentAuthBootstrapGeneration(4, 4)).toBe(true);
  });

  it('rejects an initial session result after a newer auth event', () => {
    expect(isCurrentAuthBootstrapGeneration(4, 5)).toBe(false);
  });
});

describe('auth subject and profile resolution boundaries', () => {
  it('rejects a stale profile resolution result', () => {
    expect(isCurrentIdentityResolutionGeneration(3, 4)).toBe(false);
    expect(isCurrentIdentityResolutionGeneration(4, 4)).toBe(true);
  });

  it('matches a resolved auth subject without comparing it to the public account ID', () => {
    expect(isResolvedAuthSubjectCurrent('auth-subject-1', 'auth-subject-1')).toBe(true);
    expect(isResolvedAuthSubjectCurrent('auth-subject-1', 'auth-subject-2')).toBe(false);
    expect(isResolvedAuthSubjectCurrent(null, 'auth-subject-1')).toBe(false);
  });
});
