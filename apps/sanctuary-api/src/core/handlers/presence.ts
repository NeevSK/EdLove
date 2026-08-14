import { presenceContract } from '@repo/core/api/presence.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(presenceContract).$context<ORPCContext>();
const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

export const presenceRouter = impl.router({
  getFallbackCount: impl.getFallbackCount
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const query = input.query ?? {};
      const periodStart = new Date(Date.now() - (query.windowMs ?? 300_000)).toISOString();
      const capacities = (query.targetCapacities ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const params: unknown[] = [periodStart];
      let sql =
        'select count(*)::int as count from public.users where last_seen_at >= $1::timestamptz';
      if (!query.cumulative && capacities.length > 0) {
        params.push(capacities);
        sql += ` and capacity = any($${params.length}::text[])`;
      }
      if (query.cumulative) {
        params.push(context.user.id);
        sql += ` and id <> $${params.length}::uuid`;
      }
      const rows = await queryDatabaseRows<{ count: number }>(sql, params);
      return { count: Number(rows[0]?.count ?? 0) };
    }),

  markSeen: impl.markSeen.use(doubleGateMiddleware).handler(async ({ context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<{ last_seen_at: string }>(
      'update public.users set last_seen_at = now() where id = $1::uuid returning last_seen_at',
      [context.user.id],
    );
    return { seenAt: new Date(rows[0]?.last_seen_at ?? Date.now()).toISOString() };
  }),
});
