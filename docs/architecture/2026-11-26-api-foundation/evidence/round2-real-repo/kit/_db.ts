// Hidden evaluation helper: a real Postgres, the real router, no mocks.
import { createRouterClient, ORPCError } from '@orpc/server';
import pg from 'pg';
import { router } from '../core/router';

export const pool = new pg.Pool({ connectionString: process.env.EVAL_DB ?? 'postgres://postgres@127.0.0.1:55432/evalbase', max: 4 });
export const P = '0192a000-0000-8000-8000-0000000000a1'; // principal of S1
export const O = '0192a000-0000-8000-8000-0000000000a2'; // no bond
export const S1 = '11111111-1111-4111-8111-111111111111';
export const S2 = '22222222-2222-4222-8222-222222222222';
export const C1 = 'c1c1c1c1-0000-4000-8000-000000000001'; // S1, active, max 10, used 3
export const C2 = 'c2c2c2c2-0000-4000-8000-000000000002'; // S1, inactive
export const C3 = 'c3c3c3c3-0000-4000-8000-000000000003'; // S2, active
export const NOPE = '99999999-0000-4000-8000-000000000009';

export async function seed() {
  await pool.query(`
    DROP TABLE IF EXISTS public.invite_codes, public.bonds, public.schools CASCADE;
    CREATE TABLE public.schools (id uuid primary key, name text not null, handle text, type text, created_by uuid,
      tenant_kind text default 'customer', timezone text default 'Asia/Colombo', avatar_url text, custom_branding jsonb,
      guardian_verification_policy text default 'open', created_at timestamptz default now(), updated_at timestamptz, deleted_at timestamptz);
    CREATE TABLE public.bonds (id uuid primary key default gen_random_uuid(), user_id uuid not null, entity_id text not null,
      entity_type text not null, capacity text not null, citizenship text, status text not null, valid_from timestamptz default now());
    CREATE TABLE public.invite_codes (id uuid primary key, school_id uuid not null references public.schools(id), code text unique not null,
      role text not null, max_uses int, uses_count int default 0, invitation_text text, metadata jsonb, idempotency_key text,
      created_by uuid, created_at timestamptz default now(), is_active boolean default true, expires_at timestamptz);
    INSERT INTO public.schools (id, name, handle) VALUES ('${S1}', 'One', 'one'), ('${S2}', 'Two', 'two');
    INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, status) VALUES ('${P}', '${S1}', 'SCHOOL', 'principal', 'active');
    INSERT INTO public.invite_codes (id, school_id, code, role, max_uses, uses_count, invitation_text, is_active, created_at) VALUES
      ('${C1}', '${S1}', 'GURU-AAA111-TEACH', 'teacher', 10, 3, 'Welcome', true, '2026-11-01T10:00:00Z'),
      ('${C2}', '${S1}', 'GURU-BBB222-STUDY', 'student', null, 0, null, false, '2026-11-02T10:00:00Z'),
      ('${C3}', '${S2}', 'GURU-CCC333-GUARD', 'guardian', 5, 1, null, true, '2026-11-03T10:00:00Z');
  `);
}

export function client(accountId: string) {
  const platform = {
    withAccountData: async (_identity: unknown, _signal: unknown, work: (db: pg.PoolClient) => Promise<unknown>) => {
      const c = await pool.connect();
      try {
        await c.query('BEGIN');
        const r = await work(c);
        await c.query('COMMIT');
        return r;
      } catch (e) {
        await c.query('ROLLBACK');
        throw e;
      } finally {
        c.release();
      }
    },
  };
  const identity = { accountId, subject: 's', sessionId: 'x', expiresAt: Math.floor(Date.now() / 1000) + 3600 };
  // biome-ignore lint/suspicious/noExplicitAny: test double
  return createRouterClient(router, { context: { requestId: 'eval', identity, platform } as any }) as any;
}

export async function code(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'OK';
  } catch (e) {
    return e instanceof ORPCError ? e.code : `THROWN:${String(e).slice(0, 80)}`;
  }
}
export const row = async (id: string) => (await pool.query('SELECT * FROM public.invite_codes WHERE id = $1', [id])).rows[0];
