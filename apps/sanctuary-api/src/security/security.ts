import { createPrivateKey, randomUUID } from 'node:crypto';
import { ORPCError } from '@orpc/server';
import type { InitialBondCapacity } from '@repo/core/api/v1/contract';
import { isEdloveAccountId } from '@repo/core/logic/utils/edloveUuidV8';
import type { CitizenshipTier } from '@repo/core/types/Identity';
import {
  AUTHORIZATION_ACTIONS,
  AUTHORIZATION_RESOURCES,
  cedarPolicyVersion,
  check,
  decideCapability,
  GRADE_MARK_ACTIONS,
  generateSnapshot,
  loadModularPolicySet,
  type ModularDecision,
  type ModularPolicySet,
} from '@repo/policies';
import { createRemoteJWKSet, customFetch, errors, type FetchImplementation, jwtVerify } from 'jose';
import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import type { AgentDelegation } from '../consent/grants';

type Database = Pool | PoolClient;
type Action = (typeof AUTHORIZATION_ACTIONS)[number] | (typeof GRADE_MARK_ACTIONS)[number];
type ResourceType = (typeof AUTHORIZATION_RESOURCES)[number];

export interface AuthenticatedIdentity {
  readonly accountId: string;
  readonly subject: string;
  readonly sessionId: string;
  readonly expiresAt: number;
}

export interface ActiveScope {
  readonly identity: AuthenticatedIdentity;
  readonly bondId: string;
  readonly entityId: string;
  readonly entityType: 'SCHOOL' | 'PERSONAL';
  readonly capacity: string;
  /** Stored on the bond, set by the server when the bond was created. */
  readonly citizenship: CitizenshipTier;
}

/** A domain capability, named `<Namespace>::<capability>` (see docs/architecture/module-structure.md). */
export interface Capability {
  readonly name: `${string}::${string}`;
  readonly resourceType: string;
  readonly resolveResource: (
    db: Database,
    scope: ActiveScope,
    signal: AbortSignal,
  ) => Promise<{ id: string; attributes: Record<string, string | number | boolean> } | null>;
}

export interface ListedScope {
  bondId: string;
  entityId: string;
  entityType: string;
  capacity: string;
  citizenship: CitizenshipTier;
  admission: 'available' | 'unsupported' | 'denied';
}

export interface SecurityOptions {
  pool: Pool;
  issuer: string;
  audience: string;
  jwksUrl: string;
  algorithms: readonly ('ES256' | 'RS256')[];
  jwksFetch?: FetchImplementation;
  /** Domain-namespaced Cedar policies; defaults to the set in @repo/policies, loaded at startup. */
  capabilityPolicies?: ModularPolicySet;
  /** Ed25519 private key (PKCS#8 PEM) that signs offline permission snapshots. */
  snapshotSigningKey?: string;
  statementTimeoutMs?: number;
  lockTimeoutMs?: number;
  idleTransactionTimeoutMs?: number;
}

/** What the client learns from a refresh; the signed snapshot itself arrives through sync. */
export type IssuedSnapshot = ReturnType<typeof generateSnapshot>;

const uuid = z.uuid();
const citizenshipTier = z.enum(['FIRST_CLASS', 'SECOND_CLASS', 'THIRD_CLASS']);
const bondRow = z.object({
  id: uuid,
  entity_id: z.string().min(1),
  entity_type: z.string().min(1),
  capacity: z.string().min(1),
  citizenship: citizenshipTier,
});
type BondRow = z.infer<typeof bondRow>;
const listedScope = (row: BondRow): ListedScope => ({
  bondId: row.id,
  entityId: row.entity_id,
  entityType: row.entity_type,
  capacity: row.capacity,
  citizenship: row.citizenship,
  admission:
    row.entity_type === 'PERSONAL' && row.capacity === 'principal'
      ? 'denied'
      : row.entity_type === 'SCHOOL' || row.entity_type === 'PERSONAL'
        ? 'available'
        : 'unsupported',
});
const unauthorized = () =>
  new ORPCError('UNAUTHORIZED', { message: 'Authentication is required.' });
const forbidden = () => new ORPCError('FORBIDDEN', { message: 'Access is denied.' });
const unavailable = () =>
  new ORPCError('SERVICE_UNAVAILABLE', { message: 'Authorization is temporarily unavailable.' });
const identityQuery = `SELECT identity.user_id::text AS account_id
  FROM public.auth_identities identity
  JOIN public.users account ON account.id = identity.user_id AND account.deleted_at IS NULL
  JOIN auth.users credential ON credential.id::text = identity.provider_user_id
  JOIN auth.sessions session ON session.user_id = credential.id
  WHERE identity.provider = 'supabase' AND identity.provider_user_id = $1
    AND session.id = $2::uuid AND (session.not_after IS NULL OR session.not_after > clock_timestamp())
    AND credential.deleted_at IS NULL AND (credential.banned_until IS NULL OR credential.banned_until <= clock_timestamp())`;

export function createSecurity(options: SecurityOptions) {
  const timeout = z.number().int().min(1).max(600_000);
  const transactionTimeouts = [
    timeout.parse(options.statementTimeoutMs ?? 5000),
    timeout.parse(options.lockTimeoutMs ?? 2000),
    timeout.parse(options.idleTransactionTimeoutMs ?? 10000),
  ].map(String);
  const issuer = new URL(options.issuer);
  const jwksUrl = new URL(options.jwksUrl);
  if (
    issuer.protocol !== 'https:' ||
    jwksUrl.protocol !== 'https:' ||
    jwksUrl.origin !== issuer.origin ||
    !options.audience ||
    options.algorithms.length === 0 ||
    options.algorithms.some((alg) => alg !== 'ES256' && alg !== 'RS256')
  ) {
    throw new Error('Invalid security configuration');
  }
  const jwks = createRemoteJWKSet(jwksUrl, {
    timeoutDuration: 3000,
    // Key removals may remain cached for up to 60 seconds; session checks remain live.
    cacheMaxAge: 60_000,
    ...(options.jwksFetch ? { [customFetch]: options.jwksFetch } : {}),
  });
  const identities = new WeakSet<AuthenticatedIdentity>();
  const scopes = new WeakSet<ActiveScope>();
  // Loading validates every fragment and policy, so an invalid set stops startup.
  const capabilityPolicies = options.capabilityPolicies ?? loadModularPolicySet();
  if (
    options.snapshotSigningKey &&
    createPrivateKey(options.snapshotSigningKey).asymmetricKeyType !== 'ed25519'
  )
    throw new Error('Invalid security configuration');

  async function checkReadiness(signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    try {
      if (!jwks.fresh) await jwks.reload();
      signal.throwIfAborted();
    } catch {
      if (signal.aborted) signal.throwIfAborted();
      throw unavailable();
    }
  }

  async function authenticate(
    authorization: string | undefined,
    signal: AbortSignal,
  ): Promise<AuthenticatedIdentity> {
    signal.throwIfAborted();
    const token = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!token) throw unauthorized();
    let payload;
    try {
      ({ payload } = await jwtVerify(token, jwks, {
        issuer: options.issuer,
        audience: options.audience,
        algorithms: [...options.algorithms],
        requiredClaims: ['sub', 'exp', 'session_id', 'canonical_account_id'],
      }));
    } catch (error) {
      if (signal.aborted) signal.throwIfAborted();
      if (
        error instanceof errors.JWTExpired ||
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWTInvalid ||
        error instanceof errors.JWSInvalid ||
        error instanceof errors.JWSSignatureVerificationFailed ||
        error instanceof errors.JOSEAlgNotAllowed ||
        error instanceof errors.JWKSNoMatchingKey
      )
        throw unauthorized();
      throw unavailable();
    }
    signal.throwIfAborted();
    const subject = uuid.safeParse(payload.sub);
    const session = uuid.safeParse(payload.session_id);
    const account = z.string().safeParse(payload.canonical_account_id);
    if (
      !subject.success ||
      !session.success ||
      !account.success ||
      !isEdloveAccountId(account.data) ||
      typeof payload.exp !== 'number' ||
      payload.role !== 'authenticated'
    )
      throw unauthorized();
    try {
      const result = await options.pool.query<{ account_id: string }>(identityQuery, [
        subject.data,
        session.data,
      ]);
      signal.throwIfAborted();
      if (
        payload.exp <= Date.now() / 1000 ||
        result.rows.length !== 1 ||
        result.rows[0]?.account_id !== account.data
      )
        throw unauthorized();
      const identity = Object.freeze({
        accountId: account.data,
        subject: subject.data,
        sessionId: session.data,
        expiresAt: payload.exp,
      });
      identities.add(identity);
      return identity;
    } catch (error) {
      if (signal.aborted) signal.throwIfAborted();
      if (error instanceof ORPCError) throw error;
      throw unavailable();
    }
  }

  async function assertIdentity(
    identity: AuthenticatedIdentity,
    signal: AbortSignal,
    transaction: PoolClient,
  ): Promise<void> {
    signal.throwIfAborted();
    if (!identities.has(identity) || identity.expiresAt <= Date.now() / 1000) throw unauthorized();
    try {
      const locked = await transaction.query(
        `${identityQuery} FOR SHARE OF identity, account, credential, session`,
        [identity.subject, identity.sessionId],
      );
      if (locked.rows.length !== 1) throw unauthorized();
      // The lock query can wait after evaluating time predicates. Re-read once the
      // authority rows are locked so an expiry during the wait is not accepted.
      const result = await transaction.query<{ account_id: string }>(identityQuery, [
        identity.subject,
        identity.sessionId,
      ]);
      signal.throwIfAborted();
      if (
        identity.expiresAt <= Date.now() / 1000 ||
        result.rows.length !== 1 ||
        result.rows[0]?.account_id !== identity.accountId
      )
        throw unauthorized();
    } catch (error) {
      if (signal.aborted) signal.throwIfAborted();
      if (error instanceof ORPCError) throw error;
      throw unavailable();
    }
  }

  async function resolveScope(
    identity: AuthenticatedIdentity,
    bondId: string,
    signal: AbortSignal,
    transaction?: PoolClient,
  ): Promise<ActiveScope> {
    signal.throwIfAborted();
    if (
      !identities.has(identity) ||
      identity.expiresAt <= Date.now() / 1000 ||
      !uuid.safeParse(bondId).success
    )
      throw forbidden();
    try {
      const query = `SELECT bond.id::text, bond.entity_id::text, bond.entity_type, bond.capacity, bond.citizenship
         FROM public.bonds bond
         JOIN public.auth_identities binding ON binding.user_id = bond.user_id
           AND binding.provider = 'supabase' AND binding.provider_user_id = $3
         JOIN public.users account ON account.id = bond.user_id AND account.deleted_at IS NULL
         JOIN auth.users credential ON credential.id::text = binding.provider_user_id
           AND credential.deleted_at IS NULL AND (credential.banned_until IS NULL OR credential.banned_until <= clock_timestamp())
         JOIN auth.sessions session ON session.user_id = credential.id AND session.id = $4::uuid
           AND (session.not_after IS NULL OR session.not_after > clock_timestamp())
         WHERE bond.id = $1::uuid AND bond.user_id = $2::uuid AND bond.status = 'active'
           AND bond.valid_from <= clock_timestamp() AND (bond.valid_until IS NULL OR bond.valid_until > clock_timestamp())`;
      const parameters = [bondId, identity.accountId, identity.subject, identity.sessionId];
      if (transaction) {
        const locked = await transaction.query(
          `${query} FOR SHARE OF bond, binding, account, credential, session`,
          parameters,
        );
        if (locked.rows.length !== 1) throw forbidden();
      }
      const result = await (transaction ?? options.pool).query<BondRow>(query, parameters);
      signal.throwIfAborted();
      const bond = result.rows[0];
      const citizenship = citizenshipTier.safeParse(bond?.citizenship);
      if (
        !citizenship.success ||
        identity.expiresAt <= Date.now() / 1000 ||
        result.rows.length !== 1 ||
        !bond ||
        (bond.entity_type !== 'SCHOOL' && bond.entity_type !== 'PERSONAL') ||
        (bond.entity_type === 'PERSONAL' && bond.capacity === 'principal')
      )
        throw forbidden();
      const scope = Object.freeze({
        identity,
        bondId: bond.id,
        entityId: bond.entity_id,
        entityType: bond.entity_type,
        capacity: bond.capacity,
        citizenship: citizenship.data,
      });
      scopes.add(scope);
      return scope;
    } catch (error) {
      if (signal.aborted) signal.throwIfAborted();
      if (error instanceof ORPCError) throw error;
      throw unavailable();
    }
  }

  // Runs work in one transaction after re-checking the identity under lock. Any failure
  // rolls back; errors that aren't already API errors become "unavailable".
  async function withIdentityTransaction<T>(
    identity: AuthenticatedIdentity,
    signal: AbortSignal,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    signal.throwIfAborted();
    let client: PoolClient;
    try {
      client = await options.pool.connect();
    } catch {
      if (signal.aborted) signal.throwIfAborted();
      throw unavailable();
    }
    let discard = false;
    try {
      signal.throwIfAborted();
      await client.query('BEGIN');
      await client.query(
        `select set_config('statement_timeout',$1,true), set_config('lock_timeout',$2,true),
          set_config('idle_in_transaction_session_timeout',$3,true)`,
        transactionTimeouts,
      );
      await assertIdentity(identity, signal, client);
      const result = await work(client);
      signal.throwIfAborted();
      await client.query('COMMIT');
      signal.throwIfAborted();
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        discard = true;
      }
      if (signal.aborted) signal.throwIfAborted();
      if (error instanceof ORPCError) throw error;
      throw unavailable();
    } finally {
      client.release(discard);
    }
  }

  const activeBondsQuery = `SELECT id::text, entity_id::text, entity_type, capacity, citizenship FROM public.bonds
         WHERE user_id = $1::uuid AND status = 'active' AND valid_from <= clock_timestamp()
           AND (valid_until IS NULL OR valid_until > clock_timestamp()) ORDER BY id`;

  function listScopes(
    identity: AuthenticatedIdentity,
    signal: AbortSignal,
  ): Promise<ListedScope[]> {
    return withIdentityTransaction(identity, signal, async (client) => {
      const result = await client.query<BondRow>(activeBondsQuery, [identity.accountId]);
      signal.throwIfAborted();
      if (identity.expiresAt <= Date.now() / 1000) throw unauthorized();
      const rows = z.array(bondRow).safeParse(result.rows);
      if (!rows.success) throw unavailable();
      return rows.data.map(listedScope);
    });
  }

  /** What a client needs to enter: the account's name, onboarding state and bonds, in one read. */
  function readEntry(identity: AuthenticatedIdentity, signal: AbortSignal) {
    return withIdentityTransaction(identity, signal, async (client) => {
      const account = await client.query(
        'SELECT display_name, onboarding_completed FROM public.users WHERE id = $1::uuid',
        [identity.accountId],
      );
      const row = z
        .object({ display_name: z.string().nullable(), onboarding_completed: z.boolean() })
        .safeParse(account.rows[0]);
      if (!row.success) throw unavailable();
      const bonds = await client.query<BondRow>(activeBondsQuery, [identity.accountId]);
      signal.throwIfAborted();
      if (identity.expiresAt <= Date.now() / 1000) throw unauthorized();
      const rows = z.array(bondRow).safeParse(bonds.rows);
      if (!rows.success) throw unavailable();
      return {
        accountId: identity.accountId,
        displayName: row.data.display_name,
        onboardingCompleted: row.data.onboarding_completed,
        scopes: rows.data.map(listedScope),
      };
    });
  }

  /**
   * Gives a signed-in account its personal bond, the one way a person gets in. Retrying,
   * or a second device, returns the bond that already exists. Capacities that carry
   * authority (principal, founder, admin) aren't selectable; the contract refuses them.
   */
  function createInitialBond(
    identity: AuthenticatedIdentity,
    input: { capacity: InitialBondCapacity; displayName: string },
    signal: AbortSignal,
  ): Promise<ListedScope> {
    return withIdentityTransaction(identity, signal, async (client) => {
      // Holds concurrent first-bond calls for this account until this one commits.
      await client.query('SELECT id FROM public.users WHERE id = $1::uuid FOR UPDATE', [
        identity.accountId,
      ]);
      const columns = 'id::text, entity_id::text, entity_type, capacity, citizenship';
      const existing = await client.query<BondRow>(
        `SELECT ${columns} FROM public.bonds
         WHERE user_id = $1::uuid AND entity_type = 'PERSONAL' AND status = 'active'`,
        [identity.accountId],
      );
      signal.throwIfAborted();
      if (existing.rows[0]) return listedScope(bondRow.parse(existing.rows[0]));
      const created = await client.query<BondRow>(
        `INSERT INTO public.bonds (user_id, entity_id, entity_type, capacity, citizenship, status, valid_from)
         VALUES ($1::uuid, $1, 'PERSONAL', $2, 'SECOND_CLASS', 'active', clock_timestamp())
         RETURNING ${columns}`,
        [identity.accountId, input.capacity],
      );
      const row = bondRow.parse(created.rows[0]);
      await client.query(
        `UPDATE public.users SET display_name = $2, onboarding_completed = true,
           onboarding_completed_at = clock_timestamp(), updated_at = clock_timestamp()
         WHERE id = $1::uuid`,
        [identity.accountId, input.displayName],
      );
      await client.query(
        `INSERT INTO public.api_command_audit
           (operation_id, account_id, bond_id, entity_type, entity_id, capacity, capability, resource_type, resource_id, channel)
         VALUES ($1, $2, $3, $4, $5, $6, 'identity.createInitialBond', 'Bond', $3, $7)`,
        [
          randomUUID(),
          identity.accountId,
          row.id,
          row.entity_type,
          row.entity_id,
          row.capacity,
          APP_CALLER.channel,
        ],
      );
      signal.throwIfAborted();
      return listedScope(row);
    });
  }

  /**
   * Signs and stores the offline permission snapshot for one of the account's bonds.
   * The bond is re-read under lock in the same transaction, so an ended bond gets no
   * snapshot. PowerSync delivers the stored row; the client verifies signature, bond,
   * policy version and expiry before use (useCedarDecisionStore).
   */
  function issueSnapshot(
    identity: AuthenticatedIdentity,
    bondId: string,
    signal: AbortSignal,
  ): Promise<IssuedSnapshot> {
    const signingKey = options.snapshotSigningKey;
    if (!signingKey) return Promise.reject(unavailable());
    return withIdentityTransaction(identity, signal, async (client) => {
      const scope = await resolveScope(identity, bondId, signal, client);
      // The version is the fingerprint of the policies this server enforces. Recording it
      // here, in the same transaction, keeps the synced policy_version row and every new
      // snapshot in step; devices holding a snapshot from other policies reject it.
      const policyVersion = cedarPolicyVersion();
      await client.query(
        `INSERT INTO public.policy_version (id, hash, updated_at)
         SELECT 'cedar', $1, now()
         WHERE NOT EXISTS (SELECT 1 FROM public.policy_version WHERE id='cedar' AND hash=$1)
         ON CONFLICT (id) DO UPDATE SET hash = EXCLUDED.hash, updated_at = now()
         WHERE public.policy_version.hash IS DISTINCT FROM EXCLUDED.hash`,
        [policyVersion],
      );
      signal.throwIfAborted();
      const snapshot = generateSnapshot(
        {
          id: identity.accountId,
          school_id: scope.entityType === 'SCHOOL' ? scope.entityId : undefined,
          capacity: scope.capacity,
          active_bond_id: scope.bondId,
          active_entity_id: scope.entityId,
          active_entity_type: scope.entityType,
          policy_version: policyVersion,
        },
        signingKey,
      );
      await client.query(
        `INSERT INTO public.permission_snapshots
          (id, user_id, active_bond_id, active_entity_id, active_entity_type, school_id, policy_version,
           generated_at, expires_at, permissions, temporal_hints, signature)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12)
         ON CONFLICT (id) DO UPDATE SET
           active_entity_id = EXCLUDED.active_entity_id,
           active_entity_type = EXCLUDED.active_entity_type,
           school_id = EXCLUDED.school_id,
           policy_version = EXCLUDED.policy_version,
           generated_at = EXCLUDED.generated_at,
           expires_at = EXCLUDED.expires_at,
           permissions = EXCLUDED.permissions,
           temporal_hints = EXCLUDED.temporal_hints,
           signature = EXCLUDED.signature`,
        [
          `${snapshot.userId}:${snapshot.activeBondId}`,
          snapshot.userId,
          snapshot.activeBondId,
          snapshot.activeEntityId,
          snapshot.activeEntityType,
          snapshot.schoolId,
          snapshot.policyVersion,
          snapshot.generatedAt,
          snapshot.expiresAt,
          JSON.stringify(snapshot.permissions),
          JSON.stringify(snapshot.temporalHints),
          snapshot.signature,
        ],
      );
      return snapshot;
    });
  }

  async function authorize(
    scope: ActiveScope,
    capability: {
      action: Action;
      resourceType: ResourceType;
      resolveResource: (
        db: Database,
        scope: ActiveScope,
        signal: AbortSignal,
      ) => Promise<{ id: string; attributes: Record<string, unknown> } | null>;
    },
    signal: AbortSignal,
    transaction?: PoolClient,
  ): Promise<void> {
    signal.throwIfAborted();
    if (
      !scopes.has(scope) ||
      !(
        AUTHORIZATION_ACTIONS.some((action) => action === capability.action) ||
        (capability.resourceType === 'GradeMark' &&
          GRADE_MARK_ACTIONS.some((action) => action === capability.action))
      ) ||
      !AUTHORIZATION_RESOURCES.includes(capability.resourceType)
    )
      throw forbidden();
    const { current, resource } = await currentResource(
      scope,
      capability.resolveResource,
      signal,
      transaction,
    );
    let decision;
    try {
      decision = check({
        principal: {
          type: current.capacity,
          id: current.identity.accountId,
          attributes: {
            school_id: current.entityType === 'SCHOOL' ? current.entityId : '',
            active_entity_id: current.entityId,
            active_entity_type: current.entityType,
            capacity: current.capacity,
          },
        },
        action: capability.action,
        resource: {
          type: capability.resourceType,
          id: resource.id,
          attributes: resource.attributes,
        },
      });
    } catch {
      throw unavailable();
    }
    if (
      !decision.permitted &&
      (decision.reason === 'CedarEvaluationFailure' || decision.reason === 'EvaluatorError')
    )
      throw unavailable();
    if (!decision.permitted) throw forbidden();
  }

  // Re-reads the bond (under lock inside a transaction) so a scope that ended since it
  // was resolved can't act, then loads the target fact.
  async function currentResource<Resource>(
    scope: ActiveScope,
    resolveResource: (
      db: Database,
      scope: ActiveScope,
      signal: AbortSignal,
    ) => Promise<Resource | null>,
    signal: AbortSignal,
    transaction?: PoolClient,
  ): Promise<{ current: ActiveScope; resource: Resource }> {
    const current = await resolveScope(scope.identity, scope.bondId, signal, transaction);
    let resource;
    try {
      resource = await resolveResource(transaction ?? options.pool, current, signal);
    } catch {
      if (signal.aborted) signal.throwIfAborted();
      throw unavailable();
    }
    signal.throwIfAborted();
    if (current.identity.expiresAt <= Date.now() / 1000) throw forbidden();
    if (!resource) throw forbidden();
    return { current, resource };
  }

  /**
   * Authorizes a domain capability with the domain-namespaced Cedar policies. Denies by
   * default; an unknown namespace or an evaluation error fails closed as unavailable.
   * Returns the decision so the caller can record it in the audit trail.
   */
  async function authorizeCapability(
    scope: ActiveScope,
    capability: Capability,
    signal: AbortSignal,
    transaction?: PoolClient,
  ): Promise<ModularDecision> {
    signal.throwIfAborted();
    if (!scopes.has(scope)) throw forbidden();
    const { current, resource } = await currentResource(
      scope,
      capability.resolveResource,
      signal,
      transaction,
    );
    let decision: ModularDecision;
    try {
      decision = decideCapability(capabilityPolicies, {
        accountId: current.identity.accountId,
        bond: {
          id: current.bondId,
          capacity: current.capacity,
          citizenship: current.citizenship,
          entityType: current.entityType,
          entityId: current.entityId,
        },
        capability: capability.name,
        resource: {
          id: resource.id,
          attributes: resource.attributes,
          type: capability.resourceType,
        },
      });
    } catch {
      throw unavailable();
    }
    if (!decision.permitted) throw forbidden();
    return decision;
  }

  return {
    authenticate,
    assertIdentity,
    assertScope: (scope: ActiveScope) => {
      if (!scopes.has(scope)) throw forbidden();
    },
    resolveScope,
    listScopes,
    readEntry,
    createInitialBond,
    issueSnapshot,
    authorize,
    authorizeCapability,
    checkReadiness,
  };
}

export type Security = ReturnType<typeof createSecurity>;

export type ChannelName = 'app' | 'mcp' | 'webmcp' | 'whatsapp' | 'telegram' | 'worker';

/**
 * How a request arrived. A channel adapter builds this from what it verified. The account
 * stays on the identity: an agent never is one, it acts for the person through a live grant.
 */
export interface Caller {
  channel: ChannelName;
  agent?: AgentDelegation;
  /** An ephemeral worker's run. It may read and propose, and never passes a command. */
  runId?: string;
  assurance: 'session' | 'fresh-person';
}

export const APP_CALLER: Caller = { channel: 'app', assurance: 'session' };

/**
 * Who may run a durable command: the role-shaped engine (existing account commands) or
 * a domain capability (domain-namespaced Cedar). Exactly one; see authorizeCommand.
 */
export type CommandAuthority =
  | {
      policy: Omit<Parameters<Security['authorize']>[1], 'action'> & {
        action: 'create' | 'update' | 'delete';
      };
      domainCapability?: never;
    }
  | { domainCapability: Capability; policy?: never };

/** Rejects a malformed authority before any work starts. */
export function assertCommandAuthority(authority: CommandAuthority, capability: string): void {
  if (authority.domainCapability) {
    // The receipt's capability and the decision's capability must be the same thing.
    if (authority.policy || authority.domainCapability.name !== capability)
      throw new ORPCError('FORBIDDEN');
    return;
  }
  if (!authority.policy || !['create', 'update', 'delete'].includes(authority.policy.action))
    throw new ORPCError('FORBIDDEN');
}

/** Decides a durable command inside its transaction, with the bond re-read under lock. */
export async function authorizeCommand(
  security: Pick<Security, 'authorize' | 'authorizeCapability'>,
  scope: ActiveScope,
  authority: CommandAuthority,
  signal: AbortSignal,
  transaction: PoolClient,
): Promise<void> {
  if (authority.domainCapability)
    await security.authorizeCapability(scope, authority.domainCapability, signal, transaction);
  else await security.authorize(scope, authority.policy, signal, transaction);
}
