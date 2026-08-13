import { o, type ORPCContext } from './orpc';
import { ORPCError } from '@orpc/server';
import { verifySupabaseJwt } from '../jwt';
import { createZenStackDb, canUseZenStackDb } from '@repo/database/client';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { endTime, startTime } from 'hono/timing';
import { getCurrentTraceId } from '../telemetry/otel';

// Context Builder for oRPC from incoming HTTP headers/request
export async function parseORPCContext(req: Request, env: any, requestId: string) {
  const authHeader = req.headers.get('Authorization');
  let user = { id: 'anonymous' };

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const verifiedPayload = await verifySupabaseJwt(token, env);
    if (verifiedPayload) {
      user = { id: verifiedPayload.sub };
    }
  }

  const dbUrl = env?.DATABASE_URL || process.env.DATABASE_URL;
  const db = canUseZenStackDb(dbUrl) ? createZenStackDb(user, dbUrl) : undefined;

  // Resolve headers matching request security context
  const clientHeaderSchoolId = req.headers.get('x-school-id') || '';
  const clientHeaderActiveBondId = req.headers.get('x-active-bond-id') || null;
  const clientHeaderCapacity = req.headers.get('x-capacity') || null;

  let schoolId = clientHeaderSchoolId;
  let capacity = clientHeaderCapacity;
  let activeBondId = clientHeaderActiveBondId;
  let activeEntityId: string | null = null;
  let activeEntityType: string | null = null;

  if (user.id !== 'anonymous' && db && activeBondId) {
    try {
      const activeBond = await db.bond.findFirst({
        where: { id: activeBondId, user_id: user.id },
      });
      if (activeBond) {
        const bondScope = resolveBondScope(activeBond as any);
        activeBondId = bondScope.activeBondId;
        activeEntityId = bondScope.activeEntityId;
        activeEntityType = bondScope.activeEntityType;
        capacity = (activeBond as any).capacity;
        schoolId = bondScope.schoolId || '';
      }
    } catch (err) {
      console.warn('Failed resolving active bond in oRPC context:', err);
    }
  }

  const deviceTrust = req.headers.get('x-device-trust') || 'standard';
  const networkZone = req.headers.get('x-network-zone') || 'trusted';

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

  let schoolId = c.get('schoolId') || c.req.header('x-school-id') || '';
  const requestedCapacity = c.req.header('x-capacity') || null;
  let capacity = c.get('capacity') || requestedCapacity;
  let activeBondId = c.get('activeBondId') || c.req.header('x-active-bond-id') || null;
  let activeEntityId = c.get('activeEntityId') || null;
  let activeEntityType = c.get('activeEntityType') || null;

  if (user.id !== 'anonymous' && db && !activeBondId) {
    const activeBond = await db.bond.findFirst({ where: { user_id: user.id } });
    if (activeBond) {
      const scope = resolveBondScope(activeBond);
      activeBondId = scope.activeBondId;
      activeEntityId = scope.activeEntityId;
      activeEntityType = scope.activeEntityType;
      schoolId = scope.schoolId || schoolId;
      capacity = activeBond.capacity;
      if (requestedCapacity === 'admin' && capacity !== 'admin') {
        throw new ORPCError('FORBIDDEN', { message: 'Authoritative database policy rejects the requested administrative capability.' });
      }
    }
  } else if (user.id !== 'anonymous' && db && activeBondId) {
    const activeBond = await db.bond.findFirst({
      where: { id: activeBondId, user_id: user.id },
    });
    if (activeBond) {
      const scope = resolveBondScope(activeBond);
      activeBondId = scope.activeBondId;
      activeEntityId = scope.activeEntityId;
      activeEntityType = scope.activeEntityType;
      schoolId = scope.schoolId || schoolId;
      capacity = activeBond.capacity;
    }
  }

  const classroomIds = (c.req.header('x-classroom-ids') || '')
    .split(',')
    .map((value: string) => value.trim())
    .filter(Boolean);
  const childStudentIds = (c.req.header('x-child-student-ids') || '')
    .split(',')
    .map((value: string) => value.trim())
    .filter(Boolean);

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
        grade_id: c.req.header('x-grade-id') || undefined,
        section_id: c.req.header('x-section-id') || undefined,
        classroom_ids: classroomIds,
        child_student_ids: childStudentIds,
      },
    },
    securityContext: {
      device_trust: c.req.header('x-device-trust') || 'standard',
      network_zone: c.req.header('x-network-zone') || 'trusted',
    },
    timing: {
      start: (name: string) => startTime(c, name, name),
      end: (name: string) => endTime(c, name),
    },
  };
}

export { doubleGateMiddleware } from './orpcMiddleware';

import { selfRouter } from './handlers/self';
import { profileRouter } from './handlers/profile';
import { identityRouter } from './handlers/identity';
import { onboardingRouter } from './handlers/onboarding';
import { principalNotesRouter } from './handlers/principalNotes';
import { syncRouter } from './handlers/sync';
import { dailyContentRouter } from './handlers/dailyContent';
import { libraryRouter } from './handlers/library';
import { permissionSnapshotRouter } from './handlers/permissionSnapshot';
import { educationalRouter } from './handlers/educational';
import { gradingRouter } from './handlers/grading';
import { attendanceRouter } from './handlers/attendance';
import { communityRouter } from './handlers/community';
import { adminRouter } from './handlers/admin';
import { messagingRouter } from './handlers/messaging';
import { socialRouter } from './handlers/social';
import { announcementsRouter } from './handlers/announcements';
import { guardianAssessmentRouter } from './handlers/guardianAssessment';

// Root Router initialization
export const router = o.router({
  self: selfRouter,
  profile: profileRouter,
  identity: identityRouter,
  onboarding: onboardingRouter,
  principalNotes: principalNotesRouter,
  sync: syncRouter,
  dailyContent: dailyContentRouter,
  library: libraryRouter,
  authorization: permissionSnapshotRouter,
  educational: educationalRouter,
  grading: gradingRouter,
  attendance: attendanceRouter,
  community: communityRouter,
  admin: adminRouter,
  messaging: messagingRouter,
  social: socialRouter,
  announcements: announcementsRouter,
  guardianAssessment: guardianAssessmentRouter,
});

