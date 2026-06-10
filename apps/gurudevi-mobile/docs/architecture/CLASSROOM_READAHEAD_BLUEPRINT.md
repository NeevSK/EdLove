---
title: "Classroom Read-Ahead Blueprint"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Classroom Read-Ahead Blueprint

Status: working migration blueprint

This document converts the classroom lane from a file-by-file cleanup problem into a domain-guided migration plan.

It is intentionally read-first.

The goal is to decide:

- what `classroom` actually owns
- what `classroom` only composes
- where POA must be strengthened
- where temporal modeling must become explicit
- which refactors should be grouped together

This blueprint should be used alongside:

- [DOMAIN_OWNERSHIP_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md)
- [CLASSROOM_BOUNDARY_PHASE1.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CLASSROOM_BOUNDARY_PHASE1.md)
- [POA Implementation Guide](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)
- [POA Authority SSOT](C:/Users/Naween/projects/polymath-platform/docs/POA_AUTHORITY_SSOT.md)

## 1. Core Meaning Of Classroom

`packages/classroom` is not a narrow wrapper around classroom tables.

It is the academic daily-work workspace for teacher-student lifecycle activity.

That includes:

- classroom entry and workspace hydration
- teacher daily workflow
- student daily workflow
- attendance, assignments, lessons, grading, classroom resources
- classroom-facing academic insights
- classroom-specific temporal views over learning activity

It may also host entry composition for adjacent roles when they enter through the same product surface.

That does not make `classroom` the owner of those adjacent business domains.

## 1.1 Holonic Constraint

The school system in this platform is holonic rather than isolated.

That means:

- packages have local ownership
- packages still influence one another through feedback loops
- architecture must preserve cybernetic interrelations without dissolving boundaries

Examples:

- principals can set academic cycles that affect teacher workflows
- classroom signals can feed institutional reporting
- guardian visibility can depend on both school policy and classroom activity

So the target is not rigid separation.

The target is contract-shaped interdependence.

## 2. Current Reality In Code

The current package shape mixes three concerns:

### 2.1 Academic workspace

This is the strongest and cleanest part of the package.

Representative files:

- `packages/classroom/src/screens/TeacherClassroomDashboard.tsx`
- `packages/classroom/src/screens/StudentClassroomDashboard.tsx`
- `packages/classroom/src/components/teacher/TeacherAssignmentsWorkspace.tsx`
- `packages/classroom/src/hooks/useAttendance.ts`
- `packages/classroom/src/hooks/useGradebook.ts`

These flows are correctly classroom-facing, but they still vary in how cleanly they use APIs and temporal state.

### 2.2 Institutional bridge surface

This is where `classroom` acts as an entry shell for institutional roles.

Representative files:

- `packages/classroom/src/screens/PrincipalDashboard.tsx`
- `packages/classroom/src/hooks/usePrincipalObservations.ts`
- `packages/classroom/src/hooks/useSchoolInvites.ts`
- `packages/classroom/src/components/principal/*`

This layer is not inherently wrong.

The issue is that some of these flows currently blur the line between:

- classroom-owned composition
- admin-owned institutional logic
- classroom-owned principal-facing academic pulse

### 2.3 Legacy direct data access and local orchestration

This is the main production-hardening risk.

Representative files:

- `packages/classroom/src/components/ClassroomList.tsx`
- `packages/classroom/src/components/CreateClassroomModal.tsx`
- `packages/classroom/src/screens/ClassroomScreen.tsx`
- older hooks and utility modules that still know table structure or Supabase behavior

These files still mix UI state, business flow, identity lookup, and persistence details in one place.

## 3. Ownership Map For Classroom-Adjacent Concerns

This section turns fuzzy package semantics into a practical routing guide.

### 3.0 Mixed-role actors

Intermediate roles such as `grade_head` and `section_head` are best treated as mixed-capability actors.

They are not separate package owners by default.

Typical shape:

- teacher capabilities remain classroom-owned
- academic oversight or school-level coordination may be admin-owned
- the same human may carry both at once

The same rule applies to principals who also teach.

So the architecture should model:

- workflow ownership by package
- actor capability composition by POA
- workspace composition in UI

Not:

- one actor title equals one package

### 3.1 Classroom owns

- teacher workspace composition
- student workspace composition
- classroom roster entry and class selection UX
- attendance UX and attendance-specific projections
- grading UX and grading-specific projections
- lesson, assignment, submission, and resource UX
- classroom notes and classroom observations that are part of academic daily work
- classroom-specific dashboards and classroom pulse surfaces

### 3.2 Classroom may compose but should not own

- principal entry through the same app surface
- founder entry through the same app surface
- thin institutional summaries needed to orient academic work
- policy-shaped academic projections coming from institutional domains
- handoff adapters to `admin`, `people`, or future `workforce` APIs

### 3.3 Admin owns

- principal lifecycle
- founder lifecycle
- invite generation and institutional onboarding governance
- school hierarchy and institutional structure
- approvals, operations, forms, reports, inventory, and school administration
- school-wide operational dashboards

### 3.4 People owns

- HR lifecycle
- staffing records
- employment and people administration
- broader person-centric workflows not specific to classroom life

### 3.5 Workforce owns

- future non-academic staff operations
- leave, duty, shift, and support-staff work that should not remain in classroom

### 3.6 Guardian and family flows

Current recommendation:

- keep guardian overview and school-facing family visibility in `admin` for now
- do not treat guardian workflows as classroom-owned
- source child learning, attendance, and assignment data from the owning academic domains

Future recommendation:

- if guardian or parent workflows grow into a substantial portal, create a dedicated package instead of expanding `admin` indefinitely

## 4. Flow Taxonomy

The classroom lane should be reasoned about by workflow, not by folder.

### 4.1 Workspace hydration and entry

Representative files:

- `packages/classroom/src/screens/ClassroomScreen.tsx`
- `packages/classroom/src/hooks/useClassroomRoleData.ts`
- `packages/classroom/src/components/ClassroomList.tsx`
- `packages/classroom/src/components/CreateClassroomModal.tsx`
- `packages/classroom/src/components/ClaimInviteModal.tsx`

Purpose:

- resolve who the actor is in the academic workspace
- decide whether the actor is onboarding, in demo mode, or fully active
- list academic spaces they can enter
- create or join classroom contexts

Current risk:

- too much orchestration in UI
- lingering direct persistence access
- identity and workspace state mixed with rendering

### 4.2 Teacher-student classroom core

Representative files:

- `packages/classroom/src/screens/TeacherClassroomDashboard.tsx`
- `packages/classroom/src/screens/StudentClassroomDashboard.tsx`
- `packages/classroom/src/components/teacher/TeacherAssignmentsWorkspace.tsx`
- `packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx`
- `packages/classroom/src/components/AttendanceView.tsx`
- `packages/classroom/src/components/GradebookView.tsx`

Purpose:

- run academic daily work inside a classroom context

Current risk:

- some slices are API-shaped and healthy
- some still depend on mixed local state and inconsistent temporal semantics

### 4.3 Principal and founder bridge

Representative files:

- `packages/classroom/src/screens/PrincipalDashboard.tsx`
- `packages/classroom/src/screens/FounderDashboard.tsx`
- `packages/classroom/src/hooks/useSchoolStats.ts`
- `packages/classroom/src/hooks/usePrincipalObservations.ts`
- `packages/classroom/src/hooks/useSchoolInvites.ts`

Purpose:

- expose institutional context from the same app surface

Current risk:

- admin-owned concerns are still reachable from classroom hooks
- ownership line between academic pulse and institutional operations is not explicit

This bridge also needs to account for dual-role actors.

A principal who teaches should not be forced into one monolithic dashboard.

The system should compose:

- classroom-owned teaching surfaces
- admin-owned institutional surfaces

based on capability, not on a single winning role label.

### 4.4 Guardian and family overview

Representative files:

- `packages/admin/src/screens/GuardianDashboardScreen.tsx`
- `packages/admin/src/guardian/api.ts`
- `packages/admin/src/components/guardian/*`

Purpose:

- expose child overview, notifications, and school event visibility for guardians

Current risk:

- current implementation is still raw-Supabase and admin-local
- this is probably acceptable as a transitional home
- if the portal expands beyond overview and institutional communication, it deserves a dedicated package

### 4.5 Supporting intelligence and reports

Representative files:

- `packages/classroom/src/logic/reportGenerator.ts`
- `packages/classroom/src/components/ClassroomHolisticInsights.tsx`
- `packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx`

Purpose:

- turn classroom activity into insight and reporting surfaces

Current risk:

- insight surfaces will amplify ownership drift if they are built before underlying domain contracts are stable

## 5. POA Map For The Classroom Lane

The authoritative runtime path remains:

`UI -> contract-backed API -> POA proxy -> domain service -> repository port -> adapter -> DB`

That means classroom production hardening is not just a UI refactor.

It is a route-and-contract hardening exercise.

### 5.1 POA-ready classroom slices

These should remain public and classroom-owned:

- classroom membership and roster views
- attendance actions and attendance reads
- lesson and assignment reads and writes
- grading reads and writes
- classroom resources and classroom notes

### 5.2 POA bridge slices

These should keep public composition in `classroom`, but move authority and orchestration to the owning package:

- school invites
- principal observations
- institutional approvals
- founder and principal operational dashboards

Guardian and family flows should follow the same rule:

- guardian surfaces may consume classroom-owned academic projections
- guardian orchestration itself should not be embedded inside classroom

### 5.3 Immediate POA gaps to address

- UI or hooks that still call Supabase directly
- hooks that import API modules from sibling domains and assume ownership by usage
- screens that combine role resolution, feature gating, workflow decisions, and rendering in one file

## 6. Temporal Map

The repo already contains useful temporal signals:

- `viewDate`
- `useTemporalStore`
- `history` APIs
- snapshot and timeline concepts
- a `temporalProxy`

The problem is not a missing idea.

The problem is inconsistent application.

### 6.1 Temporal standard for classroom-adjacent flows

Every dense operational classroom feature should expose:

- current projection
- event or change history when the domain is time-sensitive
- explicit `viewDate` or equivalent read context
- comparison windows when the UI compares trends

### 6.2 Flows that must become explicitly temporal first

- attendance
- grading
- assignments and submissions
- observations and notes
- roster and membership changes
- school and classroom summary stats
- approvals and invite lifecycles

### 6.3 Temporal field guidance

Use these concepts consistently:

- `occurredAt`: when the business event happened
- `recordedAt`: when the system captured it
- `effectiveFrom` and `effectiveTo`: validity window
- `viewDate`: the reader's temporal lens
- `snapshot`: state projection for a moment
- `timeline`: ordered events over time
- `delta` or comparison window: difference between moments

### 6.4 Temporal anti-patterns to avoid

- treating every feature as a current-row lookup
- hiding time filters inside UI components
- using `created_at` as the universal business clock for all flows
- exposing trend widgets without explicit comparison inputs

## 7. Densest Leak Clusters

These are the highest-value cleanup areas because they currently mix the most concerns.

### 7.1 Workspace entry cluster

Representative files:

- `packages/classroom/src/screens/ClassroomScreen.tsx`
- `packages/classroom/src/components/ClassroomList.tsx`
- `packages/classroom/src/components/CreateClassroomModal.tsx`

Observed problems:

- UI still performs identity and persistence shaping
- onboarding, demo mode, role routing, and modal ownership are tightly coupled
- principal-specific school resolution still reaches into raw user rows in `ClassroomList.tsx`
- create and join logic still mixes UI steps with school, profile, classroom, and group orchestration

### 7.2 Institutional bridge cluster

Representative files:

- `packages/classroom/src/hooks/useSchoolInvites.ts`
- `packages/classroom/src/hooks/usePrincipalObservations.ts`
- `packages/classroom/src/screens/PrincipalDashboard.tsx`

Observed problems:

- classroom imports admin-owned API modules directly
- classroom composition and admin ownership are not clearly separated
- some flows likely belong to a dedicated admin bridge adapter or to admin-owned public APIs

### 7.3 Stats and pulse cluster

Representative files:

- `packages/classroom/src/hooks/useSchoolStats.ts`
- `packages/classroom/src/components/principal/MorningSituationalBrief.tsx`
- `packages/classroom/src/components/principal/ResourceNeedsDashboard.tsx`

Observed problems:

- some flows are already temporal and cache-aware
- ownership of school-wide pulse features still needs a classroom-vs-admin decision

### 7.4 Guardian cluster

Representative files:

- `packages/admin/src/guardian/api.ts`
- `packages/admin/src/screens/GuardianDashboardScreen.tsx`

Observed problems:

- guardian overview exists, but it is still built around direct Supabase access
- guardian data combines relationship management, academic visibility, and notification assembly in one API file
- the current package is workable, but the long-term ownership should be revisited if the surface expands

## 8. Recommended Migration Batches

Do not migrate this package by file order.

Migrate by workflow boundary.

### Batch A: Workspace hydration and entry

Scope:

- `useClassroomRoleData`
- `ClassroomList`
- `CreateClassroomModal`
- `ClaimInviteModal`
- `ClassroomScreen`

Target result:

- role hydration exposed through contract-backed APIs only
- no direct Supabase access from classroom entry UI
- onboarding and demo decisions moved into dedicated hooks or services
- workspace entry becomes thin composition
- mixed-role actors can hydrate into multiple capability surfaces without ad-hoc branching

Why first:

- this batch is the gateway to the entire classroom experience
- it reduces leakage quickly without forcing large academic feature rewrites

### Batch B: Academic classroom core

Scope:

- attendance
- assignments
- lessons
- resources
- gradebook
- teacher and student classroom dashboards

Target result:

- classroom-owned academic APIs are fully contract-backed and time-aware
- dashboards compose stable feature modules instead of embedding orchestration

Why second:

- this is the true value center of the package
- it defines the long-term meaning of `classroom`

### Batch C: Institutional bridge extraction

Scope:

- principal observations
- school invites
- principal dashboard bridges
- founder bridge surfaces

Target result:

- classroom keeps entry composition only where needed
- admin owns institutional orchestration and authority
- bridge adapters become explicit and documented

Why third:

- this work is easier once classroom entry and academic core stop leaking persistence

### Batch D: Temporal hardening

Scope:

- attendance histories and snapshots
- grading timelines and comparison views
- observation timelines
- school and classroom summary comparisons

Target result:

- every dense classroom feature can answer "as of when?" and "compared to what?"

Why fourth:

- temporal hardening should land after ownership and public contract shape are clearer

### Batch E: People and workforce separation

Scope:

- any remaining HR or non-academic staff workflows still reachable from classroom or admin

Target result:

- people and workforce become first-class owners instead of future placeholders

### Batch F: Guardian and family portal decision

Scope:

- guardian overview
- guardian permissions and relationship management
- custody and verification models
- family-facing notifications and event visibility

Target result:

- either confirm `admin` as the bounded owner for a small institutional guardian surface
- or create a dedicated guardian or family package before the workflow grows further

## 9. Recommended First Execution Batch

Start with Batch A.

More specifically, start in this order:

1. `ClassroomList.tsx`
2. `CreateClassroomModal.tsx`
3. `ClassroomScreen.tsx`
4. `ClaimInviteModal.tsx`

Rationale:

- `useClassroomRoleData.ts` has already begun the pattern shift
- `ClassroomList.tsx` still leaks identity-to-school lookup and pagination orchestration into UI
- `CreateClassroomModal.tsx` is the highest-density local orchestration file in the entry lane
- `ClassroomScreen.tsx` should become a shell after the lower-level entry contracts exist

## 10. Concrete Definition Of Done

Do not call the classroom lane production-ready until all of these are true for the targeted batch:

- no direct Supabase access from classroom screens, hooks, or presentational components
- every public API method used by the batch is contract-backed
- every contract route used by the batch has `metadata.authority`
- exported API surfaces are wrapped by POA proxy
- non-trivial orchestration is in domain services
- persistence sits behind repository ports and adapters
- the batch has explicit temporal inputs where the feature is time-sensitive
- architecture checks prevent new regressions
- mixed-role actors are handled through capability composition rather than one-off role condition trees

## 11. Short-Term Guardrails

While migration is in progress:

- keep `pnpm run check:classroom-boundaries` green
- do not add new `classroom -> admin` or `classroom -> workforce` couplings outside the freeze baseline
- do not add new direct Supabase usage in classroom UI or hooks
- avoid building new insight surfaces on top of unstable contracts

## 12. Working Conclusion

The classroom lane should not be treated as "too messy to define."

It is already definable.

The right interpretation is:

- `classroom` is the academic daily-work workspace
- `admin` is the institutional operating system
- `people` is HR ownership
- `workforce` is future non-academic staff ownership

The cleanup should now proceed as a batched production migration:

- first stabilize workspace entry
- then harden classroom-owned academic flows
- then extract institutional bridges
- then make temporal semantics explicit across the dense flows
