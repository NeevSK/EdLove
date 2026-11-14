---
title: "Account Foundation Implementation Plan"
status: "active — sequencing plan"
created: 2026-10-08
owners: [product, identity, web, mobile, api, quality]
tags: [implementation-plan, account-lifecycle, onboarding, identity]
---

# Account Foundation Implementation Plan

This plan turns the accepted lifecycle contract into bounded implementation
slices. Each slice must preserve existing behavior until its replacement has a
characterization proof and an explicit compatibility decision.

## Phase A — Establish the canonical seam

### A1. Identity and account mapping

- Choose the single provider-subject → internal-account mapping authority.
- Define duplicate, missing, disabled, and stale-account outcomes.
- Characterize existing mobile and web callers before changing adapters.

Exit: one contract and G0/G1 tests for create, lookup, duplicate, and disabled
identity outcomes.

### A2. Onboarding contract

- Make name and primary capacity mandatory facts.
- Make completion an explicit server transition, not a profile-trigger side
  effect.
- Consolidate web direct-fetch onboarding behind the chosen seam.
- Preserve legacy route compatibility until callers are migrated and measured.

Exit: signup/callback → onboarding → personal entry is one contract on web and
mobile, with retry and duplicate-submit behavior defined.

### A3. Session lifecycle

- Represent session validity separately from account state and authorization.
- Cover initial load, auth-state changes, refresh, expiry, sign-out, and
  cross-tab/device recovery.
- Define the safe behavior for a mutation interrupted by expiry.

Exit: browser and mobile lifecycle characterization plus applicable runtime
evidence; no claim of robust sessions from bootstrap-only tests.

## Phase B — Relationship and custody foundation

### B1. Scope and relationship model

- Define school, class, circle, membership, invitation, pending, accepted,
  denied, and revoked relationships.
- Derive active scope on the server.
- Ensure submitted IDs are selectors, never authority.

Exit: principal school creation and teacher create/join-class contracts exist,
including idempotency and failure recovery.

### B2. Custody matrix

- Classify first-release records as user-owned, relationship-owned,
  entity-owned, shared/community, derived, or local/temporary.
- Define retention, export, deletion/anonymization, sync, and audit behavior.
- Apply the matrix to Self reflection/wellbeing, school/class, Library
  resources, and Community circles.

Exit: deletion-request behavior can be explained per record class without
guessing.

### B3. Deletion request boundary

- Return a request receipt and server status.
- Expose next step, failure/retry, and cancellation when allowed.
- Keep final deletion server-controlled and distinguish it from local cleanup.

Exit: request lifecycle has G0/G1 coverage and a support/recovery procedure.

## Phase C — First domain value slices

### C1. Sanctuary and Self

Make Sanctuary the post-onboarding app destination, with Self as its primary
home tab, and deliver one durable personal reflection or wellbeing practice,
beginning with Fire Journal or Mood Lotus. Prove personal ownership, retry,
offline behavior where supported, and account separation. This slice must not
depend on school membership.

### C2. Workspace

Deliver relationship creation as a later participation context: principal
creates a school; teacher creates or joins a class. Only then promote
attendance or other classroom work. Do not make this relationship a gate for
Sanctuary, Self, open Community, or public Library.

### C3. Library

Deliver public/open resource discovery and safe opening of validated links for
any eligible user, independent of institutional membership.
Do not count local Explore or broad curator/collection UI as durable Library
coverage.

### C4. Community

Deliver open community discovery and a safe public participation boundary for
eligible users. Scoped circle membership, posting, moderation, safety, and
membership mutation remain separate slices until their server contracts exist.

## Phase D — Platform evidence promotion

For every slice, run evidence in order:

1. G0 contract/state tests.
2. G1 boundary tests with substitutions named.
3. G2 success/failure/retry scenarios.
4. G3 real component/runtime evidence where applicable.
5. G4 browser and Metro journey evidence.
6. G5 device evidence where applicable.
7. R1 release/telemetry/rollback evidence.

No higher-level claim substitutes for a missing lower-level contract or
boundary proof.

## Phase E — Consolidation and release

- Migrate callers from duplicate onboarding/session implementations.
- Re-run identity audit and anti-slop checks.
- Remove or archive compatibility paths only after evidence and release notes.
- Publish residual risks, support procedures, rollback, and known exclusions.

## Immediate work order

1. Characterize current onboarding and session callers.
2. Select and document the canonical onboarding/session seam.
3. Correct lifecycle state semantics, especially premature onboarding status.
4. Build the custody matrix and deletion request status contract.
5. Implement Sanctuary entry and prove the first Self slice.
6. Promote open Library and Community slices without institutional gating.
7. Model school/class relationships and invitations.
8. Implement and prove relationship creation for Workspace, then scoped
   institutional tasks.

The repository is not ready for broad feature expansion until steps 1–5 are
complete.

## Progress record

- **Completed:** A1 characterization; canonical oRPC onboarding compatibility
  client added; web onboarding now uses the shared command boundary; mobile
  onboarding now routes authenticated subjects through the canonical commands
  while preserving the local-compatible guest path.
- **Preserved:** legacy onboarding client, Hono-style routes, identity adapter,
  migrations, and mobile navigation remain unchanged.
- **Evidence:** focused G1 client tests, core/web type checks, callback boundary
  tests, mobile routing tests/type checks, and no-duplication checks recorded in
  the evidence ledger.
- **Known gate:** repository anti-slop still fails on inherited code-quality
  findings; this slice adds no format, AI-slop, security, or duplication
  findings.
- **Next:** add the shared lifecycle state/read model before changing
  account-state semantics, then characterize the relationship-creation seam.
