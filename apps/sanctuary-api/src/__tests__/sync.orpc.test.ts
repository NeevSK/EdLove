// Test setup with mocked database - must be at top level for vitest hoisting
import { vi } from 'vitest';

// Mock database client before any other imports
vi.mock('@repo/database/client', () => ({
  queryDatabaseRows: async <T>() => [] as any[],
  canUseZenStackDb: () => true,
  createZenStackDb: () => {
    const { TestContextBuilder } = require('./test-doubles');
    const builder = new TestContextBuilder()
      .withZenStackDb(true)
      .withActiveBond({
        id: 'bond-sync',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        entity_id: '123e4567-e89b-12d3-a456-426614174002',
        entity_type: 'SCHOOL',
        capacity: 'teacher',
        status: 'active',
      });
    return builder.build();
  },
}));

vi.mock('@repo/database', () => ({
  getPrismaClient: () => {
    const { TestContextBuilder } = require('./test-doubles');
    return new TestContextBuilder().build();
  },
}));

// Now import test utilities after mocks are registered
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient, resetTestDatabase } from './test-doubles';

describe('sync API', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    resetTestDatabase(builder => 
      builder
        .withZenStackDb(true)
        .withActiveBond({
          id: 'bond-sync',
          user_id: userId,
          entity_id: '123e4567-e89b-12d3-a456-426614174002',
          entity_type: 'SCHOOL',
          capacity: 'teacher',
          status: 'active',
        })
    );
  });

  describe('uploadBatch', () => {
    it('requires authentication', async () => {
      await expect(createTestORPCClient().sync.uploadBatch({
        idempotencyKey: 'test-key',
        crud: [
          { id: 'mutation-1', op: 'PATCH', table: 'users', opData: { display_name: 'Test' } },
        ],
      })).rejects.toMatchObject({ status: 403 });
    });

    it('requires idempotencyKey', async () => {
      await expect(createTestORPCClient(headers).sync.uploadBatch({
        crud: [
          { id: 'mutation-1', op: 'PATCH', table: 'users', opData: { display_name: 'Test' } },
        ],
      })).rejects.toMatchObject({ status: 400 });
    });

    it('accepts valid upload batch', async () => {
      const response = await createTestORPCClient(headers).sync.uploadBatch({
        idempotencyKey: 'test-idempotency-key',
        crud: [
          { id: 'mutation-1', op: 'PATCH', table: 'users', opData: { display_name: 'Test User' } },
          { id: 'mutation-2', op: 'PUT', table: 'moodLog', opData: { mood_score: 8, mood: 'happy' } },
        ],
      });

      expect(response).toMatchObject({
        success: true,
        processedCount: 2,
      });
    });

    it('handles empty crud array', async () => {
      const response = await createTestORPCClient(headers).sync.uploadBatch({
        idempotencyKey: 'test-empty',
        crud: [],
      });

      expect(response).toMatchObject({
        success: true,
        processedCount: 0,
      });
    });

    it('rejects duplicate idempotencyKey', async () => {
      const payload = {
        idempotencyKey: 'duplicate-key',
        crud: [{ id: 'm1', op: 'PATCH', table: 'users', opData: { name: 'Test' } }],
      };

      await createTestORPCClient(headers).sync.uploadBatch(payload);
      
      // Second call with same key should be idempotent
      const response = await createTestORPCClient(headers).sync.uploadBatch(payload);
      
      expect(response).toMatchObject({
        success: true,
        idempotent: true,
      });
    });

    it('validates mutation structure', async () => {
      await expect(createTestORPCClient(headers).sync.uploadBatch({
        idempotencyKey: 'test-invalid',
        crud: [
          { id: 'm1', op: 'INVALID', table: 'users', opData: {} },
        ],
      })).rejects.toMatchObject({ status: 400 });
    });

    it('validates required fields', async () => {
      await expect(createTestORPCClient(headers).sync.uploadBatch({
        idempotencyKey: 'test-missing',
        crud: [
          { id: 'm1', table: 'users' }, // missing op
        ],
      })).rejects.toMatchObject({ status: 400 });
    });
  });
});