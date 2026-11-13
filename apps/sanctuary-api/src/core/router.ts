import { implement, ORPCError } from '@orpc/server';
import { appContract } from '@repo/core/api/v1/contract';
import type { APIContext } from './context';

const api = implement(appContract)
  .$context<APIContext>()
  .use(({ context, next }) => {
    if (!context.identity || !context.platform) throw new ORPCError('UNAUTHORIZED');
    return next({ context: { identity: context.identity, platform: context.platform } });
  });

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
