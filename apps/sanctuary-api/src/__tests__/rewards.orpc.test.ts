import './setup';
import { reinitializeCedar } from '@repo/policies/engine/evaluator';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockQueryRowsQueue,
  setMockUserRewards,
  setMockUserRewardsVersions,
  setMockWhisperedMoments,
  setMockZenStackDbAvailable,
} from './setup';

describe('rewards API', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    reinitializeCedar();
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-rewards',
      user_id: userId,
      entity_id: '123e4567-e89b-12d3-a456-426614174002',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockUserRewards(null);
    setMockUserRewardsVersions([]);
    setMockWhisperedMoments([]);
    setMockQueryRowsQueue([]);
  });

  describe('getRewards', () => {
    it('returns null when user has no rewards', async () => {
      setMockUserRewards(null);
      const response = await createTestORPCClient(headers).rewards.getRewards({ query: {} });
      expect(response).toBeNull();
    });

    it('returns user rewards when they exist', async () => {
      setMockUserRewards({
        id: 'rewards-1',
        user_id: userId,
        points: 100,
        badges: ['Sanctuary Seeker'],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      const response = await createTestORPCClient(headers).rewards.getRewards({ query: {} });

      expect(response).toMatchObject({
        user_id: userId,
        points: 100,
        badges: ['Sanctuary Seeker'],
      });
    });

    it('rejects an attempt to read another user rewards through a query override', async () => {
      await expect(
        createTestORPCClient(headers).rewards.getRewards({
          query: { userId: '223e4567-e89b-12d3-a456-426614174000' },
        }),
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('getRewardsHistory', () => {
    it('returns empty array when no history exists', async () => {
      const response = await createTestORPCClient(headers).rewards.getRewardsHistory({ query: {} });
      expect(response).toEqual([]);
    });

    it('returns history ordered by recorded_at desc', async () => {
      setMockUserRewardsVersions([
        {
          id: '823e4567-e89b-12d3-a456-426614174101',
          user_id: userId,
          operation: 'add_points',
          recorded_at: '2026-08-14T10:00:00.000Z',
          recorded_by: userId,
          snapshot: { points: 100 },
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174102',
          user_id: userId,
          operation: 'award_badge',
          recorded_at: '2026-08-13T10:00:00.000Z',
          recorded_by: userId,
          snapshot: { points: 50 },
        },
      ]);

      const response = await createTestORPCClient(headers).rewards.getRewardsHistory({ query: {} });

      expect(response).toHaveLength(2);
      expect(response[0].operation).toBe('add_points');
      expect(response[0].recorded_at).toBe('2026-08-14T10:00:00.000Z');
      expect(response[1].operation).toBe('award_badge');
    });

    it('respects limit parameter', async () => {
      setMockUserRewardsVersions([
        {
          id: '823e4567-e89b-12d3-a456-426614174111',
          user_id: userId,
          operation: 'op1',
          recorded_at: '2026-08-14T10:00:00.000Z',
          recorded_by: userId,
          snapshot: {},
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174112',
          user_id: userId,
          operation: 'op2',
          recorded_at: '2026-08-13T10:00:00.000Z',
          recorded_by: userId,
          snapshot: {},
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174113',
          user_id: userId,
          operation: 'op3',
          recorded_at: '2026-08-12T10:00:00.000Z',
          recorded_by: userId,
          snapshot: {},
        },
      ]);

      const response = await createTestORPCClient(headers).rewards.getRewardsHistory({
        query: { limit: 2 },
      });

      expect(response).toHaveLength(2);
      expect(response[0].operation).toBe('op1');
      expect(response[1].operation).toBe('op2');
    });
  });

  describe('getRewardsAsOf', () => {
    it('returns null when no history exists before date', async () => {
      const response = await createTestORPCClient(headers).rewards.getRewardsAsOf({
        query: { asOf: '2026-08-14T10:00:00.000Z' },
      });
      expect(response).toBeNull();
    });

    it('returns rewards snapshot as of given date', async () => {
      setMockUserRewardsVersions([
        {
          id: '823e4567-e89b-12d3-a456-426614174121',
          user_id: userId,
          operation: 'add_points',
          recorded_at: '2026-08-14T09:00:00.000Z',
          recorded_by: userId,
          snapshot: {
            id: '823e4567-e89b-12d3-a456-426614174000',
            user_id: userId,
            points: 50,
            badges: [],
            created_at: '2026-08-01T00:00:00.000Z',
            updated_at: '2026-08-14T09:00:00.000Z',
          },
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174122',
          user_id: userId,
          operation: 'award_badge',
          recorded_at: '2026-08-14T11:00:00.000Z',
          recorded_by: userId,
          snapshot: {
            id: '823e4567-e89b-12d3-a456-426614174000',
            user_id: userId,
            points: 100,
            badges: ['Sanctuary Seeker'],
            created_at: '2026-08-01T00:00:00.000Z',
            updated_at: '2026-08-14T11:00:00.000Z',
          },
        },
      ]);

      // findFirst with recorded_at.lte 10:00, ordered desc, returns the 09:00 version
      const response = await createTestORPCClient(headers).rewards.getRewardsAsOf({
        query: { asOf: '2026-08-14T10:00:00.000Z' },
      });

      expect(response).toMatchObject({
        user_id: userId,
        points: 50,
        badges: [],
      });
    });
  });

  describe('getRewardsRangeHistory', () => {
    it('returns empty array when no history exists', async () => {
      const response = await createTestORPCClient(headers).rewards.getRewardsRangeHistory({
        query: { viewDate: '2026-08-14', viewScale: 'day' },
      });
      expect(response).toEqual([]);
    });

    it('returns history for day view within the day window', async () => {
      setMockUserRewardsVersions([
        {
          id: '823e4567-e89b-12d3-a456-426614174131',
          user_id: userId,
          operation: 'add_points',
          recorded_at: '2026-08-14T09:00:00.000Z',
          recorded_by: userId,
          snapshot: { points: 50 },
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174132',
          user_id: userId,
          operation: 'award_badge',
          recorded_at: '2026-08-14T11:00:00.000Z',
          recorded_by: userId,
          snapshot: { points: 100 },
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174133',
          user_id: userId,
          operation: 'award_badge',
          recorded_at: '2026-08-15T09:00:00.000Z',
          recorded_by: userId,
          snapshot: { points: 150 },
        },
      ]);

      const response = await createTestORPCClient(headers).rewards.getRewardsRangeHistory({
        query: { viewDate: '2026-08-14', viewScale: 'day' },
      });

      // Day window is [08-14 00:00, 08-15 00:00). Both 08-14 entries fall in range;
      // the 08-15 09:00 entry is excluded. Results ordered by recorded_at desc.
      expect(response).toHaveLength(2);
      expect(response[0].operation).toBe('award_badge');
      expect(response[1].operation).toBe('add_points');
    });
  });

  describe('initializeRewards', () => {
    it('creates new rewards for user without existing rewards', async () => {
      setMockUserRewards(null);

      const response = await createTestORPCClient(headers).rewards.initializeRewards({
        body: { userId },
      });

      expect(response).toMatchObject({
        user_id: userId,
        points: 0,
        badges: [],
      });
      expect(response.id).toMatch(/^[0-9a-f]{8}-/);
    });

    it('returns existing rewards if already initialized', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 50,
        badges: ['Early Bird'],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      const response = await createTestORPCClient(headers).rewards.initializeRewards({
        body: { userId },
      });

      expect(response).toMatchObject({
        points: 50,
        badges: ['Early Bird'],
      });
    });
  });

  describe('addPoints', () => {
    it('rejects self-service point grants', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 50,
        badges: [],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      await expect(
        createTestORPCClient(headers).rewards.addPoints({ body: { userId, points: 25 } }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('allows a platform administrator to apply a server-authorized points grant', async () => {
      setMockUserRewards(null);
      setMockActiveBond({
        id: 'bond-rewards-admin',
        user_id: userId,
        entity_id: 'PLATFORM',
        entity_type: 'PLATFORM',
        capacity: 'admin',
        status: 'active',
      });

      const response = await createTestORPCClient(headers).rewards.addPoints({
        body: { userId, points: 100 },
      });

      expect(response).toMatchObject({
        user_id: userId,
        points: 100,
        badges: [],
      });
    });
  });

  describe('awardBadge', () => {
    it('rejects self-service badge grants', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 0,
        badges: [],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      await expect(
        createTestORPCClient(headers).rewards.awardBadge({
          body: { userId, badge: 'Sanctuary Seeker' },
        }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('allows an administrator to make an idempotent badge grant', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 0,
        badges: ['Sanctuary Seeker'],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });
      setMockActiveBond({
        id: 'bond-rewards-admin',
        user_id: userId,
        entity_id: 'PLATFORM',
        entity_type: 'PLATFORM',
        capacity: 'admin',
        status: 'active',
      });

      const response = await createTestORPCClient(headers).rewards.awardBadge({
        body: { userId, badge: 'Sanctuary Seeker' },
      });

      expect(response.badges).toEqual(['Sanctuary Seeker']);
    });
  });

  describe('checkAndAwardAchievements', () => {
    it('awards Sanctuary Seeker when all sections visited', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 0,
        badges: [],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });
      setMockQueryRowsQueue([
        [
          { feature_name: 'section_self' },
          { feature_name: 'section_community' },
          { feature_name: 'section_library' },
          { feature_name: 'section_profile' },
        ],
      ]);

      const response = await createTestORPCClient(headers).rewards.checkAndAwardAchievements({
        body: { userId },
      });

      expect(response.newAchievements).toContain('Sanctuary Seeker');
      expect(response.updatedRewards.badges).toContain('Sanctuary Seeker');
    });

    it('does not award duplicate achievements', async () => {
      setMockUserRewards({
        id: '823e4567-e89b-12d3-a456-426614174000',
        user_id: userId,
        points: 50,
        badges: ['Sanctuary Seeker'],
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });
      setMockQueryRowsQueue([
        [
          { feature_name: 'section_self' },
          { feature_name: 'section_community' },
          { feature_name: 'section_library' },
          { feature_name: 'section_profile' },
        ],
      ]);

      const response = await createTestORPCClient(headers).rewards.checkAndAwardAchievements({
        body: { userId },
      });

      expect(response.newAchievements).toEqual([]);
      expect(response.updatedRewards.badges).toEqual(['Sanctuary Seeker']);
    });
  });

  describe('getWhisperedMoments', () => {
    it('returns empty array when no moments exist', async () => {
      const response = await createTestORPCClient(headers).rewards.getWhisperedMoments({
        query: {},
      });
      expect(response).toEqual([]);
    });

    it('returns whispered moments for user', async () => {
      setMockWhisperedMoments([
        {
          id: '823e4567-e89b-12d3-a456-426614174141',
          user_id: userId,
          key: 'first_login',
          name: 'First Login',
          description: 'Welcome to the sanctuary',
          stage: 'discovery',
          created_at: '2026-08-01T10:00:00.000Z',
        },
        {
          id: '823e4567-e89b-12d3-a456-426614174142',
          user_id: userId,
          key: 'first_mood_log',
          name: 'First Mood Log',
          description: 'Logged your first mood',
          stage: 'engagement',
          created_at: '2026-08-02T10:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).rewards.getWhisperedMoments({
        query: {},
      });

      expect(response).toHaveLength(2);
      expect(response[0].key).toBe('first_mood_log');
      expect(response[1].key).toBe('first_login');
    });
  });
});
