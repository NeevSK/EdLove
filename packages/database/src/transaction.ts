import { schema } from '@repo/schema';
import { ZenStackClient } from '@zenstackhq/orm';
import { CompiledQuery, type DatabaseConnection, type Driver, PostgresDialect } from 'kysely';
import type { PoolClient } from 'pg';

/**
 * ZenStack on a connection the caller already holds inside its own transaction.
 *
 * The API opens one transaction per request (timeouts, verified claims, `set local role
 * authenticated`), so row-level security decides what each query sees. This client runs on
 * that same connection: it never opens a pool, never releases the connection, and turns its
 * own `$transaction` calls into savepoints, so it can neither commit nor roll back the
 * caller's transaction. No policy plugin: row-level security and Cedar already decide access.
 *
 * Run one `$transaction` at a time per connection; a pg client runs one query at a time.
 */
export function createZenStackOnConnection(connection: PoolClient) {
  const borrowed = {
    // Kysely releases what it acquires; the caller owns this connection, so release is a no-op.
    connect: async () => ({
      query: (...args: Parameters<PoolClient['query']>) =>
        (connection.query as (...a: unknown[]) => unknown)(...args),
      release: () => {},
      get processID() {
        return (connection as unknown as { processID?: number }).processID;
      },
    }),
    end: async () => {},
  };
  return new ZenStackClient(schema, { dialect: new SavepointDialect({ pool: borrowed as never }) });
}

export type ConnectionZenStackDb = ReturnType<typeof createZenStackOnConnection>;

class SavepointDialect extends PostgresDialect {
  override createDriver(): Driver {
    return savepointDriver(super.createDriver());
  }
}

function savepointDriver(driver: Driver): Driver {
  const open = new WeakMap<DatabaseConnection, string[]>();
  let next = 0;
  const run = (connection: DatabaseConnection, sql: string) =>
    connection.executeQuery(CompiledQuery.raw(sql));
  return {
    init: () => driver.init(),
    acquireConnection: () => driver.acquireConnection(),
    releaseConnection: (connection) => driver.releaseConnection(connection),
    destroy: () => driver.destroy(),
    savepoint: driver.savepoint?.bind(driver),
    rollbackToSavepoint: driver.rollbackToSavepoint?.bind(driver),
    releaseSavepoint: driver.releaseSavepoint?.bind(driver),
    // Isolation and access mode belong to the caller's transaction, so settings are ignored.
    async beginTransaction(connection) {
      const name = `zenstack_${++next}`;
      await run(connection, `savepoint ${name}`);
      open.set(connection, [...(open.get(connection) ?? []), name]);
    },
    async commitTransaction(connection) {
      const name = pop(open, connection);
      await run(connection, `release savepoint ${name}`);
    },
    async rollbackTransaction(connection) {
      const name = pop(open, connection);
      await run(connection, `rollback to savepoint ${name}`);
      await run(connection, `release savepoint ${name}`);
    },
  };
}

function pop(open: WeakMap<DatabaseConnection, string[]>, connection: DatabaseConnection) {
  const names = open.get(connection) ?? [];
  const name = names.pop();
  if (!name) throw new Error('No open ZenStack savepoint on this connection');
  return name;
}
