---
title: "Principal admin parity audit"
status: "active"
created: 2026-10-29
updated: 2026-10-29
author: "Codex"
tags: [gurudevi-web, principal, admin, migration, parity]
---

# Principal admin parity audit

This is a source inspection, not a runtime acceptance report. A route, component name, registry status, or passing route-existence audit does not establish a working user journey. Native and legacy web behavior must be verified independently before being treated as the target contract.

## Sources and intent

- `packages/admin/README.md` describes school structure, calendar, staff leave, official documents, and resources. Its stewardship and non-intrusion principles constrain the product.
- `packages/admin/src/principal/workspace.ts` is the capability inventory; its `live` and `planned` values describe the shared principal model, not Next.js parity.
- `apps/gurudevi-mobile/docs/Core/design/principal-redesign-gap-map.md` calls for a capability-aware workspace, access controls, temporal behavior, onboarding, and focused rooms. It is a design target, not proof of current web behavior.
- `packages/admin/src/screens/PrincipalDashboard.web.tsx` is a React Native Web migration source, not a Next.js component. It wires hierarchy, invites, logbook, cycles, onboarding and data hooks, but some dashboard callbacks are empty. Its existence does not prove those actions work.
- `apps/gurudevi-web/app/(sanctuary)/admin/principal/PrincipalFloor.tsx` is the current browser-native surface; `lib/domain/principalDomain.ts` supplies sandbox data and browser-storage leave handling.

## Tracking rule

Track each capability by stable `PrincipalCapabilityId` where one exists. Record separately: intended outcome and source, legacy UI and behavior, Next.js entry and behavior, real data and mutation contract, authorization and tenant scope, flow and ingress, empty/error/demo states, and evidence tier with date. Status applies to each dimension: **uninspected**, **absent**, **placeholder**, **partial**, or **verified**. Mark verified only for the stated journey and evidence level, never because a filename or registry entry exists. Update this audit when implementation or evidence changes; link to tests and browser/device evidence.

## Initial principal inventory

| Capability | Legacy/package evidence | Next.js observation | Status and next proof |
| --- | --- | --- | --- |
| Admission and setup | Principal workspace and setup wizard; gap map requires capability and onboarding gates | `admin/principal/page.tsx` checks entry state, but does not check principal capacity for signed-in users; signed-out and missing client render exploration | Partial. Verify school-scoped authority, return intent, onboarding and explicitly read-only demo. |
| `morning_brief`, `faculty_overview`, `student_pulse` | Dashboard hooks query school, staff and student data | Principal floor renders fixed census, presence, flags and narrative | Placeholder. Connect authorized, school-scoped data and honest loading, empty and error states. |
| `pending_approvals` | Dashboard hook lists approvals; `staffManagement.approveLeave` exposes a server call; legacy web dashboard passes empty approval callbacks | Leave list comes from sandbox/local storage; review removes an item locally and displays success; decision is not sent to the server | Placeholder. Establish server authorization, tenant-bound query and mutation, retries, invalidation and failure handling before claiming approval. |
| `curriculum_pulse` | Legacy dashboard queries progress; registry labels the strategic capability planned | Web tab reads sandbox samples; no production query in its domain service | Placeholder. Verify whether the underlying aggregate is authorized and available before implementing. |
| `hierarchy`, `invites`, `cycles`, `log`, `notes`, `legacy` | Legacy dashboard renders focused views with school-management gating | No corresponding focused view in the principal floor inspected | Absent from inspected principal surface. Trace existing domain APIs and journeys per capability before porting. |
| `institutional_calendar`, `observations`, `resource_needs`, `ecosystem_resonance`, `relief` | Registry lists these as live; legacy dashboard reads several operational sources | Not implemented as functional principal journeys in the inspected floor | Unverified elsewhere. Inventory contracts and direct entry points before implementation. |
| `setup_runway`, `school_profile`, `workspace_switcher`, `open_commons` | Shared capability registry and legacy onboarding/navigation | No equivalent principal controls observed in the inspected floor | Unverified elsewhere. Check workspace integration and ingress. |
| `inventory`, `finance`, `accounting`, `reporting`, `circulars`, `documents`, `compliance`, `timetable` | Registry marks these planned; README describes some as aspirations | Other web routes may exist, but route existence does not prove principal functionality | Planned or unverified; define scope and contracts individually. |

## Adjacent surfaces and flow drift

- `admin/analytics/EnhancedAnalyticsFloor.tsx` contains hard-coded metrics and subject data. It is not evidence of working institutional analytics.
- `admin/documents/DocumentListFloor.tsx` filters sandbox samples and links every document to the same library reader. This is not evidence of a working document repository or correct document retrieval.
- `packages/core/src/flows/admin/principalTermSetup.flow.ts` maps term setup and publication to analytics and section allocation to documents. The inspected pages do not provide those actions. Route-existence checks alone cannot detect this semantic mismatch. Correct the contract alongside actual screens and test the actions and transitions, rather than changing paths to other placeholders.

## Setup and daily use are distinct journeys

Setup must be derived from actual school-scoped data and permitted actions, not inferred from a new account or an empty dashboard. A school may have an incomplete timetable while its daily work remains active. For each setup item, represent not started, in progress, complete, unavailable, and permission denied separately; retain drafts and support resumption. Missing data should lead to the relevant setup action, while a failed read must never be presented as an empty school. A principal with no school bond needs a school establishment or join journey; an existing school needs incremental setup without suppressing daily operations. Guest exploration must remain clearly identified and have no real writes.

| Phase | Capability | Substrate and current gap |
| --- | --- | --- |
| Setup | School identity and authority | `School`, `Bond` and school registry/claim models exist; the principal setup machine stores a local snapshot and its activated state alone does not establish a persisted school or bond. Trace creation and claim transactions before connecting the UI. |
| Setup | Structure and people | `Section`, `GradeLevel`, `GradeClass`, cycle leadership and invitations model parts of this work. Legacy principal hierarchy and invite rooms exist; their actual server paths and lifecycle need individual verification. |
| Setup | Academic year and terms | `AcademicCycle` has school, dates and status; `Term` belongs to a cycle; grade classes, assignments and enrollment link into the cycle. The existing cycle flow maps to unrelated web screens and must be corrected with the implementation. The older `academicCyclesAPI` is annotated deprecated. |
| Setup | Institutional timetable | The inspected `TimetablePeriod` model is keyed to `user_id`, with no school, grade class or academic cycle relation. It is not evidence of a school-wide timetable model. The web timetable reads sandbox data and stores its checklist locally. Find and validate any other authoritative scheduling substrate before designing institutional scheduling. |
| Daily | Operational overview | School/staff/attendance data and notes exist in several domains; web principal summary is fixed content. Reads need school and time context, visible source and proper empty/error states. |
| Daily | Leave, calendar, notes | Admin and principal-notes oRPC procedures exist, but their authorization and data scope need real-database verification; do not treat a contract or mock as an end-to-end guarantee. |

### Data relationships inspected

`School` relates to `Section`, `AcademicCycle`, `GradeLevel`, `GradeClass`, `PrincipalNote`, `StaffLeave`, `CalendarEvent` and membership records. `AcademicCycle` owns terms and connects to grade classes, assignments, enrollments and attendance. `PrincipalNote` references its school and author. `StaffLeave` references school and user. These observations are from `packages/schema/schema.zmodel`; they do not establish the deployed database schema, migration status, contents, or live RLS behavior. No live database was inspected in this audit.

## Cedar and oRPC authorization seam

- `packages/policies/src/policies/school/principal.cedar` permits a principal when the resource carries the principal's school ID. Cedar evaluates the resource facts supplied to it; its [authorization model](https://docs.cedarpolicy.com/auth/authorization.html) does not independently load the target row.
- `doubleGateMiddleware` rejects anonymous and missing-policy requests, evaluates Cedar, and constructs many resource school attributes from `context.schoolId`. `PrincipalNote` has a specific lookup for existing notes, but the inspected middleware has no analogous target lookup for `Staff` leave decisions.
- `admin.approveLeave` uses the raw `context.db` to update a leave by ID. It does not explicitly compare the target leave's school to the active school. `policyDb.ts` states that `context.db` does not enforce ZenStack `@@allow`; therefore the `StaffLeave` ZModel rule cannot be assumed to enforce this handler's boundary. This is a source-level authorization gap requiring a cross-school real-database regression test and a server-side fix before wiring real approvals. It is not a verified production exploit.
- `getPendingLeaves` does explicitly compare the requested school with the active school. Its Cedar subject is `Staff`, so review action granularity and least privilege separately from tenant isolation.
- `CalendarEvent` ZModel grants school-bond reads and platform-admin writes, while the inspected admin handler uses raw `context.db`. Assess Cedar, SQL/RLS, and intended principal write authority together; a ZModel policy alone does not describe enforcement on this path.
- The API manifest pins `@orpc/server` and `@orpc/contract` to `2.0.0-beta.46`; policies declare Cedar WASM `^4.14.0`. The admin oRPC contract aliases the sovereign contract and supplies per-procedure policy metadata. Version-specific handler behavior must be grounded in installed declarations and the actual middleware, not assumed from a version label.

Acceptance for each real mutation must include same-school allowed, different-school denied, insufficient-capacity denied, unauthenticated denied, missing target and database failure, with the authoritative database and active-bond context. Browser evidence must additionally cover empty, populated, loading and failure states in both setup and daily use.

## Implementation sequence

1. Establish fail-closed principal and school admission, explicit read-only exploration, and truthful data states; confirm existing authorization contracts on the server.
2. Implement one end-to-end journey at a time, starting with leave approvals: ingress, permissions, school scope, list, decision, server receipt, error/retry and refresh. Prove unauthorized and cross-school access fail closed.
3. Implement hierarchy, invitations, cycles and notes/logbook against existing domain contracts; declare or correct each FlowDAG before the UI and test deep links and missing prerequisites.
4. Connect read-only aggregates, calendar, observations and resources to real authorized data; distinguish unavailable from zero and mock from live.
5. Treat planned ERP families as separate scoped work, with explicit product outcomes, contracts and evidence; do not infer implementation from module names.

For each slice, run the FlowDAG audit, relevant contract and component tests, and browser acceptance at phone and desktop widths. Record precisely what each test proves and what remains untested. Review raw `git diff` and preserve existing behavior under the deletion veto.
