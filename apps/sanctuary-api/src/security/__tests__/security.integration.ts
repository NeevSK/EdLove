import { createModularPolicySet, loadModularPolicySet } from '@repo/policies';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { createSecurity } from '../security';

const account = '01234567-89ab-8101-8000-010203040506';
const subject = '123e4567-e89b-4123-8123-426614174000';
const session = '123e4567-e89b-4123-8123-426614174001';
const bond = '123e4567-e89b-4123-8123-426614174002';
const school = '123e4567-e89b-4123-8123-426614174003';
const issuer = 'https://identity.example/auth/v1';

describe('isolated PostgreSQL credential and scope authority', () => {
  it('verifies binding, live session, active scope, and Cedar isolation', async () => {
    const url = process.env.API_TEST_DATABASE_URL;
    if (process.env.API_DATABASE_TEST_ACK !== 'isolated-foundation' || !url) {
      throw new Error('Isolated foundation database acknowledgement and URL are required');
    }
    if (!new URL(url).pathname.slice(1).startsWith('pjc_api_foundation_')) {
      throw new Error('Refusing a database outside the isolated foundation prefix');
    }
    const pool = new Pool({ connectionString: url, max: 1 });
    const client = await pool.connect();
    try {
      const database = await client.query<{ name: string }>('SELECT current_database() AS name');
      if (!database.rows[0]?.name.startsWith('pjc_api_foundation_')) {
        throw new Error('Connected database is not an isolated foundation database');
      }
      await client.query('BEGIN');
      // Authentication shares the connection and sees the transaction's authority changes.
      Object.defineProperty(pool, 'query', {
        value: client.query.bind(client),
        configurable: true,
      });
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [account]);
      await client.query('INSERT INTO auth.users (id) VALUES ($1)', [subject]);
      await client.query('INSERT INTO auth.sessions (id, user_id) VALUES ($1, $2)', [
        session,
        subject,
      ]);
      await client.query(
        "INSERT INTO public.auth_identities (user_id, provider, provider_user_id) VALUES ($1, 'supabase', $2)",
        [account, subject],
      );
      await client.query(
        "INSERT INTO public.bonds (id, user_id, entity_id, entity_type, capacity, status, valid_from) VALUES ($1, $2, $3, 'SCHOOL', 'principal', 'active', now())",
        [bond, account, school],
      );
      // Commit only in the disposable, prefix-checked database so a second connection can observe lock contention.
      await client.query('COMMIT');
      await client.query('BEGIN');

      const keys = await generateKeyPair('ES256');
      const jwk = await exportJWK(keys.publicKey);
      const token = await new SignJWT({
        session_id: session,
        canonical_account_id: account,
        role: 'authenticated',
      })
        .setProtectedHeader({ alg: 'ES256', kid: 'fixture' })
        .setIssuer(issuer)
        .setAudience('authenticated')
        .setSubject(subject)
        .setExpirationTime('1h')
        .sign(keys.privateKey);
      const security = createSecurity({
        pool,
        issuer,
        audience: 'authenticated',
        jwksUrl: `${issuer}/.well-known/jwks.json`,
        algorithms: ['ES256'],
        jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'fixture', alg: 'ES256' }] }),
      });
      const signal = new AbortController().signal;
      const listPool = new Pool({ connectionString: url, max: 1 });
      try {
        await listPool.query(
          "INSERT INTO public.bonds (id,user_id,entity_id,entity_type,capacity,status,valid_from) VALUES ('123e4567-e89b-4123-8123-426614174010',$1,'institution-x','INSTITUTION','member','active',now()), ('123e4567-e89b-4123-8123-426614174011',$1,'personal-x','PERSONAL','principal','active',now()), ('123e4567-e89b-4123-8123-426614174012',$1,'future-x','SCHOOL','teacher','active',now() + interval '1 day')",
          [account],
        );
        await listPool.query(
          "INSERT INTO public.users (id) VALUES ('01234567-89ab-8101-8000-010203040507')",
        );
        await listPool.query(
          "INSERT INTO public.bonds (id,user_id,entity_id,entity_type,capacity,status,valid_from) VALUES ('123e4567-e89b-4123-8123-426614174013','01234567-89ab-8101-8000-010203040507','other-x','SCHOOL','teacher','active',now())",
        );
        const listSecurity = createSecurity({
          pool: listPool,
          issuer,
          audience: 'authenticated',
          jwksUrl: `${issuer}/.well-known/jwks.json`,
          algorithms: ['ES256'],
          jwksFetch: async () =>
            Response.json({ keys: [{ ...jwk, kid: 'fixture', alg: 'ES256' }] }),
        });
        const listIdentity = await listSecurity.authenticate(`Bearer ${token}`, signal);
        expect(await listSecurity.listScopes(listIdentity, signal)).toEqual([
          {
            bondId: bond,
            entityId: school,
            entityType: 'SCHOOL',
            capacity: 'principal',
            citizenship: 'FIRST_CLASS',
            admission: 'available',
          },
          {
            bondId: '123e4567-e89b-4123-8123-426614174010',
            entityId: 'institution-x',
            entityType: 'INSTITUTION',
            capacity: 'member',
            citizenship: 'FIRST_CLASS',
            admission: 'unsupported',
          },
          {
            bondId: '123e4567-e89b-4123-8123-426614174011',
            entityId: 'personal-x',
            entityType: 'PERSONAL',
            capacity: 'principal',
            citizenship: 'FIRST_CLASS',
            admission: 'denied',
          },
        ]);
        await listPool.query(
          "UPDATE auth.sessions SET not_after = now() - interval '1 second' WHERE id = $1",
          [session],
        );
        await expect(listSecurity.listScopes(listIdentity, signal)).rejects.toMatchObject({
          code: 'UNAUTHORIZED',
        });
        await listPool.query('UPDATE auth.sessions SET not_after = NULL WHERE id = $1', [session]);
      } finally {
        await listPool.end();
      }
      const authenticate = () => security.authenticate(`Bearer ${token}`, signal);
      const identity = await authenticate();
      const waitingPool = new Pool({ connectionString: url, max: 1 });
      const holder = await waitingPool.connect();
      try {
        await holder.query(
          `update public.bonds set valid_until=clock_timestamp()+interval '400 milliseconds' where id=$1`,
          [bond],
        );
        await holder.query('begin');
        await holder.query('select id from public.bonds where id=$1 for update', [bond]);
        const waiting = security.resolveScope(identity, bond, signal, client).then(
          () => 'allowed',
          (error: unknown) =>
            error instanceof Error && 'code' in error ? error.code : 'unexpected',
        );
        await holder.query('select pg_sleep(0.5)');
        await holder.query('commit');
        expect(await waiting).toBe('FORBIDDEN');
        await client.query('update public.bonds set valid_until=null where id=$1', [bond]);
      } finally {
        await holder.query('rollback');
        holder.release();
        await waitingPool.end();
      }
      // PostgreSQL transaction time is frozen; actual wall time advances.
      const clock = await client.query<{ advanced: boolean }>(
        `select clock_timestamp() > transaction_timestamp() as advanced`,
      );
      expect(clock.rows[0]?.advanced).toBe(true);
      await client.query(
        `update auth.sessions set not_after=clock_timestamp()+interval '200 milliseconds' where id=$1`,
        [session],
      );
      await client.query('select pg_sleep(0.25)');
      await expect(security.assertIdentity(identity, signal, client)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await client.query('update auth.sessions set not_after=null where id=$1', [session]);
      await client.query(
        `update public.bonds set valid_until=clock_timestamp()+interval '200 milliseconds' where id=$1`,
        [bond],
      );
      await client.query('select pg_sleep(0.25)');
      await expect(security.resolveScope(identity, bond, signal, client)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await client.query('update public.bonds set valid_until=null where id=$1', [bond]);
      await security.assertIdentity(identity, signal, client);
      await expect(security.assertIdentity({ ...identity }, signal, client)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      const competingPool = new Pool({ connectionString: url, max: 1 });
      const competingClient = await competingPool.connect();
      try {
        await competingClient.query('BEGIN');
        await competingClient.query("SET LOCAL lock_timeout = '150ms'");
        await expect(
          competingClient.query('DELETE FROM auth.sessions WHERE id = $1', [session]),
        ).rejects.toMatchObject({ code: '55P03' });
      } finally {
        await competingClient.query('ROLLBACK');
        competingClient.release();
        await competingPool.end();
      }
      const scope = await security.resolveScope(identity, bond, signal, client);
      const modularPolicies = createModularPolicySet({
        schemas: [
          loadModularPolicySet().schema.replace(
            'namespace Learning {}',
            `namespace Learning {
          entity Assignment { schoolId: String };
          action "submit" appliesTo { principal: [Platform::Account], resource: [Assignment], context: { bond: Platform::Bond } };
        }`,
          ),
        ],
        policies: [
          `permit(principal, action == Learning::Action::"submit", resource)
          when { resource.schoolId == context.bond.entityId };`,
        ],
      });
      const modular = createSecurity({
        pool,
        issuer,
        audience: 'authenticated',
        jwksUrl: `${issuer}/.well-known/jwks.json`,
        algorithms: ['ES256'],
        capabilityPolicies: modularPolicies,
        jwksFetch: async () => Response.json({ keys: [{ ...jwk, kid: 'fixture', alg: 'ES256' }] }),
      });
      const modularIdentity = await modular.authenticate(`Bearer ${token}`, signal);
      const modularScope = await modular.resolveScope(modularIdentity, bond, signal, client);
      const resource = async () => ({
        id: 'assignment-1',
        type: 'Assignment',
        attributes: { schoolId: school },
      });
      await expect(
        modular.authorizeCapability(
          modularScope,
          {
            name: 'Learning::submit',
            resourceType: 'Assignment',
            resolveResource: resource,
          },
          signal,
          client,
        ),
      ).resolves.toMatchObject({ permitted: true });
      await expect(
        modular.authorizeCapability(
          modularScope,
          {
            name: 'Learning::submit',
            resourceType: 'DifferentResource',
            resolveResource: resource,
          },
          signal,
          client,
        ),
      ).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
      const capability = (schoolId: string) => ({
        action: 'read' as const,
        resourceType: 'Classroom' as const,
        resolveResource: async () => ({ id: schoolId, attributes: { school_id: schoolId } }),
      });
      await expect(
        security.authorize(scope, capability(school), signal, client),
      ).resolves.toBeUndefined();
      await expect(
        security.authorize(scope, capability(subject), signal, client),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await client.query("UPDATE public.bonds SET entity_type = 'PERSONAL' WHERE id = $1", [bond]);
      await expect(security.resolveScope(identity, bond, signal, client)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await client.query(
        "UPDATE public.bonds SET entity_type = 'SCHOOL', status = 'inactive' WHERE id = $1",
        [bond],
      );
      await expect(
        security.authorize(scope, capability(school), signal, client),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await client.query(
        "UPDATE public.bonds SET status = 'active', valid_until = now() - interval '1 second' WHERE id = $1",
        [bond],
      );
      await expect(security.resolveScope(identity, bond, signal, client)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await client.query('UPDATE public.bonds SET valid_until = NULL WHERE id = $1', [bond]);
      await client.query(
        "UPDATE auth.sessions SET not_after = now() - interval '1 second' WHERE id = $1",
        [session],
      );
      await expect(authenticate()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(security.assertIdentity(identity, signal, client)).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
      await expect(security.resolveScope(identity, bond, signal, client)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await client.query('UPDATE auth.sessions SET not_after = NULL WHERE id = $1', [session]);
      await client.query('UPDATE public.users SET deleted_at = now() WHERE id = $1', [account]);
      await expect(authenticate()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await client.query('UPDATE public.users SET deleted_at = NULL WHERE id = $1', [account]);
      await client.query(
        'UPDATE public.auth_identities SET provider_user_id = $1 WHERE user_id = $2',
        [school, account],
      );
      await expect(authenticate()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
      await pool.end();
    }
  });
});
