---
title: "oRPC Contributor Guide"
status: "active"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
scribe: "Codex"
tags: [api, orpc, contributors, testing, architecture]
---

# oRPC Contributor Guide

This is the starting point for anyone adding or changing a request/response API after the native oRPC migration checkpoint.

## The rule of ownership

For first-party request/response APIs, the native oRPC contract is the source of truth.

```text
packages/core/src/api/<domain>.orpc.contract.ts
        ↓
apps/sanctuary-api/src/core/handlers/<domain>.ts
        ↓
packages/core/src/api/<domain>.ts
        ↓
packages/<feature>/ and apps/<client>/ callers
```

The layers have different responsibilities:

- The contract owns input schemas, output DTOs, error shape, and policy metadata.
- The handler owns the use case and request-scoped database access.
- The shared client owns authentication, URL selection, retries, offline classification, and typed errors.
- Feature packages adapt DTOs into presentation types only when necessary.
- Hono owns runtime middleware and protocol hosting, not domain business rules.

Do not add a new migrated endpoint to a Hono/ts-rest contract, manually build its URL, or query Supabase directly from a first-party feature caller.

## Starting a new procedure

1. Identify the domain and search for an existing native contract, handler, and client method.
2. Write or update a decision/spec document under `apps/sanctuary-api/docs/decisions/` before changing a schema or introducing a new domain boundary.
3. Define an explicit DTO. Never return a database object directly.
4. Define strict input validation and a typed error map.
5. Add policy metadata to the procedure. Derive actor identity from `ORPCContext`; do not accept `userId`, `authorId`, `reviewedBy`, or similar authority selectors from callers unless the use case explicitly targets another subject and authorizes it.
6. Implement the handler with the shared context and request-scoped ZenStack client.
7. Add or update Cedar vocabulary and policies when the resource or action is new.
8. Add the shared client method and migrate active callers immediately.
9. Add focused contract, handler/authorization, and real-Hono HTTP tests before moving to another slice.
10. Run the broad Node/Bun API suites and policy tests before declaring the slice complete.

## Context and authorization invariants

The request path must construct one context containing the authenticated principal, request ID, trace ID, active bond/entity, request-scoped database, Cedar context, audit writer, and idempotency services.

The expected order is:

```text
JWT identity → request-scoped DB → active context → Cedar decision
→ input validation → use case → audit → typed DTO
```

Sensitive mutations must be auditable. Database policies and Cedar are complementary: Cedar decides whether the action is allowed, while ZenStack enforces object-level data access.

## Offline and protocol boundaries

- PowerSync owns offline SQLite, live queries, replication, and queued local writes.
- oRPC owns online procedures and the single typed `sync.uploadBatch` procedure.
- Do not replace PowerSync with React Query or send one network request per sync row.
- AI chat remains a dedicated Hono streaming/SSE adapter.
- MCP remains a curated tool facade; do not auto-expose the router.
- OpenAPI is a selective interoperability adapter, never a second contract source.

## Test commands at the checkpoint

From the repository root:

```powershell
pnpm exec tsc --noEmit -p apps/sanctuary-api/tsconfig.json
pnpm --filter @repo/sanctuary-api exec vitest run --config vitest.config.ts --pool=threads --maxWorkers=1
pnpm --filter @repo/sanctuary-api exec vitest run --config vitest.config.ts --pool=forks --maxWorkers=1
pnpm --filter @repo/policies test
```

The checkpoint suite currently passes 85 tests across 17 API files in both Node-style and Bun-style pools. These are real in-memory HTTP/oRPC tests with controlled JWT, Cedar, and database mocks. They do not replace real-database, real-Cedar-sidecar, Expo, or PowerSync acceptance tests.

## Before resuming the migration

Read these in order:

1. [Sanctuary API oRPC Architecture](./orpc-api-architecture.md)
2. [oRPC Migration Test Reality Audit](./2026-07-30-orpc-test-audit.md)
3. The relevant decision document for the domain
4. [Docs SOP](../docs-sop.md)

Then audit live callers, not only filenames. Archived screens, compatibility adapters, temporal projections, and intentionally external tables may remain direct until their replacement contract and data model are specified.

## Known unfinished work at this pause

- Specialized legacy domains still need explicit contracts or a documented adapter boundary, including mapping, privacy ledger, rewards, inventory/resource-needs, and some temporal/history tables.
- Library temporal collection reconstruction and resource/collection edit/delete operations are not yet native.
- Real database and real Cedar evaluator tests are pending.
- Expo native/web, PowerSync bootstrap/upload, and full workspace typecheck gates remain pending; existing workspace UI/export errors are documented separately from the green API checkpoint.
- The old compatibility contract utilities remain for non-migrated or protocol-specific code. They must not be used for new first-party request/response procedures.

## Handoff expectation

Pause at a green slice boundary. Record the exact test counts, changed contracts, remaining legacy boundaries, and any schema-generation or migration requirements in a decision/checkpoint document. When resuming, start with the first unfinished boundary above rather than broad mechanical rewrites.
