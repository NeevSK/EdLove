import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockUserData, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: oRPC endpoints (Self & Profile)', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const authenticatedHeaders = {
    Authorization: `Bearer ${userId}`,
  };

  const defaultMockUser = {
    id: userId,
    full_name: 'Test Citizen',
    display_name: 'Test Citizen',
    username: 'testcitizen',
    capacity: 'teacher',
    school_id: 'school-123',
    onboarding_completed: true,
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-123',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockUserData(defaultMockUser);
  });

  describe('Self Router', () => {
    it('should successfully get user preferences', async () => {
      const body = await createTestORPCClient(authenticatedHeaders).self.getPreferences();
      expect(body).toBeDefined();
    });

    it('should successfully log a new mood log entry', async () => {
      const moodPayload = {
        user_id: userId,
        mood_score: 5,
        mood: 'joy',
        note: 'Feeling great!',
      };

      const body = await createTestORPCClient(authenticatedHeaders).self.logMood({
        body: moodPayload,
      });
      expect(body.mood).toBe('joy');
    });
  });

  describe('Profile Router', () => {
    it('should retrieve a user profile by ID', async () => {
      const body = await createTestORPCClient(authenticatedHeaders).profile.getUserProfile({
        params: { id: userId },
      });
      expect(body.id).toBe(userId);
      expect(body.username).toBe('testcitizen');
    });

    it('should update profile info and return updated object', async () => {
      const updatePayload = {
        params: { id: userId },
        body: {
          bio: 'Inspirational teacher',
        },
      };

      const body =
        await createTestORPCClient(authenticatedHeaders).profile.updateProfile(updatePayload);
      expect(body.bio).toBe('Inspirational teacher');
    });

    it('should manage social links through the native profile contract', async () => {
      const client = createTestORPCClient(authenticatedHeaders).profile;
      expect(await client.getSocialLinks({})).toEqual([]);
      const link = await client.upsertSocialLink({
        body: {
          platform: 'website',
          url: 'https://example.com',
        },
      });
      expect(link).toMatchObject({
        user_id: userId,
        platform: 'website',
        url: 'https://example.com',
      });
      expect(
        await client.deleteSocialLink({ params: { id: '423e4567-e89b-12d3-a456-426614174000' } }),
      ).toEqual({ success: true });
    });
  });
});
