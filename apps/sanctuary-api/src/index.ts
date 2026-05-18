import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  adaptToHono,
  adminContract,
  adminHandlers,
  communityContract,
  communityHandlers,
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
} from '@repo/core';
import { canUseZenStackDb, createZenStackDb } from '@repo/database';
import { check as checkCedar } from '@repo/policies';

const app = new OpenAPIHono();

// --- 1. Global Middleware ---
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header('x-request-id', requestId);
  console.log(`[${requestId}] 🛡️  ${c.req.method} ${c.req.url}`);
  await next();
});

// --- 2. Sovereign Auth & ZenStack (ReBAC) Middleware ---
app.use('/api/*', async (c, next) => {
  // 1. Resolve User from Header (Simplified for now, should use JWT verify)
  const authHeader = c.req.header('Authorization');
  let user = { id: 'anonymous' };

  if (authHeader?.startsWith('Bearer ')) {
    // TODO: Actually verify JWT here.
    // For now, we are assuming the identity is passed in a secure way (e.g. Railway private network or future JWT)
    const token = authHeader.replace('Bearer ', '');
    user = { id: token }; // Placeholder: token is the userId for testing
  }

  // 2. Inject ZenStack Enhanced DB
  let db: any = null;
  if (canUseZenStackDb()) {
    db = createZenStackDb(user);
    c.set('db', db);
    c.set('user', user);
  } else {
    console.warn('⚠️ DATABASE_URL not found. ReBAC enforcement will be offline.');
  }

  // --- 3. Cedar Server Gate Check (Double Gate Security Principle) ---
  // A. Resolve attributes for Principal
  let school_id = c.req.header('x-school-id') || null;
  let capacity = c.req.header('x-capacity') || 'Wanderer';
  let grade_id = c.req.header('x-grade-id') || null;
  let section_id = c.req.header('x-section-id') || null;
  let classroom_ids: string[] = [];
  let child_student_ids: string[] = [];

  const xClassroomIds = c.req.header('x-classroom-ids');
  if (xClassroomIds) {
    classroom_ids = xClassroomIds.split(',').map((id) => id.trim());
  }
  const xChildIds = c.req.header('x-child-student-ids');
  if (xChildIds) {
    child_student_ids = xChildIds.split(',').map((id) => id.trim());
  }

  // Fallback to fetch bond attributes from DB if user is authenticated and headers are missing
  if (user.id !== 'anonymous' && (!school_id || capacity === 'Wanderer')) {
    try {
      if (db) {
        const activeBond = await db.bond.findFirst({
          where: {
            user_id: user.id,
          },
        });
        if (activeBond) {
          capacity = activeBond.capacity;
          if (activeBond.entity_type === 'SCHOOL') {
            school_id = activeBond.entity_id;
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Server failed to resolve active bond from DB:', err);
    }
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
  }

  // Attempt to parse classroom_id safely by cloning the request body (prevents stream lockout)
  let bodyClassroomId: string | undefined = undefined;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const cloned = c.req.raw.clone();
      const bodyJson = await cloned.json();
      bodyClassroomId = bodyJson?.classroom_id;
    } catch (e) {
      // Body is not JSON or cannot be read, ignore gracefully
    }
  }

  const deviceTrust = c.req.header('x-device-trust') || c.req.header('x-device-status') || 'standard';
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

  // 🛡️ Sentinel Audit Log Interceptor: Log high-privilege platform administrator actions
  if (capacity === 'admin') {
    console.info(
      `[🛡️ SENTINEL AUDIT LOG] Platform Admin Action Authorized:
       - Operator ID: "${user.id}"
       - Action: "${cedarAction}"
       - Target Resource: "${resourceType}::${resourceId}"
       - Path: "${method} ${urlPath}"
       - Device Trust: "${deviceTrust}"
       - Network Zone: "${networkZone}"
       - Status: APPROVED & AUDITED`
    );
  }

  await next();
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
identityApp.openapi(adaptToHono(identityContract.modifyUserProfile), identityHandlers.updateProfile);

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
app.route('/api', educationalApp);
app.route('/api', gradingApp);
app.route('/api', operationsApp);
app.route('/api', identityApp);
app.route('/api', adminApp);
app.route('/api', libraryApp);

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
console.log(`🛡️ Sanctuary API standing guard on port ${port}`);

if (process.env.NODE_ENV !== 'test') {
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
export type AppType = any;
