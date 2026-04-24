# Role Workspace Strategy

Status: working strategy

This document defines how role dashboards should evolve across `classroom`, `admin`, and future packages.

It exists to answer one question:

How do we support many current and future roles without rebuilding architecture for each new dashboard?

This should be read together with:

- [DOMAIN_OWNERSHIP_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md)
- [CLASSROOM_READAHEAD_BLUEPRINT.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CLASSROOM_READAHEAD_BLUEPRINT.md)
- [CROSS_HOLON_CONTRACT_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CROSS_HOLON_CONTRACT_MAP.md)
- [POA Implementation Guide](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)
- [ARCHITECTURE_DEEP_DIVE.md](C:/Users/Naween/projects/polymath-platform/ARCHITECTURE_DEEP_DIVE.md)

## 1. Core Rule

Roles are not package boundaries.

A role is an actor viewpoint made of capabilities.

A package owns workflows.

So the system should be shaped as:

- package owns workflow
- POA composes capabilities
- workspace composes role surfaces

Not:

- every new role gets a new ad hoc architecture

## 2. Current Important Roles

The current important roles in the product are:

- teacher
- student
- principal
- founder
- guardian

Intermediate and mixed roles also already exist or are implied:

- grade head
- section head
- principal plus teacher
- founder plus institution operator

Future roles may be added later, especially in non-academic operations.

The architecture must assume role growth from the start.

## 3. Package Meaning By Role Family

### 3.1 Classroom

`classroom` should remain the academic daily-work workspace.

Primary role families:

- teacher
- student
- academic mixed-role surfaces such as grade head and section head

It may also compose adjacent institutional entry surfaces when those roles enter through the same app shell.

That does not make `classroom` the owner of all logic for those roles.

### 3.2 Admin

`admin` should remain the institutional and platform governance workspace.

Primary role families:

- principal
- founder
- guardian or family overview for now
- institutional operators and management flows

### 3.3 Future packages

If a role family grows into a substantial workflow domain, it should become a package seam instead of expanding a legacy package forever.

Examples:

- guardian or family portal
- workforce and non-academic staff
- specialized ERP operators

## 4. Observed Current State

### 4.1 Classroom already has a shell pattern

`packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx` already acts as a workspace surface registry for:

- founder
- principal
- section head
- grade head
- teacher
- student

This is strategically the right direction.

### 4.2 Role implementations are uneven

Some role surfaces are already moving toward thin shells and composable sections.

Example:

- principal native workspace now routes through `usePrincipalWorkspaceSurfaces.tsx`

Other role dashboards still mix:

- UI composition
- direct data access
- action orchestration
- role-specific navigation
- temporal handling

Examples:

- `StudentDashboard.tsx`
- `TeacherDashboard.tsx`
- `FounderDashboard.tsx`
- `GuardianDashboardScreen.tsx`

### 4.3 Guardian currently fits best in admin

The current guardian implementation in `packages/admin` is reasonable as a school and family overview surface.

It mainly composes:

- student overview
- notifications
- events

This should stay in `admin` for now unless the family experience grows into a full portal.

## 5. Target Pattern For Every Role Workspace

Each important role workspace should eventually follow the same structure.

### 5.1 Workspace surface registry

Every multi-role shell should have a surface registry hook.

Examples:

- `useClassroomWorkspaceSurfaces`
- `usePrincipalWorkspaceSurfaces`

Future equivalents:

- `useTeacherWorkspaceSurfaces`
- `useStudentWorkspaceSurfaces`
- `useFounderWorkspaceSurfaces`
- `useGuardianWorkspaceSurfaces`

### 5.2 Thin dashboard shell

Each role screen should become a thin shell that is responsible for:

- top-level layout
- view switching
- layout persistence
- workspace preferences
- modal ownership only when truly local

It should not directly own:

- persistence logic
- raw cross-package orchestration
- table knowledge
- mixed domain logic

### 5.3 Role modules or sections

Each role workspace should be composed from smaller surfaces or modules.

Examples:

- overview
- today
- institution
- outlook
- assignments
- notices
- attendance
- logbook
- child overview

### 5.4 Explicit data path

Every role module should follow:

`workspace shell -> role surface hook -> public API/bridge -> domain service -> repository/adapter`

Not:

`screen -> supabase`

### 5.5 Layout readiness

Surface ids must be stable so that a future workspace canvas can support:

- ordering
- hiding
- pinning
- defaults by capability bundle
- user-specific arrangement across mobile and web

## 6. Recommended Ownership By Important Role

### 6.1 Teacher

Belongs primarily to `classroom`.

Teacher owns academic daily work:

- class registry
- attendance
- assignments
- lesson and resource flow
- student academic pulse

Teacher admin or HR actions should be composed from `people` or `admin`, not absorbed into `classroom`.

### 6.2 Student

Belongs primarily to `classroom`.

Student owns learning and participation surfaces:

- sanctuaries or enrolled classes
- assignments
- attendance view
- personal progress
- learning goals

Family or guardian visibility of student data should come from academic sources but not move guardian workflow ownership into `classroom`.

### 6.3 Principal

Principal is primarily an `admin` workflow family with academic bridge surfaces.

A principal may enter from the same application shell, but institutional governance still belongs in `admin`.

Academic pulse consumed by principals can be composed into admin or classroom entry surfaces as needed.

### 6.4 Founder

Founder belongs in `admin` as platform and ecosystem governance.

If founder also operates a school, that should be modeled as mixed capabilities, not by forcing founder logic into classroom ownership.

### 6.5 Guardian

Guardian belongs in `admin` for now.

Guardian is a family-facing observer and participant in school communication, not an academic daily-work operator.

The guardian data path should source from:

- academic domains for student learning state
- school domains for announcements and events
- policy domains for what can be seen

## 7. Mixed Roles

Mixed roles should be expressed through capability composition and workspace composition.

Examples:

- principal plus teacher
- grade head plus teacher
- section head plus teacher
- founder plus principal

These should be handled by:

- capability bundles from POA
- multiple workspace surfaces
- layout and preference rules

Not by inventing a brand-new monolithic role screen each time.

## 8. Migration Order Before POA Hardening

POA should come after role ownership is clearer.

Recommended order:

1. Teacher workspace cleanup in `classroom`
2. Student workspace cleanup in `classroom`
3. Founder workspace cleanup in `classroom` and `admin`
4. Guardian workspace cleanup in `admin`
5. Mixed-role composition rules
6. POA contract hardening on stabilized seams

## 9. Immediate Next Steps

The next strategic pass should be a role-by-role read-ahead audit with findings in this order:

1. teacher
2. student
3. founder
4. guardian

For each role we should answer:

- which package owns the workflow
- which surfaces belong in the workspace shell
- which cross-package calls are legitimate bridges
- where direct DB or API leakage still exists
- what the future canvas needs in terms of stable surface ids and layout metadata

This gives us one reusable architecture for many roles instead of repeating one-off dashboard rewrites.
