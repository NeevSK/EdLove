---
title: "ADR-005: Offline Strategy â€” V1 Online, V2 Offline-Ready"
status: "active"
created: 2026-04-23
updated: 2026-04-23
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# ADR-005: Offline Strategy — V1 Online, V2 Offline-Ready

## Status
Accepted

## Context
Rural Sri Lankan schools have patchy 3G. V1 must work reliably with intermittent signal, while V2 will move toward full peer-to-peer/CRDT sync.

## Options Considered
1. **Always Online**: Simplest but fails in rural areas.
2. **Offline-First V1**: Postpones release due to complexity.
3. **Synchronous with Offline Preparation (Hybrid)**: Online-only for V1 but with database patterns that make V2 CRDT migration seamless.

## Decision
We chose the **Hybrid Preparation** strategy.
- All primary keys are **UUIDs** (client-side generation safe).
- **Dual Timestamps**: `occurred_at` (event time) vs `created_at` (upload time).
- **Idempotency Keys**: Required for high-volume writes (Attendance, Grades) to handle safe retries on flaky signal.

## Consequences
- V1 requires internet to function but doesn't corrupt data on dropped connections.
- Future CRDT migration (Yjs) is easier due to UUID and temporal discipline.

## Date: 2026-04-22
