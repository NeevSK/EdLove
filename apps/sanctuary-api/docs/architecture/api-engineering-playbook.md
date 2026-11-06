---
title: "API Engineering: First Principles to Verified Implementation"
status: "active"
created: 2026-10-30
updated: 2026-11-03
author: "Naveen"
scribe: "Codex"
tags: [api, engineering, architecture, verification, playbook]
---

# API Engineering: First Principles to Verified Implementation

## Owner direction and horizontal delivery contract (2026-11-03)

Build the shared horizontal foundations before any business vertical slice. Earlier
references below to a first slice describe later product admission, not the current
verification strategy. No school, learning or wellbeing feature is selected to drive
this work. Synthetic capabilities exercise shared machinery without admitting product
policies or adding product endpoints.

Generalization means a single implementation of each common guarantee, with explicit
domain-owned inputs. It does not mean a universal CRUD endpoint, an arbitrary table
name from a caller, a universal retention period, or an agent with unrestricted access.
Use four independent synthetic ownership cases where applicable: person-owned,
institution-owned, explicitly shared, and operational records. Exercise more than
one tenant, actor and concurrent worker; adding a fifth fixture must not require a
second implementation of the mechanism.

The dependency order below governs the current work. The layer status table remains
the status authority; acceptance requires executable evidence, not folders or types.

| Foundation | Shared guarantee and extension input | Required acceptance scenarios |
| --- | --- | --- |
| Runtime and admission | Bounded connections, bodies, authentication, in-flight work and shutdown; deployment supplies limits | Saturation before expensive work, cancellation with ongoing work, malformed input, probes during overload, recovery |
| Authority execution | Verified account, live bond, resource policy and scoped SQL in one execution boundary; modules supply capability and resource resolver | Cross-tenant denial, forged scope, revoked/expired identity, concurrent bond change, policy failure; neither channel nor worker bypasses the boundary |
| Durable commands | One receipt identity, payload fingerprint, transaction and outcome model; modules supply deterministic mutation and effect intent | Concurrent duplicate, different payload with same key, rollback, unknown commit, restart and replay; no blind replay of uncertain external effects |
| Fair resource budgets | Independent account, institution, workload and deployment budgets; trust-boundary code derives budget keys | Noisy tenant, distributed limit across replicas, quota-store outage, reconnect storm, bounded retry; caller cannot invent a tenant or priority |
| Audit | Transaction-bound accepted-command evidence, sensitive-read evidence and separately durable denial/failure records; modules declare sensitivity and reason requirements | Commit/audit atomicity, denied transaction rollback, append-only permissions, chain verification, audited reads, redaction, unavailable audit storage |
| Record lifecycle | Version checks, correction links, tombstones, restore, retention, holds and erasure coordination; modules declare record class and approved policy | Stale version, concurrent corrections, hold versus purge race, expired restore window, sync tombstone, backup expiry and export interactions |
| Consent and delegation | Scoped, revocable, expiring grants with current authority checks; modules declare purpose and action | Revocation during execution, delegation cannot exceed delegator, guardian transition, expired grants, cross-channel confused deputy |
| Durable workers and ingress | Verified ingress, deduplication, leased/fenced attempts, bounded retries, poison-message isolation and explicit reconciliation | Duplicate delivery, worker death before/after send, lease takeover, provider outage, forged/replayed webhook; no channel-specific mutation logic |
| Portability | Versioned open records, stable identifiers, paginated export, checksummed manifests, controlled import and documented omissions | Independent reader round trip, references and originals preserved, interrupted export/resume, revoked download, no cross-owner leakage |
| Operations and release | Reproducible artifact, migration compatibility, restore and incident procedures, external probes and measured objectives | Rolling deployment, mixed policy versions, pool exhaustion, backup restore, key rotation, dependency outage, rollback/forward recovery |

No foundation may claim completion using only mock evidence where persistence,
concurrency or delivery is part of its guarantee. Use the actual Node host and isolated
PostgreSQL for those scenarios. Hosted identity, providers and deployment require
separate named evidence. No local test grants production readiness.

### Adaptive server control boundary

First establish fixed limits and observations. Then evaluate a server-specific
controller in observe-only mode before allowing bounded actuation. The existing
client Verger host is not a server implementation. Reuse of its pure core requires
its own compatibility and stability evidence.

An eventual controller may reduce optional workload concurrency, pace workers and
restore capacity gradually. It may never widen authority, omit required audit,
weaken durability, silently drop accepted work or treat unknown telemetry as unlimited
capacity. Critical classes still have hard limits and need reserved capacity rather
than an unbounded bypass. Local admission, fleet quotas and infrastructure autoscaling
have separate ownership and time scales; prove their combined stability under lag and
failure before enabling feedback. The static protections remain active when adaptation
is disabled. Redundancy and external incident monitoring stay outside the process.

See [scale and production operation](api-foundations/scale-and-production-operation.md)
for the national design horizon and the distinction between population and concurrency.

This is the **how** entry point. [What](api-landscape.md) supplies vocabulary and
research. The [canonical model](api-domain-and-channel-model.md) owns adopted API
policy. The owner has resumed horizontal engineering; business admission remains
deferred. This playbook does not select every researched library. Its requirements are a work sequence, not
claims that the reset foundation already satisfies them.

For unfamiliar terms such as DTO, idempotency, receipt or outbox, keep the
[short glossary](api-foundations/vocabulary-and-history.md#terms-we-should-use-precisely)
open alongside the relevant section.

## Operating boundary and current state

Keep one modular monolith and one native first-party command/query transport at
`/api/v1`. Approved external protocols can have explicit adapters; a webhook or
MCP request does not have to use the oRPC wire format. Every adapter must invoke
the same owned application capability and preserve its authority and semantics.
In-process calls are preferable to unnecessary loopback HTTP inside the service.

The current native contract admits the read-only identity.session and
identity.scopes foundation procedures. The Hono host has no admitted business
procedures. Required-mode identity/Cedar,
account-scoped SQL, shared quotas and durable receipt/outbox mechanisms now have
isolated PostgreSQL scenario evidence. Hosted identity ceremonies, domain-capability
admission and provider channels remain unverified. Required-mode readiness probes selected dependencies; it is not comprehensive
database or product readiness. Existing app consumers of retired clients remain
rebuild work. No feature coverage, provider delivery or production readiness is
established by this guide.

The [runtime foundation checkpoint](api-foundations/runtime-foundation.md) records
implemented host guarantees, configuration, evidence limits and the remaining
identity/policy/persistence prerequisites before the business round.
The [interoperability and operation module](api-foundations/interoperability-and-operation-semantics.md)
defines canonical UUIDv8 identity boundaries, replay/concurrency semantics and
standards at the appropriate protocol boundary.
The [authority and durability checkpoint](api-foundations/authority-and-durability.md)
records the implemented security/data/receipt/outbox seams and their exact limits.

## Production foundation work order (2026-10-31)

This playbook is the shared implementation plan; the canonical model owns policy
and PJC holds linked journey requirements. Update the existing checkpoints as
work lands rather than creating a second status ledger. Advance implementation
and verification together, starting with security and production operation.

1. **Baseline and secure startup:** compare source, deployment configuration and
   current evidence; reject unsafe production configuration, keep secrets external,
   and distinguish dependency readiness from liveness. Verify real entry behavior.
2. **Exercise the assembled runtime:** use the production Node host, native client
   and isolated real PostgreSQL together for identity and authority scenarios,
   including denial, revocation, dependency failure and shutdown where applicable.
   Record synthetic identity providers and incomplete migration coverage honestly.
3. **Harden shared execution:** establish bounded unauthenticated and authenticated
   resource use, safe failures, scoped policy/data access, concurrency, idempotent
   receipts, uncertain outcomes and outbox recovery. Account quotas alone do not
   protect authentication or the deployment edge. Specify trust and capacity before
   choosing edge controls; do not trust unverified forwarded addresses.
4. **Operational readiness:** verify the actual deployment, proxy/TLS, hosted
   identity lifecycle, observability, backups/restores, migrations and recovery;
   measure representative workloads and failure behavior before readiness claims.
5. **Modular capability admission:** once the necessary horizontal boundaries are
   evidenced, admit bounded domain capabilities with named ownership, explicit
   lifecycle and correction, transactional invariants, policy, privacy and client
   scenarios. Use the PJC records, not a separate catalog. A foundation mechanism
   cannot decide a domain's retention, consent or authority rules.
6. **Interoperable channels:** admit clients, offline synchronization, provider
   ingress and approved agent tools against owned capabilities and current authority.
   Establish delegation, approval, replay, budgets and protocol-specific security;
   tool discovery or model output never grants permission. Existing web/mobile
   consumers and external integrations must be assessed individually.

Prefer executable scenarios through real local runtime and persistence for important
boundaries. Retain focused unit and fault-injection tests when they cover behavior
that is costly or unsafe to reproduce; do not substitute mocks for database, host,
provider or deployment evidence. Every checkpoint records exact commands, revision,
scenario, dependencies and substitutions. No local run alone certifies production.

### Foundation acceptance: permission to build domains

The foundation is ready for domain and channel development when all of the
following are met, with linked commands, source and results for the current tree:

- The production host fails closed on unsafe configuration; startup, readiness,
  shutdown, safe errors and request/connection limits have exercised failure paths.
- Verified account and current relationship facts reach one scoped authorization
  and data boundary; missing, revoked, cross-tenant and unavailable-authority
  cases fail safely. Real database isolation and concurrency are exercised.
- Durable commands have tested duplicate, conflicting payload, concurrent retry,
  rollback and unknown-commit recovery semantics. Applicable effect intents are
  transaction-bound, with bounded retry, fencing and explicit repair of uncertainty.
- Client and channel admission describes the trusted identity/delegation boundary,
  cancellation, retry and authority handoff; contracts cannot bypass domain policy.
  No future provider or agent integration is represented as implemented.
- Native client, production Node host and isolated PostgreSQL are exercised together,
  including negative cases; documented substitutions and any intermittent failures
  are resolved or explicitly scoped. Architecture/type/build and relevant quality
  gates have actual results, with any unrelated workspace failures identified.
- Each remaining external dependency, unresolved product decision and deployment
  check has a named owner or next action, consequence and admission condition. No
  unbounded generic infrastructure or domain-specific rule is needed for this gate.

This is a **development admission** milestone, not a production launch decision.
Hosted authentication, complete migrations, proxy/TLS and edge controls, backups,
restore, observability, load and actual deployment need their own evidence before
production release. A domain capability must separately prove its own authority,
privacy, lifecycle, correction and client journeys before it is released.

### Current implementation checkpoint

Production configuration rejects disabled or omitted authentication; development
and test may still run transport-only. The composition gate admits exactly the two
identity procedures and rejects unreviewed procedures. A database scenario exercises
the actual identity router and native client over a Node loopback socket with real
isolated PostgreSQL; it substitutes synthetic signing keys and a minimal Auth schema.
Consult the current test run for results, including any failing scenarios. On
2026-11-01 the owner reaffirmed a breaking reset: the old shared contracts,
clients and API modules were retired, with independent utilities separated from
the API surface. The former prototype-patching RPC client is gone and the static
composition audit passes. This does not establish that the wider workspace builds:
core and app consumers still reference retired identity, device-trust, sync and
domain APIs. Rebuild those against owned capabilities as they are admitted; do not
restore legacy aliases or claim existing screens work. Hosted identity, full
migrations, edge protection and deployment remain separate evidence.

Working-tree check on 2026-11-02: `pnpm audit:api-composition` fails (259
`legacy-source`, 60 `type-escape`, 1 `legacy-converter`) because 266 of the 272
client-side files on the reset list are still in `packages/core/src/api`, and
`pnpm run check-types` stops on 36 errors in `@repo/core` from the manager removal.
The statement above that the audit passes describes an earlier tree.

## Horizontal layers: the base every domain stands on

The [road to v1](../../../../docs/architecture/road-to-v1.md) orders these into gates with evidence.

Domains are built on these layers, like bricks on a base plate. A domain card
(see the [domain design method](../../../../docs/architecture/domain-design-method.md))
names which layers it needs and isn't admitted until they are ready. The work order
above says how each layer is hardened and proven; this table says what the layers
are and where each stands. Update the status here as evidence lands; don't start a
second ledger. The rules for layers 5 to 7 are in
[data governance and records](../../../../docs/architecture/data-governance-and-records.md).

| # | Layer | What it gives every domain | Status (2026-11-02) |
| --- | --- | --- | --- |
| 0 | Runtime host and configuration | Safe start and stop, config that fails closed, request and connection limits, safe errors | Partial: `config.ts`, `node-server.ts`, foundation tests |
| 1 | Identity and sessions | The verified canonical account and session on every call | Built: `identity.session` |
| 2 | Bonds and authority | Active bond and capacity, Cedar decision, data scoped to what was allowed | Partial: `identity.scopes` lists bonds; `security.authorize` runs the role-shaped Cedar engine for account commands; `security.authorizeCapability` runs the domain-namespaced engine (default deny) with citizenship on each bond. `authority.refreshSnapshot` issues signed offline snapshots (2026-11-02); the apps do not call it yet |
| 3 | Durable operations | Idempotent commands, receipts, unknown-outcome recovery, outbox and effects | Partial: `operations/store.ts`, `dispatcher.ts`, uncommitted migration `20261030020000_api_operation_foundation.sql` |
| 4 | Request budgets | Per-person and per-institution budgets, back-pressure for the morning burst | Partial: uncommitted migration `20261030022000_api_request_budgets.sql` |
| 5 | Audit trail | Append-only, chained record of every command and sensitive read | Not started |
| 6 | Records lifecycle | Versions, corrections, soft delete and restore, legal hold, retention jobs, erasure | Not started |
| 7 | Sharing grants and consent | Private by default; grants, guardian consent and minors' rules evaluated with bonds | Not started |
| 8 | Time and academic calendar | Institution time zones, academic years, terms, timetables | Not started on the server |
| 9 | Device trust and delegation | Device trust levels and agent delegation as inputs to authority | Partial: device pairing migration; trust levels not settled |
| 10 | Events and notification intent | Published domain events; delivery as a separate service | Not started on the server |
| 11 | Files | Stored objects with access through authority | Not settled after the reset |
| 12 | Exports | Person and institution exports in open and standard formats; see [data portability](api-foundations/data-portability-and-education-standards.md) | Not started |
| 13 | Observability and operations | Request and operation identifiers through logs, traces and audit; readiness; deployment that doesn't sleep | Partial |
| 14 | Agent provenance and runtime contract | Audit records channel, agent and delegator; agents are Cedar principals; long jobs return a run id; budgets can count cost. See [agent infrastructure layer](../../../../docs/architecture/agent-infrastructure-layer.md) | Not started |

Layers 0–7 are needed before the first domain is admitted. Layers 8–13 can follow
the first domains, but each domain card says which of them it needs.

## Responsibilities before dependencies

| Boundary | Responsibility | Common mistake |
| --- | --- | --- |
| Experience | Intent, steps, feedback, recovery and accessible alternatives | Making a screen layout own business rules |
| Contract | Canonical input/output/error schemas and behavior | Returning raw ORM records or hand-writing a parallel client |
| Application capability | Coordinate rules and changes under a named actor | Letting a channel handler become a second business implementation |
| Identity and policy | Verify account, relationships, scope and permitted action | Trusting client role labels or agent-selected actors |
| Persistence | Constraints, transaction, concurrency and correction | Assuming a Zod parse proves a record is authorized |
| Effects | Durable intent, dispatch, provider state and repair | Reporting delivery from a log line or initial send attempt |
| Operations | Budgets, deadlines, cancellation, redacted observability and readiness | Treating a successful empty-route benchmark as product assurance |

Reuse SDK responsibilities. Hono hosts HTTP; oRPC supplies native dispatch,
serialization and contract/client inference; Zod validates boundaries; Cedar
evaluates policy. Existing data packages remain data authorities. Effect is an
application composition option, not a new API protocol. Add adapters or libraries
for a named missing responsibility, never simply to make the diagram symmetric.

## Phase 1: ground the selected stack

Inventory manifest declarations, lockfile resolution and actually installed
packages separately. Inspect public exports/declarations and selected release
notes. Resolve package cohorts, peer requirements and runtime compatibility.
The [dependency research module](api-foundations/dependencies-and-evidence.md)
contains a dated snapshot, not permanent latest-version truth.

For an adopted upgrade, follow the repository's cautious upgrade and stack-map
workflow, verify the affected seam, and record substitutions/limitations. Do not
upgrade during this research phase. Do not repair removed clients with broad
`any`, old facade exports, a converter or a silent alternate route.

## Phase 2: specify the horizontal foundation

Define the boundary contracts and negative scenarios before selecting feature
procedures. A horizontal capability may have its own small contract; it must not
become a catch-all business domain.

| Foundation | Required behavior | Negative/recovery scenarios |
| --- | --- | --- |
| Native transport | One client/server prefix, native serialization and declared errors | Unknown procedure, retired path, malformed body, unsupported method, oversized request |
| Request context | One verified account context with correlation and cancellation | Invalid/expired identity, account switch, missing or revoked relationship |
| Policy/data access | Trustworthy facts and explicit scoped enforcement | Cross-owner/tenant access, stale role, missing policy, authority-store failure |
| Resource budgets | Bounded work, distributed limits where needed and honest deadlines | Contention, overload, slow storage/provider, aborted stream and retry storm |
| Failure contract | Stable safe errors with recovery classification | No fake empty/success results; internal failure does not leak sensitive content |
| Operations | Meaningful liveness/readiness, startup configuration and graceful shutdown | Bad config, required dependency down, drain deadline |
| Durable operations | Explicit commit, conflict, replay and uncertain-outcome semantics | Duplicate request, changed payload, concurrent retry, lost response after commit |
| External effects | Transaction-bound intent when required, provider states and repair | Crash before/after send, duplicate delivery, revoked consent and reconciliation |

Do not label an unwired port or schema as functioning infrastructure. No feature
is admitted merely because these interfaces compile. Distributed guarantees need
their actual persistence and runtime seams verified.

## Phase 3: define one owned capability

Start from the [rule/decision method](api-foundations/domain-rules-and-decisions.md).
Load only the relevant PJC journey, rules, schemas, policies, callers and platform
constraints. Establish preconditions, transaction boundary, correction path,
public DTOs, expected errors and feedback. Distinguish setup, everyday use and
recovery; identify unknowns before granting authority.

Use the native contract and SDK `implement` to preserve client/implementation
agreement. Declare safe outputs and errors. Resolve actor identity server-side;
target record IDs are requests to access a subject, not evidence of permission.
Validate resource facts, Cedar decisions and object-level data access as applicable.

Keep a single explicit composition point. Do not freeze business domains to the
navigation labels or add both flat and nested aliases. Admit the capability only
after its contract, implementation and necessary client path are verifiable.

## Phase 4: settle state and failures

Define known outcomes, including committed/replayed, rejected, conflict,
in-progress and uncertain where appropriate. A timeout or disconnect cannot prove
that a mutation did not commit. Bind operation keys to actor/capability/payload
semantics; design retention and concurrent claims. Preserve required constraints
and audit/receipt coupling in the same transaction when they share a database.

An outbox persists intended external work; its worker needs duplicate handling,
retry ownership, bounded backoff, cancellation/revocation rules, provider status
and reconciliation. Do not promise universal exactly-once execution. Separate an
external provider's acknowledgement from final delivery and business completion.

For offline work, retain local pending intent separately from server acceptance.
A cached Cedar snapshot can guide local affordances within its contract, but it
cannot grant permanent server authority. Reauthorize uploads against current
facts, classify conflicts, and let people see/recover pending or rejected work.
Do not import native storage/PowerSync into the browser web app contrary to repo
boundaries. Record each platform's real persistence and sync behavior.

## Phase 5: admit a channel or agent tool

Follow the [channel admission model](../../../../docs/architecture/channel-admission-model.md#admitting-a-channel)
and its checklist. Use [the channel module](api-foundations/channels-and-agents.md) to identify the
actual boundary. Specify credential/binding, audience, delegated scope, consent,
approval, expiry, rate/cost budgets and revocation. Tools must call the owned
capability, not raw generic SQL or an independent mutation implementation.

For bots, verify provider input and durably deduplicate before resolving a
supported user intent. For remote MCP, curate discovery and invocation, and
enforce authorization independently of the model. For browser WebMCP, normal UI
must remain available when unsupported. For AG-UI, validate event/state boundaries
and ensure displayed progress matches actual operation state. A streamed run-end
event does not itself prove a domain commit.

An agent proposal must identify the exact intended action. When approval is
required, bind it to the reviewed payload, actor, scope and expiry; changed work
requires fresh evaluation. Treat retrieved content and tool descriptions as
untrusted input. Keep product records, model memory and search indexes distinct;
revoke or re-filter derived access when source permissions change.

## Phase 6: verify the real seam

| Evidence | What to exercise | Limit to report |
| --- | --- | --- |
| G0 static | Strict types, native composition, forbidden legacy surfaces, schema/reference checks | No runtime correctness proof |
| G1 boundary | Valid/invalid DTOs, denial, errors and transport using stated substitutions | Mocks may hide real provider/storage behavior |
| G2 scenario | Stateful commit/replay/conflict/recovery; applicable real database and concurrency seams | Name all remaining substituted parts |
| G3/G4/G5 | Component, browser/bundling and physical-device behavior where applicable | Do not substitute a host fixture for real platform evidence |
| R1 | Approved deployed canary, observability, rollback and soak | No claim from an undeployed or empty foundation |

Follow [production evidence governance](../../../../docs/architecture/production-evidence-governance.md).
No skipped promotions or unqualified test-pass claim. Report exact command,
revision, environment, scenario, result, substitutions and limitations. Inspect
the raw diff, especially removed guards and fallback semantics. User-authorized
retirement does not justify silently losing required domain behavior.

Measure real workloads as described in the [evidence module](api-foundations/dependencies-and-evidence.md).
Include latency distributions and errors, not throughput alone. Redact telemetry
by design; correlation IDs do not justify capturing learner content, credentials
or unbounded prompts. A green static gate is admission evidence for its narrow
rules, not certification of the application.

## Small handoffs that retain context

Each task should identify: actor intent; owning capability; adopted rules and
open decisions; relevant existing files/types; allowed changes; scenario and
verification commands; required evidence; and next unresolved seam. Delegate
bounded ownership, preserve other workers' edits, and reuse context-owning agents.
The parent reviews integration and actual diffs rather than accepting summaries.

Use PJC links for discoverability. A compact reading set is this playbook, the
relevant knowledge module, one journey thread and its source authorities. Do not
ask either the owner or an agent to hold the whole system in memory. Architecture
remains coherent through stable ownership, references and executable checks,
not an enormous copied prompt.

## Decisions still held for the owner

The [decision module](api-foundations/domain-rules-and-decisions.md) and canonical
ledger contain product questions about channel scope, tool exposure, privacy,
institutional rules and external interoperability. Explain each with a concrete
user situation and consequences. Engineering can prepare facts and a proposal;
it cannot manufacture consent, approval or domain authority to fill a gap.
