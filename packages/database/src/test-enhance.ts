import { schema } from '@repo/schema';
import { ZenStackClient } from '@zenstackhq/orm';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';

const { DATABASE_URL } = process.env;

// Initialize a Kysely dialect with a connection pool
const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: DATABASE_URL,
  }),
});

const db = new ZenStackClient(schema, {
  dialect,
  user: { id: 'test', authority: 'admin' },
});

console.log('ZenStack enhanced client initialized successfully');
// Test a simple read (even if data is empty, the client should not crash)
db.user
  .findMany()
  .then(() => {
    console.log('Verified: Enhanced client query execution works.');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('Enhanced client query failed:', err);
    process.exit(1);
  });
