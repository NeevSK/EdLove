---
title: "EdLove UUIDv8 Foundation: Step 1 Implementation Plan"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [plan, edlove, uuidv8, identity, migration, verification]
---

# EdLove UUIDv8 Foundation: Step 1 Implementation Plan

## Objective

Prove the EdLove UUIDv8 profile can be generated and validated consistently at
the authoritative boundary before any existing account, provider binding,
foreign key, or production route is migrated.

## Scope

### Deliver

1. A typed registry for the approved EdLove domain, subtype, and mint-origin
   values from the canonical specification.
2. Profile-v1 conformance vectors covering valid UUIDs, malformed UUIDs, wrong
   version/variant, unregistered domain/subtype/origin, timestamp boundaries,
   and reproducible byte-level parsing.
3. One CSPRNG-only authoritative generator design and one validator/parser
   contract, with a database implementation and TypeScript implementation
   compared against the same vectors.
4. Collision handling policy: database uniqueness remains final authority;
   collision retry is bounded, observable, and fails closed after exhaustion.
5. Clock policy: detect backward movement, retain/advance the last logical
   timestamp within configured limits, and emit an operational event when drift
   crosses the approved threshold.
6. A read-only inventory of existing ID producers and consumers to identify the
   first safe additive adoption target.

### Do not deliver in Step 1

- No rewrite of `public.users.id`, `auth_identities`, or existing foreign keys.
- No provider migration, Supabase dashboard change, passkey rollout, or client
  offline minting.
- No new encoded authorization, role, tenant, provider, or personal data.
- No removal of UUIDv4/v7 producers or compatibility paths.

## Current implementation checkpoint (2026-10-23)

- Completed: read-only inventory, profile-v1 registry, deterministic TypeScript
  encoder/parser, and the first documented conformance vector.
- Deferred by design: collision retry, database implementation, and any schema
  adoption. The API issuer now provides CSPRNG minting and bounded clock
  monotonicity; persistence remains the final uniqueness authority and requires
  the selected additive target.
- Inventory decision: existing Supabase/Postgres UUIDv4/random defaults and
  UUIDv7 operational identifiers remain unchanged. They are not evidence that
  a live identifier can be silently migrated to UUIDv8.
- Issuer decision: `apps/sanctuary-api` owns UUIDv8 issuance through Node's
  CSPRNG. The mint origin is an explicit deployment configuration, a bounded
  clock rollback retains the last timestamp and reports the event, and an
  excessive rollback or entropy failure fails closed.
- First additive persistence target: a nullable, unique `public.users.edlove_id`
  UUID column. It will map the existing canonical account primary key to an
  EdLove account UUIDv8 without changing `public.users.id`, `auth_identities`,
  provider subjects, or existing foreign keys. The migration and backfill stay
  deferred until collision-retry persistence evidence is implemented.

### Read-only producer inventory decision

| Existing producer/consumer | Current owner | Decision |
|---|---|---|
| `public.users.id` and its foreign keys | Supabase migrations; Sanctuary account resolver | Preserve. It remains the canonical application account key. |
| `public.auth_identities.provider_user_id` | Supabase Auth and Sanctuary account resolver | Preserve as opaque provider-subject binding. Never UUIDv8. |
| UUIDv4/random table defaults | Supabase/Postgres migrations | Preserve until an individual durable cross-product entity is approved. |
| UUIDv7 command, outbox, and agent-operation IDs | `@repo/core` and Sanctuary API | Preserve; these are operational/event identifiers, not the first sovereign account target. |
| `public.users.edlove_id` | New additive account mapping, not yet migrated | First approved candidate after collision-retry persistence work. |

## Work packages

| Package | Work | Evidence / decision gate |
|---|---|---|
| A. Physical inventory | Locate existing UUID generation in SQL, TypeScript, database schema, and test fixtures; classify authoritative versus local/provisional creation. | Every candidate has an owner, source path, and adoption/no-change decision. |
| B. Registry contract | Add the immutable profile-v1 enums and validation rules; reserve unassigned values. | G0 tests reject every reserved/test value at a production boundary. |
| C. Conformance vectors | Define canonical input/output vectors and byte-layout assertions independent of implementation language. | SQL and TypeScript consume the identical vector fixture. |
| D. Generator | Implement only at the authoritative server/database seam, using CSPRNG entropy and the profile-v1 layout. | G1 generator tests prove version, variant, domain/subtype/origin, timestamp, and retry behavior. |
| E. Parser/validator | Parse for diagnostics and validation; never use parsed fields for authorization. | G0/G1 negative tests reject malformed or forbidden identifiers. |
| F. Failure operations | Specify collision, clock rollback, entropy-source failure, and registry mismatch behavior. | Errors are typed/sanitized, observable, and do not mint a weak fallback ID. |
| G. Adoption recommendation | Select one new or additive identity record as the first candidate; prepare, but do not apply, its migration. | Human approval is required before a schema migration is authored. |

## Boundary ownership

| Concern | Owner | Rule |
|---|---|---|
| UUIDv8 layout and registry | `@repo/core` contract layer | Platform-neutral types; no database/network side effects. |
| Authoritative minting | `sanctuary-api` plus database migration boundary | Server/database only; CSPRNG; database uniqueness is final. |
| Persistence | Existing Supabase/Postgres migration workflow | Additive schema only after Step 1 approval. |
| Mobile/web | Consumers only in this step | No client-side authoritative minting or primary-key migration. |
| Authorization | Existing API/Cedar policy boundaries | UUID parsing cannot grant access. |

## Verification matrix

| Level | Command/test class | Proves | Does not prove |
|---|---|---|---|
| G0 | Registry/parser/conformance vector tests | Profile shape and deterministic interpretation under substitutes. | Database uniqueness or production entropy. |
| G1 | Database generator and collision/clock boundary tests | Authoritative-boundary behavior with isolated database/runtime controls. | Hosted Supabase or multi-region behavior. |
| G2 | Additive account-binding scenario, only after approval | A new binding resolves without changing existing accounts. | Browser/device/provider journeys. |
| G4/G5 | Deferred | Real bundled/device consumption after a later client phase. | Not a Step 1 claim. |

## Preconditions and stop conditions

Stop and return to architecture review if any of these are true:

- the desired layout requires roles, tenancy, provider subjects, or permissions
  inside an identifier;
- the implementation needs `Math.random()`, a weak entropy fallback, or
  client-side authoritative minting;
- a migration would alter an existing primary key or foreign key;
- offline generation is requested before a device-key and reconciliation design;
- the database cannot provide a testable CSPRNG source or reliable uniqueness
  constraint;
- a consumer relies on UUID sort order as a security or authorization decision.

## Completion criteria

Step 1 is complete only when the registry and vector fixture are versioned,
SQL/TypeScript implementations agree, failure modes are tested, the ID-producer
inventory is reviewed, and the raw diff contains no existing-ID rewrite or
weakened guard. Completion authorizes a separate human-approved additive schema
proposal; it does not authorize migration itself.

## Sources

- [EdLove Identity Convergence Program](../architecture/edlove-identity-convergence-program.md)
- [EdLove Sovereign UUIDv8 Specification](../architecture/edlove-sovereign-uuidv8-specification.md)
- [Authentication and Sovereign Identity Authority](../architecture/authentication-and-sovereign-identity.md)
- [RFC 9562, UUID Version 8](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.8)
