import { ORPCError } from '@orpc/server';
import { educationalORPCContract } from '@repo/core/api/educational.orpc.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { check as checkCedar } from '@repo/policies';
import { evaluateWithRust } from '../authorization/rustEvaluator';
import { toSafeErrorTelemetry } from '../telemetry/safeErrorTelemetry';
import { resolveGradeMarkAuthority } from './gradingAuthority';
import { getOpenAPIMeta, getPolicyMeta, type ORPCContext, o } from './orpc';

const protocolCodeByStatus: Readonly<Partial<Record<number, string>>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_REQUESTS',
  503: 'SERVICE_UNAVAILABLE',
};

/**
 * ZenStack ORM errors from the policy-enforced client (see policyDb.ts). Matched by their
 * `reason` field so this module needs no ORM import: a policy rejection is a 403, and a row the caller
 * may not see (filtered out by a read rule) is a 404, never a 500.
 */
function policyErrorCode(error: unknown): 'FORBIDDEN' | 'NOT_FOUND' | null {
  if (!error || typeof error !== 'object' || typeof (error as any).reason !== 'string') return null;
  const reason = (error as any).reason;
  if (reason === 'rejected-by-policy') return 'FORBIDDEN';
  if (reason === 'not-found') return 'NOT_FOUND';
  return null;
}

export function toORPCError(error: unknown, requestId?: string): ORPCError<string, unknown> {
  if (error instanceof ORPCError) return error;
  const policyCode = policyErrorCode(error);
  if (policyCode) {
    return new ORPCError(policyCode, {
      message: policyCode === 'FORBIDDEN' ? 'You do not have access to this record.' : 'Not found.',
      data: { code: policyCode, requestId },
    });
  }
  if (!(error instanceof SovereignError)) {
    return new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'An unexpected platform error occurred.',
      data: { code: 'INTERNAL_SERVER_ERROR', requestId },
    });
  }
  const code = protocolCodeByStatus[error.details.status] ?? 'INTERNAL_SERVER_ERROR';
  return new ORPCError(code, {
    message: error.details.detail || error.details.title,
    data: { code: error.details.code, requestId: error.details.instance ?? requestId },
  });
}

/**
 * Bootstrap procedures cannot use the authorization gate that requires an
 * active bond, but they must still preserve the shared typed error wire.
 */
export const sovereignErrorMiddleware = o.middleware(async ({ next, context }) => {
  try {
    return await next({});
  } catch (error) {
    if (!(error instanceof SovereignError) && !(error instanceof ORPCError)) {
      console.error('[oRPC] unexpected procedure failure', {
        ...toSafeErrorTelemetry(error, 'INTERNAL_SERVER_ERROR', 500),
        requestId: context.requestId,
      });
    }
    throw toORPCError(error, context.requestId);
  }
});

function authorityProjection(input: Record<string, unknown>): Record<string, unknown> {
  const projection: Record<string, unknown> = {};
  for (const channel of ['params', 'query', 'body'] as const) {
    const values = input[channel];
    if (!values || typeof values !== 'object' || Array.isArray(values)) continue;
    for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
      if (value === undefined) continue;
      if (key in projection && JSON.stringify(projection[key]) !== JSON.stringify(value)) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Conflicting request values cannot be authorized safely.',
        });
      }
      projection[key] = value;
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      projection[camelKey] ??= value;
      projection[snakeKey] ??= value;
    }
  }
  return projection;
}

/**
 * Batch bodies (arrays) carry no top-level facts, so Cedar would see no grade class and
 * deny. For attendance batches, project only keys whose value is identical across every
 * item; a batch spanning several grade classes projects no gradeClassId and stays denied.
 */
function uniformBatchProjection(input: Record<string, unknown>): Record<string, unknown> {
  const items = input.body;
  if (!Array.isArray(items) || items.length === 0) return {};
  if (!items.every((item) => item && typeof item === 'object' && !Array.isArray(item))) return {};
  const [first, ...rest] = items as Record<string, unknown>[];
  const projection: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(first ?? {})) {
    if (value === undefined || (value !== null && typeof value === 'object')) continue;
    if (rest.every((item) => item[key] === value)) projection[key] = value;
  }
  return projection;
}

/** Shared procedure boundary: Cedar authorization plus sanitized oRPC errors. */
export const doubleGateMiddleware = o.middleware(async ({ next, procedure, context }, input) => {
  const startedAt = performance.now();
  const policy = getPolicyMeta(procedure) ?? (procedure['~orpc']?.meta as any)?.policy;
  const procedureName =
    (procedure['~orpc'] as any)?.path ??
    context.requestPath?.split('/').filter(Boolean).pop() ??
    'unknown';

  // Never allow an anonymous request to reach a protected procedure, even if
  // a contract was accidentally published without policy metadata.
  if (context.user.id === 'anonymous') {
    throw new ORPCError('FORBIDDEN', { message: 'Authentication is required.' });
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
      message: 'This operation is temporarily unavailable.',
    });
  }

  const cedarAction = policy.action;
  const resourceType = policy.subject;
  const rawProcedureInput = (Array.isArray(input) ? input[0] : (input ?? {})) as Record<
    string,
    unknown
  >;
  const procedureInput = {
    ...(['DailyAttendance', 'AttendanceSession'].includes(resourceType)
      ? uniformBatchProjection(rawProcedureInput)
      : {}),
    ...authorityProjection(rawProcedureInput),
  };
  const selfScopedResource = new Set([
    'MoodLog',
    'FireJournal',
    'LearningReflection',
    'JoyMoments',
    'GratitudeEntries',
    'EnergyForecasts',
    'Wellbeing',
    'UserRewards',
    'WhisperedMoment',
  ]).has(resourceType);
  const requestedUserId =
    typeof procedureInput.userId === 'string' ? procedureInput.userId : undefined;
  const selfScopedTargetId = requestedUserId ?? context.user.id;
  const authorizationFacts: Record<string, unknown> = {};
  if (resourceType === 'GradeMark' && (cedarAction === 'grade' || cedarAction === 'publish')) {
    Object.assign(
      authorizationFacts,
      await resolveGradeMarkAuthority(context, procedureInput, cedarAction),
    );
  }
  const openapiMeta = getOpenAPIMeta(procedure);
  const rawRoutePath = openapiMeta?.path ?? (procedure['~orpc'] as any)?.route?.path;
  const routePath = rawRoutePath ? rawRoutePath.replace(/\{([A-Za-z0-9_]+)\}/g, ':$1') : undefined;
  const classroomChild =
    routePath === educationalORPCContract.updateMaterial.path
      ? 'material'
      : routePath === educationalORPCContract.updateAssignment.path
        ? 'assignment'
        : undefined;
  if (resourceType === 'Classroom' && classroomChild) {
    if (!context.db) {
      throw new ORPCError('SERVICE_UNAVAILABLE', { message: 'Database is unavailable.' });
    }
    const childId = procedureInput.id;
    if (typeof childId !== 'string') {
      throw new ORPCError('BAD_REQUEST', { message: 'A resource identifier is required.' });
    }
    const lookup = { where: { id: childId }, select: { classroom_id: true } } as const;
    const child =
      classroomChild === 'material'
        ? await context.db.material.findUnique(lookup)
        : await context.db.assignment.findUnique(lookup);
    if (!child) throw new ORPCError('NOT_FOUND', { message: 'Resource was not found.' });
    const classroom = await context.db.classroom.findUnique({
      where: { id: child.classroom_id },
      select: { id: true, school_id: true },
    });
    if (!classroom) throw new ORPCError('NOT_FOUND', { message: 'Classroom was not found.' });
    if (classroom.school_id !== (context.schoolId ?? null)) {
      throw new ORPCError('FORBIDDEN', { message: 'Resource is outside the active school.' });
    }
    authorizationFacts.classroomId = classroom.id;
  }
  if (context.db && resourceType === 'ClassroomNote' && !procedureInput.classroomId) {
    const noteId =
      typeof procedureInput.id === 'string'
        ? procedureInput.id
        : typeof procedureInput.recordId === 'string'
          ? procedureInput.recordId
          : undefined;
    if (noteId) {
      const note = await context.db.classroomNote.findUnique({
        where: { id: noteId },
        select: { classroom_id: true, author_id: true, classroom: { select: { school_id: true } } },
      });
      if (note) {
        if (note.classroom.school_id !== (context.schoolId ?? null)) {
          throw new ORPCError('FORBIDDEN', { message: 'Resource is outside the active school.' });
        }
        authorizationFacts.id = noteId;
        authorizationFacts.classroomId = note.classroom_id;
        authorizationFacts.schoolId = note.classroom.school_id;
        authorizationFacts.authorId = note.author_id;
      }
    }
  }
  if (context.db && resourceType === 'AssignmentSubmission' && !procedureInput.classroomId) {
    const assignmentId =
      typeof procedureInput.assignmentId === 'string' ? procedureInput.assignmentId : undefined;
    if (assignmentId) {
      const assignment = await context.db.assignment.findUnique({
        where: { id: assignmentId },
        select: { classroom_id: true, classroom: { select: { school_id: true } } },
      });
      if (assignment?.classroom_id) authorizationFacts.classroomId = assignment.classroom_id;
      if (assignment?.classroom.school_id)
        authorizationFacts.schoolId = assignment.classroom.school_id;
    }
  }
  if (context.db && resourceType === 'PrincipalNote' && !procedureInput.schoolId) {
    const noteId = typeof procedureInput.id === 'string' ? procedureInput.id : undefined;
    if (noteId) {
      const note = await context.db.principalNote.findUnique({
        where: { id: noteId },
        select: { school_id: true, author_id: true },
      });
      if (note?.school_id) authorizationFacts.schoolId = String(note.school_id);
      if (note?.author_id) authorizationFacts.authorId = String(note.author_id);
    }
  }
  const facts = { ...procedureInput, ...authorizationFacts };
  if (
    resourceType === 'PrincipalNote' &&
    cedarAction !== 'create' &&
    authorizationFacts.authorId &&
    authorizationFacts.authorId !== context.user.id
  ) {
    throw new ORPCError('FORBIDDEN', { message: 'You do not own this principal note.' });
  }
  const verifiedClassroomIds = context.principal.attributes.classroom_ids;
  const defaultVerifiedClassroomId =
    Array.isArray(verifiedClassroomIds) && typeof verifiedClassroomIds[0] === 'string'
      ? verifiedClassroomIds[0]
      : undefined;
  const resourceId =
    resourceType === 'OperationReceipt'
      ? String(facts.operationId ?? facts.idempotencyKey ?? context.user.id)
      : resourceType === 'User'
        ? context.user.id
        : resourceType === 'School'
          ? context.schoolId || 'school_institutional'
          : resourceType === 'AssignmentSubmission'
            ? (typeof facts.id === 'string' && facts.id) ||
              (typeof facts.assignmentId === 'string' && facts.assignmentId) ||
              context.schoolId ||
              'school_institutional'
            : resourceType === 'Classroom'
              ? (typeof facts.classroomId === 'string' && facts.classroomId) ||
                (typeof facts.id === 'string' && facts.id) ||
                (context.capacity === 'student' && defaultVerifiedClassroomId) ||
                context.schoolId ||
                'school_institutional'
              : (selfScopedResource && selfScopedTargetId) ||
                (typeof facts.id === 'string' && facts.id) ||
                (typeof facts.gradeClassId === 'string' && facts.gradeClassId) ||
                (typeof facts.classroomId === 'string' && facts.classroomId) ||
                (typeof facts.studentId === 'string' && facts.studentId) ||
                (typeof facts.commentId === 'string' && facts.commentId) ||
                (typeof facts.postId === 'string' && facts.postId) ||
                (typeof facts.groupId === 'string' && facts.groupId) ||
                (typeof facts.targetUserId === 'string' && facts.targetUserId) ||
                context.schoolId ||
                'school_institutional';
  const request = {
    principal: context.principal,
    action: cedarAction,
    resource: {
      id: resourceId,
      type: resourceType,
      attributes: {
        ...(resourceType === 'OperationReceipt' && { account_id: context.user.id }),
        ...(resourceType !== 'School' &&
          resourceType !== 'OperationReceipt' && { school_id: context.schoolId }),
        ...(resourceType === 'Classroom' &&
          typeof facts.teacherId === 'string' && { teacher_id: facts.teacherId }),
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
          typeof facts.classroomId === 'string' && {
            classroom_id: facts.classroomId,
          }),
        ...(['DailyAttendance', 'AttendanceSession'].includes(resourceType) &&
          typeof (procedureInput.gradeClassId ?? procedureInput.classroomId) === 'string' && {
            grade_class_id: (procedureInput.gradeClassId ?? procedureInput.classroomId) as string,
          }),
        ...(resourceType === 'GradeMark' &&
          typeof facts.gradeClassId === 'string' && {
            grade_class_id: facts.gradeClassId,
          }),
        ...(resourceType === 'GradeMark' &&
          typeof facts.schoolId === 'string' && { school_id: facts.schoolId }),
        ...(resourceType === 'GradeMark' &&
          typeof authorizationFacts.teacherId === 'string' && {
            teacher_id: authorizationFacts.teacherId,
          }),
        ...([
          'Grade',
          'GradeMark',
          'AttendanceRecord',
          'DailyAttendance',
          'AttendanceSession',
          'AssignmentSubmission',
        ].includes(resourceType) &&
          typeof facts.studentId === 'string' && { student_id: facts.studentId }),
        ...(resourceType === 'AssignmentSubmission' &&
          typeof facts.assignmentId === 'string' && {
            assignment_id: facts.assignmentId,
          }),
        ...(resourceType === 'AssignmentSubmission' &&
          typeof facts.classroomId === 'string' && {
            classroom_id: facts.classroomId,
          }),
        ...(resourceType === 'AssignmentSubmission' &&
          cedarAction === 'create' && { student_id: context.user.id }),
        ...(resourceType === 'CommunityCommentUpvote' &&
          typeof procedureInput.commentId === 'string' && { comment_id: procedureInput.commentId }),
        ...((resourceType === 'CommunityComment' || resourceType === 'CommunityPollVote') &&
          typeof procedureInput.postId === 'string' && { post_id: procedureInput.postId }),
        ...(selfScopedResource && { user_id: selfScopedTargetId }),
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
          author_id:
            typeof authorizationFacts.authorId === 'string'
              ? authorizationFacts.authorId
              : context.user.id,
          ...(typeof facts.schoolId === 'string' && {
            school_id: facts.schoolId,
          }),
        }),
        ...(resourceType === 'Notification' && { user_id: context.user.id }),
        ...(resourceType === 'FormTemplate' && { owner_id: context.user.id }),
        ...(resourceType === 'EditorialSubmission' && { submitter_id: context.user.id }),
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
      message: 'You do not have permission to perform this operation.',
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
    throw toORPCError(error, context.requestId);
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
