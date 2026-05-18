import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { 
  selfContract, selfHandlers, 
  profileContract, profileHandlers,
  communityContract, communityHandlers,
  educationalContract, educationalHandlers,
  gradingContract, gradingHandlers,
  operationsContract, operationsHandlers,
  identityContract, identityHandlers,
  adminContract, adminHandlers,
  libraryContract, libraryHandlers,
  adaptToHono 
} from '@repo/core';
import { createZenStackDb, canUseZenStackDb } from '@repo/database';

const app = OpenAPIHono();

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
  if (canUseZenStackDb()) {
    const db = createZenStackDb(user);
    c.set('db', db);
    c.set('user', user);
  } else {
    console.warn('⚠️ DATABASE_URL not found. ReBAC enforcement will be offline.');
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
profileApp.openapi(adaptToHono(profileContract.getJourneySnapshot), profileHandlers.getJourneySnapshot);
profileApp.openapi(adaptToHono(profileContract.getSchoolPulse), profileHandlers.getSchoolPulse);

// Sovereign Routes (Vertical Slice: COMMUNITY)
const communityApp = new OpenAPIHono();
communityApp.openapi(adaptToHono(communityContract.getGroups), communityHandlers.getGroups);
communityApp.openapi(adaptToHono(communityContract.getGroup), communityHandlers.getGroup);
communityApp.openapi(adaptToHono(communityContract.createGroup), communityHandlers.createGroup);
communityApp.openapi(adaptToHono(communityContract.joinGroup), communityHandlers.joinGroup);
communityApp.openapi(adaptToHono(communityContract.getPosts), communityHandlers.getPosts);
communityApp.openapi(adaptToHono(communityContract.createPost), communityHandlers.createPost);
communityApp.openapi(adaptToHono(communityContract.toggleReaction), communityHandlers.toggleReaction);

// Sovereign Routes (Vertical Slice: EDUCATIONAL)
const educationalApp = new OpenAPIHono();
educationalApp.openapi(adaptToHono(educationalContract.getByTeacher), educationalHandlers.getByTeacher);
educationalApp.openapi(adaptToHono(educationalContract.getById), educationalHandlers.getById);
educationalApp.openapi(adaptToHono(educationalContract.getClassroomResources), educationalHandlers.getClassroomResources);
educationalApp.openapi(adaptToHono(educationalContract.createLesson), educationalHandlers.createLesson);

// Sovereign Routes (Vertical Slice: GRADING)
const gradingApp = new OpenAPIHono();
gradingApp.openapi(adaptToHono(gradingContract.getReportCard), gradingHandlers.getReportCard);
gradingApp.openapi(adaptToHono(gradingContract.getClassroomGrades), gradingHandlers.getClassroomGrades);
gradingApp.openapi(adaptToHono(gradingContract.submitGrade), gradingHandlers.submitGrade);
gradingApp.openapi(adaptToHono(gradingContract.publishGrade), gradingHandlers.publishGrade);
gradingApp.openapi(adaptToHono(gradingContract.getGradingSettings), gradingHandlers.getGradingSettings);

// Sovereign Routes (Vertical Slice: OPERATIONS)
const operationsApp = new OpenAPIHono();
operationsApp.openapi(adaptToHono(operationsContract.getAttendance), operationsHandlers.getAttendance);
operationsApp.openapi(adaptToHono(operationsContract.recordAttendance), operationsHandlers.recordAttendance);
operationsApp.openapi(adaptToHono(operationsContract.batchRecordAttendance), operationsHandlers.batchRecordAttendance);
operationsApp.openapi(adaptToHono(operationsContract.getSchoolAttendancePulse), operationsHandlers.getSchoolAttendancePulse);

// Sovereign Routes (Vertical Slice: IDENTITY)
const identityApp = new OpenAPIHono();
identityApp.openapi(adaptToHono(identityContract.resolveIdentity), identityHandlers.resolveIdentity);
identityApp.openapi(adaptToHono(identityContract.getProfile), identityHandlers.getProfile);
identityApp.openapi(adaptToHono(identityContract.getClassroomCapacitySummary), identityHandlers.getClassroomCapacitySummary);
identityApp.openapi(adaptToHono(identityContract.updateProfile), identityHandlers.updateProfile);

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
export type AppType = typeof app;
