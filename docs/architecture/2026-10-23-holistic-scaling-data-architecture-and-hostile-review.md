---
title: "Holistic Scaling Data Architecture & Hostile Review"
status: "active"
created: 2026-10-23
author: "Naveen"
scribe: "Antigravity"
tags: [database, architecture, decoupling, neon, clickhouse, duckdb, bun, orpc, zenstack]
---

# Master Solution Architecture & Operational Plan: Holistic Data Decoupling & AI Scaling

> **Role**: Senior Solution Architect & Principal Systems Engineer  
> **Reviewer**: Ruthless Pragmatic Hostile Critic  
> **Context**: Greenfield Opportunity (Zero live production users to preserve legacy bugs for)  
> **Status**: Active Architecture Standard  

---

## 1. Executive Doctrine & Architectural Topology

Because the system currently has zero live users in production, we reject all apologetic shims, lazy backwards-compatibility facades, and half-decoupled compromises. The platform's data layer must be established top-down as a **polycentric, 5-plane data topology**:

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       POLYMATH 5-PLANE TOPOLOGY                                    │
├────────────────────────────┬─────────────────────────────┬────────────────────────────────────────┤
│ PLANE                      │ SUBSTRATE / ENGINE          │ RESPONSIBILITY                         │
├────────────────────────────┼─────────────────────────────┼────────────────────────────────────────┤
│ 1. Transactional Spine     │ Postgres / Neon / Supabase  │ Canonical state, Authz, Relational     │
│    (OLTP)                  │ @repo/database (ZenStack)   │ Server-side only via apps/sanctuary-api │
├────────────────────────────┼─────────────────────────────┼────────────────────────────────────────┤
│ 2. Ephemeral Sandboxes     │ Neon REST CoW Branching     │ Disposable ~500ms isolated databases   │
│    (AI Agent Scratchpads)  │ Bun 1.4+ Native SQL         │ Autonomous agent tools, migration test │
├────────────────────────────┼─────────────────────────────┼────────────────────────────────────────┤
│ 3. Observability & Traces  │ ClickHouse Columnar Cluster │ Millions of append-only logs/sec       │
│    (Central Telemetry)     │ OpenTelemetry Span Exporter │ LLM token costs, latencies, audit logs │
├────────────────────────────┼─────────────────────────────┼────────────────────────────────────────┤
│ 4. Embedded Local OLAP     │ DuckDB (In-Process / WASM)  │ Direct query of .parquet eval datasets │
│    (Edge & Eval Engine)    │ duckdb-async / Parquet      │ Offline student curve & agent metrics  │
├────────────────────────────┼─────────────────────────────┼────────────────────────────────────────┤
│ 5. Local Offline Spine     │ PowerSync + Client SQLite   │ Instant UI reads, optimistic offline   │
│    (Client Edge)           │ useLiveQuery() subscriptions│ Syncs selectively with Server API      │
└────────────────────────────┴─────────────────────────────┴────────────────────────────────────────┘
```

---

## 2. The Ruthless Pragmatic Hostile Critic: 5 Intercepted Traps

Before designing single lines of code, the hostile critic subjected the entire monorepo to adversarial stress testing. Five catastrophic traps were identified and neutralized:

### Trap 1: The Client TCP Socket Fallacy (Fatal Bundler Crash)
* **The Naive Idea**: "Just import `@repo/database` and call `createZenStackDb()` inside client adapters (e.g. `SupabaseIdentityAdapter`, `@repo/self`)."
* **The Hostile Veto**: **FATAL**. `@repo/database` relies on Node.js `pg.Pool` (raw TCP sockets, `net`, `tls`). React Native (Hermes) and browser web components do not possess raw Node TCP sockets. Importing direct Postgres drivers into client bundles crashes Metro and Turbopack instantly (`Module not found: 'pg'`).
* **The Neutralized Seam**: Client applications **never** talk raw Postgres. Client reads go through **PowerSync SQLite (`useLiveQuery`)**, and client writes go through **`orpcClient`** to `apps/sanctuary-api`, where the server executes `@repo/database` safely.

### Trap 2: The Ambient PostgREST SDK Infection (98-File Creep)
* **The Naive Idea**: "We changed `factory.ts`, so our database is decoupled."
* **The Hostile Veto**: **DELUSIONAL**. Lexical search reveals **98 files** across `@repo/self`, `@repo/people`, `@repo/accounting`, `@repo/library`, and `@repo/community` doing:
  ```ts
  import { supabaseClient as supabase } from '@repo/core/adapters/supabaseClient';
  supabase.from('some_table').select('*');
  ```
* **The Neutralized Seam**: Zero direct imports of `supabaseClient` allowed in domain or UI packages. All 98 sites must be redirected to either local store (`useLiveQuery`) or server contracts (`orpcClient`).

### Trap 3: Telemetry & Traces in the OLTP Database (Vacuum & Bloat Catastrophe)
* **The Naive Idea**: "Let's store agent execution logs, prompt evaluations, and OpenTelemetry spans in a Postgres `agent_logs` table."
* **The Hostile Veto**: **PERFORMANCE SUICIDE**. High-frequency agent token counts, request/response payloads, and telemetry create millions of append-only writes. This destroys Postgres buffer hit ratios, triggers relentless autovacuum storms, and inflates WAL replication logs.
* **The Neutralized Seam**: Telemetry streams directly to **ClickHouse** or local **DuckDB Parquet files** via `@repo/sanctuary-api/telemetry/otel.ts`. Zero bytes of telemetry touch OLTP tables.

### Trap 4: Ephemeral Sandbox Resource Runaways (Cost Leaks)
* **The Naive Idea**: "Agents spin up a Neon branch whenever they want."
* **The Hostile Veto**: **BILLING DISASTER**. Orphaned branches from crashed agent processes will accumulate on cloud providers, triggering runaway compute and storage bills.
* **The Neutralized Seam**: Every ephemeral branch must have a mandatory `ttlMinutes` tag, a hard cap on concurrent active branches (default: 5), and a garbage-collection sentinel script run at agent harness startup that terminates any branch older than 30 minutes.

### Trap 5: The Bun / Node Polyfill Illusion
* **The Naive Idea**: "We have Bun 1.4+ installed; let's rewrite the entire monorepo to Bun-specific APIs."
* **The Hostile Veto**: **BOUNDARY BREAK**. Mobile apps run on Hermes; Next.js web targets run on Vercel/Node; Sanctuary API runs on Node/Bun.
* **The Neutralized Seam**: Standardize domain code on **standard TypeScript and platform-agnostic ports**. Use Bun 1.4+ where it dominates: **server cold starts (`apps/sanctuary-api`) and autonomous AI agent CLI runners**.

---

## 3. Top-Down Architectural Seams

```
[UI / Domain Packages] (@repo/self, @repo/community, @repo/accounting)
        │
        ├── (Local Reads) ──> IDatabasePort (PowerSync SQLite / useLiveQuery)
        │
        └── (Commands/Writes) ──> orpcClient.* (Contract-typed RPC)
                                       │
                                       v
                     [apps/sanctuary-api] (Node / Bun 1.4+)
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                         v                           v
               @repo/database                @repo/sanctuary-api
           (ZenStack Client + Kysely)             (otel.ts)
                         │                           │
                         v                           v
                Postgres / Neon OLTP        ClickHouse Telemetry
```

---

## 4. Actionable Phased Execution Roadmap

### Phase 1: Client Cleanse — Purge Ambient `supabaseClient` Imports
* **Scope**: Redirect domain packages (`@repo/self`, `@repo/accounting`, `@repo/library`, `@repo/people`) away from direct `supabaseClient.from()` calls.
* **Action**:
  1. For reads: Use local reactive queries (`useLiveQuery` / local store).
  2. For mutations: Wire to existing `orpcClient` procedures in `apps/sanctuary-api/src/core/router.ts`.
* **Exit Gate**: `grep -rn "supabaseClient" packages/{self,accounting,library,people}` returns zero occurrences.

### Phase 2: Client Identity Decoupling
* **Scope**: [`packages/core/src/adapters/supabaseIdentity.adapter.ts`](file:///c:/x/packages/core/src/adapters/supabaseIdentity.adapter.ts).
* **Action**:
  1. Retain Supabase for session/JWT verification (`auth.getUser()`).
  2. Reroute `updateProfile`, `createInitialBond`, `completeProfile`, and `completeOnboarding` through `orpcClient.identity.*` and `orpcClient.onboarding.*`.
* **Exit Gate**: `mock.from` in `supabaseIdentity.canonical.test.ts` is never called across the entire test suite.

### Phase 3: The Bun 1.4 + Neon Disposable Agent Sandbox Harness
* **Scope**: Build `@repo/platform-mcp` / `@repo/database/src/sandbox.ts`.
* **Action**:
  1. Implement `ISandboxDatabasePort` with `@neondatabase/api-client`.
  2. Provide `createEphemeralAgentDb()`:
     - Calls Neon API: `POST /projects/{id}/branches` (creates branch in ~400ms).
     - Obtains disposable connection string.
     - Runs `createZenStackDb(agentUser, branchConnectionString)`.
     - Automatically cleans up branch on exit or timeout.
* **Exit Gate**: Automated integration test spins up a branch, runs a mutation, verifies isolation, and tears down cleanly in <5 seconds.

### Phase 4: Telemetry & Eval Columnar Pipeline (ClickHouse + DuckDB)
* **Scope**: Extend `apps/sanctuary-api/src/telemetry/otel.ts` and add `@repo/ai` eval reporter.
* **Action**:
  1. Add ClickHouse batch exporter for OTEL spans and agent traces.
  2. Implement DuckDB in-process eval reporter for querying agent benchmark `.parquet` dumps.
* **Exit Gate**: Zero telemetry tables in Postgres; trace query benchmarks execute in <50ms.

### Phase 5: Architectural Firewall & Sentinel Enforcement
* **Scope**: Monorepo lint & build gates.
* **Action**:
  1. Configure `.dependency-cruiser.cjs` / Biome / ESLint to strictly veto `@supabase/supabase-js` imports in any file outside `packages/core/src/adapters/supabase/`.
* **Exit Gate**: `pnpm run check:anti-slop` exits 0 with active import firewall.

---

## 5. Graduated Evidence Verification Matrix

| Phase | Milestone | Evidence Tier | Engine / Verifier | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | Domain Factory Signature Inversion | **G0** | `tsc --noEmit` | Clean compile, 0 errors, 0 `@supabase/supabase-js` in `src/logic/` |
| **P1** | Domain Package Ambient SDK Purge | **G1** | Vitest + Biome | 0 direct `supabaseClient` imports in domain packages |
| **P2** | Identity Adapter RPC Rerouting | **G1** | Vitest | `supabaseIdentity.canonical.test.ts` 100% green without PostgREST calls |
| **P3** | Neon Ephemeral Branching Harness | **G2** | Bun 1.4 Test Runner | Ephemeral branch creation, seeding, mutation, and teardown in <5s |
| **P4** | Telemetry Columnar Sink | **G1** | Vitest / OTEL mock | Trace spans exported to ClickHouse/DuckDB, zero writes to OLTP |
| **P5** | Anti-Slop Firewall | **G0** | Dependency-Cruiser | Build veto fires if `@supabase/supabase-js` is imported outside boundary |
