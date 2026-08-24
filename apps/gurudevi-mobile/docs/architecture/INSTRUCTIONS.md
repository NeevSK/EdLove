---
title: "Agent Operational Strictures"
status: "active"
created: 2026-04-23
updated: 2026-04-29
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Agent Operational Strictures

These instructions are mandatory for all AI agents working on the Gurudevi codebase.

## 1. Architectural Boundaries

- **Location**: Shared packages own contracts and pure domain logic. The current worker shell lives in `apps/gurudevi-marketingWeb/src/inngest`, but treat that as the current runtime host rather than a forever rule.
- **Shared Wisdom**: All business logic (schemas, calculations, domain services) must be imported from `packages/core`. Do not duplicate logic in the apps.

## 2. Residency and Resilience

- **Idempotency**: Use idempotency keys for every database write within an Inngest workflow. We must never double-bill, double-notify, or double-commit data.
- **State Management**: Favor Inngest `step` execution for durable multi-step reactions, privileged background work, and external side effects. Simple interactive CRUD can stay direct.
- **Service Instantiation**: In background workers, always instantiate your `@repo/core` services with the Supabase Server Client.
- **Context Injection**: Support both the **Supabase Service Role** (for Astro/Inngest bypass with "God Mode") and the **Standard Client** (for RLS-bound Mobile).

## 3. Logic Layer Evolution

- **Atomic Operations**: Refactor core logic to be more atomic. Instead of a single method that "does it all," provide granular methods that can be individually wrapped in `step.run()`.
- **Deterministic Keys**: Ensure `idempotency_key` generation uses **SHA-256** of the `payload + event_type_salt`. This ensures reliability across retries.

## 3. The "Devneevma" Tone

When writing comments or documentation, maintain the **Devneevma** tone:

- **Excellence**: Be technically precise and uncompromising on quality.
- **Care**: Remember that this system serves students and teachers. Use human-centric language.
- _Example_: Instead of `// Error handling for student lookup`, use `// Ensuring we find the student in the registry to properly care for their pulse check.`

## 4. Pre-Task Protocol

Before every task, you must read:

1. `LANDSCAPE.md`
2. `AGENT_GUIDELINES.md`
3. `SYSTEM_MAP.md`

We aren't just writing "code"; we are building a resilient National Operating System for the future of education.
