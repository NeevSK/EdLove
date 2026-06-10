import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  adaptToHono,
  adminContract,
  adminHandlers,
  communityContract,
  communityHandlers,
  dailyContentContract,
  dailyContentHandlers,
  educationalContract,
  educationalHandlers,
  gradingContract,
  gradingHandlers,
  identityContract,
  identityHandlers,
  libraryContract,
  libraryHandlers,
  operationsContract,
  operationsHandlers,
  profileContract,
  profileHandlers,
  type SovereignRoute,
  selfContract,
  selfHandlers,
  syncContract,
  syncHandlers,
} from '@repo/core/api/server';
import { canUseZenStackDb, createZenStackDb } from '@repo/database';
import { check as checkCedar } from '@repo/policies';
import { verifySupabaseJwt } from './jwt';

interface Env {
  Variables: {
    db: ReturnType<typeof createZenStackDb>;
    user: { id: string };
  };
}

const app = new OpenAPIHono<Env>();

// --- 1. Global Middleware ---
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header('x-request-id', requestId);

  // CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  c.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-school-id, x-capacity, x-grade-id, x-section-id, x-classroom-ids, x-child-student-ids, x-device-trust, x-network-zone',
  );

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  console.log(`[${requestId}] ${c.req.method} ${c.req.url}`);
  await next();
});

// --- 2. Sovereign Auth & ZenStack (ReBAC) Middleware ---
app.use('/api/*', async (c, next) => {
  // 1. Resolve User from Header using Authoritative Asymmetric Cryptographic JWT Verification
  const authHeader = c.req.header('Authorization');
  let user = { id: 'anonymous' };

  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid Authorization header format. Must be Bearer token.',
        },
        401,
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const verifiedPayload = await verifySupabaseJwt(token);

    if (!verifiedPayload) {
      return c.json(
        {
          error: 'Unauthorized',
          message:
            'Authoritative cryptographic identity verification failed (Invalid or Expired JWT).',
        },
        401,
      );
    }

    user = { id: verifiedPayload.sub };
  }

  // 2. Inject ZenStack Enhanced DB
  let db: ReturnType<typeof createZenStackDb> | null = null;
  if (canUseZenStackDb()) {
    db = createZenStackDb(user);
  } else {
    console.warn('DATABASE_URL not found. ReBAC enforcement will be offline.');
  }

  c.set('user', user);
  if (db) c.set('db', db);

  return await next();
});

// --- 3. Cedar Server Gate Check Middleware (Dynamic Route-level PEP) ---
async function getRequestSecurityContext(c: any) {
  const user = c.get('user') || { id: 'anonymous' };
  const db = c.get('db');
  const isAnonymousUser = user.id === 'anonymous';

  let school_id = '';
  let capacity = 'teacher';
  let grade_id: string | undefined;
  let section_id: string | undefined;
  let classroom_ids: string[] = [];
  let child_student_ids: string[] = [];

  const clientHeaderSchoolId = c.req.header('x-school-id') || '';
  const clientHeaderCapacity = c.req.header('x-capacity') || 'teacher';
  const clientHeaderGradeId = c.req.header('x-grade-id') || undefined;
  const clientHeaderSectionId = c.req.header('x-section-id') || undefined;

  const xClassroomIds = c.req.header('x-classroom-ids');
  const clientHeaderClassroomIds = xClassroomIds
    ? xClassroomIds.split(',').map((id: string) => id.trim())
    : [];

  const xChildIds = c.req.header('x-child-student-ids');
  const clientHeaderChildIds = xChildIds ? xChildIds.split(',').map((id: string) => id.trim()) : [];

  let hydratedFromDb = false;
  if (!isAnonymousUser && db) {
    try {
      const activeBond = (await db.bond.findFirst({
        where: { user_id: user.id },
      })) as any;
      if (activeBond) {
        capacity = activeBond.capacity;
        if (activeBond.entity_type === 'SCHOOL') {
          school_id = activeBond.entity_id || '';
        }
        hydratedFromDb = true;
      }
    } catch (err) {
      console.warn('Server failed to resolve active bond from DB:', err);
    }
  }

  if (!hydratedFromDb) {
    school_id = clientHeaderSchoolId;
    capacity = isAnonymousUser ? 'wanderer' : clientHeaderCapacity;
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  } else {
    if (clientHeaderCapacity === 'admin' && capacity !== 'admin') {
      console.warn(
        `[SENTINEL SECURITY ALERT] Blocked header privilege escalation attempt by user "${user.id}"`,
      );
      throw new Error('PrivilegeEscalation');
    }
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  }

  const deviceTrust =
    c.req.header('x-device-trust') || c.req.header('x-device-status') || 'standard';
  const networkZone = c.req.header('x-network-zone') || 'trusted';

  return {
    user,
    db,
    principal: {
      id: user.id,
      type: capacity,
      attributes: {
        school_id,
        capacity,
        grade_id,
        section_id,
        classroom_ids,
        child_student_ids,
      },
    },
    context: {
      device_trust: deviceTrust,
      network_zone: networkZone,
    },
    school_id,
    capacity,
  };
}

function poa(route: SovereignRoute) {
  return async (c: any, next: any) => {
    if (c.req.method.toLowerCase() !== route.method.toLowerCase()) {
      return await next();
    }

    // Special bypass for resolveIdentity bootstrapping
    if (c.req.path.includes('/identity/resolveIdentity')) {
      return await next();
    }

    let securityContext;
    try {
      securityContext = await getRequestSecurityContext(c);
    } catch (err: any) {
      if (err.message === 'PrivilegeEscalation') {
        return c.json(
          {
            error: 'Forbidden',
            message:
              'Authoritative database policy rejects the requested administrative capability.',
          },
          403,
        );
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }

    const { user, principal, context, school_id, capacity } = securityContext;
    const policy = route.metadata.policy;
    const cedarAction = policy.action;
    const resourceType = policy.subject;

    let resourceId = school_id || 'school_institutional';
    const params = c.req.param();
    const paramKeys = Object.keys(params);
    if (paramKeys.length > 0) {
      if (params.id) {
        resourceId = params.id;
      } else if (params.userId) {
        resourceId = params.userId;
      } else if (params.studentId) {
        resourceId = params.studentId;
      } else if (params.classroomId) {
        resourceId = params.classroomId;
      } else if (params.classroomStudentId) {
        resourceId = params.classroomStudentId;
      } else if (params.teacherId) {
        resourceId = params.teacherId;
      } else if (params.schoolId) {
        resourceId = params.schoolId;
      } else if (params.principalId) {
        resourceId = params.principalId;
      } else if (params.insightId) {
        resourceId = params.insightId;
      } else if (params.token) {
        resourceId = params.token;
      } else if (params.workspaceId) {
        resourceId = params.workspaceId;
      } else {
        resourceId = params[paramKeys[0]];
      }
    } else {
      if (resourceType === 'User') {
        resourceId = user.id;
      } else if (resourceType === 'MoodLog') {
        resourceId = 'user_mood_log';
      } else if (resourceType === 'FireJournal') {
        resourceId = 'user_fire_journal';
      } else if (resourceType === 'JoyMoments') {
        resourceId = 'user_joy_moment';
      } else if (resourceType === 'GratitudeEntries') {
        resourceId = 'user_gratitude_entry';
      }
    }

    let bodyClassroomId: string | undefined;
    const method = c.req.method.toUpperCase();
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const cloned = c.req.raw.clone();
        const bodyJson = await cloned.json();
        bodyClassroomId = bodyJson?.classroom_id ?? bodyJson?.classroomId;
      } catch {
        // Body is not JSON or cannot be read, ignore gracefully
      }
    }

    const authResult = checkCedar({
      principal,
      action: cedarAction,
      resource: {
        id: resourceId,
        type: resourceType,
        attributes: {
          ...(resourceType !== 'School' && { school_id }),
          ...(bodyClassroomId && { classroom_id: bodyClassroomId }),
          ...((resourceType === 'MoodLog' ||
            resourceType === 'FireJournal' ||
            resourceType === 'JoyMoments' ||
            resourceType === 'GratitudeEntries' ||
            resourceType === 'EnergyForecasts') && { user_id: user.id }),
        },
      },
      context,
    });

    if (!authResult.permitted) {
      return c.json(
        {
          error: 'Forbidden',
          message: 'Access denied by authoritative Cedar policy engine (Double Gate Enforcement).',
          reason: authResult.reason,
          gaps: authResult.gaps,
        },
        403,
      );
    }

    if (capacity === 'admin') {
      console.info(
        `[SENTINEL AUDIT LOG] Platform Admin Action Authorized:
         - Operator ID: "${user.id}"
         - Action: "${cedarAction}"
         - Target Resource: "${resourceType}::${resourceId}"
         - Path: "${c.req.method} ${c.req.path}"
         - Device Trust: "${context.device_trust}"
         - Network Zone: "${context.network_zone}"
         - Status: APPROVED & AUDITED`,
      );
    }

    return await next();
  };
}

function registerRoute(apiApp: OpenAPIHono<any>, route: SovereignRoute, handler: any) {
  apiApp.use(route.path, poa(route));
  apiApp.openapi(adaptToHono(route), handler);
}

// Sovereign Routes (Vertical Slice: SELF)
const selfApp = new OpenAPIHono();
registerRoute(selfApp, selfContract.logMood, selfHandlers.logMood);
registerRoute(selfApp, selfContract.getMoodHistory, selfHandlers.getMoodHistory);
registerRoute(selfApp, selfContract.burnJournal, selfHandlers.burnJournal);
registerRoute(selfApp, selfContract.getJournalHistory, selfHandlers.getJournalHistory);
registerRoute(selfApp, selfContract.getTodayMood, selfHandlers.getTodayMood);
registerRoute(selfApp, selfContract.getPreferences, selfHandlers.getPreferences);
registerRoute(selfApp, selfContract.updatePreferences, selfHandlers.updatePreferences);

// Sovereign Routes (Vertical Slice: PROFILE)
const profileApp = new OpenAPIHono();
registerRoute(profileApp, profileContract.getUserProfile, profileHandlers.getUserProfile);
registerRoute(profileApp, profileContract.updateProfile, profileHandlers.updateProfile);
registerRoute(profileApp, profileContract.getJourneySnapshot, profileHandlers.getJourneySnapshot);
registerRoute(profileApp, profileContract.getSchoolPulse, profileHandlers.getSchoolPulse);

// Sovereign Routes (Vertical Slice: COMMUNITY)
const communityApp = new OpenAPIHono();
registerRoute(communityApp, communityContract.getGroups, communityHandlers.getGroups);
registerRoute(communityApp, communityContract.getGroup, communityHandlers.getGroup);
registerRoute(communityApp, communityContract.createGroup, communityHandlers.createGroup);
registerRoute(communityApp, communityContract.joinGroup, communityHandlers.joinGroup);
registerRoute(communityApp, communityContract.getPosts, communityHandlers.getPosts);
registerRoute(communityApp, communityContract.createPost, communityHandlers.createPost);
registerRoute(communityApp, communityContract.toggleReaction, communityHandlers.toggleReaction);

// Sovereign Routes (Vertical Slice: DAILY CONTENT)
const dailyContentApp = new OpenAPIHono();
registerRoute(dailyContentApp, dailyContentContract.getToday, dailyContentHandlers.getToday);
registerRoute(dailyContentApp, dailyContentContract.getForDate, dailyContentHandlers.getForDate);
registerRoute(dailyContentApp, dailyContentContract.getRecent, dailyContentHandlers.getRecent);

// Sovereign Routes (Vertical Slice: EDUCATIONAL)
const educationalApp = new OpenAPIHono();
registerRoute(educationalApp, educationalContract.getByTeacher, educationalHandlers.getByTeacher);
registerRoute(educationalApp, educationalContract.getById, educationalHandlers.getById);
registerRoute(
  educationalApp,
  educationalContract.getClassroomResources,
  educationalHandlers.getClassroomResources,
);
registerRoute(educationalApp, educationalContract.createLesson, educationalHandlers.createLesson);

// Sovereign Routes (Vertical Slice: GRADING)
const gradingApp = new OpenAPIHono();
registerRoute(gradingApp, gradingContract.getReportCard, gradingHandlers.getReportCard);
registerRoute(gradingApp, gradingContract.getClassroomGrades, gradingHandlers.getClassroomGrades);
registerRoute(gradingApp, gradingContract.submitGrade, gradingHandlers.submitGrade);
registerRoute(gradingApp, gradingContract.publishGrade, gradingHandlers.publishGrade);
registerRoute(gradingApp, gradingContract.getGradingSettings, gradingHandlers.getGradingSettings);

// Sovereign Routes (Vertical Slice: OPERATIONS)
const operationsApp = new OpenAPIHono();
registerRoute(operationsApp, operationsContract.getAttendance, operationsHandlers.getAttendance);
registerRoute(
  operationsApp,
  operationsContract.recordAttendance,
  operationsHandlers.recordAttendance,
);
registerRoute(
  operationsApp,
  operationsContract.batchRecordAttendance,
  operationsHandlers.batchRecordAttendance,
);
registerRoute(
  operationsApp,
  operationsContract.getSchoolAttendancePulse,
  operationsHandlers.getSchoolAttendancePulse,
);

// Sovereign Routes (Vertical Slice: IDENTITY)
const identityApp = new OpenAPIHono();
registerRoute(
  identityApp,
  identityContract.identifyActiveCitizen,
  identityHandlers.resolveIdentity,
);
registerRoute(identityApp, identityContract.fetchUserProfile, identityHandlers.getProfile);
registerRoute(
  identityApp,
  identityContract.resolveWorkspaceContext,
  identityHandlers.getClassroomCapacitySummary,
);
registerRoute(identityApp, identityContract.modifyUserProfile, identityHandlers.updateProfile);

// Sovereign Routes (Vertical Slice: ADMIN)
const adminApp = new OpenAPIHono();
registerRoute(adminApp, adminContract.getStaffPresence, adminHandlers.getStaffPresence);
registerRoute(adminApp, adminContract.getTeacherCarousel, adminHandlers.getTeacherCarousel);
registerRoute(adminApp, adminContract.submitLeave, adminHandlers.submitLeave);
registerRoute(adminApp, adminContract.getSchool, adminHandlers.getSchool);

// Sovereign Routes (Vertical Slice: LIBRARY)
const libraryApp = new OpenAPIHono();
registerRoute(libraryApp, libraryContract.getResources, libraryHandlers.getResources);
registerRoute(libraryApp, libraryContract.getResource, libraryHandlers.getResource);
registerRoute(libraryApp, libraryContract.searchLibrary, libraryHandlers.searchLibrary);
registerRoute(libraryApp, libraryContract.engage, libraryHandlers.engage);
registerRoute(libraryApp, libraryContract.getCollections, libraryHandlers.getCollections);
registerRoute(libraryApp, libraryContract.getCollection, libraryHandlers.getCollection);

app.route('/api', selfApp);
app.route('/api', profileApp);
app.route('/api', communityApp);
app.route('/api', dailyContentApp);
app.route('/api', educationalApp);
app.route('/api', gradingApp);
app.route('/api', operationsApp);
app.route('/api', identityApp);
app.route('/api', adminApp);
app.route('/api', libraryApp);

// Sovereign Routes (Vertical Slice: SYNC)
const syncApp = new OpenAPIHono();
registerRoute(syncApp, syncContract.uploadPowerSyncBatch, syncHandlers.uploadPowerSyncBatch);
app.route('/api', syncApp);

// --- 4. Documentation ---
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    title: 'Sanctuary API',
    version: '2026.1.0',
    description: 'Sovereign API Gateway (ZenStack v3.6.4 + Zod v4)',
  },
});

app.get('/ui', swaggerUI({ url: '/doc' }));

// --- 5. Launch ---
const port = Number(process.env.PORT) || 3000;
console.log(`Sanctuary API standing guard on port ${port}`);

if (process.env.NODE_ENV !== 'test') {
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
export type AppType = unknown;
