import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { client, code, O, P, pool, S1, seed } from './_db';
const create = (input: object) => client(P).ops.institutions.createInviteCode({ schoolId: S1, role: 'teacher', ...input });
describe('T4 expiresAt', () => {
  beforeEach(seed);
  it('stores and returns an expiry', async () => {
    const r = await create({ expiresAt: '2027-01-01T00:00:00+05:30' });
    expect(new Date(r.inviteCode.expiresAt).toISOString()).toBe('2026-12-31T18:30:00.000Z');
    const db = (await pool.query('SELECT expires_at FROM public.invite_codes WHERE id = $1', [r.inviteCode.id])).rows[0];
    expect(new Date(db.expires_at).toISOString()).toBe('2026-12-31T18:30:00.000Z');
  });
  it('omitted means null', async () => expect((await create({})).inviteCode.expiresAt).toBeNull());
  it('explicit null means null', async () => expect((await create({ expiresAt: null })).inviteCode.expiresAt).toBeNull());
  it('list returns expiresAt for every code', async () => {
    const made = await create({ expiresAt: '2027-03-01T00:00:00Z' });
    const { inviteCodes } = await client(P).ops.institutions.listInviteCodes({ schoolId: S1 });
    for (const c of inviteCodes) expect(c, c.id).toHaveProperty('expiresAt');
    const back = inviteCodes.find((c: { id: string }) => c.id === made.inviteCode.id);
    expect(new Date(back.expiresAt).toISOString()).toBe('2027-03-01T00:00:00.000Z');
    expect(inviteCodes.filter((c: { expiresAt: unknown }) => c.expiresAt === null).length).toBe(2);
  });
  it('rejects an invalid date-time', async () => expect(await code(create({ expiresAt: 'next tuesday' }))).toBe('BAD_REQUEST'));
  it('FORBIDDEN unchanged', async () => expect(await code(client(O).ops.institutions.createInviteCode({ schoolId: S1, role: 'teacher' }))).toBe('FORBIDDEN'));
  it('model declares expires_at', () => {
    const model = readFileSync(fileURLToPath(new URL('../../../../packages/schema/schema.zmodel', import.meta.url)), 'utf8');
    const block = model.slice(model.indexOf('model InviteCode {'), model.indexOf('}', model.indexOf('model InviteCode {')));
    expect(block).toMatch(/expires_at\s+DateTime\?/);
  });
});
