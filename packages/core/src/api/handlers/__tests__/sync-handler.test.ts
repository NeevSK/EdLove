/**
 * Sync Handler Contract Tests
 *
 * Tests the applyPowerSyncBatch function contract:
 * - Accepts CRUD for the 4 published tables
 * - Rejects CRUD for local-only tables
 * - Handles idempotency correctly
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma client
function createMockPrismaClient(overrides: Record<string, any> = {}) {
  const defaultDelegates = {
    bond: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    classroom: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    classroomStudent: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  };

  const delegates = { ...defaultDelegates, ...overrides };

  return {
    $transaction: vi.fn(async (fn: any) =>
      fn({
        ...delegates,
      }),
    ),
    ...delegates,
  };
}

let applyPowerSyncBatch: any;

describe('Sync Handler Contract', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('@repo/core/api/handlers/sync');
    applyPowerSyncBatch = mod.applyPowerSyncBatch;
  });

  describe('Published tables are accepted', () => {
    it('accepts PUT for bonds', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PUT',
          table: 'bonds',
          opData: { userId: 'u1', entityId: 'e1', entityType: 'CLASSROOM', capacity: 'teacher' },
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(1);
      expect(mockDb.bond.upsert).toHaveBeenCalled();
    });

    it('accepts PUT for classroom', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PUT',
          table: 'classroom',
          opData: { name: 'Class A', schoolId: 's1', teacherId: 't1', academicYear: '2024' },
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(mockDb.classroom.upsert).toHaveBeenCalled();
    });

    it('accepts PUT for classroom_student', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PUT',
          table: 'classroom_student',
          opData: { classroomId: 'c1', studentId: 's1', fullName: 'John', status: 'active' },
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(mockDb.classroomStudent.upsert).toHaveBeenCalled();
    });

    it('accepts PUT for classroom_students', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PUT',
          table: 'classroom_students',
          opData: { classroomId: 'c1', studentId: 's1', fullName: 'John', status: 'active' },
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(mockDb.classroomStudent.upsert).toHaveBeenCalled();
    });
  });

  describe('Local-only tables are rejected', () => {
    const localOnlyTables = [
      'attendance',
      'students',
      'mood_logs',
      'schools',
      'cedar_policies',
      'permission_snapshots',
      'policy_version',
      'form_templates',
      'form_responses',
      'pricing_manifest',
      'user_entitlement_grants',
      'user_preferences',
    ];

    for (const table of localOnlyTables) {
      it(`rejects ${table}`, async () => {
        const mockDb = createMockPrismaClient();
        const crud = [
          {
            id: '1',
            op: 'PUT',
            table,
            opData: { test: 'data' },
          },
        ];

        await expect(applyPowerSyncBatch(mockDb, crud)).rejects.toThrow(
          `Unsupported sync table: ${table}`,
        );
      });
    }
  });

  describe('Operations', () => {
    it('handles PATCH operations', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PATCH',
          table: 'bonds',
          opData: { capacity: 'admin' },
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(mockDb.bond.update).toHaveBeenCalled();
    });

    it('handles DELETE operations', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'DELETE',
          table: 'classroom',
          opData: {},
        },
      ];

      const result = await applyPowerSyncBatch(mockDb, crud);
      expect(result.success).toBe(true);
      expect(mockDb.classroom.delete).toHaveBeenCalled();
    });

    it('rejects unsupported operation', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'INVALID_OP',
          table: 'bonds',
          opData: {},
        },
      ];

      await expect(applyPowerSyncBatch(mockDb, crud)).rejects.toThrow(
        'Unsupported operations mode: INVALID_OP',
      );
    });
  });

  describe('Idempotency', () => {
    it('handles idempotent replay', async () => {
      const mockDb = createMockPrismaClient();
      const crud = [
        {
          id: '1',
          op: 'PUT',
          table: 'bonds',
          opData: { userId: 'u1', entityId: 'e1', entityType: 'CLASSROOM', capacity: 'teacher' },
        },
      ];

      // First call succeeds
      const result1 = await applyPowerSyncBatch(mockDb, crud, 'handler-idem-key-1');
      expect(result1.success).toBe(true);
      expect(result1.idempotent).toBeUndefined();
      expect(result1.processedCount).toBe(1);

      // Second call with same idempotency key returns replay
      // Note: The replay returns the original processedCount, not 0
      const result2 = await applyPowerSyncBatch(mockDb, crud, 'handler-idem-key-1');
      expect(result2.success).toBe(true);
      expect(result2.idempotent).toBe(true);
      expect(result2.processedCount).toBe(1); // Returns original count on replay
    });

    it('throws on idempotency key reuse with different payload', async () => {
      const mockDb = createMockPrismaClient();
      const crud1 = [
        {
          id: '1',
          op: 'PUT',
          table: 'bonds',
          opData: { userId: 'u1', entityId: 'e1', entityType: 'CLASSROOM', capacity: 'teacher' },
        },
      ];
      const crud2 = [
        {
          id: '2',
          op: 'PUT',
          table: 'bonds',
          opData: { userId: 'u2', entityId: 'e2', entityType: 'SCHOOL', capacity: 'principal' },
        },
      ];

      await applyPowerSyncBatch(mockDb, crud1, 'handler-idem-key-conflict');

      await expect(applyPowerSyncBatch(mockDb, crud2, 'handler-idem-key-conflict')).rejects.toThrow(
        'Idempotency key was reused with a different batch payload',
      );
    });
  });
});
