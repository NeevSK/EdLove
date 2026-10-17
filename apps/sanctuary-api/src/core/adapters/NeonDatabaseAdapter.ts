import { canUseZenStackDb, createZenStackDb } from '@repo/database/client';
import type { AuthenticatedUser } from '../ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../ports/DatabaseProviderPort';
import type { ZenStackDbClient } from './ZenStackDatabaseAdapter';

/**
 * Adapter implementing DatabaseProviderPort for Neon (Serverless Postgres).
 * Supports Neon connection pooling, ephemerality, and branching URLs.
 */
export class NeonDatabaseAdapter implements DatabaseProviderPort<ZenStackDbClient> {
  readonly providerName = 'neon-postgres';

  getClient(user: AuthenticatedUser, connectionUrl?: string): ZenStackDbClient | null {
    if (!this.canConnect(connectionUrl)) {
      return null;
    }
    // Neon postgres endpoints connect seamlessly via postgres protocol
    return createZenStackDb({ id: user.id }, connectionUrl);
  }

  canConnect(connectionUrl?: string): boolean {
    const url = connectionUrl || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined);
    if (!url) return false;
    return url.includes('neon.tech') || canUseZenStackDb(url);
  }
}
