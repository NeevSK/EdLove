import { type FeatureUsage, trackingContract } from '@repo/core/api/tracking.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(trackingContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapUsage = (row: any): FeatureUsage => ({
  id: String(row.id),
  user_id: String(row.user_id),
  feature_name: String(row.feature_name),
  interaction_type: String(row.interaction_type ?? 'exploration'),
  created_at: new Date(row.created_at).toISOString(),
});

export const trackingRouter = impl.router({
  listExploredFeatures: impl.listExploredFeatures
    .use(doubleGateMiddleware)
    .handler(async ({ context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<{ feature_name: string }>(
        'select distinct feature_name from public.feature_usage_log where user_id = $1::uuid order by feature_name asc',
        [context.user.id],
      );
      return rows.map((row) => row.feature_name);
    }),

  logFeatureUsage: impl.logFeatureUsage
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const existing = await queryDatabaseRows<any>(
        'select id, user_id, feature_name, interaction_type, created_at from public.feature_usage_log where user_id = $1::uuid and feature_name = $2 limit 1',
        [context.user.id, input.body.featureName],
      );
      if (existing[0]) return mapUsage(existing[0]);
      const rows = await queryDatabaseRows<any>(
        'insert into public.feature_usage_log (user_id, feature_name, interaction_type) values ($1::uuid, $2, $3) returning id, user_id, feature_name, interaction_type, created_at',
        [context.user.id, input.body.featureName, input.body.interactionType],
      );
      return mapUsage(rows[0]);
    }),
});
