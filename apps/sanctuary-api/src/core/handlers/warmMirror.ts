import { type WarmMirrorDataPoints, warmMirrorContract } from '@repo/core/api/warmMirror.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(warmMirrorContract).$context<ORPCContext>();

const requireScope = async (context: ORPCContext, userId: string) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
  if (context.user.id === userId) return;
  const viewer = await context.db.user.findUnique({
    where: { id: context.user.id },
    select: { capacity: true, school_id: true },
  });
  const target = await context.db.user.findUnique({
    where: { id: userId },
    select: { school_id: true },
  });
  const allowed = ['admin', 'principal', 'assistant_principal', 'assistantPrincipal'];
  if (
    !viewer ||
    !target ||
    viewer.school_id !== target.school_id ||
    !allowed.includes(viewer.capacity ?? '')
  ) {
    throw SovereignError.unauthorized('read', 'wellbeing');
  }
};

export const warmMirrorRouter = impl.router({
  getDataPoints: impl.getDataPoints
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await requireScope(context, input.params.userId);
      const periodStart = input.query.since ?? new Date(Date.now() - 7 * 86400000).toISOString();
      const [growthEvents, quiet, ripples, feedback, reached, sparked, growthState] =
        await Promise.all([
          queryDatabaseRows<{ created_at: string }>(
            'select created_at from public.growth_events where user_id = $1::uuid and created_at >= $2::timestamptz',
            [input.params.userId, periodStart],
          ),
          queryDatabaseRows<{ count: number }>(
            'select count(*)::int as count from public.growth_events where user_id = $1::uuid and created_at >= $2::timestamptz and event_type = any($3::text[])',
            [
              input.params.userId,
              periodStart,
              ['mood_checkin', 'breathing_exercise_complete', 'fire_journal_entry'],
            ],
          ),
          queryDatabaseRows<{ count: number }>(
            'select count(*)::int as count from public.impact_ripples where recipient_user_id = $1::uuid and delivered = true and delivered_at >= $2::timestamptz',
            [input.params.userId, periodStart],
          ),
          queryDatabaseRows<{ count: number }>(
            'select count(*)::int as count from public.student_grades where student_id = $1::uuid and created_at >= $2::timestamptz and feedback is not null and length(feedback) > 20',
            [input.params.userId, periodStart],
          ),
          queryDatabaseRows<{ count: number }>(
            'select count(distinct entity_id)::int as count from public.impact_ripples where recipient_user_id = $1::uuid and delivered = true and ripple_type = any($3::text[]) and delivered_at >= $2::timestamptz and entity_id is not null',
            [
              input.params.userId,
              periodStart,
              ['resource_saved', 'resource_read', 'lesson_accessed'],
            ],
          ),
          queryDatabaseRows<{ count: number }>(
            "select count(*)::int as count from public.impact_ripples where recipient_user_id = $1::uuid and ripple_type = 'post_sparked' and delivered = true and delivered_at >= $2::timestamptz",
            [input.params.userId, periodStart],
          ),
          queryDatabaseRows<{ created_at: string | null }>(
            'select created_at from public.user_growth_state where user_id = $1::uuid limit 1',
            [input.params.userId],
          ),
        ]);
      const joinedAt = growthState[0]?.created_at
        ? new Date(growthState[0].created_at)
        : new Date();
      const distinctDays = new Set(growthEvents.map((event) => event.created_at.slice(0, 10))).size;
      const result: WarmMirrorDataPoints = {
        days_present: distinctDays,
        quiet_moments: Number(quiet[0]?.count ?? 0),
        ripples_received: Number(ripples[0]?.count ?? 0),
        assignments_with_feedback: Number(feedback[0]?.count ?? 0),
        resources_that_reached_others: Number(reached[0]?.count ?? 0),
        posts_that_sparked: Number(sparked[0]?.count ?? 0),
        days_since_joined: Math.max(0, Math.floor((Date.now() - joinedAt.getTime()) / 86400000)),
      };
      return result;
    }),
});
