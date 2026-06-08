import { profileAPI as rawProfileAPI } from '@repo/core/api/profile';
import { profile, useStore } from '@repo/core/logic';
import type { TotalState } from '@repo/core/store';

import { profileAPI } from '@repo/profile/api';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock checkLocalPermission to bypass dynamic WASM/database sync in headless testing
vi.mock('@repo/core/logic/permissions/localEvaluator', () => ({
  checkLocalPermission: vi.fn(async (params) => {
    const isAnonymous = !params.userContext || params.userContext.isAnonymous;
    return !isAnonymous;
  }),
}));

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SCHOOL_ID = '22222222-2222-4222-8222-222222222222';

describe('profile POA enforcement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks profile update for guests before service execution', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: null,
      schoolType: null,
    } as unknown as TotalState);

    const updateSpy = vi.spyOn(rawProfileAPI, 'updateProfile');

    await expect(profileAPI.updateProfile(USER_ID, { bio: 'forbidden' })).rejects.toThrow(
      'Access Denied',
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('blocks social link mutation for guests before service execution', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: null,
      schoolType: null,
    } as unknown as TotalState);

    const socialSpy = vi.spyOn(profile, 'upsertSocialLink');

    await expect(
      profileAPI.upsertSocialLink(USER_ID, {
        platform: 'website',
        url: 'https://example.com',
        is_public: true,
        privacy_level: 'public',
        order_index: 0,
      }),
    ).rejects.toThrow('Forbidden');

    expect(socialSpy).not.toHaveBeenCalled();
  });

  it('allows an authenticated teacher to update their profile through the service boundary', async () => {
    vi.spyOn(useStore, 'getState').mockReturnValue({
      user: {
        id: USER_ID,
        email: 'teacher@example.com',
        capacitys: ['teacher'],
        capacity: 'teacher',
        school_id: SCHOOL_ID,
        is_anonymous: false,
      },
      schoolType: 'school_workspace',
    } as unknown as TotalState);

    const updateSpy = vi.spyOn(rawProfileAPI, 'updateProfile').mockResolvedValue({
      id: USER_ID,
      display_name: 'Teacher',
      capacity: 'teacher',
      bio: 'updated',
    });

    await expect(profileAPI.updateProfile(USER_ID, { bio: 'updated' })).resolves.toEqual(
      expect.objectContaining({ bio: 'updated' }),
    );

    expect(updateSpy).toHaveBeenCalledWith(USER_ID, { bio: 'updated' });
  });
});
