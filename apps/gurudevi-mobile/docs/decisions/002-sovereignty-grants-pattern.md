---
title: "ADR-002: Sovereignty Grants Pattern"
status: "active"
created: 2026-04-23
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# ADR-002: Sovereignty Grants Pattern

## Status
**Superseded by ADR-013 and GrowthBook rollout engine**

This ADR was conceived when the permission system used CASL with sovereignty grants stored in relational tables (`student_record_access_grants`). The architecture has since migrated to Cedar policy evaluation (ADR-003, ADR-004, ADR-005, ADR-013) with GrowthBook as the feature rollout engine (D5 — `2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md`).

**What this means today:**
- Sovereignty constraints are now expressed as Cedar policies, not relational grants.
- Feature rollout is managed by GrowthBook (`IFeatureRolloutPort` / `GrowthBookFeatureRolloutAdapter`), not by feature-flag tables in the app schema.
- The principle ("no surveillance by default") still holds — it's enforced by Cedar's deny-by-default semantics.
- The relational grants pattern described here should not be used for new features.

## Context
In a multi-tenant school system, institutional hierarchy (School -> Zone -> Province) shouldn't imply automatic data access. Child data sovereignty is paramount.

## Options Considered
1. **Vertical Inheritance**: Higher roles automatically see data below them (Rejected - surveillance risk).
2. **Ad-hoc Access**: Manual DB bypass for counselors/admins (Rejected - non-auditable).
3. **Explicit Sovereignty Grants**: Access flows only through explicit, time-bound grants stored in a relational layer.

## Decision
We chose **Explicit Sovereignty Grants**. Every upward or sideward data flow (e.g., student record access by a new school or counselor) must be justified by a record in `student_record_access_grants` or equivalent domain tables.

## Consequences
- No "surveillance by default."
- Developer complexity: RLS and CASL must check for the presence of a grant.
- Security: Audit logs are reliable as they link to specific grants.

## Date: 2026-04-22
