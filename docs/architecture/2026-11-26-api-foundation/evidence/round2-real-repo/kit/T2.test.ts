import { beforeEach, describe, expect, it } from 'vitest';
import { capabilities } from '../modules/catalog';
import { C1, C3, client, code, NOPE, O, P, row, S1, seed } from './_db';
const set = (who: string, input: object) => client(who).ops.institutions.setInviteCodeLimit(input);
describe('T2 setInviteCodeLimit', () => {
  beforeEach(seed);
  it('sets a new limit', async () => {
    const r = await set(P, { schoolId: S1, codeId: C1, maxUses: 20 });
    expect(r.inviteCode).toMatchObject({ id: C1, maxUses: 20, usesCount: 3 });
    expect((await row(C1)).max_uses).toBe(20);
  });
  it('null makes it unlimited', async () => {
    const r = await set(P, { schoolId: S1, codeId: C1, maxUses: null });
    expect(r.inviteCode.maxUses).toBeNull();
    expect((await row(C1)).max_uses).toBeNull();
  });
  it('a limit equal to uses is allowed', async () => expect((await set(P, { schoolId: S1, codeId: C1, maxUses: 3 })).inviteCode.maxUses).toBe(3));
  it('CONFLICT below current uses, nothing changes', async () => {
    expect(await code(set(P, { schoolId: S1, codeId: C1, maxUses: 2 }))).toBe('CONFLICT');
    expect((await row(C1)).max_uses).toBe(10);
  });
  it('FORBIDDEN without authority, nothing changes', async () => {
    expect(await code(set(O, { schoolId: S1, codeId: C1, maxUses: 50 }))).toBe('FORBIDDEN');
    expect((await row(C1)).max_uses).toBe(10);
  });
  it('NOT_FOUND unknown or other school', async () => {
    expect(await code(set(P, { schoolId: S1, codeId: NOPE, maxUses: 5 }))).toBe('NOT_FOUND');
    expect(await code(set(P, { schoolId: S1, codeId: C3, maxUses: 5 }))).toBe('NOT_FOUND');
    expect((await row(C3)).max_uses).toBe(5);
  });
  it('rejects 0, negative, fractional and unknown fields', async () => {
    for (const bad of [{ maxUses: 0 }, { maxUses: -1 }, { maxUses: 1.5 }, { maxUses: 5, extra: true }])
      expect(await code(set(P, { schoolId: S1, codeId: C1, ...bad })), JSON.stringify(bad)).toBe('BAD_REQUEST');
  });
  it('is a command in the catalog', () => expect(capabilities.find((c) => c.name === 'ops.institutions.setInviteCodeLimit')).toMatchObject({ kind: 'command', module: 'ops.institutions', channels: ['app'], status: 'admitted' }));
});
