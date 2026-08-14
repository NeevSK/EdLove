import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sanctuaryFile = path.join(root, 'apps/sanctuary-api/src/agents/platformEvents.ts');
const telemetryFile = path.join(root, 'apps/sanctuary-api/src/agents/workerTelemetry.ts');
const marketingFiles = [
  'attendanceHandlers.ts',
  'classroomHandlers.ts',
  'gradingHandlers.ts',
  'mutationHandlers.ts',
  'wellbeingHandlers.ts',
].map((file) => path.join(root, 'apps/gurudevi-marketingWeb/src/inngest/functions', file));

const sanctuary = fs.readFileSync(sanctuaryFile, 'utf8');
const telemetry = fs.readFileSync(telemetryFile, 'utf8');
const marketing = marketingFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const strict = process.argv.includes('--strict') || process.env.WORKER_PARITY_STRICT === '1';
const required = [
  ['school/attendance.recorded', 'schoolAttendanceRecorded'],
  ['school/classroom.created', 'schoolClassroomCreated'],
  ['school/grade.published', 'schoolGradePublished'],
  ['wellbeing/mood.logged', 'wellbeingMoodLogged'],
  ['sync/mutation-queued', 'syncMutationQueued'],
];
const errors = [];
for (const [eventName, functionName] of required) {
  if (!sanctuary.includes(eventName) || !sanctuary.includes(functionName)) {
    errors.push(`Sanctuary is missing the registered worker for ${eventName}.`);
  }
}
for (const invariant of [
  'retries: 3',
  'on conflict (idempotency_key) do update set',
  'recordEvent',
  'create-attendance-teacher-note',
  'actorId: z.string().uuid()',
  'payload.user_id !== mutation.actorId',
  'public.bonds',
  'not authorized for the classroom',
]) {
  if (!sanctuary.includes(invariant))
    errors.push(`Sanctuary worker invariant missing: ${invariant}.`);
}
for (const invariant of [
  'capturePlatformWorkerEvent',
  'POSTHOG_API_KEY',
  'SAFE_KEYS',
  'provider_unavailable',
]) {
  if (!telemetry.includes(invariant))
    errors.push(`Sanctuary worker telemetry invariant missing: ${invariant}.`);
}

console.log(`Worker parity audit: ${required.length} event families inspected.`);
if (marketing.length > 0) {
  console.warn('Marketing worker source is still present; deletion remains release-gated.');
  if (strict) errors.push('Marketing worker source is present in strict release mode.');
}
if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log('Sanctuary registrations and core replay-safety invariants are present.');
}
