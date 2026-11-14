---
title: "Layered API Platform Roadmap and Real Deployment Options"
status: "draft"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [roadmap, modular-monolith, api, database, real-options, finance, phases]
---

# Layered API Platform Roadmap and Real Deployment Options

## Purpose

The Sanctuary API needs several layers of documentation and planning between vision and code. A single “target architecture” is too abstract to implement and too rigid to fund. This document defines the stack of decisions, the modular-monolith shape, the database/API decoupling seam, financially real deployment options, and phase gates.

This is a planning document, not an approval to rewrite the API, split services, add GraphQL, or purchase infrastructure. It preserves the existing Hono + oRPC direction and makes future choices reversible where that is economically sensible.

## Bounding triad

1. **Surface & mode:** Sanctuary API architecture and documentation; Maintain-mode planning with no product-code changes.
2. **Grounded substrate:** existing Hono/oRPC architecture, 63 core API contract files, 40 handler modules, PowerSync upload boundary, ZenStack/database clients, AI and durable-agent routes, current API capability audit, and the monorepo’s modular boundaries.
3. **Active seam & constraints:** translate the capability audit into layered artifacts and executable phases; remain a modular monolith, avoid premature microservices, preserve existing routes, and make costs/exit paths explicit.

## The governing idea: stable meaning, replaceable placement

The system should keep one meaning for a capability while allowing its execution location to change:

```text
Soul and product covenant
        ↓
Capability semantics and authority
        ↓
Application use case / lifecycle
        ↓
Transport adapters (oRPC, OpenAPI reads, channels, AI, MCP)
        ↓
Modular-monolith runtime
        ↓
Persistence ports and policy-aware data access
        ↓
Database/sync/queue/provider placement option
```

The bottom layers may change when evidence warrants it. The upper layers must not change merely because a new vendor, protocol, database, or deployment fad appears. A WhatsApp command, web button, mobile offline draft, assistant invocation, and MCP tool should converge on the same application capability and receipt semantics.

## Documentation hierarchy: from sky to executable seam

Each layer has a different question, owner, artifact, and exit condition. Higher layers authorize direction; lower layers authorize implementation.

| Layer | Question | Primary artifact | Owner role | Exit condition |
| --- | --- | --- | --- | --- |
| L0 — soul and limits | What must the system protect and refuse? | Soul/Core covenant and convivial limits | Product/stewardship | Non-negotiable principles are named |
| L1 — product world | What places, roles, doors, and outcomes exist? | Sanctuary capability map | Product + domain stewards | Boundaries and non-goals are stable |
| L2 — capability semantics | What does one capability mean independent of transport? | Capability descriptor and lifecycle contract | Domain + API | Actor, scope, effect, receipt and failure are explicit |
| L3 — system architecture | Which modules own which decisions? | Modular-monolith context map | Architect | Dependencies and authority direction are acyclic enough to review |
| L4 — data architecture | What is authoritative, local, replicated, derived, or external? | Data ownership/consistency/retention map | Database + security | Every field class has an owner and recovery path |
| L5 — deployment options | Where can the same modules run and what does each cost? | Real-options matrix and topology profiles | Operator + finance | Trigger, cost envelope, exit and support are explicit |
| L6 — phase plan | What must be proven next? | Phase charter, evidence ledger, stop conditions | Product owner | One bounded outcome and evidence tier are authorized |
| L7 — granular implementation | Which files, contracts, migrations, tests and runbooks change? | Bounded implementation plan/ADR | Engineer + reviewer | Impact set, rollback and verification commands are named |
| L8 — runtime proof | Did people, devices, providers and operators succeed? | Evidence report and incident/learning record | Operator + participants | Claimed maturity matches observed reality |

### Required document chain for any new capability

```text
Capability brief → authority/data contract → module ADR → transport adapter spec
→ persistence/consistency plan → cost/support model → test/field charter
→ bounded implementation plan → runtime evidence → decision record
```

No vendor adoption document should skip the capability brief. No code task should begin from a vendor feature page alone.

## Target modular-monolith shape

### What “modular monolith” means here

One deployable Sanctuary API can contain many strongly bounded modules. Modules share a process and may share a PostgreSQL database, but they do not share unreviewed authority. A module owns its application decisions, contracts, policy facts, persistence mapping, and events.

```text
Hono runtime shell
  ├─ identity / onboarding / active scope
  ├─ self / wellbeing / privacy
  ├─ classroom / learning studio / teacher classroom
  ├─ school / family space / institutional operations
  ├─ library / community
  ├─ messaging / notifications / provider effects
  ├─ AI proposal and agent runs
  ├─ sync / offline receipts
  └─ platform operations / audit / billing
        ↓
  application ports + policy boundary + capability registry
        ↓
  database, sync, outbox, provider and model adapters
```

### Dependency rules

1. Transport adapters call application capabilities, never arbitrary database queries.
2. Application modules may call shared policy, identity, clock, ID, telemetry, and transaction ports.
3. A module may read another module through an explicit query/projection port, not by importing its tables casually.
4. Persistence adapters may use the same physical database and transaction, but table ownership remains declared.
5. Cross-module writes require an application-level command or an explicitly documented integration event.
6. AI/automation adapters may propose or request capabilities; they do not become a second domain implementation.
7. Local sync is a client-side persistence mode, not a license to bypass server authority.
8. External providers are effects with acceptance/unknown/reconciliation states, not database truth.

### Avoid two opposite mistakes

**Mistake A: database-shaped monolith.** Every route reaches into shared tables, so “modularity” is only folders. This prevents safe database replacement and makes authorization hard to reason about.

**Mistake B: microservice cosplay.** Every module gets a network boundary, deployment, queue, and repository before independent scaling, custody, or team ownership exists. This spends money on coordination without buying resilience.

The desired seam is application-level modularity first and physical separation only when a measured trigger pays for it.

## API/database decoupling without microservices

### The decoupling target

The API should not depend on a particular database client in its public meaning. It may initially use ZenStack/PostgreSQL in the same process, but the application layer should depend on narrow domain ports:

```text
HTTP/RPC/channel/AI adapter
        → capability application service
        → policy + transaction + domain ports
        → PostgreSQL/ZenStack adapter (current)
        → future cell/local/replica adapter (only if justified)
```

This is not a generic repository pattern. A port should express a domain need—`recordLessonDraft`, `findAuthorizedClassroom`, `commitAttendanceBatch`, `enqueueFamilyNotice`—rather than expose arbitrary `findMany`/`update` operations.

### What belongs in the database

- authoritative protected records;
- uniqueness/idempotency constraints;
- transactional invariants that must hold together;
- durable operation/receipt/outbox state;
- audit metadata and provenance;
- policy facts that must survive process restart;
- derived projections whose rebuild recipe is documented.

### What does not become database authority by default

- model conversation memory;
- UI cache state;
- an assistant’s natural-language claim;
- a provider’s transient response before durable reconciliation;
- a device-local draft that has not been accepted by the server;
- analytics guesses or synthetic demo rows.

### Transaction boundary policy

Keep a transaction inside the modular monolith when one domain commit needs atomicity. Use an outbox row in that transaction for work that must happen later. Do not pretend a database transaction can include WhatsApp, an LLM, a push provider, or another cell. Those effects require explicit receipts and repair.

Cross-module orchestration should prefer a command plus durable event/outbox over a chain of direct table writes. Synchronous composition is acceptable when the modules share the same transaction and the reason is documented.

### Database replacement test

For every proposed adapter, ask whether the application contract still makes sense if the backing store is:

- the current shared PostgreSQL/ZenStack database;
- a separate schema or database with the same transaction API;
- a cell-owned database;
- a local encrypted SQLite/PowerSync projection;
- an eventually reconciled school hub;
- a read replica or derived search index.

If the answer is no, the application contract is leaking storage details. If a capability truly requires PostgreSQL semantics, document that as a deliberate invariant rather than hiding it behind a false abstraction.

## Real deployment and financial options

These are not competing ideologies. They are options with option value: each buys a different capability, cost envelope, and failure-domain shape. The default is the cheapest option that satisfies the actual service promise.

### Option A — Lean shared modular monolith

**Shape:** one API deployment profile, one primary PostgreSQL/Supabase database, managed backups, current PowerSync boundary, provider adapters, one operator path.

**Buys:** lowest coordination cost, fastest iteration, simplest support, one consistent transaction boundary.

**Does not buy:** independent regional custody, independent scaling of every workload, offline authoritative school operation, or immunity from one provider/account outage.

**Financial profile:** lowest fixed cost; variable costs are database/storage/egress, AI/model usage, messaging, backups, support, and operator time. Use conservative caps and a manual fallback.

**Use when:** one bounded workflow, small institutions, no proven regional custody requirement, and a named operator can restore it.

**Exit trigger:** measured contention, restore objective, custody requirement, or support/failure blast radius exceeds the shared profile.

### Option B — Reliability-enhanced shared monolith

**Shape:** same module code and API contract; stronger database tier, connection pooling, backup/restore rehearsal, worker separation, read replicas or derived projections only where measured, better queue/provider isolation.

**Buys:** better continuity and workload isolation without splitting domain ownership.

**Does not buy:** independent institutional sovereignty or true regional independence.

**Financial profile:** higher predictable base cost and operational discipline; often cheaper than premature cells because the code and support model remain shared.

**Use when:** the shared profile is useful but its reliability or burst envelope is insufficient.

**Exit trigger:** tenant isolation/custody or regional failure requirements—not merely fashion.

### Option C — Cell-based modular monoliths

**Shape:** the same bounded application modules deployed as several cells, each with a database and operator/failure domain; a control plane routes only permitted identity/capability metadata. Cells are not microservices: each cell remains a modular monolith.

**Buys:** smaller blast radius, regional/institutional custody options, staged migrations, bounded load and support domains.

**Costs:** routing, tenant placement, migrations across cells, key and credential lifecycle, cross-cell reporting, support complexity, and duplicated baseline capacity.

**Financial profile:** pays for isolation before it produces revenue; requires a cell-placement policy, utilization model, and staffed operations.

**Use when:** an institution or region has a real custody/resilience need and can fund an operator path.

**Exit trigger:** cells are mostly empty, support incidents are harder to resolve, or the promised independence is not used.

### Option D — School/local hub with delayed synchronization

**Shape:** a carefully bounded local read/cache or service at a school, with central authoritative settlement and explicit offline epochs. The hub may run selected deterministic workflows and resource delivery; it must not silently become an ungoverned second school database.

**Buys:** useful operation during connectivity gaps, lower repeated downloads, local access to selected Library/classroom resources.

**Costs:** hardware, power, maintenance, replacement, local network, credential custody, physical privacy, reconciliation, and a person who can repair it.

**Financial profile:** recurring human and physical cost dominates software cost. Price procurement, travel, replacement, and operator hours.

**Use when:** measured outage duration plus a real local maintainer justify it.

**Exit trigger:** the hub is never maintained, local power/network is less reliable, or delayed authority creates unacceptable educational/ privacy risk.

### Option E — Sovereign/self-hosted or federated operation

**Shape:** independent operators run compatible modular-monolith cells and exchange explicit, versioned records or capabilities. No global shared write assumption.

**Buys:** operator autonomy, local law/custody choices, portability and reduced dependence on one provider.

**Costs:** duplicated operations/security, version compatibility, dispute resolution, federation governance, support, upgrades, backups, incident coordination, and exit testing.

**Financial profile:** highest total operating burden unless independent institutions have strong reasons and capacity. “Self-hosted” is not free hosting.

**Use when:** a concrete jurisdictional/custody/continuity need and at least two accountable, funded operators exist.

**Exit trigger:** exchange is only theoretical, operators cannot patch/restore, or federation concentrates more control than it removes.

## Financial decision model

Do not compare options by hosting invoice alone. Use total cost of service:

```text
TCO(period) = infrastructure
            + database/backups/restore
            + sync/storage/egress/media
            + model/audio/token spend
            + provider/message fees
            + monitoring/security/compliance
            + onboarding and support labour
            + operator/replacement/travel/energy
            + migration/exit reserve
            + incident and downtime burden
```

For each option record:

| Dimension | Required question |
| --- | --- |
| Fixed cost | What must be paid before the first participant uses it? |
| Variable cost | What grows with users, bytes, messages, tokens, retries, or institutions? |
| Human cost | Who provisions, supports, reconciles, restores, and replaces absent operators? |
| Failure cost | What is the consequence and recovery cost of a provider/region/hub outage? |
| Option value | What future choice does this option preserve or make easier? |
| Lock-in | How hard is export, provider replacement, cell movement, or schema migration? |
| Equity | Does the option shift money, device, data, or labour burden to people with least capacity? |
| Stop cost | Can the experiment be stopped without stranded hardware, data, or obligations? |

### Financial bands are decision aids, not invented forecasts

Until usage, provider rates, staffing, and contracts are measured, use relative bands:

| Band | Intended meaning | Promise allowed |
| --- | --- | --- |
| S0 — proof | Existing environment, small synthetic/participant group | No continuity or scale promise |
| S1 — pilot | One bounded workflow, funded support hours, restore rehearsal | Pilot service objective only |
| S2 — repeatable | Multiple institutions, measured usage and support | Defined service envelope and incident owner |
| S3 — regional/cell | Extra isolation/custody and staffed operations | Only the named cell/region envelope |
| S4 — federation | Independent operators and compatibility governance | Explicit exchange guarantees only |

Never call a free tier a financial model. Never call volunteer heroics an SLO. Never make a reliability promise whose backup, operator, and recovery costs are unfunded.

## Phased roadmap: abstraction to concrete proof

### Phase 0 — Reconcile the ground (1–2 weeks)

**Goal:** stop architecture drift before adding capability.

**Outputs:** current route/contract/handler inventory; capability maturity map; direct DB-write map; provider/webhook map; current deployment/restore/credential inventory; unresolved contradiction register.

**Gate:** one selected pilot capability has an owner, authoritative record, current route, current client, and known failure modes.

**Stop condition:** if production topology, database, or operator ownership is unknown, do not promise a new deployment profile.

### Foundation floor — Make the horizontal boundary coherent (before protected slice implementation)

This is the prerequisite floor revealed by the production error-handling calibration. It is not a new vendor or a rewrite. It makes the existing layers agree:

```text
domain failure → typed application error → oRPC declared error → Hono/RFC 9457 response
              ↘ structured logs/traces/metrics/audit evidence
```

**Required outcomes:** one canonical error vocabulary; expected failure versus defect distinction; declared oRPC procedure errors; Hono problem-details serialization; streaming-specific error callbacks; request/operation/trace correlation; retry/timeout/cancellation policy; redaction rules; and route-family consistency checks.

**Hostile boundary:** Effect is optional. It may be evaluated for application workflows that genuinely need typed composition, cancellation, retry, and defect separation. It is not a prerequisite and must not be adopted merely to replace `throw` syntax.

**Gate:** a representative read, mutation, timeout, authorization denial, conflict, dependency outage, and streamed AI failure produce stable client semantics and structured operational evidence. No protected vertical implementation proceeds on the claim that a global `try/catch` proves this.

### Phase 1 — Define the capability constitution (2–4 weeks)

**Goal:** make one capability meaningful independent of transport.

**Outputs:** descriptor schema; lifecycle states; canonical error categories; receipt/operation query; authority and confirmation levels; real/demo/experimental mode; capability-to-door matrix.

**Gate:** the same capability can be described for web, mobile, a chat channel, and an AI proposal without changing its domain meaning.

**Stop condition:** if the domain cannot state who owns the record or who corrects it, keep it private/draft-only.

### Phase 2 — Harden one vertical slice on the foundation floor (4–8 weeks)

**Goal:** prove one end-to-end useful action in the current modular monolith.

**Outputs:** application service; domain-specific persistence port; transaction/outbox boundary; idempotency/replay; current-scope revalidation; receipt query; one first-party client; one failure/recovery test charter; support runbook. The slice must consume the foundation error/timeout/observability contracts rather than inventing local handling.

**Gate:** G1/G2 contract and scenario evidence plus real database transaction evidence, with no false-success state.

**Stop condition:** duplicate effect, lost accepted operation, unowned correction, or net burden worse than the existing workflow.

### Phase 3 — Establish the API spine (6–12 weeks)

**Goal:** make all new work enter through shared capability and policy seams.

**Outputs:** capability registry; generated client/tool metadata; route-family policy report; canonical error/receipt adapter; direct-table-write exception list; cross-transport correlation IDs; cost units.

**Gate:** new capability cannot merge without descriptor, owner, policy metadata, persistence/recovery classification, and evidence plan.

**Stop condition:** registry becomes a decorative catalogue disconnected from code; repair the generation/verification path before adding entries.

### Phase 4 — Selective doors (2–6 months)

**Goal:** expose the proven capability through the lowest-friction additional door.

**Outputs:** one channel adapter or AI proposal tool; selective read-only OpenAPI; assistant/MCP threat model if relevant; provider receipt and support path; language/accessibility review.

**Gate:** same scope, effect, receipt, and recovery semantics across the primary client and selected door.

**Stop condition:** a channel hides important context, increases correction/support burden, or cannot represent unknown delivery honestly.

### Phase 5 — Reliability profile (3–9 months)

**Goal:** decide whether the lean shared profile is insufficient.

**Outputs:** load/reconnect measurements; backup/restore drill; queue drain and fairness model; support and cost ledger; database connection/storage profile; incident review.

**Gate:** an evidence-backed choice among Option A and B, with funded owner and negotiated service envelope.

**Stop condition:** no measured need for stronger infrastructure; keep the lean profile and invest in product value.

### Phase 6 — Cells, hubs, or federation (9–24+ months, conditional)

**Goal:** test a physical separation only when a real custody, outage, or scale requirement exists.

**Outputs:** one bounded cell/hub/federation experiment; placement/routing policy; key and version lifecycle; migration/export; partition/reconciliation tests; full cost and successor-operator plan.

**Gate:** two accountable operators or one accountable local maintainer, a restore/exit path, and evidence that isolation solves a named problem.

**Stop condition:** added complexity costs more than the harm it prevents or shifts unmanageable work to participants.

## Granular implementation-plan template

Every implementation task derived from this roadmap must include:

1. capability ID and domain owner;
2. exact current contracts/handlers/ports touched;
3. API surface and non-goals;
4. authoritative tables and transaction boundary;
5. actor/scope/consent/confirmation model;
6. idempotency, replay, conflict, and receipt semantics;
7. offline/local behavior and revocation boundary;
8. external providers and unknown-delivery handling;
9. cost/resource budget and abuse limits;
10. migration/backfill/rollback plan;
11. tests by evidence level and known substitutions;
12. support/runbook/owner/absence coverage;
13. exact files in the impact set;
14. deletion/replacement disclosure and explicit approval if required;
15. post-change raw diff review and verification record.

## Decision rules for “real options”

Use a real option only when it preserves a plausible future choice at acceptable present cost. The option must have:

- a named future trigger;
- a cheap-enough reversible experiment;
- a stable contract boundary;
- measurable benefits and failure costs;
- an operator and budget path;
- a migration/export/exit story;
- no hidden new authority source.

Examples:

- A persistence port is a real option; an abstract repository with no second adapter or domain meaning is theatre.
- An outbox is a real option for provider/cell execution; a vague “eventually consistent” comment is not.
- A read-only projection is a real option for GraphQL later; a second mutable schema is premature duplication.
- A cell profile is a real option; deploying empty regions before custody/load evidence is cost without option value.
- An AI proposal contract is a real option; exposing raw database procedures to an LLM is uncontrolled coupling.

## Hostile review of this roadmap

This plan can fail by becoming another elegant document that delays one useful capability. It can also fail by treating “modular monolith” as a moral identity and refusing a cell when a school genuinely needs local custody. It can fail financially if support and operator time remain invisible. It can fail technically if ports become generic wrappers and table ownership remains shared.

Therefore the first implementation should not be the registry itself in isolation. It should be one capability vertical slice whose descriptor, lifecycle, persistence port, receipt, client, cost, and recovery are all real. Generalize only what that slice proves is common.

## Current recommendation

1. Establish the horizontal foundation floor before protected vertical implementation: typed failures, oRPC error declarations, Hono/RFC 9457 mapping, cancellation/timeout semantics, and operational correlation.
2. Keep Hono + oRPC as the core transport/contract layer.
3. Keep the modular monolith as the default physical deployment.
4. Introduce application/capability seams before database or service separation.
5. Decouple API meaning from database adapters, but keep the first transaction path in the current database until a second real adapter is justified.
6. Treat Option A as the default, Option B as the likely next reliability step, and Options C–E as conditional experiments.
7. Do not add GraphQL, multiple agent runtimes, or multiple databases merely to look future-ready.
8. Make receipts, recovery, cost, operator ownership, and exit part of the API contract—not post-launch operations.

## Verification boundary

This document is a source-grounded planning artifact. It does not prove production availability, capacity, database portability, financial affordability, or independent review. No product code or database schema was changed. The previous [API capability audit](2026-10-13-api-capability-platform-and-tooling-audit.md) remains the evidence-backed assessment of current gaps.
