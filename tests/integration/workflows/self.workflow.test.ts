import { describe, expect, it, beforeAll } from 'vitest';
import { createTestORPCClient, resetTestDatabase } from '../apps/sanctuary-api/src/__tests__/test-doubles';

describe('Workflow: Mood & Journal Flow', () => {
  const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const HEADERS = { Authorization: `Bearer ${TEST_USER_ID}` };
  let client: ReturnType<typeof createTestORPCClient>;

  beforeAll(() => {
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
    client = createTestORPCClient({ Authorization: `Bearer ${TEST_USER_ID}` });
  });

  it('mood log → history → today mood consistency', async () => {
    // Log a mood
    const mood = await client.self.logMood({ 
      user_id: TEST_USER_ID, 
      mood_score: 8, 
      mood: 'happy', 
      note: 'Workflow test' 
    });

    // Check history includes it
    const history = await client.self.getMoodHistory({ limit: 1 });
    expect(history[0].id).toBe(mood.id);
    expect(history[0].mood_score).toBe(8);

    // Check today mood matches
    const today = await client.self.getTodayMood({});
    expect(today.id).toBe(mood.id);
  });

  it('journal burn → history consistency', async () => {
    const content = 'Workflow journal entry';
    
    const journal = await client.self.burnJournal({ content });
    
    const history = await client.self.getJournalHistory({ limit: 1 });
    expect(history[0].id).toBe(journal.id);
    expect(history[0].content_preview).toBe(content.substring(0, 50));
  });

  it('mood + journal + thought record are independent', async () => {
    const mood = await client.self.logMood({ 
      user_id: TEST_USER_ID, 
      mood_score: 7, 
      mood: 'good' 
    });

    const journal = await client.self.burnJournal({ 
      content: 'Independent test journal' 
    });

    const thought = await client.self.saveThoughtRecord({
      thought: 'Independent thought',
      situation: 'Test',
      emotion: 'calm',
      idempotency_key: `independent-${Date.now()}`,
    });

    expect(mood.id).toBeDefined();
    expect(journal.id).toBeDefined();
    expect(thought.id).toBeDefined();
    expect(new Set([mood.id, journal.id, thought.id]).size).toBe(3);
  });
});

describe('Workflow: Thought Record Lifecycle', () => {
  const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const HEADERS = { Authorization: `Bearer ${TEST_USER_ID}` };
  let client: ReturnType<typeof createTestORPCClient>;

  beforeAll(() => {
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
    client = createTestORPCClient({ Authorization: `Bearer ${TEST_USER_ID}` });
  });

  it('complete lifecycle: save → history → follow-up', async () => {
    // 1. Save thought record
    const created = await client.self.saveThoughtRecord({
      thought: 'I will fail this presentation',
      situation: 'Team meeting tomorrow',
      emotion: 'anxious',
      trap_ids: ['catastrophizing', 'fortune_telling'],
      evidence_for: 'I stumbled last time',
      evidence_against: 'I have prepared thoroughly',
      reframe: 'I am prepared and can handle questions',
      mood_before: 3,
      mood_after: 6,
      idempotency_key: `lifecycle-${Date.now()}`,
    });

    expect(created.post_outcome).toBeNull();
    expect(created.follow_up).toBeNull();

    // 2. Verify in history
    const history = await client.self.getThoughtRecords({ limit: 1 });
    expect(history[0].id).toBe(created.id);

    // 3. Complete follow-up
    const updated = await client.self.completeThoughtRecordFollowUp({
      params: { id: created.id },
      body: {
        post_outcome: 'better',
        follow_up: {
          due_at: '2026-08-15T12:00:00.000Z',
          completed_at: '2026-08-15T10:00:00.000Z',
          outcome: 'better',
          reflection: 'The presentation went well, I handled questions well',
        },
      },
    });

    expect(updated.post_outcome).toBe('better');
    expect(updated.follow_up.outcome).toBe('better');
    expect(updated.follow_up.reflection).toBe('The presentation went well, I handled questions well');
  });

  it('idempotency_key prevents duplicates', async () => {
    const key = `idempotent-${Date.now()}`;
    
    const first = await client.self.saveThoughtRecord({
      thought: 'Test thought',
      situation: 'Test',
      emotion: 'neutral',
      idempotency_key: key,
    });

    const second = await client.self.saveThoughtRecord({
      thought: 'Different thought',
      situation: 'Different',
      emotion: 'different',
      idempotency_key: key, // Same key
    });

    // Should return the same record (idempotent)
    expect(second.id).toBe(first.id);
    expect(second.thought).toBe('Test thought'); // Original content preserved
  });
});

describe('Workflow: Preferences Persistence', () => {
  const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  let client: ReturnType<typeof createTestORPCClient>;

  beforeAll(() => {
    resetTestDatabase(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
    client = createTestORPCClient({ Authorization: `Bearer ${TEST_USER_ID}` });
  });

  it('preferences roundtrip: get → update → get', async () => {
    // Get initial
    const initial = await client.self.getPreferences({});
    expect(initial.favorite_features).toEqual([]);

    // Update
    const updated = await client.self.updatePreferences({
      favorite_features: ['mood', 'journal'],
      hidden_features: ['thoughts'],
      morning_check_time: '08:00',
      enable_contextual_prompts: false,
    });

    expect(updated.favorite_features).toEqual(['mood', 'journal']);
    expect(updated.enable_contextual_prompts).toBe(false);

    // Get again - should persist
    const retrieved = await client.self.getPreferences({});
    expect(retrieved.favorite_features).toEqual(['mood', 'journal']);
    expect(retrieved.enable_contextual_prompts).toBe(false);
  });
});