import { ORPCError } from '@orpc/server';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { canUseZenStackDb, createZenStackDb } from '@repo/database/client';
import { endTime, startTime } from 'hono/timing';
import { verifySupabaseJwt } from '../jwt';
import { getCurrentTraceId } from '../telemetry/otel';
import { activeScopeReader, resolvePersistedActiveBond } from './activeScope';
import { resolveAuthenticatedAccount } from './authenticatedAccount';
import { isOnboardingBootstrapProcedure } from './onboardingBootstrap';
import { type ORPCContext, o } from './orpc';

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
      return rows.map((row: { id: unknown }) => String(row.id));
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

// Context Builder for oRPC from incoming HTTP headers/request
export async function parseORPCContext(req: Request, env: any, requestId: string) {
  const authHeader = req.headers.get('Authorization');
  const dbUrl = env?.DATABASE_URL || process.env.DATABASE_URL;
  let user = { id: 'anonymous' };

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const verifiedPayload = await verifySupabaseJwt(token, env);
    if (verifiedPayload) {
      user = await resolveAuthenticatedAccount(verifiedPayload.sub, dbUrl);
    }
  }

  const db = canUseZenStackDb(dbUrl) ? createZenStackDb(user, dbUrl) : undefined;

  if (user.id !== 'anonymous' && !db) {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Authorization context is temporarily unavailable. Please retry shortly.',
    });
  }

  let schoolId = '';
  let capacity: string | null = null;
  let activeBondId: string | null = null;
  let activeEntityId: string | null = null;
  let activeEntityType: string | null = null;
  let classroomIds: string[] = [];

  if (user.id !== 'anonymous' && db) {
    try {
      const activeBond = await resolvePersistedActiveBond(activeScopeReader(db), user.id);
      if (!activeBond) {
        if (!isOnboardingBootstrapProcedure(new URL(req.url).pathname)) {
          throw new ORPCError('FORBIDDEN', {
            message: 'Select a valid active scope before accessing this resource.',
          });
        }
      } else {
        const bondScope = resolveBondScope(activeBond);
        activeBondId = bondScope.activeBondId;
        activeEntityId = bondScope.activeEntityId;
        activeEntityType = bondScope.activeEntityType;
        capacity = activeBond.capacity;
        schoolId = bondScope.schoolId || '';
        classroomIds = await resolveClassroomIds(db, user.id, capacity, schoolId);
      }
    } catch (err) {
      if (err instanceof ORPCError) throw err;
      console.warn('Failed resolving active bond in oRPC context:', err);
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Authorization context is temporarily unavailable. Please retry shortly.',
      });
    }
  }

  const deviceTrust = 'standard';
  const networkZone = 'untrusted';

  return {
    db,
    user,
    schoolId,
    capacity,
    activeBondId,
    activeEntityId,
    activeEntityType,
    requestId,
    requestPath: new URL(req.url).pathname,
    requestMethod: req.method,
    traceId: undefined,
    principal: {
      id: user.id,
      type: capacity ?? 'unknown',
      attributes: {
        school_id: schoolId,
        active_entity_id: activeEntityId ?? '',
        active_entity_type: activeEntityType ?? '',
        capacity: capacity ?? '',
        classroom_ids: classroomIds,
        child_student_ids: [],
      },
    },
    securityContext: {
      device_trust: deviceTrust,
      network_zone: networkZone,
    },
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

  if (user.id !== 'anonymous' && !db) {
    throw new ORPCError('SERVICE_UNAVAILABLE', {
      message: 'Authorization context is temporarily unavailable. Please retry shortly.',
    });
  }

  let schoolId = '';
  let capacity: string | null = null;
  let activeBondId: string | null = null;
  let activeEntityId: string | null = null;
  let activeEntityType: string | null = null;
  let classroomIds: string[] = [];

  if (user.id !== 'anonymous' && db) {
    const activeBond = await resolvePersistedActiveBond(activeScopeReader(db), user.id);
    if (!activeBond && !isOnboardingBootstrapProcedure(c.req.path)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'An active capacity is required before accessing this resource.',
      });
    }
    if (activeBond) {
      const scope = resolveBondScope(activeBond);
      activeBondId = scope.activeBondId;
      activeEntityId = scope.activeEntityId;
      activeEntityType = scope.activeEntityType;
      schoolId = scope.schoolId || '';
      capacity = activeBond.capacity;
      classroomIds = await resolveClassroomIds(db, user.id, capacity, schoolId);
    }
  }

  return {
    db,
    user,
    schoolId,
    capacity,
    activeBondId,
    activeEntityId,
    activeEntityType,
    requestId,
    requestPath: c.req.path,
    requestMethod: c.req.method,
    traceId: getCurrentTraceId(),
    principal: {
      id: user.id,
      type: capacity ?? 'unknown',
      attributes: {
        school_id: schoolId,
        active_entity_id: activeEntityId ?? '',
        active_entity_type: activeEntityType ?? '',
        capacity: capacity ?? '',
        classroom_ids: classroomIds,
        child_student_ids: [],
      },
    },
    securityContext: {
      device_trust: 'standard',
      network_zone: 'untrusted',
    },
    timing: {
      start: (name: string) => startTime(c, name, name),
      end: (name: string) => endTime(c, name),
    },
  };
}

export { doubleGateMiddleware } from './orpcMiddleware';

import { adminRouter } from './handlers/admin';
import { agentRouter } from './handlers/agent';
import { announcementsRouter } from './handlers/announcements';
import { attendanceRouter } from './handlers/attendance';
import { channelRouter } from './handlers/channel';
import { communityRouter } from './handlers/community';
import { dailyContentRouter } from './handlers/dailyContent';
import { decisionJournalRouter } from './handlers/decisionJournal';
import { echoRouter } from './handlers/echo';
import { editorialRouter } from './handlers/editorial';
import { educationalRouter } from './handlers/educational';
import { erpRouter } from './handlers/erp';
import { eventsRouter } from './handlers/events';
import { formsRouter } from './handlers/forms';
import { gradingRouter } from './handlers/grading';
import { guardianAssessmentRouter } from './handlers/guardianAssessment';
import { historyRouter } from './handlers/history';
import { identityRouter } from './handlers/identity';
import { inventoryRouter } from './handlers/inventory';
import { journalEntriesRouter } from './handlers/journalEntries';
import { learningReflectionsRouter } from './handlers/learningReflections';
import { libraryRouter } from './handlers/library';
import { longitudinalRouter } from './handlers/longitudinal';
import { mappingRouter } from './handlers/mapping';
import { mediaRouter } from './handlers/media';
import { messagingRouter } from './handlers/messaging';
import { onboardingRouter } from './handlers/onboarding';
import { permissionSnapshotRouter } from './handlers/permissionSnapshot';
import { presenceRouter } from './handlers/presence';
import { principalNotesRouter } from './handlers/principalNotes';
import { privacyRouter } from './handlers/privacy';
import { profileRouter } from './handlers/profile';
import { rewardsRouter } from './handlers/rewards';
import { sacredMissionsRouter } from './handlers/sacredMissions';
import { schoolForestRouter } from './handlers/schoolForest';
import { selfRouter } from './handlers/self';
import { socialRouter } from './handlers/social';
import { studentPotentialRouter } from './handlers/studentPotential';
import { syncRouter } from './handlers/sync';
import { thuthimalRouter } from './handlers/thuthimal';
import { trackingRouter } from './handlers/tracking';
import { warmMirrorRouter } from './handlers/warmMirror';

// Root Router initialization
export const router = o.router({
  events: eventsRouter,
  self: selfRouter,
  learningReflections: learningReflectionsRouter,
  profile: profileRouter,
  identity: identityRouter,
  onboarding: onboardingRouter,
  principalNotes: principalNotesRouter,
  sync: syncRouter,
  dailyContent: dailyContentRouter,
  decisionJournal: decisionJournalRouter,
  journalEntries: journalEntriesRouter,
  sacredMissions: sacredMissionsRouter,
  library: libraryRouter,
  authorization: permissionSnapshotRouter,
  educational: educationalRouter,
  editorial: editorialRouter,
  grading: gradingRouter,
  attendance: attendanceRouter,
  community: communityRouter,
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
});
