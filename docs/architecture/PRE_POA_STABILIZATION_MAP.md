# Pre-POA Stabilization Map

Status: active migration map

This document defines the next contract and authority targets before calling the founder and guardian lanes production-ready under POA.

The next role-sensitive cross-holon lanes should be implemented using the doctrine in:

- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [TEMPORAL_SSOT.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/TEMPORAL_SSOT.md)

## Temporal bedrock

Owner:

- `apps/gurudevi-mobile/supabase/migrations`
  longitudinal database foundation
- `packages/core`
  POA-backed timeline and as-of snapshot access

Current progress:

- `public.student_longitudinal_events` migration now exists as a shared bedrock for student-life history
- grades, enrollments, observations, guardian relationships, attendance, assignment submissions, and student study notes can now feed one longitudinal stream where those source tables exist
- public core routes now exist in `packages/core/src/api/longitudinal.ts`
- contract coverage now runs through `packages/core/src/api/longitudinal.contract.ts`
- focused POA coverage now runs in `packages/core/src/api/__tests__/longitudinal-poa.test.ts`

Remaining work:

- move admin and student-profile consumers onto the longitudinal routes
- add lane-specific published projections on top of the same bedrock
- extend the migration pattern to additional 13-year student records like cycles, interventions, and support plans
- harden notes and submission reads further so more student-facing screens consume longitudinal views directly where useful
- add focused behavior tests once DB-backed integration coverage is in place

## Principal workspace seam

Owner:

- `packages/core`
  public contract and POA-enforced route surface
- `packages/admin`
  institutional workspace composition and thin facades
- `packages/classroom`
  academic consumer and bridge consumer only

Current progress:

- principal invites and principal observations now run through `packages/core/src/api/principalWorkspace.ts`
- public routes are contract-covered in `packages/core/src/api/principalWorkspace.contract.ts`
- orchestration now runs through `packages/core/src/domains/principalWorkspace/*`
- persistence now runs through `packages/core/src/adapters/supabase/principalWorkspaceRepository.ts`
- admin invite and observation facades now delegate to `api.principalWorkspace.*`
- focused POA coverage now runs in `packages/core/src/api/__tests__/principal-workspace-poa.test.ts`
- `public.principal_governance_events` migration now exists as an official temporal event bedrock for principal observations and invite issuance
- core now exposes a governance timeline through `api.principalWorkspace.getGovernanceTimeline(...)`

Remaining work:

- separate official governance observations from future teacher-shared pedagogical insight projections
- add explicit non-owner read, invite-use, invite-revoke, and follow-up governance events as those workflows become first-class
- evolve invite outcomes into explicit membership and capability projections for downstream package consumers
- move principal-facing timeline UI onto the governance timeline route where historical playback matters

## Teacher insights seam

Owner:

- `packages/core`
  anti-surveillance contract and POA-enforced route surface
- `packages/classroom`
  teacher-facing workspace consumer
- `packages/admin`
  no raw access by default; future access only through teacher share or official promotion routes

Current progress:

- teacher private notes, student observations, and student potential now have a unified core seam in `packages/core/src/api/teacherInsights.ts`
- public routes are contract-covered in `packages/core/src/api/teacherInsights.contract.ts`
- orchestration now runs through `packages/core/src/domains/teacherInsights/*`
- persistence now runs through `packages/core/src/adapters/supabase/teacherInsightsRepository.ts`
- focused POA coverage now runs in `packages/core/src/api/__tests__/teacher-insights-poa.test.ts`
- the API shape now marks these records as audit-required and private by default unless an existing visibility rule says otherwise
- student observation share, revoke, promote, and audit-trail routes now exist and write durable audit events through `audit_logs`
- `public.teacher_insight_events` migration now exists as a teacher-owned temporal lifecycle bedrock for private, shared, and promoted insight state
- core now exposes a durable insight timeline through `packages/core/src/api/teacherInsights.ts`
- student observation global reads and deletes now route through `teacherInsights`, closing the last raw observation escape hatch in `studentObservations`

Remaining work:

- migrate classroom teacher-facing flows to `api.teacherInsights.*`
- add note and student-potential share or promotion routes only after dedicated persistence exists for durable state
- extend durable access-audit logging beyond observation governance events into non-owner read paths where those become allowed
- tighten observation and potential reads so admin cannot accidentally consume raw teacher-owned intelligence outside deliberate share paths
- add focused behavior tests for teacher insight timeline reconstruction once DB-backed integration coverage is in place

## Attendance seam

Owner:

- `packages/core`
  public contract and POA-enforced lane
- `packages/classroom`
  write-owner workspace consumer
- `packages/admin`
  oversight projection consumer

Current progress:

- attendance now has explicit temporal route names for classroom snapshot, student timeline, school pulse, and attendance report
- public coverage now includes those routes in `packages/core/src/api/attendance.ts`
- contract coverage now runs through `packages/core/src/api/operations.contract.ts`
- focused POA coverage now runs in `packages/core/src/api/__tests__/attendance-poa.test.ts`
- lane doctrine is documented in `docs/architecture/ATTENDANCE_HARDENING_PLAN.md`
- school pulse and attendance report calculations now run through `packages/core/src/domains/attendanceProjection/*`
- `packages/core/src/api/staffManagement.ts` now delegates student attendance projections instead of owning them

Remaining work:

- add override, export, and institutional-read audit coverage
- migrate attendance-facing UI to the temporal route names where it improves clarity
- add focused behavior tests for snapshot, pulse, and report calculations

## Grading seam

Owner:

- `packages/core`
  public contract and POA-enforced lane
- `packages/classroom`
  write-owner workspace consumer
- `packages/admin`
  oversight projection consumer

Current progress:

- grading now has explicit temporal route names for gradebook snapshot, student timeline, and school grading completion
- public coverage now includes those routes in `packages/core/src/api/grading.ts`
- contract coverage now runs through `packages/core/src/api/grading.contract.ts`
- focused POA coverage now runs in `packages/core/src/api/__tests__/grading-poa.test.ts`
- institutional grading completion now runs through `packages/core/src/domains/gradingProjection/*`
- lane doctrine is documented in `docs/architecture/GRADING_HARDENING_PLAN.md`
- teacher grade entry is now draft-first through a durable lifecycle seam
- publish, revise, and override actions now write durable grade publication snapshots into `audit_logs`
- admin-safe published grading completion now exists alongside the broader institutional completion projection
- guardian grade summaries now resolve from published snapshots instead of raw grade rows

Remaining work:

- add a dedicated versioned persistence model when database schema work is ready
- widen admin and guardian consumers onto the new published-only routes
- add focused behavior tests around draft save, publish, revise, and override flows
- refine institutional read and export audit semantics further where oversight screens need that distinction

## Founder

Owner:

- `packages/core`
  public API surface
- `packages/admin`
  workspace composition and governance-facing UI
- `packages/classroom`
  temporary entry shell only

Current progress:

- founder workspace data is now admin-owned through `packages/admin/src/bridge/founderWorkspace.ts`
- founder public API in core is now contract-covered through `packages/core/src/api/founder.contract.ts`
- founder API is now wrapped through contract coverage and POA proxy registration in `packages/core/src/api/index.ts`
- founder orchestration now runs through `packages/core/src/domains/founder/*`
- founder persistence now runs through `packages/core/src/adapters/supabase/founderRepository.ts`
- founder hooks now consume `api.founder` instead of the raw module

Remaining work:

- add focused contract and authorization tests for founder routes
- harden remaining founder write shapes and response typing where they still use broad `any`

Authority targets:

- `read FounderDashboard`
  ecosystem stats
  ecosystem pulse
  sentinel governance
  global user listing
- `read School`
  all-schools ecosystem listing
- `create School`
  founder global school creation
- `create Classroom`
  founder global classroom creation
- `create Group`
  founder global community creation
- `update School`
  founder school metadata updates

## Guardian

Owner:

- `packages/admin`
  workspace and guardian-facing domain logic

Current progress:

- guardian workspace screen now reads through `packages/admin/src/guardian/useGuardianWorkspaceData.ts`
- guardian dashboard assembly now lives in `packages/admin/src/guardian/dashboardProjection.ts`
- guardian raw dashboard reads now live in `packages/admin/src/guardian/repository.ts`
- first core guardian contract routes now exist in `packages/core/src/api/guardian.contract.ts`
- guardian core orchestration now runs through `packages/core/src/domains/guardian/*`
- guardian core persistence now runs through `packages/core/src/adapters/supabase/guardianRepository.ts`
- admin guardian workspace now consumes `api.guardian.getDashboard(...)`
- admin guardian facade now delegates profile, verification, relationship, and notification-setting mutations through `api.guardian.*`
- focused founder and guardian POA coverage tests now run in `packages/core/src/api/__tests__/founder-guardian-poa.test.ts`

Remaining work:

- map guardian identity, relationship, and dashboard projection routes explicitly
- move guardian public reads off raw package-local Supabase access
- add the next guardian-focused tests around mutation contracts and service behavior
- remove or narrow transitional admin-local guardian repository exports once callers are off them

Authority targets:

- `read GuardianDashboard`
  guardian dashboard projection
  notifications
  events
- `read Student`
  child overview visibility
- `read Attendance`
  student attendance summaries for linked guardians
- `read Grade`
  student grade summaries for linked guardians
- `read Assignment`
  upcoming assignment visibility for linked guardians
- `create GuardianRelationship`
  guardian linking flows
- `update GuardianRelationship`
  permission changes
  relationship termination
- `update GuardianProfile`
  guardian profile changes

## Sequencing

1. collapse remaining admin-local guardian reads and projections behind the core guardian seam
2. add guardian-focused mutation/service tests on top of the new contract-backed routes
3. remove remaining transitional founder and guardian bridges where possible
4. expand POA coverage from these slices into the next role workflows
