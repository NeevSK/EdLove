import { fc } from '@fast-check/vitest';
import { describe, expect, it, beforeEach } from 'vitest';
import { TestContextBuilder, resetTestDatabase, createTestORPCClient } from '../apps/sanctuary-api/src/__tests__/test-doubles';

const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
const HEADERS = { Authorization: `Bearer ${TEST_USER_ID}` };

const reset = (builder: any) => {
  const { resetTestDatabase } = require('../apps/sanctuary-api/src/__tests__/test-doubles');
  return resetTestDatabase(builder);
};

const createClient = (h = HEADERS) => {
  const { createTestORPCClient } = require('../apps/sanctuary-api/src/__tests__/test-doubles');
  return createTestORPCClient(h);
};

describe('Properties: Self Handler Invariants', () => {
  beforeEach(() => {
    reset(b => b
      .withZenStackDb(true)
      .withActiveBond({ capacity: 'teacher' })
    );
  });

  describe('logMood → getMoodHistory Roundtrip', () => {
    it('property: created mood appears in history with correct fields', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          mood_score: fc.integer({ min: 0, max: 10 }),
          mood: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          note: fc.option(fc.string({ maxLength: 500 })),
        }),
        async (input) => {
          const client = createTestORPCClient();
          const created = await client.self.logMood({ 
            user_id: TEST_USER_ID, 
            ...input 
          });
          const history = await client.self.getMoodHistory({ limit: 1 });
          
          expect(history).toHaveLength(1);
          expect(history[0].id).toBe(created.id);
          expect(history[0].mood_score).toBe(input.mood_score);
          expect(history[0].mood).toBe(input.mood ?? null);
          expect(history[0].note).toBe(input.note ?? null);
        }
      ), { numRuns: 50 });
    });

    it('property: history returns most recent first', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(
          fc.record({ mood_score: fc.integer({ min: 0, max: 10 }) }), 
          { minLength: 2, maxLength: 10 }
        ),
        async (moods) => {
          const client = createClient();
          
          for (const m of moods) {
            await client.self.logMood({ user_id: TEST_USER_ID, ...m });
          }
          
          const history = await client.self.getMoodHistory({ limit: moods.length });
          
          for (let i = 1; i < history.length; i++) {
            expect(new Date(history[i-1].created_at).getTime())
              .toBeGreaterThanOrEqual(new Date(history[i].created_at).getTime());
          }
        }
      ), { numRuns: 30 });
    });

    it('property: limit parameter is strictly respected', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        async (limit) => {
          const client = createClient();
          
          for (let i = 0; i < 15; i++) {
            await client.self.logMood({ user_id: TEST_USER_ID, mood_score: i % 10 });
          }
          
          const history = await client.self.getMoodHistory({ limit });
          expect(history.length).toBeLessThanOrEqual(limit);
        }
      ), { numRuns: 30 });
    });
  });

  describe('burnJournal Invariants', () => {
    it('property: content_preview is first 50 chars of content', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (content) => {
          const client = createClient();
          const result = await client.self.burnJournal({ content });
          
          expect(result.content_preview.length).toBeLessThanOrEqual(50);
          expect(result.content_preview).toBe(content.substring(0, 50));
        }
      ), { numRuns: 50 });
    });

    it('property: is_burned is always true', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (content) => {
          const client = createClient();
          const result = await client.self.burnJournal({ content });
          expect(result.is_burned).toBe(true);
        }
      ), { numRuns: 20 });
    });
  });

  describe('getTodayMood Invariants', () => {
    it('property: returns null when no mood today', async () => {
      const client = createClient();
      const result = await client.self.getTodayMood({});
      expect(result).toBeNull();
    });
  });

  describe('saveThoughtRecord → getThoughtRecords Roundtrip', () => {
    const validThought = {
      thought: 'Test thought',
      situation: 'Test situation',
      emotion: 'anxious',
      trap_ids: ['catastrophizing'],
      evidence_for: 'Evidence for',
      evidence_against: 'Evidence against',
      reframe: 'Reframe',
      mood_before: 3,
      mood_after: 6,
      idempotency_key: 'test-key',
    };

    it('property: saved thought appears in history', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          thought: fc.string({ minLength: 1, maxLength: 200 }),
          situation: fc.option(fc.string({ maxLength: 200 })),
          emotion: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        }),
        async (input) => {
          const client = createClient();
          const created = await client.self.saveThoughtRecord({ 
            ...validThought, 
            ...input,
            idempotency_key: `test-${Date.now()}-${Math.random()}`
          });
          
          const history = await client.self.getThoughtRecords({ limit: 1 });
          
          expect(history).toHaveLength(1);
          expect(history[0].id).toBe(created.id);
          expect(history[0].thought).toBe(input.thought);
          expect(history[0].emotion).toBe(input.emotion ?? null);
        }
      ), { numRuns: 30 });
    });
  });

  describe('completeThoughtRecordFollowUp Invariants', () => {
    it('property: updates only specified fields', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          post_outcome: fc.option(fc.oneof(
            fc.constant('better'),
            fc.constant('same'),
            fc.constant('worse')
          )),
        }),
        async (input) => {
          const client = createClient();
          
          // First create a thought record
          const created = await client.self.saveThoughtRecord({
            thought: 'Test thought',
            situation: 'Test',
            emotion: 'anxious',
            idempotency_key: `test-${Date.now()}`,
          });
          
          const updated = await client.self.completeThoughtRecordFollowUp({
            params: { id: created.id },
            body: { 
              post_outcome: input.post_outcome,
              follow_up: { due_at: '2026-08-15T12:00:00.000Z' }
            },
          });
          
          if (input.post_outcome) {
            expect(updated.post_outcome).toBe(input.post_outcome);
          }
        }
      ), { numRuns: 20 });
    });
  });

  describe('Preferences Invariants', () => {
    it('property: updatePreferences merges fields', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          favorite_features: fc.option(fc.array(fc.string({ minLength: 1 }))),
          hidden_features: fc.option(fc.array(fc.string({ minLength: 1 }))),
          morning_check_time: fc.option(fc.string({ pattern: '^\\d{2}:\\d{2}$' })),
        }),
        async (input) => {
          const client = createClient();
          const updated = await client.self.updatePreferences(input);
          
          if (input.favorite_features) {
            expect(updated.favorite_features).toEqual(input.favorite_features);
          }
          if (input.hidden_features) {
            expect(updated.hidden_features).toEqual(input.hidden_features);
          }
          if (input.morning_check_time) {
            expect(updated.morning_check_time).toBe(input.morning_check_time);
          }
        }
      ), { numRuns: 20 });
    });
  });
});

describe('Properties: Presence Invariants', () => {
  beforeEach(() => {
    reset(b => b.withZenStackDb(true).withActiveBond({ capacity: 'teacher' }));
  });

  it('property: getFallbackCount returns non-negative integer', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        windowMs: fc.option(fc.integer({ min: 1000, max: 86400000 })),
        cumulative: fc.boolean(),
      }),
      async (input) => {
        const client = createClient();
        const result = await client.presence.getFallbackCount(input);
        expect(result.count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(result.count)).toBe(true);
      }
    ), { numRuns: 20 });
  });

  it('property: markSeen returns valid ISO timestamp', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constant({}),
      async () => {
        const client = createClient();
        const result = await client.presence.markSeen({});
        expect(new Date(result.seenAt).toISOString()).toBe(result.seenAt);
      }
    ), { numRuns: 10 });
  });
});

describe('Properties: Cross-Handler Invariants', () => {
  beforeEach(() => {
    reset(b => b.withZenStackDb(true).withActiveBond({ capacity: 'teacher' }));
  });

  it('property: mood and journal are independent', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        mood_score: fc.integer({ min: 0, max: 10 }),
        journal_content: fc.string({ minLength: 1, maxLength: 100 }),
      }),
      async (input) => {
        const client = createClient();
        
        const mood = await client.self.logMood({ 
          user_id: TEST_USER_ID, 
          mood_score: input.mood_score 
        });
        
        const journal = await client.self.burnJournal({ 
          content: input.journal_content 
        });
        
        expect(mood.id).toBeDefined();
        expect(journal.id).toBeDefined();
        expect(mood.id).not.toBe(journal.id);
      }
    ), { numRuns: 30 });
  });

  it('property: thought records independent of mood', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        mood_score: fc.integer({ min: 0, max: 10 }),
        thought: fc.string({ minLength: 1, maxLength: 200 }),
      }),
      async (input) => {
        const client = createClient();
        
        const mood = await client.self.logMood({ 
          user_id: TEST_USER_ID, 
          mood_score: input.mood_score 
        });
        
        const thought = await client.self.saveThoughtRecord({
          thought: input.thought,
          situation: 'Test',
          emotion: 'anxious',
          idempotency_key: `test-${Date.now()}`,
        });
        
        expect(mood.id).toBeDefined();
        expect(thought.id).toBeDefined();
        expect(mood.id).not.toBe(thought.id);
      }
    ), { numRuns: 30 });
  });
});