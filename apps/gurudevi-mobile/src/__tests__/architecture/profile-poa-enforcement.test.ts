import { useStore } from '../../../../../packages/core/src/store/useStore';
import { profileAPI } from '../../../../../packages/profile/src/api/profile';
import { socialAPI } from '../../../../../packages/profile/src/api/social';
import { profileServices } from '../../../../../packages/profile/src/domains/profile/runtime';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const SCHOOL_ID = '22222222-2222-4222-8222-222222222222';

describe('profile POA enforcement', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('blocks profile update for guests before service execution', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: null,
            schoolType: null,
        });

        const updateSpy = jest.spyOn(profileServices, 'updateProfile');

        await expect(
            profileAPI.updateProfile(USER_ID, { bio: 'forbidden' })
        ).rejects.toThrow('Forbidden');

        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('blocks social link mutation for guests before service execution', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: null,
            schoolType: null,
        } as any);

        const socialSpy = jest.spyOn(profileServices, 'upsertSocialLink');

        await expect(
            socialAPI.upsertSocialLink({
                user_id: USER_ID,
                platform: 'website',
                url: 'https://example.com',
                is_public: true,
                privacy_level: 'public',
                order_index: 0,
            })
        ).rejects.toThrow('Forbidden');

        expect(socialSpy).not.toHaveBeenCalled();
    });

    it('allows an authenticated teacher to update their profile through the service boundary', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: {
                id: USER_ID,
                email: 'teacher@example.com',
                roles: ['teacher'],
                authority: 'teacher',
                school_id: SCHOOL_ID,
                is_anonymous: false,
            },
            schoolType: 'school_workspace',
        });

        const updateSpy = jest.spyOn(profileServices, 'updateProfile').mockResolvedValue({
            id: USER_ID,
            full_name: 'Teacher',
            role: 'teacher',
            authority: 'teacher',
            bio: 'updated',
        });

        await expect(
            profileAPI.updateProfile(USER_ID, { bio: 'updated' })
        ).resolves.toEqual(expect.objectContaining({ bio: 'updated' }));

        expect(updateSpy).toHaveBeenCalledWith(USER_ID, { bio: 'updated' });
    });
});
