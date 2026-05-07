# Student Workspace Feature Inventory

Status: active audit

This document captures the student role inventory more explicitly so we can separate:

- what already exists in code
- what is surfaced in the student workspace canvas
- what lives in classroom detail or self flows instead
- what is still genuinely missing

Use this with:

- [ROLE_WORKSPACE_IMPLEMENTATION_GUIDE.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_IMPLEMENTATION_GUIDE.md)
- [ROLE_WORKSPACE_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_STRATEGY.md)

## 1. Core verdict

Student is not empty.

But student is currently under-expressed at the workspace level.

The role has real capability in:

- dashboard hooks
- classroom detail flows
- self and reflection flows
- rewards and goals data

Yet only a smaller subset is surfaced in the student canvas.

That makes student feel thinner than teacher and principal even where the underlying domain work already exists.

## 1.1 Boundary rule

The boundary must be capability-first, not file-name-first.

`Self` is for:

- personal regulation
- wellbeing
- reflection
- present-oriented sanctuary features
- temporal self-history

The student workspace is for:

- studying
- classroom participation
- assignments
- academic progress
- school-facing navigation
- private academic commitments such as learning goals

Important nuance:

- a surface can be private without belonging to `Self`
- student learning goals are private academic work, so they belong in the student workspace
- breathing, reflection, fire journal, and broader self-regulation belong in `Self`
- timetable belongs to the student workspace family even if it is personally managed
- grades and progress visualizations are academic mirrors, not wellbeing primitives

If a feature is in the wrong place today, fix the capability boundary first and only then adjust the UI host.

## 2. Current top-level workspace surfaces

Defined in:

- [useStudentDashboardSurfaces.tsx](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/workspace/useStudentDashboardSurfaces.tsx)

Current student canvas surfaces:

1. `temporal-context`
2. `quick-actions`
3. `learning-pulse`
4. `rewards-pulse`
5. `sanctuaries`
6. `demo-assignments`
7. `demo-goals`

Notes:

- `demo-assignments` is now serving as the stable surface id for the assignment queue
- `demo-goals` is now serving as the stable surface id for goals and growth
- this is acceptable short term because the ids were already introduced
- if we later rename ids, do so through an explicit layout migration

## 3. Student capability inventory

### A. Belongs in the student workspace canvas

These are top-level rhythm surfaces and should be expressed in the canvas:

- temporal context
- quick actions
- learning pulse
- classroom registry
- assignment queue
- goals and growth
- rewards momentum

### B. Belongs in classroom drill-in rooms

These are deeper task surfaces and should usually open after choosing a classroom:

- lesson materials
- assignment detail
- assignment submission
- attendance history
- classroom-specific progress

### C. Belongs in self or private student space

These remain important but should not all compete in the main canvas:

- reflection
- fire journal
- daily rhythm
- deeper rewards history when framed as self-story rather than school progress

Important correction:

- full goals management is not automatically a `Self` feature
- student goals are academic commitments and belong to the student workspace family
- `Self` may still host reflective companions around those goals, but should not own the academic capability itself

### D. Transitional deviations we should keep shrinking

These are capability leaks or migration leftovers, not the intended end state:

- `StudentSelfView` previously hosted `StudentGoals` directly even though goals are academic commitments
- goals have now been removed from `StudentSelfView` and re-centered in the student workspace
- grades and growth progress now surface from the student workspace family rather than `Self`
- rewards does not yet have a dedicated student-owned room, so the dashboard shortcut should not route into `Self`

## 4. Real code-backed student features

### Workspace and dashboard data

- [useStudentWorkspaceData.ts](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/workspace/useStudentWorkspaceData.ts)
- [useStudentDashboardHooks.ts](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/hooks/useStudentDashboardHooks.ts)

Backed by real hooks:

- student classroom registry
- upcoming assignments
- rewards points
- growth pulse

### Goals

- [useStudentGoals.ts](C:/Users/Naween/projects/polymath-platform/packages/core/src/hooks/useStudentGoals.ts)

This is real and should not remain invisible at the workspace level.

### Rewards

- [useRewards.ts](C:/Users/Naween/projects/polymath-platform/packages/core/src/hooks/useRewards.ts)

Rewards are real.

The student dashboard previously exposed only a toast.

That made the role feel less complete than the domain actually is.

### Existing student-specific UI parts

- [StudentGoals.tsx](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/components/student/StudentGoals.tsx)
- [StudentStudySuite.tsx](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/components/student/StudentStudySuite.tsx)

These suggest earlier attempts at student inventory expression, but they are not yet the authoritative canvas architecture.

## 5. What is still genuinely missing

These are real product gaps rather than just surfacing gaps:

- dedicated rewards room or richer rewards display flow
- explicit student timetable surface backed by stable timetable data
- clearer room-routing model for student deep work similar to principal
- student-owned room or drill-in flow for rewards, grades, and growth visualizations

## 6. Feature flag strategy

Student should use feature flags to stage non-core surface expansion, not to hide core role truth.

Good flag uses:

- rolling out richer rewards surface
- experimenting with study suite surfaces
- testing alternate student workspace compositions

Bad flag uses:

- hiding core classroom registry
- hiding assignment queue after we know it is core
- using flags instead of deciding whether a feature belongs in workspace vs drill-in vs self

### Current student workspace flags

Defined in:

- [feature-engine.ts](C:/Users/Naween/projects/polymath-platform/packages/core/src/permissions/feature-engine.ts)

Current student-specific flags:

- `isStudentAssignmentQueueEnabled`
- `isStudentGoalsWorkspaceEnabled`
- `isStudentGradesWorkspaceEnabled`
- `isStudentProgressWorkspaceEnabled`
- `isStudentRewardsWorkspaceEnabled`

Recommended interpretation:

- assignment queue: default on
- goals workspace: default on
- rewards workspace: staged rollout

## 6.1 Student metadata model

Defined in:

- [packages/classroom/src/student/workspace.ts](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/student/workspace.ts)

This registry now gives student:

- capability ids
- semantic zones
- cadence
- scope
- status
- optional workspace views

That aligns student with the same architecture direction already used for principal.

It also makes the boundary review explicit:

- `goals` is `personal_academic`, not `Self`
- `timetable` is `academic_work`, not `Self`
- `reflection_bridge` is the right shape when student work intentionally hands off into `Self`

## 7. Recommended next implementation order

1. Keep the current student canvas as the canonical role shell.
2. Treat assignment queue, goals, and rewards as real inventory rather than demo-only extras.
3. Keep the student workspace metadata file as the source of truth for capability ownership and routing.
4. Introduce student room-launch surfaces only for deeper flows.
5. Avoid rebuilding student as a separate dashboard architecture.

## 8. The simple memory

Student is currently:

- richer in domain capability than it looks
- thinner in workspace expression than teacher and principal

So the right move is:

- audit
- surface real capability
- gate experiments with flags

Not:

- invent another one-off student dashboard shell
