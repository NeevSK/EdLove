# ADR-002: Sovereignty Grants Pattern

## Status
Accepted

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
