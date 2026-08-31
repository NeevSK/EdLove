import { ORPCError } from '@orpc/server';
import { applyPowerSyncBatch, syncContract } from '@repo/core/api/server';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(syncContract).$context<ORPCContext>();

export const syncRouter = impl.router({
  uploadBatch: impl.uploadBatch.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (context.user.id === 'anonymous') {
      throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
    }
    if (!context.db) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Database context not initialized',
      });
    }

    return applyPowerSyncBatch(
      context.db,
      input.body.crud,
      input.body.idempotencyKey,
      context.user.id,
    );
  }),
});
