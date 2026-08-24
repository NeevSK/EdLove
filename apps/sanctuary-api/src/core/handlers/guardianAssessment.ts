import { ORPCError } from '@orpc/server';
import { guardianAssessmentORPCContract } from '@repo/core/api/guardian-assessment.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';
import {
  GuardianAssessmentServiceError,
  readGuardianPublishedAssessmentSummary,
} from '../services/guardianAssessment';

const impl = implement(guardianAssessmentORPCContract).$context<ORPCContext>();

export const guardianAssessmentRouter = impl.router({
  getPublishedAssessmentSummary: impl.getPublishedAssessmentSummary
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      if (context.user.id === 'anonymous') {
        throw new ORPCError('FORBIDDEN', { message: `unauthenticated:${context.requestId}` });
      }
      if (!context.db) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: `database_unavailable:${context.requestId}`,
        });
      }

      try {
        return await readGuardianPublishedAssessmentSummary(context.db as any, {
          guardianId: context.user.id,
          studentId: input.studentId,
          limit: input.limit,
          cursor: input.cursor,
          requestId: context.requestId,
        });
      } catch (error) {
        if (error instanceof GuardianAssessmentServiceError) {
          const status =
            error.category === 'invalid_cursor'
              ? 'BAD_REQUEST'
              : error.category === 'relationship_denied' || error.category === 'permission_denied'
                ? 'FORBIDDEN'
                : 'INTERNAL_SERVER_ERROR';
          throw new ORPCError(status, { message: `${error.category}:${context.requestId}` });
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: `database_unavailable:${context.requestId}`,
        });
      }
    }),
});
