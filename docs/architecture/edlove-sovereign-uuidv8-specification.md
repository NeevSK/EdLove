---
title: "EdLove Sovereign UUIDv8 Specification"
status: "active"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, edlove, uuidv8, identity, data-governance, interoperability]
---

# EdLove Sovereign UUIDv8 Specification

> **Policy:** EdLove is the format owner. Gurudevi is an EdLove product and
> domain participant, not a separate identifier universe.

This document defines the EdLove UUIDv8 profile for durable, sovereign,
cross-product entities. It is a product-independent wire-format decision, not
an authorization mechanism and not a mandate to rewrite existing IDs.

## 1. Why EdLove owns the format

An authentication-provider subject answers “which credential did the issuer
verify?” An EdLove identifier answers “which durable entity does the EdLove
ecosystem own?” These are deliberately different questions.

```text
Supabase / Google / passkey subject ──binding──> EdLove account UUIDv8
                                                   └─ Gurudevi relationships,
                                                      data, and capabilities
```

RFC 9562 permits an organization to define UUIDv8. “Vendor-specific” means
implementation-specific; it does not require EdLove to be a commercial vendor.
It does make EdLove responsible for the format, uniqueness engineering,
compatibility, and documentation.

## 2. Scope and non-goals

### In scope

- Durable EdLove entities that can outlive a product, provider, device, or
  deployment: people/accounts, credential bindings, institutional entities,
  durable relationships, long-lived content, and workload principals.
- Gurudevi entities that participate in this ecosystem.
- Stable, coarse entity classification and mint provenance for operations and
  migration diagnostics.

### Out of scope

- Authentication, authorization, tenancy, role, subscription, school/class
  membership, and permission encoding.
- Secrets, credentials, emails, phone numbers, provider subjects, or personal
  information.
- Public access tokens, invitation tokens, QR payloads, and reset tokens.
- Replacing existing UUIDs solely for aesthetic consistency.
- Every ephemeral event, local draft, cache key, or idempotency key.

## 3. Default identifier policy

| Use case | Identifier policy |
|---|---|
| Durable cross-product EdLove entity | EdLove UUIDv8 after its entity family is registered here. |
| Existing durable entity | Preserve its existing primary key. Add a mapped EdLove ID only through an approved migration. |
| High-volume operational/event row without cross-product identity | UUIDv7 generated at the authoritative write boundary. |
| Provider or channel subject | Provider-scoped opaque text in a binding table, never rewritten into an EdLove UUID. |
| Capability, invite, password-reset, QR, or session value | Dedicated random/cryptographic token format; never a predictable UUID. |
| Offline provisional record | A local provisional ID plus reconciliation mapping. It is not automatically an authoritative EdLove ID. |

## 4. EdLove UUIDv8 layout, version 1

The only RFC-fixed fields are the version and variant. EdLove assigns every
other bit as follows. Fields use network byte order.

```text
bits  0..47   issued_at_ms       48-bit Unix epoch milliseconds
bits 48..51   version            0b1000 (UUIDv8)
bits 52..55   domain             4-bit EdLove domain category
bits 56..63   subtype            8-bit immutable entity subtype
bits 64..65   variant            0b10 (RFC 9562/IETF variant)
bits 66..71   mint_origin        6-bit non-authoritative producer class
bits 72..127  entropy            56 CSPRNG bits
```

The tuple `(issued_at_ms, domain, subtype, mint_origin, entropy)` is the
collision domain. The generator must use a cryptographically secure random
source, retry a uniqueness violation, and emit an operational alert; UUIDv8
does not provide an RFC-level uniqueness guarantee by itself.

### Profile-v1 conformance vector

The cross-language baseline uses these input bytes and its exact textual UUID:

| Field | Value |
|---|---|
| `issued_at_ms` | `0x0123456789ab` |
| `domain` / `subtype` | `Identity` / `account` (`0x1` / `0x01`) |
| `mint_origin` | `central-production` (`0x00`) |
| entropy | `00 01 02 03 04 05 06` |
| UUID | `01234567-89ab-8101-8000-010203040506` |

This vector verifies byte layout only; the all-zero-leading entropy is
deliberately deterministic test data and must never be used by an issuer.

`mint_origin` is diagnostic only. It cannot grant trust, determine tenancy, or
change authorization. The receiving server authenticates the producer and
validates the record independently.

## 5. Segmentation registry

The segmentation is intentionally coarse. It identifies what kind of durable
EdLove entity was minted, not what a person is allowed to do.

| Domain | Hex | Meaning | Initial subtype examples |
|---|---:|---|---|
| Reserved | `0x0` | Invalid/unassigned | None |
| Identity | `0x1` | Persons and their durable identity infrastructure | `0x01` account, `0x02` credential binding, `0x03` device identity, `0x04` workload principal |
| Education | `0x2` | Institutions and learning structures | `0x01` school, `0x02` classroom, `0x03` academic cycle, `0x04` subject |
| Learning record | `0x3` | Durable educational records | `0x01` grade mark, `0x02` attendance record, `0x03` submission |
| Relationship and custody | `0x4` | Durable bonds and delegated custody | `0x01` membership bond, `0x02` guardian relationship, `0x03` delegation grant |
| Knowledge and publishing | `0x5` | Durable editorial/library knowledge | `0x01` work, `0x02` edition, `0x03` collection |
| Operations and autonomy | `0x6` | Auditable durable system records | `0x01` operation receipt, `0x02` audit event, `0x03` outbox operation |
| `0x7`–`0xE` | Reserved | Allocated only by an EdLove architecture decision | None |
| `0xF` | Test | Explicit test-only entities; rejected by production ingress | Test subtype registry |

Initial mint-origin values: `0x00` central production, `0x01` central
non-production, `0x02` trusted regional/edge issuer, `0x03` approved mobile
offline issuer, `0x04` approved browser-offline issuer, `0x05` approved agent
issuer, and `0x3F` test. All other values are reserved. Offline origin codes
do not authorize client minting; they identify a separately approved issuer
and reconciliation protocol.

## 6. Generator and privacy requirements

1. The initial authoritative generator is server-owned and implements profile
   version 1 exactly. No JavaScript `Math.random()` or hand-rolled fallback is
   permitted.
2. Database generation and TypeScript generation must share conformance test
   vectors. A third implementation may be added only after the same suite
   passes.
3. The generator detects clock rollback. It must hold or advance a logical
   timestamp rather than knowingly issue a value below its previously issued
   timestamp; it must alert if the drift exceeds the configured threshold.
4. Every generated value is validated before persistence: UUID syntax, IETF
   variant, version 8, registered domain/subtype, and authorized mint origin.
5. UUIDs expose millisecond-scale creation time. They are unsuitable as secret
   bearer values. Public flows requiring unguessability use dedicated
   cryptographic tokens.
6. Entity metadata remains in typed columns. The ID is never parsed in a
   browser to decide access or product behavior.

## 7. Governance and change control

EdLove architecture owns this registry. Adding a domain, subtype, origin, or a
new layout version requires an ADR containing the entity owner, durable use
case, data classification, generator, offline/replication analysis, migration
plan, test vectors, and rollback behavior. Existing assignments are immutable.

Gurudevi may request subtypes, but it cannot redefine the layout or reuse a
retired value. Other EdLove products receive the same rule. A subtype is not
created merely because a table exists; conventional columns are preferred when
the value is not a durable cross-product boundary.

## 8. Adoption sequence

1. Add conformance tests for the profile; do not alter database IDs yet.
2. Implement the server generator and validation boundary with collision retry
   and audit telemetry.
3. Register `Identity/account` first, then introduce `public.users.edlove_id`
   as a nullable, unique additive secondary key. It maps to the existing
   canonical `public.users.id`; it does not replace the primary key, provider
   bindings, or foreign keys.
4. Prove provider-subject-to-EdLove-account resolution across web, mobile, API,
   AI, and channel ingress.
5. Consider offline minting only after device-key custody, clock, collision,
   and reconciliation evidence exists.

The program order is maintained in
[`edlove-identity-convergence-program.md`](edlove-identity-convergence-program.md).
The bounded first implementation slice is maintained in
[`2026-10-23-edlove-uuidv8-foundation-implementation-plan.md`](../current_progress/2026-10-23-edlove-uuidv8-foundation-implementation-plan.md).

## References

- [RFC 9562, UUID Version 8](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.8)
- [Gurudevi authentication and sovereign identity authority](authentication-and-sovereign-identity.md)
- [EdLove Identity Convergence Program](edlove-identity-convergence-program.md)
- `docs/architecture/2026-10-22-sovereign-identity-omnichannel-and-uuidv8-architecture.md`
