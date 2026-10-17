---
title: "Tab and Domain Boundary Integration Audit"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Codex"
tags: [audit, boundaries, integration, identity, sanctuary, self, workspace, library, community]
---

# Purpose

This is a hostile integration audit of Gurudevi's primary Sanctuary domains. It traces the most important user journeys across UI, feature code, authentication, transport, contracts, server handlers, and persistence. It is not a claim that every endpoint or screen has been exhaustively inspected; it is a risk-ranked map of the seams that can currently fail silently, drift, leak scope, or promise persistence without a durable proof.

# System boundary model

```text
UI screen
  -> feature adapter / command owner
  -> auth/session and transport
  -> typed contract
  -> Sanctuary router and handler
  -> domain authorization/service
  -> durable database or explicitly local storage
```

An explicit client file is optional. An explicit owner for the feature's server interaction is not optional.

The product ordering is person-first: an account enters Sanctuary before it
belongs to an institution. Self is the primary home tab inside Sanctuary.
Personal Self, Workspace entry, open Community, and public Library must not be
accidentally gated behind school/class membership. Workspace capabilities are
capacity-gated: creating a new school/class is available to the relevant role;
only operations against an existing scoped entity require a verified
relationship.

# Cross-domain findings

| Priority | Boundary | Evidence | Risk | Required decision |
|---|---|---|---|---|
| P0 | Identity and scope facts are fetched through multiple browser paths | `lib/sanctuary/authorizedEntry.ts`, capability bootstrap, Community page, Self/Workspace/Library pages | Each domain can see a different session, onboarding, or active-scope fact after refresh/expiry | Establish one authoritative browser account/scope read model and one refresh/error taxonomy |
| P0 | Shared `orpcClient` is created as `createORPCClient<any>` | `packages/core/src/api/orpcClient.ts` | Contract drift is invisible at the main client boundary; runtime validation is inconsistent | Type the client from the router contract; keep Zod/Schema validation at external boundaries |
| P0 | Durable writes have no common idempotency/reconciliation envelope | Attendance batch write, onboarding completion, Self writes | Timeout-after-commit can produce duplicate or ambiguous effects | Define request identity, mutation receipt, retry policy, and reconciliation before broad mutation rollout |
| P1 | Web account flows mix shared oRPC, direct fetch, and hand-built RPC | `selfApiClient.ts`, `workspace/attendance.ts`, `community/groups.ts`, `CommunityFeedFloor.tsx` | Authentication, retry, status mapping, and response validation drift by domain | Migrate domain by domain to the shared transport; do not add generic wrappers without ownership value |
| P1 | Explore/guest and account persistence paths are intentionally different but not expressed by one policy | `lib/explore/*`, workspace local practice, mobile guest onboarding | A feature can accidentally write guest data into account scope or imply that local data is durable | Keep separate adapters but publish an explicit persistence/custody matrix per domain |
| P1 | Effect v4 is dependency-level/current-slice work, not workspace-complete | Effect v4 onboarding boundary versus remaining v3 APIs in core | Mixed runtime/API assumptions make package-wide verification red | Migrate Effect by bounded domain; no claim of completed migration until core typecheck is clean |
| P2 | Error taxonomy is still mostly user-facing strings | Self, Workspace, Library, Community loaders | UI cannot reliably distinguish auth expiry, denial, offline, malformed response, and server fault | Introduce shared typed boundary errors and map them to local copy at the UI edge |
| P2 | TanStack Query utilities exist but are not the common read/mutation path | `packages/core/src/api/orpcClient.ts` exports `orpc`; domain code often uses imperative fetch/client calls | No consistent cache, cancellation, invalidation, or stale-data policy | Adopt query/mutation utilities where repeated server state justifies them; do not force them onto one-shot flows |
| P0 | Durable mutation/outbox plumbing has no single command envelope and ownership | Existing sync/offline audits identify foreground/background/PowerSync processors and unscoped queue paths | A retry or queue replay can duplicate, cross accounts, or lose a durable effect | Define one scoped command envelope, receipt, lease, retry, and reconciliation owner before expanding writes |

# Domain audit

## Account and onboarding

Current path:

```text
OnboardingForm / mobile OnboardingScreen
  -> onboardingClient (authenticated subjects)
  -> orpcClient
  -> onboarding contract
  -> Sanctuary onboarding handler
  -> identity/bond/scope persistence
```

Positive evidence:

- Completion derives the actor from authenticated request context rather than accepting a caller-selected user ID.
- Input and response are validated in the new client.
- Mobile guest behavior remains on the legacy local-compatible path.

Open risks:

- Initial-bond creation and completion are two separate mutations; a failure between them leaves a resumable but not explicitly modelled state.
- No explicit idempotency key or mutation receipt is exposed to the caller.
- Browser auth bootstrap and transport token resolution have not yet been proven as one coherent runtime seam.
- The old `onboardingAPI` remains active for guests and other callers, so behavior can diverge.

Priority: P0 for lifecycle correctness.

## Self

Current account path:

```text
SelfFloor
  -> selfWellbeing / selfJournal
  -> selfApiClient
  -> direct fetch + Supabase session lookup
  -> Self API route / RPC
  -> Self handler
  -> durable personal records
```

Explore path is local and intentionally separate:

```text
SelfFloor
  -> selfExplore adapter
  -> account-safe or explore-local storage
```

Findings:

- Self has a named client, but it is a web-specific hand-built transport adapter rather than the shared authenticated oRPC path.
- It manually handles URL construction, bearer headers, status mapping, and response envelopes.
- It has useful account/local separation, but the persistence decision is distributed between the screen, adapter, and persistence boundary.
- The web adapter's procedure names and hand-built `{ json: ... }` envelope are not the same source of truth as the canonical Self oRPC contract; this is contract drift, not merely a style difference.
- The account adapter injects user identity into some inputs even though server authorization should derive ownership from request context.
- The server-side durable ownership boundary must remain authoritative; client-provided `user_id` must not be trusted as identity.

Priority: P0 for private-data correctness; P1 for transport consolidation.

## Workspace

Current account path:

```text
WorkspaceFloor
  -> workspace/attendance.ts
  -> direct fetch for classroom/roster reads
  -> shared orpcClient for attendance batch write
  -> attendance handlers
  -> classroom/attendance persistence
```

Explore/practice path uses local browser storage and fictional data.

Findings:

- Workspace does not have a separate file named `workspaceClient`, but it does have a feature adapter: `lib/workspace/attendance.ts`.
- The adapter mixes local draft storage, direct fetch reads, oRPC writes, Supabase session checks, and UI-oriented error messages.
- The split between practice and account data is valuable, but the account read/write transport is inconsistent.
- Attendance writes are durable and role/scope sensitive; retry and timeout-after-commit behavior require explicit reconciliation.
- Workspace reads use OpenAPI-style raw fetch while writes use oRPC, so one screen can read one representation and mutate through another contract.

Priority: P0 for durable mutation safety; P1 for boundary consolidation.

## Library

Current path:

```text
Library page / LibraryFloor
  -> browser Supabase session lookup
  -> shared orpcClient.library.getResources
  -> Library handler
  -> library/resource persistence
```

Findings:

- Library uses the shared oRPC client directly, so no separate feature client exists.
- A second core `libraryAPI` wrapper also exists, leaving two feature owners for the same procedures.
- That is acceptable for a simple read path, but `LibraryFloor` owns authentication lookup, request orchestration, loading state, and response handling together.
- Search and resource browsing need a clear stale-data/cancellation policy if they become server-state-heavy.
- Resource visibility and scope authorization must be server-enforced; the browser capability/bootstrap data is advisory for rendering.

Priority: P1 for authorization/read-model consistency; P2 for extracting a feature boundary.

## Community

Current path is split:

```text
Community page
  -> loadCommunityGroups
  -> custom oRPC client with manually supplied access token

CommunityFeedFloor
  -> /api/community/groups fetch
  -> local parsing and pagination
```

Findings:

- Community has two different client/transport paths for related group data.
- One path constructs a custom oRPC link; another calls a Next API route directly.
- The browser load-more path therefore performs a proxy hop and repeats authentication/identity resolution instead of using the same server-loaded data boundary.
- Community response contracts contain broad `z.any()` areas, weakening the boundary precisely where membership and participation privacy matter.
- Both parse responses, but authentication and error semantics can drift.
- Pagination/load-more behavior is UI-owned and not obviously reconciled with the initial server render.

Priority: P0 for consistent authorization; P1 for transport consolidation.

# Priority order

## P0 — protect identity, scope, and durable writes

1. Define one authoritative account/scope read model for browser and mobile.
2. Type the shared oRPC client from the actual router contract; remove the central `any` boundary.
3. Define mutation identity/idempotency and receipt semantics for onboarding and attendance first.
4. Characterize session expiry, active-scope change, timeout-after-commit, and retry behavior.
5. Ensure private Self writes and institutional Workspace writes cannot accept client-selected ownership as authority.

## P1 — consolidate integration seams

1. Move Workspace reads onto the same authenticated transport as its writes.
2. Choose one Community groups path and retire the duplicate only after characterization.
3. Move Self account calls behind the shared typed transport while preserving its local Explore adapter.
4. Standardize typed boundary errors and UI mapping.
5. Define the guest/account persistence matrix for every tab.

After the P0/P1 plumbing is safe, expand the initial Sanctuary, Self, open
Community, and public Library value loop. Institutional Workspace relationships
and capabilities follow that personal/open experience; they do not gate it.

## P2 — improve operability and ergonomics

1. Adopt TanStack Query query/mutation utilities for repeated server state.
2. Add cancellation and stale-request handling where screens currently manage it manually.
3. Add observability for boundary, scope, and reconciliation failures.
4. Extract feature clients only where they serve multiple callers or own meaningful domain orchestration.

# Non-goals

- Do not create a client file for every folder.
- Do not replace direct oRPC calls merely for naming consistency.
- Do not delete guest/local behavior before custody and migration evidence exists.
- Do not call Effect v4 migration complete until the remaining v3 code is migrated and the core package typecheck is clean.
