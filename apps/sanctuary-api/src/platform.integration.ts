import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { createORPCClient } from '@orpc/client';
import { ORPCError, os, type RouterClient } from '@orpc/server';
import { createV1Client, createV1Link } from '@repo/core/api/v1/client';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { readServerConfig } from './config';
import { createApp } from './core/app';
import type { APIContext } from './core/context';
import { startNodeServer } from './node-server';
import { createPlatform, type Platform } from './platform';

const account = '01234567-89ab-8101-8000-112233445566';
const otherAccount = '01234567-89ab-8101-8000-112233445567';
const subject = randomUUID();
const otherSubject = randomUUID();
const session = randomUUID();
const otherSession = randomUUID();
const bond = randomUUID();
const school = randomUUID();
const otherSchool = randomUUID();
const classroom = randomUUID();
const otherClassroom = randomUUID();
const issuer = 'https://platform-fixture.example/auth/v1';
const signal = new AbortController().signal;
const snapshotKey = generateKeyPairSync('ed25519')
  .privateKey.export({ format: 'pem', type: 'pkcs8' })
  .toString();
const pool = new Pool({
  connectionString: process.env.API_TEST_DATABASE_URL,
  max: 2,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
});
const platforms: Platform[] = [];
let token: string;
let otherToken: string;
let create: (budget?: number, poolMax?: number) => Platform;
let provisioned = false;

async function awaitBudgetWindow() {
  // Budget windows follow the database clock. Start assertions with at least
  // ten seconds left so a normal minute rollover cannot reset the quota midway.
  const result = await pool.query<{ elapsed_ms: number }>(
    'select floor(extract(second from clock_timestamp()) * 1000)::integer as elapsed_ms',
  );
  const elapsed = result.rows[0]?.elapsed_ms;
  if (elapsed === undefined) throw new Error('Expected database clock');
  const delay = elapsed >= 50_000 ? 61_000 - elapsed : 0;
  if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
}

beforeAll(async () => {
  const url = process.env.API_TEST_DATABASE_URL;
  if (
    process.env.API_DATABASE_TEST_ACK !== 'isolated-foundation' ||
    !url ||
    !new URL(url).pathname.slice(1).startsWith('pjc_api_foundation_')
  )
    throw new Error('Acknowledged isolated foundation database is required');
  const database = await pool.query<{ name: string }>('select current_database() name');
  if (!database.rows[0]?.name.startsWith('pjc_api_foundation_'))
    throw new Error('Connected database is outside the isolated prefix');
  await pool.query(`
    create table public.api_platform_test_records(id uuid primary key,owner_id uuid not null references public.users(id),value text not null);
    alter table public.api_platform_test_records enable row level security;
    create policy owner_access on public.api_platform_test_records to authenticated
      using (owner_id=public.get_my_id()) with check(owner_id=public.get_my_id());
    grant select,insert,update,delete on public.api_platform_test_records to authenticated;
    create table public.api_platform_test_classrooms(id uuid primary key,school_id uuid not null);
  `);
  provisioned = true;
  await pool.query('insert into public.users(id) values ($1),($2)', [account, otherAccount]);
  await pool.query('insert into auth.users(id) values ($1),($2)', [subject, otherSubject]);
  await pool.query('insert into auth.sessions(id,user_id) values ($1,$2),($3,$4)', [
    session,
    subject,
    otherSession,
    otherSubject,
  ]);
  await pool.query(
    "insert into public.auth_identities(user_id,provider,provider_user_id) values ($1,'supabase',$2),($3,'supabase',$4)",
    [account, subject, otherAccount, otherSubject],
  );
  await pool.query(
    `insert into public.bonds(id,user_id,entity_id,entity_type,capacity,status,valid_from)
    values ($1,$2,$3,'SCHOOL','principal','active',now())`,
    [bond, account, school],
  );
  await pool.query(
    'insert into public.api_platform_test_classrooms(id,school_id) values ($1,$2),($3,$4)',
    [classroom, school, otherClassroom, otherSchool],
  );
  await pool.query(
    'insert into public.api_platform_test_records(id,owner_id,value) values ($1,$2,$3),($4,$5,$6)',
    [randomUUID(), account, 'mine', randomUUID(), otherAccount, 'other-private'],
  );
  const keys = await generateKeyPair('ES256');
  const jwk = await exportJWK(keys.publicKey);
  const sign = (accountId: string, subjectId: string, sessionId: string) =>
    new SignJWT({
      canonical_account_id: accountId,
      session_id: sessionId,
      role: 'authenticated',
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'platform-fixture' })
      .setSubject(subjectId)
      .setIssuer(issuer)
      .setAudience('authenticated')
      .setExpirationTime('5m')
      .sign(keys.privateKey);
  token = await sign(account, subject, session);
  otherToken = await sign(otherAccount, otherSubject, otherSession);
  create = (budget = 120, poolMax = 5) => {
    const platform = createPlatform(
      readServerConfig({
        API_AUTHENTICATION: 'required',
        DATABASE_URL: url,
        AUTH_ISSUER: issuer,
        AUTH_JWKS_URL: `${issuer}/.well-known/jwks.json`,
        AUTH_AUDIENCE: 'authenticated',
        API_ACCOUNT_REQUESTS_PER_MINUTE: String(budget),
        DB_POOL_MAX: String(poolMax),
        DB_CONNECT_TIMEOUT_MS: '15000',
        DB_IDLE_TRANSACTION_TIMEOUT_MS: '20000',
        SNAPSHOT_SIGNING_PRIVATE_KEY: snapshotKey,
      }),
      {
        jwksFetch: async () =>
          Response.json({ keys: [{ ...jwk, kid: 'platform-fixture', alg: 'ES256' }] }),
      },
    );
    if (!platform) throw new Error('Expected required-auth platform');
    platforms.push(platform);
    return platform;
  };
}, 20_000);

afterEach(async () => {
  await Promise.all(platforms.splice(0).map((platform) => platform.close()));
});

afterAll(async () => {
  try {
    if (provisioned) {
      await pool.query(
        'drop table public.api_platform_test_records,public.api_platform_test_classrooms',
      );
      await pool.query(
        'delete from public.external_effect_intents where account_id=any($1::uuid[])',
        [[account, otherAccount]],
      );
      await pool.query('delete from public.operation_receipts where account_id=any($1::uuid[])', [
        [account, otherAccount],
      ]);
      await pool.query('delete from public.api_request_budgets where account_id=any($1::uuid[])', [
        [account, otherAccount],
      ]);
      await pool.query('delete from public.bonds where id=$1', [bond]);
      await pool.query('delete from public.auth_identities where user_id=any($1::uuid[])', [
        [account, otherAccount],
      ]);
      await pool.query('delete from auth.sessions where id=any($1::uuid[])', [
        [session, otherSession],
      ]);
      await pool.query('delete from auth.users where id=any($1::uuid[])', [
        [subject, otherSubject],
      ]);
      await pool.query('delete from public.users where id=any($1::uuid[])', [
        [account, otherAccount],
      ]);
    }
  } finally {
    await pool.end();
  }
});

describe('composed API foundation with real PostgreSQL and Cedar', () => {
  it('applies database deadlines inside account transactions and recovers after lock contention', async () => {
    const platform = create();
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    const settings = await platform.withAccountData(identity, signal, (db) =>
      db.query(`select current_setting('statement_timeout') as statement,
        current_setting('lock_timeout') as lock,
        current_setting('idle_in_transaction_session_timeout') as idle`),
    );
    expect(settings.rows).toEqual([{ statement: '5s', lock: '2s', idle: '20s' }]);
    const blocker = await pool.connect();
    try {
      await blocker.query('begin');
      await blocker.query(
        'select id from public.api_platform_test_records where owner_id=$1 for update',
        [account],
      );
      await expect(
        platform.withAccountData(identity, signal, (db) =>
          db.query('select id from public.api_platform_test_records where owner_id=$1 for update', [
            account,
          ]),
        ),
      ).rejects.toMatchObject({ code: '55P03' });
    } finally {
      await blocker.query('rollback');
      blocker.release();
    }
    const recovered = await platform.withAccountData(identity, signal, (db) =>
      db.query('select id from public.api_platform_test_records where owner_id=$1 for update', [
        account,
      ]),
    );
    expect(recovered.rowCount).toBe(1);
  });
  it('refreshes snapshots without waiting on an unchanged global policy version', async () => {
    const platform = create();
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    const initial = await platform.security.issueSnapshot(identity, bond, signal);
    const blocker = await pool.connect();
    try {
      await blocker.query('begin');
      await blocker.query("select id from public.policy_version where id='cedar' for update");
      const refreshed = await platform.security.issueSnapshot(identity, bond, signal);
      expect(refreshed.policyVersion).toBe(initial.policyVersion);
      expect(Date.parse(refreshed.generatedAt)).toBeGreaterThanOrEqual(
        Date.parse(initial.generatedAt),
      );
    } finally {
      await blocker.query('rollback');
      blocker.release();
    }
  });
  it('persists permission snapshots with owner-only reads and denies ended bonds', async () => {
    const platform = create();
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    const other = await platform.security.authenticate(`Bearer ${otherToken}`, signal);
    const issued = await platform.security.issueSnapshot(identity, bond, signal);
    const read = (actor: typeof identity) =>
      platform.withAccountData(actor, signal, (db) =>
        db.query<{ user_id: string; policy_version: string }>(
          'select user_id::text,policy_version from public.permission_snapshots where active_bond_id=$1',
          [bond],
        ),
      );
    expect((await read(identity)).rows).toEqual([
      { user_id: account, policy_version: issued.policyVersion },
    ]);
    expect((await read(other)).rows).toEqual([]);
    await expect(
      platform.withAccountData(identity, signal, (db) =>
        db.query('update public.permission_snapshots set signature=$1 where active_bond_id=$2', [
          'forged',
          bond,
        ]),
      ),
    ).rejects.toMatchObject({ code: '42501' });
    // Nobody grants themselves authority through their own session.
    await expect(
      platform.withAccountData(identity, signal, (db) =>
        db.query(
          `insert into public.bonds(id,user_id,entity_id,entity_type,capacity,status,valid_from)
           values (gen_random_uuid(),$1,'GLOBAL','GLOBAL','admin','active',now())`,
          [account],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      platform.withAccountData(identity, signal, (db) =>
        db.query("update public.bonds set capacity='admin' where id=$1", [bond]),
      ),
    ).rejects.toMatchObject({ code: '42501' });
    expect(await platform.security.readEntry(identity, signal)).toMatchObject({
      accountId: account,
      onboardingCompleted: false,
      scopes: [expect.objectContaining({ bondId: bond })],
    });
    try {
      await pool.query("update public.bonds set status='ended' where id=$1", [bond]);
      await expect(platform.security.issueSnapshot(identity, bond, signal)).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    } finally {
      await pool.query("update public.bonds set status='active' where id=$1", [bond]);
    }
    expect((await read(identity)).rows).toEqual([
      { user_id: account, policy_version: issued.policyVersion },
    ]);
  });
  it('commits scoped RLS work and staged effects once while denying foreign writes', async () => {
    const platform = create(120, 1);
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    const scope = await platform.security.resolveScope(identity, bond, signal);
    const recordId = randomUUID();
    try {
      const key = randomUUID();
      const policy = {
        action: 'update' as const,
        resourceType: 'Classroom' as const,
        resolveResource: async (db: import('pg').Pool | import('pg').PoolClient) => {
          const result = await db.query<{ id: string; school_id: string }>(
            'select id::text,school_id::text from public.api_platform_test_classrooms where id=$1 for share',
            [classroom],
          );
          const row = result.rows[0];
          return row ? { id: row.id, attributes: { school_id: row.school_id } } : null;
        },
      };
      let mutations = 0;
      const command = {
        scope,
        capability: 'fixture.scoped-command.v1',
        key,
        payload: { recordId },
        policy,
        deriveScope: (active: typeof scope) => `${active.entityType}:${active.entityId}`,
        signal,
        mutate: async (
          client: import('pg').PoolClient,
          _payload: import('./operations/store').OperationJSON,
          enqueue: (intent: import('./operations/store').EffectInput) => Promise<string>,
        ) => {
          mutations++;
          await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
            recordId,
            account,
            'scoped-command',
          ]);
          const effectId = await enqueue({
            name: 'fixture',
            key: 'one',
            payload: { recordId },
            privacyClass: 'minimal',
            purpose: 'scoped command fixture',
          });
          return { effectId };
        },
      };
      const first = await platform.executeAccountCommand(command);
      const replay = await platform.executeAccountCommand(command);
      const audit = await pool.query<{
        account_id: string;
        bond_id: string;
        capability: string;
        resource_type: string;
        resource_id: string;
        channel: string;
        agent_key: string | null;
      }>(
        `select account_id::text,bond_id::text,capability,resource_type,resource_id,channel,agent_key from public.api_command_audit where operation_id=$1`,
        [first.operationId],
      );
      expect(audit.rows).toEqual([
        {
          account_id: account,
          bond_id: bond,
          capability: command.capability,
          resource_type: 'Classroom',
          resource_id: classroom,
          channel: 'app',
          agent_key: null,
        },
      ]);
      const grants = await pool.query<{
        client_access: boolean;
        service_write: boolean;
        service_change: boolean;
      }>(
        `select has_table_privilege('authenticated','public.api_command_audit','SELECT,INSERT,UPDATE,DELETE') as client_access,
          has_table_privilege('service_role','public.api_command_audit','INSERT') as service_write,
          has_table_privilege('service_role','public.api_command_audit','UPDATE,DELETE') as service_change`,
      );
      expect(grants.rows[0]).toEqual({
        client_access: false,
        service_write: true,
        service_change: false,
      });
      expect(first.replayed).toBe(false);
      expect(replay).toEqual({ ...first, replayed: true });
      expect(mutations).toBe(1);
      await pool.query("update public.bonds set capacity='assistantPrincipal' where id=$1", [bond]);
      try {
        const changed = await platform.executeAccountCommand({
          ...command,
          key: randomUUID(),
          mutate: async () => null,
        });
        const evidence = await pool.query<{ capacity: string }>(
          'select capacity from public.api_command_audit where operation_id=$1',
          [changed.operationId],
        );
        expect(evidence.rows).toEqual([{ capacity: 'assistantPrincipal' }]);
      } finally {
        await pool.query("update public.bonds set capacity='principal' where id=$1", [bond]);
      }
      const unavailableKey = randomUUID();
      const unavailableRecord = randomUUID();
      await pool.query(
        'alter table public.api_command_audit rename to api_command_audit_unavailable',
      );
      try {
        await expect(
          platform.executeAccountCommand({
            ...command,
            key: unavailableKey,
            mutate: async (client) => {
              await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
                unavailableRecord,
                account,
                'audit-unavailable',
              ]);
              return null;
            },
          }),
        ).rejects.toMatchObject({ code: '42P01' });
      } finally {
        await pool.query(
          'alter table public.api_command_audit_unavailable rename to api_command_audit',
        );
      }
      expect(
        (
          await pool.query('select id from public.api_platform_test_records where id=$1', [
            unavailableRecord,
          ])
        ).rows,
      ).toHaveLength(0);
      expect(
        (
          await pool.query(
            'select operation_id from public.operation_receipts where account_id=$1 and idempotency_key=$2',
            [account, unavailableKey],
          )
        ).rows,
      ).toHaveLength(0);
      for (const action of ['read', 'use_ai']) {
        await expect(
          Reflect.apply(platform.executeAccountCommand, undefined, [
            { ...command, key: randomUUID(), policy: { ...policy, action } },
          ]),
        ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      }
      const result = z.strictObject({ effectId: z.uuid() }).parse(first.result);
      expect(
        (
          await pool.query(
            'select id from public.external_effect_intents where id=$1 and operation_id=$2',
            [result.effectId, first.operationId],
          )
        ).rows,
      ).toHaveLength(1);
      await expect(
        platform.executeAccountCommand({
          ...command,
          key: randomUUID(),
          mutate: async (client) => {
            await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
              randomUUID(),
              otherAccount,
              'forbidden',
            ]);
            return null;
          },
        }),
      ).rejects.toMatchObject({ code: '42501' });
      await expect(
        platform.executeAccountCommand({ ...command, scope: { ...scope }, key: randomUUID() }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(
        platform.executeAccountCommand({
          ...command,
          deriveScope: (active) => `different:${active.entityId}`,
        }),
      ).rejects.toMatchObject({ code: 'OPERATION_CONFLICT' });
      const failedKey = randomUUID();
      const failedRecord = randomUUID();
      await expect(
        platform.executeAccountCommand({
          ...command,
          key: failedKey,
          mutate: async (client, _payload, enqueue) => {
            await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
              failedRecord,
              account,
              'rollback',
            ]);
            await enqueue({
              name: 'fixture',
              key: 'rollback',
              payload: {},
              privacyClass: 'minimal',
              purpose: 'rollback fixture',
            });
            throw new Error('fixture mutation failed');
          },
        }),
      ).rejects.toThrow('fixture mutation failed');
      expect(
        (
          await pool.query('select id from public.api_platform_test_records where id=$1', [
            failedRecord,
          ])
        ).rows,
      ).toHaveLength(0);
      expect(
        (
          await pool.query(
            'select operation_id from public.operation_receipts where account_id=$1 and idempotency_key=$2',
            [account, failedKey],
          )
        ).rows,
      ).toHaveLength(0);
      const privileged = await platform.operations.execute(
        {
          accountId: account,
          scope: 'fixture:role-probe',
          capability: 'fixture.role-probe.v1',
          key: randomUUID(),
          payload: {},
        },
        {
          authorize: async (client) => {
            const row = (
              await client.query<{ role: string; claims: string | null }>(
                "select current_user as role, nullif(current_setting('request.jwt.claims', true), '') as claims",
              )
            ).rows[0];
            expect(row?.role).not.toBe('authenticated');
            expect(row?.claims).toBeNull();
          },
          mutate: async () => null,
        },
      );
      expect(privileged.replayed).toBe(false);
      const clean = await platform.withAccountData(
        identity,
        signal,
        async (client) =>
          (await client.query<{ account: string }>('select public.get_my_id()::text account'))
            .rows[0],
      );
      expect(clean?.account).toBe(account);
    } finally {
      await pool.query('delete from public.api_platform_test_records where id=$1', [recordId]);
    }
  });
  it('recovers a scoped command after losing the commit acknowledgement over a real socket', async () => {
    const platform = create(120, 1);
    const key = randomUUID();
    const recordId = randomUUID();
    let mutations = 0;
    let injected = false;
    let armed = false;
    let transactionClient: import('pg').PoolClient | undefined;
    let querySpy: ReturnType<typeof vi.spyOn> | undefined;
    const fixture = {
      command: os
        .$context<APIContext>()
        .input(z.strictObject({ key: z.uuid() }))
        .handler(async ({ context, input, signal: requestSignal }) => {
          if (!context.identity || !context.platform || !requestSignal)
            throw new ORPCError('UNAUTHORIZED');
          const scope = await platform.security.resolveScope(context.identity, bond, requestSignal);
          return platform.executeAccountCommand({
            scope,
            capability: 'fixture.scoped-lost-commit.v1',
            key: input.key,
            payload: { recordId },
            signal: requestSignal,
            policy: {
              action: 'update',
              resourceType: 'Classroom',
              resolveResource: async (db) => {
                if ('release' in db) transactionClient = db;
                const row = (
                  await db.query<{ id: string; school_id: string }>(
                    'select id::text,school_id::text from public.api_platform_test_classrooms where id=$1 for share',
                    [classroom],
                  )
                ).rows[0];
                return row ? { id: row.id, attributes: { school_id: row.school_id } } : null;
              },
            },
            deriveScope: (current) => {
              if (mutations === 1 && !armed && transactionClient) {
                armed = true;
                const client = transactionClient;
                querySpy = vi.spyOn(client, 'query').mockImplementationOnce(async (sql, values) => {
                  expect(sql).toContain('insert into public.api_command_audit');
                  const result = await client.query(sql, values);
                  querySpy = vi.spyOn(client, 'query').mockImplementationOnce(async (commitSql) => {
                    expect(commitSql).toBe('commit');
                    injected = true;
                    await client.query('commit');
                    throw new Error('Simulated lost commit acknowledgement');
                  });
                  return result;
                });
              }
              return `${current.entityType}:${current.entityId}`;
            },
            mutate: async (client, _payload, enqueue) => {
              mutations++;
              await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
                recordId,
                scope.identity.accountId,
                'scoped-lost-commit',
              ]);
              const effectId = await enqueue({
                name: 'fixture',
                key: 'one',
                payload: { recordId },
                privacyClass: 'minimal',
                purpose: 'scoped lost commit fixture',
              });
              return { effectId };
            },
          });
        }),
    };
    const runtime = await startNodeServer(
      { ...readServerConfig({ NODE_ENV: 'test' }), PORT: 0 },
      fixture,
      platform,
    );
    try {
      const address = runtime.server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({
          origin: `http://127.0.0.1:${address.port}`,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      await expect(client.command({ key })).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        data: { reason: 'operation_outcome_unknown' },
      });
      querySpy?.mockRestore();
      expect(injected).toBe(true);
      const recovered = await client.command({ key });
      expect(recovered.replayed).toBe(true);
      expect(mutations).toBe(1);
      const result = z.strictObject({ effectId: z.uuid() }).parse(recovered.result);
      expect(
        (
          await pool.query('select id from public.api_platform_test_records where id=$1', [
            recordId,
          ])
        ).rows,
      ).toHaveLength(1);
      expect(
        (
          await pool.query(
            'select operation_id from public.operation_receipts where account_id=$1 and idempotency_key=$2',
            [account, key],
          )
        ).rows,
      ).toHaveLength(1);
      expect(
        (
          await pool.query(
            'select id from public.external_effect_intents where id=$1 and operation_id=$2',
            [result.effectId, recovered.operationId],
          )
        ).rows,
      ).toHaveLength(1);
      await platform.operations.execute(
        {
          accountId: account,
          scope: 'fixture:role-probe',
          capability: 'fixture.role-probe.v1',
          key: randomUUID(),
          payload: {},
        },
        {
          authorize: async (db) => {
            const row = (
              await db.query<{ role: string; claims: string | null }>(
                "select current_user as role, nullif(current_setting('request.jwt.claims', true), '') as claims",
              )
            ).rows[0];
            expect(row?.role).not.toBe('authenticated');
            expect(row?.claims).toBeNull();
          },
          mutate: async () => null,
        },
      );
    } finally {
      querySpy?.mockRestore();
      await runtime.shutdown();
      await pool.query('delete from public.api_platform_test_records where id=$1', [recordId]);
    }
  });
  it('reports an uncertain account-data commit without promising receipt recovery', async () => {
    const platform = create();
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    const recordId = randomUUID();
    let commitInjected = false;
    let querySpy: ReturnType<typeof vi.spyOn> | undefined;
    try {
      await expect(
        platform.withAccountData(identity, signal, async (client) => {
          await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
            recordId,
            account,
            'uncertain-commit',
          ]);
          querySpy = vi.spyOn(client, 'query').mockImplementationOnce(async (sql) => {
            expect(sql).toBe('commit');
            commitInjected = true;
            await client.query('commit');
            throw new Error('Simulated lost commit acknowledgment');
          });
        }),
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Operation outcome is uncertain.',
      });
      expect(commitInjected).toBe(true);
      const result = await pool.query(
        'select id from public.api_platform_test_records where id=$1',
        [recordId],
      );
      expect(result.rowCount).toBe(1);
    } finally {
      querySpy?.mockRestore();
      await pool.query('delete from public.api_platform_test_records where id=$1', [recordId]);
    }
  });

  it('bounds pending authentication across disconnects and releases after denial or budget failure', async () => {
    await pool.query('delete from public.api_request_budgets where account_id=$1', [account]);
    const platform = create(1, 1);
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    let entered = () => {};
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transaction = platform.withAccountData(identity, signal, async () => {
      entered();
      await gate;
    });
    await held;
    const querySpy = vi.spyOn(Pool.prototype, 'query');
    const runtime = await startNodeServer(
      { ...readServerConfig({ NODE_ENV: 'test', API_MAX_AUTHENTICATION_REQUESTS: '1' }), PORT: 0 },
      undefined,
      platform,
    );
    const address = runtime.server.address();
    if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
    const origin = `http://127.0.0.1:${address.port}`;
    const client = createV1Client({ origin, headers: { Authorization: `Bearer ${token}` } });
    const controller = new AbortController();
    try {
      const first = client.identity.session(undefined, { signal: controller.signal }).then(
        () => 'resolved',
        () => 'rejected',
      );
      await vi.waitFor(() => {
        const identityQueries = querySpy.mock.calls.filter(
          ([sql]) =>
            typeof sql === 'string' && sql.includes('FROM public.auth_identities identity'),
        );
        expect(identityQueries).toHaveLength(1);
      });
      controller.abort();
      expect(await first).toBe('rejected');
      await expect(client.identity.session()).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect((await fetch(`${origin}/health/live`)).status).toBe(200);
      expect(
        querySpy.mock.calls.filter(
          ([sql]) =>
            typeof sql === 'string' && sql.includes('FROM public.auth_identities identity'),
        ),
      ).toHaveLength(1);
      release();
      await transaction;
      await awaitBudgetWindow();
      await vi.waitFor(async () => {
        expect((await client.identity.session()).accountId).toBe(account);
      });
      await expect(client.identity.session()).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
      const invalid = createV1Client({ origin, headers: { Authorization: 'Bearer invalid' } });
      await expect(invalid.identity.session()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(client.identity.session()).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
    } finally {
      controller.abort();
      release();
      await transaction;
      await runtime.shutdown();
      querySpy.mockRestore();
    }
  });

  it('serves authenticated identity over a real Node socket backed by PostgreSQL', async () => {
    const platform = create();
    const runtime = await startNodeServer(
      { ...readServerConfig({ NODE_ENV: 'test' }), PORT: 0 },
      undefined,
      platform,
    );
    try {
      const address = runtime.server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
      const origin = `http://127.0.0.1:${address.port}`;
      const client = (bearer?: string) =>
        createV1Client({
          origin,
          headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
        });

      expect((await fetch(`${origin}/health/ready`)).status).toBe(200);
      await expect(client().identity.session()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
      await expect(client(token).identity.session()).resolves.toEqual({
        accountId: account,
        expiresAt: expect.any(Number),
      });
      await expect(client(token).identity.scopes()).resolves.toEqual({
        scopes: [
          {
            bondId: bond,
            entityId: school,
            entityType: 'SCHOOL',
            capacity: 'principal',
            citizenship: 'FIRST_CLASS',
            admission: 'available',
          },
        ],
      });
      await pool.query("update auth.sessions set not_after=now()-interval '1 second' where id=$1", [
        session,
      ]);
      try {
        await expect(client(token).identity.session()).rejects.toMatchObject({
          code: 'UNAUTHORIZED',
        });
      } finally {
        await pool.query('update auth.sessions set not_after=null where id=$1', [session]);
      }
    } finally {
      await runtime.shutdown();
    }
    expect(runtime.server.listening).toBe(false);
  });

  it('serves the actual canonical identity procedures with private scope discovery and revoked-session denial', async () => {
    const platform = create();
    const host = createApp(undefined, { platform, logger: () => {} });
    const client = (bearer?: string) =>
      createV1Client({
        origin: 'https://platform.test',
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
        fetch: async (url, init) => host.request(new Request(url, init)),
      });
    await expect(client().identity.session()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    await expect(client().identity.scopes()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    const verified = await client(token).identity.session();
    expect(verified).toEqual({ accountId: account, expiresAt: expect.any(Number) });
    expect(verified.accountId).not.toBe(subject);
    expect(Object.keys(verified).sort()).toEqual(['accountId', 'expiresAt']);
    const foreignBond = randomUUID();
    await pool.query(
      `insert into public.bonds(id,user_id,entity_id,entity_type,capacity,status,valid_from)
      values ($1,$2,$3,'SCHOOL','principal','active',now())`,
      [foreignBond, otherAccount, otherSchool],
    );
    try {
      expect(await client(token).identity.scopes()).toEqual({
        scopes: [
          {
            bondId: bond,
            entityId: school,
            entityType: 'SCHOOL',
            capacity: 'principal',
            citizenship: 'FIRST_CLASS',
            admission: 'available',
          },
        ],
      });
      expect(await client(otherToken).identity.scopes()).toEqual({
        scopes: [
          {
            bondId: foreignBond,
            entityId: otherSchool,
            entityType: 'SCHOOL',
            capacity: 'principal',
            citizenship: 'FIRST_CLASS',
            admission: 'available',
          },
        ],
      });
      const unadmitted = { unadmitted: os.handler(() => 'not-mounted') };
      const unknown = createORPCClient<RouterClient<typeof unadmitted>>(
        createV1Link({
          origin: 'https://platform.test',
          headers: { Authorization: `Bearer ${token}` },
          fetch: async (url, init) => host.request(new Request(url, init)),
        }),
      );
      await expect(unknown.unadmitted()).rejects.toMatchObject({ code: 'NOT_FOUND' });
      await pool.query("update auth.sessions set not_after=now()-interval '1 second' where id=$1", [
        session,
      ]);
      try {
        await expect(client(token).identity.session()).rejects.toMatchObject({
          code: 'UNAUTHORIZED',
        });
        await expect(client(token).identity.scopes()).rejects.toMatchObject({
          code: 'UNAUTHORIZED',
        });
      } finally {
        await pool.query('update auth.sessions set not_after=null where id=$1', [session]);
      }
    } finally {
      await pool.query('delete from public.bonds where id=$1', [foreignBond]);
    }
  });

  it('uses verified canonical identity and account RLS through the native SDK host', async () => {
    const platform = create();
    const fixture = {
      records: os.$context<APIContext>().handler(async ({ context, signal: requestSignal }) => {
        if (!context.identity || !context.platform || !requestSignal)
          throw new ORPCError('UNAUTHORIZED');
        expect(Object.keys(context.platform).sort()).toEqual(['executeAccountCommand', 'security']);
        const identity = context.identity;
        return platform.withAccountData(identity, requestSignal, async (client) => {
          const result = await client.query<{ owner_id: string; value: string }>(
            'select owner_id::text,value from public.api_platform_test_records order by value',
          );
          return { accountId: identity.accountId, rows: result.rows };
        });
      }),
    };
    const host = createApp(fixture, { platform, logger: () => {} });
    const client = (bearer?: string) =>
      createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({
          origin: 'https://platform.test',
          headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
          fetch: async (url, init) => host.request(new Request(url, init)),
        }),
      );
    await expect(client().records()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(await client(token).records()).toEqual({
      accountId: account,
      rows: [{ owner_id: account, value: 'mine' }],
    });
    expect(await client(otherToken).records()).toEqual({
      accountId: otherAccount,
      rows: [{ owner_id: otherAccount, value: 'other-private' }],
    });
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    await expect(
      platform.withAccountData(identity, signal, async (client) => {
        await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
          randomUUID(),
          otherAccount,
          'cross-owner',
        ]);
      }),
    ).rejects.toMatchObject({ code: '42501' });
    const claims = await platform.withAccountData(identity, signal, async (client) => {
      const row = await client.query<{ account: string; subject: string }>(
        'select public.get_my_id()::text account,auth.uid()::text subject',
      );
      return row.rows[0];
    });
    expect(claims).toEqual({ account, subject });
  });

  it('recovers a committed operation after the client disconnects before receiving its response', async () => {
    const platform = create();
    const recordId = randomUUID();
    const key = randomUUID();
    let committed = () => {};
    const committedSignal = new Promise<void>((resolve) => {
      committed = resolve;
    });
    let mutations = 0;
    const fixture = {
      mutate: os
        .$context<APIContext>()
        .input(z.strictObject({ key: z.uuid() }))
        .handler(async ({ context, input, signal: requestSignal }) => {
          if (!context.identity || !context.platform || !requestSignal)
            throw new ORPCError('UNAUTHORIZED');
          const identity = context.identity;
          const result = await platform.operations.execute(
            {
              accountId: identity.accountId,
              scope: 'fixture:lost-response',
              capability: 'fixture.lost-response.v1',
              key: input.key,
              payload: { recordId },
            },
            {
              signal: requestSignal,
              authorize: async (client) =>
                platform.security.assertIdentity(identity, requestSignal, client),
              mutate: async (client, enqueue) => {
                mutations++;
                await client.query(
                  'insert into public.api_platform_test_records(id,owner_id,value) values ($1,$2,$3)',
                  [recordId, account, 'committed'],
                );
                await enqueue({
                  name: 'fixture',
                  key: 'only',
                  payload: { recordId },
                  privacyClass: 'minimal',
                  purpose: 'lost-response fixture',
                });
                return { recordId };
              },
            },
          );
          if (!result.replayed) {
            committed();
            if (!requestSignal.aborted)
              await new Promise<void>((resolve) =>
                requestSignal.addEventListener('abort', () => resolve(), { once: true }),
              );
          }
          return result;
        }),
    };
    const runtime = await startNodeServer(
      { ...readServerConfig({ NODE_ENV: 'test' }), PORT: 0 },
      fixture,
      platform,
    );
    try {
      const address = runtime.server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({
          origin: `http://127.0.0.1:${address.port}`,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      const controller = new AbortController();
      const first = client.mutate({ key }, { signal: controller.signal }).then(
        () => 'resolved',
        () => 'rejected',
      );
      await committedSignal;
      controller.abort();
      expect(await first).toBe('rejected');
      const replay = await client.mutate({ key });
      expect(replay.replayed).toBe(true);
      expect(replay.result).toEqual({ recordId });
      expect(mutations).toBe(1);
      expect(
        (
          await pool.query('select id from public.api_platform_test_records where id=$1', [
            recordId,
          ])
        ).rows,
      ).toHaveLength(1);
      expect(
        (
          await pool.query('select id from public.external_effect_intents where operation_id=$1', [
            replay.operationId,
          ])
        ).rows,
      ).toHaveLength(1);
    } finally {
      await runtime.shutdown();
    }
  });

  it('retries one authorized HTTP mutation into one receipt and effect, denying foreign resources and revoked replay', async () => {
    const platform = create();
    let mutations = 0;
    const fixture = {
      mutate: os
        .$context<APIContext>()
        .input(z.strictObject({ key: z.uuid(), classroom: z.uuid() }))
        .handler(async ({ context, input, signal: requestSignal }) => {
          const identity = context.identity;
          if (!identity || !context.platform || !requestSignal) throw new ORPCError('UNAUTHORIZED');
          const scope = await platform.security.resolveScope(identity, bond, requestSignal);
          return platform.operations.execute(
            {
              accountId: identity.accountId,
              scope: `${scope.entityType}:${scope.entityId}`,
              capability: 'fixture.platform.mutate.v1',
              key: input.key,
              payload: { classroom: input.classroom },
            },
            {
              signal: requestSignal,
              authorize: async (client) => {
                await platform.security.assertIdentity(identity, requestSignal, client);
                await platform.security.authorize(
                  scope,
                  {
                    action: 'read',
                    resourceType: 'Classroom',
                    resolveResource: async (db) => {
                      const row = await db.query<{ id: string; school_id: string }>(
                        'select id::text,school_id::text from public.api_platform_test_classrooms where id=$1',
                        [input.classroom],
                      );
                      const resource = row.rows[0];
                      return resource
                        ? { id: resource.id, attributes: { school_id: resource.school_id } }
                        : null;
                    },
                  },
                  requestSignal,
                  client,
                );
              },
              mutate: async (_client, enqueue) => {
                mutations++;
                await enqueue({
                  name: 'fixture',
                  key: 'only',
                  payload: { reference: input.classroom },
                  privacyClass: 'minimal',
                  purpose: 'isolated integration evidence',
                });
                return { classroom: input.classroom };
              },
            },
          );
        }),
    };
    const host = createApp(fixture, { platform, logger: () => {} });
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: 'https://platform.test',
        headers: { Authorization: `Bearer ${token}` },
        fetch: async (url, init) => host.request(new Request(url, init)),
      }),
    );
    const key = randomUUID();
    const first = await client.mutate({ key, classroom });
    const replay = await client.mutate({ key, classroom });
    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.operationId).toBe(first.operationId);
    expect(mutations).toBe(1);
    expect(
      (
        await pool.query('select id from public.external_effect_intents where operation_id=$1', [
          first.operationId,
        ])
      ).rows,
    ).toHaveLength(1);
    await expect(
      client.mutate({ key: randomUUID(), classroom: otherClassroom }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await pool.query("update public.bonds set status='inactive' where id=$1", [bond]);
    try {
      await expect(client.mutate({ key, classroom })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    } finally {
      await pool.query("update public.bonds set status='active' where id=$1", [bond]);
    }
    expect(mutations).toBe(1);
  });

  it('enforces one shared account budget across two platform instances', async () => {
    await pool.query('delete from public.api_request_budgets where account_id=$1', [account]);
    const first = create(3);
    const second = create(3);
    const identities = await Promise.all([
      first.security.authenticate(`Bearer ${token}`, signal),
      second.security.authenticate(`Bearer ${token}`, signal),
    ]);
    const firstIdentity = identities[0];
    const secondIdentity = identities[1];
    if (!firstIdentity || !secondIdentity) throw new Error('Expected verified identities');
    await awaitBudgetWindow();
    const outcomes = await Promise.allSettled(
      Array.from({ length: 8 }, (_, index) =>
        index % 2
          ? first.consumeBudget(firstIdentity, signal)
          : second.consumeBudget(secondIdentity, signal),
      ),
    );
    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(3);
    const rejected = outcomes.filter((outcome) => outcome.status === 'rejected');
    expect(rejected).toHaveLength(5);
    expect(
      rejected.every(
        (outcome) =>
          outcome.reason instanceof ORPCError && outcome.reason.code === 'TOO_MANY_REQUESTS',
      ),
    ).toBe(true);
  });

  it('isolates request limits between authenticated people', async () => {
    await pool.query('delete from public.api_request_budgets where account_id=any($1::uuid[])', [
      [account, otherAccount],
    ]);
    const platform = create(1);
    const first = await platform.security.authenticate(`Bearer ${token}`, signal);
    const other = await platform.security.authenticate(`Bearer ${otherToken}`, signal);
    await awaitBudgetWindow();
    await expect(platform.consumeBudget(first, signal)).resolves.toBeUndefined();
    await expect(platform.consumeBudget(first, signal)).rejects.toMatchObject({
      code: 'TOO_MANY_REQUESTS',
    });
    await expect(platform.consumeBudget(other, signal)).resolves.toBeUndefined();
  });

  it('bounds a locked account budget and recovers after contention', async () => {
    await pool.query('delete from public.api_request_budgets where account_id=$1', [account]);
    const platform = create(120);
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    await awaitBudgetWindow();
    await platform.consumeBudget(identity, signal);
    const blocker = await pool.connect();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await blocker.query('begin');
      await blocker.query(
        'select account_id from public.api_request_budgets where account_id=$1 for update',
        [account],
      );
      timer = setTimeout(() => {
        void blocker.query('rollback');
      }, 8000);
      await expect(platform.consumeBudget(identity, signal)).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
    } finally {
      clearTimeout(timer);
      await blocker.query('rollback');
      blocker.release();
    }
    await expect(platform.consumeBudget(identity, signal)).resolves.toBeUndefined();
  });

  it('shares real database readiness work across aborted callers and rechecks after recovery', async () => {
    const platform = create(120, 1);
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    let entered = () => {};
    let release = () => {};
    const held = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const transaction = platform.withAccountData(identity, signal, async () => {
      entered();
      await gate;
    });
    await held;
    const querySpy = vi.spyOn(Pool.prototype, 'query');
    const firstAbort = new AbortController();
    const secondAbort = new AbortController();
    let renamed = false;
    try {
      const first = platform.checkReadiness(firstAbort.signal);
      firstAbort.abort();
      expect(await first).toBe(false);
      const second = platform.checkReadiness(secondAbort.signal);
      secondAbort.abort();
      expect(await second).toBe(false);
      expect(await platform.checkReadiness(signal)).toBe(false);
      expect(await platform.checkReadiness(signal)).toBe(false);
      const readinessQueries = querySpy.mock.calls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes("to_regclass('public.auth_identities')"),
      );
      expect(readinessQueries).toHaveLength(1);
      await pool.query(
        'alter table public.api_request_budgets rename to api_request_budgets_fixture_unavailable',
      );
      renamed = true;
      const remaining = platform.checkReadiness(signal);
      release();
      await transaction;
      expect(await remaining).toBe(false);
      await pool.query(
        'alter table public.api_request_budgets_fixture_unavailable rename to api_request_budgets',
      );
      renamed = false;
      await vi.waitFor(async () => {
        expect(await platform.checkReadiness(signal)).toBe(true);
      });
    } finally {
      release();
      await transaction;
      if (renamed)
        await pool.query(
          'alter table public.api_request_budgets_fixture_unavailable rename to api_request_budgets',
        );
      querySpy.mockRestore();
    }
  });

  it('fails readiness and HTTP admission closed when the quota authority is absent', async () => {
    const platform = create();
    const fixture = { echo: os.handler(() => 'must-not-enter') };
    const host = createApp(fixture, { platform, logger: () => {} });
    expect((await host.request('/health/ready')).status).toBe(200);
    await pool.query(
      'alter table public.api_request_budgets rename to api_request_budgets_fixture_unavailable',
    );
    try {
      expect((await host.request('/health/ready')).status).toBe(503);
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({
          origin: 'https://platform.test',
          headers: { Authorization: `Bearer ${token}` },
          fetch: async (url, init) => host.request(new Request(url, init)),
        }),
      );
      await expect(client.echo()).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    } finally {
      await pool.query(
        'alter table public.api_request_budgets_fixture_unavailable rename to api_request_budgets',
      );
    }
    expect((await host.request('/health/ready')).status).toBe(200);
  });

  it('fails readiness on security drift even when every table is present', async () => {
    const platform = create();
    expect(await platform.checkReadiness(signal)).toBe(true);
    await pool.query('alter table public.operation_receipts disable row level security');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query('alter table public.operation_receipts enable row level security');
    }
    await pool.query('grant insert on public.api_request_budgets to anon');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query('revoke insert on public.api_request_budgets from anon');
    }
    await pool.query('grant update (capacity) on public.api_command_audit to service_role');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query('revoke update (capacity) on public.api_command_audit from service_role');
    }
    await pool.query('grant trigger on public.api_command_audit to service_role');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query('revoke trigger on public.api_command_audit from service_role');
    }
    await pool.query('grant select (capacity) on public.api_command_audit to authenticated');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query('revoke select (capacity) on public.api_command_audit from authenticated');
    }
    await pool.query('grant insert on public.api_command_audit to service_role with grant option');
    try {
      expect(await platform.checkReadiness(signal)).toBe(false);
    } finally {
      await pool.query(
        'revoke grant option for insert on public.api_command_audit from service_role',
      );
    }
    expect(await platform.checkReadiness(signal)).toBe(true);
  });

  it('executes the rewards RLS activation without broadening its owner policies', async () => {
    const platform = create();
    const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
    await pool.query('insert into public.user_rewards(id,user_id) values($1,$2),($3,$4)', [
      randomUUID(),
      account,
      randomUUID(),
      otherAccount,
    ]);
    try {
      const rows = await platform.withAccountData(
        identity,
        signal,
        async (client) =>
          (await client.query<{ user_id: string }>('select user_id from public.user_rewards')).rows,
      );
      expect(rows).toEqual([{ user_id: account }]);
      await expect(
        platform.withAccountData(identity, signal, async (client) => {
          await client.query('insert into public.user_rewards(id,user_id) values($1,$2)', [
            randomUUID(),
            otherAccount,
          ]);
        }),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await pool.query('delete from public.user_rewards where user_id in($1,$2)', [
        account,
        otherAccount,
      ]);
    }
  });

  describe('horizontal foundation', () => {
    const classroomPolicy = (target: string) => ({
      action: 'update' as const,
      resourceType: 'Classroom' as const,
      resolveResource: async (db: import('pg').Pool | import('pg').PoolClient) => {
        const result = await db.query<{ id: string; school_id: string }>(
          'select id::text,school_id::text from public.api_platform_test_classrooms where id=$1 for update',
          [target],
        );
        const row = result.rows[0];
        return row ? { id: row.id, attributes: { school_id: row.school_id } } : null;
      },
    });
    const commandFor = (
      active: Awaited<ReturnType<Platform['security']['resolveScope']>>,
      capability: string,
      target = classroom,
    ) => {
      const recordId = randomUUID();
      return {
        scope: active,
        capability,
        key: randomUUID(),
        payload: { recordId },
        policy: classroomPolicy(target),
        deriveScope: (current: typeof active) => `${current.entityType}:${current.entityId}`,
        signal,
        mutate: async (client: import('pg').PoolClient) => {
          await client.query('insert into public.api_platform_test_records values ($1,$2,$3)', [
            recordId,
            account,
            'foundation',
          ]);
          return { recordId };
        },
      };
    };
    const setup = async () => {
      const platform = create();
      const identity = await platform.security.authenticate(`Bearer ${token}`, signal);
      return { platform, scope: await platform.security.resolveScope(identity, bond, signal) };
    };
    const delegate = async (capabilities: string[], resourceScope = {}) => {
      const id = randomUUID();
      await pool.query(
        `insert into public.channel_delegations (id,account_id,agent_key,capabilities,resource_scope,status)
         values ($1,$2,'fixture-agent',$3,$4,'active')`,
        [id, account, capabilities, resourceScope],
      );
      return { key: 'fixture-agent', delegationId: id };
    };

    it('records refusals after rollback, chains every record and detects tampering', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.audit-chain.v1';
      await platform.executeAccountCommand(commandFor(scope, capability));
      await platform.executeAccountCommand(commandFor(scope, capability));
      await expect(
        platform.executeAccountCommand(commandFor(scope, capability, otherClassroom)),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const denial = await pool.query(
        'select channel from public.api_command_denials where account_id=$1 and capability=$2',
        [account, capability],
      );
      expect(denial.rows).toEqual([{ channel: 'app' }]);
      // A bond that isn't this account's is refused before any command starts.
      await expect(
        platform.security.issueSnapshot(scope.identity, randomUUID(), signal),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const early = await pool.query(
        `select 1 from public.api_command_denials where account_id=$1 and capability='authority.refreshSnapshot'`,
        [account],
      );
      expect(early.rows.length).toBeGreaterThan(0);

      const verify = async (table: string) =>
        (
          await pool.query<{ broken: string | null }>(
            'select public.api_audit_verify($1::regclass,$2) as broken',
            [table, account],
          )
        ).rows[0]?.broken;
      expect(await verify('public.api_command_audit')).toBeNull();
      expect(await verify('public.api_command_denials')).toBeNull();
      await expect(
        pool.query('update public.api_command_audit set capability=$1 where account_id=$2', [
          'forged',
          account,
        ]),
      ).rejects.toMatchObject({ code: '42501' });
      await expect(
        pool.query('delete from public.api_command_audit where account_id=$1', [account]),
      ).rejects.toMatchObject({ code: '42501' });

      await pool.query('alter table public.api_command_audit disable trigger api_audit_no_change');
      try {
        const target = await pool.query<{ operation_id: string }>(
          'select operation_id from public.api_command_audit where account_id=$1 order by chain_sequence limit 1',
          [account],
        );
        await pool.query('update public.api_command_audit set resource_id=$1 where operation_id=$2', [
          'forged',
          target.rows[0]?.operation_id,
        ]);
        expect(await verify('public.api_command_audit')).toBe('1');
        await pool.query(
          'delete from public.api_command_audit where account_id=$1 and chain_sequence=1',
          [account],
        );
        expect(await verify('public.api_command_audit')).toBe('1');
      } finally {
        await pool.query('alter table public.api_command_audit enable trigger api_audit_no_change');
      }
    });

    it('commits a sensitive read with its record, and reads nothing without one', async () => {
      const { platform, scope } = await setup();
      const read = (reason: string) =>
        platform.readSensitive({
          scope,
          capability: 'fixture.sensitive-read.v1',
          resource: { type: 'Classroom', id: classroom },
          reason,
          signal,
          read: async (client) =>
            (await client.query('select id from public.api_platform_test_records')).rows.length,
        });
      await expect(read('fixture review')).resolves.toBeGreaterThan(0);
      const written = await pool.query(
        `select reason,channel from public.api_sensitive_reads where account_id=$1`,
        [account],
      );
      expect(written.rows).toContainEqual({ reason: 'fixture review', channel: 'app' });
      await expect(read('')).rejects.toMatchObject({ code: '23514' });
      await pool.query('alter table public.api_sensitive_reads rename to api_sensitive_reads_off');
      try {
        await expect(read('no audit storage')).rejects.toMatchObject({ code: '42P01' });
      } finally {
        await pool.query('alter table public.api_sensitive_reads_off rename to api_sensitive_reads');
      }
    });

    // The same scenarios on every admitted way in: this is what keeps channels from drifting.
    it.each([
      { name: 'app', mcp: false },
      { name: 'mcp agent', mcp: true },
    ])('commits, replays and refuses identically through $name', async ({ mcp }) => {
      const { platform, scope } = await setup();
      const capability = `fixture.conformance.${mcp ? 'mcp' : 'app'}.v1`;
      const agent = mcp ? await delegate([capability]) : undefined;
      const caller = mcp
        ? { channel: 'mcp' as const, agent, assurance: 'session' as const }
        : undefined;
      const open = { caller, channels: ['app', 'mcp'] as const };
      const command = { ...commandFor(scope, capability), ...open };

      const first = await platform.executeAccountCommand(command);
      const replay = await platform.executeAccountCommand(command);
      expect(replay).toMatchObject({ operationId: first.operationId, replayed: true });
      const audit = await pool.query(
        'select channel,agent_key,grant_id from public.api_command_audit where operation_id=$1',
        [first.operationId],
      );
      expect(audit.rows).toEqual([
        {
          channel: mcp ? 'mcp' : 'app',
          agent_key: agent?.key ?? null,
          grant_id: agent?.delegationId ?? null,
        },
      ]);
      await expect(
        platform.executeAccountCommand({
          ...commandFor(scope, capability, otherClassroom),
          ...open,
        }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      await expect(
        platform.executeAccountCommand({
          ...commandFor(scope, capability),
          ...open,
          assurance: 'fresh-person',
        }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('narrows an agent to its live grant, and revoking applies to the next action', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.delegation.v1';
      const run = (agent: { key: string; delegationId: string }, target = classroom) =>
        platform.executeAccountCommand({
          ...commandFor(scope, capability, target),
          caller: { channel: 'mcp', agent, assurance: 'session' },
          channels: ['mcp'],
        });
      const forbidden = { code: 'FORBIDDEN' };

      const agent = await delegate([capability]);
      await expect(run(agent)).resolves.toMatchObject({ replayed: false });
      // Closed channel, wrong capability, wrong agent, other resource.
      await expect(
        platform.executeAccountCommand({
          ...commandFor(scope, capability),
          caller: { channel: 'mcp', agent, assurance: 'session' },
        }),
      ).rejects.toMatchObject(forbidden);
      await expect(run(await delegate(['fixture.other.v1']))).rejects.toMatchObject(forbidden);
      await expect(run({ ...agent, key: 'other-agent' })).rejects.toMatchObject(forbidden);
      await expect(
        run(await delegate([capability], { type: 'Classroom', id: randomUUID() })),
      ).rejects.toMatchObject(forbidden);
      await expect(
        run(await delegate([capability], { type: 'Classroom', id: classroom })),
      ).resolves.toMatchObject({ replayed: false });
      // The grant can't reach past the person's own authority.
      await expect(run(agent, otherClassroom)).rejects.toMatchObject(forbidden);

      await pool.query(
        `update public.channel_delegations set status='revoked', revoked_at=now() where id=$1`,
        [agent.delegationId],
      );
      await expect(run(agent)).rejects.toMatchObject(forbidden);
      const expired = await delegate([capability]);
      await pool.query(
        `update public.channel_delegations set expires_at=now()-interval '1 second' where id=$1`,
        [expired.delegationId],
      );
      await expect(run(expired)).rejects.toMatchObject(forbidden);
    });

    it('never lets an ephemeral run pass a command', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.ephemeral.v1';
      const runId = randomUUID();
      await expect(
        platform.executeAccountCommand({
          ...commandFor(scope, capability),
          caller: { channel: 'worker', runId, assurance: 'session' },
          channels: ['worker'],
        }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
      const denial = await pool.query(
        'select channel,run_id from public.api_command_denials where account_id=$1 and capability=$2',
        [account, capability],
      );
      expect(denial.rows).toEqual([{ channel: 'worker', run_id: runId }]);
    });

    it('checks versions, keeps one correction line, and restores within the window', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.records.v1';
      const lifecycle = (work: Parameters<Platform['executeAccountCommand']>[0]['lifecycle']) =>
        platform.executeAccountCommand({ ...commandFor(scope, capability), lifecycle: work });
      const record = { type: 'fixture.grade', id: randomUUID() };
      const conflict = { code: 'CONFLICT' };

      await lifecycle(async ({ records }) => void (await records.advanceVersion(record, 0)));
      await lifecycle(async ({ records }) => void (await records.advanceVersion(record, 1)));
      await expect(
        lifecycle(async ({ records }) => void (await records.advanceVersion(record, 1))),
      ).rejects.toMatchObject(conflict);

      const correct = (reason: string) =>
        lifecycle(async ({ records }) => {
          await records.correct(record, { supersedes: null, reason });
        });
      const outcomes = await Promise.allSettled([correct('first'), correct('second')]);
      expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
      await expect(correct('third')).rejects.toMatchObject(conflict);

      const deletion = { ownerAccountId: account, reason: 'fixture', restoreUntil: null };
      await lifecycle(async ({ records }) => records.softDelete(record, deletion));
      await expect(
        lifecycle(async ({ records }) => records.softDelete(record, deletion)),
      ).rejects.toMatchObject(conflict);
      await lifecycle(async ({ records }) => records.restore(record));
      await expect(
        lifecycle(async ({ records }) => records.restore(record)),
      ).rejects.toMatchObject(conflict);

      const expired = { type: 'fixture.grade', id: randomUUID() };
      await lifecycle(async ({ records }) =>
        records.softDelete(expired, { ...deletion, restoreUntil: new Date(Date.now() - 1000) }),
      );
      await expect(
        lifecycle(async ({ records }) => records.restore(expired)),
      ).rejects.toMatchObject(conflict);
    });

    it('lets a hold win over deletion and purge, and keeps the tombstone', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.holds.v1';
      const recordType = `fixture.purge.${randomUUID()}`;
      const lifecycle = (work: Parameters<Platform['executeAccountCommand']>[0]['lifecycle']) =>
        platform.executeAccountCommand({ ...commandFor(scope, capability), lifecycle: work });
      const past = new Date(Date.now() - 1000);
      const remove = (id: string, restoreUntil: Date | null) =>
        lifecycle(async ({ records }) =>
          records.softDelete(
            { type: recordType, id },
            { ownerAccountId: account, reason: 'fixture', restoreUntil },
          ),
        );
      const [free, held, undecided, blocked] = [
        randomUUID(),
        randomUUID(),
        randomUUID(),
        randomUUID(),
      ] as [string, string, string, string];
      await remove(free, past);
      await remove(held, past);
      await remove(undecided, null);

      let holdId = '';
      await lifecycle(async ({ records }) => {
        holdId = await records.placeHold({ type: recordType, id: held }, 'dispute');
        await records.placeHold({ type: recordType, id: blocked }, 'dispute');
      });
      await expect(remove(blocked, null)).rejects.toMatchObject({ code: 'CONFLICT' });

      const purged: string[] = [];
      const purge = async (_client: unknown, id: string) => void purged.push(id);
      await expect(platform.purgeExpired(recordType, 10, purge)).resolves.toEqual([free]);
      expect(purged).toEqual([free]);
      const tombstone = await pool.query(
        'select purged_at from public.record_tombstones where record_type=$1 and record_id=$2',
        [recordType, free],
      );
      expect(tombstone.rows[0]?.purged_at).toBeInstanceOf(Date);

      await lifecycle(async ({ records }) => records.liftHold(holdId));
      await expect(platform.purgeExpired(recordType, 10, purge)).resolves.toEqual([held]);
      // No period was decided, so it is never purged.
      await expect(platform.purgeExpired(recordType, 10, purge)).resolves.toEqual([]);
    });

    it('shares by live grant only, and only the grantor revokes', async () => {
      const { platform, scope } = await setup();
      const capability = 'fixture.grants.v1';
      const lifecycle = (work: Parameters<Platform['executeAccountCommand']>[0]['lifecycle']) =>
        platform.executeAccountCommand({ ...commandFor(scope, capability), lifecycle: work });
      const record = { type: 'fixture.note', id: randomUUID() };
      let accountGrant = '';
      await lifecycle(async ({ grants }) => {
        accountGrant = await grants.give(record, {
          audience: { type: 'account', id: otherAccount },
          actions: ['read'],
          purpose: 'fixture',
          expiresAt: null,
        });
        await grants.give(record, {
          audience: { type: 'entity', id: school },
          actions: ['read'],
          purpose: 'fixture',
          expiresAt: new Date(Date.now() - 1000),
        });
      });
      const { isGranted } = await import('./consent/grants');
      const check = async (action: string, accountId: string, entityIds: string[]) => {
        const client = await pool.connect();
        try {
          return await isGranted(client, record, action, { accountId, entityIds });
        } finally {
          client.release();
        }
      };
      expect(await check('read', otherAccount, [])).toBe(true);
      expect(await check('write', otherAccount, [])).toBe(false);
      expect(await check('read', account, [])).toBe(false);
      // That entity's grant has expired.
      expect(await check('read', account, [school])).toBe(false);

      const otherIdentity = await platform.security.authenticate(`Bearer ${otherToken}`, signal);
      const foreign = await pool.connect();
      try {
        const { sharingGrants } = await import('./consent/grants');
        await expect(sharingGrants(foreign, otherIdentity.accountId).revoke(accountGrant)).rejects.toMatchObject({
          code: 'FORBIDDEN',
        });
      } finally {
        foreign.release();
      }
      await lifecycle(async ({ grants }) => grants.revoke(accountGrant));
      expect(await check('read', otherAccount, [])).toBe(false);
    });
  });
});
