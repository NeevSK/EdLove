---
title: "API Interoperability, Identity and Reliable Operation Semantics"
status: "active"
created: 2026-10-30
updated: 2026-10-31
author: "Naveen"
scribe: "Codex"
tags: [api, interoperability, identity, idempotency, standards, architecture]
---

# Interoperability, identity and reliable operations

The supplied advice's lightweight contracts and ownership approach fits our
modular monolith. Its premise that named modules already operate through a live
API does not match the reset source. Its effort/pricing estimates are not a
verified project budget. Its course-completion notifications and cross-module
updates are examples, not approved product rules or consent to disclose data.

Interoperability means a consumer understands an operation's meaning, authority,
outcomes and recovery. Shared JSON alone does not establish it. This module
specifies the engineering target and existing authorities; it does not claim
those mechanisms run in the new API.

## Client transport admission checkpoint (2026-10-31)

The v1 link validates each resolved destination using the shared Core transport
policy and requests redirect refusal, including for injected fetch. Existing
callers keep their original helper exports. Same-origin browser requests resolve
against the page origin; callers without a browser origin must provide one.
A Node loopback scenario verifies a direct authenticated RPC, refusal of an HTTP
redirect with zero requests at a second listener, and production HTTP rejection
before dispatch. This uses Node fetch and does not establish browser or native TLS
behavior. A noncompliant injected fetch may follow a redirect before returning:
checking the response cannot undo that disclosure. Native TLS and redirect behavior must be
verified on each admitted platform; no device or hosted identity claim follows
from host fixtures. The legacy prototype patch coexistence risk and current
composition-gate failure remain separate concerns.

## Canonical account versus authenticated actor

The [EdLove UUIDv8 profile](../../../../../docs/architecture/edlove-sovereign-uuidv8-specification.md)
owns minting and layout. `public.users.id` is the immutable canonical account
UUIDv8. Provider subjects remain credential bindings in `auth_identities`;
domain SQL resolves `public.get_my_id()`. The [cutover record](../../../../../docs/current_progress/2026-10-25-canonical-uuidv8-account-cutover.md)
and [migration](../../../../gurudevi-mobile/supabase/migrations/20261025010000_canonical_uuidv8_accounts.sql)
show the database default, profile constraint, immutability trigger and signed
`canonical_account_id` hook. Historical API results there concern the pre-reset
API, not a presently admitted identity resolver.

An ID identifies; authentication proves who is acting. Verify the credential or
session, then resolve its active canonical binding. The selected trust boundary
must check issuer, audience, signature/allowed algorithms, validity, key rotation
and revocation semantics. Client account IDs, email matches and unverified claims
are not evidence. Do not fall back from a missing canonical binding to a provider
subject as the account key.

Keep account, credential subject, membership/tenant, acted-for person, workload
principal and delegation distinct. Cedar/ReBAC evaluates authoritative resource
and relationship facts; UUID bits and role labels grant nothing. Flags govern
rollout, entitlements govern available product capacity, and Cedar governs
permission; none substitutes for the others. Cached snapshots guide local
affordances but cannot permanently authorize server uploads.

[RFC 9562 §5.8](https://www.rfc-editor.org/rfc/rfc9562.html#section-5.8) permits
UUIDv8, but custom layout/uniqueness remain implementation-specific. Partners
should treat IDs as opaque references. Where privacy requires partner-scoped IDs,
map them explicitly rather than exposing a globally correlatable key everywhere.
[OIDC issuer/subject and pairwise IDs](https://openid.net/specs/openid-connect-core-1_0.html#SubjectIDTypes)
and [OAuth security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
can coexist with our internal account key. Owning account IDs does not require
inventing a new credential protocol or authorization server.

## Idempotency is an operation contract

A lost response can follow a successful commit. A key alone cannot prevent a
retry from repeating the business effect. Each mutation needs these decisions
and executable scenarios:

1. **Identity:** account, effective scope, capability/version and operation key.
   Reuse the key for retries of the same intent; changed work is a new intent.
   A payload hash alone is not a key: identical legitimate actions can occur twice.
2. **Fingerprint:** deterministic normalized values that affect the action.
   Specify defaults, omitted/null fields, ordering and canonical encoding. Do not
   assume adapters serialize identically or put private payloads in logs/keys.
3. **Concurrent claim and transaction:** durable uniqueness must coordinate the
   receipt with the business write and applicable audit/outbox intent. An in-memory
   map, preflight lookup or linked test cannot establish that guarantee.
4. **Outcomes:** first execution, matching replay, changed-payload conflict,
   in-progress, rejected and uncertain result. Timeout is not proof of non-commit
   or permission to repeat the action with a fresh key.
5. **Replay authority:** verify the caller and current access before revealing a
   stored result. Never re-execute a committed effect after revocation or disclose
   its old result merely because its key is known. Preserve the receipt while
   defining a safe status/recovery response.
6. **Retention/recovery:** publish key lifetime, result retention, repair and
   expired-key behavior. Never retry stale pending work blindly without checking
   whether its effect committed.

The [existing receipt migration](../../../../gurudevi-mobile/supabase/migrations/20261014120000_operation_receipts.sql)
defines account/capability/key uniqueness, payload hash, statuses and revoked
direct client grants. Inspect it before inventing a store. Its existence does not
prove the reset API uses it. Resolve the missing-ORM parity finding by establishing
the actual SQL authority, not by creating a fake ORM model.

[RFC 9110 §9.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)
defines HTTP idempotent-method semantics; an RPC `POST` needs its own operation
contract. Checked 2026-10-30: [Idempotency-Key draft-08, dated 2026-10-22](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-08)
is an active Internet-Draft, not a published RFC. An approved HTTP adapter may
map that header to the same operation identity. Native oRPC keeps its SDK wire
format; a header does not create an independent mutation implementation.

## Other necessary contracts

| Responsibility | Required semantics |
| --- | --- |
| Ownership | One module owns each fact/correction; explicit capabilities or read models, not unrestricted shared table writes |
| Concurrency | Expected revision/constraints and explicit conflicts; idempotency does not prevent different operations overwriting each other |
| Evolution | Separate API generation, DTO schema, event version and database migration; review changed meanings, not just type assignability |
| Data meaning | Specify time zones/local dates, units, amount precision/currency, nullability and identifier scope |
| Queries | Stable pagination/order, collection authorization, scoped filters, bounded query cost and safe cache invalidation |
| Batches | Declare atomic versus per-item results and recovery; transport batching is not a DB transaction |
| Failure/retry | Stable safe errors, retry ownership, bounded backoff/jitter, deadlines and uncertain-operation recovery |
| Effects | Transactional outbox where needed; deduplicating consumers, bounded retry and reconciliation; no universal exactly-once delivery promise |
| Events/webhooks | Producer-owned meaning/version, source/event ID, causation, schema and minimal payload; verification and durable ingress dedup where applicable |
| Privacy | Purpose, consent, retention/deletion, partner/delegation scope and access-controlled audit; wellbeing is not a general event feed |
| Observability | Distinct request/operation/event identities, redaction and bounded cardinality/retention; correlation is not authentication |
| Compatibility | Exercise each admitted adapter against the same capability, denial, replay, conflict and recovery scenarios |

Internal calls can stay in-process. Asynchronous work does not require a broker
on day one. [CloudEvents 1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md)
can describe an external envelope; it does not provide delivery, ordering or
authorization. [W3C Trace Context](https://www.w3.org/TR/trace-context/) propagates
tracing, not identity/consent. Neither is integrated by this document alone.

## Standards at the correct boundary

First-party clients keep native oRPC v2 contracts, inferred SDK clients and
native errors. Zod v4 remains our boundary-schema authority. JSON Schema is an
interoperable projection where needed, not a replacement for transformations or
resource authorization. [2020-12](https://json-schema.org/specification) is the
current published dialect checked for this research.

[OpenAPI 3.2.1](https://spec.openapis.org/oas/v3.2.1.html), published 2026-09-10,
describes HTTP interfaces. An approved partner surface could use an SDK adapter
and generated description of the same owned capabilities. Verify exact SDK
support before selecting output versions; latest specification does not prove
installed generator support. The retired generator's unsafe cast and obsolete
topology are not an argument against a future approved OpenAPI surface.

[RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) is suitable
to evaluate for an external HTTP error boundary. Do not wrap native SDK errors
in it and break their protocol. MCP, AG-UI, LTI and OneRoster also need actual
consumers and approved scope; see [channels](channels-and-agents.md).

The sequence remains: verified runtime → canonical identity and scoped Cedar/data
admission → durable operation/concurrency/effect controls with synthetic scenarios
→ bounded business capabilities → required external interoperability. The
[runtime checkpoint](runtime-foundation.md) states what is actually implemented.
