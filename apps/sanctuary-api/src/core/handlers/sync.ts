import { ORPCError } from '@orpc/server';
import { applyPowerSyncBatch, syncContract } from '@repo/core/api/server';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(syncContract).$context<ORPCContext>();

export const syncRouter = impl.router({
  getMutationReceipt: impl.getMutationReceipt
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Database context not initialized',
        });
      }

      const rows = await context.db.$queryRaw<Array<{ status: string; error: string | null }>>`
      select status, error
      from public.platform_worker_events
      where event_name like 'sync/%'
        and entity_id = ${input.params.mutationId}
        and payload->>'actorId' = ${context.user.id}
      order by updated_at desc
      limit 1
    `;
      const receipt = rows[0];
      if (!receipt) {
        return { mutationId: input.params.mutationId, status: 'pending' as const };
      }
      return {
        mutationId: input.params.mutationId,
        status: receipt.status === 'completed' ? ('completed' as const) : ('failed' as const),
        error: receipt.error,
      };
    }),
  uploadBatch: impl.uploadBatch.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    if (context.user.id === 'anonymous') {
      throw new ORPCError('FORBIDDEN', { message: 'Authentication required' });
    }
    if (!context.db) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: 'Database context not initialized',
      });
    }

    const profile = await context.db.user.findUnique({
      where: { id: context.user.id },
      select: { citizenship: true, is_anonymous: true },
    });
    if (profile?.is_anonymous === true || profile?.citizenship === 'THIRD_CLASS') {
      throw new ORPCError('FORBIDDEN', {
        message: 'Local-only identities cannot synchronize account data.',
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
