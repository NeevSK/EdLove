import { beforeEach, describe, expect, it, vi } from 'vitest';

const batchRecord = vi.fn(async (rows: unknown[]) => rows);
const resolve = vi.fn(async () => 'gc-resolved');

vi.mock('@repo/core/api/attendance', () => ({ attendanceAPI: { batchRecord } }));
vi.mock('@repo/core/logic/classroomResolver', () => ({ resolveGradeClassFromClassroom: resolve }));
vi.mock('@repo/core/api/assignmentCommands', () => ({ replayAssignmentSubmission: vi.fn() }));
vi.mock('@repo/core/api/client', () => ({ api: {} }));
vi.mock('@repo/core/api/deviceTrust', () => ({ deviceTrustAPI: {} }));
vi.mock('@repo/core/api/orpcClient', () => ({ orpcClient: {} }));

const { MUTATION_REGISTRY: registryModule } = await import('../registry');
type Replay = (vars: any) => Promise<any>;
const MUTATION_REGISTRY = registryModule as unknown as {
  batchRecordAttendance: Replay;
  updateAttendance: Replay;
};

const students = [
  { id: 'e1', student_id: 's1', full_name: 'A', roll_number: null, status: 'present' },
  { id: 'e2', student_id: null, full_name: 'B', roll_number: null, status: 'absent' },
  { id: 'e3', student_id: 's3', full_name: 'C', roll_number: null, status: 'late' },
];

describe('MUTATION_REGISTRY.batchRecordAttendance (offline register replay)', () => {
  beforeEach(() => {
    batchRecord.mockClear();
    resolve.mockClear();
  });

  it('is registered so queued saves do not dead-letter as Unknown mutation', () => {
    expect(typeof MUTATION_REGISTRY.batchRecordAttendance).toBe('function');
  });

  it('writes daily rows for the grade class and skips students without an id', async () => {
    await MUTATION_REGISTRY.batchRecordAttendance({
      gradeClassId: 'gc1',
      date: '2026-10-22',
      students,
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(batchRecord).toHaveBeenCalledWith([
      { gradeClassId: 'gc1', studentId: 's1', status: 'present', date: '2026-10-22' },
      { gradeClassId: 'gc1', studentId: 's3', status: 'late', date: '2026-10-22' },
    ]);
  });

  it('resolves a legacy classroom id at replay time', async () => {
    await MUTATION_REGISTRY.batchRecordAttendance({
      classroomId: 'c1',
      schoolId: 'sch',
      date: '2026-10-22',
      students,
    });
    expect(resolve).toHaveBeenCalledWith('c1', 'sch');
    expect((batchRecord.mock.calls[0]?.[0] as any[])[0].gradeClassId).toBe('gc-resolved');
  });

  it('rejects legacy array-only items instead of silently dropping them', async () => {
    await expect(MUTATION_REGISTRY.batchRecordAttendance(students)).rejects.toThrow(/Legacy/);
    expect(batchRecord).not.toHaveBeenCalled();
  });

  it('fails loudly when a legacy classroom cannot be mapped to a grade class', async () => {
    resolve.mockResolvedValueOnce('');
    await expect(
      MUTATION_REGISTRY.batchRecordAttendance({ classroomId: 'c1', date: '2026-10-22', students }),
    ).rejects.toThrow(/no grade class/);
    expect(batchRecord).not.toHaveBeenCalled();
  });

  it('updateAttendance does not send a classroom id as a grade class id', async () => {
    resolve.mockResolvedValueOnce('');
    await expect(
      MUTATION_REGISTRY.updateAttendance({
        classroomId: 'c1',
        studentId: 's1',
        status: 'present',
        date: '2026-10-22',
      }),
    ).rejects.toThrow(/no grade class/);
  });
});
