---
title: Onboarding actor derivation
status: implemented
date: 2026-07-30
scope: sanctuary-api, packages/core
---

# Decision

`onboarding.completeOnboarding` accepts an empty input object and derives the user ID from the authenticated request context. Client compatibility methods may retain a historical user-ID parameter at their public boundary, but they do not transmit or trust it.

The school-bond procedures follow the same rule:

- `onboarding.createFounderSchoolBond` accepts only `schoolId`.
- `onboarding.revokeSchoolBond` accepts only `schoolId`.
- The server derives the bond owner from the authenticated principal and performs the bond, entitlement, and user-projection updates transactionally.

# Rationale

Onboarding changes identity state and creates bonds. Accepting a caller-supplied user ID allowed an authenticated user to target another account if any downstream check weakened. The native oRPC contract now makes the invariant visible and testable: the procedure has no user selector.

# Verification

The HTTP onboarding suite verifies successful completion with `{}`, rejects a payload containing `userId`, and covers founder-bond creation and revocation. The contract POA suite verifies the empty input schema and rejects the legacy selector. The server API typecheck passes.
