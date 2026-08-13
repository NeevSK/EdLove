---
title: "Gurudevi Rigorous Improvement and Verification Plan"
status: "draft"
created: 2026-08-12
updated: 2026-08-12
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, verification, architecture, security, data, ui, performance, planning]
---

# Gurudevi Rigorous Improvement and Verification Plan

## 1. Purpose

This is the execution plan for turning the imported analysis corpus in
`docs/files/` into safe, repository-grounded improvements to Gurudevi.

The imported analysis is evidence and design input. It is not automatically a
correct backlog. Every claim must be rechecked against current code, schema,
migrations, route reachability, runtime behavior, and—where relevant—the linked
database. Existing implementation is also not accepted as proof merely because
it exists; code, tests, and deployment state must agree.

This plan covers investigation, decision-making, implementation, and proof. The
current phase is **planning and verification only**. No implementation work is
authorized by this document alone.

## 2. Operating rules

1. **Evidence before change.** Each work item must record source documents,
   concrete code paths, current status, and the evidence needed to close it.
2. **No trust by existence.** A component, migration, test, or adapter counts as
   implemented only when its live path, behavior, and verification agree.
3. **Security and correctness before polish.** Authorization, privacy, data
   ownership, navigation payloads, and persistence precede visual refinement.
4. **Bounded vertical slices.** Each slice has a small write scope, explicit
   acceptance criteria, focused tests, and a rollback/recovery story.
5. **Product decisions stay with Naveen.** Agents may investigate, propose, and
   implement approved slices; they must not silently decide ambiguous product
   semantics.
6. **Sub-agents are allowed.** Use independent read-only agents for competing
   investigations and bounded implementation agents only after scope and write
   ownership are explicit. The primary agent integrates and verifies all work.
7. **Native safeguards remain in force.** Do not edit `android/` or `ios/`, run
   `expo install --fix`/`--check`, alter sacred versions, or use destructive
   prebuild operations without explicit approval.

## 3. Terminology decision: structural grade versus assessment result

The repository contains two different concepts that must not be merged:

| Concept | Meaning | Current code evidence | Canonical working name |
|---|---|---|---|
| Grade level | K–12 structure such as Grade 5 or Grade 10 within a section; used to organize GradeClasses | `SchoolGrade` in `packages/core/src/types/School.ts`; remote `grade_levels` table | `GradeLevel` |
| Grade class | Academic-period cohort such as 6A or 6B with roster, timetable, and teacher assignments | Current remote `classrooms` table is a candidate but its semantics must be confirmed | `GradeClass` |
| Grade mark | Marks/letter/GPA for a student, assignment, subject, and GradeClass/instructional context | Current remote `student_grades` table; `StudentGrade` in `packages/core/src/types/Grade.ts` | `GradeMark` / `grade_marks` |

The word `grade` remains in legacy/public surfaces until an approved migration
plan exists. No table rename or broad API rename should happen during the first
correctness slice.

### Initial repository-grounded findings

These findings were independently checked against current code during planning:

- The intended ZenStack mapping is `SchoolGrade` → `grade_levels` and `Grade` →
  `student_grades`, but `packages/admin/src/structure.ts` still queries/inserts
  `grades` and analytics/guardian paths also query `grades` for assessment data.
- Analytics readers expect fields such as `marks`, `graded_at`, and `class_id`
  from `grades`, which cannot represent the current school-grade-level shape and
  does not match the current `student_grades`/`classroom_id` contract.
- Multiple grading scales/calculators exist. Some server handlers derive GPA as
  `marks / 25`, while core calculators use threshold-based GPA; values below the
  passing threshold can also be stored as `S` instead of `F`.
- `AssignmentSubmission.grade` is a separate numeric field whose relationship to
  `student_grades` and `Assignment.max_points` is not yet canonical.
- Student longitudinal queries are currently keyed mainly by `student_id`; the
  required cross-classroom/grade boundary is not proven and is currently treated
  as a correctness failure until adversarial authorization tests pass.
- `secureDrizzleProxy` can write through to the driver when no permission
  validator is registered; this is a confirmed security defect, not a safe
  fallback.
- `user_push_tokens` and Community comments now have local code/migrations/routes;
  the earlier “missing” findings are stale, but linked deployment and ownership
  authorization remain unverified.
- GlobalHeader notifications can disappear when a screen supplies `rightAction`.
  Native Library contribution refreshes without calling the resource-creation path,
  while web does call it.
- Community group detail can render the all-community cache instead of the
  group-scoped result, and web Community has no pagination trigger. These are
  confirmed implementation findings pending runtime reproduction.

These findings are planning evidence only. They do not authorize edits until the
relevant product decisions and slice-specific acceptance criteria are approved.

### Agreed direction from Naveen

The target vocabulary is intentionally explicit:

- `grade_level`: a school's K–12 level such as Grade 6, nested within a section
  such as Primary or Secondary.
- `grade_level`: a K–12 level such as Grade 6 within a section such as Primary
  or Secondary.
- `grade_class`: a time-scoped cohort such as 6A or 6B under a grade level. It
  owns roster, timetable context, and formal teacher assignments.
- `grade_marks`: an assessment result for a student, tied to a grade class or
  instructional classroom,
  subject/term, assignment or assessment event, and the relevant
  `grade_class` placement. It contains marks and the persisted calculated GPA;
  the general letter scale has no plus/minus grades.

The system is lifecycle-bounded. Stable definitions (school, section, grade
level, subject, person, room) are separated from academic-cycle records
(GradeClass, enrollments, subject offerings, teacher assignments, timetable
versions) and delivery records (lessons, attendance, assignments, exams, and
GradeMarks). Corrections should create versions/revisions or new cycle records,
not rewrite historical facts.

The top-level operational scope is `School → AcademicCycle`. School identity,
student identity, and teacher identity remain stable in their own tables. A
principal connects an existing person to an existing school and cycle through a
historical leadership assignment; the principal is not copied into the School
identity row. This makes “School X in 2026” a direct query by
`school_id + academic_cycle_id`.

Within a GradeClass, subjects are separate `GradeClassSubject` offerings. Teacher
assignments match teachers to those offerings and roles; timetable slots match
offerings to day/time/room; lessons represent actual scheduled or delivered
occurrences. This supports substitutions, cancellations, rescheduling, and
attendance without corrupting the recurring timetable.

Attendance is explicitly two-layered: one daily presence record per person and
granular session/lesson/arrival/departure evidence beneath it. Student
attendance is normally recorded by the responsible lesson teacher, while teacher
attendance may be self-recorded for arrival/departure but supervisor-approved or
corrected. Location/device context may support future ABAC rules but is not yet a
required source of truth.

Existing remote rows are disposable demo/testing data. After contracts, schema,
RLS, and fixtures are validated, a clean reset/reseed is acceptable and preferred
to carrying ambiguous legacy rows forward.

The current repository will not be treated as the final naming model. A clean
target vocabulary may require a compatibility/migration period and possibly
removing legacy aliases after all consumers and historical data are accounted
for. “Tabula rasa” means a clean conceptual contract first; destructive data
deletion is not implied.

The following policies are accepted as planning defaults:

- Guardians see only published, intentionally permitted summaries/results and
  never unrestricted student records or sensitive profile data.
- Class teachers and subject teachers may access relevant student results;
  access to another student's results is audited.
- Administrative permissions and visibility rules should be configurable later,
  with safe restrictive defaults now.
- The general marks scale excludes plus/minus variants.
- `Assignment.grade` means the marks awarded for that assignment. The final
  calculation may use assignment maximums, weights, terms, and classroom
  configuration; those rules must be explicit rather than hidden in UI code.
- The academic model has an academic year containing multiple terms/semesters.
- Teacher placement is a formal historical assignment, not only a classroom
  inference: a teacher can be assigned to a `grade_class` for an academic
  period and the assignment remains queryable historically.
- Students have one active primary `grade_class` placement at a time; concurrent
  primary placements are not supported by the initial model.
- `classroom_id` is not the target identity for GradeClass. The current remote
  `classrooms` table mixes cohort-like rows (such as 10B) and subject-like rows
  (such as 10/Bio), including rows with null hierarchy references. The target
  model must use separate identities and foreign keys for GradeClass, subject
  context, teacher assignment, timetable, and GradeMark.
- The initial product context is a Sri Lankan LMS. Defaults should fit common
  Sri Lankan school structures while keeping configuration points explicit.
- Full device testing is deferred for now; implementation still requires focused
  type, unit, authorization, migration, and contract tests.

### Linked Supabase verification — 2026-08-12

The connected Supabase plugin successfully reached the active `Gurudevi` project
(`qzoawolfkuwiuyaoiybz`). The remote database is PostgreSQL 17.6.1 and reports
the recent migration sequence through `20260811070000`.

Remote schema evidence confirms:

- `public.grade_levels` exists with `school_id`, `section_id`, `grade_number`
  (constrained 1–13), and `grade_head_id`.
- `public.student_grades` exists with `marks`, `grade`, `gpa`, classroom/student
  references, and publication fields.
- `public.academic_cycles` exists with school, start/end dates, and current state.
- No `public.grades` table was returned by the targeted remote table query.
- No term/semester table or new `grade_class`/`grade_marks` table was returned
  by the targeted query.
- The remote hierarchy is currently `sections → grade_levels → classrooms`;
  `classrooms.grade_id` references `grade_levels`. This is a candidate starting
  point for the future `GradeClass` contract, but the current `classrooms` name
  must be semantically traced before renaming or splitting it.
- `grade_levels` has active RLS policies for school members and school leaders.
- `student_grades` currently has student-self and classroom-teacher policies in
  the inspected policy result; a guardian-published-only policy was not present
  in that result and requires explicit verification/design.
- Guardian access is therefore unresolved, not implemented: the repository reads
  a nonexistent remote `grades` table, expects relationship fields absent from
  the linked relationship table, and has no confirmed guardian assessment-read
  audit path.

The Supabase MCP/plugin is available and authenticated. The local `supabase`
shell executable is not currently discoverable via PATH, mise, npm shims,
Chocolatey, or Winget. The plugin is therefore the current authoritative
read-only inspection path; no remote mutation was performed.

### Required grade-domain verification

- Confirm the linked database has both `grades` and `student_grades` with the
  expected columns and constraints.
- Trace every screen/API/repository that uses `grade`, `grades`, `marks`, or
  `gpa` and classify it as structural or assessment-related.
- Identify whether any API or generated model currently exposes the wrong
  concept under an ambiguous name.
- Verify grading scale ownership: global Sri Lankan default versus classroom or
  school-configured grading rules.
- Verify whether marks are always 0–100, whether partial/max-point grading is
  required, and whether letter grade/GPA are stored values or derived values.

## 4. Status vocabulary

- **Confirmed:** current code/runtime/schema evidence supports the finding.
- **Partially confirmed:** a real foundation exists, but the end-to-end claim is
  incomplete.
- **Contradicted:** current evidence disproves the imported claim.
- **Stale:** later work supersedes the original claim.
- **Unverified:** evidence depends on runtime, linked database, or product input.
- **Deferred:** intentionally not being built yet.

## 5. Phase plan

### Phase 0 — Baseline and decision closure

**Goal:** establish the evidence ledger and remove ambiguity before coding.

Tasks:

- Maintain this plan as the active execution document.
- Add a claim ledger for every high-impact item from `docs/files/` using:
  `claim → source → code/schema evidence → status → risk → decision → action →
  verification`.
- Reconcile the existing integration/comparison documents rather than creating a
  second competing baseline.
- Complete the structural-grade versus assessment-result inventory.
- Record linked Supabase migration/schema/RLS evidence separately from local
  files.
- Produce a route and data-flow inventory for Classroom, Self, Community,
  Library, Profile, Workspace, and GlobalHeader.

Exit criteria:

- No P0/P1 claim is still described only by an imported document.
- Every open question is either answered by repository evidence or listed for
  Naveen's decision.
- The active plan links to the exact files and verification commands for each
  next slice.

### Phase 1 — Authorization, privacy, and data correctness

**Priority:** P0. No user-facing redesign should depend on unresolved items here.

Tasks:

- Verify and, if confirmed, correct student longitudinal history scoping by
  school/classroom and teacher relationship.
- Verify guardian access to `ClassroomStudent`, assessment results, grades,
  attendance, and report-card surfaces.
- Verify assessment-result mapping: `Grade`/`StudentGrade` → `student_grades`;
  `SchoolGrade` → `grades`.
- Trace classroom selection from tap to final query/render and prove the selected
  `classroomId` is consumed.
- Audit notification token storage and delivery end to end.
- Trace Community comments from UI to production route/handler/repository.
- Characterize `secureDrizzleProxy` batch writes, resource-ID extraction, and
  fallback authorization before changing its security boundary.

Exit criteria:

- Cross-school and cross-classroom negative authorization tests pass.
- Guardian positive/negative cases pass for each relevant domain.
- Grade-level and assessment-result tests use unambiguous fixtures and names.
- Classroom selection changes the resulting data, not just the URL/state.
- Notification and comment paths are proven in the actual target environment.
- Offline write authorization has no unreviewed placeholder fallback.

### Phase 2 — Canonical data and transport boundaries

**Priority:** P0/P1.

Tasks:

- Document the actual ownership of PowerSync/Drizzle, Supabase adapters,
  Hono/oRPC/API contracts, Realtime, and React Query.
- Continue strict Supabase-boundary enforcement, but distinguish legitimate
  adapter operations from request-shaped transport that belongs behind contracts.
- Inventory legacy `usePermissions` consumers and migrate them only through
  tested compatibility steps.
- Verify capability-token issuance, validation, expiry, policy-version
  invalidation, and production signing-key configuration.
- Decide whether unified event-table proposals are future architecture or
  rejected for the current domain model.

Exit criteria:

- One written boundary map exists and matches imports and runtime paths.
- Strict architecture checks pass.
- Authorization semantics are covered at both decision and data-fetch/write
  boundaries.
- No migration is called deployed without linked-environment evidence.

### Phase 3 — Data lifecycle and performance

**Priority:** P1.

Tasks:

- Prove native Classroom attendance offline/reconnect/account-switch behavior.
- Establish cursor/keyset pagination for Community and Library where growth
  warrants it.
- Verify actual query shapes, cardinalities, indexes, and query plans before
  adding indexes or partitions.
- Complete bounded schema-parity batches with post-migration verification.
- Define assessment-result aggregation semantics before adding GPA/rank trends.

Exit criteria:

- Offline tests prove isolation, retry, reconnect, and outbox behavior.
- Pagination has stable ordering and cursor tests.
- Query-plan evidence supports each performance change.
- Parity and migration status are refreshed after each bounded batch.

### Phase 4 — Shared temporal and analytical model

**Priority:** P1/P2.

Tasks:

- Keep domain tables canonical; add derived read models only where the domain
  semantics are explicit.
- Define feature-specific baseline, decay, reinforcement, and narrative rules.
- Extend the existing `DerivedHistoryView` contract from Self to Profile,
  Classroom, and governance only after their data contracts are proven.
- Separate school-grade-level analytics from student-assessment analytics.
- Keep AI/local inference and predictive features behind measured requirements;
  avoid presenting heuristic outputs as authoritative academic judgments.

Exit criteria:

- Each derived metric has a source, formula, privacy boundary, freshness rule,
  empty state, and test fixtures.
- Historical views preserve drill-down to canonical records.
- No derived score is presented without explaining its meaning and limitations.

### Phase 5 — UI information architecture and interaction quality

**Priority:** P1/P2 after correctness gates.

Tasks:

- Audit live screens using the spatial-first method: canonicality, spatial map,
  typography/density, job count, container fit, tappables, and payload tracing.
- Resolve GlobalHeader notification discoverability and intentional mobile/web
  theming.
- Separate Library browse, contribute, and curator responsibilities.
- Apply progressive disclosure to Profile based on the existing Self pattern.
- Validate Workspace drag/drop and surface-zone semantics through direct
  interaction tests before redesigning them.
- Replace raw visual values with enforced shared tokens where the audit confirms
  real drift.

Exit criteria:

- Primary flows have route/payload tests and visual evidence.
- Accessibility labels, focus order, touch targets, loading/error/empty states,
  and responsive behavior are verified.
- UI changes do not obscure authorization state or produce false actions.

### Phase 6 — Family extraction and deferred infrastructure

**Priority:** P2/deferred.

Tasks:

- Prove one shared primitive in a sibling Edlove app before broad extraction.
- Refactor provider-specific AI configuration without adding a local runtime.
- Consider Redis, partitioning, custom CDN/media infrastructure, and advanced
  transport only from measured production need.

Exit criteria:

- A shared primitive has one non-Gurudevi consumer and documented contracts.
- Deferred infrastructure has a measured trigger, cost, owner, and rollback.

## 6. First implementation slices after approval

1. Grade-domain contracts: GradeLevel, GradeClass, teacher assignments,
   academic terms, subject contexts, and GradeMark; no migration yet.
2. Non-destructive schema design for separate GradeClass and subject identities.
3. Authorization/RLS and guardian published-result read path with audit events.
4. Data migration/backfill only after live row classification and explicit checks.
5. Migrate classroom/admin/teacher/student/guardian/analytics consumers.
6. Remove legacy mixed semantics and fail loudly after zero-consumer checks.
7. Only then begin broader UI restructuring or temporal expansion.

Each slice must be implemented in a separate bounded change and verified before
the next dependent slice begins.

## 7. Questions for Naveen

These questions require product or policy judgment rather than code inspection:

1. Confirm exact Sri Lankan school variants that must be supported beyond the
   default year → term/semester structure.
2. Confirm whether the linked Supabase project can be authenticated from the
   current machine. The local CLI was not installed, so deployment state remains
   unverified.

The other policy questions are considered answered by the accepted direction
above and should not be reopened casually during implementation.

Until these questions are answered, agents may implement only the approved
contract/inventory slice and must not make additional product-policy changes
implicitly.

## 10. Agent implementation protocol

The first implementation should be delegated as one bounded task:

**Agent task A — grade-domain contract and migration inventory**

- Add or refine explicit shared types/schemas for `GradeSchoolPlacement`,
  `TeacherGradeSchoolAssignment`, `GradeMark`, academic periods, and terms.
- Do not rename or drop existing tables.
- Do not write migrations yet unless the task is limited to a non-destructive
  inventory/read model clearly approved by the primary agent.
- Add contract tests for one-active-placement rules, academic period/term
  relationships, marks/max-points validation, publication visibility, and
  non-plus/minus letter scales.
- Produce a consumer inventory for every legacy grade-related path.

The primary agent then reviews the diff, runs checks, and decides whether the
next agent should implement schema compatibility, API adapters, or data tests.
Subsequent agents must have disjoint write scopes:

1. contract/types and tests;
2. schema/migration compatibility;
3. API/repository adapters;
4. classroom/admin/guardian consumers;
5. analytics and reporting;
6. cleanup and legacy removal.

## 11. Agent slice review — 2026-08-13

### Lifecycle slice

The local contract slice completed with focused tests passing. It added
cycle-scoped leadership assignments, GradeClass subjects, daily attendance, and
attendance sessions without introducing `classroom_id`. It is not yet ready for
schema migration because it still needs the broader lifecycle contract review:
explicit subject/teacher identifiers, enrollment history, cross-entity
cycle/term invariants, and teacher-attendance coverage.

### Guardian slice

The new guardian assessment-read service passed its focused tests and correctly
fails closed when relationship permission data is absent. It is intentionally not
wired to Supabase because the linked schema lacks the required permission model
and guardian assessment RLS policy.

The existing guardian dashboard path failed its regression test by returning a
draft assessment to a guardian. This is recorded as a confirmed privacy defect.

## 2026-08-13 implementation checkpoint

The additive academic lifecycle foundation and guardian assessment-read contract
were applied to the linked Supabase project after live schema reconciliation.
The project already had `academic_cycles` with `start_date`, `end_date`, and
`is_current`; the migration now preserves those columns and adds the new
`starts_at`, `ends_at`, `status`, `created_by`, and `updated_at` lifecycle
columns. No rows were dropped or renamed.

The following authoritative tables now exist remotely with RLS enabled:

- academic cycles, terms, subjects, grade levels, grade classes;
- grade-class subjects, teacher assignments, student enrollments;
- daily/session student attendance and daily/session teacher attendance;
- grade marks;
- guardian assessment permissions and read-audit events.

Guardian assessment results are exposed through the Sanctuary API only. The
mobile API method sends the authenticated session token to the API and validates
the minimized published-result response; it does not query Supabase tables or
invoke a database RPC.

Focused API, service, schema, and ZenStack checks pass. A broader core test
selection still contains unrelated pre-existing failures in schema fixtures and
cross-classroom authorization, while some suites cannot load because the local
Expo dependency installation is incomplete. Those failures are tracked rather
than attributed to this slice.
A follow-up slice is correcting that local path while preserving the larger
integration blocker.

### Verification status

- New lifecycle focused tests: passed.
- New guardian assessment-read focused tests: passed.
- Existing guardian published-result regression: failed before follow-up fix;
  draft data was returned.
- Full `@repo/core` typecheck: blocked by an existing guardian fixture using
  unsupported `status` fields; this must be corrected before schema work.
- No remote mutation was performed.

## 8. Verification toolbox

```powershell
pnpm exec zen check --schema packages/schema/schema.zmodel
pnpm run check-types
pnpm run check:architecture
pnpm run check:circular
pnpm run check:deep-imports
pnpm run check:supabase-boundaries
pnpm run audit:authorization-parity
pnpm run audit:database-parity
pnpm run audit:db-trust
pnpm run audit:db-behavior
pnpm run audit:migration-state
pnpm run audit:query-plans
```

For native diagnostics, use `expo-doctor` and resolved Expo config only. Do not
use `expo install --fix`, `expo install --check`, destructive clean prebuild, or
direct edits to generated native directories.

## 9. Related evidence

- Imported corpus: `docs/files/README.md`
- Fundamental method: `docs/files/fundamental/SKILL.md`
- Existing integration plan: `docs/current_progress/2026-08-10-gurudevi-edlove-exploration-integration-plan.md`
- Existing comparison ledger: `docs/architecture/2026-08-10-gurudevi-edlove-exploration-vs-current-implementation.md`
- Current schema: `packages/schema/schema.zmodel`
- Structural school-grade types: `packages/core/src/types/School.ts`
- Assessment-result types: `packages/core/src/types/Grade.ts`
