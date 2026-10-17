import type { AuthenticatedUser } from '../ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../ports/DatabaseProviderPort';
import { DatabricksDatabaseAdapter } from './DatabricksDatabaseAdapter';
import { NeonDatabaseAdapter } from './NeonDatabaseAdapter';
import { ZenStackDatabaseAdapter } from './ZenStackDatabaseAdapter';

/**
 * Composite Database Provider that routes database connections based on URL format or environment.
 */
export class CompositeDatabaseProvider implements DatabaseProviderPort {
  readonly providerName = 'composite';

  private readonly zenstack: ZenStackDatabaseAdapter;
  private readonly neon: NeonDatabaseAdapter;
  private readonly databricks: DatabricksDatabaseAdapter;

  constructor() {
    this.zenstack = new ZenStackDatabaseAdapter();
    this.neon = new NeonDatabaseAdapter();
    this.databricks = new DatabricksDatabaseAdapter();
  }

  getClient(user: AuthenticatedUser, connectionUrl?: string): any {
    const url = connectionUrl || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined);

    // 1. Check for Databricks Lakehouse URL
    if (url && (url.includes('databricks.com') || url.startsWith('databricks://'))) {
      return this.databricks.getClient(user, connectionUrl);
    }

    // 2. Check for Neon URL
    if (url && url.includes('neon.tech')) {
      return this.neon.getClient(user, connectionUrl);
    }

    // 3. Default to ZenStack Postgres
    return this.zenstack.getClient(user, connectionUrl);
  }

  canConnect(connectionUrl?: string): boolean {
    return (
      this.zenstack.canConnect(connectionUrl) ||
      this.neon.canConnect(connectionUrl) ||
      this.databricks.canConnect(connectionUrl)
    );
  }
}
