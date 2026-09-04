---
title: "Guardian–Child Relationship Lifecycle Boundary"
status: "audit-complete-next-contract-required"
created: 2026-09-01
owners: [identity, safeguarding, school, guardian, privacy]
tags: [guardian, child, custody, consent, account-lifecycle, data-retention]
---

# Guardian–Child Relationship Lifecycle Boundary

This note records the existing relationship boundary and the contract required
before guardian/child account lifecycle work is implemented. It is an audit,
not a migration or a claim that custody and consent workflows are complete.

## Existing evidence

The Supabase schema snapshot contains
`public.student_guardian_relationships` with:

- `student_id`, `guardian_id`, `relationship_type`, and `created_at`;
- a unique `(student_id, guardian_id)` pair;
- foreign keys to `public.users` with `ON DELETE CASCADE` on both sides;
- RLS policies named `guardians_self_manage` and `students_see_guardians`.

Evidence: `apps/gurudevi-mobile/supabase/backups/remote_schema_backup.sql`
around the `student_guardian_relationships` table, constraints, policies, and
RLS enablement. This is a backup snapshot and must be checked against the
applied environment before relying on it as current production state.

The canonical ZenStack model is
`packages/schema/schema.zmodel` (`StudentGuardianRelationship`). It currently
models read access for the student, guardian, or platform admin and broad
admin access, but does not model invitation, consent, expiry, custody, or
historical retention. The generated ORM reflects the same narrow model.

The application contracts are richer than the persisted relationship:

- `packages/admin/src/guardian/types.ts` has relationship type, permissions,
  custody level, effective/termination dates, and verification concepts;
- `packages/core/src/logic/schemas/guardian.schema.ts` validates similar
  fields;
- `packages/admin/src/guardian/api.ts` exposes `linkGuardianToStudent`,
  `updatePermissions`, and `terminateRelationship`.

These are useful feature contracts, but they are not proof that the database
enforces those fields or that the API performs custody/consent checks.

## Boundary and invariants to implement

The relationship is a separate aggregate from either account. Its lifecycle
must preserve the following history:

```text
invited -> consent_pending -> active -> expired
                         \-> rejected
active --------------------> revoked
active/expired/revoked ----> historical (read-only record)
```

Every transition needs an actor, timestamp, reason, and audit event. The
implementable contract should include:

1. **Invitation:** issuer, intended student/guardian, school/tenant, scoped
   permissions, expiry, single-use/idempotency, and a non-disclosing response
   when the target is unknown.
2. **Consent:** who gave consent, whose authority was used, consent version,
   evidence reference, timestamp, and withdrawal path. Student age/capacity and
   institution rules must be policy inputs, not UI assumptions.
3. **Custody and authority:** verified relationship type, custody level,
   effective/termination dates, restrictions, reviewer, and supporting
   document references. Documents should not be exposed through ordinary
   guardian reads.
4. **Access:** permissions are derived from an active, non-expired, non-revoked
   relationship and current policy. A stale local relationship cannot grant
   access after revocation.
5. **Expiry/revocation:** expiry is automatic and read access closes; revocation
   records who acted and why. Termination must not erase the historical link.
6. **Historical record:** preserve the minimum relationship, consent, custody,
   and audit evidence required by the approved school/safeguarding/retention
   policy, with separate visibility from live access.
7. **Deletion interaction:** deleting or deactivating a guardian must revoke
   live access without cascading away the child's relationship history. A child
   request must not remove guardian, safeguarding, school, or official records
   without the authority and retention workflow. Purge/anonymization must
   resolve both sides and all derived grants before completion.

## Known gaps and risks

- The persisted relationship has no lifecycle status, consent evidence,
  custody fields, expiry, revocation metadata, or policy version.
- `ON DELETE CASCADE` in the schema snapshot conflicts with the requirement to
  preserve relationship history during account deletion. This must be resolved
  by an approved data-retention design before any purge worker is enabled.
- The snapshot's `guardians_self_manage` policy is broad (`FOR ALL`) and must
  not be treated as sufficient custody or consent enforcement.
- `GuardianIdentity` and `StudentGuardianRelationship` application types have
  fields absent from the persisted snapshot. This is contract drift, not a
  reason to silently add client defaults.
- Current admin guardian screens and API methods can display/link data, but the
  audit found no evidence of a complete invitation, consent, authority,
  revocation, or historical-record workflow.

## Next concrete implementation

Before adding mutations, obtain a fresh schema/policy inventory from the
applied Supabase environment and map each consumer of
`student_guardian_relationships`, `student_profiles.guardian_id`, access
grants, assessment permissions, and longitudinal events. Then produce one
reviewed domain contract for the relationship state machine and retention
categories. Only after that review should a migration introduce lifecycle
columns/tables, narrow RLS/RPC boundaries, and preserve history on account
deletion.

The first executable slice should be a read-only relationship projection that
returns `active | pending | expired | revoked | historical` plus the effective
permissions and source policy version. Its tests must cover both guardian and
child visibility, revoked access, expiry, duplicate invitation idempotency,
and account deactivation/deletion without data leakage. Do not wire a new
child-account mutation until those tests run against the real database.
