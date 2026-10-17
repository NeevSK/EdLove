import { HTTPException } from 'hono/http-exception';
import { endTime, startTime } from 'hono/timing';
import type { MiddlewareHandler } from 'hono';
import { CompositeAuthProvider } from '../adapters/CompositeAuthProvider';
import { CompositeDatabaseProvider } from '../adapters/CompositeDatabaseProvider';
import { resolveAuthenticatedAccount } from '../authenticatedAccount';
import type { AuthenticatedUser, AuthProviderPort } from '../ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../ports/DatabaseProviderPort';

export interface IdentityBridgeOptions {
  authProvider?: AuthProviderPort;
  databaseProvider?: DatabaseProviderPort;
}

function getEnvVar(key: string, env?: Record<string, unknown>): string | undefined {
  if (env && key in env && typeof env[key] === 'string') {
    return env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

/**
 * Creates a hexagonal identity bridge middleware.
 * Authoritatively verifies bearer tokens via AuthProviderPort and injects
 * vendor-neutral `user` and `db` into the Hono context.
 */
export function createIdentityBridge(options?: IdentityBridgeOptions): MiddlewareHandler {
  const authProvider = options?.authProvider ?? new CompositeAuthProvider();
  const dbProvider = options?.databaseProvider ?? new CompositeDatabaseProvider();

  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const dbUrl = (c.env as any)?.DATABASE_URL || getEnvVar('DATABASE_URL', c.env as any);
    let user: AuthenticatedUser = { id: 'anonymous', provider: 'anonymous' };

    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        throw new HTTPException(401, {
          message: 'Invalid Authorization header format. Must be Bearer token.',
        });
      }

      const token = authHeader.replace('Bearer ', '');

      startTime(c, 'jwt', 'JWT Verification');
      const verifiedResult = await authProvider.verifyToken(token, c.env as any);
      endTime(c, 'jwt');

      if (!verifiedResult) {
        throw new HTTPException(401, {
          message:
            'Authoritative cryptographic identity verification failed (Invalid or Expired JWT).',
        });
      }

      // Resolve internal canonical account identifier from provider credentials
      const account = await resolveAuthenticatedAccount(
        verifiedResult.sub,
        dbUrl,
        verifiedResult.provider,
      );

      user = {
        id: account.id,
        email: verifiedResult.email,
        role: verifiedResult.role,
        provider: verifiedResult.provider,
        metadata: verifiedResult.metadata,
      };
    }

    // Inject database client scoped to user
    let db: any = null;
    if (dbProvider.canConnect(dbUrl)) {
      db = dbProvider.getClient(user, dbUrl);
    } else {
      console.warn('DATABASE_URL not found. ReBAC enforcement will be offline.');
    }

    c.set('user', user);
    if (db) c.set('db', db);

    return await next();
  };
}
