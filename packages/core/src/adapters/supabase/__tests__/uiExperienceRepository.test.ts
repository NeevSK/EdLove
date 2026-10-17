import { describe, expect, it } from 'vitest';
import { createSupabaseUIExperienceRepository } from '../uiExperienceRepository';

function queryBuilder(data: unknown, error: unknown = null) {
  const q: any = {
    select: () => q,
    eq: () => q,
    in: () => q,
    is: () => q,
    lte: () => q,
    gte: () => q,
    order: () => q,
    limit: () => q,
    insert: () => q,
    single: () => Promise.resolve({ data, error }),
    maybeSingle: () => Promise.resolve({ data, error }),
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(resolve({ data, error })),
  };
  return q;
}

describe('UIExperienceRepository (G1 Adapter Boundary)', () => {
  it('maps mood journey events properly from Supabase mood_logs table', async () => {
    const supabase = {
      from(table: string) {
        expect(table).toBe('mood_logs');
        return queryBuilder([
          {
            id: 'mood-1',
            created_at: '2026-09-20T10:00:00.000Z',
            mood_type: 'Joyful',
            note: 'Feeling aligned',
          },
        ]);
      },
    };

    const repo = createSupabaseUIExperienceRepository(supabase as never);
    const events = await repo.getMoodJourneyEvents('user-123');

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      id: 'mood-1',
      timestamp: '2026-09-20T10:00:00.000Z',
      type: 'mood',
      title: 'Mood: Joyful',
      description: 'Feeling aligned',
      accentColor: '#F6BF8C',
    });
  });

  it('calculates pending actions without direct database leakage', async () => {
    const supabase = {
      from(table: string) {
        if (table === 'classrooms') {
          return queryBuilder([{ id: 'cls-1', name: 'Grade 5 Math' }]);
        }
        if (table === 'attendance') {
          return queryBuilder([]); // no attendance marked today
        }
        if (table === 'assignments') {
          return queryBuilder([
            {
              id: 'assign-1',
              title: 'Algebra Homework',
              classroom_id: 'cls-1',
              due_date: '2026-09-20T18:00:00',
            },
          ]);
        }
        if (table === 'submissions') {
          return queryBuilder([{ assignment_id: 'assign-1' }]);
        }
        throw new Error(`Unexpected table ${table}`);
      },
    };

    const repo = createSupabaseUIExperienceRepository(supabase as never);
    const actions = await repo.getPendingActions('teacher-1');

    expect(actions.attendancePending).toEqual([
      { classroomId: 'cls-1', classroomName: 'Grade 5 Math' },
    ]);
    expect(actions.gradingPending).toEqual([
      {
        assignmentId: 'assign-1',
        assignmentTitle: 'Algebra Homework',
        classroomId: 'cls-1',
        classroomName: 'Grade 5 Math',
        ungradedCount: 1,
      },
    ]);
  });
});
