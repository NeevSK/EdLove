---
title: "Idempotency Audit and Canonical Contract"
status: "active"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, idempotency, powersync, retries, offline]
---

# Idempotency Audit and Canonical Contract

## Findings

Idempotency was implemented in several layers, but not consistently:

- `packages/core/src/lib/sync/idempotency.ts` is now the canonical client
  helper for UUID-v7 action keys and deterministic SHA-256 batch keys.
- `packages/core/src/utils/idempotency.ts` is now only a compatibility export;
  it no longer maintains a second UUID-v4/hash implementation.
- PowerSync previously sent the deterministic key only as an HTTP header while
  the oRPC body contract and handler read the body. The key was therefore
  commonly lost on the main upload path. The body now carries the required key
  explicitly and the server passes that exact key to the transactional batch
  processor.
- Row-level unique keys are appropriate for retryable creates such as grades,
  submissions, and notifications. They are not a universal requirement for
  every update/delete or append-only event.
- `applyPowerSyncBatch` still uses a process-local ten-minute cache. This is
  useful during development but is not durable across restarts or horizontally
  scaled API instances. A database-backed idempotency ledger is a future
  release-readiness task.

## Rule going forward

Every retryable command must choose one explicit strategy: a durable unique
business/idempotency key, a transactional upsert on the natural key, or an
online-only command with no retry replay. The caller, transport envelope,
server transaction, and database constraint must agree on that choice.
