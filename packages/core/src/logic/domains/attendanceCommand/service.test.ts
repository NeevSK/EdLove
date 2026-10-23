import { describe, expect, it, vi } from 'vitest';
import { ATTENDANCE_BATCH_RECORD_CAPABILITY, AttendanceBatchRecordEventDecision } from './contract';
import type { AttendanceBatchAuthority, AttendanceBatchCommandDependencies } from './ports';
import { AttendanceBatchCommandError, executeAttendanceBatchRecord } from './service';

const command = {
  gradeClassId: '123e4567-e89b-12d3-a456-426614174001',
  date: '2026-10-23',
  idempotencyKey: 'attendance-command-1',
  records: [
    {
      studentId: '123e4567-e89b-12d3-a456-426614174002',
      status: 'present' as const,
    },
  ],
};

const authority: AttendanceBatchAuthority = {
  principalId: '123e4567-e89b-12d3-a456-426614174003',
  activeScope: {
    schoolId: '123e4567-e89b-12d3-a456-426614174004',
    gradeClassIds: [command.gradeClassId],
    capabilities: ['attendance:write'],
  },
};

function dependencies(overrides: Partial<AttendanceBatchCommandDependencies> = {}) {
  const receipt = {
    operationId: '123e4567-e89b-12d3-a456-426614174005',
    status: 'pending' as const,
    payloadHash: 'attendance-payload-hash',
    result: null,
  };
  return {
    receipts: {
      claim: vi.fn(async () => ({ kind: 'claimed' as const, receipt })),
      complete: vi.fn(
        async ({
          result,
        }: {
          result: readonly {
            attendanceId: string;
            studentId: string;
            status: 'present' | 'absent' | 'late' | 'excused';
          }[];
        }) => ({
          ...receipt,
          status: 'completed' as const,
          result,
        }),
      ),
      fail: vi.fn(async () => undefined),
    },
    attendance: {
      recordBatch: vi.fn(async () => [
        {
          attendanceId: '123e4567-e89b-12d3-a456-426614174006',
          studentId: command.records[0]!.studentId,
          status: 'present' as const,
        },
      ]),
    },
    hashPayload: vi.fn(() => 'attendance-payload-hash'),
    ...overrides,
  } satisfies AttendanceBatchCommandDependencies;
}

describe('executeAttendanceBatchRecord', () => {
  it('rejects malformed input before authority or receipt processing', async () => {
    const deps = dependencies();

    await expect(
      executeAttendanceBatchRecord({ ...command, gradeClassId: 'not-a-uuid' }, authority, deps),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    } satisfies Partial<AttendanceBatchCommandError>);
    expect(deps.receipts.claim).not.toHaveBeenCalled();
  });

  it('commits an authorized batch and completes its receipt', async () => {
    const deps = dependencies();

    const result = await executeAttendanceBatchRecord(command, authority, deps);

    expect(result).toMatchObject({
      capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
      outcome: 'committed',
      operationId: '123e4567-e89b-12d3-a456-426614174005',
    });
    expect(deps.attendance.recordBatch).toHaveBeenCalledWith({ authority, command });
    expect(deps.receipts.complete).toHaveBeenCalledOnce();
  });

  it('returns a completed same-payload receipt without applying the batch again', async () => {
    const deps = dependencies({
      receipts: {
        ...dependencies().receipts,
        claim: vi.fn(async () => ({
          kind: 'replay' as const,
          receipt: {
            operationId: '123e4567-e89b-12d3-a456-426614174005',
            status: 'completed' as const,
            payloadHash: 'attendance-payload-hash',
            result: [
              {
                attendanceId: '123e4567-e89b-12d3-a456-426614174006',
                studentId: command.records[0]!.studentId,
                status: 'present' as const,
              },
            ],
          },
        })),
      },
    });

    const result = await executeAttendanceBatchRecord(command, authority, deps);

    expect(result.outcome).toBe('replayed');
    expect(deps.attendance.recordBatch).not.toHaveBeenCalled();
  });

  it('rejects a key reused for another payload without applying the batch', async () => {
    const deps = dependencies({
      receipts: {
        ...dependencies().receipts,
        claim: vi.fn(async () => ({
          kind: 'payload-conflict' as const,
          receipt: {
            operationId: '123e4567-e89b-12d3-a456-426614174005',
            status: 'completed' as const,
            payloadHash: 'different-payload-hash',
            result: [],
          },
        })),
      },
    });

    await expect(executeAttendanceBatchRecord(command, authority, deps)).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT',
    } satisfies Partial<AttendanceBatchCommandError>);
    expect(deps.attendance.recordBatch).not.toHaveBeenCalled();
  });

  it('rejects an out-of-scope target before creating a receipt', async () => {
    const deps = dependencies();
    const outOfScope = {
      ...authority,
      activeScope: { ...authority.activeScope, gradeClassIds: [] },
    };

    await expect(executeAttendanceBatchRecord(command, outOfScope, deps)).rejects.toMatchObject({
      code: 'SCOPE_MISMATCH',
    } satisfies Partial<AttendanceBatchCommandError>);
    expect(deps.receipts.claim).not.toHaveBeenCalled();
  });

  it('records a recoverable failed receipt when the persistence boundary fails', async () => {
    const deps = dependencies({
      attendance: { recordBatch: vi.fn(async () => Promise.reject(new Error('database down'))) },
    });

    await expect(executeAttendanceBatchRecord(command, authority, deps)).rejects.toMatchObject({
      code: 'DEPENDENCY_FAILURE',
    } satisfies Partial<AttendanceBatchCommandError>);
    expect(deps.receipts.fail).toHaveBeenCalledWith({
      operationId: '123e4567-e89b-12d3-a456-426614174005',
      payloadHash: 'attendance-payload-hash',
      failureCode: 'DEPENDENCY_FAILURE',
    });
  });

  it('does not overwrite a possibly committed receipt when receipt completion is uncertain', async () => {
    const deps = dependencies({
      receipts: {
        ...dependencies().receipts,
        complete: vi.fn(async () => Promise.reject(new Error('receipt timeout'))),
      },
    });

    await expect(executeAttendanceBatchRecord(command, authority, deps)).rejects.toMatchObject({
      code: 'OPERATION_IN_PROGRESS',
    } satisfies Partial<AttendanceBatchCommandError>);
    expect(deps.attendance.recordBatch).toHaveBeenCalledOnce();
    expect(deps.receipts.fail).not.toHaveBeenCalled();
  });

  it('G2 scenario: recovers a lost client response through the completed receipt', async () => {
    const receipts = new Map<
      string,
      {
        operationId: string;
        status: 'pending' | 'completed';
        payloadHash: string;
        result:
          | readonly {
              attendanceId: string;
              studentId: string;
              status: 'present' | 'absent' | 'late' | 'excused';
            }[]
          | null;
      }
    >();
    const recordBatch = vi.fn(async () => [
      {
        attendanceId: '123e4567-e89b-12d3-a456-426614174006',
        studentId: command.records[0]!.studentId,
        status: 'present' as const,
      },
    ]);
    const deps: AttendanceBatchCommandDependencies = {
      hashPayload: () => 'attendance-payload-hash',
      attendance: { recordBatch },
      receipts: {
        claim: async ({ idempotencyKey, payloadHash }) => {
          const existing = receipts.get(idempotencyKey);
          if (existing && existing.payloadHash !== payloadHash) {
            return { kind: 'payload-conflict', receipt: existing };
          }
          if (existing?.status === 'completed') return { kind: 'replay', receipt: existing };
          if (existing) return { kind: 'in-progress', receipt: existing };
          const created = {
            operationId: '123e4567-e89b-12d3-a456-426614174005',
            status: 'pending' as const,
            payloadHash,
            result: null,
          };
          receipts.set(idempotencyKey, created);
          return { kind: 'claimed', receipt: created };
        },
        complete: async ({ operationId, payloadHash, result }) => {
          const receipt = [...receipts.values()].find((item) => item.operationId === operationId);
          if (!receipt || receipt.payloadHash !== payloadHash)
            throw new Error('Receipt disappeared');
          const completed = { ...receipt, status: 'completed' as const, result };
          receipts.set(command.idempotencyKey, completed);
          return completed;
        },
        fail: async () => undefined,
      },
    };

    await executeAttendanceBatchRecord(command, authority, deps); // Response is lost after settlement.
    const recovered = await executeAttendanceBatchRecord(command, authority, deps);

    expect(recovered.outcome).toBe('replayed');
    expect(recordBatch).toHaveBeenCalledOnce();
  });

  it('does not create user-visible activity for attendance by default', () => {
    expect(AttendanceBatchRecordEventDecision).toMatchObject({
      capability: ATTENDANCE_BATCH_RECORD_CAPABILITY,
      audit: { emit: true },
      productActivity: { emit: false },
      telemetry: { emit: true },
    });
    expect(AttendanceBatchRecordEventDecision.telemetry.excludes).toContain('requestPayload');
  });
});
