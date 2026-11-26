import { createRouterClient, ORPCError } from '@orpc/server';
import type { PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { router } from '../../core/router';
import {
  checkHandleAvailable,
  createInviteCode,
  listInviteCodes,
  provisionInstitution,
  revokeInviteCode,
  updateInstitution,
} from '../institutions';

interface QueryCall {
  sql: string;
  params?: unknown[];
}

function mockClient(handlers: {
  query?: (sql: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number }>;
}) {
  const calls: QueryCall[] = [];
  const client = {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      calls.push({ sql, params });
      if (handlers.query) return handlers.query(sql, params);
      return { rows: [], rowCount: 0 };
    }),
  } as unknown as PoolClient;
  return { client, calls };
}

describe('ops.institutions capability logic (G1 boundary / Vitest)', () => {
  const accountId = '01928374-abcd-8000-8000-000000000001';

  it('checkHandleAvailable reports availability when no row matches', async () => {
    const { client } = mockClient({
      query: async () => ({ rows: [], rowCount: 0 }),
    });

    const res = await checkHandleAvailable(client, { handle: 'new-school' });
    expect(res).toEqual({ available: true });
  });

  it('checkHandleAvailable reports false when a school exists with that handle', async () => {
    const { client } = mockClient({
      query: async () => ({ rows: [{ 1: 1 }], rowCount: 1 }),
    });

    const res = await checkHandleAvailable(client, { handle: 'royal-college' });
    expect(res).toEqual({ available: false });
  });

  it('provisionInstitution succeeds with school, bond, and community group', async () => {
    const { client, calls } = mockClient({
      query: async (sql) => {
        if (sql.includes('SELECT result FROM public.operation_receipts')) {
          return { rows: [], rowCount: 0 };
        }
        if (sql.includes('SELECT id FROM public.schools WHERE handle')) {
          return { rows: [], rowCount: 0 };
        }
        return { rows: [], rowCount: 1 };
      },
    });

    const input = {
      name: 'St. Peter College',
      handle: 'st-peter-college',
      type: 'k12' as const,
      idempotencyKey: '01928374-abcd-8000-8000-000000000099',
    };

    const result = await provisionInstitution(client, accountId, input);

    expect(result.schoolId).toBeTruthy();
    expect(result.groupId).toBeTruthy();
    expect(result.groupFailed).toBeUndefined();

    // Verify SQL commands were executed in order:
    // 1. Check receipts
    // 2. Lock handle
    // 3. Insert School
    // 4. Insert Bond (capacity 'principal')
    // 5. Savepoint, Insert Group & Member, Release savepoint
    // 6. Audit & Receipt
    const sqlStatements = calls.map((c) => c.sql);
    expect(sqlStatements.some((s) => s.includes('INSERT INTO public.schools'))).toBe(true);
    expect(
      sqlStatements.some(
        (s) => s.includes('INSERT INTO public.bonds') && s.includes("'principal'"),
      ),
    ).toBe(true);
    expect(sqlStatements.some((s) => s.includes('INSERT INTO public.community_groups'))).toBe(true);
  });

  it('provisionInstitution replays previous result on idempotent retry', async () => {
    const cachedResult = {
      schoolId: '01928374-abcd-8000-8000-000000000100',
      groupId: '01928374-abcd-8000-8000-000000000101',
    };

    const { client, calls } = mockClient({
      query: async (sql) => {
        if (sql.includes('SELECT result FROM public.operation_receipts')) {
          return { rows: [{ result: cachedResult }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      },
    });

    const input = {
      name: 'St. Peter College',
      handle: 'st-peter-college',
      type: 'k12' as const,
      idempotencyKey: '01928374-abcd-8000-8000-000000000099',
    };

    const result = await provisionInstitution(client, accountId, input);
    expect(result).toEqual(cachedResult);
    expect(calls).toHaveLength(1);
  });

  it('provisionInstitution rejects with conflict when handle is already claimed', async () => {
    const { client } = mockClient({
      query: async (sql) => {
        if (sql.includes('SELECT result FROM public.operation_receipts')) {
          return { rows: [], rowCount: 0 };
        }
        if (sql.includes('SELECT id FROM public.schools WHERE handle')) {
          return { rows: [{ id: 'existing-id' }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      },
    });

    const input = {
      name: 'Duplicate College',
      handle: 'duplicate-handle',
      type: 'k12' as const,
      idempotencyKey: '01928374-abcd-8000-8000-000000000099',
    };

    await expect(provisionInstitution(client, accountId, input)).rejects.toThrow(
      'Handle "duplicate-handle" is already claimed',
    );
  });

  it('provisionInstitution marks groupFailed when group insertion throws', async () => {
    const { client } = mockClient({
      query: async (sql) => {
        if (sql.includes('SELECT result FROM public.operation_receipts')) {
          return { rows: [], rowCount: 0 };
        }
        if (sql.includes('SELECT id FROM public.schools WHERE handle')) {
          return { rows: [], rowCount: 0 };
        }
        if (sql.includes('INSERT INTO public.community_groups')) {
          throw new Error('Community groups table locked');
        }
        return { rows: [], rowCount: 1 };
      },
    });

    const input = {
      name: 'St. Peter College',
      handle: 'st-peter-college',
      type: 'k12' as const,
      idempotencyKey: '01928374-abcd-8000-8000-000000000099',
    };

    const result = await provisionInstitution(client, accountId, input);
    expect(result.schoolId).toBeTruthy();
    expect(result.groupId).toBeUndefined();
    expect(result.groupFailed).toBe(true);
  });

  describe('updateInstitution', () => {
    const schoolId = '01928374-abcd-8000-8000-000000000055';

    it('rejects update with FORBIDDEN when user lacks principal bond', async () => {
      const { client } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [], rowCount: 0 };
          }
          return { rows: [], rowCount: 0 };
        },
      });

      await expect(
        updateInstitution(client, accountId, {
          schoolId,
          name: 'New School Name',
        }),
      ).rejects.toThrow('You do not have principal authority');
    });

    it('rejects handle update with CONFLICT when handle belongs to another school', async () => {
      const { client } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          if (sql.includes('SELECT 1 FROM public.schools WHERE handle = $1 AND id <> $2')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          return { rows: [], rowCount: 0 };
        },
      });

      await expect(
        updateInstitution(client, accountId, {
          schoolId,
          handle: 'taken-slug',
        }),
      ).rejects.toThrow('Handle "taken-slug" is already claimed');
    });

    it('updates institution fields successfully when authorized', async () => {
      const { client, calls } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          if (sql.includes('SELECT 1 FROM public.schools WHERE handle = $1 AND id <> $2')) {
            return { rows: [], rowCount: 0 };
          }
          return { rows: [], rowCount: 1 };
        },
      });

      const res = await updateInstitution(client, accountId, {
        schoolId,
        name: 'St. Peter Collegiate Academy',
        handle: 'st-peter-collegiate',
        type: 'collegiate',
        timezone: 'Asia/Colombo',
        guardianVerificationPolicy: 'strict',
      });

      expect(res).toEqual({ success: true, schoolId });
      const updateCall = calls.find((c) => c.sql.includes('UPDATE public.schools'));
      expect(updateCall).toBeDefined();
      expect(updateCall?.params).toContain('St. Peter Collegiate Academy');
      expect(updateCall?.params).toContain('st-peter-collegiate');
      expect(updateCall?.params).toContain('collegiate');
      expect(updateCall?.params).toContain('strict');
    });
  });

  describe('invite codes lifecycle', () => {
    const schoolId = '01928374-abcd-8000-8000-000000000055';

    it('createInviteCode generates formatted role code and saves to database', async () => {
      const { client, calls } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          return { rows: [], rowCount: 1 };
        },
      });

      const res = await createInviteCode(client, accountId, {
        schoolId,
        role: 'teacher',
        maxUses: 10,
        invitationText: 'Join the mathematics faculty',
      });

      expect(res.inviteCode.schoolId).toBe(schoolId);
      expect(res.inviteCode.role).toBe('teacher');
      expect(res.inviteCode.code).toMatch(/^GURU-[A-Z0-9]{6}-TEACH$/);
      expect(res.inviteCode.maxUses).toBe(10);
      expect(res.inviteCode.isActive).toBe(true);

      const insertCall = calls.find((c) => c.sql.includes('INSERT INTO public.invite_codes'));
      expect(insertCall).toBeDefined();
    });

    it('listInviteCodes returns active and formatted codes for school', async () => {
      const now = new Date();
      const { client } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          if (sql.includes('SELECT id, school_id, code, role')) {
            return {
              rows: [
                {
                  id: '01928374-abcd-8000-8000-000000000101',
                  school_id: schoolId,
                  code: 'GURU-ABC123-TEACH',
                  role: 'teacher',
                  max_uses: 20,
                  uses_count: 5,
                  invitation_text: 'Faculty Invite',
                  is_active: true,
                  created_at: now,
                },
              ],
              rowCount: 1,
            };
          }
          return { rows: [], rowCount: 0 };
        },
      });

      const res = await listInviteCodes(client, accountId, { schoolId });
      expect(res.inviteCodes.length).toBe(1);
      expect(res.inviteCodes[0]?.code).toBe('GURU-ABC123-TEACH');
      expect(res.inviteCodes[0]?.usesCount).toBe(5);
    });

    it('revokeInviteCode deactivates the target code', async () => {
      const codeId = '01928374-abcd-8000-8000-000000000101';
      const { client, calls } = mockClient({
        query: async (sql) => {
          if (sql.includes('SELECT 1 FROM public.bonds')) {
            return { rows: [{ 1: 1 }], rowCount: 1 };
          }
          return { rows: [], rowCount: 1 };
        },
      });

      const res = await revokeInviteCode(client, accountId, { schoolId, codeId });
      expect(res).toEqual({ success: true });

      const revokeCall = calls.find((c) => c.sql.includes('UPDATE public.invite_codes SET is_active = false'));
      expect(revokeCall).toBeDefined();
      expect(revokeCall?.params).toContain(codeId);
      expect(revokeCall?.params).toContain(schoolId);
    });
  });
});
