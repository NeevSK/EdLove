---
title: "Gurudevi Workstream Coordination: Account, Offline, Sanctuary and Workspace"
status: "active"
created: 2026-10-10
updated: 2026-10-10
author: "Gurudevi product architecture"
tags: [coordination, account, offline-first, workspace, sanctuary, wallpaper, tanstack]
---

# Coordination boundary

Use the [Cross-Chat Coordination Log](2026-10-10-gurudevi-cross-chat-coordination-log.md)
for append-only timestamped updates, ownership changes, blockers, and review
requests between conversations.

The account/offline foundation and the “Explore Sanctuary as a living house”
workstream are complementary. They must share contracts and evidence, but they
must not create competing persistence or authorization systems.

## Ownership

### Account and platform-foundation stream

- JWT verification and session lifecycle;
- account, onboarding, identity, and active-scope bootstrap;
- public/account-required/open/scoped/private access classes;
- cross-platform offline mutation/outbox/receipt contract;
- Effect 4 orchestration for retry, timeout, auth revalidation, and replay;
- server-owned authorization and idempotency;
- shared TanStack Query/Pacer boundary policy;
- production evidence and hostile review.

### Sanctuary living-house/workspace stream

- Workspace floor composition and appearance behavior;
- groups, ordering, pins, layout, wallpaper metadata, and fallback rules;
- runtime budgets for memory, battery, disk, network, motion, and rendering;
- secure wallpaper asset pipeline and derivative variants;
- web/native visual adapters and platform-specific rendering;
- visual performance, responsive behavior, and low-end fallback evidence.

## Shared seams that require coordination

1. **Offline mutation envelope:** layout, wallpaper metadata, pins, and account
   mutations use one operation identity, account namespace, scope, contract
   version, receipt, and reconciliation model.
2. **TanStack Query:** owns server-state cache and invalidation on both clients;
   it does not become the durable outbox.
3. **TanStack Pacer:** governs debounce, throttle, batching, and invalidation
   storms; it does not decide authorization or conflict policy.
4. **PowerSync/SQLite and browser storage:** remain platform adapters behind the
   shared port. Web must not import native storage; native must not import web
   persistence code.
5. **Account/scope namespacing:** appearance/layout state must be partitioned by
   account, active scope, device/client, and Explore versus durable mode.
6. **Authorization:** wallpaper ownership, layout scope, and school/class
   resources are server-derived. Client-selected IDs are selectors only.
7. **Evidence:** a visual or sync claim is not complete until the relevant G0–G5
   evidence level is recorded for both promised platforms.

## Non-negotiable safety rules

- A process death cannot lose a locally acknowledged committed change.
- JWT expiry pauses cloud replay; it never deletes local work.
- Reauthentication never replays queued work under another account or scope.
- A timeout after commit reconciles the receipt before retrying.
- Conflicts are surfaced and recoverable; unrelated fields must not be silently
  overwritten.
- Wallpaper bytes never live inside layout JSON or unbounded browser storage.
- Anonymous unsigned uploads are not allowed.
- Low-memory, reduced-motion, battery-saver, quota, and decode failures have a
  truthful safe fallback.
- No stream removes or replaces an existing writer without characterization
  evidence and explicit compatibility review.

## Integrated milestone order

1. **Contract inventory:** map layout/appearance writers and account/offline
   writers; identify duplicate persistence paths.
2. **Shared mutation contract:** define operation IDs, revisions, receipts,
   conflict states, and account/scope namespaces.
3. **Cross-platform query policy:** standardize QueryClient defaults, Pacer
   invalidation governance, and offline classification.
4. **Account/session integration:** pause/revalidate/replay behavior for both web
   and mobile.
5. **Workspace layout synchronization:** optimistic updates, durable outbox,
   reconnect, deterministic merge, and multi-tab/device conflict handling.
6. **Runtime budget enforcement:** browser and native adapters consume one
   RuntimeBudget contract.
7. **Wallpaper pipeline:** signed ownership-scoped upload, validation,
   derivatives, quotas, cancellation, deletion, and orphan cleanup.
8. **Verification:** G0–G5 tests covering restart, long offline periods,
   auth expiry, conflicts, storage pressure, low-end rendering, and release
   devices.

## Review protocol

Before merging a stream’s change:

- state the owned seam and files changed;
- list any shared contract touched;
- state behavior when network, auth, storage, quota, or process lifetime fails;
- show the evidence level and what remains unproven;
- inspect deletions and compatibility impact;
- record follow-up work instead of silently widening scope.

This lets both workstreams advance independently while preserving one Gurudevi
account, authorization, offline, and synchronization model.
