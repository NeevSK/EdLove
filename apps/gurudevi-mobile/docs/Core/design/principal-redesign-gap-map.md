# Principal Redesign Gap Map

## Why this exists

Principal is no longer a simple "old dashboard to restore."

The target is:

- recover the stronger classroom and leadership UX that existed around mid-to-late February
- keep the newer architectural contracts introduced after that
- redesign the principal experience so it fits the current Gurudevi workspace and canvas direction
- align the UI with the ongoing Gluestack v3 transition

This note defines what is fixed, what is flexible, and what to build next.

## Non-negotiable architecture

These should remain stable while redesigning principal:

- POA and capability-based access
- temporal and phase-aware feature behavior
- citizen-state and onboarding gates
- positive invitation flows
- package boundaries where app-level screens remain thin adapters
- workspace and canvas framing instead of ad-hoc per-screen logic

Relevant implementation anchors:

- `packages/admin/src/principal/workspace.ts`
- `packages/admin/src/principal/usePrincipalWorkspaceSurfaces.tsx`
- `packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx`
- `packages/admin/src/screens/PrincipalDashboard.tsx`
- `packages/admin/src/screens/principal/PrincipalFeatureRegistry.ts`

Relevant guardrail tests:

- `apps/gurudevi-mobile/src/__tests__/architecture/principal-ia-coherence.test.ts`
- `apps/gurudevi-mobile/src/__tests__/architecture/principal-governance-guardrails.test.ts`

## What is flexible

These areas can be redesigned quite freely:

- top-level principal information architecture
- shell composition and visual hierarchy
- zone framing and naming if the underlying capability map still holds
- card/group/list balance
- the relationship between overview canvas and deeper workspace views
- scenic material treatment and atmosphere
- how institutional, classroom, and ecology signals are staged

In short: the underlying capability ecology should stay coherent, but the actual experience can evolve substantially.

## Current principal foundation

Principal already has a meaningful base:

- capability registry with scope and zone metadata
- explicit split between institutional, classroom, and ecology-crosscutting features
- workspace views for hierarchy, invites, notes, cycles, and log-like work
- principal shell and zone surfaces on native
- principal-specific feature registry and IA tests

This means redesign should extend the current system, not replace it.

## Key gap

The current principal foundation is valid, but the most important remaining gap is not only visual.

Principal must be adapted onto the shared workspace canvas model itself so the principal can reorganize the workspace around actual practice.

Main issues:

- the principal surface registry was weaker than the teacher/classroom surface registry
- principal was not fully routed through shared layout persistence with `order`, `hidden`, `pinned`, and `zoneBySurface`
- the dashboard shell was carrying too much composition responsibility that belongs to canvas arrangement
- room screens existed, but the main workspace was still closer to a grouped dashboard than to a user-configurable capability canvas
- the experience did not yet fully reflect the design freedom suggested by Figma while preserving the newer architecture

## Figma translation

The Figma direction suggests these principles:

- workspace-first composition
- clearer section rhythm and breathing room
- a calm, leadership-oriented canvas rather than dashboard-card clutter
- modular capability lanes that can expand without collapsing the home surface
- stronger relationship between overview, operating rooms, and future modules

That maps well to the current principal capability model.

## Design direction

Shared doctrine:

- calm, legible, touch-friendly, emotionally steady
- atmospheric but not decorative
- workspace-oriented, not marketing-oriented

Principal dialect:

- institutional clarity
- warm authority without harshness
- overview first, then operational rooms, then longer-horizon pattern reading

This surface should feel:

- grounded
- luminous
- structured
- trustworthy
- alive without being noisy

This surface should not feel:

- like a generic admin dashboard
- like three tabs sitting above stacked cards
- like a hard ERP shell disconnected from Gurudevi's sanctuary language

## Default plus freedom

The principal redesign should use Figma as the default composition, not as a prison.

That means:

- Figma defines the default rhythm, hierarchy, and tone for principal on web and mobile
- the workspace keeps enough structural flexibility for the principal to emphasize what matters most
- setup-heavy rooms like hierarchy and cycles should remain available, but should not dominate the daily canvas
- recurring work, periodic governance, and long-horizon institutional work should be staged differently

The system therefore needs both:

- a strong default workspace composition
- a capability-aware model that understands feature cadence

## Implementation slices

### Slice 1

- create stable principal workspace surfaces
- adapt principal onto shared workspace layout sync and shared canvas rendering
- preserve capability semantics while allowing principals to reorder, pin, hide, and move surfaces across zones

### Slice 2

- redesign the principal shell and make the default arrangement feel like a true leadership canvas
- make the workspace lanes clearer
- strengthen the institutional workbench framing

### Slice 3

- refine hierarchy, invites, notes, and cycles entry views
- ensure they feel like rooms of the same workspace, not isolated screens
- align interactions and spacing with Gluestack v3 patterns

### Slice 4

- deepen classroom-connected principal features
- connect student pulse, curriculum pulse, and resource needs more coherently to the principal outlook model
- preserve capability and scope boundaries

### Slice 5

- unify positive invitation and citizen-state flows for principal-led establishment work
- ensure onboarding and governance actions feel institution-building, not merely administrative

## Immediate rule for future work

When redesigning principal:

- do not create a second principal architecture
- do not bypass `workspace.ts` capability semantics
- do not treat Figma as a literal pixel-copy if it conflicts with POA, capability scope, or workspace contracts
- do use Figma as the visual and compositional north star
- do keep the UI modular enough for future ERP families to slot in cleanly
