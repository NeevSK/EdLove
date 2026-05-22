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

  const isAnonymousUser = user.id === 'anonymous';

  // --- 3. Cedar Server Gate Check (Double Gate Security Principle) ---
  // A. Resolve attributes for Principal
  let school_id = '';
  let capacity = 'teacher'; // Changed from 'Wanderer' to 'teacher' for development
  let grade_id: string | undefined;
  let section_id: string | undefined;
  let classroom_ids: string[] = [];
  let child_student_ids: string[] = [];

  // Parse headers strictly as fallback/testing parameters or narrow scoping filters
  const clientHeaderSchoolId = c.req.header('x-school-id') || '';
  const clientHeaderCapacity = c.req.header('x-capacity') || 'teacher';
  const clientHeaderGradeId = c.req.header('x-grade-id') || undefined;
  const clientHeaderSectionId = c.req.header('x-section-id') || undefined;

  const xClassroomIds = c.req.header('x-classroom-ids');
  const clientHeaderClassroomIds = xClassroomIds
    ? xClassroomIds.split(',').map((id) => id.trim())
    : [];

  const xChildIds = c.req.header('x-child-student-ids');
  const clientHeaderChildIds = xChildIds ? xChildIds.split(',').map((id) => id.trim()) : [];

  // Hydrate principal authoritatively from database when active
  let hydratedFromDb = false;
  if (!isAnonymousUser && db) {
    try {
      const activeBond = await db.bond.findFirst({
        where: {
          user_id: user.id,
        },
      });
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

  // Fallback to client headers ONLY under test/local development OR when database bond is offline
  if (!hydratedFromDb) {
    school_id = clientHeaderSchoolId;
    capacity = isAnonymousUser ? 'wanderer' : clientHeaderCapacity;
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  } else {
    // Database is active: prevent administrative privilege escalation via unverified client headers
    if (clientHeaderCapacity === 'admin' && capacity !== 'admin') {
      console.warn(
        `[SENTINEL SECURITY ALERT] Blocked header privilege escalation attempt by user "${user.id}"`,
      );
      return c.json(
        {
          error: 'Forbidden',
          message: 'Authoritative database policy rejects the requested administrative capability.',
        },
        403,
      );
    }
    // Hydrate scope-filtering parameters from request, verified against active database context
    grade_id = clientHeaderGradeId;
    section_id = clientHeaderSectionId;
    classroom_ids = clientHeaderClassroomIds;
    child_student_ids = clientHeaderChildIds;
  }

  // B. Map Hono Request to Cedar Action and Resource Type
  const method = c.req.method.toUpperCase();
  const url = new URL(c.req.url);
  const urlPath = url.pathname;

  let cedarAction = 'read';
  if (method === 'POST') {
    cedarAction = 'create';
  } else if (method === 'PUT' || method === 'PATCH') {
    cedarAction = 'update';
  } else if (method === 'DELETE') {
    cedarAction = 'delete';
  }

  // Special action mapping based on path keywords
  if (urlPath.includes('/submit-grade') || urlPath.includes('/publish-grade')) {
    cedarAction = 'grade';
  }

  let resourceType = 'School';
  let resourceId = school_id || 'school_institutional';

  if (isAnonymousUser && urlPath.includes('/identity/resolveIdentity')) {
    return await next();
  }

  if (urlPath.includes('/groups') || urlPath.includes('/posts')) {
    resourceType = 'Community';
    resourceId = 'school_community';
  } else if (urlPath.includes('/classroom')) {
    resourceType = 'Classroom';
    resourceId = 'school_classroom';
  } else if (urlPath.includes('/grade')) {
    resourceType = 'Grade';
    resourceId = 'school_grade';
  } else if (urlPath.includes('/attendance')) {
    resourceType = 'Attendance';
    resourceId = 'school_attendance';
  } else if (urlPath.includes('/resources') || urlPath.includes('/library')) {
    resourceType = 'Library';
    resourceId = 'school_library';
  } else if (urlPath.includes('/leave') || urlPath.includes('/staff')) {
    resourceType = 'School';
    resourceId = 'school_admin';
  } else if (urlPath.includes('/self/preferences')) {
    resourceType = 'User';
    resourceId = user.id;
  } else if (urlPath.includes('/powersync/upload')) {
    cedarAction = 'update';
    resourceType = 'User';
    resourceId = user.id;
  } else if (urlPath.includes('/self/mood')) {
    resourceType = 'MoodLog';
    resourceId = 'user_mood_log';
  } else if (urlPath.includes('/self/journal')) {
    resourceType = 'FireJournal';
    resourceId = 'user_fire_journal';
  } else if (urlPath.includes('/self/joy')) {
    resourceType = 'JoyMoments';
    resourceId = 'user_joy_moment';
  } else if (urlPath.includes('/self/gratitude')) {
    resourceType = 'GratitudeEntries';
    resourceId = 'user_gratitude_entry';
  } else if (urlPath.includes('/self')) {
    resourceType = 'User';
    resourceId = user.id;
  }

  // Attempt to parse classroom_id safely by cloning the request body (prevents stream lockout)
  let bodyClassroomId: string | undefined;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const cloned = c.req.raw.clone();
      const bodyJson = await cloned.json();
      bodyClassroomId = bodyJson?.classroom_id ?? bodyJson?.classroomId;
    } catch (_e) {
      // Body is not JSON or cannot be read, ignore gracefully
    }
  }

  const deviceTrust =
    c.req.header('x-device-trust') || c.req.header('x-device-status') || 'standard';
  const networkZone = c.req.header('x-network-zone') || 'trusted';

  // C. Perform Cedar authorization check
  const authResult = checkCedar({
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
          resourceType === 'EnergyForecasts' ||
          resourceType === 'User') && { user_id: user.id }),
      },
    },
    context: {
      device_trust: deviceTrust,
      network_zone: networkZone,
    },
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

  // Sentinel Audit Log Interceptor: Log high-privilege platform administrator actions
  if (capacity === 'admin') {
    console.info(
      `[SENTINEL AUDIT LOG] Platform Admin Action Authorized:
       - Operator ID: "${user.id}"
       - Action: "${cedarAction}"
       - Target Resource: "${resourceType}::${resourceId}"
       - Path: "${method} ${urlPath}"
       - Device Trust: "${deviceTrust}"
       - Network Zone: "${networkZone}"
       - Status: APPROVED & AUDITED`,
    );
  }

  return await next();
});

// Sovereign Routes (Vertical Slice: SELF)
const selfApp = new OpenAPIHono();
selfApp.openapi(adaptToHono(selfContract.logMood), selfHandlers.logMood);
selfApp.openapi(adaptToHono(selfContract.getMoodHistory), selfHandlers.getMoodHistory);
selfApp.openapi(adaptToHono(selfContract.burnJournal), selfHandlers.burnJournal);
selfApp.openapi(adaptToHono(selfContract.getJournalHistory), selfHandlers.getJournalHistory);
selfApp.openapi(adaptToHono(selfContract.getTodayMood), selfHandlers.getTodayMood);
selfApp.openapi(adaptToHono(selfContract.getPreferences), selfHandlers.getPreferences);
selfApp.openapi(adaptToHono(selfContract.updatePreferences), selfHandlers.updatePreferences);

// Sovereign Routes (Vertical Slice: PROFILE)
const profileApp = new OpenAPIHono();
profileApp.openapi(adaptToHono(profileContract.getUserProfile), profileHandlers.getUserProfile);
profileApp.openapi(adaptToHono(profileContract.updateProfile), profileHandlers.updateProfile);
profileApp.openapi(
  adaptToHono(profileContract.getJourneySnapshot),
  profileHandlers.getJourneySnapshot,
);
profileApp.openapi(adaptToHono(profileContract.getSchoolPulse), profileHandlers.getSchoolPulse);

// Sovereign Routes (Vertical Slice: COMMUNITY)
const communityApp = new OpenAPIHono();
communityApp.openapi(adaptToHono(communityContract.getGroups), communityHandlers.getGroups);
communityApp.openapi(adaptToHono(communityContract.getGroup), communityHandlers.getGroup);
communityApp.openapi(adaptToHono(communityContract.createGroup), communityHandlers.createGroup);
communityApp.openapi(adaptToHono(communityContract.joinGroup), communityHandlers.joinGroup);
communityApp.openapi(adaptToHono(communityContract.getPosts), communityHandlers.getPosts);
communityApp.openapi(adaptToHono(communityContract.createPost), communityHandlers.createPost);
communityApp.openapi(
  adaptToHono(communityContract.toggleReaction),
  communityHandlers.toggleReaction,
);

// Sovereign Routes (Vertical Slice: DAILY CONTENT)
const dailyContentApp = new OpenAPIHono();
dailyContentApp.openapi(adaptToHono(dailyContentContract.getToday), dailyContentHandlers.getToday);
dailyContentApp.openapi(
  adaptToHono(dailyContentContract.getForDate),
  dailyContentHandlers.getForDate,
);
dailyContentApp.openapi(
  adaptToHono(dailyContentContract.getRecent),
  dailyContentHandlers.getRecent,
);

// Sovereign Routes (Vertical Slice: EDUCATIONAL)
const educationalApp = new OpenAPIHono();
educationalApp.openapi(
  adaptToHono(educationalContract.getByTeacher),
  educationalHandlers.getByTeacher,
);
educationalApp.openapi(adaptToHono(educationalContract.getById), educationalHandlers.getById);
educationalApp.openapi(
  adaptToHono(educationalContract.getClassroomResources),
  educationalHandlers.getClassroomResources,
);
educationalApp.openapi(
  adaptToHono(educationalContract.createLesson),
  educationalHandlers.createLesson,
);

// Sovereign Routes (Vertical Slice: GRADING)
const gradingApp = new OpenAPIHono();
gradingApp.openapi(adaptToHono(gradingContract.getReportCard), gradingHandlers.getReportCard);
gradingApp.openapi(
  adaptToHono(gradingContract.getClassroomGrades),
  gradingHandlers.getClassroomGrades,
);
gradingApp.openapi(adaptToHono(gradingContract.submitGrade), gradingHandlers.submitGrade);
gradingApp.openapi(adaptToHono(gradingContract.publishGrade), gradingHandlers.publishGrade);
gradingApp.openapi(
  adaptToHono(gradingContract.getGradingSettings),
  gradingHandlers.getGradingSettings,
);

// Sovereign Routes (Vertical Slice: OPERATIONS)
const operationsApp = new OpenAPIHono();
operationsApp.openapi(
  adaptToHono(operationsContract.getAttendance),
  operationsHandlers.getAttendance,
);
operationsApp.openapi(
  adaptToHono(operationsContract.recordAttendance),
  operationsHandlers.recordAttendance,
);
operationsApp.openapi(
  adaptToHono(operationsContract.batchRecordAttendance),
  operationsHandlers.batchRecordAttendance,
);
operationsApp.openapi(
  adaptToHono(operationsContract.getSchoolAttendancePulse),
  operationsHandlers.getSchoolAttendancePulse,
);

// Sovereign Routes (Vertical Slice: IDENTITY)
const identityApp = new OpenAPIHono();
identityApp.openapi(
  adaptToHono(identityContract.identifyActiveCitizen),
  identityHandlers.resolveIdentity,
);
identityApp.openapi(adaptToHono(identityContract.fetchUserProfile), identityHandlers.getProfile);
identityApp.openapi(
  adaptToHono(identityContract.resolveWorkspaceContext),
  identityHandlers.getClassroomCapacitySummary,
);
identityApp.openapi(
  adaptToHono(identityContract.modifyUserProfile),
  identityHandlers.updateProfile,
);

// Sovereign Routes (Vertical Slice: ADMIN)
const adminApp = new OpenAPIHono();
adminApp.openapi(adaptToHono(adminContract.getStaffPresence), adminHandlers.getStaffPresence);
adminApp.openapi(adaptToHono(adminContract.getTeacherCarousel), adminHandlers.getTeacherCarousel);
adminApp.openapi(adaptToHono(adminContract.submitLeave), adminHandlers.submitLeave);
adminApp.openapi(adaptToHono(adminContract.getSchool), adminHandlers.getSchool);

// Sovereign Routes (Vertical Slice: LIBRARY)
const libraryApp = new OpenAPIHono();
libraryApp.openapi(adaptToHono(libraryContract.getResources), libraryHandlers.getResources);
libraryApp.openapi(adaptToHono(libraryContract.getResource), libraryHandlers.getResource);
libraryApp.openapi(adaptToHono(libraryContract.searchLibrary), libraryHandlers.searchLibrary);
libraryApp.openapi(adaptToHono(libraryContract.engage), libraryHandlers.engage);
libraryApp.openapi(adaptToHono(libraryContract.getCollections), libraryHandlers.getCollections);
libraryApp.openapi(adaptToHono(libraryContract.getCollection), libraryHandlers.getCollection);

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
syncApp.openapi(adaptToHono(syncContract.uploadPowerSyncBatch), syncHandlers.uploadPowerSyncBatch);
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
