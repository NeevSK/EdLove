---
title: "Gurudevi Sanctuary Web Implementation Plan"
status: "active"
created: 2026-09-14
owners: [Naveen, Gurudevi platform]
tags: [gurudevi, nextjs, sanctuary, explore, migration, implementation]
supersedes: "2026-09-12-gurudevi-web-hard-cutover-plan.md"
---

# Gurudevi Sanctuary Web Implementation Plan

## Outcome

Build one browser-native Gurudevi Sanctuary at `apps/gurudevi-web` from the
real product behavior already present in `gurudevi-mobile` and the domain
packages. First build the shared browser canvas-model seam and real domain slices; only
then attach Explore, guest-cloud, or account persistence/session adapters to
those same canvases.

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
session/persistence adapter: account | explore | guest-cloud
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
| `/explore/*` | Everyone | Real shell/domain routes through the local Explore adapter. |
| `/sanctuary/*` | Verified durable account | Same route components through authoritative account adapters. |
| `/auth/*`, `/onboarding/*`, `/account-recovery` | Public/account-transition state | Identity establishment and recovery, never a substitute for Explore. |
| `/advanced/*` | Development only | Internal tooling, absent from production navigation and DOM. |

Anonymous Supabase guest-cloud access is not in this route map yet. It is a
separate follow-up decision, not a shortcut around Explore or account policy.

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

Guest-cloud remains a separately approved session type. Browser host cutover,
legacy retirement, public marketing parity, and advanced/internal tooling occur
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
