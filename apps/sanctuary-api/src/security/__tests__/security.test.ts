import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { createSecurity } from '../security';

const issuer = 'https://identity.example/auth/v1';
const accountId = '01234567-89ab-8101-8000-010203040506';
const subject = '123e4567-e89b-4123-8123-426614174000';
const sessionId = '123e4567-e89b-4123-8123-426614174001';

describe('security credential boundary', () => {
  it('authorizes GradeMark grade and publish through Cedar and rejects wrong ownership or resource', async () => {
    const keys = await generateKeyPair('ES256');
    const jwk = await exportJWK(keys.publicKey);
    const pool = new Pool();
    const query = vi.fn().mockImplementation(async (sql: string) => ({
      rows: sql.includes('FROM public.bonds bond')
        ? [
            {
              id: sessionId,
              entity_id: subject,
              entity_type: 'SCHOOL',
              capacity: 'teacher',
              citizenship: 'FIRST_CLASS',
            },
          ]
        : [{ account_id: accountId }],
    }));
    Object.defineProperty(pool, 'query', { value: query, configurable: true });
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
    try {
      const signal = new AbortController().signal;
      const identity = await security.authenticate(`Bearer ${token}`, signal);
      const scope = await security.resolveScope(identity, sessionId, signal);
      for (const action of ['grade', 'publish'] as const) {
        const capability = {
          action,
          resourceType: 'GradeMark' as const,
          resolveResource: async () => ({
            id: 'mark-1',
            attributes: { school_id: subject, teacher_id: accountId },
          }),
        };
        await expect(security.authorize(scope, capability, signal)).resolves.toBeUndefined();
        await expect(
          security.authorize(
            scope,
            {
              ...capability,
              resolveResource: async () => ({
                id: 'mark-1',
                attributes: { school_id: subject, teacher_id: 'other' },
              }),
            },
            signal,
          ),
        ).rejects.toMatchObject({ code: 'FORBIDDEN' });
        await expect(
          security.authorize(scope, { ...capability, resourceType: 'Classroom' }, signal),
        ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      }
    } finally {
      await pool.end();
    }
  });
  it('checks JWKS readiness without fetching again while the cache is fresh', async () => {
    const pool = new Pool();
    const keys = await generateKeyPair('ES256');
    const jwk = await exportJWK(keys.publicKey);
    const fetchKeys = vi.fn(async () => Response.json({ keys: [jwk] }));
    const options = {
      pool,
      issuer,
      audience: 'authenticated',
      jwksUrl: `${issuer}/.well-known/jwks.json`,
      algorithms: ['ES256'] as const,
    };
    try {
      const security = createSecurity({ ...options, jwksFetch: fetchKeys });
      const signal = new AbortController().signal;
      await security.checkReadiness(signal);
      await security.checkReadiness(signal);
      expect(fetchKeys).toHaveBeenCalledTimes(1);
      const unavailable = createSecurity({
        ...options,
        jwksFetch: async () => {
          throw new Error('network unavailable');
        },
      });
      await expect(unavailable.checkReadiness(signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      const malformed = createSecurity({
        ...options,
        jwksFetch: async () => Response.json({ keys: 'invalid' }),
      });
      await expect(malformed.checkReadiness(signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      const aborted = new AbortController();
      aborted.abort();
      await expect(security.checkReadiness(aborted.signal)).rejects.toMatchObject({
        name: 'AbortError',
      });
    } finally {
      await pool.end();
    }
  });

  it('verifies real signatures and rejects invalid claims before querying authority', async () => {
    const keys = await generateKeyPair('ES256');
    const jwk = await exportJWK(keys.publicKey);
    const pool = new Pool({
      connectionString: 'postgres://127.0.0.1:1/test',
      connectionTimeoutMillis: 100,
    });
    const security = createSecurity({
      pool,
      issuer,
      audience: 'authenticated',
      jwksUrl: `${issuer}/.well-known/jwks.json`,
      algorithms: ['ES256'],
      jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'test', alg: 'ES256' }] }),
    });
    const sign = (audience: string, expires: string) =>
      new SignJWT({ session_id: sessionId, canonical_account_id: accountId, role: 'authenticated' })
        .setProtectedHeader({ alg: 'ES256', kid: 'test' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject(subject)
        .setExpirationTime(expires)
        .sign(keys.privateKey);
    try {
      await expect(
        security.authenticate(`Bearer ${await sign('other', '1h')}`, new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(
        security.authenticate(
          `Bearer ${await sign('authenticated', '-1s')}`,
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(
        security.authenticate(
          `Bearer ${await sign('authenticated', '1h')}`,
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
      await expect(
        security.authenticate('not bearer', new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      const wrongIssuer = await new SignJWT({
        session_id: sessionId,
        canonical_account_id: accountId,
        role: 'authenticated',
      })
        .setProtectedHeader({ alg: 'ES256', kid: 'test' })
        .setIssuer('https://other.example')
        .setAudience('authenticated')
        .setSubject(subject)
        .setExpirationTime('1h')
        .sign(keys.privateKey);
      await expect(
        security.authenticate(`Bearer ${wrongIssuer}`, new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      const wrongAccount = await new SignJWT({
        session_id: sessionId,
        canonical_account_id: subject,
        role: 'authenticated',
      })
        .setProtectedHeader({ alg: 'ES256', kid: 'test' })
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setSubject(subject)
        .setExpirationTime('1h')
        .sign(keys.privateKey);
      await expect(
        security.authenticate(`Bearer ${wrongAccount}`, new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      const unknownKey = await new SignJWT({
        session_id: sessionId,
        canonical_account_id: accountId,
        role: 'authenticated',
      })
        .setProtectedHeader({ alg: 'ES256', kid: 'unknown' })
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setSubject(subject)
        .setExpirationTime('1h')
        .sign(keys.privateKey);
      await expect(
        security.authenticate(`Bearer ${unknownKey}`, new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      const wrongAlgorithm = await new SignJWT({
        session_id: sessionId,
        canonical_account_id: accountId,
        role: 'authenticated',
      })
        .setProtectedHeader({ alg: 'HS256', kid: 'test' })
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setSubject(subject)
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode('a synthetic test key that is long enough'));
      await expect(
        security.authenticate(`Bearer ${wrongAlgorithm}`, new AbortController().signal),
      ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    } finally {
      await pool.end();
    }
  });

  it('does not accept fabricated identity or unsafe verifier configuration', async () => {
    const pool = new Pool();
    try {
      expect(() =>
        createSecurity({
          pool,
          issuer,
          audience: 'authenticated',
          jwksUrl: 'http://identity.example/keys',
          algorithms: ['ES256'],
        }),
      ).toThrow('Invalid security configuration');
      const security = createSecurity({
        pool,
        issuer,
        audience: 'authenticated',
        jwksUrl: `${issuer}/.well-known/jwks.json`,
        algorithms: ['ES256'],
      });
      await expect(
        security.resolveScope(
          { accountId, subject, sessionId, expiresAt: Date.now() / 1000 + 60 },
          sessionId,
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.end();
    }
  });

  it('rechecks live identity and scope on authorization and denies missing binding', async () => {
    const keys = await generateKeyPair('ES256');
    const jwk = await exportJWK(keys.publicKey);
    const pool = new Pool();
    const query = vi.fn();
    Object.defineProperty(pool, 'query', { value: query, configurable: true });
    const result = (rows: object[]) => ({
      rows,
      command: 'SELECT',
      rowCount: rows.length,
      oid: 0,
      fields: [],
    });
    query.mockResolvedValueOnce(result([{ account_id: accountId }]));
    query.mockResolvedValueOnce(
      result([
        {
          id: sessionId,
          entity_id: subject,
          entity_type: 'SCHOOL',
          capacity: 'principal',
          citizenship: 'FIRST_CLASS',
        },
      ]),
    );
    query.mockResolvedValueOnce(result([]));
    query.mockResolvedValueOnce(
      result([
        {
          id: sessionId,
          entity_id: subject,
          entity_type: 'PERSONAL',
          capacity: 'principal',
          citizenship: 'SECOND_CLASS',
        },
      ]),
    );
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
    try {
      const signal = new AbortController().signal;
      const identity = await security.authenticate(`Bearer ${token}`, signal);
      const scope = await security.resolveScope(identity, sessionId, signal);
      const resolver = vi.fn(async () => ({ id: subject, attributes: {} }));
      await expect(
        security.authorize(
          scope,
          { action: 'read', resourceType: 'School', resolveResource: resolver },
          signal,
        ),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(resolver).not.toHaveBeenCalled();
      await expect(security.resolveScope(identity, sessionId, signal)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      expect(query).toHaveBeenCalledTimes(4);
    } finally {
      await pool.end();
    }
  });
});
