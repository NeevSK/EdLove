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

## Phased sequence

### P0 - Recover the real product and canvas manifest

**Goal:** prevent another preview/demo branch from becoming the product.

1. For Self, Workspace, Community, Library, Profile, Notifications, and
   Settings, read the legacy route owner, `.web.tsx` behavior, and domain
   package surfaces before designing a browser equivalent.
2. Publish the canvas manifest for every domain: surfaces/zones, layout modes,
   real task actions, contracts, loading/empty/denied/failure states, and
   browser-specific gaps.
3. Classify existing guest stores, demo interception, mock data, guest mutation
   queues, and developer sandboxes as future adapters, legacy, or unsafe.
4. Record the exact browser import boundary: no Expo, React Native, React
   Native Web, PowerSync, native storage, or mobile lifecycle imports.
4. Correct or mark superseded conflicts in old guest/onboarding documentation
   as they are encountered; fifteen days is the current guest lease value.

**Exit:** every domain has an evidence-backed canvas/feature manifest and the
first real browser slice is selected. No code claims a simulated discarded
write was saved.

### P1 - Build real domain floors on the existing shared canvas model

**Goal:** use the existing reusable canvas model without flattening every
domain into one generic visual renderer.

1. Reuse the core surface/layout resolver and rebuild only the browser-native
   renderer behavior each domain actually needs; do not create a duplicate
   universal CanvasFrame.
2. Install the real Sanctuary shell as shared structure/plumbing around the
   browser route family: navigation, header/account island, safe areas, focus,
   and available canvas bounds.
3. Define a small shared browser canvas-model boundary and domain-owned
   renderer contracts: Workspace zone deck, Self navigator, Library shelves,
   Community mode hub, and Profile settings groups.
4. Keep the existing authorized-entry port account-only. Do not teach it to
   treat a local/anonymous session as an authorized account.

**Exit:** all primary domains can mount a truthful empty/loading/unavailable
canvas on the shared frame; no shared shell code contains domain feature data.

### P2 - Build the first real account-backed domain slice

**Goal:** prove the product contract before adding sandbox persistence.

1. Implement the selected first domain behavior from its legacy sources on its
   own domain floor with its real account/server contract.
2. Include actual loading, empty, denied, unavailable, validation, and failure
   behavior; do not substitute fixture-only behavior for the product path.
3. Establish keyboard order, skip link, focus restoration, visible focus, and
   reduced-motion behavior in the shared frame and slice.

**Exit:** one real account-backed task is accepted on the shared frame. The
shell owns no feature-specific data or toolbars.

### P3 - Add Explore as the second adapter to the accepted real slice

**Goal:** prove reuse without inventing an Explore-only product.

1. Add a browser-safe Explore adapter with local persistence, baseline data,
   reset, and explicit conversion export for the already accepted domain command
   contract.
2. Render the **same domain canvas and feature components** through the Explore
   adapter; route files only acquire the session and compose shared UI.
3. Prove no authentication, durable mutation, outbox, or sync request occurs
   in Explore.

**Exit:** the same component and command contract work locally and durably,
with real persistence, error states, and no divergent demo UI.

### P4 - Establish the remaining domain canvases in experience order

**Goal:** make the Sanctuary broadly explorable while keeping task truth.

1. **Library:** browse, collection/resource detail, and reader. Public/sample
   materials may hydrate Explore; private collections and cloud delivery remain
   durable-only until their policy is available.
2. **Workspace:** begin with a safe individual planning/temporary workspace
   canvas. Classroom selection, attendance, grades, and institutional writes
   remain durable-account operations with explicit local representations only
   where the manifest permits them.
3. **Community:** begin with a read/sample community canvas plus local draft
   composition. Posts, invitations, messaging, and live presence require a
   durable participant identity and server policy.
4. **Profile, Notifications, Settings:** use real account data where needed;
   Explore shows session-appropriate local preferences and clearly marks
   unavailable durable/account features.

**Exit:** every primary tab has a differentiated canvas and truthful state.
No feature masquerades as shared, sent, synced, or paid when it is only local.

### P5 - Account conversion and durable parity

**Goal:** let a person keep work without surprise or loss.

1. Provide one non-blocking “Keep this work” path from meaningful moments.
2. Authenticate, validate the conversion manifest, migrate supported local
   records, preserve originals until the server outcome is confirmed, and show
   a precise outcome for each record class.
3. Swap session/data adapters only after identity and server authorization are
   active; clear Explore copies only after confirmed migration policy permits it.
4. Add durable-only loops in their own slices: sharing, invitations, classroom
   writes, community publishing, notifications, provider connections, billing,
   and paid compute.

**Exit:** conversion is recoverable, observable, and never overwrites or leaks
across accounts. Durable features retain their server authorization boundary.

### P6 - Decide and, only if accepted, build Guest cloud

**Goal:** offer optional continuity without polluting frictionless Explore.

Before code, decide lease length/expiry, identity creation trigger, abuse and
rate limits, cross-device semantics, migration scope, privacy notice, account
upgrade behavior, and paid-capability policy. Reuse the accepted local-first
lease principles only where the review confirms they apply.

**Exit:** Guest cloud is either an explicitly specified, tested session type or
remains intentionally absent. It is never silently activated.

### P7 - Browser parity, cutover, and retirement

**Goal:** complete the browser product safely.

1. Migrate remaining behavior from legacy `.web.tsx` sources as independently
   accepted slices, including their loading, empty, denied, retry, keyboard,
   and responsive states.
2. Run the documented navigation-variant usability review before freezing the
   account-island arrangement.
3. Port public marketing/legal/editorial routes and preserve redirects,
   metadata, sitemap, consent, and support paths.
4. Cut over hosts and retire legacy browser routes only after compatibility,
   browser evidence, operational monitoring, and rollback behavior are accepted.

**Exit:** `apps/gurudevi-web` is the canonical browser product; legacy RNW and
marketing browser deployments can be retired in separate, reviewable work.

## Build order rule

The sequence is deliberately **spine -> shell -> one real dual-adapter task ->
remaining domain canvases -> durable integrations**, not “all chrome first” and
not “all auth first.” The shell can be built early because route structure and
access plumbing are shared; a domain canvas is only considered built once it
has real task state and an honest data adapter.

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

The factual port map is complete at
[2026-09-14-gurudevi-domain-canvas-port-map.md](2026-09-14-gurudevi-domain-canvas-port-map.md).
The next slice is the **Self overview floor**, starting with one account-backed
reflection feature. It must use a single Self preference authority and preserve
Self's `today`, `private`, and `shared` semantics. Explore becomes a local
adapter only after that task is real in the account path.

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
