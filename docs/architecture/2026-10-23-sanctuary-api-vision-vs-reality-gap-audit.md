---
title: "Sanctuary API Vision vs Reality Gap Audit"
status: "draft"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, audit, contracts, migration, documentation, evidence]
---

# Sanctuary API Vision vs Reality Gap Audit

## Executive finding

The platform has not failed to build an API. It has built several overlapping
ones while evolving toward a better one:

- a Hono runtime and OpenAPI-era contract model;
- native oRPC procedures and a large router/handler surface;
- compatibility facades, proxy clients, and contract conversion machinery;
- direct Supabase calls in domain packages and UI-adjacent code;
- direct HTTP clients for protocol-specific and some ordinary workflows;
- specialized routes for AI, channels, webhooks, agents, sync, events, and
  diagnostics.

This is a migration-in-progress, not a clean modular monolith yet. The central
risk is not too few abstractions; it is multiple abstractions asserting they are
the API for the same domain decision. A blanket rebuild would multiply that risk.
The appropriate response is an evidence-led top-down consolidation: establish
domain authority and capability ownership first, then retire duplicate paths
incrementally after caller and behavior evidence.

No product code, schema, route, dependency, or historical document was changed
for this audit.

## Bounding triad

1. **Surface & mode:** `apps/sanctuary-api`, `packages/core/src/api`, client
   consumers, and their architecture/current-progress records; Maintain-mode
   forensic audit.
2. **Grounded substrate:** current route composition, 43 handler files, 243
   core API files, 66 total `*.contract.ts` files (including 22 explicit
   `*.orpc.contract.ts` files), public API barrels, installed package manifests,
   targeted caller searches, Git history, and current test output.
3. **Active seam & constraints:** distinguish observed source from tests and
   intent; preserve working routes and compatibility behavior; do not use this
   report as approval for deletion, an API rewrite, GraphQL, microservices, or
   a dependency upgrade.

## Evidence classes used here

| Class | Meaning | Examples in this report |
| --- | --- | --- |
| Observed | Directly found in current tracked or untracked source | route mounts, imports, contract files, direct database calls |
| Verified boundary | Current automated test result with substituted dependencies | Vitest request-path tests |
| Documented intent | A plan, decision, or progress record | roadmap and migration documents |
| Inferred risk | Reasoned consequence needing a focused test or review | drift between two authority builders |

Documents are never treated as proof merely because they are detailed. A
document dated before an implementation change is historical context unless its
claims are independently observed again.

## The intended architecture

The strongest and most recent direction is consistent in principle:

```text
participant need
  → domain authority and durable truth
    → capability with authority, lifecycle, receipt, and recovery
      → transport adapter (native oRPC, selective OpenAPI, SSE/webhook when required)
        → application service and narrow domain ports
          → Postgres/ZenStack, sync, outbox, worker, provider adapters
```

The October capability and layered-roadmap documents explicitly reject a general
GraphQL addition and premature service splitting. The product activity decision
adds a privacy-bounded event layer beside identity, authorization, receipts, and
observability. These are sound direction-setting documents, but they are not yet
the mechanically enforced organization of all source.

## Observed current reality

### 1. The runtime is real and substantial

`apps/sanctuary-api/src/core/app.ts` is a 900+ line composition root. It mounts
security headers, CORS, CSRF, body limits, cache rules, timeouts, rate limiting,
logging, correlation/tracing, identity, PQC middleware, native oRPC, read-only
OpenAPI, AI streaming, authentication, durable agents, payments, verified
channel ingress, health, and API documentation. The app is not a placeholder.

The native router composes approximately forty domain families, including
identity, onboarding, educational, attendance, grading, community, messaging,
sync, agents, privacy, rewards, forms, and plan bridge. It has 43 handler files.

### 2. Contract ownership is divided

The core API directory contains 66 `*.contract.ts` files in total, of which 22
use the explicit `*.orpc.contract.ts` naming convention. `appContract.ts` mixes
explicit oRPC contracts with a legacy-style `inventoryContract`, then widens its shape through
`Record<string, Record<string, any>>`.

The Sanctuary adapter converts `SovereignContract` route objects into oRPC
contracts dynamically. This is a credible migration technique, but it means the
source has two authoring dialects and a conversion layer at a security-sensitive
boundary. It is not the same thing as a single canonical contract model.

### 3. First-party access is not yet singular

The public `@repo/core/api` barrel exports a large mixture of:

- legacy and migration facades such as `attendanceAPI`, `classroomsAPI`, and
  `profileAPI`;
- direct `orpc` and `orpcClient` access;
- a broad `api: any` proxy with aliases for old domain names;
- contract types and server-adjacent compatibility constructs;
- client hooks and local-first helpers.

The barrel itself calls this a "v2 Dynamic Client Proxy," but its dynamically
typed aliases and exception path show that it is a compatibility surface, not a
clean public capability SDK. It must be treated as migration debt with callers,
not deleted on aesthetic grounds.

Targeted source search also finds direct Supabase reads/writes in `@repo/core`
adapters and in multiple domain/UI packages, alongside direct `fetch` usage for
AI streaming, durable agents, event streaming, auth, and workflow-specific
calls. Some direct transports are necessary; the observed issue is that the
repository has no presently enforced rule that tells a contributor which calls
are required protocol exceptions and which bypass a domain capability.

### 4. Authority context is duplicated

`app.ts` constructs request security context for Hono policy middleware, while
`router.ts` has both raw-request and Hono-derived oRPC context builders. Each
performs related account, active-bond, scope, classroom, and error behavior.

**Inferred risk:** changes to onboarding exceptions, scope failure, classroom
membership, error mapping, or future device trust can be correct on one route
family and different on another. Existing tests cover selected paths, but source
duplication means parity is not mechanically guaranteed.

### 5. The new SSE route is an observed gap, not an accusation

The untracked `eventsStream.ts` mounts an `/events/stream` endpoint, accepts
`schoolId` and `classroomId` query parameters, emits a connection handshake and
heartbeats, and contains no observed authentication, scope derivation,
subscription authorization, event source, replay cursor, or back-pressure
policy. Its presence is useful evidence of the desired activity/realtime
direction, but it is not safe to call a completed product event pipeline yet.

This is especially important because scope values should be server-derived for
protected data. The endpoint should remain a bounded work item until its
authority and delivery contract are explicitly designed and tested.

### 6. Activity/audit/telemetry building blocks exist but are not one layer

Observed modules include audit logging, temporal events, an event bus, event
schemas/producers, durable-agent platform events, PowerSync mutation audit work,
OTel/Sentry telemetry, an events oRPC contract, an event receiver, and the new
SSE route. The ingredients are present. No single observed registry currently
binds a capability to its required audit, receipt, product activity, telemetry,
privacy class, retention owner, and user-facing projection.

That is the gap addressed by the product-activity decision, not evidence that
all existing event code should be replaced.

## Vision-versus-reality matrix

| Intended condition | Current evidence | Gap | Priority |
| --- | --- | --- | --- |
| One canonical first-party API contract/client | Native oRPC exists, but legacy contracts, conversion, facades, dynamic aliases, direct Supabase, and direct fetch coexist | No approved per-domain canonical-path ledger | P0 |
| Hono is an HTTP runtime shell, not a second business API | Hono has appropriate runtime duties but the composition root also contains policy/context/business-adjacent logic | Split composition and authority-building after parity tests exist | P1 |
| Domain ownership precedes feature abstractions | Core has many screen/feature-shaped facades and repositories alongside domain routers | No authoritative domain/capability map governing new abstractions | P0 |
| Server-derived authorization is uniform | Active-bond and policy mechanisms are substantive; multiple context builders remain | Cross-door parity is not mechanically guaranteed | P0 |
| A protected mutation has receipt, audit, replay, recovery, and external-effect handling | Individual slices and documents show pieces of this model | No verified universal lifecycle contract | P0 |
| OpenAPI is selective read interoperability | Read-only oRPC OpenAPI handler exists; `/doc`/UI docs also exist | Inventory must distinguish actual generated paths from documentation claims | P1 |
| Product activity improves people’s experience without surveillance | Multiple event/audit/telemetry primitives exist | No shared event purpose/privacy/schema/retention registry | P1 |
| Documentation tells contributors what is true now | Many historical records remain active, and several architecture files lack required status frontmatter | No documentation lifecycle index or authoritative API constitution | P1 |
| “oRPC v2 beta” is a controlled migration | Installed `@orpc/*` is `2.0.0-beta.44`; current code has a v2-style catch-all | A 2026-10-17 active document describes a v1.15.7 `/api/v1/rpc` and `/api/v2/rpc` dual-wire plan not observed in the current mount code | P0 |

## Documentary forensic findings

### Active does not mean current

At least thirteen pre-October Sanctuary API records and multiple pre-October
core API records still carry `status: active`. These include Hono/Railway-era
strategy, migration, contributor, test, and infrastructure documents. Some
remain valuable explanations; their active status incorrectly implies they are
the current operating reference.

The root architecture directory also contains multiple files without the
required YAML `status`, including architecture and guide material related to API
adjacencies. This is a documentation-governance defect: a newcomer cannot
determine whether a document is a live rule, a proposal, or preserved history
without performing source archaeology.

### Most consequential contradiction: oRPC migration state

The active 2026-10-17 oRPC migration spike describes a stable 1.15.7 runtime
on `/api/v1/rpc` and a planned `/api/v2/rpc` migration. The installed Sanctuary
packages resolve to `2.0.0-beta.44`, and the actual app mounts a native handler
under `/api` with a catch-all path plus selected exclusions. The source also
includes a pilot file and comments about v2.

This does not prove the current runtime is broken. It proves that the migration
document, dependency state, and mounting description need reconciliation before
they can be used for a safe migration decision. Do not infer a deployed dual-wire
gateway from the document.

### Documentation quality is uneven

The existing October audits are unusually valuable because they state limits:
mock substitutions, unfinished foundation work, and no production claim. The
older roadmap documents often state an intended destination but lack a clear
supersession link to their descendants. The repository should retain them as
history, not silently delete them.

## Evidence that currently holds

### G0 static contract

`pnpm --filter @repo/sanctuary-api exec tsc --noEmit` exited 0 in this working
tree.

**Proves:** the current Sanctuary API TypeScript project compiled.

**Does not prove:** live database, Cedar/Rust evaluator, JWT provider, SSE
authorization, production configuration, provider delivery, or client parity.

### G1 boundary suite

The current `pnpm --filter @repo/sanctuary-api test` run completed with 96 test
files passed, one test file skipped, 664 assertions passed, and six assertions
skipped. The run used Vitest 5.0.5 and took about 77 seconds.

**Proves:** named API request-path, contract, security, handler, and test-double
assertions under the configured substitutions.

**Does not prove:** production authorization parity, real PostgreSQL rollback,
provider acceptance/delivery, device offline replay, external secrets/config,
load behavior, or a complete migration to the documented target architecture.

## What is ceremony versus what is necessary

### Necessary boundaries

- domain capability contract with input/output/error/authority semantics;
- server-side policy and scope derivation;
- transaction/receipt/outbox boundary for protected commitments;
- dedicated protocol adapters for SSE, uploads, webhooks, and external provider
  callbacks;
- privacy-bounded activity/audit/telemetry records with distinct purposes;
- narrow persistence ports only where a domain or infrastructure boundary is
  real.

### Probable ceremony or migration residue to inventory first

- facade APIs that only forward to `orpcClient`;
- generic repositories exposing CRUD rather than a domain decision;
- screen-shaped contracts that reproduce a domain capability;
- overlapping query-key/fetch/cache wrappers;
- multiple names and aliases for the same procedure;
- docs claiming a transport or version topology not present in source;
- dynamic `any` compatibility clients that obscure the canonical API.

“Probable” is deliberate. Each item needs caller search, behavior
characterization, and a named replacement path before consolidation. No working
fallback is disposable merely because it appears architecturally untidy.

## Top-down consolidation plan

### Gate A — establish a reality ledger

Generate a machine-readable inventory with one row per public operation and
per direct boundary:

| Required field | Purpose |
| --- | --- |
| domain and capability ID | Names the owner and intended meaning |
| contract and route | Identifies canonical and compatibility doors |
| handler/application owner | Locates the business decision |
| data owner and transaction boundary | Identifies durable truth |
| authority/scope rule | Enables cross-door parity review |
| caller inventory | Prevents accidental deletion |
| lifecycle class | read, draft, proposal, commit, external effect |
| receipt/audit/activity/telemetry requirements | Makes lifecycle observable and repairable |
| event privacy/retention owner | Prevents surveillance drift |
| evidence level | Separates tests from runtime proof |
| disposition | canonical, adapter, compatibility, deprecated, unknown |

### Gate B — name only five initial ownership domains

1. Identity and scope.
2. Classroom learning.
3. Self and wellbeing.
4. Community and communication.
5. Platform operations.

These are ownership hypotheses to validate against the ledger, not a new folder
structure. A sixth domain should be added only when it owns a distinct durable
truth and correction path.

### Gate C — select one proving capability

Use one protected Classroom Learning command, such as an attendance batch, to
prove the whole intended lifecycle: scope derivation, input/output contract,
idempotent receipt, transaction-bound audit/event, activity projection, offline
recovery, provider-independent event delivery, and a user-visible correction
path. Do not generalize before this works.

### Gate D — migrate by domain, never by file type

For one domain at a time:

1. identify canonical oRPC contract and application service;
2. characterize all legacy facades/direct calls and their callers;
3. migrate callers and add parity/recovery tests;
4. label compatibility code with owner and retirement condition;
5. request explicit approval before any removal.

### Gate E — repair documentation governance

Create one continuously maintained API constitution and an index that classifies
documents as current reference, decision, historical audit, active plan, or
superseded. Update frontmatter and add `superseded_by` links; do not erase
historical records. Reconcile the oRPC version/mount document first because it
can otherwise misdirect implementation.

## Decisions requested before implementation

1. Confirm the first proving capability: attendance batch, assignment
   submission, or another protected action with a real user need.
2. Confirm whether direct Supabase access is a temporary allowed migration path
   or a prohibited path for new protected domain work.
3. Confirm who owns product activity retention and consent policy: product,
   institutional governance, or a jointly defined role.
4. Approve the Gate A inventory as the next bounded implementation task.

## Verification boundary

This report is a static and boundary-test forensic audit. It is not a production
penetration test, data-retention review, performance test, real-provider
delivery proof, independent legal/privacy assessment, or authorization to remove
code. Existing uncommitted source and documentation changes were observed but
not modified; their presence is not attributed to a person or treated as
committed architecture.
