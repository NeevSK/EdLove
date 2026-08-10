---
title: "School Discovery and Invite Contract Batch"
status: "ready-for-application"
created: 2026-08-10
updated: 2026-08-10
tags: [gurudevi, schools, registry, invites, contracts, idempotency]
---

# School Discovery and Invite Contract Batch

This is the next batch after tenant school CRUD authorization.

## Findings

- `schoolAPI.searchSchools()` currently queries `schools`, which is the tenant
  workspace table. It cannot discover the national school registry and is why
  it does not represent the roughly 10,000 canonical `edu_schools` rows.
- `edu_schools` is the canonical, read-only discovery source. A selected
  registry row should become a `SchoolRegistryClaim`; it must not directly
  create a bond, membership, citizenship promotion, or entitlement.
- Invite generation is still a direct client-side insert using `Math.random()`.
  That is not the right authority boundary for role issuance or retry safety.
- The baseline `invite_codes.role` check allows only `teacher` and `student`,
  while the principal UI exposes `principal` as a selectable invite role.
  The role vocabulary also differs between camelCase application names and
  snake_case capacity names used by bonds and authorization policies.

## Planned treatment

1. ✅ Added an explicit canonical-registry search contract and API, separate
   from tenant `School` CRUD and its Zod shape. The API reads `edu_schools`,
   caps the result size, and has no mutation side effects.
2. ✅ Normalized invite role/capacity vocabulary at the principal API boundary
   and database constraint (`teacher`, `student`, `principal`, `grade_head`,
   `section_head`, `assistant_principal`).
3. ✅ Moved invite issuance behind an authorized database function with secure
   server-side code generation and an optional idempotency key.
4. Keep invite redemption as the atomic authority path that creates the school
   bond, membership, entitlement, and citizenship projection.
5. Add focused contract/RLS tests before applying the batch.

The migration is intentionally not treated as applied until it is run against
the target database and the live parity auditor is rerun.

Before application, the auditor correctly reports one expected error:
`InviteCode.idempotency_key` is present in ZModel but not yet in the live
`invite_codes` table.

This batch deliberately does not make registry discovery imply institutional
membership, and does not broaden offline support or PowerSync behavior.
