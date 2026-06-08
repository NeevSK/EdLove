---
title: "Data Highways and Sync Boundaries"
status: "active"
created: 2026-05-22
updated: 2026-05-22
author: "Naween"
tags: [reorganized]
---

# Data Highways and Sync Boundaries

## Purpose

This document defines the app's data movement lanes so future changes stay intentional:

- direct API for authority, identity, and bootstrap
- PowerSync for replicated offline-first workspace data
- local-first queueing for deferred writes and optimistic actions

The goal is to keep browser and mobile behavior coherent without forcing everything through SQLite or sync middleware.

## Core Principle

Not every operation should use the same transport.

For this codebase, the transport should be chosen by the data requirement:

- if the operation must be authoritative right now, use the direct API highway
- if the operation must survive offline and sync later, use the PowerSync highway
- if the operation is a deferred mutation or optimistic write, use the local-first queue highway

If a feature cannot clearly explain which highway it belongs to, that usually means the feature boundary is too broad.

## Highway Map

### 1. Direct API Highway

Use this lane for:

- identity resolution
- onboarding gating
- session bootstrap
- profile sync that must be immediately authoritative
- link and QR entry resolution
- server-owned checks that should fail loudly when unavailable

Why:

- keeps startup deterministic
- avoids local SQLite coupling for simple flows
- prevents PowerSync from becoming the default path for everything

Failure mode:

- if a direct API dependency is missing or the route is wrong, fail loudly
- do not silently fall back to local caches for bootstrap identity

### 2. PowerSync Highway

Use this lane for:

- classroom and workspace data that benefits from offline availability
- shared entity sets that can be replicated locally
- background reads that should keep working without network
- collections that are expensive or noisy to fetch repeatedly

Why:

- supports offline-first behavior
- reduces repeated network traffic for replicated domain data
- keeps the client responsive in unstable networks

Failure mode:

- if a feature depends on PowerSync but is used in a non-replicated context, fail loudly and route the feature to the direct API or a better boundary

### 3. Local-First Queue Highway

Use this lane for:

- optimistic writes
- deferred mutations
- mutations that should retry when connectivity returns
- device-security or audit-style writes that can be queued safely

Why:

- lets the UI stay responsive
- keeps user intent intact even when offline
- decouples action capture from eventual server commit

Failure mode:

- if a mutation is not safe to queue, do not enqueue it
- prefer direct API or an explicit synchronous failure instead

## Architecture Rules

1. Identity and onboarding should not depend on local SQLite.
2. PowerSync should never be the only path for app entry.
3. Browser behavior should not assume SQLite exists unless the feature explicitly needs it.
4. Every new feature must declare its highway during design review.
5. If a feature spans more than one highway, split it into smaller steps or ports.

## Recommended App Flow

1. Bootstrap identity via direct API.
2. Determine whether onboarding is complete.
3. Resolve whether the user is in the app or still in onboarding.
4. Load replicated workspace data through PowerSync only for lanes that need it.
5. Route writes through the queue only when the user experience benefits from deferred commit.

## What Not To Do

- do not route every read through PowerSync by default
- do not use SQLite as the universal source of truth for browser bootstrap
- do not hide route drift behind silent fallback logic
- do not make a workflow depend on a sync engine when the server can answer immediately

## Developer Heuristic

Ask these three questions before wiring a new feature:

1. Does this need to work without network?
2. Does this need to be authoritative right now?
3. Is this a mutation that can safely be queued?

The answers usually map directly to the three highways.

