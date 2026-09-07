---
title: "Feature Spec — Essential Startup Deadlines"
status: "approved-for-implementation"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, web, startup, routing, reliability]
---

# Feature Spec — Essential Startup Deadlines

## Blast zone

AMBER — startup coordination immediately before the route shell mounts.

## Target file

`apps/gurudevi-mobile/src/boot/startupCoordinator.ts`

## Reuses

- The existing `withTimeout` deadline helper.
- `EntryStartupBoundary`'s existing ready/failed/retry rendering contract.
- Existing `completeEssentialStartup` dependency injection for kernel tests.

## Does not

- Does not alter `app/_layout.tsx`, route policy, session state, deep-link
  policy, device-account data, or dependencies.
- Does not treat optional deferred services as essential startup.

## Behavior contract

`bootstrapPlatform`, app-catalog loading, and persisted device-account scope
initialization each finish within the essential-startup deadline or reject with
a named retryable error. The entry boundary must therefore leave its preparing
state by rendering either `EntryShell` or its existing error/retry fallback.

## Complexity budget

One reused deadline helper per sequential boundary; no new startup state
machine and no function above cognitive complexity 15.

## Verification

- Coordinator tests exercise real timeout rejection for each bounded stage with
  fake clocks, rather than imitating the helper with a separate `Promise.race`.
- Browser smoke check confirms startup does not remain indefinitely on the
  preparation screen; any external service failure must surface retry UI.
