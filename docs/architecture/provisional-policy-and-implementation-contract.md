---
title: "Provisional Product Policy and Current Implementation Contract"
status: "active"
created: 2026-10-09
updated: 2026-10-09
author: "Gurudevi product architecture"
tags: [architecture, product-policy, contracts, maintainability, hardening]
---

# Provisional policy, durable implementation

Product decisions in Gurudevi are allowed to remain provisional. We can build
features, capabilities, and useful defaults before every future boundary is
known. The discipline is to separate two layers:

1. **Provisional product policy** describes the current intent: who should be
   able to do something, what the experience should feel like, and which
   boundaries are still open to revision.
2. **Current implementation contract** describes what the code must do today:
   schemas, API inputs and outputs, state transitions, access checks, error
   states, persistence behavior, and compatibility guarantees.

The second layer is not a prediction that the first layer is permanent. It is
the smallest reliable agreement that lets multiple callers and platforms ship
without inventing conflicting behavior.

## Default operating rule

When a product decision is not final, implement the safest useful default that:

- preserves user work and avoids irreversible external effects;
- keeps public, account-required, scoped, and private access distinguishable;
- derives identity, ownership, and authorization on the server;
- makes the assumption visible in a named contract or capability flag;
- can be migrated or rolled back without rewriting unrelated domains;
- has a characterization test before the behavior is changed later.

Do not block all development waiting for perfect product certainty. Do not hide
uncertainty by letting each UI caller choose its own interpretation.

## What belongs in each layer

| Concern | Provisional policy | Current implementation contract |
|---|---|---|
| Audience | “Teachers may create classes.” | Capacity, endpoint, validation, response, and failure states. |
| Scope | “A class may begin personal and later attach to a school.” | Class ownership, attachment state, relationship tables, and migration command. |
| Access | “Some resources are public.” | Explicit `public`, `account-required`, `open`, `scoped`, or `private` access class. |
| Session | “Explore should be frictionless.” | Anonymous local adapter; no cloud identity or durable mutation. |
| Lifecycle | “Deletion policy may evolve.” | Request receipt, state machine, retry and reconciliation behavior. |
| Platform | “Web and mobile may differ at entry.” | Shared durable-account states with platform-specific adapters. |

## Change protocol

When a provisional decision changes:

1. Name the policy change and affected capabilities.
2. Identify the current contract version and all consumers.
3. Add or update characterization tests for current behavior.
4. Decide whether the change is additive, compatible, migratory, or breaking.
5. Add a server migration, adapter, feature flag, or deprecation window as
   appropriate.
6. Preserve recovery for in-flight work and failed conversions.
7. Record evidence from web, mobile, API, and persistence paths before calling
   the change complete.

An implementation may be marked `provisional`, but it must not be marked
`undefined`. “Open decision” means a controlled seam exists, not that callers
may guess.

## Recommended code patterns

### 1. Capability contracts, not domain-wide gates

Represent access and lifecycle in small typed contracts. A Library index can
be public while saving a collection is account-required and editing a school
resource is scoped. Avoid one `isAuthenticated` gate for an entire domain.

### 2. Server-derived authority

Treat client IDs, selected roles, school IDs, class IDs, and scope selectors as
inputs only. Resolve ownership and relationships from the authenticated
subject on the server. Return an authoritative bootstrap/read model that all
entry surfaces consume.

### 3. Ports and adapters for Explore and durable accounts

Keep domain components independent of storage. Provide browser-local Explore
and authenticated server adapters behind the same narrow read/write port. An
adapter must state which commands are local, unavailable, queued, or durable;
never report a discarded write as success.

### 4. Idempotent mutation envelopes

Every durable mutation should carry an operation ID, contract version, actor
subject, target resource, and input hash. Return a receipt that supports
timeout-after-commit reconciliation. Retries must not blindly replay a
non-idempotent command.

### 5. Explicit state machines

Model account, onboarding, relationship, invitation, deletion, and conversion
states as discriminated unions or validated schemas. Keep `loading`, `empty`,
`unavailable`, `forbidden`, and `error` distinct in UI and telemetry.

### 6. Compatibility at boundaries

Prefer additive response fields, versioned commands, and anti-corruption
adapters around legacy APIs. Do not spread legacy response shapes into new
components. Remove an adapter only after repository reference search and
runtime evidence show no remaining consumer.

## Production-hardening priorities

1. Centralize the account/scope read model and remove duplicate identity
   parsers.
2. Replace broad transport `any` types with generated or runtime-validated
   contracts.
3. Add session refresh, expiry, sign-out, and cross-tab tests for every durable
   entry point.
4. Enforce access classes for public links, Library resources, and Community
   membership at the API boundary.
5. Add idempotency and receipt/reconciliation to onboarding, school/class
   creation, invitations, and attendance writes.
6. Make privacy, retention, publication, and deletion behavior explicit for
   each entity class.
7. Keep web, mobile, and Explore evidence separate; a package registry or
   green typecheck is not proof of end-to-end completeness.
8. Track contract versions and migration health in logs without recording
   sensitive content.
9. Keep generated artifacts and unrelated worktree changes out of feature
   conclusions; verify the exact diff being shipped.

## Completion bar

A capability is ready to expand when it has:

- a named policy and current contract;
- one authoritative API/read model;
- server-owned authorization;
- truthful pending, empty, forbidden, unavailable, and recovery states;
- idempotent or explicitly safe mutation behavior;
- migration/rollback behavior for provisional assumptions;
- focused unit/contract tests and at least one real platform/runtime check;
- documented gaps rather than implied completeness.

This allows Gurudevi to keep moving while the product becomes clearer. The
architecture stays flexible by isolating uncertainty at boundaries, not by
leaving behavior ambiguous throughout the codebase.
