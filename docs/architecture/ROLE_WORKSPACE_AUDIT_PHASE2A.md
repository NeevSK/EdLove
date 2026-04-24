# Role Workspace Audit Phase 2A

Status: read-ahead audit

This document audits the current role workspace architecture for the first important role families:

- teacher
- student
- founder
- guardian

The purpose is to stabilize role ownership and workspace structure before deeper POA hardening.

Related documents:

- [ROLE_WORKSPACE_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_STRATEGY.md)
- [DOMAIN_OWNERSHIP_MAP.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/DOMAIN_OWNERSHIP_MAP.md)
- [CLASSROOM_READAHEAD_BLUEPRINT.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CLASSROOM_READAHEAD_BLUEPRINT.md)
- [POA Implementation Guide](C:/Users/Naween/projects/polymath-platform/docs/architecture/POA_IMPLEMENTATION_GUIDE.md)

## 1. Executive Summary

The current repo already has the beginning of the right architecture:

- `classroom` has a multi-role workspace surface registry
- principal now has a split workspace surface model, with zone/capability shell composition moving into `admin`
- guardian is clearly separated into `admin`

But the role dashboards are still uneven.

The biggest current risks are:

- teacher still mixes workspace shell, people-facing flows, and local orchestration in one screen
- principal still has many classroom-hosted surfaces even though the shell is now admin-owned
- founder still has transitional classroom entry shells even though the data and create seams now flow through `admin`
- guardian still has transitional admin compatibility wrappers even though the contract/service/repository seam now exists in `core`

## 2. Cross-Role Pattern Already Present

`packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx` already composes these surfaces:

- founder
- principal
- section head
- grade head
- teacher
- student

This is the most important architectural signal in the current codebase.

It means the app is already moving toward:

- one shell
- many role surfaces
- capability-based composition

The next step is to make each important role dashboard follow the same internal pattern.

## 3. Teacher Audit

Primary files:

- `packages/classroom/src/screens/TeacherDashboard.tsx`
- `packages/classroom/src/screens/TeacherDashboard.web.tsx`
- `packages/classroom/src/hooks/useTeacherDashboardHooks.ts`

### 3.1 Ownership

Teacher belongs primarily in `classroom`.

This is the cleanest ownership case.

### 3.2 What looks good

- web teacher flows already use dedicated dashboard hooks
- teacher is clearly treated as an academic daily-work workspace
- classroom registry and assignment pulse fit well inside `classroom`

### 3.3 Risks

- native `TeacherDashboard.tsx` is still a large orchestration screen
- it directly composes `@repo/people` modals and cross-domain actions inside the classroom shell
- teacher group management still uses direct Supabase in `TeacherGroupsModal.tsx`

### 3.4 Migration direction

Teacher should be the next role to normalize after principal.

Target:

- `useTeacherWorkspaceSurfaces`
- thin `TeacherDashboard` shell
- teacher admin and people actions routed through explicit public bridges or POA-backed APIs
- teacher group and classroom-specific data pushed behind classroom-owned APIs

## 4. Student Audit

Primary files:

- `packages/classroom/src/screens/StudentDashboard.tsx`
- `packages/classroom/src/screens/StudentDashboard.web.tsx`
- `packages/classroom/src/hooks/useStudentDashboardHooks.ts`

### 4.1 Ownership

Student belongs primarily in `classroom`.

This is also a clean ownership case.

### 4.2 What looks good

- web student flows already use dedicated hooks
- the student experience clearly aligns with academic daily work
- temporal navigation is already present in both student directions

### 4.3 Risks

- native `StudentDashboard.tsx` still queries `assignments` and `submissions` directly through Supabase
- student dashboard shell currently mixes:
  - workspace composition
  - temporal UI
  - direct academic persistence
  - local stat derivation

### 4.4 Migration direction

Student is the highest-value next cleanup.

Target:

- `useStudentWorkspaceSurfaces`
- native student dashboard follows the same hook-driven pattern as web
- assignment and submission flows move behind classroom-owned public APIs
- temporal queries become explicit instead of implicit direct reads

## 5. Founder Audit

Primary files:

- `packages/classroom/src/screens/FounderDashboard.tsx`
- `packages/classroom/src/screens/FounderSchoolDashboard.tsx`
- `packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx`

### 5.1 Ownership

Founder should primarily belong in `admin`, not `classroom`.

The current location in the classroom shell is understandable historically, but it should now be treated as transitional.

### 5.2 What looks good

- founder is already represented as a distinct workspace surface
- founder sees ecosystem and multi-school views, which matches platform governance

### 5.3 Risks

- founder still lives as a classroom workspace surface rather than an admin-governance surface
- `FounderSchoolDashboard.tsx` still acts as an institutional shortcut into principal operations
- founder and principal boundaries are still soft

### 5.4 Migration direction

Founder should move to the admin side as a formal workspace family.

Target:

- founder dashboard becomes an admin-owned workspace shell
- founder-school oversight composes principal or institutional views through explicit bridges
- classroom may still host an entry surface if needed, but should not remain founder logic owner

Current transition status:

- founder data seams are now exported from `admin` through `bridge/founderWorkspace.ts`
- classroom founder screens and create entry points should be treated as transitional entry shells over admin-owned founder hooks
- founder contract coverage and POA proxying now exist in `packages/core/src/api/founder.contract.ts` and `packages/core/src/api/index.ts`
- the next step is to migrate the remaining founder UI implementations themselves into `admin`

## 6. Guardian Audit

Primary files:

- `packages/admin/src/screens/GuardianDashboardScreen.tsx`
- `packages/admin/src/guardian/api.ts`
- `packages/admin/src/guardian/types.ts`

### 6.1 Ownership

Guardian belongs in `admin` for now.

This is correct.

### 6.2 What looks good

- guardian is already modeled as a dedicated domain in `admin`
- the screen is relatively shell-like and composes smaller guardian components
- the use case is clear: child overview, notifications, events

### 6.3 Risks

- `guardian/api.ts` is very database-heavy and contains broad cross-domain joins and assembly logic
- the guardian data path is mixing:
  - guardian identity
  - relationship management
  - attendance
  - grades
  - assignments
  - notifications
  - events

This means guardian is in the right package, but not yet production-ready architecturally.

### 6.4 Migration direction

Guardian should stay in `admin`, but needs stronger internal separation.

Target:

- guardian identity and relationship services
- guardian dashboard projection service
- academic child-view data sourced through owning domains
- future option to extract a family package if the workflow grows substantially

Current transition status:

- guardian remains admin-owned
- the workspace screen now reads through a dedicated guardian workspace hook rather than loading dashboard state inline
- guardian read and write seams now flow through core contract/service/repository paths, with admin acting as a compatibility/workspace layer
- the next step is to remove or narrow the remaining compatibility wrappers once callers move to the core-backed surface directly

Latest progress:

- guardian dashboard loading now flows through `guardian/useGuardianWorkspaceData.ts`
- founder and guardian POA coverage tests now run in `packages/core/src/api/__tests__/founder-guardian-poa.test.ts`
- admin guardian facade delegates through `api.guardian.*`
- founder classroom entry hooks and create flows now delegate through `@repo/admin`

## 6A. Principal Audit

Primary files:

- `packages/classroom/src/screens/PrincipalDashboard.tsx`
- `packages/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx`
- `packages/admin/src/bridge/principalWorkspaceShell.tsx`
- `packages/admin/src/principal/workspace.ts`

### 6A.1 Ownership

Principal belongs primarily in `admin`, even when the user enters through the classroom tab shell.

### 6A.2 What looks good

- capability registry and workspace views already lived in `admin`
- the principal shell is now composed through `admin` bridge code rather than being fully classroom-owned
- classroom can now supply academic-facing panels as injected content instead of owning the entire institutional shell

### 6A.3 Risks

- many principal-facing panels still physically live under `packages/classroom/src/components/principal`
- there is still a large approved classroom -> admin transitional surface for principal work
- principal additional views like hierarchy, invites, notes, and reporting are still spread across packages

### 6A.4 Migration direction

Principal should continue toward an admin-owned workspace family with classroom only supplying academic panels where needed.

Target:

- admin owns zone/capability shell composition
- admin owns institutional panels and additional principal views
- classroom contributes only clearly academic principal panels through bridge injection
- POA and temporal coverage then harden the resulting admin-owned seams

## 7. Priority Order

Recommended implementation order before the POA hardening pass:

1. student
2. teacher
3. founder
4. guardian

Reasoning:

- student has the clearest direct persistence leak in the native dashboard
- teacher is the next largest classroom workspace and sets the reusable classroom pattern
- founder needs ownership relocation more than micro-cleanup
- guardian is already in the right package and can be hardened after the role ownership picture is clearer

## 8. Immediate Implementation Batches

### Batch R1: Student workspace normalization

- create hook-driven native student workspace surfaces
- remove direct Supabase assignment and submission reads from `StudentDashboard.tsx`
- align native and web student data paths

### Batch R2: Teacher workspace normalization

- create `useTeacherWorkspaceSurfaces`
- slim `TeacherDashboard.tsx`
- move classroom-specific teacher group persistence behind classroom APIs
- make people-facing actions explicit bridges

### Batch R3: Founder ownership extraction

- define founder as admin-owned governance workspace
- keep only a thin transitional entry surface in classroom if needed
- separate founder ecosystem views from principal institutional views

### Batch R4: Guardian internal hardening

- split guardian API into services and projections
- reduce raw dashboard assembly inside `guardian/api.ts`
- prepare guardian seams for future POA coverage

## 9. Decision

Before the next POA round, we should proceed with:

- student first
- teacher second
- founder third
- guardian fourth

This gives us one stable architecture pattern for the important roles we deal with now, and it prepares the system for future roles without needing another redesign.
