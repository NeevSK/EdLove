import { implement, ORPCError } from '@orpc/server';
import { appContract } from '@repo/core/api/v1/contract';
import type { PoolClient } from 'pg';
import type { Platform } from '../platform';
import type { AuthenticatedIdentity } from '../security/security';
import {
  cancelAccountDeletion,
  readAccountDeletion,
  requestAccountDeletion,
} from '../security/accountDeletion';
import type { APIContext } from './context';

const api = implement(appContract)
  .$context<APIContext>()
  .use(({ context, next }) => {
    if (!context.identity || !context.platform) throw new ORPCError('UNAUTHORIZED');
    return next({ context: { identity: context.identity, platform: context.platform } });
  });

/** Account-only work as the account itself; a database failure reads as unavailable, never as detail. */
export async function asAccount<T>(
  context: {
    identity: AuthenticatedIdentity;
    platform: Pick<Platform, 'withAccountData'>;
  },
  signal: AbortSignal | undefined,
  work: (db: PoolClient) => Promise<T>,
): Promise<T> {
  try {
    return await context.platform.withAccountData(
      context.identity,
      signal ?? AbortSignal.timeout(5000),
      work,
    );
  } catch (error) {
    if (error instanceof ORPCError) throw error;
    throw new ORPCError('SERVICE_UNAVAILABLE');
  }
}

export const router = api.router({
  identity: {
    session: api.identity.session.handler(({ context }) => ({
      accountId: context.identity.accountId,
      expiresAt: context.identity.expiresAt,
    })),
    scopes: api.identity.scopes.handler(async ({ context, signal }) => ({
      scopes: await context.platform.security.listScopes(
        context.identity,
        signal ?? AbortSignal.timeout(5000),
      ),
    })),
    entry: api.identity.entry.handler(({ context, signal }) =>
      context.platform.security.readEntry(context.identity, signal ?? AbortSignal.timeout(5000)),
    ),
    createInitialBond: api.identity.createInitialBond.handler(({ input, context, signal }) =>
      context.platform.security.createInitialBond(
        context.identity,
        input,
        signal ?? AbortSignal.timeout(5000),
      ),
    ),
    syncGrant: api.identity.syncGrant.handler(({ context }) => {
      const grants = context.platform.syncGrants;
      if (!grants) throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Sync is not configured.' });
      return grants.issue(context.identity);
    }),
    deletion: {
      status: api.identity.deletion.status.handler(({ context, signal }) =>
        asAccount(context, signal, readAccountDeletion),
      ),
      request: api.identity.deletion.request.handler(({ context, signal }) =>
        asAccount(context, signal, requestAccountDeletion),
      ),
      cancel: api.identity.deletion.cancel.handler(({ context, signal }) =>
        asAccount(context, signal, cancelAccountDeletion),
      ),
    },
  },
  authority: {
    refreshSnapshot: api.authority.refreshSnapshot.handler(({ input, context, signal }) =>
      context.platform.security.issueSnapshot(
        context.identity,
        input.bondId,
        signal ?? AbortSignal.timeout(5000),
      ),
    ),
  },
});
