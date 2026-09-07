import type { Session } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { getVerifiedDeviceAccountProfile } from '../useAuthLifecycle';

function session(overrides: Record<string, unknown> = {}): Session {
  return {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: 4_102_444_800,
    token_type: 'bearer',
    user: {
      id: 'account-1',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'member@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-09-01T00:00:00.000Z',
      ...overrides,
    },
  } as Session;
}

const resolvedIdentity = {
  id: 'account-1',
  email: 'member@example.com',
  display_name: 'Member',
  availableBonds: [],
  activeBond: { id: 'bond-1', capacity: 'guardian' },
  schoolId: 'school-1',
};

describe('getVerifiedDeviceAccountProfile', () => {
  it('maps an identity only after it agrees with an authenticated session', () => {
    expect(getVerifiedDeviceAccountProfile(session(), resolvedIdentity)).toEqual({
      id: 'account-1',
      email: 'member@example.com',
      display_name: 'Member',
      avatar_url: null,
      capacity: 'guardian',
      school_id: 'school-1',
    });
  });

  it('rejects anonymous, sandbox, unresolved, and mismatched sessions', () => {
    expect(
      getVerifiedDeviceAccountProfile(session({ is_anonymous: true }), resolvedIdentity),
    ).toBeNull();
    expect(
      getVerifiedDeviceAccountProfile(
        session({ user_metadata: { experience_mode: 'sandbox' } }),
        resolvedIdentity,
      ),
    ).toBeNull();
    expect(getVerifiedDeviceAccountProfile(null, resolvedIdentity)).toBeNull();
    expect(getVerifiedDeviceAccountProfile({} as Session, resolvedIdentity)).toBeNull();
  });
});
