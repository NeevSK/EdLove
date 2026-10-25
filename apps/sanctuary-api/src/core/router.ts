import { ORPCError } from '@orpc/server';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { canUseZenStackDb, createZenStackDb } from '@repo/database/client';
import { endTime, startTime } from 'hono/timing';
import { getCurrentTraceId } from '../telemetry/otel';
import { activeScopeReader, resolvePersistedActiveBond } from './activeScope';
import { verifySupabaseSession } from './adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from './authenticatedAccount';
import { isOnboardingBootstrapProcedure } from './onboardingBootstrap';
import { type ORPCContext, o } from './orpc';

/**
 * Students the caller is a verified guardian of (parent/guardian capacity only). Cedar's
 * parent policy reads these as child_student_ids. Pending and revoked links never count.
 */
export async function resolveChildStudentIds(
  db: any,
  userId: string,
  capacity: string | null,
): Promise<string[]> {
  if (capacity !== 'parent' && capacity !== 'guardian') return [];
  try {
    const rows = await db.studentGuardianRelationship.findMany({
      where: { guardian_id: userId, verification_status: 'verified' },
      select: { student_id: true },
    });
    return [...new Set<string>((rows ?? []).map((row: any) => String(row.student_id)))];
  } catch {
    console.warn('[AUTHZ] Guardian link lookup failed; denying child scope.');
    return [];
  }
}

async function resolveClassroomIds(
  db: any,
  userId: string,
  capacity: string | null,
  schoolId: string,
): Promise<string[]> {
  try {
    if (capacity === 'teacher' || capacity === 'principal' || capacity === 'admin') {
      if (!schoolId) return [];
      const rows = await db.classroom.findMany({
        where:
          capacity === 'teacher'
            ? { teacher_id: userId, school_id: schoolId }
            : { school_id: schoolId },
        select: { id: true },
      });
      const ids = rows.map((row: { id: unknown }) => String(row.id));
      // Academic lifecycle (model A): grade classes join the same relationship set,
      // because teacher.cedar matches resource.grade_class_id against classroom_ids.
      return [...ids, ...(await resolveGradeClassIds(db, userId, capacity, schoolId))];
    }
    if (capacity === 'student') {
      const rows = await db.classroomStudent.findMany({
        where: { student_id: userId },
        select: { classroom_id: true },
      });
      return rows.map((row: { classroom_id: unknown }) => String(row.classroom_id));
    }
  } catch (error) {
    console.warn('[AUTHZ] Classroom relationship lookup failed; denying relationship scope.');
  }
  return [];
}

// Grade classes a staff member may act on. Isolated from the classroom lookup so a
// missing/unmigrated lifecycle table never removes the caller's classroom scope.
async function resolveGradeClassIds(
  db: any,
  userId: string,
  capacity: string,
  schoolId: string,
): Promise<string[]> {
  try {
    if (capacity === 'teacher') {
      const now = new Date();
      const rows = await db.gradeClassTeacherAssignment.findMany({
        where: {
          teacher_id: userId,
          status: 'active',
          effective_from: { lte: now },
          OR: [{ effective_to: null }, { effective_to: { gte: now } }],
          grade_class: { school_id: schoolId, status: 'active' },
        },
        select: { grade_class_id: true },
      });
      return [
        ...new Set<string>(
          rows.map((row: { grade_class_id: unknown }) => String(row.grade_class_id)),
        ),
      ];
    }
    const rows = await db.gradeClass.findMany({
      where: { school_id: schoolId, status: 'active' },
      select: { id: true },
    });
    return rows.map((row: { id: unknown }) => String(row.id));
  } catch (error) {
    console.warn('[AUTHZ] Grade class relationship lookup failed; keeping classroom scope only.');
    return [];
  }
}

/** Signed-in requests need the per-user DB to build an authorization context. */
function assertAuthorizationDbAvailable(userId: string, db: unknown): void {
  if (userId !== 'anonymous' && !db) {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Authorization context is temporarily unavailable. Please retry shortly.',
    });
  }
}

type ServerDerivedAuthority = Pick<
  ORPCContext,
  | 'schoolId'
  | 'capacity'
  | 'activeBondId'
  | 'activeEntityId'
  | 'activeEntityType'
  | 'principal'
  | 'securityContext'
>;

/**
 * Builds authority facts exclusively from the authenticated principal and the
 * persisted active bond. Transport headers never choose a tenant, capacity,
 * classroom scope, or guardian scope.
 */
export async function resolveServerDerivedAuthority(input: {
  user: { id: string };
  db: any;
  requestPath: string;
  missingScopeError: () => Error;
  wrapUnexpected: boolean;
}): Promise<ServerDerivedAuthority> {
  assertAuthorizationDbAvailable(input.user.id, input.db);

  let schoolId = '';
  let capacity: string | null = null;
  let activeBondId: string | null = null;
  let activeEntityId: string | null = null;
  let activeEntityType: string | null = null;
  let classroomIds: string[] = [];
  let childStudentIds: string[] = [];

  if (input.user.id !== 'anonymous' && input.db) {
    try {
      const activeBond = await resolvePersistedActiveBond(
        activeScopeReader(input.db),
        input.user.id,
      );
      if (!activeBond) {
        if (!isOnboardingBootstrapProcedure(input.requestPath)) {
          throw input.missingScopeError();
        }
      } else {
        const scope = resolveBondScope(activeBond);
        activeBondId = scope.activeBondId;
        activeEntityId = scope.activeEntityId;
        activeEntityType = scope.activeEntityType;
        capacity = activeBond.capacity;
        schoolId = scope.schoolId || '';
        classroomIds = await resolveClassroomIds(input.db, input.user.id, capacity, schoolId);
        childStudentIds = await resolveChildStudentIds(input.db, input.user.id, capacity);
      }
    } catch (error) {
      if (error instanceof ORPCError || !input.wrapUnexpected) throw error;
      console.warn('Failed resolving server-derived request authority:', error);
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Authorization context is temporarily unavailable. Please retry shortly.',
      });
    }
  }

  return {
    schoolId,
    capacity,
    activeBondId,
    activeEntityId,
    activeEntityType,
    principal: {
      id: input.user.id,
      type: capacity ?? 'unknown',
      attributes: {
        school_id: schoolId,
        active_entity_id: activeEntityId ?? '',
        active_entity_type: activeEntityType ?? '',
        capacity: capacity ?? '',
        classroom_ids: classroomIds,
        child_student_ids: childStudentIds,
      },
    },
    securityContext: {
      device_trust: 'standard',
      network_zone: 'untrusted',
    },
  };
}

// Context Builder for oRPC from incoming HTTP headers/request
export async function parseORPCContext(req: Request, env: any, requestId: string) {
  const authHeader = req.headers.get('Authorization');
  const dbUrl = env?.DATABASE_URL || process.env.DATABASE_URL;
  let user = { id: 'anonymous' };

  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) throw new ORPCError('UNAUTHORIZED');
    const token = authHeader.replace('Bearer ', '');
    const verifiedPayload = await verifySupabaseSession(token, env);
    if (!verifiedPayload) throw new ORPCError('UNAUTHORIZED');
    user = await resolveAuthenticatedAccount(verifiedPayload.sub, dbUrl);
  }

  const db = canUseZenStackDb(dbUrl) ? createZenStackDb(user, dbUrl) : undefined;

  const authority = await resolveServerDerivedAuthority({
    user,
    db,
    requestPath: new URL(req.url).pathname,
    missingScopeError: () =>
      new ORPCError('FORBIDDEN', {
        message: 'Select a valid active scope before accessing this resource.',
      }),
    wrapUnexpected: true,
  });

  return {
    db,
    user,
    ...authority,
    requestId,
    requestPath: new URL(req.url).pathname,
    requestMethod: req.method,
    traceId: undefined,
  };
}

/**
 * Builds the procedure context from Hono's request-scoped variables.
 *
 * The Hono middleware chain has already authenticated the request and created
 * the request-scoped database before an oRPC route is reached. Reusing those
 * values avoids a second JWT verification and a second database instance.
 */
export async function buildORPCContextFromHono(c: any): Promise<ORPCContext> {
  const user = c.get('user') || { id: 'anonymous' };
  const db = c.get('db');
  const requestId = c.get('requestId') || 'unknown';

  const authority = await resolveServerDerivedAuthority({
    user,
    db,
    requestPath: c.req.path,
    missingScopeError: () =>
      new ORPCError('FORBIDDEN', {
        message: 'An active capacity is required before accessing this resource.',
      }),
    wrapUnexpected: false,
  });

  return {
    db,
    user,
    ...authority,
    requestId,
    requestPath: c.req.path,
    requestMethod: c.req.method,
    traceId: getCurrentTraceId(),
    timing: {
      start: (name: string) => startTime(c, name, name),
      end: (name: string) => endTime(c, name),
    },
  };
}

export { doubleGateMiddleware } from './orpcMiddleware';

import {
  selfDomainRouter,
  workspaceDomainRouter,
  libraryDomainRouter,
  communityDomainRouter,
  identityDomainRouter,
  canonicalDomainRouter,
  // Domain handlers
  adminRouter,
  agentRouter,
  announcementsRouter,
  attendanceRouter,
  channelRouter,
  communityRouter,
  dailyContentRouter,
  decisionJournalRouter,
  echoRouter,
  editorialRouter,
  educationalRouter,
  erpRouter,
  eventsRouter,
  formsRouter,
  gradingRouter,
  guardianAssessmentRouter,
  historyRouter,
  identityRouter,
  inventoryRouter,
  journalEntriesRouter,
  learningReflectionsRouter,
  libraryRouter,
  longitudinalRouter,
  mappingRouter,
  mediaRouter,
  messagingRouter,
  onboardingRouter,
  permissionSnapshotRouter,
  planBridgeRouter,
  presenceRouter,
  principalNotesRouter,
  privacyRouter,
  profileRouter,
  rewardsRouter,
  sacredMissionsRouter,
  schoolForestRouter,
  selfRouter,
  socialRouter,
  studentPotentialRouter,
  syncRouter,
  thuthimalRouter,
  trackingRouter,
  warmMirrorRouter,
  workspaceProvisioningRouter,
} from '../domains';

export {
  selfDomainRouter,
  workspaceDomainRouter,
  libraryDomainRouter,
  communityDomainRouter,
  identityDomainRouter,
  canonicalDomainRouter,
};

// Root Router initialization: Canonical Bounded Contexts with complete backward compatibility facades
export const router = o.router({
  // --- Canonical Sanctuary Bounded Contexts ---
  workspace: workspaceDomainRouter,
  self: selfDomainRouter,
  library: libraryDomainRouter,
  community: communityDomainRouter,
  identity: identityDomainRouter,

  // --- Backward Compatibility Facades (Direct Zero-Overhead Aliases for Existing Clients) ---
  events: eventsRouter,
  learningReflections: learningReflectionsRouter,
  profile: profileRouter,
  onboarding: onboardingRouter,
  principalNotes: principalNotesRouter,
  sync: syncRouter,
  dailyContent: dailyContentRouter,
  decisionJournal: decisionJournalRouter,
  journalEntries: journalEntriesRouter,
  sacredMissions: sacredMissionsRouter,
  authorization: permissionSnapshotRouter,
  educational: educationalRouter,
  classroom: educationalRouter,
  editorial: editorialRouter,
  grading: gradingRouter,
  attendance: attendanceRouter,
  channel: channelRouter,
  admin: adminRouter,
  messaging: messagingRouter,
  social: socialRouter,
  announcements: announcementsRouter,
  guardianAssessment: guardianAssessmentRouter,
  agent: agentRouter,
  thuthimal: thuthimalRouter,
  erp: erpRouter,
  mapping: mappingRouter,
  inventory: inventoryRouter,
  history: historyRouter,
  longitudinal: longitudinalRouter,
  schoolForest: schoolForestRouter,
  media: mediaRouter,
  tracking: trackingRouter,
  warmMirror: warmMirrorRouter,
  presence: presenceRouter,
  privacy: privacyRouter,
  rewards: rewardsRouter,
  echoes: echoRouter,
  studentPotential: studentPotentialRouter,
  forms: formsRouter,
  planBridge: planBridgeRouter,
  workspaceProvisioning: workspaceProvisioningRouter,
});
