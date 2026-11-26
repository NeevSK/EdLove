import { beforeEach, describe, expect, it } from 'vitest';
import { capabilities } from '../modules/catalog';
import { C1, C2, C3, client, code, NOPE, O, P, S1, seed } from './_db';
describe('T1 getInviteCode', () => {
  beforeEach(seed);
  it('returns an active code with its fields', async () => {
    const r = await client(P).ops.institutions.getInviteCode({ schoolId: S1, codeId: C1 });
    expect(r.inviteCode).toMatchObject({ id: C1, schoolId: S1, code: 'GURU-AAA111-TEACH', role: 'teacher', maxUses: 10, usesCount: 3, invitationText: 'Welcome', isActive: true });
    expect(typeof r.inviteCode.createdAt).toBe('string');
  });
  it('returns an inactive code', async () => {
    const r = await client(P).ops.institutions.getInviteCode({ schoolId: S1, codeId: C2 });
    expect(r.inviteCode).toMatchObject({ id: C2, isActive: false, maxUses: null, invitationText: null });
  });
  it('FORBIDDEN for an account without authority', async () => expect(await code(client(O).ops.institutions.getInviteCode({ schoolId: S1, codeId: C1 }))).toBe('FORBIDDEN'));
  it('NOT_FOUND for an unknown code', async () => expect(await code(client(P).ops.institutions.getInviteCode({ schoolId: S1, codeId: NOPE }))).toBe('NOT_FOUND'));
  it('NOT_FOUND for another school\'s code', async () => expect(await code(client(P).ops.institutions.getInviteCode({ schoolId: S1, codeId: C3 }))).toBe('NOT_FOUND'));
  it('rejects unknown input fields', async () => expect(await code(client(P).ops.institutions.getInviteCode({ schoolId: S1, codeId: C1, extra: 1 }))).toBe('BAD_REQUEST'));
  it('is a query in the catalog', () => expect(capabilities.find((c) => c.name === 'ops.institutions.getInviteCode')).toMatchObject({ kind: 'query', module: 'ops.institutions', channels: ['app'], status: 'admitted' }));
});
