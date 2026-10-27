import { profileAPI, profileAPI as rawProfileAPI } from '@repo/core/api/profile';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import { afterEach, describe, expect, it, vi } from 'vitest';

const profileMocks = vi.hoisted(() => ({
  upsertSocialLink: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('@repo/core/logic/managers/factory', () => ({
  profile: profileMocks,
}));

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
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      ...useAuthStore.getState(),
      user: null,
    });
    vi.spyOn(useTenantStore, 'getState').mockReturnValue({
      ...useTenantStore.getState(),
      schoolType: null,
    });

    const fetchSpy = vi.spyOn(global, 'fetch');

    await expect(profileAPI.updateProfile(USER_ID, { bio: 'forbidden' })).rejects.toThrow(
      'Access Denied',
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('blocks social link mutation for guests before service execution', async () => {
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      ...useAuthStore.getState(),
      user: null,
    });
    vi.spyOn(useTenantStore, 'getState').mockReturnValue({
      ...useTenantStore.getState(),
      schoolType: null,
    });

    await expect(
      profileAPI.upsertSocialLink(USER_ID, {
        platform: 'website',
        url: 'https://example.com',
        is_public: true,
        privacy_level: 'public',
        order_index: 0,
      }),
    ).rejects.toThrow('Forbidden');

    expect(profileMocks.upsertSocialLink).not.toHaveBeenCalled();
  });

  it('allows an authenticated teacher to update their profile through the service boundary', async () => {
    vi.spyOn(useAuthStore, 'getState').mockReturnValue({
      ...useAuthStore.getState(),
      user: {
        id: USER_ID,
        display_name: 'Teacher',
        email: 'teacher@example.com',
        capacity: 'teacher',
        school_id: SCHOOL_ID,
        is_anonymous: false,
        created_at: '2026-10-26T00:00:00.000Z',
      },
    });
    vi.spyOn(useTenantStore, 'getState').mockReturnValue({
      ...useTenantStore.getState(),
      schoolType: 'school_workspace',
    });

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
