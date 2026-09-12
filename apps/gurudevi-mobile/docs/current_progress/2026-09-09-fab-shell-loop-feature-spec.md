---
title: "Feature Spec — FAB Shell Loop Recovery"
status: "approved-for-implementation"
created: 2026-09-09
updated: 2026-09-09
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, navigation, web, fab, runtime]
---

# Feature Spec — FAB Shell Loop Recovery

## Blast zone

AMBER — `packages/ui` shared shell context.

## Target file

`packages/ui/src/context/FABContext.tsx`

## Reuses

- The existing `FABProvider`, `useFAB`, and `useRegisterFAB` public contract.
- React's identity-preserving state update semantics.

## Does not

- Does not alter FAB action ownership, routing, provider placement, or any
  screen's FAB configuration.
- Does not suppress errors or add render guards to route layouts.

## Behavior contract

Cleaning up an already-empty, hidden FAB registration is a no-op. It must not
create a fresh context value and rerender a route subtree. This prevents a
screen cleanup/re-registration cycle from exhausting React's update depth and
blanking the web tab shell.

## Complexity budget

One state-identity guard, no new abstraction, cognitive complexity below 5.

## Verification

- A provider-level render regression test proves repeated empty unregister
  calls do not rerender consumers, while a real registered action still clears
  on unregister.
- Live web smoke check confirms no `Maximum update depth` error from
  `FABContext` after the Community tab shell mounts.
