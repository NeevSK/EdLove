import { ORPCError } from '@orpc/client';
import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import {
  generateIdempotencyKey,
  getConsistentIdempotencyKey,
} from '@repo/core/lib/sync/idempotency';
import {
  assertWorkspaceLayoutMutationCompleted,
  WorkspaceLayoutConflictError,
} from '@repo/core/logic/workspace/outbox';
import { describe, expect, it } from 'vitest';

describe('Invariant 2: Outbox Idempotency & Replay Resilience', () => {
  describe('Deterministic Idempotency Hash Invariant', () => {
    it('produces identical SHA-256 hashes for equivalent payloads regardless of key order', async () => {
      const payloadA = {
        title: 'Midterm Science Exam',
        gradeClassId: 'class-123',
        metadata: { passingScore: 75, maxRetries: 2, strictTime: true },
      };

      const payloadB = {
        metadata: { strictTime: true, maxRetries: 2, passingScore: 75 },
        gradeClassId: 'class-123',
        title: 'Midterm Science Exam',
      };

      const keyA = await getConsistentIdempotencyKey(payloadA, 'grading');
      const keyB = await getConsistentIdempotencyKey(payloadB, 'grading');

      expect(keyA).toBe(keyB);
      expect(keyA).toMatch(/^[a-f0-9]{64}$/);
    });

    it('incorporates scope and student salt into scoped idempotency keys', async () => {
      const keyStudent1 = await generateIdempotencyKey(
        'attendance',
        'SUBMIT_PULSE',
        { status: 'present' },
        'student-001',
      );
      const keyStudent2 = await generateIdempotencyKey(
        'attendance',
        'SUBMIT_PULSE',
        { status: 'present' },
        'student-002',
      );

      expect(keyStudent1).not.toBe(keyStudent2);
      expect(keyStudent1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Error Classification & Backoff Invariant', () => {
    it('routes transient network drops to TRANSIENT for exponential backoff', () => {
      expect(classifyError(new ORPCError('SERVICE_UNAVAILABLE'))).toBe('TRANSIENT');
      expect(classifyError(new TypeError('Failed to fetch'))).toBe('TRANSIENT');
      expect(classifyError(new TypeError('synthetic-offline'))).toBe('TRANSIENT');
      expect(classifyError({ status: 503 })).toBe('TRANSIENT');
      expect(classifyError({ status: 504 })).toBe('TRANSIENT');
    });

    it('quarantines permanent errors to PERMANENT to prevent poison-pill retry loops', () => {
      expect(classifyError(new ORPCError('FORBIDDEN'))).toBe('PERMANENT');
      expect(classifyError(new ORPCError('BAD_REQUEST'))).toBe('PERMANENT');
      expect(classifyError({ code: '23505' })).toBe('PERMANENT'); // PostgreSQL unique violation
    });

    it('routes session invalidation to AUTH_EXPIRED to prompt re-authentication', () => {
      expect(classifyError(new ORPCError('UNAUTHORIZED'))).toBe('AUTH_EXPIRED');
      expect(classifyError({ status: 401 })).toBe('AUTH_EXPIRED');
    });

    it('identifies CONFLICT for distributed multi-device collision resolution', () => {
      expect(classifyError(new ORPCError('CONFLICT'))).toBe('CONFLICT');
      expect(classifyError({ status: 409 })).toBe('CONFLICT');
    });
  });

  describe('Outbox Conflict Settlement Invariant', () => {
    it('successfully confirms completed operations when receipt operationId matches', () => {
      const receipt = {
        operationId: 'op-alpha-123',
        status: 'completed',
        serverRevision: 42,
      };

      const result = assertWorkspaceLayoutMutationCompleted(receipt, 'op-alpha-123');
      expect(result).toEqual({ operationId: 'op-alpha-123', serverRevision: 42 });
    });

    it('throws WorkspaceLayoutConflictError when concurrent edits clash on the server', () => {
      const conflictingReceipt = {
        operationId: 'op-alpha-123',
        status: 'conflict',
        conflictReason: 'Server layout revision 45 exceeds client revision 42',
        conflictingGroups: ['arrangement', 'groups'],
        conflictFetchReference: {
          workspaceId: 'ws-77',
          layoutTarget: 'mobile' as const,
        },
      };

      expect(() =>
        assertWorkspaceLayoutMutationCompleted(conflictingReceipt, 'op-alpha-123'),
      ).toThrow(WorkspaceLayoutConflictError);
    });

    it('rejects mismatched receipts targeting a different operation', () => {
      const alienReceipt = {
        operationId: 'op-alien-999',
        status: 'completed',
      };

      expect(() =>
        assertWorkspaceLayoutMutationCompleted(alienReceipt, 'op-alpha-123'),
      ).toThrow('Workspace mutation receipt belongs to a different operation.');
    });
  });
});
