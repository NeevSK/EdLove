import { canUseZenStackDb, createZenStackDb } from '@repo/database/client';
import type { AuthenticatedUser } from '../ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../ports/DatabaseProviderPort';

export type ZenStackDbClient = ReturnType<typeof createZenStackDb>;

/**
 * Adapter implementing DatabaseProviderPort using ZenStack ReBAC over PostgreSQL.
 */
export class ZenStackDatabaseAdapter implements DatabaseProviderPort<ZenStackDbClient> {
  readonly providerName = 'zenstack-postgres';

  getClient(user: AuthenticatedUser, connectionUrl?: string): ZenStackDbClient | null {
    if (!this.canConnect(connectionUrl)) {
      return null;
    }
    return createZenStackDb({ id: user.id }, connectionUrl);
  }

  canConnect(connectionUrl?: string): boolean {
    return canUseZenStackDb(connectionUrl);
  }
}
