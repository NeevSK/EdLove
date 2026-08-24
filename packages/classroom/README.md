---
title: "@repo/classroom"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, classroom]
---

# @repo/classroom

## Purpose
`@repo/classroom` is the pedagogical and classroom-operational domain of Gurudevi. It exists to support the living teacher-student-classroom cell inside a Sri Lankan school, not the whole institution.

This package should feel like the place where teaching, learning, and classroom rhythm happen:
- lessons and lesson plans
- assignments and submissions
- student attendance
- gradebook and marks
- classroom timetables
- classroom-owned resources
- classroom rosters
- student learning analysis

## Domain Lens
The classroom is the smallest living learning ecology in the platform. In Gurudevi terms, this package is the immediate cell where teacher presence, student growth, and class activity meet.

Philosophy to engineering:
- `Policentric`: the classroom is one center of agency, not the whole school
- `Holarchic`: a classroom lives inside a section/grade/school, but still has its own logic
- `Cybernetic`: feedback here should shape teaching and learning loops
- `Autopoietic`: classroom invariants should be defended by classroom-owned hooks, APIs, and tests
- `Impedance matching`: web may render richer classroom workbenches, but contracts must remain safe for mobile and low-resource devices

## Owns
- lesson delivery and classroom workflow
- lesson plans, assignments, submissions, grading, report-card generation in classroom context
- student attendance and classroom participation signals
- classroom-specific materials and resources
- teacher and student dashboards for day-to-day classroom activity
- classroom-level analytics such as student pulse and learning insights
- classroom list, roster, enrollment-to-classroom flows, and class-facing QR join flows

## Does Not Own
- school hierarchy, governance, approvals, and principal institutional shell
- staff HR, staff self-service, or broader human administration
- official school-wide forms, letters, and institutional reporting
- school-wide inventory and institutional asset management
- staff presence, attendance, or school-wide pulse metrics (belongs in `@repo/people`)
- non-academic staffing, duty structures, or workforce modeling
- platform-wide contracts such as `PlatformRole`, `SchoolRole`, `WorkRole`, `Membership`, `TenantContext`, `TenantKind`, and `ScopeRef`

## Collaborates With
- `@repo/core`
  - source of truth for tenancy, capabilities, role contracts, and shared policy language
  - classroom features should consume `useCapabilities()`, `requireCapability(...)`, and tenancy context instead of inventing local authority shortcuts
- `@repo/people`
  - classroom may consume people-owned identity or teacher-facing admin widgets where needed
  - classroom should not become the long-term home of people workflows
- `@repo/admin`
  - admin may orchestrate classroom signals for principal views
  - classroom remains owner of pedagogy, student learning activity, and classroom context

## Typical Examples
- a Grade 7 mathematics teacher taking attendance and posting an assignment
- a student submitting work and checking feedback
- a classroom-level timetable and student learning pulse
- classroom-owned items such as lesson materials, whiteboard resources, or class-specific teaching tools

## Current Reality / Boundary Drift
Current code reality is better than before, but not perfectly clean yet.

Examples of tolerated or transitional drift:
- `src/screens/PrincipalSchoolView.tsx` still lives in this package
  - current status: tolerated transition shell
  - direction: principal institutional shell should continue moving toward `@repo/admin`
- `src/components/principal/`
  - some files there are true classroom-side panels such as resource needs, pulse, and classroom-facing analytics
  - some are wrappers or historical residues from earlier principal ownership and should keep shrinking over time
- classroom still consumes some people/admin pieces during transition
  - current status: acceptable when classroom is only the consumer and not the owner
  - direction: keep classroom thin around non-classroom concerns

## Future Direction
- keep principal institutional orchestration out of this package
- deepen classroom ownership around pedagogy, student growth, and classroom-specific analytics
- make it increasingly obvious that student learning analysis belongs here unless it becomes institution-wide reporting
- reduce remaining principal-oriented surface area until the package reads clearly as “teaching and learning”

## Rules for Contributors
- If this feature is mainly about teaching, learning, student work, or class rhythm, it probably belongs here.
- If this feature is mainly about a person as staff/member/identity, it probably belongs in `@repo/people`.
- If this feature is mainly about school governance, official administration, or institutional artifacts, it probably belongs in `@repo/admin`.
- If this feature is mainly about non-academic operations staffing, it probably belongs in `@repo/workforce`.
- Prefer shared contracts from `@repo/core` over inventing new local role or tenancy models.
- Prefer thin app screens and package-owned orchestration over mixed logic in `apps/`.

Decision checklist:
- Is this about classroom learning activity?
- Is the main object a class, lesson, assignment, student work item, attendance record, or classroom resource?
- Would a teacher or student experience this as part of class life rather than school governance?
- If this touches people/admin/workforce concerns, is classroom only consuming them rather than owning them?
