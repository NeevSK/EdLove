import { describe, expect, it } from 'vitest';
import { createSupabaseGuardianRepository } from '../guardianRepository';

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: () => query,
    eq: () => query,
    is: () => query,
    in: () => query,
    maybeSingle: () => Promise.resolve({ data, error }),
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve(resolve({ data, error })),
  };
  return query;
}

describe('Supabase guardian repository assessment boundary', () => {
  it('reads normalized assessment permissions without reading grades or legacy permission fields', async () => {
    const tables: string[] = [];
    const supabase = {
      from(table: string) {
        tables.push(table);
        if (table === 'student_guardian_relationships') {
          return queryResult([
            {
              id: 'relationship-1',
              student_id: 'student-1',
              guardian_id: 'guardian-1',
              relationship_type: 'parent',
              created_at: '2026-01-01T00:00:00.000Z',
            },
          ]);
        }
        if (table === 'guardian_assessment_permissions') {
          return queryResult([{ relationship_id: 'relationship-1', access_level: 'read' }]);
        }
        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const relationships = await createSupabaseGuardianRepository(
      supabase as never,
    ).getGuardianRelationships('guardian-1');

    expect(relationships[0]?.permissions).toEqual([
      { category: 'grades', level: 'read', scope: 'assigned_students' },
    ]);
    expect(tables).toEqual(['student_guardian_relationships', 'guardian_assessment_permissions']);
    expect(tables).not.toContain('grades');
  });
});
