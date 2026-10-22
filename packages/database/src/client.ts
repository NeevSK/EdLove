import { schema } from '@repo/schema';
import { ZenStackClient } from '@zenstackhq/orm';
import { PolicyPlugin } from '@zenstackhq/plugin-policy';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

type AuthUser = {
  id: string;
};

let sharedPool: Pool | null = null;
let currentDatabaseUrl: string | null = null;

const getPool = (databaseUrl?: string) => {
  const dbUrl = databaseUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is required to initialize the ZenStack client');
  }

  if (!sharedPool || dbUrl !== currentDatabaseUrl) {
    if (sharedPool) {
      const oldPool = sharedPool;
      oldPool.end().catch((err) => {
        console.error('Error draining old database connection pool:', err);
      });
    }
    sharedPool = new Pool({
      connectionString: dbUrl,
    });
    currentDatabaseUrl = dbUrl;
  }

  return sharedPool;
};

export const createZenStackDb = (user: AuthUser, databaseUrl?: string) => {
  const dialect = new PostgresDialect({
    pool: getPool(databaseUrl),
  });

  return new ZenStackClient(schema, {
    dialect,
    user: {
      id: user.id,
    },
  });
};

/** Fields of `auth()` the zmodel policies read: the user id and their active bonds. */
export type PolicyAuth = {
  id: string;
  bonds: Array<{ capacity: string; entity_id: string; entity_type: string; status?: string }>;
  /** Links where this user is the guardian (policies admit only verified ones). */
  student_guardian_links_as_guardian?: Array<{ student_id: string; verification_status: string }>;
};

type RawZenStackDb = ReturnType<typeof createZenStackDb>;

/**
 * Policy-enforced view of a raw client: every query is filtered and checked against the
 * zmodel @@allow rules for `auth`. Raw SQL is rejected. Built per request from the raw
 * client (same pool), so it costs no extra connection.
 *
 * Start transactions on the policy client (`policyDb.$transaction`). Applying the plugin
 * to a transaction client of the raw client registers it but does not enforce it
 * (verified against ZenStack 3.9.7), and `$unuse('policy')` inside a policy transaction
 * does not lift it either.
 */
export const createPolicyDb = (raw: RawZenStackDb, auth: PolicyAuth) =>
  (raw as any).$use(new PolicyPlugin()).$setAuth(auth) as RawZenStackDb;

/**
 * Loads the fields the zmodel policies read from `auth()`: the user's active, unexpired
 * bonds and the guardian links where they are the guardian. Reads go through the raw
 * client because they define the caller's own authority.
 */
export async function loadPolicyAuth(raw: RawZenStackDb, userId: string): Promise<PolicyAuth> {
  const db = raw as any;
  const now = new Date();
  const [bonds, guardianLinks] = await Promise.all([
    db.bond.findMany({
      where: { user_id: userId, status: 'active' },
      select: {
        capacity: true,
        entity_id: true,
        entity_type: true,
        status: true,
        valid_until: true,
      },
    }),
    db.studentGuardianRelationship.findMany({
      where: { guardian_id: userId },
      select: { student_id: true, verification_status: true },
    }),
  ]);
  return {
    id: userId,
    bonds: (bonds ?? [])
      .filter((bond: any) => !bond.valid_until || new Date(bond.valid_until) > now)
      .map(({ capacity, entity_id, entity_type, status }: any) => ({
        capacity: String(capacity),
        entity_id: String(entity_id),
        entity_type: String(entity_type),
        status: String(status ?? 'active'),
      })),
    student_guardian_links_as_guardian: (guardianLinks ?? []).map((link: any) => ({
      student_id: String(link.student_id),
      verification_status: String(link.verification_status),
    })),
  };
}

/** Policy-enforced client for one signed-in user (loads their auth, then applies it). */
export const createPolicyDbForUser = async (raw: RawZenStackDb, userId: string) =>
  createPolicyDb(raw, await loadPolicyAuth(raw, userId));

export const canUseZenStackDb = (databaseUrl?: string) => {
  return Boolean(databaseUrl || process.env.DATABASE_URL);
};

/**
 * Parameterized read port for tables that are intentionally outside the
 * ZenStack domain model (for example PowerSync control-plane projections).
 * Callers cannot interpolate values into the query string.
 */
export async function queryDatabaseRows<T>(
  query: string,
  parameters: readonly unknown[] = [],
  databaseUrl?: string,
): Promise<T[]> {
  const result = await getPool(databaseUrl).query(query, parameters as unknown[]);
  return result.rows as T[];
}

/**
 * Parameterized command port for server-owned projections outside ZenStack.
 * Values must remain parameters; callers cannot interpolate user input.
 */
export async function executeDatabaseCommand(
  query: string,
  parameters: readonly unknown[] = [],
  databaseUrl?: string,
): Promise<void> {
  await getPool(databaseUrl).query(query, parameters as unknown[]);
}
