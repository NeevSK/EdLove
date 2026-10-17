import type { AuthenticatedUser } from './AuthProviderPort';

/**
 * Hexagonal Port for database connectivity and client instantiation.
 * Decouples core routing and ReBAC enforcement from concrete database drivers
 * (e.g. ZenStack PostgreSQL, Neon Serverless, Databricks Delta Lake / SQL Warehouse).
 */
export interface DatabaseProviderPort<TClient = any> {
  readonly providerName: string;

  /**
   * Instantiates a database client scoped to the authenticated user and database URL.
   */
  getClient(user: AuthenticatedUser, connectionUrl?: string): TClient | null;

  /**
   * Verifies whether the provider can establish or manage a connection with the given URL.
   */
  canConnect(connectionUrl?: string): boolean;
}
