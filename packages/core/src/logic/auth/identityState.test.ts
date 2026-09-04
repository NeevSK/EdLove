import { describe, expect, it } from 'vitest';
import { isActiveIdentityProfile } from './identityState';

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
