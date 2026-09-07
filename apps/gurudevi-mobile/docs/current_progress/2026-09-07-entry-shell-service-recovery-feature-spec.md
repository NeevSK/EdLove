---
title: "Feature Spec — Entry Shell Service Recovery"
status: "implemented"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, entry-shell, deep-links, sync, red-zone]
---

# Feature Spec — Entry Shell Service Recovery

## Blast zone

RED — entry provider composition and services that can navigate or replay the
local mutation queue.

## Target file

`apps/gurudevi-mobile/src/entry/EntryShell.tsx`

## Reuses

- `GlobalProvider` as the sole auth/context owner.
- `DeepLinkProvider` for cold-start and foreground link handling.
- `SyncManager` and the existing `dispatchQueuedMutationToSovereignBus` bridge.
- `SessionRouteGate` and its pure `getAuthRouteTarget` policy.

## Does not

- Does not mount or revive `SanctuaryProvider`.
- Does not move work into `app/_layout.tsx`.
- Does not alter route policy, PowerSync configuration, mutation admission, or
  deep-link parsing.
- Does not change native configuration or dependencies.

## Behavior contract

Essential startup restores the persisted active device-account scope after core
runtime registration and app-catalog setup, before `EntryShell` and its
`GlobalProvider` can mount. After that, the live entry
shell owns exactly one navigation-bound deep-link listener. A small
`AuthenticatedSyncService` owns the foreground outbox drain and renders it only
after an active identity is available. The deep-link provider can consume
cold-start and foreground links, including public magic-link callbacks; the
sync manager uses the existing workflow bridge and remains headless. Startup
failure behavior stays owned by `EntryStartupBoundary`.

## Complexity budget

Provider composition plus one small session/identity guard around an existing
service; no new route decisions.

## Verification

- Source-level entry-shell contract test confirms both services are mounted
  beneath `GlobalProvider` and only once.
- Mobile typecheck/lint and anti-slop checks run after the complete change set.
- Native device verification covers a cold-start deep link and a queued offline
  mutation when the device is unlocked and connected.
