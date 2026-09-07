import type { Session } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { resolveAuthProfile } from './profileResolution';

function session(): Session {
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
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-09-01T00:00:00.000Z',
    },
  } as Session;
}

describe('resolveAuthProfile', () => {
  it('returns active identity facts and resolves the school type', async () => {
    const getSchoolType = vi.fn().mockResolvedValue('government');
    const getAccountLifecycleStatus = vi.fn();

    await expect(
      resolveAuthProfile(session(), {
        getAccountLifecycleStatus,
        getSchoolType,
        identifyActiveCitizen: async () => ({
          id: 'account-1',
          email: 'member@example.com',
          display_name: 'Member',
          availableBonds: [],
          onboarding_completed: false,
          schoolId: 'school-1',
        }),
      }),
    ).resolves.toMatchObject({
      kind: 'active',
      schoolType: 'government',
    });

    expect(getSchoolType).toHaveBeenCalledWith('school-1');
    expect(getAccountLifecycleStatus).not.toHaveBeenCalled();
  });

  it('classifies a deactivated authenticated profile separately from an unavailable one', async () => {
    const deactivatedStatus = {
      status: 'deactivated' as const,
      deactivated_at: '2026-09-01T00:00:00.000Z',
      request_id: 'request-1',
      scheduled_for: null,
      reason: 'requested',
    };

    await expect(
      resolveAuthProfile(session(), {
        getAccountLifecycleStatus: async () => deactivatedStatus,
        getSchoolType: vi.fn(),
        identifyActiveCitizen: async () => null,
      }),
    ).resolves.toEqual({ kind: 'inactive', accountLifecycleStatus: deactivatedStatus });

    await expect(
      resolveAuthProfile(session(), {
        getAccountLifecycleStatus: async () => ({ ...deactivatedStatus, status: 'active' as const }),
        getSchoolType: vi.fn(),
        identifyActiveCitizen: async () => null,
      }),
    ).resolves.toEqual({
      kind: 'unavailable',
      profileError: 'Unable to restore your account profile.',
    });

    await expect(
      resolveAuthProfile(session(), {
        getAccountLifecycleStatus: async () => {
          throw new Error('RPC function missing');
        },
        getSchoolType: vi.fn(),
        identifyActiveCitizen: async () => null,
      }),
    ).resolves.toEqual({
      kind: 'unavailable',
      profileError: 'RPC function missing',
    });
  });
});
