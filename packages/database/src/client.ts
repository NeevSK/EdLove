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
