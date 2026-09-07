---
title: "Feature Spec — Auth Bootstrap Event Freshness"
status: "implemented-code"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, auth, lifecycle, bootstrap, red-zone]
---

# Feature Spec — Auth Bootstrap Event Freshness

## Blast zone

RED — `packages/core/src/logic/auth/identityState.ts` defines a lifecycle
invariant consumed by the shared auth hook. AMBER — the hook applies that
invariant to its existing subscription and initial-read sequence.

## Target files

- `packages/core/src/logic/auth/identityState.ts`
- `packages/core/src/hooks/useAuthLifecycle.ts`
- `packages/core/src/logic/auth/identityState.test.ts`

## Reuses

- The existing listener-before-read ordering in `useAuthLifecycle`
- The existing `getSessionIdentityMode` policy and auth-store setters

## Does not

- Does not change sign-out, device-account, profile-resolution, route, or
  provider behavior.
- Does not add a second listener, timer, global state store, or root-shell
  responsibility.
- Does not trust a raw session for business authorization.

## Complexity budget

One pure freshness predicate and two single-condition call sites. No function
exceeds cognitive complexity 15.

## Behavior contract

The initial session lookup records the auth-event generation it began under.
It may apply its result only when no auth-state event has occurred since. An
event observed while that lookup is pending is authoritative, even if the
initial lookup resolves afterwards.

## Verification

The deterministic policy test asserts equal generations are current and a
newer event makes an earlier bootstrap result stale. The focused lifecycle
test also invokes the real hook effect with a pending initial lookup, delivers
a newer auth event, and proves the stale initial result makes no subsequent
session write. Core TypeScript compilation and scoped Biome checks pass;
physical-device sign-in/sign-out remains release validation.
