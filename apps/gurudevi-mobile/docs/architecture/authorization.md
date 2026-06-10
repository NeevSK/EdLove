---
title: "Authorization Flow & Responsibilities"
status: "active"
created: 2026-03-30
updated: 2026-05-16
author: "Naween"
tags: [reorganized]
---

# Authorization Flow & Responsibilities

This document explains how authorization works in the legacy-free architecture.
It complements the canonical SSOT docs and should be read as the execution model
for `ReBAC`, `POA`, `CASL`, and `MCP`.

## 1. Layer Stack

### Layer 1: Identity State

- Owns lifecycle state such as anonymous, onboarded, and verified.
- Does not decide permissions.
- Provides the session envelope for the rest of the stack.

### Layer 2: ReBAC

- Owns bonds, capacities, and perspective selection.
- Answers who the user is in relation to a specific entity.
- Is the source of contextual identity truth.

### Layer 3: POA

- Owns the contract boundary between intent and execution.
- Validates the declared action and subject before the request proceeds.
- Must fail loudly when the current capacity does not satisfy the contract.

### Layer 4: CASL

- Owns concrete ability evaluation.
- Answers whether this context can perform this action on this subject.
- Drives UI gating and local decision-making.

### Layer 5: ZenStack and RLS

- Own the final server-side and database-side policy enforcement.
- Prevent queries or writes that violate the declared model.
- Provide defense in depth after POA and CASL have already narrowed the path.

### Layer 6: MCP

- Owns delegated tool exposure for agents.
- Never grants privilege by itself.
- Only exposes tools and resources that have been scoped by policy.

## 2. Responsibility Split

- ReBAC decides the relationship truth.
- POA decides whether the requested action can enter execution.
- CASL decides whether the current context can act.
- ZenStack and RLS ensure the server and database agree.
- MCP exposes the tool surface for delegated work.

## 3. Integrity Rules

- No runtime path should read `role` or `authority` as source of truth.
- No compatibility alias should silently widen access.
- All authorization failures should be explicit and easy to trace.
- The UI may only render from derived abilities, not raw legacy fields.
- Agents must operate under a scoped grant, not a hidden privileged identity.

## 4. Legacy Boundary

If a storage adapter or migration script still needs old data names, that is a temporary boundary concern only.
It must not leak into runtime permissions, UI branching, or agent tool access.

## 5. Canonical References

- `apps/gurudevi-mobile/docs/architecture/legacy-free-agentic-mcp-ssot.md`
- `apps/gurudevi-mobile/docs/decisions/011-legacy-free-agentic-mcp-implementation-plan.md`
- `packages/core/docs/DATA_ODYSSEY.md`
