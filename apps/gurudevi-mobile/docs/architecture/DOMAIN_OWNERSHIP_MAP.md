---
title: "Domain Ownership Map"
status: "active"
created: 2026-03-30
updated: 2026-03-30
author: "Naween"
tags: [reorganized]
---

# Domain Ownership Map

Status: working architecture map

This document captures the intended meaning of the major product packages as the platform evolves from UI-tab origins into a production-grade domain architecture.

## Origin Rule

Several packages were originally named after app tabs.

That means the package name does not always equal a narrow business bounded context.

In particular, `classroom` began as the app's daily work tab, not just a literal classroom database module.

## Core Interpretation

## Holonic Rule

These packages should be treated as holons inside a larger educational holarchy.

That means each package has local ownership, but reality still crosses package boundaries.

Examples:

- a principal can set an academic cycle that shapes teacher workflow
- school governance decisions can affect classroom operations
- guardian visibility can depend on both institutional policy and student activity

So the architecture should support cybernetic interrelations across packages without collapsing ownership.

Use this rule:

- packages may influence each other through contracts, POA, services, and projections
- packages should not bypass ownership through raw persistence access or hidden imports
- cross-package influence is expected
- cross-package ownership leakage is not

### `packages/classroom`

`classroom` is the daily work workspace for academic roles.

It is the general workspace for day-to-day teaching and learning activity inside the app.

It includes:

- teacher daily work
- student daily work
- the teacher-student lifecycle inside real-world classroom activity
- classroom-facing attendance, grading, lesson, assignment, and resource flows
- classroom workspace composition for multiple academic roles

It may also host workspace composition for other roles when they are entering the app through the same work surface, but that does not automatically make `classroom` the owner of their business domain.

### `packages/admin`

`admin` owns institution and platform administration.

It covers:

- principal lifecycle
- founder lifecycle
- admin and manager workflows
- school governance and institutional structure
- inventory
- reports
- forms
- operational administration
- transitional guardian and family-overview surfaces when they are primarily institutional visibility tools

If the concern is about managing the institution or platform rather than participating in classroom life, it belongs here unless a more specific package owns it.

### `packages/people`

`people` owns HR-related flows for people across the platform.

It is the people and staffing domain, not the classroom workspace.

### `packages/workforce`

`workforce` is reserved for non-academic staff and related operational work.

Examples include:

- non-academic staff structures
- support operations
- future non-teaching workforce flows

This package is expected to grow later and absorb concerns that should not live in `classroom` or `people`.

### Additional packages

New packages may be added when a concern becomes large enough to deserve independent ownership.

Package addition is preferred over letting `classroom` or `admin` become indefinite catch-alls.

Likely future candidates include:

- a guardian or family package if guardian workflows expand beyond overview, notifications, and institutional visibility
- a dedicated academic-operations package if cross-school academic control becomes large enough to exceed classroom workspace composition

## Ownership Heuristic

Use this decision rule:

- If the feature is part of teacher-student daily academic work, prefer `classroom`.
- If the feature is about running the institution or platform, prefer `admin`.
- If the feature is about HR and people management, prefer `people`.
- If the feature is about non-academic operational staff, prefer `workforce`.
- If the feature is about guardians or family members consuming child progress and school communication, `admin` is acceptable as a temporary home, but prefer a dedicated package once the workflow becomes substantial.
- If none fit cleanly, define a new package instead of stretching an existing one.

## Role Composition Rule

Packages are not owned by job titles.

Packages are owned by workflows and business areas.

Actors may carry multiple capability bundles at the same time.

Examples:

- a principal may also teach
- a section head may still act as a teacher
- a grade head may carry both academic oversight and classroom teaching authority

That means:

- `principal`, `section_head`, and `grade_head` should not automatically become package owners
- package ownership still follows workflow ownership
- POA and capability composition decide which surfaces an actor may use

Practical interpretation:

- when an actor is doing classroom work, prefer `classroom`
- when the same actor is doing institutional governance or oversight, prefer `admin`
- when the same person carries both, the app should compose both capability surfaces without merging the domains

This is especially important for Sri Lankan school reality, where real-world roles often overlap instead of fitting a single pure title.

## Important Consequence

`classroom` should be treated as a workspace-oriented academic domain with broad composition responsibility, not as a tiny classroom table wrapper.

At the same time, `classroom` should not become the owner of every institutional workflow just because those workflows are visible from the same app area.

That distinction is critical for POA, temporal modeling, and production hardening.

## Relationship To POA

POA should enforce authority across these domain boundaries, but POA does not define domain ownership by itself.

Domain ownership comes first.

Then POA enforces who can act across that ownership model.

## Relationship To Temporal Modeling

All of these domains operate over time.

They should converge toward:

- time-aware contracts
- explicit view dates and comparison windows
- event-oriented history plus current projections

Temporal architecture is shared across domains, but ownership of each workflow still belongs to the package that models that business area.

## Guardian Note

Guardian and parent workflows do not map perfectly to the current package set.

For now:

- institutional guardian overview and school communication can live in `admin`
- child learning and progress data should still come from the owning academic domains through contracts

Longer-term:

- if guardian flows become a first-class portal with communication, permissions, custody, payments, and longitudinal child visibility, create a dedicated package instead of letting `admin` absorb it indefinitely
