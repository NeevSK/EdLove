import { describe, expect, it, vi } from 'vitest';
import { longitudinalAPI } from '../longitudinal';

const { from } = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { from },
}));

const studentId = '00000000-0000-4000-8000-000000000001';

function event(classroomId: string, entityId: string) {
  return {
    id: entityId,
    student_id: studentId,
    school_id: '00000000-0000-4000-8000-000000000010',
    grade_id: null,
    classroom_id: classroomId,
    entity_type: 'attendance',
    entity_id: entityId,
    operation: 'insert',
    snapshot: {},
    metadata: {},
    source_table: 'attendance',
    recorded_by: null,
    occurred_at: '2026-03-28T09:00:00.000Z',
    recorded_at: '2026-03-28T09:00:00.000Z',
    effective_from: null,
    effective_to: null,
    created_at: '2026-03-28T09:00:00.000Z',
    updated_at: '2026-03-28T09:00:00.000Z',
  };
}

describe('student longitudinal cross-classroom authorization boundary', () => {
  it('denies a timeline read when the returned event belongs to another classroom', async () => {
    const enrollmentQuery = {
      select: vi.fn(),
      eq: vi.fn(),
    };
    enrollmentQuery.select.mockReturnValue(enrollmentQuery);
    enrollmentQuery.eq.mockReturnValue(enrollmentQuery);
    enrollmentQuery.eq.mockReturnValueOnce(enrollmentQuery).mockReturnValueOnce(
      Promise.resolve({
        data: [{ classroom_id: '00000000-0000-4000-8000-000000000010' }],
        error: null,
      }),
    );

    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      lte: vi.fn(),
      order: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.in.mockReturnValue(query);
    query.lte.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.order.mockReturnValueOnce(query).mockReturnValueOnce(
      Promise.resolve({
        data: [event('00000000-0000-4000-8000-000000000020', 'event-cross-classroom')],
        error: null,
      }),
    );
    from.mockReturnValueOnce(enrollmentQuery).mockReturnValueOnce(query);

    const read = longitudinalAPI.getStudentTimeline(
      studentId,
      '2026-03-28T23:59:59.000Z',
    );

    await expect(read).rejects.toThrow();
  });
});
