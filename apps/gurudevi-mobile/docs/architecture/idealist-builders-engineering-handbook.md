---
title: "Idealist Builder's Engineering Handbook"
status: "active"
created: 2026-08-10
updated: 2026-08-10
author: "Naween and Codex"
tags: [gurudevi, engineering, ai-collaboration, philosophy, craftsmanship, learning]
---

# Idealist Builder's Engineering Handbook

## Why this exists

Gurudevi begins with a human and philosophical vision: belonging, dignity,
growth, trust, learning, and meaningful relationships. This handbook protects
that vision while turning it into software that is explainable, testable,
secure, maintainable, and capable of surviving future contributors and AI
sessions.

The goal is not to suppress intuition. The goal is to give intuition a reliable
path into reality.

## The builder identity

An idealist builder is allowed to begin with feelings, metaphors, and a picture
of a better world. Engineering begins when those ideas are translated into:

- entities and relationships;
- explicit authority boundaries;
- invariants that must always hold;
- workflows and state transitions;
- tests for both success and forbidden behavior;
- operational evidence that the system works in reality.

The philosophical model supplies meaning. The engineering model supplies proof.
Neither is complete by itself.

## Vibe coding and engineering

Vibe coding is useful for exploration, naming, sketches, prototypes, and
finding the shape of an idea. It becomes dangerous when generated code is
treated as evidence of correctness.

Engineering starts when we ask:

1. What is the source of truth?
2. Who is allowed to read or change this?
3. What must never happen?
4. What happens if the request retries, arrives offline, or partially fails?
5. Which database constraint, policy, transaction, or test proves the answer?
6. How will we observe and repair it after release?

The desired practice is **AI-accelerated engineering**: use AI for speed and
breadth, but require evidence before accepting behavior.

## Gurudevi's core translation pattern

| Human idea | Engineering translation |
| --- | --- |
| A person can belong before creating an account | Shadow/dummy identity plus explicit claim/link workflow |
| A principal can establish a school | Official creation authority, founder bond, membership, and entitlement transaction |
| A school can be discovered without being joined | Read-only canonical registry separate from tenant school state |
| Trust should be earned and scoped | Bonds, capacities, RLS, ZenStack policies, and approval RPCs |
| Offline work should feel continuous | Local projection, outbox/idempotency, retry-safe mutations, server authority for sensitive actions |
| Meaningful events should be remembered | Durable domain records, append-only history where appropriate, and explicit lifecycle states |

## Non-negotiable invariants

- Discovery does not equal membership.
- Registry identity approval does not grant bonds, citizenship, entitlements, or permissions.
- A client never mints authority by itself.
- Sensitive multi-write operations are atomic or fail visibly.
- Retries do not create duplicate reality.
- RLS and server authority protect data even when the client is buggy.
- Views are read-only projections, not fake writable tables.
- Canonical roles use one vocabulary across Zod, ZenStack, PostgreSQL, and UI.
- A green type-check is not proof of correct authorization behavior.
- No migration is considered complete until live migration state and parity agree.

## Working with AI safely

### Before implementation

Ask the AI to inspect:

- the live schema and relation kind;
- current migrations and applied migration state;
- current code references and actual consumers;
- RLS policies, functions, and indexes;
- the relevant ZModel/Zod/Drizzle/PowerSync contracts;
- existing documentation and whether it is current or historical.

State assumptions explicitly. If an assumption changes authority, identity,
financial state, offline behavior, or data retention, stop and obtain a
decision before implementation.

### During implementation

- Work in bounded batches.
- Prefer additive, reviewable migrations.
- Keep authority in the database/server boundary.
- Generate derived artifacts instead of hand-editing them.
- Add the smallest useful test or audit with each important invariant.
- Preserve unrelated worktree changes.

### Before accepting a batch

Run the smallest relevant evidence loop:

1. migration state;
2. ZenStack generation;
3. type-check;
4. schema/API parity;
5. trust/RLS/RPC behavior checks;
6. query-plan checks for important access paths;
7. authenticated staging fixtures when behavior depends on identity.

If a gate cannot run, record it as **not verified**, never as passed.

## Definition of done

A schema/database batch is done when:

- the domain decision is documented;
- live ownership and usage were inspected;
- ZModel, Zod, database, and generated artifacts agree where they should;
- constraints and RLS enforce the invariant at the database boundary;
- authority RPCs are authenticated, search-path-safe, and retry-aware;
- success, denial, duplicate, and partial-failure paths are considered;
- important queries are bounded and measured;
- migration state is aligned;
- the verification result and remaining limitations are recorded.

## Learning path

Learn in this order rather than trying to master everything at once:

1. SQL basics: `SELECT`, joins, grouping, transactions, constraints.
2. PostgreSQL modeling: primary/foreign keys, nullability, defaults, unique/check constraints.
3. PostgreSQL security: RLS, policies, `auth.uid()`, `SECURITY DEFINER`, safe search paths.
4. TypeScript contracts: Zod parsing, inferred types, boundary validation.
5. ZenStack: relation modeling, policy expressions, generated clients, migration boundaries.
6. Performance: indexes, pagination, `EXPLAIN`, query shape, write amplification.
7. Reliability: idempotency, retries, outbox patterns, observability, migration rehearsal.

The goal is practical fluency: enough understanding to ask precise questions,
spot dangerous assumptions, and review AI-generated changes intelligently.

## Personal operating rhythm

- Start from the human story.
- Name the actors, entities, and authority boundaries.
- Write the invariant before writing the implementation.
- Make one bounded change.
- Verify against reality.
- Record what was learned.
- Leave the next session a clean handoff.

Reflection, empathy, and imagination are not interruptions to engineering. They
are the inputs that make the system worth engineering. Discipline is the bridge
that lets those inputs become dependable software.

## Carry-forward references

- [Schema and Database Trust and Performance Guide](./schema-db-trust-and-performance.md)
- [Database Parity and Schema Inventory Governance](../database-parity-inventory-governance.md)
- [Identity, Membership, and Claim Model](../identity-membership-and-claim-model.md)
- [Offline-Online Synchronization Spec](../Core/offline-online-sync-spec.md)
- [Trust and Performance Verification Batch](../current_progress/2026-08-11-trust-performance-verification-batch.md)
- [Migration Safety Verification Batch](../current_progress/2026-08-11-migration-safety-batch.md)
