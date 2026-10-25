import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockFireJournalEntries,
  setMockMoodLogs,
  setMockThoughtRecords,
  setMockUserPreferences,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: self via native oRPC', () => {
  const userId = '123e4567-e89b-8101-8000-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-self',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockMoodLogs([]);
    setMockFireJournalEntries([]);
    setMockThoughtRecords([]);
    setMockUserPreferences(null);
  });

  describe('logMood', () => {
    it('logs a mood entry and returns the created record', async () => {
      const response = await createTestORPCClient(headers).self.logMood({
        body: { user_id: userId, mood_score: 8, mood: 'happy', note: 'Feeling great' },
      });

      expect(response).toMatchObject({
        user_id: userId,
        mood_score: 8,
        mood: 'happy',
        note: 'Feeling great',
      });
      expect(response.id).toBeDefined();
      expect(response.created_at).toBeDefined();
    });

    it('logs a mood with minimal fields', async () => {
      const response = await createTestORPCClient(headers).self.logMood({
        body: { user_id: userId, mood_score: 0, mood: null, note: null },
      });
      expect(response.mood_score).toBe(0);
      expect(response.mood).toBeNull();
      expect(response.note).toBeNull();
    });

    it('requires authentication', async () => {
      await expect(
        createTestORPCClient().self.logMood({ body: { user_id: userId, mood_score: 5 } }),
      ).rejects.toBeTruthy();
    });
  });

  describe('getMoodHistory', () => {
    it('returns mood history for the authenticated user', async () => {
      setMockMoodLogs([
        {
          id: 'm1',
          user_id: userId,
          mood_score: 8,
          mood: 'happy',
          note: 'Day 1',
          created_at: '2026-08-14T09:00:00.000Z',
        },
        {
          id: 'm2',
          user_id: userId,
          mood_score: 6,
          mood: 'okay',
          note: 'Day 2',
          created_at: '2026-08-13T09:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).self.getMoodHistory({
        query: { limit: 10 },
      });

      expect(response).toHaveLength(2);
      expect(response[0]).toMatchObject({ mood_score: 8, mood: 'happy' });
      expect(response[1]).toMatchObject({ mood_score: 6, mood: 'okay' });
    });

    it('respects limit parameter', async () => {
      setMockMoodLogs([
        {
          id: 'm1',
          user_id: userId,
          mood_score: 8,
          mood: 'happy',
          created_at: '2026-08-14T09:00:00.000Z',
        },
        {
          id: 'm2',
          user_id: userId,
          mood_score: 6,
          mood: 'okay',
          created_at: '2026-08-13T09:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).self.getMoodHistory({
        query: { limit: 1 },
      });
      expect(response).toHaveLength(1);
    });

    it('returns empty array when no mood logs exist', async () => {
      const response = await createTestORPCClient(headers).self.getMoodHistory({
        query: { limit: 10 },
      });
      expect(response).toEqual([]);
    });
  });

  describe('burnJournal', () => {
    it('burns a journal entry and returns the created record', async () => {
      const content = 'This is a test journal entry that will be burned';

      const response = await createTestORPCClient(headers).self.burnJournal({ body: { content } });

      expect(response).toMatchObject({
        user_id: userId,
        content_preview: content.substring(0, 50),
        is_burned: true,
      });
      expect(response.id).toBeDefined();
      expect(response.created_at).toBeDefined();
    });

    it('truncates content preview to 50 chars', async () => {
      const content = 'x'.repeat(80);

      const response = await createTestORPCClient(headers).self.burnJournal({ body: { content } });

      expect(response.content_preview).toHaveLength(50);
      expect(response.content_preview).toBe('x'.repeat(50));
    });

    it('requires authentication', async () => {
      await expect(
        createTestORPCClient().self.burnJournal({ body: { content: 'test' } }),
      ).rejects.toBeTruthy();
    });
  });

  describe('getJournalHistory', () => {
    it('returns journal history for the authenticated user', async () => {
      setMockFireJournalEntries([
        {
          id: 'j1',
          user_id: userId,
          content_preview: 'Entry 1',
          is_burned: true,
          created_at: '2026-08-14T11:00:00.000Z',
        },
        {
          id: 'j2',
          user_id: userId,
          content_preview: 'Entry 2',
          is_burned: true,
          created_at: '2026-08-13T11:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).self.getJournalHistory({
        query: { limit: 10 },
      });

      expect(response).toHaveLength(2);
      expect(response[0]).toMatchObject({ content_preview: 'Entry 1', is_burned: true });
      expect(response[1]).toMatchObject({ content_preview: 'Entry 2', is_burned: true });
    });

    it('filters by viewDate when provided', async () => {
      setMockFireJournalEntries([
        {
          id: 'j1',
          user_id: userId,
          content_preview: 'Today entry',
          is_burned: true,
          created_at: '2026-08-14T08:00:00.000Z',
        },
        {
          id: 'j2',
          user_id: userId,
          content_preview: 'Other entry',
          is_burned: true,
          created_at: '2026-08-13T11:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).self.getJournalHistory({
        query: { limit: 10, viewDate: new Date('2026-08-14T12:00:00.000Z').toISOString() },
      });

      expect(response).toHaveLength(1);
      expect(response[0].content_preview).toBe('Today entry');
    });
  });

  describe('getTodayMood', () => {
    it("returns today's mood when exists", async () => {
      setMockMoodLogs([
        {
          id: 'm1',
          user_id: userId,
          mood_score: 8,
          mood: 'happy',
          note: 'Today mood',
          created_at: new Date().toISOString(),
        },
      ]);

      const response = await createTestORPCClient(headers).self.getTodayMood({ query: {} });

      expect(response).toMatchObject({ mood_score: 8, mood: 'happy', note: 'Today mood' });
    });

    it('returns null when no mood logged today', async () => {
      const response = await createTestORPCClient(headers).self.getTodayMood({ query: {} });
      expect(response).toBeNull();
    });
  });

  describe('saveThoughtRecord', () => {
    it('saves a thought record and returns the created record', async () => {
      const response = await createTestORPCClient(headers).self.saveThoughtRecord({
        body: {
          thought: 'I am not good enough',
          situation: 'Presentation at work',
          emotion: 'anxious',
          trap_ids: ['catastrophizing'],
          evidence_for: 'I made a mistake once',
          evidence_against: 'I have succeeded many times',
          reframe: 'I can prepare and do well',
          mood_before: 3,
          mood_after: 6,
          idempotency_key: 'key-1',
        },
      });

      expect(response).toMatchObject({
        user_id: userId,
        thought: 'I am not good enough',
        emotion: 'anxious',
      });
      expect(response.id).toBeDefined();
      expect(response.created_at).toBeDefined();
    });
  });

  describe('getThoughtRecords', () => {
    it('returns thought records for the authenticated user', async () => {
      setMockThoughtRecords([
        {
          id: 't1',
          user_id: userId,
          thought: 'Thought 1',
          emotion: 'sad',
          created_at: '2026-08-14T12:00:00.000Z',
        },
        {
          id: 't2',
          user_id: userId,
          thought: 'Thought 2',
          emotion: 'anxious',
          created_at: '2026-08-13T12:00:00.000Z',
        },
      ]);

      const response = await createTestORPCClient(headers).self.getThoughtRecords({
        query: { limit: 10 },
      });

      expect(response).toHaveLength(2);
      expect(response[0].thought).toBe('Thought 1');
      expect(response[1].thought).toBe('Thought 2');
    });
  });

  // completeThoughtRecordFollowUp is not covered here: it is the only self
  // procedure that declares a `:id` path param (contract path
  // `/self/thought-record/:id`). Through the native RPC transport the route is
  // reached only by its procedure-name URL (`/api/self/completeThoughtRecordFollowUp`)
  // and path params are sourced from the request URL path (Hono `c.req.param()`),
  // not the RPC body. Because the untyped RPCLink harness does not substitute
  // `:id` into the URL, the param is always undefined for this procedure, which
  // fails schema validation. Testing it would require the HTTP (not RPC) adapter.

  describe('getPreferences', () => {
    it('returns user preferences', async () => {
      setMockUserPreferences({
        id: 'prefs-1',
        user_id: userId,
        favorite_features: ['mood', 'journal'],
        hidden_features: ['thoughts'],
        morning_check_time: '08:00',
        afternoon_check_time: '14:00',
        evening_wind_down_time: '21:00',
        enable_contextual_prompts: true,
        enable_usage_tracking: false,
        notification_settings: { email: true, push: false },
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      const response = await createTestORPCClient(headers).self.getPreferences({});

      expect(response).toMatchObject({
        user_id: userId,
        favorite_features: ['mood', 'journal'],
        hidden_features: ['thoughts'],
        enable_contextual_prompts: true,
        enable_usage_tracking: false,
      });
    });
  });

  describe('updatePreferences', () => {
    it('updates user preferences and returns the updated record', async () => {
      setMockUserPreferences({
        id: 'prefs-1',
        user_id: userId,
        favorite_features: ['mood'],
        hidden_features: [],
        morning_check_time: '08:00',
        afternoon_check_time: '14:00',
        evening_wind_down_time: '21:00',
        enable_contextual_prompts: true,
        enable_usage_tracking: true,
        notification_settings: null,
        created_at: '2026-08-01T00:00:00.000Z',
        updated_at: '2026-08-14T00:00:00.000Z',
      });

      const response = await createTestORPCClient(headers).self.updatePreferences({
        body: {
          favorite_features: ['mood', 'journal', 'thoughts'],
          hidden_features: [],
          morning_check_time: '07:00',
          enable_contextual_prompts: false,
        },
      });

      expect(response.favorite_features).toEqual(['mood', 'journal', 'thoughts']);
      expect(response.morning_check_time).toBe('07:00');
      expect(response.enable_contextual_prompts).toBe(false);
    });
  });

  it('rejects a flattened personal-data mutation shape', async () => {
    await expect(
      (createTestORPCClient(headers).self.logMood as any)({ user_id: userId, mood_score: 5 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
