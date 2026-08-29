import { fc } from '@fast-check/vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { MoodLogSchema, FireJournalEntrySchema, ThoughtRecordSchema, UserPreferencesSchema } from '@repo/core/logic/schemas/self.schema';
import { selfContract } from '@repo/core/api/self.contract';
import { profileContract } from '@repo/core/api/profile.contract';
import { historyContract } from '@repo/core/api/history.contract';
import { rewardsContract } from '@repo/core/api/rewards.contract';

describe('Architecture: Contract Conformance', () => {
  const allSchemas = {
    MoodLog: MoodLogSchema,
    FireJournalEntry: FireJournalEntrySchema,
    ThoughtRecord: ThoughtRecordSchema,
    UserPreferences: UserPreferencesSchema,
  };

  describe('Self Contract - logMood', () => {
    const proc = selfContract.logMood;

    it('input schema matches MoodLogSchema.omit({id, created_at})', () => {
      const validInput = { user_id: '123e4567-e89b-12d3-a456-426614174000', mood_score: 8, mood: 'happy', note: 'Test' };
      expect(() => proc.request.body.parse(validInput)).not.toThrow();
    });

    it('rejects mood_score > 10', () => {
      expect(() => proc.request.body.parse({ user_id: '1', mood_score: 11 })).toThrow();
    });

    it('rejects mood_score < 0', () => {
      expect(() => proc.request.body.parse({ user_id: '1', mood_score: -1 })).toThrow();
    });

    it('output schema matches MoodLogSchema', () => {
      const validOutput = { id: '1', user_id: '1', mood_score: 8, mood: 'happy', note: 'Test', created_at: new Date().toISOString() };
      expect(() => proc.responses[201].schema.parse(validOutput)).not.toThrow();
    });

    it('property: logMood roundtrip preserves all fields', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          mood_score: fc.integer({ min: 0, max: 10 }),
          mood: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          note: fc.option(fc.string({ maxLength: 500 })),
        }),
        async (input) => {
          const { TestContextBuilder, resetTestDatabase, createTestORPCClient } = await import('../src/__tests__/test-doubles');
          const headers = { Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000' };
          resetTestDatabase(b => b.withZenStackDb(true).withActiveBond({ capacity: 'teacher' }));
          const client = createTestORPCClient(headers);
          const result = await client.self.logMood({ ...input, user_id: '123e4567-e89b-12d3-a456-426614174000' });
          const parsed = MoodLogSchema.parse(result);
          expect(parsed.mood_score).toBe(input.mood_score);
          expect(parsed.mood).toBe(input.mood ?? null);
          expect(parsed.note).toBe(input.note ?? null);
        }
      ), { numRuns: 50 });
    });
  });

  describe('Self Contract - getMoodHistory', () => {
    const proc = selfContract.getMoodHistory;

    it('query schema validates limit', () => {
      expect(() => proc.request.query.parse({ limit: 10 })).not.toThrow();
      expect(() => proc.request.query.parse({ limit: 0 })).toThrow();
    });

    it('output schema is array of MoodLog', () => {
      const validOutput = [{ id: '1', user_id: '1', mood_score: 8, mood: 'happy', note: 'Test', created_at: new Date().toISOString() }];
      expect(() => proc.responses[200].schema.parse(validOutput)).not.toThrow();
    });

    it('property: limit is respected', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        async (limit) => {
          const { TestContextBuilder, resetTestDatabase, createTestORPCClient } = await import('../src/__tests__/test-doubles');
          const headers = { Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000' };
          resetTestDatabase(b => b.withZenStackDb(true).withActiveBond({ capacity: 'teacher' }));
          const client = createTestORPCClient(headers);
          
          // Create 15 mood logs
          for (let i = 0; i < 15; i++) {
            await client.self.logMood({ user_id: '123e4567-e89b-12d3-a456-426614174000', mood_score: i % 10 });
          }
          
          const history = await client.self.getMoodHistory({ limit });
          expect(history.length).toBeLessThanOrEqual(limit);
        }
      ), { numRuns: 30 });
    });
  });

  describe('Self Contract - burnJournal', () => {
    const proc = selfContract.burnJournal;

    it('input requires content string', () => {
      expect(() => proc.request.body.parse({ content: 'Test' })).not.toThrow();
      expect(() => proc.request.body.parse({})).toThrow();
    });

    it('output matches FireJournalEntrySchema', () => {
      const validOutput = { id: '1', user_id: '1', content_preview: 'Test...', is_burned: true, created_at: new Date().toISOString() };
      expect(() => proc.responses[201].schema.parse(validOutput)).not.toThrow();
    });

    it('property: content_preview <= 50 chars', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (content) => {
          const { TestContextBuilder, resetTestDatabase, createTestORPCClient } = await import('../src/__tests__/test-doubles');
          const headers = { Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000' };
          resetTestDatabase(b => b.withZenStackDb(true).withActiveBond({ capacity: 'teacher' }));
          const client = createTestORPCClient(headers);
          const result = await client.self.burnJournal({ content });
          expect(result.content_preview.length).toBeLessThanOrEqual(50);
          expect(result.content_preview).toBe(content.substring(0, 50));
        }
      ), { numRuns: 30 });
    });
  });

  describe('Self Contract - getTodayMood', () => {
    const proc = selfContract.getTodayMood;

    it('output is MoodLogSchema.nullable()', () => {
      const validOutput = { id: '1', user_id: '1', mood_score: 8, mood: 'happy', note: 'Test', created_at: new Date().toISOString() };
      expect(() => proc.responses[200].schema.parse(validOutput)).not.toThrow();
      expect(() => proc.responses[200].schema.parse(null)).not.toThrow();
    });
  });

  describe('Self Contract - saveThoughtRecord', () => {
    const proc = selfContract.saveThoughtRecord;

    it('input matches ThoughtRecordSchema.omit({id, created_at, user_id})', () => {
      const validInput = { 
        thought: 'I am not good enough',
        situation: 'Presentation',
        emotion: 'anxious',
        trap_ids: ['catastrophizing'],
        evidence_for: 'I made a mistake',
        evidence_against: 'I have succeeded',
        reframe: 'I can prepare',
        mood_before: 3,
        mood_after: 6,
        idempotency_key: 'key-1'
      };
      expect(() => proc.request.body.parse(validInput)).not.toThrow();
    });

    it('output matches ThoughtRecordSchema', () => {
      const validOutput = { 
        id: '1', user_id: '1', 
        thought: 'Test', situation: 'Test', emotion: 'Test',
        trap_ids: [], evidence_for: 'Test', evidence_against: 'Test', reframe: 'Test',
        mood_before: 3, mood_after: 6, post_outcome: null, follow_up: null,
        idempotency_key: 'key', created_at: new Date().toISOString()
      };
      expect(() => proc.responses[201].schema.parse(validOutput)).not.toThrow();
    });
  });

  describe('Self Contract - completeThoughtRecordFollowUp', () => {
    const proc = selfContract.completeThoughtRecordFollowUp;

    it('params requires id string', () => {
      expect(() => proc.request.params.parse({ id: '1' })).not.toThrow();
      expect(() => proc.request.params.parse({})).toThrow();
    });

    it('body allows partial follow_up', () => {
      expect(() => proc.request.body.parse({ post_outcome: 'better' })).not.toThrow();
      expect(() => proc.request.body.parse({ follow_up: { due_at: '2026-08-15T12:00:00.000Z' } })).not.toThrow();
    });
  });

  describe('Self Contract - getPreferences', () => {
    const proc = selfContract.getPreferences;

    it('output matches UserPreferencesSchema', () => {
      const validOutput = {
        id: '1', user_id: '1',
        favorite_features: ['mood', 'journal'],
        hidden_features: ['thoughts'],
        morning_check_time: '08:00',
        afternoon_check_time: '14:00',
        evening_wind_down_time: '21:00',
        enable_contextual_prompts: true,
        enable_usage_tracking: true,
        notification_settings: { email: true, push: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      expect(() => proc.responses[200].schema.parse(validOutput)).not.toThrow();
    });
  });

  describe('Self Contract - updatePreferences', () => {
    const proc = selfContract.updatePreferences;

    it('input is UserPreferencesSchema.partial()', () => {
      expect(() => proc.request.body.parse({ favorite_features: ['mood'] })).not.toThrow();
      expect(() => proc.request.body.parse({ morning_check_time: '07:00' })).not.toThrow();
    });
  });
});

describe('Architecture: All Contracts Have Required Metadata', () => {
  const allContracts = [
    { name: 'self', contract: selfContract },
    { name: 'profile', contract: profileContract },
    { name: 'history', contract: historyContract },
    { name: 'rewards', contract: rewardsContract },
  ];

  for (const { name, contract } of allContracts) {
    describe(`${name} contract metadata`, () => {
      for (const [procName, proc] of Object.entries(contract)) {
        it(`${name}.${procName} has policy metadata`, () => {
          expect(proc.metadata).toBeDefined();
          expect(proc.metadata.policy).toBeDefined();
          expect(proc.metadata.policy.action).toBeDefined();
          expect(proc.metadata.policy.subject).toBeDefined();
        });

        it(`${name}.${procName} uses correct HTTP method`, () => {
          const isMutation = ['create', 'update', 'delete', 'log', 'save', 'burn', 'add', 'award', 'initialize', 'award', 'check'].some(p => procName.startsWith(p));
          if (isMutation) {
            expect(['post', 'put', 'patch', 'delete']).toContain(proc.method);
          } else {
            expect(['get', 'post']).toContain(proc.method);
          }
        });

        it(`${name}.${procName} has response schema`, () => {
          expect(proc.responses[200] || proc.responses[201]).toBeDefined();
          expect(proc.responses[200]?.schema || proc.responses[201]?.schema).toBeDefined();
        });
      }
    });
  });
});

describe('Architecture: Schema Validity', () => {
  const schemas = [MoodLogSchema, FireJournalEntrySchema, ThoughtRecordSchema, UserPreferencesSchema];

  for (const schema of schemas) {
    it(`${schema._def.typeName} is a valid Zod schema`, () => {
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    it(`${schema._def.typeName} rejects invalid input`, () => {
      expect(() => schema.parse({})).toThrow();
    });
  }
});