import { call } from '@orpc/server';
import { ASSIGNMENT_SUBMISSION_CAPABILITY } from '@repo/core/api/educational.contract';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { createZenStackDb } from '@repo/database/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { settleAssignmentSubmission } from '../core/assignmentSettlement';
import { educationalRouter } from '../core/handlers/educational';
import type { ORPCContext } from '../core/orpc';

const fixture = vi.hoisted(() => {
  const accountId = '123e4567-e89b-8101-8000-426614174000';
  const input = {
    assignmentId: '123e4567-e89b-12d3-a456-426614174001',
    content: 'Synthetic work',
    idempotencyKey: '123e4567-e89b-8101-8000-426614174002',
  };
  const submission = {
    id: '123e4567-e89b-12d3-a456-426614174003',
    student_id: accountId,
    assignment_id: input.assignmentId,
    content: input.content,
    submitted_at: new Date('2026-10-15T00:00:00.000Z'),
    grade: null,
    feedback: null,
    graded_at: null,
    idempotency_key: input.idempotencyKey,
    assignment: { classroom_id: '123e4567-e89b-12d3-a456-426614174004' },
  };
  const initialResult: unknown = null;
  const receipt = {
    operation_id: '123e4567-e89b-12d3-a456-426614174005',
    payload_hash: '',
    status: 'pending',
    result: initialResult,
  };
  const scenario: {
    claimed: boolean;
    missingReceipt: boolean;
    row: typeof submission | null;
    auditError: Error | null;
    queryError: object | null;
    updated: number;
    archived: boolean;
    schoolId: string;
    enrollmentStatus: string | null;
    missingAssignment: boolean;
    missingClassroom: boolean;
  } = {
    claimed: true,
    missingReceipt: false,
    row: null,
    auditError: null,
    queryError: null,
    updated: 1,
    archived: false,
    schoolId: 'school-fixture',
    enrollmentStatus: 'active',
    missingAssignment: false,
    missingClassroom: false,
  };
  const events: string[] = [];
  const queries: Array<{ sql: string; values: unknown[] }> = [];
  const tx = {
    assignment: {
      findUnique: vi.fn(async () =>
        scenario.missingAssignment
          ? null
          : {
              classroom_id: submission.assignment.classroom_id,
              classroom: { school_id: scenario.schoolId },
            },
      ),
    },
    classroom: {
      findUnique: vi.fn(async () =>
        scenario.missingClassroom
          ? null
          : {
              id: submission.assignment.classroom_id,
              school_id: scenario.schoolId,
              is_archived: scenario.archived,
            },
      ),
    },
    classroomStudent: {
      findUnique: vi.fn(async () =>
        scenario.enrollmentStatus === null ? null : { status: scenario.enrollmentStatus },
      ),
    },
    $queryRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      const sql = parts.join('?');
      queries.push({ sql, values });
      if (scenario.queryError) throw scenario.queryError;
      if (sql.includes('INSERT INTO')) {
        events.push('claim');
        if (scenario.claimed) receipt.operation_id = String(values[0]);
        return scenario.claimed ? [{ operation_id: receipt.operation_id }] : [];
      }
      events.push('lock');
      return scenario.missingReceipt ? [] : [receipt];
    }),
    $executeRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      const sql = parts.join('?');
      queries.push({ sql, values });
      if (!sql.includes('UPDATE public.operation_receipts')) return 0;
      events.push('commit-receipt');
      return scenario.updated;
    }),
    assignmentSubmission: {
      findUnique: vi.fn(async () => scenario.row),
      create: vi.fn(async () => {
        events.push('submission');
        return submission;
      }),
    },
    sentinelAuditLog: {
      create: vi.fn(async () => {
        events.push('audit');
        if (scenario.auditError) throw scenario.auditError;
        return {};
      }),
    },
  };
  const db = {
    assignment: tx.assignment,
    classroom: tx.classroom,
    classroomStudent: tx.classroomStudent,
    $transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    assignmentSubmission: {
      create: vi.fn(() => {
        throw new Error('Unbound submission write');
      }),
    },
    $queryRaw: vi.fn(() => {
      throw new Error('Unbound receipt read');
    }),
    $executeRaw: vi.fn(() => {
      throw new Error('Unbound receipt write');
    }),
  };
  return { accountId, input, submission, receipt, scenario, events, queries, tx, db };
});

vi.mock('@repo/database/client', () => ({ createZenStackDb: () => fixture.db }));

const execute = () =>
  settleAssignmentSubmission(
    {
      db: createZenStackDb({ id: fixture.accountId }),
      user: { id: fixture.accountId },
      requestId: 'settlement-fixture',
      schoolId: 'school-fixture',
      capacity: 'student',
    },
    fixture.input,
  );

describe('keyed assignment settlement (transaction/database substituted)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    fixture.events.length = 0;
    fixture.queries.length = 0;
    Object.assign(fixture.scenario, {
      claimed: true,
      missingReceipt: false,
      row: null,
      auditError: null,
      queryError: null,
      updated: 1,
      archived: false,
      schoolId: 'school-fixture',
      enrollmentStatus: 'active',
      missingAssignment: false,
      missingClassroom: false,
    });
    Object.assign(fixture.receipt, {
      status: 'pending',
      result: null,
      payload_hash: await getConsistentIdempotencyKey(
        {
          studentId: fixture.accountId,
          assignmentId: fixture.input.assignmentId,
          content: fixture.input.content,
        },
        ASSIGNMENT_SUBMISSION_CAPABILITY,
      ),
    });
  });

  it('binds submission, audit and payload-matched receipt settlement to the transaction', async () => {
    await expect(execute()).resolves.toMatchObject({ id: fixture.submission.id });
    expect(fixture.events).toEqual(['claim', 'lock', 'submission', 'audit', 'commit-receipt']);
    expect(fixture.db.$transaction).toHaveBeenCalledOnce();
    expect(fixture.tx.classroomStudent.findUnique).toHaveBeenCalledWith({
      where: {
        classroom_id_student_id: {
          classroom_id: fixture.submission.assignment.classroom_id,
          student_id: fixture.accountId,
        },
      },
      select: { status: true },
    });
    expect(fixture.db.assignmentSubmission.create).not.toHaveBeenCalled();
    expect(fixture.db.$executeRaw).not.toHaveBeenCalled();
    expect(fixture.queries.find(({ sql }) => sql.includes('INSERT INTO'))?.values).toEqual([
      expect.any(String),
      fixture.accountId,
      ASSIGNMENT_SUBMISSION_CAPABILITY,
      fixture.input.idempotencyKey,
      fixture.receipt.payload_hash,
    ]);
    expect(fixture.queries.find(({ sql }) => sql.includes('SELECT operation_id'))).toMatchObject({
      sql: expect.stringContaining('FOR UPDATE'),
      values: [fixture.accountId, ASSIGNMENT_SUBMISSION_CAPABILITY, fixture.input.idempotencyKey],
    });
    expect(fixture.tx.sentinelAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'assignment_submission_settled',
        actor_id: fixture.accountId,
        resource_type: 'assignment_submission',
        resource_id: fixture.submission.id,
        details: {
          assignmentId: fixture.input.assignmentId,
          operationId: fixture.receipt.operation_id,
          replayed: false,
        },
      },
    });
    expect(
      fixture.queries.find(({ sql }) => sql.includes('UPDATE public.operation_receipts'))?.values,
    ).toEqual([
      JSON.stringify({ submissionId: fixture.submission.id }),
      fixture.receipt.operation_id,
      fixture.accountId,
      fixture.receipt.payload_hash,
    ]);
    expect(fixture.queries.some(({ sql }) => sql.includes("lock_timeout = '2s'"))).toBe(true);
  });

  const statusToCode: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL_SERVER_ERROR',
    503: 'SERVICE_UNAVAILABLE',
  };

  it.each([
    [{ missingAssignment: true }, 404],
    [{ missingClassroom: true }, 404],
    [{ archived: true }, 403],
    [{ schoolId: 'foreign-school' }, 403],
    [{ enrollmentStatus: null }, 403],
    [{ enrollmentStatus: 'left' }, 403],
    [{ enrollmentStatus: 'suspended' }, 403],
  ])(
    'denies invalid persisted authority before any settlement write: %j',
    async (changes, status) => {
      Object.assign(fixture.scenario, changes);
      await expect(execute()).rejects.toMatchObject({ code: statusToCode[status] });
      expect(fixture.events).toEqual([]);
      expect(fixture.tx.assignmentSubmission.create).not.toHaveBeenCalled();
      expect(fixture.tx.sentinelAuditLog.create).not.toHaveBeenCalled();
      expect(fixture.tx.$queryRaw).not.toHaveBeenCalled();
    },
  );

  it('replays only a committed receipt and does not repeat domain/audit writes', async () => {
    fixture.scenario.claimed = false;
    fixture.scenario.row = fixture.submission;
    fixture.receipt.status = 'committed';
    fixture.receipt.result = { submissionId: fixture.submission.id };
    await expect(execute()).resolves.toMatchObject({ id: fixture.submission.id });
    expect(fixture.events).toEqual(['claim', 'lock']);
    expect(fixture.tx.assignmentSubmission.create).not.toHaveBeenCalled();
    expect(fixture.tx.sentinelAuditLog.create).not.toHaveBeenCalled();
  });

  it('rejects a reused key with a different canonical payload', async () => {
    fixture.scenario.claimed = false;
    fixture.receipt.payload_hash = 'different-hash';
    await expect(execute()).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(fixture.tx.assignmentSubmission.findUnique).not.toHaveBeenCalled();
  });

  it.each([
    ['pending', 503],
    ['failed', 503],
    ['conflict', 409],
  ] as const)(
    'does not treat an existing %s receipt as committed even if a row exists',
    async (status, expected) => {
      fixture.scenario.claimed = false;
      fixture.scenario.row = fixture.submission;
      fixture.receipt.status = status;
      await expect(execute()).rejects.toMatchObject({ code: statusToCode[expected] });
      expect(fixture.tx.assignmentSubmission.findUnique).not.toHaveBeenCalled();
      expect(fixture.tx.assignmentSubmission.create).not.toHaveBeenCalled();
    },
  );

  it.each([
    { student_id: 'other-student' },
    { assignment_id: 'other-assignment' },
    { content: 'other-content' },
  ])('does not expose a committed replay with mismatching persisted intent %j', async (change) => {
    fixture.scenario.claimed = false;
    fixture.scenario.row = { ...fixture.submission, ...change };
    fixture.receipt.status = 'committed';
    fixture.receipt.result = { submissionId: fixture.submission.id };
    await expect(execute()).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(fixture.events).toEqual(['claim', 'lock']);
  });

  it('fails closed when the claimed receipt cannot be read', async () => {
    fixture.scenario.missingReceipt = true;
    await expect(execute()).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(fixture.tx.assignmentSubmission.create).not.toHaveBeenCalled();
  });

  it('fails closed when a committed receipt references a missing submission', async () => {
    fixture.scenario.claimed = false;
    fixture.receipt.status = 'committed';
    fixture.receipt.result = { submissionId: fixture.submission.id };
    await expect(execute()).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(fixture.tx.assignmentSubmission.create).not.toHaveBeenCalled();
  });

  it('propagates an audit failure without settling the receipt', async () => {
    fixture.scenario.auditError = new Error('synthetic audit failure');
    await expect(execute()).rejects.toThrow('synthetic audit failure');
    expect(fixture.events).toEqual(['claim', 'lock', 'submission', 'audit']);
  });

  it('does not acknowledge a receipt update affecting zero rows', async () => {
    fixture.scenario.updated = 0;
    await expect(execute()).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });

  it.each(['55P03', '57014', '40001', '40P01'])(
    'maps database interruption %s to a retryable safe error',
    async (dbErrorCode) => {
      fixture.scenario.queryError = {
        dbErrorCode,
        dbErrorMessage: 'synthetic-private-provider-detail',
      };
      await expect(execute()).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Submission settlement was interrupted. Retry with the same key.',
      });
    },
  );

  it('reports a safe conflict for the retained legacy uniqueness constraint', async () => {
    fixture.scenario.queryError = { dbErrorCode: '23505' };
    await expect(execute()).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('sanitizes an audit exception through the actual educational procedure boundary', async () => {
    fixture.scenario.auditError = new Error('synthetic-private-audit-token');
    const context: ORPCContext = {
      db: createZenStackDb({ id: fixture.accountId }),
      user: { id: fixture.accountId },
      schoolId: 'school-fixture',
      capacity: 'student',
      requestId: 'settlement-privacy',
      principal: {
        id: fixture.accountId,
        type: 'student',
        attributes: {
          school_id: 'school-fixture',
          capacity: 'student',
          active_entity_id: 'school-fixture',
          active_entity_type: 'SCHOOL',
          classroom_ids: [fixture.submission.assignment.classroom_id],
        },
      },
      securityContext: { device_trust: 'standard', network_zone: 'public' },
    };
    await expect(
      call(
        educationalRouter.submitAssignment,
        {
          params: { assignmentId: fixture.input.assignmentId },
          body: { content: fixture.input.content, idempotencyKey: fixture.input.idempotencyKey },
        },
        { context },
      ),
    ).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected platform error occurred.',
      data: { requestId: 'settlement-privacy' },
    });
    expect(fixture.events).toEqual(['claim', 'lock', 'submission', 'audit']);
  });
});
