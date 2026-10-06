---
title: "Gurudevi Sanctuary Web Implementation Plan"
status: "active"
created: 2026-09-14
updated: 2026-10-04
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, nextjs, sanctuary, explore, migration, implementation]
supersedes: "2026-09-12-gurudevi-web-hard-cutover-plan.md"
---

# Gurudevi Sanctuary Web Implementation Plan

## Outcome

Build one browser-native Gurudevi Sanctuary at `apps/gurudevi-web` from the
real product behavior already present in `gurudevi-mobile` and the domain
packages. First build the shared browser canvas-model seam and real domain slices; then
attach public web Explore-local or authenticated account adapters to those same
canvases. Browser Guest is out of scope. Authenticated account holders also
need feature-level Safe Try, governed by the safe-exploration implementation
plan.

This plan supersedes the implementation sequence in the 2026-09-12 hard
cutover plan. That record remains useful for route inventory, browser safety,
and eventual host cutover, but its prior auth-first and Explore-first sequences
are replaced by the real-product-first model.

## Governing model

```text
functional archaeology from mobile/domain packages
                 |
shared browser canvas-model seam + Sanctuary structure/plumbing
                 |
real domain canvas and real feature command/data contract
                 |
session/persistence adapter: authenticated account | public web Explore
                 |
truthful capability differences, sync, sharing, billing, integrations
```

The shell is structure and plumbing only: session boundary, navigation,
global header/account controls, safe areas, focus behavior, route frame, and
available bounds. It is not a dashboard, a shared floor, or a source of domain
data. Self, Workspace, Community, Library, and Profile each own their canvas
and their furniture.

The source decisions are:

- [functional migration and navigation](../decisions/2026-09-14-gurudevi-web-sanctuary-functional-migration-and-navigation.md)
- [spatial language and domain transitions](../decisions/2026-09-14-gurudevi-sanctuary-spatial-language-and-domain-transitions.md)
- [canvas model and domain-floor authority](../decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md)
- [domain workbenches, active tasks, and temporal horizon](../decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md)
- [Explore access and persistence](../decisions/2026-09-14-sanctuary-explore-access-and-persistence.md)
- [guest local-first lease](../decisions/2026-09-10-guest-local-first-lease.md)

## Route and session map

| Route family | Session admitted now | Purpose |
| --- | --- | --- |
| `/welcome` | Everyone | Quiet public step-zero, with Explore and account actions. |
| `/explore/*` | Everyone | Public web Explore routes through a browser-local adapter; no Supabase identity. |
| `/sanctuary/*` | Verified durable account | Same route components through authoritative account adapters; per-feature Safe Try is available without changing account identity. |
| `/auth/*`, `/onboarding/*`, `/account-recovery` | Public/account-transition state | Identity establishment and recovery, never a substitute for Explore. |
| `/advanced/*` | Development only | Internal tooling, absent from production navigation and DOM. |

Web has no Guest mode or anonymous guest-cloud route. Mobile Guest is governed
by the mobile-only Guest lease and entry decisions; it is not part of this web
route map.

## Five functional implementation chunks

The source audit and canvas port map are complete. Build the product in these
five complete chunks, in order. Each chunk delivers a usable workbench rather
than a collection of route stubs. The
[Domain Workbenches ADR](../decisions/2026-09-15-gurudevi-domain-workbench-active-tasks-and-temporal-horizon.md)
governs every chunk.

### 1. Sanctuary workbench spine

Build the shared workbench contract for browser and mobile: task descriptors,
resource-aware task keys, focus/close/recent behavior, restoration, scoped
temporal horizon, and safe local session storage. Integrate the real Sanctuary
shell: primary navigation, account island, responsive rail/bottom tabs,
available bounds, header focus, and compact landscape rules. Mount truthful
domain Overview floors with their fixed orientation furniture and catalog
entries; do not make Overview a task.

**Done when:** a person can enter each primary domain, open and close a real
task, switch domains, return, and recover their active task working set without
restoring stale or unauthorized data.

### 2. Self: personal workbench

Build the complete Self floor: arrival and temporal horizon, pinned/organized
feature furniture, catalog, active-task strip, and the first meaningful task
set (Fire Journal, Daily Pulse, and Tomorrow Prep or another audited equivalent).
Account behavior is real first: authorization, reads/writes, loading, denial,
retry, and recovery. Then attach Explore-local to the *same* floor and task
commands with seeded baseline data, reset, and explicit local-only disclosure.

**Done when:** a person can organize and resume Self practices, work across
several tasks, use time where a task permits it, and understand whether their
work is local or durable.

### 3. Workspace: operational classroom workbench

Build role/capacity resolution, classroom/resource task instances, the
Workspace-specific zone floor, and real account-backed classroom loops. Start
with classroom selection plus the actual attendance, planner, and gradebook
task paths from the audited sources. Keep each classroom/task independently
recoverable. Explore may expose only explicitly safe seeded/local scenarios;
institutional writes never pretend to be durable.

**Done when:** a teacher, learner, or guardian can orient to the right
workspace, keep several classroom tasks in flight, complete supported work,
and receive truthful authorization/failure outcomes.

### 4. Library: discovery and reading workbench

Build the Library floor from its real browse behavior: search, filters,
shelves, continue/bookmark/collection furniture, resource detail, and focused
reader tasks. Reader/resource instances become active tasks; their local
reading position and permitted annotations recover honestly. Explore uses
read-only/public baseline resources and local permitted annotation state;
private collections and cloud-only tools remain visibly account-bound.

**Done when:** someone can discover material, open multiple resources, return
to their reading context, and distinguish private, local, and durable actions.

### 5. Community and account sanctuary

Build Community as its real mode-hub floor—Feed, Circles, Messages, and
Announcements—not as draggable cards. Complete Profile, Notifications, and
Settings as the account island, including account/session, privacy, and
preference behavior. Community Explore supports only the explicitly permitted
sample/read/local-draft state; publishing, invitations, messages, and live
presence remain account/server-governed. Finish conversion from Explore to an
account only after the supported record manifest is tested.

**Done when:** all four primary domains and the account destinations are usable
as one Sanctuary, and each action states its real persistence and participation
boundary.

## After the five chunks

Mobile Guest remains governed by its separate mobile decisions and is not a
web route/session. Browser host cutover, legacy retirement, public marketing
parity, and advanced/internal tooling occur
only after the five product chunks have browser evidence and rollback plans.

## Verification gates

Every phase must report evidence using the repository’s required level:

- G0 for pure session, route-policy, manifest, fixture, and conversion rules.
- G1/G2 for adapter and server-boundary behavior, including explicit anonymous
  cloud-write denial.
- G4 for browser routes at compact portrait, compact landscape, tablet, desktop,
  keyboard, reduced-motion, storage failure, offline, reset, and conversion
  scenarios appropriate to the slice.

No mock-only result is parity evidence. No browser route imports native/mobile
runtime modules. No legacy browser route is removed until its replacement has
the required evidence and redirect policy.

## Immediate next implementation milestone

Start **Chunk 1: Sanctuary workbench spine**, then move directly into **Chunk
2: Self**. The existing Fire Journal account slice is evidence for one task
command, not a completed Self workbench. It must be integrated under the shared
task/restoration/temporal contract rather than extended as a parallel route.

## Delegation policy

- Use Luna for documentation review, source archaeology, focused audits, and
  isolated low-risk file tasks.
- Use Terra only for a real implementation workstream, recurring execution, or
  cross-cutting integration that needs an owner to hold the product contract.
- Root retains shared-route, persistence-boundary, shell, and final-integration
  ownership unless it explicitly delegates that workstream to a Terra.

## Continuation checkpoint: parallel work and integration order

This section is the restart point after context compaction.

### Parallel Luna audits — read-only, no implementation ownership

| Luna workstream | Required artifact |
| --- | --- |
| Self | Legacy route → `SelfCanvas`/navigator → feature registry → data/state/persistence map; fixed versus configurable furniture. |
| Workspace/Classroom | Role dispatch → surface registry → real task loops → layout/persistence/authorization map. |
| Library | Existing browser/mobile shelf, search, resource, collection, and reader behavior versus partial surface registry. |
| Community and Profile | Actual mode hub and settings/identity compositions; fixed versus configurable boundary. |
| Core canvas | Exact reusable core contracts/functions and every type/rendering/persistence leak in the current renderer. |

Each audit must name source files, user-visible states, data authority, and
browser gap. It must not propose a new architecture or modify implementation.

### Terra implementation workstreams — only after the relevant Luna evidence

| Terra workstream | Ownership | Depends on |
| --- | --- | --- |
| Browser canvas/domain contract | Browser-only shared model adapter and domain-renderer seam; no generic universal visual floor | Core + Self audits |
| Sanctuary shell integration | Navigation, account island, focus/safe-area/available-bounds plumbing; no domain furniture | Shell decision + route map |
| First real Self slice | Real account-backed Self floor, actual task states, then the same command/component through Explore adapter | Self audit + browser domain contract |

### Integration gates

1. Root reviews the five audit maps and selects the first accepted Self task.
2. Terra builds the browser domain seam and Self floor in a controlled shared
   file-ownership plan.
3. Root verifies that the account path is real before allowing an Explore
   adapter to render the same task.
4. No Library, Community, Profile, or Workspace feature work begins from a
   registry alone; its actual route behavior must be mapped first.


## Safe practice plan alignment (updated 2026-10-04)

The canonical product/platform contract and ordered Safe Try implementation
plan is [Safe Exploration and Reversible Work Model](../architecture/safe-exploration-and-reversible-work-model.md). This web plan continues to own the domain-canvas and route work. It does not introduce web Guest continuity. For each real canvas, account-holder Safe Try is a feature-level local practice adapter with an isolated namespace; it must not mutate the account adapter or use the app-wide `ExperienceMode` as a global switch. Public `/explore/*` stays identity-free and browser-local.

## Cross-platform personalizable floors — reconciliation plan (2026-10-04)

This section records the product clarification that floor appearance and
furniture arrangement are one user-facing personalization capability. It
clarifies delivery order within this active plan; it does not create a second
canvas model, a universal visual renderer, or a new migration authority.

### Product contract

- A primary tab opens its own floor. The floor's Overview/Catalog is its
  default arrangement, not a separate home route or an active task.
- Furniture is organized into meaningful domain-owned groups. Group order is
  the default customization unit. A domain may additionally allow ordering
  individual features within a group when that improves the user's task; it
  does not imply freeform absolute-position dragging.
- Pin, hide, restore, and move actions are exposed only where that domain's
  semantics make sense. Workspace keeps operational zones; Self keeps its
  navigator/group model; Library keeps reading and discovery shelves;
  Community keeps mutually exclusive modes; Profile keeps identity/settings
  groups. These are distinct floor dialects over reusable arrangement
  semantics, not five copies of a Workspace dashboard.
- A floor's appearance belongs to the same user-facing personalization
  experience as its furniture. Background/wallpaper choice is floor-scoped,
  independently resettable, and rendered with a readable content treatment.
Appearance must not change feature access, data authority, or task state.
- Native mobile and primary Next.js web share floor/surface identity,
  arrangement meaning, defaults, and persistence semantics. They own separate
  renderers and interaction adapters that respond to available space and input
  capabilities. Expo/RN web remains migration evidence, not the target web
  renderer.
- A preference is described as saved only after its selected adapter confirms
  the save or truthfully reports local/queued/error state. Existing behavior
  and stored layouts must be migrated or adapted explicitly; do not silently
  reset them during convergence.

### Current route reconciliation before implementation

Publish one route-to-floor inventory covering the live route, default floor,
feature/task entry, arrangement controls, appearance controls, persistence
adapter, and unported behavior for each tab on both targets. At minimum, it
must resolve these known seams:

| Area | Current source evidence | Required reconciliation |
| --- | --- | --- |
| Mobile Self | Live `/self` renders `SanctuaryOverviewHub` with catalog and pins; `SelfScreen.unified` has a richer layout store/renderer but no live route caller was found in the audit. | Establish the canonical live Self floor and account for callers, feature IDs, stored preferences, and task-strip behavior before retiring or adapting either path. |
| Mobile Workspace | Classroom route uses `ClassroomWorkspaceCanvas` and `useWorkspaceLayoutSync`; layout order, hidden, pinned, zone, local storage, and remote sync are wired. | Preserve this as Workspace's behavioral baseline; document its renderer-specific interactions and stored layout compatibility. |
| Next.js Self and Workspace | `SelfFloor` and `WorkspaceFloor` are fixed browser implementations. `lib/canvas/domainCanvas.ts` currently has no app call sites. | Keep the real feature/task flows; connect browser-native domain arrangements and persistence to the canonical model without importing RN UI or replacing data/auth boundaries. |
| Library, Community, Profile | Their current floors/screens use domain-specific compositions; no general floor-personalization controls were found on the Next routes. | Inventory actual mobile behavior and preserve domain semantics. Do not infer that a registry or a shared resolver means the floor is delivered. |
| Appearance | Native shell and web CSS provide static theme/domain atmosphere. No user-selected floor background persistence/control was found on either target. | Add appearance to the same personalization capability only after the cross-platform preference contract and saved-state feedback are defined. |

The inventory must distinguish the native app at `apps/gurudevi-mobile`, the
primary browser app at `apps/gurudevi-web`, and the retiring Expo web route.
Do not count the Expo `.web.tsx` renderer as Next.js delivery evidence.

### Implementation checkpoint — appearance foundation and live route wiring

The first delivery gate is now implemented additively:

- `WorkspaceLayout` carries a version-compatible `WorkspaceAppearance` value
  with curated presets (`default`, `dawn`, `garden`, `night`) and motion
  (`off` or `subtle`). Existing rows without the value resolve to the default.
- The existing mobile layout sync exposes appearance set/reset operations. Its
  empty-registry path preserves stored furniture until a domain registry is
  hydrated, so Self appearance cannot erase an existing arrangement.
- The Supabase adapter preserves `is_default` and `surface_metadata_jsonb` and
  stores the appearance through the existing metadata bridge; no new table or
  RN WebGPU dependency was introduced.
- The layout metadata bridge validates stored appearance presets and group IDs
  before exposing them to renderers, and writes the default appearance when a
  malformed value reaches the upsert boundary.
- The browser adapter now exposes the same independent appearance reset
  operation as the native sync hook; controls can call it later without
  reaching into storage or Supabase details.
- Primary Next floors now apply account-backed appearance and group-order state
  through a browser-native adapter with local-storage fallback. User-facing
  controls are intentionally deferred until the live domain registries and
  renderer paths are fully reconciled.
- Group order is now a first-class optional field on the shared layout. It is
  persisted through the same metadata bridge, normalized against each domain's
  declared group defaults, and exposed through the existing native sync hook.
  Feature order remains domain-specific and is not forced into arbitrary
  freeform dragging. User controls are a later integration step.
- The live mobile Self Overview floor exposes the same curated floor-tone
  choice through the native layout sync. Native rendering remains platform
  native; existing Skia v3 components remain the appropriate path for richer
  procedural surfaces.
- Primary Next Community, Library, and Profile floors now use the same
  browser-native appearance adapter and account-scoped layout metadata.
  Their declared group sets are wired into the persistence contract; Explore
  remains local-only by design.
- The browser adapter now resolves its persistence target from the live
  viewport: phone-width web uses the `mobile` target, while tablet and desktop
  use `web`. Native currently keeps the existing `mobile` target for both
  phone and tablet and changes the renderer density instead; a separately
  persisted native tablet target would require a database target migration.
- Next Self now uses the same canonical feature categories as the live mobile
  Self Overview (`identity`, `wellbeing`, `growth`, `practice`, and
  `professional`) for its group order. The existing `today`/`private`/`shared`
  values remain feature placement zones rather than cross-platform group IDs.

This checkpoint does not claim that every domain has finished its own group
ordering controls. The next gate is to reconcile each domain registry and its
live renderer against the route inventory before adding more furniture
controls.

### Ordered repair and delivery gates

1. **Lock source authority and compatibility.** Use
   `docs/decisions/2026-09-14-gurudevi-canvas-model-and-domain-floor-authority.md`
   as the canvas/floor boundary and this plan as delivery order. Inspect current
   route callers, registries, persisted state and existing characterization
   evidence. Record behavior to preserve and any data migration before edits.
2. **Close the model gap once.** Extend the existing platform-neutral core
   arrangement contract only where group ordering, optional within-group
   feature ordering, and floor-scoped appearance are not expressible. Keep
   Workspace zones and domain-specific configuration policy. Define versioning,
   defaults, reset, capability filtering, per-platform target behavior, and
   local/remote save/error reporting. Do not add a parallel Self-only or
   browser-only canonical preference schema.
3. **Reconcile native Mobile Self and Workspace.** Characterize the currently
   live routes first. Make the Self Overview/Catalog the default floor
   arrangement, converge it with the existing Self layout/store where
   compatible, and retain feature identity, existing pins/orders, active tasks,
   role filtering, and recovery behavior. Keep Workspace's working surface
   model, but align its groups/defaults and preference semantics with the
   canonical contract. Do not alter native build configuration for this work.
4. **Deliver matching Next.js floor adapters.** Build semantic browser-native
   renderers and controls in `apps/gurudevi-web`. Integrate the real account
   floor routes with the canonical layout adapter and truthful browser
   persistence. Follow the existing Self-first, then Workspace slice order;
   each slice preserves its real loading, denied, empty, error, retry, and task
   behavior. No RN/Expo renderer, hook, gesture, or sync lifecycle is imported
   into Next.js.
5. **Extend domain by domain.** Apply group/order and visibility only to the
   furniture each floor identifies as configurable. Library exposes stable
   reading/discovery sections; Community organizes its mode hub, not draggable
   feed cards; Profile organizes settings groups. Keep fixed orientation
   furniture and active-task workbench state distinct from customizable
   overview furniture.
6. **Add floor appearance in both targets.** Provide the same floor-scoped
   preference choices and reset behavior in mobile and Next.js, using native
   and browser renderers respectively. Start with curated backgrounds/treatments
   and a plain fallback. Do not introduce user uploads until asset storage,
   cross-device behavior, and failure handling have their own accepted contract.
7. **Retire duplicates only after convergence.** For each route/path, identify
   remaining callers and data keys, migrate or retain compatibility adapters,
   then remove superseded UI/store paths. Never delete the alternate Self path
   or legacy behavior based only on its name or apparent duplication.

### Acceptance and evidence

- A person's floor identity, furniture rules, group ordering, and appearance
  preference resolve consistently from the same account on mobile and web;
  each platform may present them differently for its available space and input.
- First-run defaults make domain purpose and feature groups understandable;
  customization can be undone and hidden supported features can be recovered.
- Account, local Explore, offline/queued, and failed-save states remain distinct
  and accurately described. Layout or appearance preferences never bypass
  feature authorization or change feature data.
- Self and Workspace complete the existing account-backed task journey on both
  targets before the migration claims their floor personalization is live.
  Library, Community, and Profile each require their own domain-specific
  behavior inventory and accepted controls.
- Structural route/store changes require characterization before replacement;
  preference migration requires data/idempotency evidence; browser interactions
  require actual browser evidence and native interaction changes require the
  relevant Metro/device evidence. Report each level using the repository's
  evidence protocol; mocks do not establish cross-platform parity.

The user has selected meaningful groups and order as the default furniture
model, with individual feature reordering available where useful. This is the
approved product direction for the plan; freeform arbitrary card placement is
not the default interaction.
