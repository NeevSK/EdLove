import { appContract } from '@repo/core/api/v1/contract';
import { beforeEach, describe, expect, it } from 'vitest';
import { C1, C2, C3, client, code, NOPE, O, P, row, S1, seed } from './_db';
const revoke = (who: string, codeId: string) => client(who).ops.institutions.revokeInviteCode({ schoolId: S1, codeId });
describe('T3 revokeInviteCode', () => {
  beforeEach(seed);
  it('revokes an active code', async () => {
    expect(await revoke(P, C1)).toEqual({ success: true });
    expect((await row(C1)).is_active).toBe(false);
  });
  it('CONFLICT when already inactive', async () => expect(await code(revoke(P, C2))).toBe('CONFLICT'));
  it('CONFLICT on a second revoke', async () => {
    await revoke(P, C1);
    expect(await code(revoke(P, C1))).toBe('CONFLICT');
  });
  it('NOT_FOUND for unknown code', async () => expect(await code(revoke(P, NOPE))).toBe('NOT_FOUND'));
  it('NOT_FOUND for another school\'s code, which stays active', async () => {
    expect(await code(revoke(P, C3))).toBe('NOT_FOUND');
    expect((await row(C3)).is_active).toBe(true);
  });
  it('FORBIDDEN without authority', async () => {
    expect(await code(revoke(O, C1))).toBe('FORBIDDEN');
    expect((await row(C1)).is_active).toBe(true);
  });
  it('the contract declares NOT_FOUND and CONFLICT', () => {
    // biome-ignore lint/suspicious/noExplicitAny: reading contract internals
    const errors = Object.keys((appContract.ops.institutions.revokeInviteCode as any)['~orpc'].errorMap);
    expect(errors).toEqual(expect.arrayContaining(['NOT_FOUND', 'CONFLICT']));
  });
});
