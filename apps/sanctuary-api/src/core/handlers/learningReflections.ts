import { learningReflectionsContract } from '@repo/core/api/server';
import { SovereignError } from '@repo/core/types/Errors';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(learningReflectionsContract).$context<ORPCContext>();

const asIsoString = (value: unknown) =>
  value instanceof Date ? value.toISOString() : String(value ?? new Date().toISOString());

const mapLearningReflection = (row: any) => ({
  id: String(row.id),
  user_id: String(row.user_id),
  classroom_id: row.classroom_id ?? null,
  assignment_id: row.assignment_id ?? null,
  thought: String(row.thought),
  situation: row.situation ?? null,
  emotion: row.emotion ?? null,
  trap_ids: row.trap_ids ?? null,
  evidence_for: row.evidence_for ?? null,
  evidence_against: row.evidence_against ?? null,
  reframe: row.reframe ?? null,
  mood_before: row.mood_before ?? null,
  mood_after: row.mood_after ?? null,
  post_outcome: row.post_outcome ?? null,
  follow_up: row.follow_up ?? null,
  idempotency_key: row.idempotency_key ?? null,
  created_at: asIsoString(row.created_at),
});

export const learningReflectionsRouter = impl.router({
  saveLearningReflection: impl.saveLearningReflection
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await context.db.learningReflection.create({
        data: {
          ...input.body,
          user_id: context.user.id,
        },
      });
      return mapLearningReflection(row);
    }),

  getLearningReflections: impl.getLearningReflections
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const where: Record<string, unknown> = { user_id: context.user.id };
      if (input.query.classroom_id) where.classroom_id = input.query.classroom_id;
      if (input.query.assignment_id) where.assignment_id = input.query.assignment_id;

      const rows = await context.db.learningReflection.findMany({
        where,
        take: input.query.limit ?? 30,
        orderBy: { created_at: 'desc' },
      });
      return rows.map(mapLearningReflection);
    }),

  completeLearningReflectionFollowUp: impl.completeLearningReflectionFollowUp
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      assertDatabase(context);
      const row = await context.db.learningReflection.update({
        where: { id: input.params.id },
        data: {
          post_outcome: input.body.post_outcome,
          follow_up: input.body.follow_up,
        },
      });
      return mapLearningReflection(row);
    }),
});
