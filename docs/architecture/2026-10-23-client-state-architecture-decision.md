---
title: "Client State Architecture Decision: Zustand, XState, and Query Ownership"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Codex"
tags: [architecture, client-state, zustand, xstate, tanstack-query, offline-first]
---

# Client State Architecture Decision

> **Canonical integration:** This dated decision records the rationale. The
> continuously maintained platform reference is
> [`client-state-and-web-offline-capability-canon.md`](client-state-and-web-offline-capability-canon.md).

## Decision

Adopt a deliberate hybrid, not a framework replacement:

- **TanStack Query** owns remote/server state: reads, mutations, cache freshness, invalidation, retries, realtime cache updates, and account-scoped removal.
- **Zustand** owns small, bounded client state that must be shared beyond one component: UI preferences, view controls, account-scoped workbench preferences, and the existing durable mutation outbox adapter.
- **XState** owns only explicit, long-lived protocols whose legal transitions, retries, cancellation, and recovery must be made auditable. It is not the default global store.
- **React local state, reducers, and context** own component-local interaction state and short-lived composition state.

This is a division of responsibility, not permission to copy the same datum into every layer. Each datum has one authoritative owner.

## Why this decision

Zustand is intentionally lightweight. Its installed v5.0.16 surface supports atomic React subscriptions, persistence migrations, controlled hydration, and selector subscriptions. It is a poor replacement for a remote cache or a protocol engine.

XState is valuable when the system has a real state graph: for example account transition, authorization admission, perspective switching, offline command settlement, or a multi-step recovery flow. It makes invalid transitions impossible to express and makes terminal/error states explicit. It is expensive ceremony for a drawer toggle, a theme choice, or a server-resource cache.

TanStack Query already exists in the workspace and is designed to own remote data's fetch/share/revalidate/collect lifecycle. Its invalidation model preserves stale data while a background refetch reconciles it. See [TanStack Query](https://tanstack.com/query/v5) and [query invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation).

## Non-negotiable ownership rules

| State class | Authoritative owner | Persistence policy |
| --- | --- | --- |
| API entities, notifications, device security, entitlement snapshots, permissions fetched from a service | TanStack Query | Explicit allow-list only; user and scope keyed; expiry-bounded |
| Offline commands and dead letters | Outbox/domain command subsystem | Durable, account-scoped, schema-versioned; never cleared by a cosmetic reset |
| Principal, active bond, tenant, perspective | One scope-session authority | Minimal bootstrap hints only; no duplicated authoritative snapshot |
| Theme, workbench tabs, local layout preferences | Bounded Zustand preference store | Versioned, migratable, account-scoped where relevant |
| Multi-step recoverable protocol | XState machine/actor or existing typed domain state machine | Persist only an explicitly versioned, serializable protocol snapshot or event log |
| Form edits, transient view controls, one-screen UI | React local state/reducer/context | Not persisted by default |

## What is wrong today

The problem is ownership rather than a broken library:

1. `AuthSlice`, `TenantSlice`, and `usePerspectiveStore` all model active perspective. This creates more than one truth during reset and switch operations.
2. `useStore.ts` preserves a mega-store facade by subscribing to whole auth, tenant, UI, and feature stores; it contains an `unknown` cast that hides the boundary.
3. Multiple consumers take whole-store subscriptions from high-churn temporal and conflict stores.
4. `useNotificationStore` and `useDeviceSecurityStore` implement server-cache concerns inside client state.
5. Most persisted Zustand stores lack a named schema version and migration path. `useActiveSubTabsStore` is the positive exception.
6. `selfCanvasStore` mixes preference state, network persistence, retry, circuit breaking, telemetry, migration, and storage access in one module.

## XState admission test

A feature may use XState only if every answer below is yes:

1. Does it have three or more meaningful states, guarded transitions, or parallel work that cannot be safely modeled as local reducer state?
2. Must it survive interruption, retry, account/perspective change, or app restart with defined semantics?
3. Would a transition table make an invalid or unsafe action impossible?
4. Is there a named domain owner for every effect, timeout, cancellation, and terminal state?
5. Is a machine test more valuable than a direct unit test of a bounded Zustand action?

If not, use Zustand or local state. XState persistence must be versioned and JSON-serializable; a restored actor does not replay actions, and incompatible snapshots are a real migration concern. See [Stately persistence guidance](https://stately.ai/docs/persistence).

## Architecture shape

```text
UI component
  ├─ local reducer/context: short-lived interaction state
  ├─ Zustand selector hook: bounded local/shared preferences
  ├─ TanStack Query hook: remote resource and mutation lifecycle
  └─ protocol controller: XState only for explicit transition systems

Scope-session coordinator
  ├─ validates next principal / bond / tenant / perspective
  ├─ cancels and removes old private Query cache entries
  ├─ transitions authorization and preference scope in defined order
  └─ preserves, quarantines, or resumes durable commands by policy
```

## Guardrails

- No API fetch, mutation, or realtime transport in a Zustand action unless it is a documented adapter for the durable outbox.
- No full-store subscription in production UI for a high-churn store; use atomic selectors, or `useShallow` for deliberate grouped selections.
- No persisted store without `version`, `migrate`, `partialize`, scoped key, corruption behavior, and a test.
- No user/tenant/perspective change without Query cancellation/removal and a scope-transition scenario test.
- No new XState actor without an event vocabulary, transition table, error states, ownership of effects, and a persistence decision.
- No removal of the legacy facade or existing store until every importer is migrated and a human approves the deletion.

## Success criteria

The architecture is successful when an account or perspective switch cannot render stale private data; no remote resource has a shadow copy in Zustand; every durable record has an owner and migration policy; and render subscriptions are bounded to the smallest state required.
