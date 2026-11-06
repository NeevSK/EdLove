import { generateKeyPairSync } from 'node:crypto';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature';
import { cedarPolicyVersion } from '@repo/policies';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool, type PoolClient } from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSecurity } from '../security';

const issuer = 'https://identity.example/auth/v1';
const accountId = '01234567-89ab-8101-8000-010203040506';
const subject = '123e4567-e89b-4123-8123-426614174000';
const sessionId = '123e4567-e89b-4123-8123-426614174001';
const bondId = '123e4567-e89b-4123-8123-426614174002';

const signing = generateKeyPairSync('ed25519');
const signingKey = signing.privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
const publicKeyBase64 = Buffer.from(
  signing.publicKey.export({ format: 'jwk' }).x ?? '',
  'base64url',
).toString('base64');

type Row = Record<string, unknown>;
async function setup(
  options: { bond?: Row | null; versionWriteFails?: boolean; key?: string } = {},
) {
  const bond =
    options.bond === undefined
      ? {
          id: bondId,
          entity_id: 'school-1',
          entity_type: 'SCHOOL',
          capacity: 'teacher',
          citizenship: 'FIRST_CLASS',
        }
      : options.bond;
  const respond = async (sql: string, params?: unknown[]) => {
    if (sql.includes('FROM public.bonds bond')) return { rows: bond ? [bond] : [] };
    if (sql.includes('INSERT INTO public.policy_version')) {
      if (options.versionWriteFails) throw new Error('write failed');
      writes.push(`version:${String(params?.[0])}`);
      return { rows: [] };
    }
    if (sql.includes('INSERT INTO public.permission_snapshots')) {
      inserts.push(params ?? []);
      writes.push('snapshot');
      return { rows: [] };
    }
    if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) {
      statements.push(sql);
      return { rows: [] };
    }
    return { rows: [{ account_id: accountId }] };
  };
  const inserts: unknown[][] = [];
  const writes: string[] = [];
  const statements: string[] = [];
  const client = { query: vi.fn(respond), release: vi.fn() };
  const pool = new Pool();
  Object.defineProperty(pool, 'query', { value: vi.fn(respond), configurable: true });
  const connect = vi.fn(async () => client as unknown as PoolClient);
  Object.defineProperty(pool, 'connect', { value: connect, configurable: true });
  const keys = await generateKeyPair('ES256');
  const jwk = await exportJWK(keys.publicKey);
  const security = createSecurity({
    pool,
    issuer,
    audience: 'authenticated',
    jwksUrl: `${issuer}/.well-known/jwks.json`,
    algorithms: ['ES256'],
    jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'ES256' }] }),
    ...(options.key === '' ? {} : { snapshotSigningKey: options.key ?? signingKey }),
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
  return { security, identity, signal, inserts, statements, writes, connect, pool };
}

// The row as PowerSync delivers it to the device: JSON columns arrive as text.
function syncedRow(params: unknown[]) {
  const [, userId, activeBondId, activeEntityId, activeEntityType, schoolId] = params;
  const [policyVersion, generatedAt, expiresAt, permissions, temporalHints, signature] =
    params.slice(6);
  return {
    userId: String(userId),
    activeBondId: String(activeBondId),
    activeEntityId: String(activeEntityId),
    activeEntityType: String(activeEntityType),
    schoolId: schoolId === null ? null : String(schoolId),
    policyVersion: String(policyVersion),
    generatedAt: String(generatedAt),
    expiresAt: String(expiresAt),
    permissions: String(permissions),
    temporalHints: String(temporalHints),
    signature: String(signature),
  };
}

describe('offline permission snapshot issuance', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('stores one signed snapshot per account and bond that the client verifier accepts', async () => {
    vi.stubEnv('EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY', publicKeyBase64);
    const { security, identity, signal, inserts, statements, writes, pool } = await setup();
    try {
      const issued = await security.issueSnapshot(identity, bondId, signal);
      expect(issued.policyVersion).toBe(cedarPolicyVersion());
      expect(issued.policyVersion).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(writes).toEqual([`version:${cedarPolicyVersion()}`, 'snapshot']);
      expect(Date.parse(issued.expiresAt) - Date.parse(issued.generatedAt)).toBe(
        24 * 60 * 60 * 1000,
      );
      expect(statements).toEqual(['BEGIN', 'COMMIT']);
      expect(inserts).toHaveLength(1);
      const params = inserts[0] ?? [];
      expect(params[0]).toBe(`${accountId}:${bondId}`);
      const row = syncedRow(params);
      expect(row).toMatchObject({
        userId: accountId,
        activeBondId: bondId,
        activeEntityId: 'school-1',
        activeEntityType: 'SCHOOL',
        schoolId: 'school-1',
      });
      await expect(verifySnapshotSignature(row)).resolves.toBe(true);
      const permissions = JSON.parse(row.permissions);
      permissions.Grade = { ...permissions.Grade, read: true, update: true };
      await expect(
        verifySnapshotSignature({ ...row, permissions: JSON.stringify(permissions) }),
      ).resolves.toBe(false);
    } finally {
      await pool.end();
    }
  });

  it('gives no snapshot to a bond that is no longer active', async () => {
    const { security, identity, signal, inserts, statements, pool } = await setup({ bond: null });
    try {
      await expect(security.issueSnapshot(identity, bondId, signal)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(inserts).toHaveLength(0);
      expect(statements).toEqual(['BEGIN', 'ROLLBACK']);
    } finally {
      await pool.end();
    }
  });

  it('fails closed when the enforced policy version cannot be recorded', async () => {
    const { security, identity, signal, inserts, statements, pool } = await setup({
      versionWriteFails: true,
    });
    try {
      await expect(security.issueSnapshot(identity, bondId, signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect(inserts).toHaveLength(0);
      expect(statements).toEqual(['BEGIN', 'ROLLBACK']);
    } finally {
      await pool.end();
    }
  });

  it('fails closed without a signing key, before touching the database', async () => {
    const { security, identity, signal, connect, pool } = await setup({ key: '' });
    try {
      await expect(security.issueSnapshot(identity, bondId, signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect(connect).not.toHaveBeenCalled();
    } finally {
      await pool.end();
    }
  });

  it('refuses to start with a signing key that is not Ed25519', async () => {
    const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 })
      .privateKey.export({ format: 'pem', type: 'pkcs8' })
      .toString();
    await expect(setup({ key: rsa })).rejects.toThrow('Invalid security configuration');
  });
});
