import { implement, ORPCError } from '@orpc/server';
import { syncContract } from '@repo/core/api/server';
import { applyPowerSyncBatch } from '@repo/core/api/server';
import type { ORPCContext } from '../orpc';
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
      input.crud,
      input.idempotencyKey ?? input.batchId,
    );
  }),
});
