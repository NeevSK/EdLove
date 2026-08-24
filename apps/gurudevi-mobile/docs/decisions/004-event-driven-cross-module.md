---
title: "ADR-004: Event-Driven Cross-Module"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# ADR-004: Event-Driven Cross-Module

## Status
Accepted

## Context
Direct API dependencies between modules (e.g. Classroom calling Wellbeing) create tightly coupled spaghetti. If one module breaks, the whole system potentially fails.

## Options Considered
1. **Direct Imports/Calls**: Simple but brittle.
2. **Event-Driven Architecture**: Modules emit events; listeners respond asynchronously.

## Decision
We chose **Event-Driven Architecture**. 
- Implementation: **Inngest** for background reliable processing + **Supabase Realtime** for instant UI updates.
- Canonical Event: `{ module }.{ entity }.{ action }` (e.g., `classroom.attendance.marked`).

## Consequences
- Better resilience: Classroom works even if Wellbeing is down.
- Testing: Modules tested in isolation by simulating events.
- Complexity: Distributed tracing becomes necessary (Sentry).

## Date: 2026-04-22
