---
title: "Classroom Lifecycle oRPC Cutover"
status: "implemented"
created: 2026-07-30
updated: 2026-07-30
author: "Naveen"
tags: [decision, api, orpc, cedar, classroom]
---

# Classroom Lifecycle oRPC Cutover

## Decision

Classroom create, update, and delete operations now use the native `educational` oRPC router. The first-party `classroomsAPI` no longer writes directly to Supabase for these operations.

Each operation has a strict input contract, an explicit classroom DTO output for create/update, and Cedar policy metadata. Delete returns a typed success result and preserves the existing hard-delete behavior until a separate archival policy is approved.

## Authorization detail

Create carries `teacherId` as an explicit resource attribute so Cedar can verify that the principal creates a classroom for themself. Update and delete use the classroom identifier and the principal's classroom scope. ZenStack remains the second enforcement boundary at execution time.

## Tradeoffs

- The breaking wire format uses camelCase input names; the existing client method maps its legacy snake_case input into that typed contract.
- Hard delete is retained for behavior compatibility. A future soft-delete decision must update the contract, policy, database behavior, and audit expectations together.

## Verification

The focused education suite executes the in-memory Fetch → Hono → oRPC → Cedar → handler → DTO path and passes 10 tests. API TypeScript compilation passes. The test uses a mocked database and test JWT identity; it is not evidence of production database or cryptographic evaluator behavior. Those limits are recorded in the migration test reality audit.
