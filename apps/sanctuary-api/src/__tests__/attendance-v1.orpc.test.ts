import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { call } from '@orpc/server';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attendanceV1Router } from '../core/handlers/attendanceV1';
import { canonicalV1Router } from '../core/canonicalV1Registry';
import { registerCanonicalV1Routes } from '../core/routes/canonicalV1';

const fixture = vi.hoisted(() => {
  const accountId = '123e4567-e89b-8101-8000-426614174000';
  const schoolId = '123e4567-e89b-12d3-a456-426614174004';
  const gradeClassId = '123e4567-e89b-12d3-a456-426614174001';
  const studentId = '123e4567-e89b-8101-8000-426614174002';
  const receipt = {
    operation_id: '123e4567-e89b-12d3-a456-426614174005',
    payload_hash: '',
    status: 'pending',
    result: null as unknown,
  };
  const state = {
    claimed: true,
    payloadMatches: true,
    scopeActive: true,
    failAudit: false,
    writes: 0,
    audits: 0,
    committed: 0,
  };
  const tx = {
    $executeRaw: vi.fn(async (parts: TemplateStringsArray) => {
      if (!parts.join('?').includes('UPDATE public.operation_receipts')) return 0;
      state.committed += 1;
      return 1;
    }),
    $queryRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      const sql = parts.join('?');
      if (sql.includes('INSERT INTO public.operation_receipts')) {
        receipt.payload_hash = state.payloadMatches ? String(values[4]) : 'different-payload-hash';
        if (state.claimed) receipt.operation_id = String(values[0]);
        return state.claimed ? [{ operation_id: receipt.operation_id }] : [];
      }
      return [receipt];
    }),
    userPreferences: {
      findUnique: vi.fn(async () => ({
        active_bond_id: state.scopeActive ? 'bond-fixture' : null,
      })),
      update: vi.fn(async () => ({})),
    },
    bond: {
      findFirst: vi.fn(async () => ({
        id: 'bond-fixture',
        user_id: accountId,
        entity_id: schoolId,
        entity_type: 'SCHOOL',
        capacity: 'teacher',
        status: 'active',
        valid_from: new Date('2026-01-01T00:00:00.000Z'),
        valid_until: null,
        metadata: { schoolId },
      })),
    },
    gradeClass: {
      findUnique: vi.fn(async () => ({
        id: gradeClassId,
        school_id: schoolId,
        academic_cycle_id: schoolId,
      })),
    },
    studentGradeClassEnrollment: { findFirst: vi.fn(async () => ({ id: 'enrollment-fixture' })) },
    dailyAttendance: {
      upsert: vi.fn(async () => {
        state.writes += 1;
        return {
          id: '123e4567-e89b-12d3-a456-426614174006',
          student_id: studentId,
          status: 'present',
          created_at: new Date('2026-10-23T00:00:00.000Z'),
          student: null,
          sessions: [],
        };
      }),
    },
    sentinelAuditLog: {
      create: vi.fn(async () => {
        state.audits += 1;
        if (state.failAudit) throw new Error('synthetic audit failure');
        return {};
      }),
    },
  };
  const db = {
    $transaction: vi.fn(async (work: (client: typeof tx) => Promise<unknown>) => {
      const checkpoint = { ...state };
      try {
        return await work(tx);
      } catch (error) {
        Object.assign(state, checkpoint);
        throw error;
      }
    }),
  };
  const context = {
    db,
    user: { id: accountId },
    schoolId,
    capacity: 'teacher',
    activeBondId: 'bond-fixture',
    requestId: 'attendance-v1-fixture',
    principal: {
      id: accountId,
      type: 'teacher',
      attributes: {
        school_id: schoolId,
        active_entity_id: schoolId,
        active_entity_type: 'SCHOOL',
        capacity: 'teacher',
        classroom_ids: [gradeClassId],
      },
    },
    __doubleGatePermitted: true,
  };
  const input = {
    body: {
      gradeClassId,
      date: '2026-10-23',
      idempotencyKey: '123e4567-e89b-12d3-a456-426614174007',
      records: [{ studentId, status: 'present' as const }],
    },
  };
  return { accountId, receipt, state, tx, context, input };
});

vi.mock('../core/router', () => ({
  buildORPCContextFromHono: vi.fn(async () => fixture.context),
}));

describe('attendance v1 canonical oRPC procedure (G1 substituted database)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(fixture.state, {
      claimed: true,
      payloadMatches: true,
      scopeActive: true,
      failAudit: false,
      writes: 0,
      audits: 0,
      committed: 0,
    });
    Object.assign(fixture.receipt, { status: 'pending', result: null, payload_hash: '' });
  });

  it('settles receipt, attendance and audit through one transaction', async () => {
    const result = await call(attendanceV1Router.batchRecord, fixture.input, {
      context: fixture.context as any,
    });

    expect(result).toMatchObject({
      outcome: 'committed',
      records: [{ studentId: fixture.input.body.records[0].studentId }],
    });
    expect(fixture.context.db.$transaction).toHaveBeenCalledOnce();
    expect(fixture.state.writes).toBe(1);
    expect(fixture.state.audits).toBe(1);
    const settlement = fixture.tx.$executeRaw.mock.calls.find(([parts]: [TemplateStringsArray]) =>
      parts.join('?').includes("UPDATE public.operation_receipts SET status = 'committed'"),
    );
    expect(settlement).toEqual([
      expect.any(Array),
      expect.any(String),
      expect.any(String),
      fixture.accountId,
      expect.any(String),
    ]);
  });

  it('replays a committed matching receipt without a second attendance write', async () => {
    fixture.state.claimed = false;
    fixture.state.payloadMatches = true;
    fixture.receipt.status = 'committed';
    fixture.receipt.result = [
      {
        attendanceId: '123e4567-e89b-12d3-a456-426614174006',
        studentId: fixture.input.body.records[0].studentId,
        status: 'present',
      },
    ];

    const result = await call(attendanceV1Router.batchRecord, fixture.input, {
      context: fixture.context as any,
    });

    expect(result.outcome).toBe('replayed');
    expect(fixture.state.writes).toBe(0);
    expect(fixture.state.audits).toBe(0);
  });

  it('rejects a changed payload for the same completed idempotency key before writing', async () => {
    fixture.state.claimed = false;
    fixture.state.payloadMatches = false;
    fixture.receipt.status = 'committed';
    fixture.receipt.result = [];

    await expect(
      call(attendanceV1Router.batchRecord, fixture.input, { context: fixture.context as any }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });

    expect(fixture.state.writes).toBe(0);
    expect(fixture.state.audits).toBe(0);
    expect(fixture.state.committed).toBe(0);
  });

  it('G1 transaction scenario: audit failure rolls the pending receipt and attendance work back together', async () => {
    fixture.state.failAudit = true;

    await expect(
      call(attendanceV1Router.batchRecord, fixture.input, { context: fixture.context as any }),
    ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });

    expect(fixture.state.writes).toBe(0);
    expect(fixture.state.audits).toBe(0);
    expect(fixture.state.committed).toBe(0);
  });

  it('rolls back a claimed receipt when the persisted active scope is no longer valid', async () => {
    fixture.state.scopeActive = false;

    await expect(
      call(attendanceV1Router.batchRecord, fixture.input, { context: fixture.context as any }),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      data: {
        capability: 'classroom.attendance.batch-record',
        failureKind: 'authorization',
        retryable: false,
      },
    });

    expect(fixture.state.writes).toBe(0);
    expect(fixture.state.audits).toBe(0);
  });

  it('G3 route scenario: Hono and the oRPC OpenAPI adapter match the literal v1 path', async () => {
    const app = new Hono();
    registerCanonicalV1Routes(app, new OpenAPIHandler(canonicalV1Router as any));

    const response = await app.request('/api/v1/classroom/attendance/batch-record', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fixture.input.body),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      outcome: 'committed',
      records: [{ studentId: fixture.input.body.records[0].studentId }],
    });
    expect(fixture.context.db.$transaction).toHaveBeenCalledOnce();
  });

  it('G3 route scenario: production canonical composition serializes declared authorization failures', async () => {
    fixture.state.scopeActive = false;
    const app = new Hono();
    registerCanonicalV1Routes(app, new OpenAPIHandler(canonicalV1Router as any));

    const response = await app.request('/api/v1/classroom/attendance/batch-record', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(fixture.input.body),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        capability: 'classroom.attendance.batch-record',
        failureKind: 'authorization',
        retryable: false,
      },
    });
  });
});
