---
title: "Trust and Performance Verification Batch"
status: "complete"
created: 2026-08-10
updated: 2026-08-10
author: "Codex"
tags: [gurudevi, rls, rpc, idempotency, query-plans, performance]
---

# Trust and Performance Verification Batch

## Completed

- Added `audit:db-trust`, which verifies critical-table RLS, policy presence,
  authority RPCs, and key uniqueness/idempotency indexes.
- Added `audit:query-plans`, which runs read-only `EXPLAIN (FORMAT JSON)` checks
  for canonical registry discovery, school membership lookup, invite redemption,
  notification feed, and registry claim queue access.
- Both audits pass against the linked database.
- Added `audit:db-behavior`, which verifies live authority RPC security-definer
  posture, pinned search paths, authenticated-caller checks, idempotency/capacity
  guards, multi-write authority steps, and RLS policy presence.
- The behavioral metadata audit passes against the linked database.

## Interpretation

The invite and membership lookup plans currently show sequential scans because
the live tables are small. This is an observation, not an index failure. The
next performance decision should be based on representative row volume and
`EXPLAIN (ANALYZE, BUFFERS)` from staging, not on adding indexes preemptively.

## Next boundary

Full behavioral tests should still run with authenticated identities and verify that RLS
and authority RPCs reject cross-school access, unauthorized role issuance,
duplicate claims, and partial multi-write outcomes. Those tests require test
fixtures/credentials and are separate from this read-only structural gate.

The fixture runner is now available as `pnpm run test:db-behavior-fixtures`.
It requires explicit staging/test-only credentials and identifiers, performs
read-only checks, and exits with code 2 when fixtures are not configured.
