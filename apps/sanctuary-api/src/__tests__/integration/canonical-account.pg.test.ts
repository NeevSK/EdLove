import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { CredentialUnlinkReceiptSchema } from '@repo/core/api/credentialUnlink';
import { PasswordChangeReceiptSchema } from '@repo/core/api/passwordChange';
import { isEdloveAccountId } from '@repo/core/logic/utils/edloveUuidV8';
import { createZenStackDb, queryDatabaseRows } from '@repo/database/client';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildIdentityBootstrap } from '../../core/activeScope';
import { app } from '../../core/app';
import { resolveAuthenticatedAccount } from '../../core/authenticatedAccount';
import { parseORPCContext } from '../../core/router';

const databaseUrl = process.env.CANONICAL_ACCOUNT_TEST_DATABASE_URL;
if (!databaseUrl)
  throw new Error(
    'CANONICAL_ACCOUNT_TEST_DATABASE_URL is required; no database substitution is permitted',
  );
const target = new URL(databaseUrl);
const freshRehearsal =
  target.port === '54329' &&
  target.pathname === '/postgres' &&
  target.searchParams.get('options') === '-c edlove.rehearsal_tag=20261025';
if (
  !['localhost', '127.0.0.1'].includes(target.hostname) ||
  (!target.pathname.includes('test') && !freshRehearsal)
) {
  throw new Error('Canonical account integration requires a local isolated test database');
}
const subject = 'f0310000-0000-4000-8000-000000000001';
const issuer = 'https://canonical-identity.example.invalid/auth/v1';
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const environment = {
  NODE_ENV: 'production',
  DATABASE_URL: databaseUrl,
  SUPABASE_JWT_ISSUER: issuer,
  SUPABASE_JWT_AUDIENCE: 'authenticated',
  SUPABASE_JWT_PUBLIC_KEY: keys.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  SUPABASE_URL: 'https://canonical-identity.example.invalid',
  SUPABASE_ANON_KEY: 'synthetic-provider-key',
};
const providerSessions = new Map<string, string>();
let providerPasswordChanges = 0;
const googleIdentityId = 'f0560000-0000-4000-8000-000000000002';
const emailIdentityId = 'f0560000-0000-4000-8000-000000000003';
let providerGoogleLinked = true;
let providerIdentityUnlinks = 0;

function token(authSubject: string, totpAt?: number) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', kid: 'canonical-integration' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: authSubject,
      ...(totpAt === undefined
        ? {}
        : { aal: 'aal2', is_anonymous: false, amr: [{ method: 'totp', timestamp: totpAt }] }),
      session_id: 'f0360000-0000-4000-8000-000000000001',
      iss: issuer,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 120,
    }),
  ).toString('base64url');
  const body = `${header}.${payload}`;
  const signed = `${body}.${sign('sha256', Buffer.from(body), keys.privateKey).toString('base64url')}`;
  providerSessions.set(signed, authSubject);
  return signed;
}

describe('canonical identity / real PostgreSQL and API, synthetic signed issuer', () => {
  beforeAll(async () => {
    if (freshRehearsal) {
      const marker = await queryDatabaseRows<{ tag: string }>(
        "select current_setting('edlove.rehearsal_tag',true) as tag",
        [],
        databaseUrl,
      );
      expect(marker[0]?.tag).toBe('20261025');
    }
    // The issuer remains synthetic; domain SQL and HTTP routing are real.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const unlink =
        String(input) ===
          `${environment.SUPABASE_URL}/auth/v1/user/identities/${googleIdentityId}` &&
        init?.method === 'DELETE';
      if (String(input) !== `${environment.SUPABASE_URL}/auth/v1/user` && !unlink) {
        throw new Error('Unexpected external provider boundary');
      }
      const authorization = new Headers(init?.headers).get('Authorization') ?? '';
      const id = providerSessions.get(authorization.replace('Bearer ', ''));
      if (id && unlink) {
        providerGoogleLinked = false;
        providerIdentityUnlinks += 1;
        return new Response(null, { status: 204 });
      }
      if (id && init?.method === 'PUT') providerPasswordChanges += 1;
      return id
        ? Response.json({
            id,
            is_anonymous: false,
            email_confirmed_at: '2026-10-25T00:00:00Z',
            identities: [
              { identity_id: emailIdentityId, user_id: id, provider: 'email' },
              ...(providerGoogleLinked
                ? [{ identity_id: googleIdentityId, user_id: id, provider: 'google' }]
                : []),
            ],
            factors: [
              {
                id: 'f0560000-0000-4000-8000-000000000001',
                factor_type: 'totp',
                status: 'verified',
              },
            ],
          })
        : new Response(null, { status: 403 });
    });
    const rows = await queryDatabaseRows<{ present: boolean }>(
      "select exists(select 1 from pg_constraint where conname='users_canonical_edlove_account_id') as present",
      [],
      databaseUrl,
    );
    expect(rows[0]?.present).toBe(true);
  });
  afterAll(() => vi.restoreAllMocks());

  it('enforces recent MFA and persists password receipts through real Hono/PostgreSQL with synthetic issuer/provider', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const changesBefore = providerPasswordChanges;
    const response = await app.request(
      '/api/auth/credentials/password',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token(subject, Math.floor(Date.now() / 1000) - 10)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'synthetic-password-change' }),
      },
      environment,
    );
    expect(response.status).toBe(200);
    const receipt = PasswordChangeReceiptSchema.parse(await response.json());
    expect(receipt.accountId).toBe(account.id);
    expect(providerPasswordChanges).toBe(changesBefore + 1);
    const events = await queryDatabaseRows<{
      action: string;
      event_source: string;
      metadata: { credential_class: string };
    }>(
      "SELECT action,event_source,metadata FROM public.security_audit_logs WHERE account_id=$1::uuid AND metadata->>'operation_id'=$2 ORDER BY action",
      [account.id, receipt.operationId],
      databaseUrl,
    );
    expect(events.map((event) => event.action)).toEqual([
      'AUTH_PASSWORD_CHANGE_CONFIRMED',
      'AUTH_PASSWORD_CHANGE_STARTED',
    ]);
    expect(
      events.every(
        (event) =>
          event.event_source === 'server_observed' &&
          event.metadata.credential_class === 'password',
      ),
    ).toBe(true);
    expect(JSON.stringify(events)).not.toContain('synthetic-password-change');
    const denied = await app.request(
      '/api/auth/credentials/password',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token(subject, Math.floor(Date.now() / 1000) - 301)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'synthetic-password-change' }),
      },
      environment,
    );
    expect(denied.status).toBe(403);
    expect(providerPasswordChanges).toBe(changesBefore + 1);
  });

  it('persists unlink receipt phases without removing the canonical issuer/account binding', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const before = providerIdentityUnlinks;
    providerGoogleLinked = true;
    try {
      const response = await app.request(
        '/api/auth/credentials/identities/unlink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token(subject, Math.floor(Date.now() / 1000) - 10)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ identityId: googleIdentityId }),
        },
        environment,
      );
      expect(response.status).toBe(200);
      const receipt = CredentialUnlinkReceiptSchema.parse(await response.json());
      expect(receipt.accountId).toBe(account.id);
      expect(providerIdentityUnlinks).toBe(before + 1);
      const events = await queryDatabaseRows<{
        action: string;
        event_source: string;
        metadata: { credential_class: string };
      }>(
        "SELECT action,event_source,metadata FROM public.security_audit_logs WHERE account_id=$1::uuid AND metadata->>'operation_id'=$2 ORDER BY action",
        [account.id, receipt.operationId],
        databaseUrl,
      );
      expect(events.map((event) => event.action)).toEqual([
        'AUTH_IDENTITY_UNLINK_CONFIRMED',
        'AUTH_IDENTITY_UNLINK_STARTED',
      ]);
      expect(
        events.every(
          (event) =>
            event.event_source === 'server_observed' &&
            event.metadata.credential_class === 'oauth_identity',
        ),
      ).toBe(true);
      expect((await resolveAuthenticatedAccount(subject, databaseUrl)).id).toBe(account.id);
    } finally {
      providerGoogleLinked = true;
    }
  });

  it('resolves a real provider binding to a different canonical UUIDv8', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    expect(isEdloveAccountId(account.id)).toBe(true);
    expect(account.id).not.toBe(subject);
  });

  it('returns that canonical identity through the actual production-mode HTTP router', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const profile = await createZenStackDb(account, databaseUrl).user.findUnique({
      where: { id: account.id },
      include: { bonds: true },
    });
    expect(profile?.id).toBe(account.id);
    const context = await parseORPCContext(
      new Request('https://api.example.invalid/api/openapi/identity/resolveIdentity', {
        headers: { Authorization: `Bearer ${token(subject)}` },
      }),
      environment,
      'canonical-real-context',
    );
    expect(context.principal.id).toBe(account.id);
    const bootstrap = buildIdentityBootstrap(profile, profile?.bonds, null);
    expect(bootstrap.id).toBe(account.id);
    const response = await app.request(
      '/api/openapi/identity/resolveIdentity',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token(subject)}` },
      },
      environment,
    );
    expect(response.status).toBe(200);
    const payload: unknown = await response.json();
    expect(payload).toMatchObject({ id: account.id, scopeBootstrap: { userId: account.id } });
  });

  it('rejects a valid issuer token for an unbound subject', async () => {
    const response = await app.request(
      '/api/openapi/identity/resolveIdentity',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token('f0310000-0000-4000-8000-000000000099')}` },
      },
      environment,
    );
    expect(response.status).toBe(401);
  });

  it('denies revoked provider sessions after a successful authenticated request', async () => {
    const signed = token(subject);
    const request = () =>
      app.request(
        '/api/openapi/identity/resolveIdentity',
        {
          headers: { Authorization: `Bearer ${signed}` },
        },
        environment,
      );
    expect((await request()).status).toBe(200);
    providerSessions.delete(signed);
    expect((await request()).status).toBe(401);
    await expect(
      parseORPCContext(
        new Request('https://api.example.invalid/api/identity/resolveIdentity', {
          headers: { Authorization: `Bearer ${signed}` },
        }),
        environment,
        'revoked-session',
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('settles profile completion for the mapped account without changing lifecycle or pricing', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const original = await db.user.findUniqueOrThrow({ where: { id: account.id } });
    const headers = {
      Authorization: `Bearer ${token(subject)}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await app.request(
        '/api/onboarding/completeProfile',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            json: {
              body: {
                display_name: 'Profile completion fixture',
                capacity_label: 'Physics teacher',
              },
            },
          }),
        },
        environment,
      );
      expect(response.status).toBe(200);
      const updated = await db.user.findUniqueOrThrow({ where: { id: account.id } });
      expect(updated).toMatchObject({
        id: account.id,
        display_name: 'Profile completion fixture',
        capacity_label: 'Physics teacher',
        profile_completed: true,
        onboarding_completed: original.onboarding_completed,
        identity_state: original.identity_state,
        pricing_tier: original.pricing_tier,
        citizenship: original.citizenship,
      });
      const rejected = await app.request(
        '/api/onboarding/completeProfile',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            json: {
              body: {
                display_name: 'Forged profile',
                pricing_tier: 'PRO',
                onboarding_completed: true,
              },
            },
          }),
        },
        environment,
      );
      expect(rejected.status).toBe(400);
      const retained = await db.user.findUniqueOrThrow({ where: { id: account.id } });
      expect(retained.display_name).toBe('Profile completion fixture');
      expect(retained.pricing_tier).toBe(original.pricing_tier);
    } finally {
      await db.user.update({
        where: { id: account.id },
        data: {
          display_name: original.display_name,
          full_name: original.full_name,
          capacity_label: original.capacity_label,
          profile_completed: original.profile_completed,
        },
      });
    }
  });

  it('uses the database UUIDv8 default through the real generated ORM and rolls back the scenario', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const rollback = new Error('canonical-integration-rollback');
    await expect(
      db.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { full_name: 'Canonical ORM fixture', subjects_taught: [], qualifications: [] },
        });
        expect(isEdloveAccountId(created.id)).toBe(true);
        throw rollback;
      }),
    ).rejects.toBe(rollback);
  });

  it('runs profile, initial scope, onboarding and profile mutation through actual RPC and PostgreSQL', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const original = await db.user.findUniqueOrThrow({ where: { id: account.id } });
    const preferences = await db.userPreferences.findUnique({ where: { user_id: account.id } });
    const bonds = await db.bond.findMany({ where: { user_id: account.id }, select: { id: true } });
    const classrooms = await db.personalClassroom.findMany({
      where: { user_id: account.id },
      select: { id: true },
    });
    const post = (procedure: string, body: Record<string, unknown>) =>
      app.request(
        `/api/${procedure}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token(subject)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ json: { body } }),
        },
        environment,
      );
    try {
      const scope = await post('onboarding/createInitialBond', {
        orientation: 'teacher',
        confirmCapacityChange: false,
        context: { displayName: 'Stateful profile fixture' },
      });
      expect(scope.status).toBe(200);
      expect(
        (await post('onboarding/completeProfile', { display_name: 'Stateful profile fixture' }))
          .status,
      ).toBe(200);
      expect((await post('onboarding/completeOnboarding', {})).status).toBe(200);
      const ready = await db.user.findUniqueOrThrow({ where: { id: account.id } });
      expect(ready).toMatchObject({
        id: account.id,
        profile_completed: true,
        onboarding_completed: true,
      });
      const response = await app.request(
        '/api/profile/updateProfile',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token(subject)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            json: { params: { id: account.id }, body: { bio: 'Stateful profile update' } },
          }),
        },
        environment,
      );
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(JSON.stringify(payload)).not.toContain('escrowed_recovery_key');
      expect((await db.user.findUniqueOrThrow({ where: { id: account.id } })).bio).toBe(
        'Stateful profile update',
      );
    } finally {
      if (preferences) {
        await db.userPreferences.update({
          where: { user_id: account.id },
          data: { active_bond_id: preferences.active_bond_id },
        });
      } else {
        await db.userPreferences.deleteMany({ where: { user_id: account.id } });
      }
      await db.bond.deleteMany({
        where: { user_id: account.id, id: { notIn: bonds.map((bond) => bond.id) } },
      });
      await db.personalClassroom.deleteMany({
        where: { user_id: account.id, id: { notIn: classrooms.map((classroom) => classroom.id) } },
      });
      await db.user.update({
        where: { id: original.id },
        data: {
          display_name: original.display_name,
          full_name: original.full_name,
          first_name: original.first_name,
          last_name: original.last_name,
          username: original.username,
          identity_state: original.identity_state,
          citizenship: original.citizenship,
          capacity: original.capacity,
          profile_completed: original.profile_completed,
          capacity_label: original.capacity_label,
          bio: original.bio,
          onboarding_completed: original.onboarding_completed,
          onboarding_completed_at: original.onboarding_completed_at,
          updated_at: original.updated_at,
        },
      });
    }
  });

  it('settles concurrent first onboarding requests into one workspace and one personal bond', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const freshSubject = randomUUID();
    const fresh = await db.user.create({
      data: { full_name: 'Concurrent onboarding fixture', subjects_taught: [], qualifications: [] },
    });
    try {
      await queryDatabaseRows(
        "insert into public.auth_identities (user_id, provider, provider_user_id) values ($1::uuid, 'supabase', $2) returning id",
        [fresh.id, freshSubject],
        databaseUrl,
      );
      const responses = await Promise.all(
        Array.from({ length: 8 }, () =>
          app.request(
            '/api/onboarding/createInitialBond',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token(freshSubject)}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                json: {
                  body: {
                    orientation: 'teacher',
                    confirmCapacityChange: false,
                    context: { displayName: 'Concurrent onboarding fixture' },
                  },
                },
              }),
            },
            environment,
          ),
        ),
      );
      expect(responses.map((response) => response.status)).toEqual(Array(8).fill(200));
      const classrooms = await db.personalClassroom.findMany({ where: { user_id: fresh.id } });
      const bonds = await db.bond.findMany({
        where: { user_id: fresh.id, entity_type: 'PERSONAL_CLASSROOM' },
      });
      expect(classrooms).toHaveLength(1);
      expect(bonds).toHaveLength(1);
      expect(bonds[0]?.entity_id).toBe(classrooms[0]?.id);
      expect(
        (await db.userPreferences.findUniqueOrThrow({ where: { user_id: fresh.id } }))
          .active_bond_id,
      ).toBe(bonds[0]?.id);
      await db.user.update({ where: { id: fresh.id }, data: { deleted_at: new Date() } });
      const afterDeletion = await app.request(
        '/api/openapi/identity/resolveIdentity',
        { headers: { Authorization: `Bearer ${token(freshSubject)}` } },
        environment,
      );
      expect(afterDeletion.status).toBe(401);
    } finally {
      await db.userPreferences.deleteMany({ where: { user_id: fresh.id } });
      await db.bond.deleteMany({ where: { user_id: fresh.id } });
      await db.personalClassroom.deleteMany({ where: { user_id: fresh.id } });
      // Account deletion preserves audit history; physical deletion conflicts with its history trigger.
      await db.user.update({ where: { id: fresh.id }, data: { deleted_at: new Date() } });
      await queryDatabaseRows(
        'delete from public.auth_identities where user_id=$1::uuid returning id',
        [fresh.id],
        databaseUrl,
      );
    }
  });

  it('denies direct authenticated account updates at the PostgreSQL grant boundary', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    await expect(
      db.$transaction(async (tx) => {
        await tx.$executeRaw`SET LOCAL ROLE authenticated`;
        await tx.$executeRaw`UPDATE public.users SET pricing_tier = 'PRO' WHERE id = ${account.id}::uuid`;
      }),
    ).rejects.toMatchObject({ dbErrorCode: '42501' });
    const privileges = await queryDatabaseRows<{ role: string; writable: boolean }>(
      `select role, has_any_column_privilege(role, 'public.users', 'INSERT,UPDATE')
        or has_table_privilege(role, 'public.users', 'INSERT,UPDATE,DELETE') as writable
        from (values ('anon'), ('authenticated')) roles(role)`,
      [],
      databaseUrl,
    );
    expect(privileges).toEqual([
      { role: 'anon', writable: false },
      { role: 'authenticated', writable: false },
    ]);
  });

  it('propagates account soft deletion to profile facets and preferences atomically', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const rollback = new Error('soft-delete-fixture-rollback');
    await expect(
      db.$transaction(async (tx) => {
        await tx.user.update({ where: { id: account.id }, data: { capacity: 'teacher' } });
        const facets = await tx.$queryRaw<Array<{ count: number }>>`
          SELECT count(*)::integer AS count FROM public.teacher_profiles WHERE user_id=${account.id}::uuid
        `;
        expect(facets[0]?.count).toBe(1);
        expect(await tx.userPreferences.count({ where: { user_id: account.id } })).toBe(1);
        await tx.user.update({ where: { id: account.id }, data: { deleted_at: new Date() } });
        const rows = await tx.$queryRaw<Array<{ retained: boolean }>>`
          SELECT NOT EXISTS (
            SELECT 1 FROM public.teacher_profiles WHERE user_id=${account.id}::uuid AND deleted_at IS NULL
          ) AND NOT EXISTS (
            SELECT 1 FROM public.user_preferences WHERE user_id=${account.id}::uuid AND deleted_at IS NULL
          ) AS retained
        `;
        expect(rows[0]?.retained).toBe(true);
        throw rollback;
      }),
    ).rejects.toBe(rollback);
    expect((await db.user.findUniqueOrThrow({ where: { id: account.id } })).deleted_at).toBeNull();
  });

  it('issues unique canonical IDs through concurrent real database transactions', async () => {
    const startedAt = performance.now();
    const rows = await Promise.all(
      Array.from({ length: 100 }, () =>
        queryDatabaseRows<{ id: string }>(
          'select public.new_edlove_account_id()::text as id',
          [],
          databaseUrl,
        ),
      ),
    );
    const ids = rows.map((result) => result[0]?.id);
    expect(ids.every((id) => typeof id === 'string' && isEdloveAccountId(id))).toBe(true);
    expect(new Set(ids).size).toBe(100);
    expect(ids.every((id) => id?.slice(19, 21) === '81')).toBe(true);
    console.info(
      `Canonical issuer: 100 concurrent local transactions in ${Math.round(performance.now() - startedAt)}ms`,
    );
  });

  it('fails within the issuer lock timeout when another transaction retains its clock', async () => {
    const account = await resolveAuthenticatedAccount(subject, databaseUrl);
    const db = createZenStackDb(account, databaseUrl);
    const acquired = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    const holder = db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT singleton FROM private.edlove_account_clock WHERE singleton FOR UPDATE`;
      acquired.resolve();
      await release.promise;
    });
    // Propagate setup failure instead of hanging while waiting for its signal.
    await Promise.race([acquired.promise, holder]);
    const startedAt = performance.now();
    try {
      await expect(
        queryDatabaseRows('select public.new_edlove_account_id()', [], databaseUrl),
      ).rejects.toMatchObject({ code: '55P03' });
      const elapsed = performance.now() - startedAt;
      expect(elapsed).toBeGreaterThanOrEqual(4500);
      expect(elapsed).toBeLessThan(10000);
    } finally {
      release.resolve();
      await holder;
    }
  });
});
