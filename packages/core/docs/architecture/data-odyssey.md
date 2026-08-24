---
title: "The Data Odyssey: Canonical Data Flow"
status: "active"
created: 2026-07-28
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, core]
---

# The Data Odyssey: Canonical Data Flow

This document explains how data moves through the platform and where each layer owns truth.
It is aligned with the legacy-free architecture:

- `Bond` is the atomic relationship record.
- `Capacity` is the canonical contextual identity.
- `Perspective` is the active runtime lens.
- `ReBAC` owns human relationship truth.
- `POA` owns the intent-to-execution contract boundary.
- `CASL` derives concrete abilities from context.
- `MCP` exposes delegated tools to agents.

The goal is simple:

- smooth for valid users
- restrictive for everything outside the current capacity and scope
- loud when something tries to cross a boundary it should not cross
- no silent fallback to `role` or `authority`

## 1. Architectural Pillars

The platform is built on a layered trust model:

1. `Supabase RLS`: the database line of defense.
2. `ZenStack`: model-level policy enforcement.
3. `ReBAC`: relationship truth through bonds and capacities.
4. `POA`: contract boundary for API execution.
5. `CASL`: ability derivation for UI and local decisions.
6. `PowerSync`: filtered offline sync.
7. `Inngest`: asynchronous workflow and event orchestration.
8. `MCP`: delegated tool access for agents.
9. `Sentry` and `PostHog`: observability and behavioral traceability.

These layers complement each other:

- ReBAC decides what relationship context exists.
- POA decides whether the requested action is allowed to cross the API boundary.
- CASL decides whether the current context may perform a specific action on a subject.
- MCP decides which tools an agent may use under delegated scope.
- RLS and ZenStack remain the last data-level guards.

## 2. Outbound Journey

Outbound means data flowing from the database toward the UI.

### Step 1: Database Defense

PostgreSQL RLS blocks rows that are not visible to the authenticated principal.
This is the final storage-layer filter, not the only guard.

### Step 2: Model Policy

ZenStack applies schema-level access rules before data leaves the server.
If a query is not allowed by the model, it should fail instead of returning partial truth.

### Step 3: Relationship Resolution

The identity adapter resolves:

- the current user
- their bonds
- the active perspective
- the capacities available in that context

This is the source of runtime identity truth.

### Step 4: Contract Shaping

Data is mapped into the public response contracts.
This step removes private fields and normalizes shape.

The contract must not reintroduce `role` or `authority` as a hidden compatibility layer.

### Step 5: Ability Derivation

CASL turns the current context into concrete abilities.
UI components should only render what the current capacity and abilities allow.

That means:

- buttons disappear when the capacity cannot act
- tabs disappear when the perspective does not support them
- screens remain inaccessible when no bond authorizes them

## 3. Inbound Journey

Inbound means a user or agent trying to change state.

### Step 1: Intent

The UI or agent requests an action such as create, update, invite, or publish.

### Step 2: POA Boundary

The request enters the POA proxy.
The proxy inspects the contract metadata for the operation and checks the current ability context.

The contract should describe the intended action and subject explicitly.

Example:

```ts
{
  action: "create",
  subject: "Post",
}
```

If the current bond and capacity do not satisfy the contract, the request should fail loudly.

### Step 3: Payload Validation

Zod validates the incoming payload.
This prevents malformed or unexpected data from entering the system.

### Step 4: Business Execution

The service executes the approved change.
It may call ZenStack-backed repositories or other bounded adapters, but it must not bypass the policy boundary.

### Step 5: Persistence

The final write lands in the database through the same layered defense:

- contract
- ability
- model policy
- RLS

If any of these disagree, the action should fail instead of being bridged.

## 4. Local Sync

PowerSync is the offline-friendly shadow path.

It should behave like a filtered mirror, not a second source of truth.

Rules:

- only sync rows visible to the current bond/capacity
- never widen access beyond the server-side policy
- queue local writes and reconcile them through the same contract path

This keeps the experience smooth for users while staying restrictive for unauthorized access.

## 5. Asynchronous Work

Inngest handles background workflows.

Examples:

- onboarding steps
- notification fan-out
- analytics side effects
- agent follow-up work

Inngest should not own authorization.
It can react to approved events, but the event itself must already be valid.

## 6. Agentic MCP

MCP is the tool surface for agents.

The agent does not get privilege by being an agent.
It gets a scoped grant.

Every tool call must be checked against:

- the human principal
- the active perspective
- the granted scope
- the current policy
- the allowed tool contract

If an agent tries to call a tool outside its scope, the failure should be explicit and traceable.

## 7. Observability

Observability should tell us where leakage or mismatch happens.

- Sentry captures errors and contract failures.
- PostHog captures user behavior and funnel transitions.

These signals are for healing the system, not for widening trust.

## 8. Integrity Rules

The data pipeline is considered healthy only when all of these are true:

- the same capacity is seen by read paths, UI paths, and write guards
- the active perspective is explicit
- no runtime path falls back to `role` or `authority`
- the offline mirror does not widen access
- agent tools are delegated, scoped, and audited
- legacy compatibility is not used to hide misalignment

## 9. Alignment With SSOT

This document should be read together with:

- `apps/gurudevi-mobile/docs/architecture/legacy-free-agentic-mcp-ssot.md`
- `apps/gurudevi-mobile/docs/decisions/011-legacy-free-agentic-mcp-implementation-plan.md`

Those docs define the canonical identity and delegation model.
This document defines how data flows through that model.
