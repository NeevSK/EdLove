# Cross Holon Contract Map

Status: active execution blueprint

This document defines how cross-holon flows should be modeled across `classroom`, `admin`, and later packages.

It exists because school reality is not made of isolated domains. The holons are related:

- a principal can set an academic cycle used by teachers
- a teacher can hold insights that matter to institutional care
- a guardian can see outcomes sourced from classroom activity
- attendance and grading can be classroom-authored but institutionally governed

The goal is not to remove these relations.

The goal is to make them:

- explicit
- temporal
- POA-governed
- audited
- non-surveillant by default

This should be read with:

- [DOMAIN_OWNERSHIP_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md)
- [ROLE_WORKSPACE_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_STRATEGY.md)
- [POA_IMPLEMENTATION_GUIDE.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)
- [PRE_POA_STABILIZATION_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/PRE_POA_STABILIZATION_MAP.md)

## 1. Core Doctrine

### 1.1 Holonic ownership

Packages are holons in a holarchy.

That means package boundaries are real, but relations between packages are also real.

Allowed relation shape:

`workspace -> contract -> POA -> domain service -> projection or command model -> repository/adapter`

Disallowed relation shape:

`screen -> raw DB`

or

`package A -> package B internals -> hidden authority or schema dependency`

### 1.2 Write owner and projection consumer

Every cross-holon flow must define:

- write owner
- projection consumers
- temporal model
- authority model
- audit model

There should be one write owner.

Other packages should consume projections, not the write tables or hidden package-local orchestration.

### 1.3 Anti-surveillance rule

Teacher is the primary steward of non-official pedagogical intelligence.

Teacher-authored data must not automatically flow upward into admin visibility unless:

- it is already an official institutional record
- the teacher explicitly shares it
- it is promoted into an official institutional process under a deliberate rule

This means the system must distinguish between:

- official records
- private pedagogical intelligence
- shared projections

## 2. Data Classes

### 2.1 Official institutional records

These can flow upward by policy and duty.

Examples:

- attendance
- published grades
- official incidents
- approved leave and staffing decisions
- institutional invites
- principal observations and governance records

Default behavior:

- visible through policy-governed institutional routes
- audited
- temporally modeled

### 2.2 Teacher-held pedagogical intelligence

These belong to the teacher by default.

Examples:

- student analysis
- classroom reflections
- informal intervention notes
- contextual behavior interpretations
- draft concerns
- draft support ideas
- non-official family context notes

Default behavior:

- private to author
- no automatic admin visibility
- no raw upward read path
- can be shared or promoted deliberately
- every non-owner access is auditable

## 3. Required Metadata For Sensitive Flows

Sensitive classroom-originating records should carry explicit sharing and audit metadata.

Minimum metadata:

- `createdBy`
- `ownedBy`
- `occurredAt`
- `recordedAt`
- `visibility`
- `sharedWith`
- `sharedAt`
- `revokedAt`
- `promotionState`
- `promotedAt`
- `promotedBy`

Suggested visibility values:

- `private`
- `shared_selected`
- `shared_role`
- `official`

Audit events should capture:

- who accessed
- what route was used
- why access was allowed
- when access happened
- whether access was read, share, revoke, promote, or override

## 4. Temporal SSOT

Cross-holon flows must be time-aware.

Minimum temporal fields:

- `occurredAt`
- `recordedAt`
- `effectiveFrom`
- `effectiveTo`
- `viewDate`

Query shape should distinguish:

- current snapshot
- event history
- comparison or delta

### 4.1 Longitudinal student timeline

A student may remain in the school system for more than a decade.

So these flows must not be modeled as short-lived dashboard records only.

They need to support:

- year-over-year continuity
- classroom-to-classroom carry-forward
- teacher-to-teacher handover boundaries
- official versus private history separation
- time-bounded access rules for sensitive insight

This is especially important for:

- attendance
- grading
- student observations
- student potential or pedagogical insight
- guardian-visible summaries

The architectural rule is:

- classroom and teacher-authored records need a longitudinal timeline
- visibility into that timeline must still respect ownership, sharing, promotion, and audit

Examples:

- `getClassroomAttendanceSnapshot(classroomId, viewDate)`
- `getSchoolAttendancePulse(schoolId, viewDate, compareTo)`
- `getGradebookSnapshot(classroomId, termId, viewDate)`
- `getSchoolGradingCompletion(schoolId, termId, viewDate)`

## 5. Cross-Holon Lane Map

## 5.1 Attendance

Write owner:

- `classroom`

Projection consumers:

- `admin`
- guardian or family projections later through policy

Nature:

- official institutional record

Teacher discretion:

- low for existence of attendance record
- medium for annotations and contextual notes

Admin visibility:

- yes, through institutional projections

POA direction:

- teacher or classroom authority for create and edit
- principal or admin authority for oversight, audit, and escalation views

Audit expectations:

- create
- edit
- override
- export
- institutional read

Contract split:

- commands
  - `recordAttendance`
  - `updateAttendanceEntry`
  - `submitAttendanceRollup`
- queries
  - `getClassroomAttendanceSnapshot`
  - `getClassroomAttendanceHistory`
  - `getSchoolAttendancePulse`
  - `getAttendanceDelta`

## 5.2 Grading

Write owner:

- `classroom`

Projection consumers:

- `admin`
- guardian or family summary projections under policy

Nature:

- official academic record once published

Teacher discretion:

- high for drafts
- lower after publish

Admin visibility:

- yes for published, completion, and policy views

POA direction:

- teacher or academic lead authority for authoring and publishing
- principal or admin authority for completion monitoring and policy oversight

Audit expectations:

- draft create
- edit
- publish
- revise
- override
- institutional read

Contract split:

- commands
  - `saveDraftGrade`
  - `publishGradebook`
  - `revisePublishedGrade`
- queries
  - `getGradebookSnapshot`
  - `getGradebookHistory`
  - `getSchoolGradingCompletion`
  - `getStudentGradeSummary`

## 5.3 Invites

Write owner:

- `admin`

Projection consumers:

- `classroom`
- `people`
- future workforce or family package consumers as outcomes only

Nature:

- institutional authority workflow

Teacher discretion:

- none on institutional issuance itself unless delegated by policy

Classroom visibility:

- only resulting capability or membership outcomes

POA direction:

- principal, founder, or delegated institutional operator authority

Audit expectations:

- issued
- accepted
- revoked
- expired
- resent

Contract split:

- commands
  - `createInvite`
  - `revokeInvite`
  - `resendInvite`
- queries
  - `listSchoolInvites`
  - `listInviteEvents`
  - `getInviteOutcomeProjection`

## 5.4 Principal observations

Write owner:

- `admin`

Projection consumers:

- `classroom` only for filtered academic implications where policy allows

Nature:

- official governance and leadership record

Teacher discretion:

- none over principal-authored governance record
- but teacher-originating supporting material should remain governed by its own visibility rules

Classroom visibility:

- limited to derived academic signals or follow-up tasks, not unrestricted raw observation access

POA direction:

- principal or delegated institutional authority for create and follow-up

Audit expectations:

- create
- follow-up
- read
- export
- derived signal generation

Contract split:

- commands
  - `createPrincipalObservation`
  - `updatePrincipalObservation`
  - `resolvePrincipalObservation`
- queries
  - `listPrincipalObservations`
  - `getPrincipalObservationTimeline`
  - `getAcademicObservationSignals`

## 5.5 Teacher pedagogical insights

Write owner:

- `classroom`

Projection consumers:

- none by default
- only teacher-approved shares
- official escalations after explicit promotion

Nature:

- teacher-held pedagogical intelligence

Teacher discretion:

- high

Admin visibility:

- no by default

POA direction:

- teacher controls create, share, revoke, and promotion request
- principal reads only if shared or promoted under policy

Audit expectations:

- non-owner read
- share
- revoke
- promotion
- institutional access after promotion

Contract split:

- commands
  - `createTeacherInsight`
  - `shareTeacherInsight`
  - `revokeTeacherInsightShare`
  - `promoteTeacherInsightToOfficialConcern`
- queries
  - `listMyTeacherInsights`
  - `listSharedTeacherInsights`
  - `listOfficialStudentConcerns`

This lane is the main anti-surveillance boundary.

## 6. Implementation Rules

For each lane:

1. define write owner
2. define projection consumers
3. define temporal fields
4. define commands and queries
5. define POA subject and action mapping
6. define audit events
7. migrate UI to contract-backed routes
8. remove direct DB and hidden cross-package access

## 7. Execution Order

Recommended order:

1. principal observations and invites
2. teacher pedagogical insights and surveillance boundary
3. attendance
4. grading

Why this order:

- principal observations and invites already sit on the `classroom` and `admin` seam
- teacher insight boundaries should be codified before broader data visibility hardening
- attendance and grading depend heavily on the temporal model and the clarified authority shape

## 8. Production-Ready Definition For These Lanes

A cross-holon lane is production-ready only when all of the following are true:

- write owner is explicit
- non-owner consumers use projections only
- temporal fields are explicit
- contract routes exist
- POA metadata exists
- audit events exist
- UI no longer touches DB directly
- package-level architecture tests enforce the seam
