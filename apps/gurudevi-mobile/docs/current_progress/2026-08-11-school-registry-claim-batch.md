---
title: "School Registry Claim and Provenance Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, schools, edu-schools, claims, provenance, multi-account]
---

# School Registry Claim and Provenance Batch

## Model

- `EduSchool` is the public factual registry row.
- `School` is the application tenant/workspace.
- `School.census_id` is the final approved link to `EduSchool.id`.
- `SchoolRegistryClaim` records a requested, approved, rejected, or withdrawn
  link, including requester, reviewer, evidence, timestamps, and idempotency.

This supports both flows:

1. An institutional owner creates a tenant and later links it to an existing
   canonical school record.
2. A user discovers a canonical school, requests a tenant/claim workflow, and
   an authorized principal or platform administrator approves it.

The registry facts themselves remain immutable/read-only to ordinary clients.
The claim ledger is the mutable workflow boundary.

The Core educational repository exposes the RPC result through the Zod
`SchoolRegistryClaimApprovalSchema`; callers receive an explicit success or
failure result instead of assuming a multi-step client update succeeded.

## Deliberate constraints

- One exact tenant-to-registry pair can have only one claim row.
- Approval must update `schools.census_id` and the claim status in one trusted
  server/RPC transaction; this batch does not pretend a client-side sequence is
  atomic. The `approve_school_registry_claim` RPC now provides that boundary.
- Approval does not create a bond, change citizenship, or grant an entitlement.
  The reviewer must already hold school leadership or platform-admin authority.
- The existing `SchoolJoinRequest` remains about a user joining a tenant. It
  is not reused for registry claims because membership and entity identity are
  different concerns.

## Human principal and membership workflow

The separate `approve_school_join_request` RPC now handles the authorized
membership path. It verifies an existing school leader/platform administrator,
then atomically creates or reuses the school bond, creates the membership,
creates the institutional entitlement, and approves the request. This is the
workflow for a real human joining an already-established school tenant.

The first principal still needs an establishment path: official school
creation/founder bonding or an administrator-issued official invite. Registry
claim approval alone is deliberately insufficient when no school leader exists
yet.
