import { INITIAL_BOND_CAPACITIES, InitialBondInput } from '@repo/core/api/v1/contract';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool, type PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { createSecurity } from '../security';

const issuer = 'https://identity.example/auth/v1';
const accountId = '01234567-89ab-8101-8000-010203040506';
const subject = '123e4567-e89b-4123-8123-426614174000';
const sessionId = '123e4567-e89b-4123-8123-426614174001';
const bondId = '123e4567-e89b-4123-8123-426614174002';
const personalBond = {
  id: bondId,
  entity_id: accountId,
  entity_type: 'PERSONAL',
  capacity: 'teacher',
  citizenship: 'SECOND_CLASS',
};

async function setup(existing: boolean, failOn?: string) {
  const statements: { sql: string; params?: unknown[] }[] = [];
  const respond = async (sql: string, params?: unknown[]) => {
    statements.push({ sql, params });
    if (failOn && sql.includes(failOn)) throw new Error('database failure');
    if (sql.includes('SELECT id::text, entity_id::text'))
      return { rows: existing ? [personalBond] : [] };
    if (sql.includes('INSERT INTO public.bonds')) return { rows: [personalBond] };
    if (sql.includes('public.auth_identities')) return { rows: [{ account_id: accountId }] };
    return { rows: [] };
  };
  const client = { query: vi.fn(respond), release: vi.fn() };
  const pool = new Pool();
  Object.defineProperty(pool, 'query', { value: vi.fn(respond), configurable: true });
  Object.defineProperty(pool, 'connect', {
    value: vi.fn(async () => client as unknown as PoolClient),
    configurable: true,
  });
  const keys = await generateKeyPair('ES256');
  const jwk = await exportJWK(keys.publicKey);
  const security = createSecurity({
    pool,
    issuer,
    audience: 'authenticated',
    jwksUrl: `${issuer}/.well-known/jwks.json`,
    algorithms: ['ES256'],
    jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'ES256' }] }),
  });
  const token = await new SignJWT({
    session_id: sessionId,
    canonical_account_id: accountId,
    role: 'authenticated',
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'test' })
    .setIssuer(issuer)
    .setAudience('authenticated')
    .setSubject(subject)
    .setExpirationTime('1h')
    .sign(keys.privateKey);
  const signal = new AbortController().signal;
  const identity = await security.authenticate(`Bearer ${token}`, signal);
  statements.length = 0;
  const ran = (fragment: string) => statements.filter((s) => s.sql.includes(fragment));
  return { security, identity, signal, ran, pool, statements };
}

const input = { capacity: 'teacher', displayName: 'Nimali' } as const;

describe('identity.createInitialBond', () => {
  it('creates one second-class personal bond on the account, with its evidence', async () => {
    const { security, identity, signal, ran, pool } = await setup(false);
    try {
      await expect(security.createInitialBond(identity, input, signal)).resolves.toEqual({
        bondId,
        entityId: accountId,
        entityType: 'PERSONAL',
        capacity: 'teacher',
        citizenship: 'SECOND_CLASS',
        admission: 'available',
      });
      const insert = ran('INSERT INTO public.bonds')[0];
      expect(insert?.sql).toContain("'PERSONAL'");
      expect(insert?.sql).toContain("'SECOND_CLASS'");
      expect(insert?.params).toEqual([accountId, 'teacher']);
      expect(ran('FOR UPDATE').length).toBeGreaterThan(0);
      expect(ran('onboarding_completed = true')).toHaveLength(1);
      expect(ran('INSERT INTO public.api_command_audit')).toHaveLength(1);
      expect(ran('COMMIT')).toHaveLength(1);
    } finally {
      await pool.end();
    }
  });

  it('returns the existing bond on retry and writes nothing', async () => {
    const { security, identity, signal, ran, pool } = await setup(true);
    try {
      await expect(
        security.createInitialBond(identity, { ...input, capacity: 'student' }, signal),
      ).resolves.toMatchObject({ bondId, capacity: 'teacher' });
      expect(ran('INSERT INTO public.bonds')).toHaveLength(0);
      expect(ran('UPDATE public.users')).toHaveLength(0);
      expect(ran('INSERT INTO public.api_command_audit')).toHaveLength(0);
    } finally {
      await pool.end();
    }
  });

  it('rolls everything back when the evidence cannot be written', async () => {
    const { security, identity, signal, ran, pool } = await setup(
      false,
      'INSERT INTO public.api_command_audit',
    );
    try {
      await expect(security.createInitialBond(identity, input, signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect(ran('ROLLBACK')).toHaveLength(1);
      expect(ran('COMMIT')).toHaveLength(0);
    } finally {
      await pool.end();
    }
  });
});

describe('who may choose a first bond', () => {
  it('offers teacher, student and guardian only', () => {
    expect(INITIAL_BOND_CAPACITIES).toEqual(['teacher', 'student', 'guardian']);
    for (const capacity of INITIAL_BOND_CAPACITIES)
      expect(InitialBondInput.safeParse({ capacity, displayName: 'Nimali' }).success).toBe(true);
  });

  it.each([
    'principal',
    'assistantPrincipal',
    'founder',
    'coFounder',
    'director',
    'admin',
    'developer',
  ])('refuses %s at the contract', (capacity) => {
    expect(InitialBondInput.safeParse({ capacity, displayName: 'Nimali' }).success).toBe(false);
  });

  it('refuses extra fields such as a chosen entity or citizenship', () => {
    expect(InitialBondInput.safeParse({ ...input, citizenship: 'FIRST_CLASS' }).success).toBe(
      false,
    );
    expect(InitialBondInput.safeParse({ ...input, entityId: 'school-1' }).success).toBe(false);
  });

  it('refuses an empty name', () => {
    expect(InitialBondInput.safeParse({ ...input, displayName: '   ' }).success).toBe(false);
  });
});
