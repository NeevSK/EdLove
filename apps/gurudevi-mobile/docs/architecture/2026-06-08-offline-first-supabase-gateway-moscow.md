---
title: "Offline-First Supabase Gateway and MoSCoW Rules"
status: "active"
created: 2026-05-22
updated: 2026-05-22
author: "Naween"
tags: [reorganized]
---

# Offline-First Supabase Gateway and MoSCoW Rules

## Goal

This document explains the architecture boundary for the offline-first data path:

`UI / shared domain` -> `local offline cache + PowerSync queue` -> `Sanctuary API` -> `Supabase`

The rule is simple:

- App-side business logic should not talk to Supabase directly.
- The Sanctuary API is the only networked Supabase entrypoint for app data.
- Offline reads and queued writes should flow through the local store and PowerSync first.
- Native/platform code may exist, but only as thin infrastructure glue.

## Why This Matters

The repo currently mixes a few different data access styles:

- direct Supabase client calls in shared code
- native-only auth/bootstrap flows
- local offline state and sync layers
- server-side API gateway behavior

That mixture works in practice, but it creates three risks:

- runtime coupling: shared code assumes browser/native APIs exist
- policy bypass: some code can skip Sanctuary API enforcement
- duplicated data rules: the same concept can be handled in multiple layers with slightly different behavior

The architecture goal is to remove ambiguity:

- shared UI and domain code should consume one data pipeline
- network access should be centralized
- offline behavior should be explicit instead of accidental

## MoSCoW Boundary Rules

### Must

- All app data CRUD must go through the offline-first pipeline.
- Sanctuary API must be the only component that talks to Supabase for domain data.
- Shared code must not call `supabase.from(...)`, `supabase.rpc(...)`, `supabase.storage`, `supabase.channel`, or `supabase.auth` for domain operations.
- Offline reads must resolve from local cache or PowerSync first.
- Offline writes must queue locally and reconcile through the pipeline.
- IAM-sensitive behavior must live in the right layer, not inside random UI or repository code.

### Should

- Native-only utilities should be isolated to platform glue, bootstrap, or device/session plumbing.
- Gateway contracts should expose the minimum data needed by clients.
- Shared code should talk to ports, managers, or API facades rather than raw transport clients.
- Sync/reconciliation behavior should be centralized so retries, conflict handling, and permission checks stay consistent.

### Could

- A few platform-specific helpers may still touch auth/session primitives if they are strictly bootstrap concerns.
- Some adapters may remain thin wrappers while migration is in progress, as long as they are only used by the Sanctuary API or explicit glue paths.
- Low-level infra helpers can stay separate if they do not expose app data access directly.

### Won’t

- Shared business logic will not directly query Supabase.
- UI hooks will not bypass the gateway for live data access.
- Native modules will not be used as a hidden backdoor for CRUD.
- “Temporary” direct calls will not become permanent architecture.

## Data Path Rules

### Read Path

1. UI asks a domain service or hook for data.
2. The local store / offline cache is the first answer and should be able to satisfy the screen while offline.
3. PowerSync-backed projections reconcile and refresh the local view when the sync rail is available.
4. The Sanctuary API is called when fresh authoritative data is needed or when a local miss requires remote truth.
5. Sanctuary API talks to Supabase and returns normalized results.
6. The client updates local state with the server response and keeps the offline cache warm.

### Write Path

1. UI submits a mutation to the local domain service.
2. The write is validated locally when possible.
3. The mutation is stored in the offline queue if offline or deferred.
4. PowerSync and/or the sync layer forwards the change through the Sanctuary API.
5. Sanctuary API enforces auth, policy, and canonical normalization.
6. Supabase persists the authoritative result.
7. Local state is reconciled from the canonical response and the queue item is cleared only after success.

## IAM Tucking Rules

IAM-related objects should be tucked inside the same pipeline, not scattered around the app.

That means:

- tokens should be handled by auth/session glue
- user identity should be resolved by the gateway or a dedicated identity service
- role/capability checks should happen in the Sanctuary API and/or policy layer
- device trust or push identity should not be used to bypass the gateway
- any “who is this user?” logic should map to a single source of truth

In practice:

- UI should request an identity-safe data port
- the port should know whether it is local, queued, or remote
- the remote leg should always go through Sanctuary API
- the Sancturary API should own the final authority for Supabase writes and reads

## Allowed vs Disallowed Examples

### Allowed

- `apps/sanctuary-api` using Supabase directly
- a narrow auth bootstrap helper that only manages the local session token
- native device plumbing that prepares headers, tokens, or secure storage
- PowerSync projection code that updates local state and then syncs through the gateway

### Disallowed

- shared hooks calling `supabase.from('table')`
- manager code issuing `supabase.rpc(...)` for app data
- UI components reading from Supabase directly
- native code using Supabase as an alternate app-data backend

## Migration Strategy

1. Identify all direct Supabase callers in shared code.
2. Classify each one as:
   - gateway-owned
   - native bootstrap glue
   - legacy code to migrate
3. Move app-data access behind a local-first port or service.
4. Route remote fetches through Sanctuary API.
5. Keep only the minimal native/session glue that is truly unavoidable.
6. Verify compile and runtime behavior after each slice.

## Practical Rule For New Code

Before adding any Supabase access, ask:

- Does this belong in `apps/sanctuary-api`?
- Is this app data or just bootstrap plumbing?
- Can this be expressed as a local-first port instead?
- Does this bypass the offline -> API -> Supabase pipeline?

If the answer points to app data, it should not call Supabase directly from shared or native feature code.

## Working Definition

The target architecture is:

`feature code` -> `local/offline port` -> `PowerSync` -> `Sanctuary API` -> `Supabase`

Anything outside that chain should be treated as an exception and reviewed carefully.

## Two-Lane Future Pattern

The 2026-friendly pattern is not "all auth and data through one giant client." It is two explicit lanes:

### Lane 1: Auth bootstrap

This lane is narrow and platform-aware.

- session creation and refresh
- token storage
- sign in / sign out
- identity bootstrap

This lane may touch Supabase Auth directly when needed, but it must stay isolated from app CRUD.

### Lane 2: Application data

This lane is local-first and gateway-driven.

- feature code talks to a domain port or gateway
- local cache serves first and must work offline
- PowerSync handles offline reconciliation
- Sanctuary API performs authoritative auth and policy enforcement
- Supabase is only touched by the Sanctuary API

### The refined cache rule

The offline cache is not a fallback after the fact.

It is the first-class application surface for:

- immediate screen hydration
- stale-but-usable local reads
- speculative optimistic UI
- offline survivability

PowerSync then becomes the sync rail that keeps the local cache and server truth aligned, rather than the thing the UI depends on directly.

### Gateway shape

The gateway should expose explicit security-sensitive surfaces separately from app data surfaces.

- `auth` for bootstrap/session plumbing
- `identity` for user and tenant resolution
- `data` for local-first domain access

That keeps IAM concerns visible instead of scattered through feature code.

## Implementation Intent

When we migrate code, we should preserve this order:

1. auth bootstrap lane
2. identity and authorization lane
3. app-data lane
4. sync and reconciliation lane

Each lane should tuck its own concerns inside the pipeline instead of leaking them upward into UI or feature modules.
