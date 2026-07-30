---
title: "Native oRPC Migration Checkpoint"
status: "active"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
scribe: "Codex"
tags: [api, orpc, checkpoint, handoff, testing]
---

# Native oRPC Migration Checkpoint

## Pause decision

The migration is intentionally paused here at a verified, resumable boundary. No production cutover is claimed yet.

The slice-first approach is the standing procedure: update a domain contract, handler, callers, and focused tests together; then run the broad matrix before starting the next domain.

## Verified state

- Native oRPC is the canonical request/response transport for migrated first-party domains.
- Hono remains the runtime and middleware host.
- Cedar remains the policy engine.
- ZenStack remains the online database enforcement layer.
- PowerSync remains the offline-first local and replication layer.
- AI SSE, MCP, and selective OpenAPI remain explicit adapters.
- Library active reads/mutations are native oRPC.
- Onboarding completion and school-bond lifecycle derive actors from the authenticated context.
- Principal notes are mapped from the deployed `principal_notes` table into ZenStack and native oRPC.

## Evidence at pause

- Sanctuary API typecheck passes.
- Node API suite: 17 files, 85 tests passed.
- Bun API suite: 17 files, 85 tests passed.
- Policy suite: 7 tests passed.
- ZenStack schema validation and generated ORM completed after the `PrincipalNote` model mapping.

The API tests exercise the real in-memory Hono/oRPC request path. Their JWT, Cedar, and database dependencies are controlled mocks; real infrastructure acceptance is still required.

## Resume order

1. Read [oRPC Contributor Guide](../architecture/orpc-contributor-guide.md).
2. Review the [test reality audit](../architecture/2026-07-30-orpc-test-audit.md).
3. Audit live callers and remaining legacy boundaries.
4. Migrate one specialized domain at a time, starting with the highest-value active caller.
5. Add real database/Cedar-sidecar, Expo web/native, and PowerSync acceptance gates before release.
6. Remove old route/contract compatibility code only after migrated-caller search and production verification prove it is unused.

## Do not interpret this checkpoint as complete

Remaining work includes specialized legacy domains, library temporal/edit/delete behavior, real infrastructure tests, Expo and PowerSync acceptance, procedure-level persistent audit verification, and final production cutover monitoring.
