# Classroom Boundary Phase 1

Status: active freeze policy

This document defines the Phase 1 boundary hardening rules for the classroom lane while the older tab-shaped package is being decomposed into clearer domain-owned slices.

## Why This Exists

`classroom` began as the tab/workspace for school and teaching work.

Later, platform scope expanded into:

- school governance
- people and staff operations
- workforce concerns
- ERP families such as finance and accounting

That history means the current package still contains a mix of:

- true classroom-owned features
- workspace composition
- transitional governance adapters
- legacy direct persistence access

Phase 1 does not attempt to fully rewrite this.

Phase 1 freezes the current leak surface and prevents new drift while deeper POA and temporal migrations happen.

For the broader package meaning, see [`DOMAIN_OWNERSHIP_MAP.md`](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md).

## Holonic Clarification

These boundaries are not meant to pretend that school reality is isolated into unrelated boxes.

The platform is holonic:

- institutional decisions can shape academic work
- academic activity can feed institutional dashboards
- family and guardian visibility can depend on both classroom and administrative domains

Phase 1 is therefore a boundary freeze, not a denial of cybernetic interrelations.

Cross-domain influence should happen through:

- contracts
- POA
- services
- projections

It should not happen through:

- `UI -> Supabase`
- hidden schema knowledge in hooks
- deep imports into sibling package internals

## Ownership Model

### `packages/classroom` owns

- classroom workspace composition for web and mobile
- daily work surfaces for academic roles
- classroom registry and entry points
- teacher and student classroom-facing UX
- the teacher-student lifecycle inside real classroom work
- attendance, grading, lesson, assignment, and classroom resource experiences
- classroom-specific temporal projections and comparisons

### `packages/classroom` may orchestrate but should not newly own

- principal or founder entry composition when they are entering through the same app workspace
- projections shaped by institutional policy when they are still part of academic daily work
- thin adapters that hand off to public APIs from `admin`, `people`, or `workforce`

### `packages/classroom` does not own

- school governance and institutional hierarchy
- principal/founder/admin lifecycle ownership
- invite code generation and school-level governance workflows
- staff administration and broader people operations
- workforce planning, assignments, leave, and duty systems
- ERP families such as finance and accounting
- raw persistence access from screens, hooks, or presentational components

## Phase 1 Rules

### Allowed

- `classroom` importing public APIs from sibling packages through their package root exports
- web/mobile app navigators importing classroom package screens as thin adapters
- temporary classroom -> admin bridges that are explicitly baselined in the checker
- transitional founder entry adapters in classroom that delegate through `packages/admin/src/bridge/founderWorkspace.ts`
- academic workspace composition that spans multiple academic roles

### Forbidden

- `UI -> Supabase`
- deep imports into another package internals such as `@repo/admin/src/...`
- new classroom -> admin or classroom -> workforce couplings outside the approved baseline
- institutional ownership silently drifting back into `classroom`
- new business logic added directly to app shells when the package already owns the workflow

## Enforcement

Run:

```bash
pnpm run check:classroom-boundaries
```

This script currently enforces:

- no deep cross-package imports from classroom
- no new direct Supabase access in classroom outside the existing exception baseline
- no new classroom -> admin/workforce coupling outside the existing exception baseline

The current exception list is transitional. It is not approval for those boundaries to remain long-term.

## Next Phases

### Phase 2

- migrate classroom APIs to contract -> POA proxy -> service -> port -> adapter
- remove direct persistence access from hooks and screens

### Phase 3

- move principal, founder, and institutional governance ownership fully into `admin`
- move staffing and duty ownership into `people` or `workforce` based on the clarified domain split
- keep `classroom` as the academic daily-work workspace plus classroom-owned features

### Phase 4

- formalize temporal SSOT for operational entities
- ensure classroom, admin, people, and workforce all expose time-aware projections instead of implicit "current row" logic
