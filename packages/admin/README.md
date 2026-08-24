---
title: "@repo/admin"
status: "active"
created: 2026-03-25
updated: 2026-03-25
author: "Naveen"
scribe: "opencode"
tags: [packages, admin]
---

# @repo/admin

## Purpose
`@repo/admin` is the institutional governance and official operations domain of Gurudevi. It represents the school as an institution rather than the classroom as a learning cell.

This package should be the home for:
- hierarchy and structure
- sections and institutional organization
- principal workspace shell
- approvals and governance
- institutional calendar
- official notes and observations
- reporting
- documents, forms, and letters
- school-wide inventory and institutional resources

## Domain Lens
`@repo/admin` is the school’s institutional nervous system. It is where a principal or school leader engages the school as a governed organism, not merely as a collection of classrooms.

Philosophy to engineering:
- `Policentric`: the institution is one center of coordination, not the only center in the platform
- `Holarchic`: the school contains sections, grades, classrooms, people, and workforce layers, but does not erase them
- `Cybernetic`: governance belongs where corrective institutional action can be taken
- `Autopoietic`: institutional rules, approval flows, and official artifacts should defend themselves through admin-owned contracts and tests
- `Impedance matching`: web can be more ERP-like here because institutional work often needs denser dashboards, but the underlying contracts must stay shared and mobile-safe

## Owns
- principal workspace shell and institutional navigation for governance views
- hierarchy, structure, sections, institutional calendar, approvals, and invites
- official notes, observations, reporting, and export-oriented views
- official forms, letters, and school documents
- school-wide inventory and institutional resource visibility
- institutional orchestration that consumes signals from classroom or people without taking ownership of those domains

## Does Not Own
- lesson delivery, assignments, submissions, or classroom pedagogy
- teacher personal/self-service identity flows
- generic human membership foundations
- deep job-family and non-academic workforce modeling
- raw platform-wide contracts that belong in `@repo/core`

## Collaborates With
- `@repo/core`
  - admin should use shared contracts such as `PlatformRole`, `SchoolRole`, `WorkRole`, `Membership`, `TenantContext`, `TenantKind`, and `ScopeRef`
  - admin authority should always flow through capabilities such as `useCapabilities()` and `requireCapability(...)`
- `@repo/classroom`
  - admin may orchestrate classroom signals for principals
  - classroom remains owner of pedagogy and classroom-specific data models
- `@repo/people`
  - admin may render people information in principal or governance views
  - people still owns human identity and staff-facing human flows
- `@repo/workforce`
  - future institutional workforce operations may use admin for governance surfaces, but workforce should own the job-system depth

## Typical Examples
- a principal managing school hierarchy, invites, calendar, and leave approvals
- a school generating an official attendance letter or report
- institutional inventory for labs, furniture, devices, and central stationery pools
- a web-native principal dashboard that summarizes school pulse without owning classroom pedagogy

## Current Reality / Boundary Drift
This package is active and increasingly upstream, but the transition is not fully complete.

Grounded examples:
- native and web principal workspace shells now depend on admin-owned workspace orchestration
- reporting, notes, observations, invites, structure, governance, and inventory are already clearly here
- some principal-oriented classroom-side panels still exist in `@repo/classroom`
  - current status: tolerated while boundary cleanup continues
  - direction: keep narrowing classroom until admin fully owns institutional shell concerns

Important clarification:
- admin may aggregate classroom or people signals for institutional decision-making
- aggregation does not mean ownership transfer

## Future Direction
- continue making `admin` the undisputed home for principal and institutional governance surfaces
- deepen official artifact ownership for forms, letters, and reports
- keep admin orchestration broad but not bloated: it should coordinate other domains, not absorb them
- make boundary expectations explicit enough that new institutional work naturally lands here

## Rules for Contributors
- If this feature is about the school as an institution, it likely belongs here.
- If this feature is an official artifact, approval, hierarchy, institutional calendar item, or school-wide report, it belongs here.
- If this feature is really about pedagogy, classroom learning, or student work, it belongs in `@repo/classroom`.
- If this feature is about human identity or staff self-service, it belongs in `@repo/people`.
- If this feature is about non-academic job systems, it belongs in `@repo/workforce`.
- Admin may orchestrate other domains, but should not silently absorb their core models.

Decision checklist:
- Is this institutional governance or an official artifact?
- Is this school-wide rather than classroom-local?
- Does this require principal or institutional authority rather than a teacher/student learning action?
- If this uses classroom or people data, is admin orchestrating rather than owning that source domain?
