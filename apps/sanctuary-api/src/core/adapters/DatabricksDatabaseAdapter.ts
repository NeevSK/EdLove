import type { AuthenticatedUser } from '../ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../ports/DatabaseProviderPort';

export interface DatabricksClientStub {
  user: AuthenticatedUser;
  endpointUrl: string;
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
}

/**
 * Adapter implementing DatabaseProviderPort for Databricks Lakehouse / Delta SQL.
 * Decoupled port readiness for analytical queries and lakehouse ingestion.
 */
export class DatabricksDatabaseAdapter implements DatabaseProviderPort<DatabricksClientStub> {
  readonly providerName = 'databricks-lakehouse';

  getClient(user: AuthenticatedUser, connectionUrl?: string): DatabricksClientStub | null {
    if (!this.canConnect(connectionUrl)) {
      return null;
    }
    const url = connectionUrl || (typeof process !== 'undefined' ? process.env?.DATABRICKS_HOST : '');
    return {
      user,
      endpointUrl: url || 'https://databricks-lakehouse.local',
      async query(_sql: string, _params?: unknown[]) {
        // Databricks SQL execution stub ready for @databricks/sql or REST API
        return [];
      },
    };
  }

  canConnect(connectionUrl?: string): boolean {
    const url =
      connectionUrl ||
      (typeof process !== 'undefined'
        ? process.env?.DATABRICKS_HOST || process.env?.DATABASE_URL
        : undefined);
    if (!url) return false;
    return (
      url.includes('databricks.com') ||
      url.includes('azuredatabricks.net') ||
      url.startsWith('databricks://')
    );
  }
}
