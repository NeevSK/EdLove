---
title: "Sanctuary API Production Architecture Review"
status: "proposed"
created: 2026-08-13
updated: 2026-08-14
tags: [api, architecture, production, security, refactoring, supabase, orpc]
---

# Executive summary

Sanctuary API is not missing a production framework. Its foundation is strong:
Hono, oRPC, Zod, OpenAPI adapters, ZenStack, Cedar, Supabase Auth/JWKS,
request IDs, OpenTelemetry tracing, health checks, body limits, timeouts,
structured errors, and a meaningful HTTP test suite are already present.

The production risk is architectural inconsistency. The codebase has two
contract families, several client access paths, duplicated rate limiters, a
large composition root, transitional proxy routes, and authorization that can
silently degrade from Cedar enforcement to authentication-only when metadata is
missing. The next phase should be a hardening and consolidation program, not a
new framework adoption.

## Current target architecture

```text
First-party callers
  -> shared oRPC client / typed streaming client
  -> Hono transport + common middleware
  -> JWT/session context + active scope
  -> required Cedar authorization metadata
  -> domain use case/service
  -> ZenStack/DB boundary or PowerSync sync boundary
  -> explicit DTO + typed error + audit/idempotency policy
```

Hono should remain the transport and middleware host. oRPC should be the source
of truth for first-party request/response APIs. AI streaming, payment webhooks,
MCP, and deliberately external OpenAPI routes should remain explicit adapters.

# Findings

## P0 — authorization must fail closed

`apps/sanctuary-api/src/core/orpcMiddleware.ts` previously executed the
procedure when policy metadata was absent. That meant a contract using the
shared `doubleGateMiddleware` could receive authentication enforcement but skip
Cedar. The affected messaging, social, principal-notes, announcements, and
extended community procedures now carry explicit metadata, and the Cedar
vocabulary has been extended with scoped policies for their deployed data
boundaries.

Impact: an authenticated user may reach a procedure without the intended
object-level Cedar decision. This is the most important issue to fix before
adding more sensitive agent or school-scoped procedures.

Plan: require policy metadata for every protected procedure, allow an explicit
typed `public`/`bootstrap` classification only where intended, and add a startup
or test-time route audit that fails on missing policy metadata. The first two
guards are now implemented; route inventory and exception classification remain.

## P0 — remove sensitive error leakage from AI responses

`apps/sanctuary-api/src/ai/routes.ts:224-232` returns `err.message` and a stringified
error in a 500 response. Provider, database, billing, or configuration details
can be exposed to clients.

Plan: return a stable error code plus request ID, log the diagnostic server-side,
and classify retryable versus terminal provider failures. Apply the same rule to
webhook and proxy adapters.

## P1 — rate limiting is process-local and duplicated

`apps/sanctuary-api/src/core/app.ts:241-295` uses an in-memory IP map for all API
traffic, while `apps/sanctuary-api/src/ai/middleware/rateLimit.ts:1-40` has a
second in-memory user/IP bucket. This does not coordinate across instances,
restarts, or regions and trusts forwarded IP headers without a deployment-level
proxy contract.

Plan: define one rate-limit port with route classes and identity keys; back it
with an edge/shared store in staging and production; keep an in-memory adapter
only for tests and local development. Add `Retry-After`, authenticated-user
limits, anonymous limits, AI token/cost quotas, and abuse tests.

## P1 — first-party data access is not consolidated

Several `packages/core/src/api` modules still call `supabaseClient.from/rpc`
directly, while other modules use the Sanctuary API client. The contributor
guide says oRPC is canonical, but the repository still contains a meaningful
compatibility surface.

Plan: inventory every direct Supabase caller into three categories: (a) must
move behind Sanctuary API, (b) intentionally client-local/PowerSync, or (c)
explicitly approved database function/identity boundary. Migrate category (a)
slice by slice; do not mechanically wrap every query.

## P1 — legacy and transitional surfaces need ownership and sunset dates

`apps/sanctuary-api/src/core/routes/durableAgents.ts` now owns
`/api/durable-agents/*` and registers the worker functions with Sanctuary's
Inngest runtime. The route still needs production deployment smoke tests and
provider-backed synthesis verification before the marketing worker is treated
as fully retired.

Plan: isolate adapters under `src/adapters`, add route policy and contract
tests, add explicit ownership and rollout dates, and keep webhooks outside
user-auth middleware
but verify signatures, replay protection, idempotency, and audit behavior.

## P1 — composition root is too large and repetitive

`apps/sanctuary-api/src/core/app.ts` is over 1,000 lines and repeats the same
oRPC mount block for every slice (`:855-980`). It mixes transport middleware,
authentication, authorization, feature flags, route registration, proxying,
webhooks, and documentation.

Plan: split into `createApp`, `middleware`, `health`, `mountRpcSlices`,
`mountAdapters`, and `openapi` modules. Use a route-slice registry to mount
oRPC routers consistently. Preserve middleware ordering with an integration
test that asserts the request lifecycle.

## P1 — type safety is being bypassed at the API boundary

`apps/sanctuary-api/src/core/orpc.ts:153-240`,
`apps/sanctuary-api/src/core/orpcMiddleware.ts:9-163`, and
`packages/core/src/api/agent.ts:9` contain broad `any` casts. Several handlers
also cast ZenStack rows to `any` and map them ad hoc.

Plan: first type the context and procedure metadata, then introduce per-domain
repository/service interfaces and explicit response mappers. Track remaining
casts with a lint budget; do not attempt a whole-repository type rewrite in one
pass.

## P1 — contracts are not yet one coherent system

The repository contains classic `SovereignContract` objects and newer oRPC
contracts. Some oRPC files are aliases of classic contracts, others are bespoke
objects, and `packages/core/src/api/contractCoverage.ts` is used selectively.
This creates drift risk between schemas, handlers, clients, and generated docs.

Plan: make native oRPC contracts canonical for new and migrated first-party
procedures. Keep classic contracts only behind an explicitly named compatibility
adapter. Add a global inventory test for contract → handler → client coverage,
metadata, output schema, and route uniqueness.

## P2 — observability has a trace foundation but lacks operational metrics

The API has manual OpenTelemetry tracing and request/trace IDs, but the review
found no equivalent production metrics contract for request latency/volume,
authorization denials, rate-limit rejections, sync lag, queue depth, provider
failures, or database health. OpenTelemetry documents traces, metrics, and logs
as separate signals; tracing alone is not an operational SLO system.

Plan: define low-cardinality metrics and dashboards/alerts first, then add
procedure spans and DB/provider spans where useful. Never put message content,
tokens, authorization headers, or secrets into telemetry.

## P2 — lifecycle and background work are underspecified

`apps/sanctuary-api/src/ai/maintenance/retention.ts` starts an in-process timer.
That is acceptable for local development but is not a durable job system in a
multi-instance deployment. Production readiness documentation already calls out
missing retries, dead-letter/recovery, and queue visibility.

Plan: move retention and future asynchronous work to a durable scheduler/queue
boundary, or explicitly document a single-worker deployment constraint. Add
graceful shutdown, startup configuration validation, dependency health, and
restart smoke tests.

## P2 — documentation and implementation have drifted

The supplied report says the only oRPC client is test-only, but the current
repository has `@orpc/client` in the API package and an agent client exists.
Conversely, `apps/sanctuary-api/docs/architecture/orpc-api-architecture.md`
still describes a paused migration while the code has moved further. This makes
future agent work unsafe because contributors cannot tell which checkpoint is
authoritative.

Plan: designate one current architecture document, mark stale checkpoints as
historical, and generate a route/contract inventory in CI.

# Refactoring and simplification backlog

1. Extract the API composition root and route registry from `core/app.ts`.
2. Replace the two rate-limit implementations with one injected port.
3. Replace silent missing-policy behavior with fail-closed metadata validation.
4. Create one typed API client runtime with auth, active scope, retry, timeout,
   error normalization, and trace propagation.
5. Move direct Supabase access behind named boundaries and document exceptions.
6. Consolidate response mapping and error classification by domain.
7. Remove `AppType = unknown`/`as any` from migrated paths first.
8. Separate user API, AI streaming, webhook, legacy proxy, and health adapters.
9. Add route inventory and OpenAPI drift checks to CI.
10. Update architecture docs and delete only confirmed-dead compatibility code.

# Phased implementation plan

## Phase 0 — freeze and baseline

Deliverables: route inventory, contract inventory, direct-Supabase inventory,
middleware order test, environment matrix, and a list of intentional exceptions.

Acceptance: every route has an owner, protocol, auth mode, policy metadata,
idempotency requirement, output contract, and sunset status.

## Phase 1 — authorization and error safety

Deliverables: fail-closed policy metadata, route audit, typed public/bootstrap
exceptions, sanitized AI/webhook/proxy errors, and negative authorization tests.

Acceptance: no protected procedure can execute without a Cedar policy; tests
cover cross-school, wrong-bond, anonymous, stale-session, and malformed-input
cases.

### Phase 1 implementation status — 2026-08-13

Completed in the current worktree:

- Added explicit policy metadata to messaging, social, principal-notes,
  announcements, community-extension, and permission-snapshot procedures.
- Added eager contract validation so a route without explicit policy metadata
  fails during router construction, not only when a request reaches it.
- Added a defensive fail-closed middleware guard for dynamically composed
  procedures.
- Added Cedar schema vocabulary and policies for Notification, PrincipalNote,
  Announcement, UserBlock, DirectConversation, and DirectMessage.
- Added request resource attributes needed for self and school scope decisions.
- Sanitized AI internal errors to a stable error code plus request ID.
- Verified Cedar behavior directly: same-school announcement allowed,
  cross-school announcement denied, other-user notification denied, and own
  principal note allowed.
- Verified API behavior with the full current API suite: 23 files and 100
  tests passed. This is supporting evidence only; the direct Cedar and
  fail-closed probes above are the stronger architectural checks.

Still required before Phase 1 is fully closed:

- Add negative authorization scenarios for every sensitive domain, including
  wrong active bond and stale session behavior.
- Add explicit negative authorization scenarios for every sensitive domain,
  including wrong active bond and stale session behavior.
- Migrate remaining legacy `Error` throws to direct `SovereignError` factories;
  the boundary classifier and `pnpm run audit:api-errors` now prevent new
  uncategorized handler messages while that migration proceeds.

### Error and boundary implementation status — 2026-08-13

- Added shared `SovereignError` factories for authentication, not-found,
  dependency-unavailable, conflict, invalid-input, and rate-limit outcomes.
- Added request-correlation attachment to normalized errors.
- Added native oRPC translation for `SovereignError`, preserving typed
  transport statuses instead of turning handler-level 4xx/5xx outcomes into
  generic 500 errors.
- Classified common legacy handler errors so database outages no longer appear
  as generic 500 responses.
- Added `audit:api-errors`; it passes with all current handler messages
  classified.
- Added `audit:data-boundaries`; the active Sanctuary HTTP app has zero direct
  Supabase callers. The audit now recognizes multiline fluent client calls,
  exposing 22 remaining findings under `packages/core/src/api` and 60 in
  other first-party package API directories. These are inventoried for
  slice-by-slice migration rather than hidden by formatting.
- Migrated all active handler dependency, authentication, not-found, and
  user-input failures to typed `SovereignError` factories or the shared
  `assertDatabase` assertion. The active handler error audit is now strict and
  passes with zero raw `Error` throws.

The inventory currently audits 191 active routes across 35 contract sources and
has zero structural, policy-vocabulary, or contract-completeness warnings. It
initially reported 27 routes without declared output schemas; those routes are
now typed. The audit must not be bypassed or allowed to gain new warnings.

The inventory now also records client ownership and protocol status. Four
domains—principal notes, messaging, social, and announcements—now use the
active HTTP contract for their core API methods. The broader package boundary
inventory still records remaining direct access in adjacent compatibility,
realtime, and repository surfaces; those are not treated as production API
completion. The shared client facade also still exposes `AppType` as
`unknown` and returns `any`; replacing that escape hatch with a generated or
server-exported Hono app type is a Phase 3 typing task.

The data-boundary inventory at `docs/architecture/api-data-boundary-inventory.json`
confirms that the active Sanctuary HTTP app has zero direct Supabase callers.
It records the remaining direct callers under `packages/core/src/api` and now
also scans API directories in other first-party packages, so community/admin
package bypasses cannot disappear from the review merely because they are
outside the core package. These remain explicitly classified migration
backlog items rather than invisible boundary violations.

### Boundary migration implementation status — 2026-08-13

- Migrated principal notes, direct messaging, announcements, notifications,
  blocking, resonance, and content reporting to server-owned HTTP contracts.
- Preserved existing public adapter signatures where practical, while ignoring
  client-supplied author IDs on server-owned mutation paths.
- Added explicit data-highway rules for these authoritative domains.
- Migrated the contract-backed Community package methods for groups, posts,
  group messages, comments, polls, and post mutations; corrected orchestration
  spread precedence so the HTTP adapter cannot be silently overridden by the
  legacy circle adapter.
- Migrated classroom create, update, and delete operations to the educational
  contract instead of direct client database writes.
- Migrated founder school-bond creation and self-revocation to the onboarding
  contract. The server derives the actor from the authenticated session and
  preserves idempotency, creator checks, entitlement cleanup, and projection
  updates in a transaction.
- Migrated Thuthimal gift creation, claiming, preview, and history to a
  server-owned contract. Claiming derives the recipient from the session and
  uses a conditional transactional update to preserve one-time semantics.
- Migrated ERP account reads, balanced ledger writes, payment-intent
  persistence, invoice reads, and receipt reads to the canonical schema and
  server handler. The legacy `accounting_accounts`, `billing_invoices`, and
  unverified RPC/Edge Function paths are no longer client dependencies.
- Added a durable idempotency index for payment intents. External Stripe and
  PayHere provider calls remain intentionally separate from intent persistence
  until a real provider adapter and webhook lifecycle are configured.
- Migrated Mapping topology reads, writes, authorized school pulse generation,
  and share-link creation to the server contract. Added a tracked topology
  migration, real share-token expiry, and compatibility for the legacy pulse
  date argument. Realtime topology subscriptions remain a separate client
  event-stream boundary.
- Migrated inventory item CRUD, school request reads/creation, and resource-need
  aggregation to the server contract. The client no longer queries the legacy
  `classroom_inventory` name or the untyped `resource_needs` view.
- Migrated collection membership timeline, as-of reconstruction,
  community/library version reads, and classroom-note audit history to
  server-owned contracts and parameterized read ports.
- Migrated student longitudinal timeline and snapshot reads to the server
  contract with explicit grant/guardian/school authorization and access logs.
- Migrated School Forest gratitude-gift creation, recipient pending reads, and
  delivery acknowledgement to a server-owned contract. The aggregate forest
  computation remains classified as a derived/nightly read-model boundary.
- Migrated classroom-student enrollment, shadow-student creation, update, list,
  and removal through the educational contract. Five historical classroom
  record reads remain unmodeled until their authoritative deployment schema is
  confirmed.
- Migrated classroom grading-settings reads and writes to the existing grading
  contract; GradeMark lifecycle operations were already server-owned.
- Migrated privacy-ledger reads and writes to an actor-derived server contract
  with parameterized queries and stable typed errors.
- Migrated the classroom echo workflow to a server contract. Student membership,
  teacher/principal visibility, teacher responses, and anonymity handling now
  execute on the server instead of relying on client-side branching.
- Completed the Community package boundary: its API directory now has zero
  direct Supabase findings. The active contract audit reports 191 routes with
  zero errors and no partial-client warnings. The broader boundary audit reports
  22 findings under `packages/core/src/api` and 60 under other first-party
  package API directories. The 22 Core findings are now protected by a reviewed
  exception ledger; they are not proof of API completion and remain explicit
  migration, security, or deprecation work.

## Phase 2 — transport hardening

Deliverables: shared/distributed rate limiter, route-specific limits, downstream
timeouts/circuit behavior, webhook replay/idempotency, graceful shutdown, and
startup configuration checks.

Acceptance: multi-instance or shared-store rate-limit test, retry-after behavior,
duplicate webhook test, dependency outage test, and controlled shutdown test.

### Phase 2 implementation status — 2026-08-13

Started:

- Consolidated API and AI rate limiting behind one bounded rate-limit
  interface.
- Removed the process-global cleanup interval; the in-memory fallback now
  performs lazy cleanup with a hard entry bound.
- Added an atomic Postgres fixed-window store for multi-instance deployments.
- Added the `api_rate_limit_buckets` migration with anonymous/authenticated
  access revoked and service-role-only grants.
- Added `Retry-After` and consistent `X-RateLimit-*` headers for rejected
  requests.
- Added production startup guards requiring `RATE_LIMIT_STORE=postgres` and
  an explicit trusted proxy header, plus readiness verification of the shared
  rate-limit table.

Still required before Phase 2 is fully closed:

- Add a controlled multi-instance/concurrency probe against Postgres.
- Apply and verify the webhook replay migration in the deployment environment
  before treating payment processing as production-ready. The local
  implementation now claims verified PayHere events through
  `payment_webhook_events`.
- Add dependency timeout/circuit behavior and graceful shutdown/drain hooks.

Deployment note: the repository migration audit currently reports local/remote
history drift (`20260812000000`, `20260813000003`, `20260813000004`,
`20260813010000`, `20260813020000`, `20260814010000`, `20260814020000`,
`20260814030000`, and `20260814040000` are local-only; `20260812202318` and
`20260812202325` are remote-only). No remote migration reconciliation was
performed during this review.

## Phase 3 — contract and composition consolidation

Deliverables: native oRPC as canonical first-party contract, compatibility
adapter boundary, route registry, split composition root, shared client runtime,
and generated route/contract drift checks.

Acceptance: all migrated slices have input/output/error/policy coverage; no new
first-party route can be added without client and test coverage.

### Composition implementation status — 2026-08-13

- Extracted liveness/readiness into `src/core/routes/health.ts`.
- Extracted the PayHere webhook boundary into
  `src/core/routes/payhereWebhook.ts`, leaving the composition root responsible
  only for registration and shared cryptographic dependencies.
- Replaced the durable-agent compatibility proxy with the canonical worker
  surface in `src/core/routes/durableAgents.ts`.
- Consolidated the 27 native oRPC mounts in `src/core/routes/orpc.ts` and added
  `pnpm run audit:api-composition` to prevent route-registration drift.
- Extended `pnpm run audit:api-contracts` with declared client files and
  `mapped`/`legacy-direct`/`server-only` ownership status. The generated
  inventory now makes route-to-handler-to-client coverage visible and emits
  warnings for direct-client exceptions.
- The webhook’s durable claim/replay behavior remains unchanged across the
  extraction.

Still required: map individual procedures to client methods (not only their
domain files), replace the `any` client facade, and finish the compatibility
proxy sunset once its replacement is deployed and observed in production.

## Phase 4 — data boundary cleanup

Deliverables: classified direct Supabase exceptions, migrated first-party API
callers, explicit repositories/use cases, DTO mappers, RLS/grant review, and
PowerSync upload boundary verification.

Acceptance: every direct database access is intentional and documented; RLS
positive/negative tests pass; duplicate sync uploads are idempotent.

The remaining Core findings are now classified in
`docs/architecture/api-boundary-migration-backlog.md`; the 40 findings are
not 40 missing HTTP routes. They comprise 11 intentional infrastructure or
telemetry accesses, 13 derived read-model accesses, 11 deprecated rewards
compatibility accesses, and 5 unmodeled historical classroom reads. The forms
subsystem and Student Potential read/upsert/AI paths are now server-owned.
Student Potential is a real mobile product surface, not merely a legacy API
seam. The Student Support Snapshot durable worker is now registered in
Sanctuary, and the marketing app no longer owns its routes or functions.

### Student-support worker consolidation

The August 2026 marketing-web cleanup removed the durable-agent UI but left
the Inngest endpoint and worker implementation in the marketing app. That
left a public presentation app owning privileged student evidence reads,
audit writes, and provider calls. The current boundary is:

1. Sanctuary owns the authenticated request, authorization, run record,
   evidence loading, bounded synthesis, audit trail, and explicit promotion.
2. Mobile calls Sanctuary for the review lane; it does not run the worker in
   the client bundle.
3. Marketing web no longer contains the durable-agent pages, run APIs, or
   Student Support/Teacher Summary functions. Its remaining Inngest handlers
   are separate ingestion/mutation workers and are tracked as a later
   platform-worker consolidation slice.
4. The worker remains draft-only and human-review-first; “free” here means
   decoupled from the marketing site, not an unaudited public AI endpoint.

Durable state is stored in the explicit `durable_agent_runs` and
`durable_agent_run_events` tables introduced by migration
`20260814040000_durable_agent_runs.sql`; the worker does not write to the
read-only `public.audit_logs` compatibility view.

The former marketing worker is now only a migration reference, not a second
canonical implementation. Mobile continues to call the same
`/api/durable-agents/*` paths, which are now served by Sanctuary directly.

Current order for the remaining boundary backlog:

1. Resolve migration-state drift and apply the already-authored deployment
   migrations through the normal release process; do not rewrite remote
   history from the review worktree.
2. Resolve the five unmodeled classroom historical tables.
3. Decide the fate of rewards compatibility and design server-owned derived
   read models for School Forest and Warm Mirror where their refresh authority
   and privacy semantics are confirmed.
4. Classify repository-shaped exceptions in `packages/self`, `packages/library`,
   `packages/admin`, and `packages/ai` as intentional local/realtime/ingestion
   boundaries or API migration candidates.
5. Move each migration candidate behind a contract-backed server handler and
   remove the client-side Supabase dependency only after the replacement is
   observed in the relevant screen flow.
6. Add a strict package-boundary gate once intentional exceptions are declared,
   so new direct client database calls fail review.

## Phase 5 — operations and deprecation

Deliverables: metrics/SLO dashboards, alerts, durable retention/jobs, incident
runbooks, deployment markers, legacy proxy sunset, and current architecture docs.

Acceptance: staging smoke tests cover Node/Bun, auth, Cedar, database, AI,
webhooks, sync, and rollback/recovery procedures.

# Recommended order

Do not start by rewriting handlers or changing frameworks. Start with Phase 0,
then Phase 1. The authorization fail-closed change and error sanitization are
small, high-value safety changes. Then do Phase 2 before increasing traffic or
adding more agent tools. Phases 3–5 can proceed slice-by-slice with green
boundaries.

# External guidance checked

- [Hono body-limit middleware](https://hono.dev/docs/middleware/builtin/body-limit)
  confirms the current body-limit approach and the need to handle overflow
  responses deliberately.
- [Hono timeout middleware](https://hono.dev/docs/middleware/builtin/timeout)
  notes that streaming responses need stream-specific timeout handling; this is
  relevant to the dedicated AI route.
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
  separates grants from RLS and recommends explicit exposure, RLS, and least
  privilege for exposed objects.
- [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/)
  treats traces, metrics, and logs as distinct observability signals.
- [oRPC contract/router guidance](https://orpc.dev/docs/contract-first/router-to-contract)
  supports keeping a lightweight contract surface separate from server business
  logic and exposing only the intended contract.

## Current readiness and execution strategy — 2026-08-14

The API is viable for an elegant production architecture, but it is not yet
production-complete. The current evidence is:

| Area | Status | Evidence / remaining risk |
| --- | --- | --- |
| API surface | Green | 191 active routes, 35 contract sources, 0 errors and no partial-client warnings. |
| Composition | Green | 35 native oRPC mounts and 4 isolated route boundaries pass the composition audit. |
| Error boundary | Green for active handlers | Raw handler errors are rejected by the API error audit; negative runtime probes still need to become repeatable CI checks. |
| Authorization | Green at static parity | 47 resources and 5 actions pass ZenStack/Cedar parity; cross-school and role-negative integration coverage must expand. |
| Sanctuary data boundary | Green | 0 direct Supabase findings in Sanctuary; legacy Core findings are down to 22 and other packages remain classified migration work. |
| Durable agents | Amber | Student Support and Teacher Summary are Sanctuary-owned with durable run/event persistence; provider, retry, retention, and staging Inngest smoke checks remain. |
| Platform workers | Amber | A Sanctuary worker slice now covers attendance, classroom, grading, wellbeing, and supported sync events. Marketing still contains the old unrelated worker source until parity is verified and removed. |
| Test coverage | Yellow | 154 API tests pass and V8 coverage is 39.59% statements / 31.94% branches / 40.11% functions / 41.41% lines; Student Potential, Library reads/writes/membership/map topology, Self journal entries, Sacred Missions, and worker replay now have direct scenario coverage, while staging worker evidence and broader critical-path branches remain incomplete. |
| Database delivery | Red for release | The migration audit reports 164 local files versus 166 linked records: 12 local records are unapplied remotely and 2 remote records are absent locally. The authored migrations must go through an explicit deployment/reconciliation process; no remote history rewrite is acceptable. |

The senior-architect completion model is layered evidence, not a single test
percentage. Every API slice is complete only when it has: a typed input/output
contract, explicit actor/subject/action authorization, stable error mapping,
idempotent write behavior, a handler test, negative authorization tests, a
realistic database or route probe, and deployment evidence for its migration.

The API quality gate is now available as `pnpm run audit:api-quality`. It runs
composition, error taxonomy, authorization parity, data-boundary, and typed
contract audits together. It is a structural gate; it complements, rather
than replaces, unit, integration, coverage, and staging smoke tests.

### Remaining implementation order

1. Finish Sanctuary/marketing worker parity, including event persistence,
   idempotency, retry semantics, and supported mutation allowlists.
2. Add a repeatable API test matrix: happy path, unauthenticated, wrong-role,
   cross-school, malformed input, provider/database failure, and duplicate
   submission for each mutation family.
3. Add route-level runtime smoke checks against a production-like database and
   Inngest signing key; test Node and Bun entrypoints where both are deployed.
4. Apply migrations through release automation and close the migration drift
   blocker before declaring any new route production-ready.
5. Remove the remaining marketing worker implementation only after the above
   evidence is green, then refactor the remaining legacy client seams in
   independently deployable slices.
