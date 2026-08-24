import { ORPCError } from '@orpc/server';
import { SovereignError } from '@repo/core/types/Errors';
import { check as checkCedar } from '@repo/policies';
import { evaluateWithRust } from '../authorization/rustEvaluator';
import { type ORPCContext, o } from './orpc';

function toORPCError(error: unknown): unknown {
  if (!(error instanceof SovereignError)) return error;
  const status = error.details.status;
  const code =
    status === 400
      ? 'BAD_REQUEST'
      : status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status === 409
              ? 'CONFLICT'
              : status === 429
                ? 'TOO_MANY_REQUESTS'
                : status === 503
                  ? 'SERVICE_UNAVAILABLE'
                  : 'INTERNAL_SERVER_ERROR';
  return new ORPCError(code, {
    message: error.details.detail || error.details.title,
    data: { code: error.details.code, requestId: error.details.instance },
  });
}

/** Shared procedure boundary: Cedar authorization plus sanitized oRPC errors. */
export const doubleGateMiddleware = o.middleware(async ({ next, procedure, context }, input) => {
  const startedAt = performance.now();
  const policy = (procedure['~orpc'].meta as any)?.policy;
  const procedureName =
    (procedure['~orpc'] as any)?.path ??
    context.requestPath?.split('/').filter(Boolean).pop() ??
    'unknown';

  // Never allow an anonymous request to reach a protected procedure, even if
  // a contract was accidentally published without policy metadata.
  if (context.user.id === 'anonymous') {
    throw new ORPCError('FORBIDDEN', { message: 'Access denied for anonymous principal' });
  }
  if (!policy) {
    // Protected procedures must never degrade to authentication-only access.
    // Contract conversion rejects this earlier; this guard protects dynamically
    // composed procedures and future middleware changes as well.
    console.error(
      JSON.stringify({
        event: 'orpc.authorization.missing_policy',
        procedure: procedureName,
        path: context.requestPath,
        requestId: context.requestId,
      }),
    );
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: `Authorization policy is not configured for procedure ${procedureName}`,
    });
  }

  const cedarAction = policy.action;
  const resourceType = policy.subject;
  const procedureInput = (Array.isArray(input) ? input[0] : (input ?? {})) as Record<
    string,
    unknown
  >;
  const resourceId =
    resourceType === 'User'
      ? context.user.id
      : resourceType === 'School'
        ? context.schoolId || 'school_institutional'
        : resourceType === 'AssignmentSubmission'
          ? (typeof procedureInput.id === 'string' && procedureInput.id) ||
            (typeof procedureInput.assignmentId === 'string' && procedureInput.assignmentId) ||
            context.schoolId ||
            'school_institutional'
          : resourceType === 'Classroom'
            ? (typeof procedureInput.classroomId === 'string' && procedureInput.classroomId) ||
              (typeof procedureInput.id === 'string' && procedureInput.id) ||
              context.schoolId ||
              'school_institutional'
            : (typeof procedureInput.id === 'string' && procedureInput.id) ||
              (typeof procedureInput.gradeClassId === 'string' && procedureInput.gradeClassId) ||
              (typeof procedureInput.classroomId === 'string' && procedureInput.classroomId) ||
              (typeof procedureInput.studentId === 'string' && procedureInput.studentId) ||
              (typeof procedureInput.commentId === 'string' && procedureInput.commentId) ||
              (typeof procedureInput.postId === 'string' && procedureInput.postId) ||
              (typeof procedureInput.groupId === 'string' && procedureInput.groupId) ||
              (typeof procedureInput.targetUserId === 'string' && procedureInput.targetUserId) ||
              context.schoolId ||
              'school_institutional';
  const selfScopedResource = new Set([
    'MoodLog',
    'FireJournal',
    'JoyMoments',
    'GratitudeEntries',
    'EnergyForecasts',
    'Wellbeing',
  ]).has(resourceType);
  const request = {
    principal: context.principal,
    action: cedarAction,
    resource: {
      id: resourceId,
      type: resourceType,
      attributes: {
        ...(resourceType !== 'School' && { school_id: context.schoolId }),
        ...(resourceType === 'Classroom' &&
          typeof procedureInput.teacherId === 'string' && { teacher_id: procedureInput.teacherId }),
        ...(resourceType === 'Announcement' &&
          typeof procedureInput.schoolId === 'string' && { school_id: procedureInput.schoolId }),
        ...(resourceType === 'Announcement' &&
          cedarAction === 'create' && { author_id: context.user.id }),
        ...([
          'Grade',
          'AttendanceRecord',
          'AssignmentSubmission',
          'ClassroomNote',
          'Material',
          'Assignment',
        ].includes(resourceType) &&
          typeof procedureInput.classroomId === 'string' && {
            classroom_id: procedureInput.classroomId,
          }),
        ...(['DailyAttendance', 'AttendanceSession'].includes(resourceType) &&
          typeof procedureInput.gradeClassId === 'string' && {
            grade_class_id: procedureInput.gradeClassId,
          }),
        ...(resourceType === 'GradeMark' &&
          typeof procedureInput.gradeClassId === 'string' && {
            grade_class_id: procedureInput.gradeClassId,
          }),
        ...(resourceType === 'GradeMark' &&
          typeof procedureInput.schoolId === 'string' && { school_id: procedureInput.schoolId }),
        ...([
          'Grade',
          'GradeMark',
          'AttendanceRecord',
          'DailyAttendance',
          'AttendanceSession',
          'AssignmentSubmission',
        ].includes(resourceType) &&
          typeof procedureInput.studentId === 'string' && { student_id: procedureInput.studentId }),
        ...(resourceType === 'AssignmentSubmission' &&
          typeof procedureInput.assignmentId === 'string' && {
            assignment_id: procedureInput.assignmentId,
          }),
        ...(resourceType === 'AssignmentSubmission' &&
          typeof procedureInput.classroomId === 'string' && {
            classroom_id: procedureInput.classroomId,
          }),
        ...(resourceType === 'AssignmentSubmission' &&
          cedarAction === 'create' && { student_id: context.user.id }),
        ...(resourceType === 'CommunityCommentUpvote' &&
          typeof procedureInput.commentId === 'string' && { comment_id: procedureInput.commentId }),
        ...((resourceType === 'CommunityComment' || resourceType === 'CommunityPollVote') &&
          typeof procedureInput.postId === 'string' && { post_id: procedureInput.postId }),
        ...(selfScopedResource && { user_id: context.user.id }),
        ...(resourceType === 'UserBlock' && {
          blocker_id: context.user.id,
          ...(typeof procedureInput.targetUserId === 'string' && {
            blocked_id: procedureInput.targetUserId,
          }),
        }),
        ...(resourceType === 'Bond' && {
          user_id: context.user.id,
          entity_id:
            typeof procedureInput.schoolId === 'string' ? procedureInput.schoolId : undefined,
          entity_type: 'SCHOOL',
        }),
        ...(resourceType === 'PrincipalNote' && {
          author_id: context.user.id,
          ...(typeof procedureInput.schoolId === 'string' && {
            school_id: procedureInput.schoolId,
          }),
        }),
        ...(resourceType === 'Notification' && { user_id: context.user.id }),
        ...(resourceType === 'FormTemplate' && { owner_id: context.user.id }),
        ...(resourceType === 'UserBlock' && { blocker_id: context.user.id }),
        ...(resourceType === 'DirectMessage' &&
          cedarAction === 'create' && { author_id: context.user.id }),
        ...(resourceType === 'DirectConversation' &&
          cedarAction === 'create' && {
            user1_id: context.user.id,
            target_user_id:
              typeof procedureInput.targetUserId === 'string'
                ? procedureInput.targetUserId
                : undefined,
          }),
      },
    },
    context: context.securityContext,
  };

  context.timing?.start('cedar');
  const authResult =
    process.env.SANCTUARY_AUTHZ_EVALUATOR === 'rust'
      ? await evaluateWithRust(request as any, context.requestId)
      : checkCedar(request as any);
  context.timing?.end('cedar');

  if (!authResult.permitted) {
    throw new ORPCError('FORBIDDEN', {
      message: `Access denied by Cedar policy engine for ${cedarAction} on ${resourceType}`,
    });
  }
  if (context.capacity === 'admin') {
    console.info(
      JSON.stringify({
        event: 'orpc.authorization',
        userId: context.user.id,
        action: cedarAction,
        subject: resourceType,
        resourceId,
        requestId: context.requestId,
        result: 'allow',
      }),
    );
  }
  let result;
  try {
    result = await next({});
  } catch (error) {
    throw toORPCError(error);
  }
  console.info(
    JSON.stringify({
      event: 'orpc.procedure',
      procedure: procedureName,
      path: context.requestPath,
      method: context.requestMethod,
      requestId: context.requestId,
      traceId: context.traceId,
      userId: context.user.id,
      subject: resourceType,
      action: cedarAction,
      authorization: 'allow',
      status: 'ok',
      durationMs: Math.round(performance.now() - startedAt),
    }),
  );
  return result;
});

export type { ORPCContext };
