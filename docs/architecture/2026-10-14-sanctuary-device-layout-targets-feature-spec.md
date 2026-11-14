---
title: "Sanctuary Device-Class Layout Targets"
status: "draft"
created: 2026-10-14
updated: 2026-10-14
author: "Codex"
tags: [gurudevi, sanctuary, canvas, layout, responsive, persistence]
---

# Sanctuary Device-Class Layout Targets

## Status and purpose

This is a proposed cross-platform persistence slice. It is not authorization to
edit the shared layout contract. The Foundation owner must acknowledge the
impact set and reconcile it with the frozen mutation-lifecycle work before
implementation.

The objective is to give handset, tablet, and desktop-web clients independent
saved arrangements while retaining responsive rendering and each domain's own
floor semantics. The accepted canvas decision remains authoritative:
`WorkspaceLayout` is the shared pure arrangement model; each domain defines
which furniture is configurable and how it is rendered. This does not create a
universal CanvasFrame or make Self, Workspace, Library, Community, and Profile
visually identical.

## Current facts

- `WorkspaceLayoutTargetSchema` and the oRPC patch contract currently allow
  only `shared`, `web`, and `mobile`.
- `resolveWorkspaceLayoutTarget` maps expanded web to `web`, compact web to
  `mobile`, and all native clients to `mobile`. Native tablet and handset
  therefore share one server row. Browser breakpoints currently switch between
  `web` and `mobile`; there is no tablet target.
- `packages/core/src/logic/workspace/renderer.ts` already has a shared renderer
  classifier: web is mobile through 767 px, tablet through 1279 px, then web;
  native is mobile through 767 px and tablet above it. The layout-target
  resolver currently does not use this existing classification.
- The Supabase target constraint in
  `apps/gurudevi-mobile/supabase/migrations/20260328114500_workspace_layout_targets.sql`
  and the workspace receipt/revision constraint in
  `apps/gurudevi-mobile/supabase/migrations/20261010190000_workspace_receipts_and_revisions.sql`
  allow the same three values.
- `WorkspaceLayout` already contains `order`, `hidden`, `pinned`,
  `zoneBySurface`, `groupOrder`, and `appearance`. Named patches carry
  `arrangement`, `appearance`, and `groups`.
- The current browser appearance adapter persists `groupOrder`, pins, and
  appearance; native's `useWorkspaceLayoutSync` owns full layout state.
- Domain authority is already recorded in
  `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`:
  Workspace may use zones; Self, Library, Community, and Profile must not be
  forced into generic zone/card semantics.
- Mobile Self pinning also writes `useActiveSubTabsStore` as a fallback. A
  target split must not accidentally migrate, clear, or reverse that fallback.
- Existing G1 pure tests cover renderer examples at 480, 1024, and 1440 px and
  target resolution for `shared`/`web`/`mobile`; they do not test exact
  breakpoints, tablet persistence, or target switching during a pending write.

## Proposed behavior

1. Add a `tablet` persistence target as an additive fourth target. Existing
   `shared`, `web`, and `mobile` rows retain their meaning and remain readable.
   Do not copy existing rows into `tablet`; an absent tablet row inherits the
   existing shared-display fallback until the user changes tablet arrangement.
2. Add a width-based layout-target resolver and reuse the existing core
   renderer classifier for target class: web clients
   use mobile through 767 CSS px, tablet from 768 through 1279 CSS px, and web
   at 1280 CSS px or wider; native clients use mobile through 767 logical px
   and tablet at 768 px or wider. Native wide windows remain tablet-class; they
   do not become browser-web clients. Keep renderer mode out of the persistence
   contract. The native sync hook is the only production caller of the
   existing class-based resolver; the browser adapter currently classifies
   width independently. Either preserve the current class-based signature as a
   compatibility overload or close the exported-caller impact set before
   replacing it. Route both adapters through the same width classifier.
3. Treat class changes as target changes, not as a mutation of the active
   layout. If a resize or rotation occurs with a dirty mutation, that operation
   remains bound to its original target and operation identity. The newly
   selected target hydrates its own layout. Never copy pending intent from one
   target key to another implicitly.
4. Continue adapting composition to current available bounds. A tablet target
   means users may keep a tablet-specific order/visibility preference; it does
   not freeze a layout that overflows a smaller window.
5. Preserve each domain's declared configurable fields. Define stable surface
   IDs and editable-field policy per domain before wiring full arrangement:
   Workspace uses operational zones; Self uses its allowed feature
   order/visibility/pins; Library uses permitted shelf order/visibility;
   Community uses its permitted mode order/visibility; Profile allows safe
   section order while keeping identity/security actions structurally fixed.
   No browser control may silently edit fields that the domain has not
   authorized.

## Explicit non-goals

- No visually identical floor or shared renderer across domains.
- No browser import of `@repo/core/native`, Expo, React Native, or native storage.
- No automatic migration or duplication of shared/web/mobile rows into tablet.
- No change to receipt lifecycle/status meanings, idempotency semantics,
  conflict algorithm, retry policy, outbox replay semantics, or storage
  durability. The receipt target allowlist/schema is widened to accept
  `tablet`, and queued tablet patches must replay unchanged.
- No claim that width alone identifies physical hardware; widths classify the
  available layout class, including resized windows and browser split view.

## Exact implementation impact set

Any implementation that adds `tablet` must review and likely update:

### Shared contracts and resolution

- `packages/core/src/logic/schemas/workspace-layout.schema.ts`
- `packages/core/src/logic/workspace/layoutSync.ts`
- `packages/core/src/logic/workspace/renderer.ts`
- `packages/core/src/logic/workspace/index.ts` (public exports)
- `packages/core/src/logic/workspace/layoutIntent.ts`
- `packages/core/src/logic/workspace/outbox.ts` target type, validation, and
  conflict-reference error payload
- `packages/core/src/logic/workspace/syncPolicy.ts` (only if target affects
  retry scope or identity)
- `packages/core/src/api/sync.orpc.contract.ts`
- `packages/core/src/api/workspaceLayout.ts`
- `packages/core/src/logic/domains/workspaceLayout/{ports,services}.ts`
- `packages/core/src/adapters/supabase/workspaceLayoutRepository.ts`

### Adapter writers/readers and replay

- `packages/core/src/native/useWorkspaceLayoutSync.ts` and its mounted tests
  (retain and test the current `platform`, `screenClass`, and
  `compactBreakpoint` override options; do not remove these extension points)
- `apps/gurudevi-web/lib/canvas/useBrowserWorkspaceAppearance.ts`,
  `apps/gurudevi-web/lib/canvas/useBrowserViewport.ts`, and browser persistence
  tests/receipt fixtures
- `packages/core/src/lib/sync/registry.ts` and outbox replay tests
- `packages/core/src/lib/storageWrapper.ts`, the storage port, and platform
  storage adapters only if target-key durability/acknowledgement changes
- `apps/gurudevi-mobile/src/hooks/useSelfCanvas.ts` and
  `packages/core/src/store/useActiveSubTabsStore.ts` only if pin precedence,
  fallback, or key migration changes

### Database, API implementation, and evidence

- A **new forward-only migration** under
  `apps/gurudevi-mobile/supabase/migrations/` that expands
  `chk_user_workspace_layout_target` and the generated
  `workspace_mutation_receipts_layout_target_check` constraint using
  `DROP CONSTRAINT IF EXISTS` before adding explicitly named replacement
  checks allowing `tablet`. Do not edit either already-applied migration:
  `20260328114500_workspace_layout_targets.sql` or
  `20261010190000_workspace_receipts_and_revisions.sql`.
- `apps/sanctuary-api/src/core/handlers/sync.ts` and workspace-layout reads
- all target schemas, storage-key tests, outbox serialization tests, API tests,
  `packages/core/src/__tests__/workspace/{layoutSync,useWorkspaceLayoutSync.logic}.test.ts`,
  `packages/core/src/logic/workspace/outbox.test.ts`,
  `packages/core/src/logic/workspace/{layoutIntent,layoutPatch}.test.ts`,
  `packages/core/src/__tests__/workspace/renderer.test.ts`,
  `apps/sanctuary-api/src/__tests__/workspace-layout-sync.orpc.test.ts`, and
  `apps/gurudevi-mobile/src/__tests__/integration/{workspace-layout-sync.native,classroom-teacher-layout-sync.native}.test.tsx`,
  `apps/gurudevi-web/tests/unit/canvas/useBrowserWorkspaceAppearance.persistence.test.tsx`,
  plus mounted browser/native target-switch tests.

Before implementation, repeat lexical search for target allow-lists,
`layoutTarget` unions, SQL checks, key builders, and persisted outbox validators;
this inventory is source-grounded but must be revalidated against the live
checkout at execution time.

## Ownership and sequencing

1. Foundation owns shared target/schema/resolver/outbox/replay/storage and
   server contract changes.
2. Web owns browser width classification, browser local intent isolation, and
   browser target-switch behavior.
3. Mobile owns native window-class classification and rotation/resize behavior.
4. Domain owners own their stable surface IDs and which layout fields users may
   change. This decision must precede domain-specific order/hide controls.
5. Start with target resolver and schema tests; then database/API compatibility;
   then browser and native mounted tests; finally web build and native bundle.

No layer may begin implementation until the other impacted owners confirm the
file and contract list. A width change during an active write must keep the
pending patch's original target and operation ID; only subsequent user changes
may bind to the newly resolved target. The schema/migration slice and the
domain surface inventory slice can be implemented separately, but full browser
arrangement parity is not achieved until both are complete.

## First client hydration and target materialization

The browser adapter currently initializes `layoutTarget` to `web` and only
resolves the actual viewport in an effect. The first render at mobile or tablet
width must not read local intent, render a stale wrong-target cache as current,
or schedule a patch against `web` before width resolution. Add mounted tests
for first hydration at widths below 768, between 768 and 1279, and at/above
1280; preserve server rendering without reading `window` during module
initialization.

When a target row is absent, both adapters may display the `shared` row as
fallback while their authoritative write baseline is a default layout. The
current first-edit path marks only the user-edited group dirty, while the
server creates a default target row and applies only the transmitted groups.
That can replace the displayed shared fallback with empty/default values for
the other groups after the new target row becomes authoritative. On the first
user edit only, materialize the currently displayed shared/default baseline in
all three named groups (`arrangement`, `appearance`, `groups`) in the durable
intent and exact prepared patch. A read-only hydration must not create a target
row. Test an appearance-only first tablet edit and prove existing shared
arrangement/groups remain visible in the resulting tablet row; cover the same
behavior for native/web/mobile targets where absent-target fallback is already
supported. If another client creates the target row first, preserve normal
group-hash conflict behavior and do not overwrite it silently.

## Mobile Self pin fallback semantics for this slice

The target-agnostic `useActiveSubTabsStore` remains a device-local fallback; it
is not copied into a new tablet row or promoted to cross-device canonical state.
Until a non-empty layout pin list exists for the displayed target (including
its current shared fallback), the existing native Self fallback may continue
to display. Once a target-specific non-empty pin list is saved, it wins over
that local fallback. Empty pin lists continue to mean “use the existing local
fallback” in this slice; this does not support a separately persisted
target-specific “pin nothing” override. Changing that semantic requires a
separate domain-state design and the complete `useActiveSubTabsStore` reader
inventory.

## Hostile review and acceptance criteria

- Existing `shared`, `web`, and `mobile` records and queued operations still
  parse and replay. No delete, rewrite, or re-key of existing records occurs.
- Width boundaries 767/768 and 1279/1280 are tested on web; native tests cover
  handset and tablet logical widths. Resizing while a mutation is in flight
  proves the original target and operation ID remain unchanged.
- A tablet row absent from the database does not erase its user-visible shared
  baseline. A target-specific row wins after hydration.
- A write failure while switching targets stays associated with its original
  intent key and surfaces an actionable error; it does not dispatch to the new
  target.
- Native restart/outbox replay and web reload/resize are exercised at the
  strongest available platform level; mocked tests alone do not prove device
  durability or browser storage guarantees.
- No domain receives generic zones by default, no unknown surface IDs are
  dropped by the wrong platform's registry, and mobile's local pin fallback is
  preserved.
- Raw unified diff is reviewed deletions-first. Changed API/migration paths are
  verified against local contracts and database constraints before reporting
  completion.

## Open decision to resolve before coding

The target should reuse the current renderer boundaries rather than add a
second breakpoint policy. Foundation, Web, and Mobile owners should confirm
that coupling or record why persisted layout class needs a distinct policy.
No fourth target is added until that acknowledgement and the impact set are
recorded. Widening the receipt target schema is a wire-contract format change
even though receipt lifecycle semantics remain unchanged.
