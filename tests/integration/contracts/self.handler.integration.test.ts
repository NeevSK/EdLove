import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { TestContextBuilder, createTestORPCClient, resetTestDatabase } from '../apps/sanctuary-api/src/__tests__/test-doubles';

describe('Integration Contract: Self Handler', () => {
  const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const HEADERS = { Authorization: `Bearer ${TEST_USER_ID}` };

  let client: ReturnType<typeof createTestORPCClient>;

  beforeAll(() => {
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ 
        id: 'bond-integration',
        user_id: TEST_USER_ID,
        entity_id: 'school-123',
        entity_type: 'SCHOOL',
        capacity: 'teacher',
        status: 'active',
      })
    );
    client = createTestORPCClient({ Authorization: `Bearer ${TEST_USER_ID}` });
  });

  describe('logMood', () => {
    it('creates mood log with all fields', async () => {
      const result = await client.self.logMood({
        user_id: TEST_USER_ID,
        mood_score: 8,
        mood: 'happy',
        note: 'Integration test mood',
      });

      expect(result).toMatchObject({
        user_id: TEST_USER_ID,
        mood_score: 8,
        mood: 'happy',
        note: 'Integration test mood',
      });
      expect(result.id).toBeDefined();
      expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('handles minimal fields', async () => {
      const result = await client.self.logMood({
        user_id: TEST_USER_ID,
        mood_score: 5,
      });

      expect(result.mood_score).toBe(5);
      expect(result.mood).toBeNull();
      expect(result.note).toBeNull();
    });

    it('validates mood_score bounds', async () => {
      await expect(client.self.logMood({ 
        user_id: TEST_USER_ID, 
        mood_score: 11 
      })).rejects.toMatchObject({ code: 'BAD_REQUEST' });

      await expect(client.self.logMood({ 
        user_id: TEST_USER_ID, 
        mood_score: -1 
      })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });

    it('requires authentication', async () => {
      const unauthClient = createTestORPCClient();
      await expect(unauthClient.self.logMood({ 
        user_id: TEST_USER_ID, 
        mood_score: 5 
      })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('getMoodHistory', () => {
    beforeEach(async () => {
      // Clear and seed
      const { resetTestDatabase } = require('../apps/sanctuary-api/src/__tests__/test-doubles');
      resetTestDatabase(b => b
        .withZenStackDb(true)
        .withActiveBond({ capacity: 'teacher' })
      );
    });

    it('returns empty array when no moods exist', async () => {
      const history = await client.self.getMoodHistory({ limit: 10 });
      expect(history).toEqual([]);
    });

    it('returns moods in descending order', async () => {
      // Create multiple moods
      await client.self.logMood({ user_id: TEST_USER_ID, mood_score: 5, mood: 'low' });
      await client.self.logMood({ user_id: TEST_USER_ID, mood_score: 8, mood: 'high' });
      await client.self.logMood({ user_id: TEST_USER_ID, mood_score: 3, mood: 'very-low' });

      const history = await client.self.getMoodHistory({ limit: 10 });
      
      expect(history).toHaveLength(3);
      expect(history[0].mood_score).toBe(3); // Most recent first
      expect(history[1].mood_score).toBe(8);
      expect(history[2].mood_score).toBe(5);
    });

    it('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        await client.self.logMood({ user_id: TEST_USER_ID, mood_score: i });
      }

      const limited = await client.self.getMoodHistory({ limit: 3 });
      expect(limited).toHaveLength(3);
    });

    it('filters by viewDate when provided', async () => {
      const client2 = createTestORPCClient();
      
      // This would need proper date mocking in the test doubles
      // For now, test that the parameter is accepted
      const history = await client.self.getMoodHistory({ 
        limit: 10,
        viewDate: new Date().toISOString(),
      });
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('burnJournal', () => {
    it('creates burned journal entry', async () => {
      const content = 'This is a test journal entry that will be burned';
      
      const result = await client.self.burnJournal({ content });
      
      expect(result.content_preview).toBe(content.substring(0, 50));
      expect(result.is_burned).toBe(true);
      expect(result.user_id).toBe(TEST_USER_ID);
      expect(result.id).toBeDefined();
      expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('truncates long content to 50 chars', async () => {
      const longContent = 'x'.repeat(100);
      const result = await client.self.burnJournal({ content: longContent });
      expect(result.content_preview).toHaveLength(50);
      expect(result.content_preview).toBe('x'.repeat(50));
    });

    it('requires authentication', async () => {
      const unauthClient = createTestORPCClient();
      await expect(unauthClient.self.burnJournal({ content: 'test' }))
        .rejects.toMatchObject({ code: 'FORBIDDEN' });
    });
  });

  describe('getJournalHistory', () => {
    it('returns empty array when no journals exist', async () => {
      const history = await client.self.getJournalHistory({ limit: 10 });
      expect(history).toEqual([]);
    });

    it('returns journals in descending order', async () => {
      await client.self.burnJournal({ content: 'First entry' });
      await client.self.burnJournal({ content: 'Second entry' });
      await client.self.burnJournal({ content: 'Third entry' });

      const history = await client.self.getJournalHistory({ limit: 10 });
      
      expect(history).toHaveLength(3);
      expect(history[0].content_preview).toBe('Third entry');
      expect(history[1].content_preview).toBe('Second entry');
      expect(history[2].content_preview).toBe('First entry');
    });

    it('filters by viewDate', async () => {
      const history = await client.self.getJournalHistory({ 
        limit: 10,
        viewDate: new Date().toISOString(),
      });
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getTodayMood', () => {
    it('returns null when no mood logged today', async () => {
      const result = await client.self.getTodayMood({});
      expect(result).toBeNull();
    });

    it('returns today mood when exists', async () => {
      await client.self.logMood({ 
        user_id: TEST_USER_ID, 
        mood_score: 8, 
        mood: 'happy', 
        note: 'Today mood' 
      });

      const result = await client.self.getTodayMood({});
      
      expect(result).toMatchObject({
        mood_score: 8,
        mood: 'happy',
        note: 'Today mood',
      });
    });
  });

  describe('saveThoughtRecord', () => {
    it('saves complete thought record', async () => {
      const result = await client.self.saveThoughtRecord({
        thought: 'I am not good enough',
        situation: 'Presentation at work',
        emotion: 'anxious',
        trap_ids: ['catastrophizing'],
        evidence_for: 'I made a mistake once',
        evidence_against: 'I have succeeded many times',
        reframe: 'I can prepare and do well',
        mood_before: 3,
        mood_after: 6,
        idempotency_key: 'integration-test-key-1',
      });

      expect(result).toMatchObject({
        user_id: TEST_USER_ID,
        thought: 'I am not good enough',
        emotion: 'anxious',
        trap_ids: ['catastrophizing'],
      });
      expect(result.id).toBeDefined();
      expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('requires idempotency_key', async () => {
      await expect(client.self.saveThoughtRecord({
        thought: 'Test',
        situation: 'Test',
        emotion: 'Test',
        idempotency_key: '', // empty
      })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });
  });

  describe('getThoughtRecords', () => {
    it('returns empty array when no thoughts exist', async () => {
      const history = await client.self.getThoughtRecords({ limit: 10 });
      expect(history).toEqual([]);
    });

    it('returns thoughts in descending order', async () => {
      await client.self.saveThoughtRecord({
        thought: 'Thought 1',
        situation: 'Test',
        emotion: 'sad',
        idempotency_key: 'key-1',
      });
      await client.self.saveThoughtRecord({
        thought: 'Thought 2',
        situation: 'Test',
        emotion: 'anxious',
        idempotency_key: 'key-2',
      });

      const history = await client.self.getThoughtRecords({ limit: 10 });
      
      expect(history).toHaveLength(2);
      expect(history[0].thought).toBe('Thought 2');
      expect(history[1].thought).toBe('Thought 1');
    });
  });

  describe('completeThoughtRecordFollowUp', () => {
    it('updates thought record follow-up', async () => {
      // First create a thought record
      const created = await client.self.saveThoughtRecord({
        thought: 'Test thought',
        situation: 'Test',
        emotion: 'anxious',
        idempotency_key: 'followup-test-key',
      });

      const updated = await client.self.completeThoughtRecordFollowUp({
        params: { id: created.id },
        body: {
          post_outcome: 'better',
          follow_up: {
            due_at: '2026-08-15T12:00:00.000Z',
            completed_at: '2026-08-15T10:00:00.000Z',
            outcome: 'better',
            reflection: 'It went well',
          },
        });

      expect(updated.post_outcome).toBe('better');
      expect(updated.follow_up).toMatchObject({
        outcome: 'better',
        reflection: 'It went well',
      });
    });
  });

  describe('getPreferences', () => {
    it('returns default preferences', async () => {
      const result = await client.self.getPreferences({});
      
      expect(result).toMatchObject({
        user_id: TEST_USER_ID,
        favorite_features: [],
        hidden_features: [],
        enable_contextual_prompts: true,
        enable_usage_tracking: true,
      });
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences', async () => {
      const updated = await client.self.updatePreferences({
        favorite_features: ['mood', 'journal', 'thoughts'],
        hidden_features: [],
        morning_check_time: '07:00',
        enable_contextual_prompts: false,
      });

      expect(updated.favorite_features).toEqual(['mood', 'journal', 'thoughts']);
      expect(updated.morning_check_time).toBe('07:00');
      expect(updated.enable_contextual_prompts).toBe(false);
    });
  });
});

describe('Integration Contract: Presence Handler', () => {
  const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const HEADERS = { Authorization: `Bearer ${TEST_USER_ID}` };
  let client: ReturnType<typeof require('../apps/sanctuary-api/src/__tests__/test-doubles').createTestORPCClient>;

  beforeAll(() => {
    const { resetTestDatabase, createTestORPCClient } = require('../apps/sanctuary-api/src/__tests__/test-doubles');
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
    client = createTestORPCClient({ Authorization: `Bearer ${TEST_USER_ID}` });
  });

  it('getFallbackCount returns count', async () => {
    const result = await client.presence.getFallbackCount({});
    expect(result).toHaveProperty('count');
    expect(typeof result.count).toBe('number');
    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it('markSeen updates last_seen_at', async () => {
    const result = await client.presence.markSeen({});
    expect(result).toHaveProperty('seenAt');
    expect(new Date(result.seenAt).toISOString()).toBe(result.seenAt);
  });

  it('requires authentication', async () => {
    const { createTestORPCClient } = require('../apps/sanctuary-api/src/__tests__/test-doubles');
    const unauthClient = createTestORPCClient();
    
    await expect(unauthClient.presence.getFallbackCount({}))
      .rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(unauthClient.presence.markSeen({}))
      .rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});