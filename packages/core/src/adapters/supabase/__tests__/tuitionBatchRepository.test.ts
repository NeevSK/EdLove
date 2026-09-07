import { describe, expect, it } from 'vitest';
import { createSupabaseTuitionBatchRepository } from '../tuitionBatchRepository';

function mockQuery(data: unknown, error: unknown = null) {
  const query: any = {
    select: () => query,
    eq: () => query,
    order: () => query,
    single: () => Promise.resolve({ data, error }),
    maybeSingle: () => Promise.resolve({ data, error }),
    insert: () => query,
    update: () => query,
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(resolve({ data, error })),
  };
  return query;
}

describe('createSupabaseTuitionBatchRepository', () => {
  it('fetches active tuition batches for a tutor and maps them to CommercialPerspective', async () => {
    const mockBatches = [
      {
        id: 'batch-123',
        institute_id: 'inst-1',
        tutor_user_id: 'tutor-1',
        subject_name: 'Physics',
        grade_level: '2026 A/L',
        medium: 'sinhala',
        schedule: 'Sunday 8:00 AM',
        custom_alias: 'My Sunday Theory',
        role: 'lead_tutor',
        tuition_institutes: { name: 'Apex Institute' },
      },
    ];

    const supabase = {
      from: (table: string) => {
        expect(table).toBe('tuition_batches');
        return mockQuery(mockBatches);
      },
    };

    const repo = createSupabaseTuitionBatchRepository(supabase as any);
    const batches = await repo.getMyBatches('tutor-1');

    expect(batches).toHaveLength(1);
    expect(batches[0]).toMatchObject({
      id: 'batch-123',
      kind: 'commercial',
      displayName: 'My Sunday Theory',
      instituteName: 'Apex Institute',
      subjectName: 'Physics',
      grade: '2026 A/L',
      medium: 'sinhala',
      role: 'lead_tutor',
    });
  });

  it('creates a new tuition batch with proper payload', async () => {
    const insertedRow = {
      id: 'batch-new-1',
      institute_id: 'inst-apex',
      tutor_user_id: 'tutor-1',
      subject_name: 'Combined Mathematics',
      grade_level: '2027 A/L',
      medium: 'english',
      schedule: 'Saturday 2:00 PM',
      custom_alias: 'Apex Fast Track',
      role: 'lead_tutor',
      tuition_institutes: { name: 'Apex Institute' },
    };

    const supabase = {
      from: (table: string) => {
        expect(table).toBe('tuition_batches');
        return mockQuery(insertedRow);
      },
    };

    const repo = createSupabaseTuitionBatchRepository(supabase as any);
    const created = await repo.createBatch('tutor-1', {
      instituteId: 'inst-apex',
      subjectName: 'Combined Mathematics',
      gradeLevel: '2027 A/L',
      medium: 'english',
      schedule: 'Saturday 2:00 PM',
      customAlias: 'Apex Fast Track',
    });

    expect(created.id).toBe('batch-new-1');
    expect(created.displayName).toBe('Apex Fast Track');
    expect(created.subjectName).toBe('Combined Mathematics');
  });
});
