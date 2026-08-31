import { schema } from '@repo/schema';
import { ZenStackClient } from '@zenstackhq/orm';
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
