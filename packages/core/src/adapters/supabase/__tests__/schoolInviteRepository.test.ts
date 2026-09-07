import { describe, expect, it } from 'vitest';
import { createSupabaseSchoolInviteRepository } from '../schoolInviteRepository';

describe('createSupabaseSchoolInviteRepository', () => {
  it('validates active invite code, increments used count, and creates bond in database', async () => {
    const mockInvite = {
      id: 'invite-1',
      code: 'ROYAL2026',
      capacity: 'teacher',
      roles: ['teacher'],
      used_count: 5,
      max_uses: 50,
      is_active: true,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      schools: {
        id: 'school-royal',
        name: 'Royal College',
        type: '1AB',
      },
    };

    let updatedTable = '';
    let upsertedTable = '';
    let upsertedData: any = null;

    const supabase = {
      from: (table: string) => {
        if (table === 'school_invite_codes') {
          const query: any = {
            select: () => query,
            eq: () => query,
            maybeSingle: () => Promise.resolve({ data: mockInvite, error: null }),
            update: (payload: any) => {
              updatedTable = table;
              return {
                eq: () => Promise.resolve({ data: null, error: null }),
              };
            },
          };
          return query;
        }

        if (table === 'bonds') {
          return {
            upsert: (payload: any) => {
              upsertedTable = table;
              upsertedData = payload;
              return Promise.resolve({ data: null, error: null });
            },
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    };

    const repo = createSupabaseSchoolInviteRepository(supabase as any);
    const result = await repo.verifyAndRedeemInviteCode('ROYAL2026', 'user-teacher-1');

    expect(result).toEqual({
      schoolId: 'school-royal',
      schoolName: 'Royal College',
      capacity: 'teacher',
      roles: ['teacher'],
    });

    expect(updatedTable).toBe('school_invite_codes');
    expect(upsertedTable).toBe('bonds');
    expect(upsertedData).toMatchObject({
      user_id: 'user-teacher-1',
      entity_id: 'school-royal',
      entity_type: 'school',
      capacity: 'teacher',
    });
  });

  it('rejects expired invite code', async () => {
    const expiredInvite = {
      id: 'invite-expired',
      code: 'OLDCODE',
      capacity: 'student',
      roles: ['student'],
      used_count: 0,
      max_uses: 10,
      is_active: true,
      expires_at: new Date(Date.now() - 86400000).toISOString(),
      schools: { id: 'school-1', name: 'School 1' },
    };

    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: expiredInvite, error: null }),
            }),
          }),
        }),
      }),
    };

    const repo = createSupabaseSchoolInviteRepository(supabase as any);
    await expect(repo.verifyAndRedeemInviteCode('OLDCODE', 'user-1')).rejects.toThrow(
      'This invite code has expired',
    );
  });
});
