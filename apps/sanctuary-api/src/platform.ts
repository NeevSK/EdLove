import { randomUUID } from 'node:crypto';
import { ORPCError } from '@orpc/server';
import { check } from '@repo/policies';
import { Pool, type PoolClient } from 'pg';
import type { ServerConfig } from './config';
import {
  type EffectInput,
  type OperationJSON,
  OperationStore,
  prepareEffect,
  validateOperationJSON,
} from './operations/store';
import { assertDelegation, type SharingGrants, sharingGrants } from './consent/grants';
import { purgeExpiredRecords, type RecordLifecycle, recordLifecycle } from './records/records';
import {
  APP_CALLER,
  type ActiveScope,
  type AuthenticatedIdentity,
  assertCommandAuthority,
  authorizeCommand,
  type Caller,
  type ChannelName,
  type CommandAuthority,
  createSecurity,
  type SecurityOptions,
} from './security/security';
import { createSyncGrants } from './security/syncGrant';

export function createPlatform(
  config: ServerConfig,
  options: Pick<SecurityOptions, 'jwksFetch'> = {},
) {
  if (config.API_AUTHENTICATION !== 'required') return undefined;
  if (!config.DATABASE_URL || !config.AUTH_ISSUER || !config.AUTH_JWKS_URL || !config.AUTH_AUDIENCE)
    throw new Error('Incomplete authority configuration');
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
    connectionTimeoutMillis: config.DB_CONNECT_TIMEOUT_MS,
    idleTimeoutMillis: 30000,
    statement_timeout: config.DB_STATEMENT_TIMEOUT_MS,
    lock_timeout: config.DB_LOCK_TIMEOUT_MS,
    idle_in_transaction_session_timeout: config.DB_IDLE_TRANSACTION_TIMEOUT_MS,
    application_name: 'gurudevi-api-v1',
  });
  pool.on('error', () => {
    console.error({ event: 'api.database.connection_failed' });
  });
  const security = createSecurity({
    pool,
    issuer: config.AUTH_ISSUER,
    audience: config.AUTH_AUDIENCE,
    jwksUrl: config.AUTH_JWKS_URL,
    algorithms: ['ES256', 'RS256'],
    jwksFetch: options.jwksFetch,
    snapshotSigningKey: config.SNAPSHOT_SIGNING_PRIVATE_KEY,
    statementTimeoutMs: config.DB_STATEMENT_TIMEOUT_MS,
    lockTimeoutMs: config.DB_LOCK_TIMEOUT_MS,
    idleTransactionTimeoutMs: config.DB_IDLE_TRANSACTION_TIMEOUT_MS,
  });
  const syncGrants =
    config.POWERSYNC_URL && config.POWERSYNC_SIGNING_JWK
      ? createSyncGrants({ endpoint: config.POWERSYNC_URL, signingJwk: config.POWERSYNC_SIGNING_JWK })
      : undefined;
  const operations = new OperationStore(pool, {
    statementTimeoutMs: config.DB_STATEMENT_TIMEOUT_MS,
    lockTimeoutMs: config.DB_LOCK_TIMEOUT_MS,
    idleTransactionTimeoutMs: config.DB_IDLE_TRANSACTION_TIMEOUT_MS,
  });
  let readinessInFlight: Promise<boolean> | undefined;
  let readinessDeadline: AbortSignal | undefined;
  let closing = false;
  async function runReadinessProbe(deadline: AbortSignal) {
    // Retain ownership until every underlying task settles: pg queries cannot be
    // cancelled merely by aborting the HTTP request or racing the deadline.
    const results = await Promise.allSettled([
      (async () => {
        const result = await pool.query<{ ready: boolean }>(
          `
              select
                to_regclass('public.auth_identities') is not null
                and to_regclass('auth.sessions') is not null
                and to_regclass('public.bonds') is not null
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='operation_receipts' and column_name='scope')
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='external_effect_intents' and column_name='max_attempts')
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='api_request_budgets' and column_name='used' and data_type='integer')
                and to_regclass('public.permission_snapshots') is not null
                and to_regclass('public.policy_version') is not null
                and to_regclass('public.api_command_audit') is not null
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='api_command_audit' and column_name='channel')
                and to_regclass('public.api_command_denials') is not null
                and to_regclass('public.api_sensitive_reads') is not null
                and to_regprocedure('public.api_audit_verify(regclass,uuid)') is not null
                and to_regclass('public.record_tombstones') is not null
                and to_regclass('public.sharing_grants') is not null
                and to_regclass('public.channel_delegations') is not null
                and has_table_privilege(current_user,'public.api_sensitive_reads','INSERT')
                and not has_table_privilege('authenticated','public.api_sensitive_reads','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_table_privilege('authenticated','public.record_tombstones','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_table_privilege('authenticated','public.sharing_grants','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and has_table_privilege(current_user,'public.api_command_denials','INSERT')
                and (select relrowsecurity from pg_class where oid=to_regclass('public.api_command_denials'))
                and not has_table_privilege('service_role','public.api_command_denials','UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_table_privilege('anon','public.api_command_denials','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_table_privilege('authenticated','public.api_command_denials','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='api_command_audit' and column_name='resource_type')
                and exists(select 1 from information_schema.columns where table_schema='public' and table_name='api_command_audit' and column_name='resource_id')
                and has_table_privilege(current_user,'public.api_command_audit','INSERT')
                and (select relrowsecurity from pg_class where oid=to_regclass('public.api_command_audit'))
                and not has_table_privilege('service_role','public.api_command_audit','UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_any_column_privilege('service_role','public.api_command_audit','UPDATE,REFERENCES')
                and not has_table_privilege('service_role','public.api_command_audit','SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION')
                and not has_any_column_privilege('service_role','public.api_command_audit','SELECT WITH GRANT OPTION,INSERT WITH GRANT OPTION')
                and not has_table_privilege('anon','public.api_command_audit','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_any_column_privilege('anon','public.api_command_audit','SELECT,INSERT,UPDATE,REFERENCES')
                and not has_table_privilege('authenticated','public.api_command_audit','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
                and not has_any_column_privilege('authenticated','public.api_command_audit','SELECT,INSERT,UPDATE,REFERENCES')
                and has_table_privilege(current_user,'public.permission_snapshots','SELECT,INSERT,UPDATE')
                and has_table_privilege(current_user,'public.policy_version','SELECT,INSERT,UPDATE')
                and to_regprocedure('public.get_my_id()') is not null
                and pg_has_role(current_user,'authenticated','SET')
                and (select count(*)=3 from pg_class c join pg_namespace n on n.oid=c.relnamespace
                  where n.nspname='public' and c.relname in ('operation_receipts','external_effect_intents','api_request_budgets')
                    and c.relrowsecurity
                    and not exists(select 1 from (values('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(privilege)
                      where not has_table_privilege(current_user,c.oid,p.privilege))
                    and not has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE')
                    and not has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))
                and exists(select 1 from pg_constraint where conrelid=to_regclass('public.api_request_budgets') and contype='p'
                  and pg_get_constraintdef(oid)='PRIMARY KEY (account_id, window_start)')
                and exists(select 1 from pg_constraint where conrelid=to_regclass('public.operation_receipts') and contype='u'
                  and pg_get_constraintdef(oid)='UNIQUE (account_id, capability, idempotency_key)')
                as ready`,
        );
        if (result.rows[0]?.ready !== true) throw new Error('Required database contracts missing');
      })(),
      (async () => {
        const probe = check({
          principal: {
            type: 'principal',
            id: 'readiness-principal',
            attributes: {
              school_id: 'readiness-school',
              active_entity_id: 'readiness-school',
              active_entity_type: 'SCHOOL',
              capacity: 'principal',
            },
          },
          action: 'read',
          resource: {
            type: 'Classroom',
            id: 'readiness-classroom',
            attributes: { school_id: 'readiness-school' },
          },
        });
        if (!probe.permitted) throw new Error('Policy runtime self-check failed');
      })(),
      security.checkReadiness(deadline),
    ]);
    return (
      !deadline.aborted && !closing && results.every((result) => result.status === 'fulfilled')
    );
  }

  async function checkReadiness(signal: AbortSignal) {
    if (closing || signal.aborted) return false;
    if (!readinessInFlight) {
      readinessDeadline = AbortSignal.timeout(5000);
      readinessInFlight = runReadinessProbe(readinessDeadline).finally(() => {
        readinessInFlight = undefined;
        readinessDeadline = undefined;
      });
    }
    if (!readinessDeadline || readinessDeadline.aborted) return false;
    const deadline = AbortSignal.any([signal, readinessDeadline]);
    if (deadline.aborted) return false;
    let cancelWait = () => {};
    const aborted = new Promise<false>((resolve) => {
      cancelWait = () => resolve(false);
      deadline.addEventListener('abort', cancelWait, { once: true });
    });
    try {
      return (await Promise.race([readinessInFlight, aborted])) && !deadline.aborted && !closing;
    } finally {
      deadline.removeEventListener('abort', cancelWait);
    }
  }

  async function budgetTransaction(
    signal: AbortSignal,
    work: (client: PoolClient) => Promise<void>,
  ) {
    signal.throwIfAborted();
    let client: PoolClient | undefined;
    let broken = false;
    try {
      client = await pool.connect();
      signal.throwIfAborted();
      await client.query('begin');
      await client.query(
        `select set_config('statement_timeout',$1,true), set_config('lock_timeout',$2,true),
          set_config('idle_in_transaction_session_timeout',$3,true)`,
        [
          config.DB_STATEMENT_TIMEOUT_MS,
          config.DB_LOCK_TIMEOUT_MS,
          config.DB_IDLE_TRANSACTION_TIMEOUT_MS,
        ].map(String),
      );
      await work(client);
      signal.throwIfAborted();
      await client.query('commit');
      signal.throwIfAborted();
    } catch (error) {
      if (client) {
        try {
          await client.query('rollback');
        } catch {
          broken = true;
        }
      }
      signal.throwIfAborted();
      if (error instanceof ORPCError) throw error;
      throw new ORPCError('SERVICE_UNAVAILABLE');
    } finally {
      client?.release(broken);
    }
  }

  async function consumeBudget(identity: AuthenticatedIdentity, signal: AbortSignal) {
    return budgetTransaction(signal, async (client) => {
      const result = await client.query<{ used: number }>(
        `
        insert into public.api_request_budgets(account_id,window_start,used)
        values ($1,date_trunc('minute',clock_timestamp()),1)
        on conflict (account_id,window_start) do update
        set used=api_request_budgets.used+1 where api_request_budgets.used<$2
        returning used`,
        [identity.accountId, config.API_ACCOUNT_REQUESTS_PER_MINUTE],
      );
      signal.throwIfAborted();
      if (result.rowCount !== 1) throw new ORPCError('TOO_MANY_REQUESTS');
    });
  }

  async function withAccountData<T>(
    identity: AuthenticatedIdentity,
    signal: AbortSignal,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    signal.throwIfAborted();
    const client = await pool.connect();
    let broken = false;
    let committing = false;
    try {
      await client.query('begin');
      await client.query(
        `select set_config('statement_timeout',$1,true), set_config('lock_timeout',$2,true),
          set_config('idle_in_transaction_session_timeout',$3,true)`,
        [
          config.DB_STATEMENT_TIMEOUT_MS,
          config.DB_LOCK_TIMEOUT_MS,
          config.DB_IDLE_TRANSACTION_TIMEOUT_MS,
        ].map(String),
      );
      // Claims come only from the verifier, never arbitrary headers or input.
      await security.assertIdentity(identity, signal, client);
      await client.query(`select set_config('request.jwt.claims',$1,true)`, [
        JSON.stringify({
          sub: identity.subject,
          role: 'authenticated',
          canonical_account_id: identity.accountId,
        }),
      ]);
      await client.query('set local role authenticated');
      const result = await work(client);
      signal.throwIfAborted();
      committing = true;
      await client.query('commit');
      return result;
    } catch (error) {
      try {
        await client.query('rollback');
      } catch {
        broken = true;
      }
      if (committing)
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Operation outcome is uncertain.',
        });
      throw error;
    } finally {
      client.release(broken);
    }
  }

  // Runs after the refused transaction rolled back. A failed write doesn't change the refusal.
  async function recordDenial(
    accountId: string,
    bondId: string,
    capability: string,
    caller: Caller = APP_CALLER,
  ) {
    try {
      await pool.query(
        `insert into public.api_command_denials
           (account_id,bond_id,capability,channel,agent_key,grant_id,run_id)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [
          accountId,
          bondId,
          capability,
          caller.channel,
          caller.agent?.key,
          caller.agent?.delegationId,
          caller.runId,
        ],
      );
    } catch {
      console.error({ event: 'api.audit.denial_write_failed', capability });
    }
  }

  async function executeAccountCommand(
    options: CommandAuthority & {
      scope: ActiveScope;
      capability: string;
      key: string;
      payload: OperationJSON;
      deriveScope: (scope: ActiveScope, payload: OperationJSON) => string;
      signal: AbortSignal;
      mutate: (
        client: PoolClient,
        payload: OperationJSON,
        enqueue: (intent: EffectInput) => Promise<string>,
      ) => Promise<OperationJSON>;
      caller?: Caller;
      /** Where this capability is open. Closed everywhere but the app unless declared. */
      channels?: readonly ChannelName[];
      /** Declared by risky capabilities: an agent or a borrowed session can't satisfy it. */
      assurance?: 'fresh-person';
      /** Record lifecycle and sharing, in this transaction, after the mutation's role ends. */
      lifecycle?: (
        platform: { records: RecordLifecycle; grants: SharingGrants },
        result: OperationJSON,
      ) => Promise<void>;
    },
  ) {
    const { scope, signal, deriveScope, mutate, capability, key } = options;
    const caller = options.caller ?? APP_CALLER;
    assertCommandAuthority(options, capability);
    let resolvedResource: { type: string; id: string } | undefined;
    const domainCapability = options.domainCapability && { ...options.domainCapability };
    const rolePolicy = options.policy && { ...options.policy };
    // Copied so a caller can't change the authority after it was checked.
    const authority: CommandAuthority = domainCapability
      ? {
          domainCapability: {
            ...domainCapability,
            resolveResource: async (...args) => {
              const resource = await domainCapability.resolveResource(...args);
              if (resource)
                resolvedResource = { type: domainCapability.resourceType, id: resource.id };
              return resource;
            },
          },
        }
      : {
          policy: {
            ...rolePolicy!,
            resolveResource: async (...args) => {
              if (!rolePolicy) throw new Error('Command authority was not resolved');
              const resource = await rolePolicy.resolveResource(...args);
              if (resource) resolvedResource = { type: rolePolicy.resourceType, id: resource.id };
              return resource;
            },
          },
        };
    assertCommandAuthority(authority, capability);
    // Use a detached JSON snapshot for fingerprinting and capability input.
    const serialized = JSON.stringify(validateOperationJSON(options.payload));
    const payload = validateOperationJSON(JSON.parse(serialized));
    const scopeKey = deriveScope(scope, validateOperationJSON(JSON.parse(serialized)));
    let authorizedScope: ActiveScope | undefined;
    const admitted = () => {
      if (
        caller.runId ||
        !(options.channels ?? ['app']).includes(caller.channel) ||
        (options.assurance === 'fresh-person' && caller.assurance !== 'fresh-person')
      )
        throw new ORPCError('FORBIDDEN');
    };
    const execute = () => operations.execute(
      {
        accountId: scope.identity.accountId,
        scope: scopeKey,
        capability,
        key,
        payload,
      },
      {
        signal,
        recordAccepted: async (client, operationId) => {
          if (!authorizedScope || !resolvedResource)
            throw new Error('Command authority was not resolved');
          await client.query(
            `insert into public.api_command_audit
             (operation_id,account_id,bond_id,entity_type,entity_id,capacity,capability,resource_type,resource_id,channel,agent_key,grant_id,run_id)
             values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
            [
              operationId,
              authorizedScope.identity.accountId,
              authorizedScope.bondId,
              authorizedScope.entityType,
              authorizedScope.entityId,
              authorizedScope.capacity,
              capability,
              resolvedResource.type,
              resolvedResource.id,
              caller.channel,
              caller.agent?.key,
              caller.agent?.delegationId,
              caller.runId,
            ],
          );
        },
        authorize: async (client) => {
          resolvedResource = undefined;
          await authorizeCommand(security, scope, authority, signal, client);
          if (caller.agent)
            await assertDelegation(
              client,
              scope.identity.accountId,
              caller.agent,
              capability,
              resolvedResource,
            );
          const current = await security.resolveScope(scope.identity, scope.bondId, signal, client);
          if (deriveScope(current, validateOperationJSON(JSON.parse(serialized))) !== scopeKey)
            throw new ORPCError('FORBIDDEN');
          authorizedScope = current;
        },
        mutate: async (client, enqueue) => {
          const initialRole = await client.query<{ role: string }>('select current_user as role');
          const role = initialRole.rows[0]?.role;
          if (!role || role === 'authenticated') throw new Error('Invalid command database role');
          await client.query(`select set_config('request.jwt.claims',$1,true)`, [
            JSON.stringify({
              sub: scope.identity.subject,
              role: 'authenticated',
              canonical_account_id: scope.identity.accountId,
            }),
          ]);
          await client.query('set local role authenticated');
          const staged: { id: string; intent: EffectInput }[] = [];
          let bytes = 0;
          let accepting = true;
          let result: OperationJSON;
          try {
            result = await mutate(
              client,
              validateOperationJSON(JSON.parse(serialized)),
              async (intent) => {
                if (!accepting) throw new Error('Command effect staging is closed');
                const value = JSON.stringify(prepareEffect(intent));
                bytes += new TextEncoder().encode(value).byteLength;
                if (staged.length >= 32 || bytes > 262_144)
                  throw new Error('Command effect budget exceeded');
                const id = randomUUID();
                staged.push({ id, intent: prepareEffect(JSON.parse(value)) });
                return id;
              },
            );
          } finally {
            accepting = false;
          }
          signal.throwIfAborted();
          await client.query('reset role');
          const restored = await client.query<{ role: string }>('select current_user as role');
          if (restored.rows[0]?.role !== role)
            throw new Error('Command database role was not restored');
          await client.query(`select set_config('request.jwt.claims','',true)`);
          if (options.lifecycle) {
            const actor = scope.identity.accountId;
            await options.lifecycle(
              { records: recordLifecycle(client, actor), grants: sharingGrants(client, actor) },
              result,
            );
          }
          for (const effect of staged) await enqueue(effect.intent, effect.id);
          return result;
        },
      },
    );
    try {
      admitted();
      return await execute();
    } catch (error) {
      if (error instanceof ORPCError && error.code === 'FORBIDDEN')
        await recordDenial(scope.identity.accountId, scope.bondId, capability, caller);
      throw error;
    }
  }

  /**
   * Runs a read of a sensitive record under the caller's authority, with its record committed
   * in the same transaction: if the record can't be written, nothing is read.
   */
  function readSensitive<T>(options: {
    scope: ActiveScope;
    capability: string;
    resource: { type: string; id: string };
    reason: string;
    caller?: Caller;
    signal: AbortSignal;
    read: (client: PoolClient) => Promise<T>;
  }): Promise<T> {
    const { scope, caller = APP_CALLER } = options;
    return withAccountData(scope.identity, options.signal, async (client) => {
      await client.query('reset role');
      await client.query(
        `insert into public.api_sensitive_reads
           (account_id,bond_id,capability,resource_type,resource_id,reason,channel,agent_key,grant_id,run_id)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          scope.identity.accountId,
          scope.bondId,
          options.capability,
          options.resource.type,
          options.resource.id,
          options.reason,
          caller.channel,
          caller.agent?.key,
          caller.agent?.delegationId,
          caller.runId,
        ],
      );
      await client.query('set local role authenticated');
      return options.read(client);
    });
  }

  /** Worker step: one batch of records past their restore window. Holds always win. */
  function purgeExpired(
    recordType: string,
    limit: number,
    purge: (client: PoolClient, recordId: string) => Promise<void>,
  ) {
    return operations.transaction((client) =>
      purgeExpiredRecords(client, recordType, limit, (id) => purge(client, id)),
    );
  }
  let maintenance: ReturnType<typeof setInterval> | undefined;
  let closePromise: Promise<void> | undefined;
  let pruning = false;
  function startMaintenance() {
    if (maintenance || closePromise) return;
    maintenance = setInterval(() => {
      if (pruning) return;
      pruning = true;
      void pool
        .query(`with expired as (
        select account_id,window_start from public.api_request_budgets
        where window_start < clock_timestamp()-interval '10 minutes'
        order by window_start for update skip locked limit 1000
      ) delete from public.api_request_budgets b using expired e
        where b.account_id=e.account_id and b.window_start=e.window_start`)
        .catch(() => {
          console.error({ event: 'api.budget.cleanup_failed' });
        })
        .finally(() => {
          pruning = false;
        });
    }, 60_000);
    maintenance.unref();
  }
  return {
    security: {
      ...security,
      // A refused snapshot is usually a bond that isn't this account's, so it leaves a record.
      issueSnapshot: async (...args: Parameters<typeof security.issueSnapshot>) => {
        try {
          return await security.issueSnapshot(...args);
        } catch (error) {
          if (error instanceof ORPCError && error.code === 'FORBIDDEN')
            await recordDenial(args[0].accountId, args[1], 'authority.refreshSnapshot');
          throw error;
        }
      },
    },
    syncGrants,
    operations,
    executeAccountCommand,
    readSensitive,
    purgeExpired,
    consumeBudget,
    withAccountData,
    checkReadiness,
    startMaintenance,
    close: () => {
      closing = true;
      clearInterval(maintenance);
      closePromise ??= pool.end();
      return closePromise;
    },
  };
}

export type Platform = NonNullable<ReturnType<typeof createPlatform>>;
