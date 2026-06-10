---
title: "Role Workspace Implementation Guide"
status: "active"
created: 2026-04-18
updated: 2026-04-18
author: "Naween"
tags: [reorganized]
---

# Role Workspace Implementation Guide

Status: active implementation guide

This guide exists so we do not rediscover the same architecture for every role.

Use it when building or refactoring any role workspace:

- principal
- founder
- student
- guardian
- teacher
- mixed roles such as principal plus teacher or grade head plus teacher

Read this with:

- [ROLE_WORKSPACE_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/ROLE_WORKSPACE_STRATEGY.md)
- [CAPABILITY_CANVAS_STRATEGY.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CAPABILITY_CANVAS_STRATEGY.md)
- [CANVAS_SHARED_SURFACE_MODEL.md](C:/Users/Naween/projects/polymath-platform/docs/architecture/CANVAS_SHARED_SURFACE_MODEL.md)

## 1. Core verdict

The correct pattern is:

- domain package owns workflow
- POA composes capability access
- role workspace registry defines eligible surfaces
- shared layout sync stores user arrangement
- shared canvas renderer presents the workspace
- drill-in rooms exist only for deeper work, not as the primary workspace architecture
- demo is a parallel preview layer, not a placeholder name for real capability

The incorrect pattern is:

- invent a role-specific dashboard shell first
- hard-code tabs or grouped sections as the final arrangement model
- treat screen composition as the workspace preference system
- rename real capability as `demo-*` and let that naming leak into the long-term model
- let demo data become tangled with the actors real workspace state

That mistake is easy to make because a nicer dashboard can look like progress.

But the durable architecture is the shared canvas path.

## 2. What "done" means for a role workspace

A role workspace is only truly done when all of these are true:

1. The role has a stable surface registry with fixed `surfaceId`s.
2. The role uses shared layout persistence with:
   - `order`
   - `hidden`
   - `pinned`
   - `zoneBySurface`
3. The role renders through shared `WorkspaceCanvas`.
4. The role can open deeper rooms from surfaces when needed.
5. The role still respects POA, temporal behavior, citizen gates, and package ownership.

If a role has attractive screens but not these properties, it is not finished.

## 2.1 Surface vs drill-in room

This distinction matters because both are valid, but they solve different problems.

### A surface is:

- a persistent tile in the role workspace
- part of the actors regular orientation rhythm
- something the actor may pin, hide, or move between zones
- a summary, launcher, or compact working slice of a capability

Examples:

- student assignment queue
- student grades overview
- student growth goals
- principal morning brief
- principal pending approvals

### A drill-in room is:

- a deeper focused environment entered from a surface
- used when the actor needs more space, more detail, or heavier workflow
- not part of the default arrangement model itself

Examples:

- hierarchy management
- invite management
- cycle manager
- full timetable editor
- full rewards room
- full grade history or analytics room

### Why it matters

If we confuse these:

- we either overload the canvas with giant workflow screens
- or we hide core role rhythm by putting everything behind room navigation

The right question is not:

- "is grades a room or a surface?"

The right questions are:

- "does the actor need this visible in their ongoing rhythm?"
- "does the actor also need a deeper focused room for this capability?"

Both can be true.

For example:

- student grades overview should be a surface
- a deeper grade details room may also exist later

Likewise:

- student progress can be a surface
- a richer progress analytics room may come later

## 2.2 Capability-first boundary

Workspace and `Self` must be separated by capability, not by file name, privacy level, or convenience.

`Self` is for:

- wellbeing
- reflection
- self-regulation
- personal rhythm
- inner history

Role workspace is for:

- the actors role-specific work
- role navigation
- role progress
- role commitments
- role-specific private work that is still part of the job or study practice

Important rule:

- private does not automatically mean `Self`

Examples:

- student goals are private academic work and belong to student workspace
- student grades are academic mirrors and belong to student workspace
- student progress is academic momentum and belongs to student workspace
- breathing, fire journal, sleep, reminders, and reflection belong to `Self`

## 3. Canonical implementation path

### Step 1: Decide package ownership

Answer first:

- which package owns the workflow family
- what the role consumes from other packages as a bridge
- what must never be moved into the role shell

Examples:

- principal belongs primarily to `admin`
- teacher and student belong primarily to `classroom`
- guardian is currently `admin`
- founder is primarily `admin`, even when consuming institution signals

### Step 2: Define capability-backed surface inventory

Create a role workspace registry hook or module.

Each surface should define:

- `surfaceId`
- `workspaceId`
- `capabilityKey`
- `ownerPackage`
- `defaultZone`
- `defaultOrder`
- `hiddenByDefault`
- `mobileSupport`
- `webSupport`
- user-facing fields such as `title`, `subtitle`, `summary`, `temporalLabel`, `metadata`
- `content`

Important rules:

- `surfaceId` must be stable
- `surfaceId` is not just a component name
- `capabilityKey` should map to actual role capability semantics
- room-launch surfaces are valid, but should still be modeled as surfaces
- do not encode demo status in `surfaceId`
- a real capability should not be named `demo-*`

### Step 3: Model real user rhythms

Before writing UI, map the role across actual practice.

For each role, identify:

- initial setup
- daily work
- weekly review
- monthly governance
- yearly or horizon work

Then decide:

- which surfaces are default-visible
- which are hidden-by-default
- which belong in `today`
- which belong in `work`
- which belong in `institution`
- which belong in `outlook`
- which belong in `private`

Do not guess from UI preference alone.

Think from the actor’s real operating life.

### Step 4: Use shared layout sync

Do not invent role-local persistence.

Use:

- [useWorkspaceLayoutSync.ts](C:/Users/Naween/projects/polymath-platform/packages/core/src/lib/workspace/useWorkspaceLayoutSync.ts)

Create a role wrapper hook similar to:

- [useClassroomWorkspaceLayout.ts](C:/Users/Naween/projects/polymath-platform/packages/classroom/src/workspace/useClassroomWorkspaceLayout.ts)

That wrapper should:

- pass `workspaceId`
- pass the role’s surface registry
- return enriched resolved surfaces
- expose:
  - `layout`
  - `surfaces`
  - `setSurfaceOrder`
  - `setSurfaceHidden`
  - `setSurfacePinned`
  - `setSurfaceZone`

### Step 5: Render through shared canvas

Use:

- [ResponsiveWorkspaceCanvas.tsx](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/workspace/ResponsiveWorkspaceCanvas.tsx)

Or the alias:

- [WorkspaceCanvas.tsx](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/workspace/WorkspaceCanvas.tsx)

Provide role-specific adapters for:

- title
- subtitle
- summary
- snapshot
- temporal label
- metadata
- surface actions
- drill-in navigation

Do not re-implement the renderer per role unless a real shared-canvas gap exists.

### Step 6: Keep drill-in rooms secondary

Some work needs deeper room screens:

- hierarchy
- cycles
- invites
- logbook
- profile
- attendance reports
- specialized planning tools

That is good.

But those rooms should be entered from the canvas.

They should not become the architecture of the workspace itself.

When deciding whether something should stay a surface or become a room, use this test:

- if it helps the actor orient, track, or lightly act during normal rhythm, keep it as a surface
- if it needs fuller workflow depth, add a drill-in room behind the surface
- do not remove a surface just because a room exists
- do not create a room just because a surface exists

### Step 7: Make app screens thin

Role screens should mainly do:

- fetch top-level actor and context ids
- initialize the role surface registry
- initialize layout sync
- render the shared canvas
- route to drill-in rooms
- host truly local modals

They should not do:

- direct DB logic
- domain orchestration
- mixed-package workflow logic
- duplicate layout preference logic

### Step 8: Verify architecture, not just visuals

A workspace implementation should be checked across:

- POA boundaries
- package boundaries
- temporal behavior
- layout persistence
- mobile and web renderer behavior

At minimum, verify:

- stable surface ids
- canvas renders with the role surface inventory
- layout persistence updates `order`, `hidden`, `pinned`, and `zoneBySurface`
- drill-in navigation still works

## 4. Concrete file pattern

This is the recommended file structure for a role workspace.

### Shared role model

- `packages/<owner>/src/<role>/workspace.ts`

Use this for:

- capability ids
- role view ids
- scope metadata
- cadence metadata
- mapping helpers such as `resolveRoleWorkspaceView`

### Surface registry

- `packages/<owner>/src/<role>/use<Role>WorkspaceCanvas.tsx`

Use this for:

- role surface definitions
- role content composition
- role layout hook wrapping `useWorkspaceLayoutSync`
- role `WorkspaceCanvas` adapter

### Thin app entry

- `packages/<owner>/src/screens/<Role>Dashboard.tsx`
- `packages/<owner>/src/screens/<Role>Dashboard.web.tsx`

Use these for:

- identity and top-level context
- modal ownership
- workspace canvas render
- drill-in view switching

### Drill-in rooms

- `packages/<owner>/src/screens/<role>/*Dashboard.tsx`

Use these only for:

- deeper focused work
- richer workflow screens
- setup rooms
- report views

## 5. How to think about zones

Current supported zones:

- `today`
- `work`
- `institution`
- `outlook`
- `private`

Recommended meaning:

- `today`: immediate signals, approvals, and time-sensitive awareness
- `work`: active doing surfaces for the role’s main daily operations
- `institution`: school-wide or organization-wide stewardship
- `outlook`: trends, forecasts, pattern reading, future modules
- `private`: quiet personal tools or notes that should not dominate the default canvas

Clarification:

- `private` means personally held within the role workspace
- `private` does not mean `Self`

Rules:

- prefer zones over freeform placement for now
- use `hiddenByDefault` for quiet or secondary surfaces
- use pinning for “I want this closer”
- use moving between zones for “this is how this actor prefers to work”

## 6. How to think about role defaults

The system should provide a strong default.

But the actor should be able to reorganize around reality.

That means:

- Figma or product design gives default rhythm
- capability metadata gives semantic truth
- canvas gives arrangement freedom

This is not “anything anywhere.”

It is:

- intentional defaults
- safe customization
- stable domain ownership underneath

## 7. Recommended migration order for any new role

When implementing a new role, follow this order:

1. Confirm package ownership and role boundaries.
2. Write or clean up the role capability model.
3. Define the role surface inventory.
4. Map surfaces to real user rhythms and default zones.
5. Wrap the surface inventory with `useWorkspaceLayoutSync`.
6. Render through shared `WorkspaceCanvas`.
7. Route drill-in rooms from surfaces.
8. Refine room screens.
9. Add or update architectural tests.
10. Only then polish visuals and animation.

If you skip to step 8 first, you are likely to repeat the earlier mistake.

## 7.1 Demo mode and preview architecture

Demo is not the same thing as fake capability.

Current product phase:

- use `demo experience` as the primary experiential mode
- reserve `sandbox` for a future mode only if it introduces meaningfully different rules from demo
- do not blur those two names until the behavioral distinction is real

The intended purpose of demo is:

- give a first-time actor an immediate felt sense of how the product works
- show the actor what their role workspace looks like after meaningful use
- let them explore capabilities before real data exists
- let guests or wanderers experience the product without setup friction
- let teams intentionally show the product to others through a faithful role experience
- let the actor revisit that experience later
- keep preview data and real data clearly separated
- avoid contaminating real workspace state with temporary placeholder logic

In practice, demo should feel like:

- "show me the app as if I had already been using it for some time"
- "let me understand what this role can actually do here"
- "help me see whether this workspace is worth investing in"

### Demo should be treated as:

- a parallel preview mode
- backed by a clear demo provider or preview data source
- accessible intentionally, including after onboarding
- available from first-run entry points, including guest or wanderer flows
- visually marked as preview
- specific to the actor's real future capability, not generic filler
- populated enough to teach the real workflow, dashboard shape, and capability set

### Demo should not be treated as:

- a fallback name for real surfaces
- a temporary branch inside real capability ids
- a reason to rename real student capability as `demo-assignments` or `demo-goals`
- a silent replacement for real data without clear mode boundaries

### Implementation rule

Keep demo orthogonal to capability:

- capability ids stay real
- surface ids stay real
- demo changes the data source, copy, and visual framing
- demo does not redefine the semantic identity of the workspace

### Role-specific preview rule

Preview is not allowed to become shallow, common, or role-neutral.

For each role, preview must show the best believable future version of that role's workspace:

- student preview should feel like a fuller study life, academic momentum, visible progress, and meaningful support
- teacher preview should feel like stronger classroom stewardship, planning, assessment flow, and student care
- principal preview should feel like clearer institution stewardship, leadership visibility, and coordinated follow-through

This means:

- do not reuse one generic preview inventory across roles
- do not show placeholder cards that are unrelated to the role's actual future capability
- do not reduce preview to marketing language without usable role shape
- do not use one shallow generic sample dataset and merely rename labels per role
- do show a coherent dream state that still matches the role capability model
- do make the actor feel like they are stepping into a mature version of their real role workspace

The test is simple:

- if the actor revisits preview later, they should recognize it as a truthful picture of where their own workspace can grow
- if the same preview could be shown to every role with only labels changed, it is too shallow

Preferred shape:

- `assignment_queue` remains `assignment_queue`
- demo mode may feed it preview data
- the UI may label that state as preview or dream mode
- the actor can enter or revisit that preview intentionally
- a guest or wanderer can use that same path to understand the product before committing

### Role-faithful demo dataset rule

Every role demo must be backed by a dataset that is faithful to:

- that role's actual capability model
- the institution and geography the product is serving
- the rhythms, pressures, and language of the real operating context

For Gurudevi's current product direction, this means demo datasets should reflect Sri Lankan school reality rather than a generic global school abstraction.

Examples:

- student demo should show assignment load, grades, goals, timetable pressure, encouragement, and study cadence that feel believable inside a Sri Lankan school week
- teacher demo should show real classroom stewardship with section-based teaching, exam preparation rhythm, practical work, parent communication pressure, and student support patterns that match Sri Lankan schooling
- principal demo should show school-level attendance, staff leave, term rhythm, exam preparation, facilities pressure, institutional events, and community feedback that feel like a real Sri Lankan school rather than a generic admin dashboard

Implementation rule:

- keep one canonical demo dataset source per role or per institutional layer
- reuse that source across surfaces so the same school world is visible everywhere
- route demo reads through explicit providers or shared API fallbacks
- avoid per-widget local mock worlds that contradict each other

### Carry-forward rule from student and principal

What we have today shows two recurring problems:

1. Student previously had real surfaces whose ids carried `demo-*` naming, which forced a layout migration later.
2. Principal demo handling is not fully unified across native and web.

Going forward:

- unify demo state semantics across platforms
- route demo through a provider or clear preview orchestration
- keep demo revisitable
- treat demo as an experiential first-run and showcase layer, not just a fallback state
- do not entangle demo naming with real capability naming

## 8. Principal as the reference example

Principal is the clearest current example of this migration.

The correct target is:

- principal surfaces define the default leadership workspace
- principal can pin, hide, and move those surfaces
- hierarchy, cycles, invites, and notes remain available as drill-in rooms
- the role works across setup, daily, periodic, and horizon rhythms

That is a stronger foundation than a nicer grouped dashboard.

## 9. Founder, student, guardian, and admin guidance

### Founder

Founder should likely combine:

- institution stewardship
- ecosystem visibility
- horizon and ERP-family planning

But still follow the same surface-registry plus canvas path.

### Student

Student should emphasize:

- daily learning flow
- assignment and attendance surfaces
- progress and motivation
- quieter private or reflective surfaces where relevant

Student should not become a one-off learning dashboard architecture.

Student preview should specifically show:

- a believable future study rhythm
- visible assignment load and submission cadence
- goals that stay close to the learning workspace
- grades, progress, and encouragement as part of the same academic journey
- sanctuary and timetable visibility that helps the student imagine a steady school life

Teacher preview should specifically show:

- a believable teaching rhythm with active classrooms and lesson flow
- assignments, observation, and planning surfaces that feel genuinely in use
- school linkage and classroom stewardship, not only isolated content tools
- enough student signal to show what guided teaching with the platform looks like

Principal preview should specifically show:

- a believable school leadership rhythm with real institutional signal
- people, hierarchy, cycles, invites, and notes working together
- the feeling of a principal returning to a living operational workspace, not a hollow dashboard

### Guardian

Guardian should emphasize:

- child overview
- announcements
- events
- school communication
- safe visibility boundaries

The same shared canvas can still work, even if the default arrangement is simpler.

### Admin or institutional operator variants

These should be modeled as capability bundles and surface inventories, not separate dashboard architectures.

## 10. Verification guide

### Typecheck

Prefer filtered checks when the repo has a broad existing error backlog.

Use the app tsconfig and inspect whether newly touched files appear in the error stream.

### Jest

For `apps/gurudevi-mobile`, prefer the app-local package script:

- `pnpm --dir apps/gurudevi-mobile test -- --runInBand`

Avoid relying on `pnpm exec jest` from arbitrary working directories when it behaves inconsistently in this repo.

### Architecture tests

Prefer targeted role guardrails such as:

- workspace boundary tests
- POA tests
- thin adapter tests
- role IA coherence tests

## 11. Common mistakes

Do not:

- build a role-specific dashboard before defining stable surfaces
- couple role layout to one platform shell
- hide workflow ownership inside the workspace layer
- bypass shared layout sync
- treat drill-in rooms as the workspace architecture
- copy Figma literally without capability and POA alignment
- confuse `private` with `Self`
- encode preview state into real surface ids
- let demo data become the long-term semantic identity of a capability

Do:

- define stable surfaces first
- keep canvas responsible for arrangement
- let package-owned content live inside those surfaces
- preserve domain and authority seams
- keep role screens thin
- use Figma as default composition, not as the entire architecture
- keep demo orthogonal to real capability identity
- let surfaces and rooms coexist when both are needed

## 12. The simple memory

If a future agent needs one short rule, it is this:

Build the role as:

- capability model
- surface registry
- shared layout sync
- shared canvas
- drill-in rooms

Not as:

- a nicer dashboard
