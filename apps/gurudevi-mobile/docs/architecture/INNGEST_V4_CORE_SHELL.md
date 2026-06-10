---
title: "Inngest v4 Core-Shell Architecture"
status: "active"
created: 2026-04-24
updated: 2026-04-29
author: "Naween"
tags: [reorganized]
---

# Inngest v4 Core-Shell Architecture

This document explains how to operationalize Inngest in this monorepo without letting workflow infrastructure leak into shared domain packages.

If you are evaluating model-driven durable agents, read this together with
[DURABLE_AGENTS_RND_GUIDE.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/DURABLE_AGENTS_RND_GUIDE.md).
This document is for durable workflows, not for general agent-loop design.

The current durable-agent demo lane lives separately at
`gurudevi-marketingWeb` `/durable-agents` and should be treated as R&D, not as
the canonical path for normal product workflows.

That R&D lane is intentionally provider-agnostic at the synthesis layer, so
capabilities can switch between supported model providers without rewriting the
workflow boundary or the domain-specific evidence loaders.

It answers four practical questions:

1. Where should Inngest live?
2. Do we repeat the same pattern for every package?
3. Which app should host workers for `gurudevi-mobile`?
4. What is valid for Inngest v4 as of April 2026?

## Executive Decision

Do **not** put an Inngest client in every package.

Use the pattern at **runtime boundaries**, not at every feature package boundary:

- `packages/*` define **domain contracts**, **payload schemas**, **pure business logic**, and **workflow-safe helper functions**.
- `apps/*` define **Inngest clients**, **serve/connect entrypoints**, **environment wiring**, **privileged adapters**, and **function registration**.
- `gurudevi-mobile` should usually be an **emitter** only.
- Background workers for mobile-originated events should run in a **server-capable shell**:
  - short term: an existing server app can host them
  - medium term: a dedicated worker app is cleaner if workflow count grows

## The Real Boundary

The key boundary is not "core vs everything else."

The real boundary is:

- **Pure, shareable, deterministic logic** vs
- **Runtime-coupled orchestration**

If code needs any of the following, it belongs in a shell, not in a shared package:

- `new Inngest(...)`
- `serve(...)` or `connect(...)`
- environment variables
- service-role credentials
- framework adapters
- HTTP/webhook entrypoints
- platform logging, tracing, or secrets

If code can be reused from web, mobile, worker, tests, and scripts without knowing the runtime, it belongs in a package.

## What Goes Where

### 1. Shared packages (`packages/*`)

Shared packages may own:

- event names
- event payload schemas
- event builder helpers
- domain services
- orchestration-friendly pure functions
- idempotency helper utilities

Shared packages must **not** own:

- an Inngest client singleton
- worker registration
- `serve()` handlers
- `connect()` bootstrapping
- runtime secrets
- direct assumptions about Astro, Expo, Vercel, Node workers, or mobile

Shared packages may, however, expose a **runtime bridge interface** when a
shared API needs to emit a workflow event after a successful domain action.

That bridge must remain:

- interface-only in the shared package
- shell-injected at app startup
- optional and failure-tolerant

This keeps shared code pure while still allowing domain success points to emit
durable events.

### 2. Core package (`@repo/core`)

`@repo/core` should hold only truly cross-domain concerns:

- shared primitives
- common event naming conventions
- common schema helpers
- cross-cutting utilities used by many domains

`@repo/core` should **not** become a dumping ground for every workflow contract in the system.

If an event belongs strongly to one bounded context, prefer that context owning the contract:

- `@repo/classroom` owns classroom events
- `@repo/community` owns community events
- `@repo/self` owns self/wellbeing events

If the repo later needs a central catalog, create a dedicated package such as `@repo/events` rather than turning `@repo/core` into a workflow registry monolith.

### 2.1 Shell-injected workflow bridges

Sometimes a shared API is the true success point for a workflow-worthy action.

Example:

- `gradingAPI.publishGrade(...)` lives in shared code
- but after publish succeeds, we want to emit `school/grade.published`

Do **not** solve that by importing an app shell Inngest client into shared code.

Use a shell-injected bridge instead:

1. shared package defines a small bridge interface
2. app shell injects the concrete emitter implementation at startup
3. shared API calls the bridge only after the primary action succeeds
4. the bridge emits the event from the shell-owned client

Current repo example:

- bridge interface: [runtimeBridge.ts](/C:/Users/Naween/projects/polymath-platform/packages/core/src/logic/events/runtimeBridge.ts)
- shared publish point: [grading.ts](/C:/Users/Naween/projects/polymath-platform/packages/core/src/api/grading.ts)
- shell injection: [inngestEvents.ts](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/lib/inngestEvents.ts) and [App.tsx](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/App.tsx)

Use this pattern only when the shared API is the real authoritative success seam.
Do not use it as a shortcut for avoiding proper shell boundaries everywhere else.

### 3. App shells (`apps/*`)

Each deployable runtime may own one shell:

- one Inngest client
- one function registration area
- one `serve()` endpoint or one `connect()` worker bootstrap

That does **not** mean one shell per feature package.

It means one shell per deployable runtime boundary.

Examples:

- `apps/gurudevi-mobile`: emitter shell
- `apps/gurudevi-marketingWeb`: web shell, but only a valid worker host if it is intentionally carrying backend orchestration responsibilities
- `apps/gurudevi-worker` or similar: dedicated orchestration shell when workflows become numerous, privileged, or operationally important

## Do We Repeat This Pattern For Every Package?

No.

Use this layering model instead:

1. **Event contract layer**
   - lives in shared packages
   - owns names, payload schemas, and helper constructors
2. **Domain logic layer**
   - lives in shared packages
   - owns pure logic and service interfaces
3. **Execution shell layer**
   - lives in apps
   - owns Inngest client, triggers, handlers, secret-bearing adapters, and runtime deployment

The repeated unit is not "every package gets Inngest."

The repeated unit is:

- each domain may define contracts
- each deployable app may expose a shell

## Durable Workflows vs Durable Agents

This document is about durable workflows.

Use Inngest when the system is:

- reacting to an event
- coordinating deterministic steps
- retrying external side effects
- running background orchestration

Do not automatically assume that future agentic features belong here.

If a feature requires:

- bounded reasoning
- dynamic tool choice
- draft synthesis
- pause and resume for a model-driven loop

that belongs in the durable-agent R&D lane, not in the default Inngest
workflow lane.

See:

- [DURABLE_AGENTS_RND_GUIDE.md](/C:/Users/Naween/projects/polymath-platform/docs/architecture/DURABLE_AGENTS_RND_GUIDE.md)
- [010-durable-agent-rnd-lane.md](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/010-durable-agent-rnd-lane.md)

## Recommended Structure For Gurudevi

### Mobile

`gurudevi-mobile` should usually:

- send events
- enqueue offline-safe intents
- avoid hosting workers

Why:

- Expo/mobile is not your durable worker runtime
- mobile credentials are weaker by design
- mobile connectivity is intermittent
- retries, service-role access, fan-out, and compensating actions belong server-side

### Current best-fit worker host

If you need one worker host today and already have Astro deployed, keeping functions in a server app is acceptable.

But treat this as an operational choice, not an architectural truth.

### Better medium-term shape

If Gurudevi workflows expand across multiple modules, prefer:

- `apps/gurudevi-worker`

That worker app should own:

- the Inngest client
- `serve()` or `connect()` bootstrapping
- all durable background functions
- privileged service adapters

The marketing site should not become the accidental home for all platform orchestration unless that is an explicit product/platform decision.

## Decision Rules

Use this checklist when deciding where a workflow belongs.

### Does everything go through Inngest?

No.

Most writes should **not** go through Inngest.

Use direct request -> database or request -> service -> database flows when the action is:

- user-facing and latency-sensitive
- simple and single-step
- safe to retry at the HTTP or client layer
- already protected by normal request validation and RLS
- not orchestrating cross-domain side effects

Use Inngest when the action is:

- long-running
- retry-worthy
- cross-domain
- involves multiple side effects
- needs durable execution across restarts
- scheduled or asynchronous by nature
- privileged and better handled off the user request path

### Practical discernment guide

Prefer **direct DB/API writes** for:

- create one record
- update one record
- save one user-owned private artifact
- perform normal interactive CRUD with immediate UI feedback

Prefer **Inngest** for:

- emit event -> trigger multiple reactions
- offline replay that should become durable server work
- fan-out notifications
- analytics/audit pipelines that should not block UX
- temporal workflows such as waits, retries, reminders, and scheduled actions
- cross-app or cross-domain reactions where the producer should stay decoupled from the consumer

An important middle pattern also exists:

- **direct-first, Inngest-on-replay**

This is useful when:

- the happy-path user action should stay direct and fast
- but offline replay or recovery should be escalated into durable server work

That means a feature can:

- write directly during normal online usage
- but hand selected queued mutations to Inngest when replaying from the outbox

This is the current direction for selected mobile sync mutations in Gurudevi.

Rule of thumb:

- if the user is waiting for the result and the write is simple, do it directly
- if the system is reacting, orchestrating, retrying, or coordinating, use Inngest

## Abstract Flow For Deciding What To Do Next

If you feel lost while implementing Inngest, use this abstract loop.

Do not start by asking "what code should I write next?"

Start by asking "what kind of thing is this?"

### The five-question flow

1. **What is the user or system intent?**
   - example: "teacher marks attendance"
2. **Is the happy path direct or durable?**
   - if it is interactive and simple, keep the primary write direct
   - if it needs retries, fan-out, or recovery, add Inngest
3. **What is the contract?**
   - identify the smallest stable payload that represents the event or queued intent
4. **What is the boundary?**
   - producer in app shell
   - contract in shared package
   - privileged execution in worker shell
5. **What is the next missing layer?**
   - missing contract
   - missing producer helper
   - missing worker handler
   - missing idempotency
   - missing follow-on domain event
   - missing observability

That last question is how to decide sequencing.

Do not expand in all directions at once.

Always fix the **next missing layer on the critical path**.

### The implementation ladder

For each workflow, climb this ladder in order:

1. direct action exists or is intentionally deferred
2. shared contract exists
3. producer helper exists
4. worker executes safely
5. worker writes are idempotent
6. worker emits a cleaner domain event if other flows may depend on it
7. logs, audit, and alerts are in place

If you are unsure what to do next, look for the first rung that is still missing.

### Example: how attendance was chosen

We did **not** pick attendance randomly.

The reasoning was:

1. `updateAttendance` already existed in the offline mutation registry.
2. Attendance is more operationally important than journal writes.
3. The repository already had an idempotent upsert path for attendance.
4. That made attendance a good candidate for the next durable replay slice.
5. After replay worked, the next missing layer was a proper domain event:
   - `school/attendance.recorded`

That is the pattern to reuse:

- choose one real workflow
- verify a stable direct/domain path exists
- move selected replay into Inngest
- then promote successful replay into a reusable domain event

### Short heuristic for future work

When deciding the next step, prefer this order:

1. close contract drift
2. remove duplicate producer logic
3. make writes idempotent
4. emit domain events after successful durable execution
5. add observability before adding more workflow volume

That order keeps the system understandable while it grows.

### Put it in a shared package when

- it defines event payload shape
- it is deterministic logic
- it transforms inputs to outputs
- it can run without secrets
- it can be reused by multiple shells

### Put it in an app shell when

- it needs `step.run()`
- it calls external APIs
- it writes with elevated privileges
- it depends on environment variables
- it is deployed and observed as a worker

### Create a dedicated worker app when

- workflows are no longer incidental to the web app
- many domains emit events into one orchestrator
- you need independent scaling or deployment cadence
- you need operational isolation from the public web tier
- workflow runtime requirements differ from the website runtime

## Inngest v4 Guidance That Matters Here

As of April 2026, the important v4 realities are:

### 1. Prefer v4-native event definitions

Inngest v4 moved away from the old centralized client schema pattern.

Prefer:

- `eventType(...)`
- `staticSchema(...)` or runtime schemas
- triggers inside `createFunction({ ..., triggers: [...] })`

Do not design new architecture around legacy v3-style centralized schema registration on the client.

### 2. Development mode is explicit

In v4, default mode is cloud-oriented.

For local development:

- set `INNGEST_DEV=1`, or
- set `isDev: true` intentionally in the client where appropriate

Do not assume dev mode is implicit.

### 3. Production requires proper signing

Production workers need correct key handling:

- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`

These must stay in server-capable shells only.

### 4. Use `serve()` vs `connect()` deliberately

Use `serve()` when:

- deploying on serverless or web-framework infrastructure
- you want the simplest adoption path
- the worker lives behind an HTTP endpoint

Use `connect()` when:

- deploying a dedicated long-running Node worker
- you want lower latency and better worker elasticity
- you want to avoid serverless timeout pressure

Industry direction is clearly toward:

- small event-emitting clients
- server-hosted workflow runtimes
- more dedicated worker deployments for important orchestration
- typed contracts close to domains, not giant central registries

For this repo, that means:

- mobile emits
- shared packages define contracts and pure logic
- one server shell runs workflows
- graduate to a dedicated worker app when orchestration becomes first-class

## Best Practices For This Repo

### Contract ownership

- Keep event names stable and domain-owned.
- Prefer names like `domain/entity.action` or another single canonical convention.
- Do not let every app invent event names independently.

### Idempotency

- set event `id` at the producer when duplicate sends are possible
- add function-level idempotency when business semantics require "once per logical action"
- make database writes idempotent or conflict-safe

### Step boundaries

- wrap every external side effect in `step.run()`
- keep step IDs stable
- keep each step narrow and meaningful
- do not bury multiple unrelated side effects in one step

### Domain purity

- shared services should expose business operations
- shells should inject privileged clients and call those services
- avoid embedding business rules directly inside Inngest handlers

### Deployment topology

- one shell per deployable runtime
- one registration surface per worker app
- organize functions by domain folders, not by framework route files

### Observability

- attach correlation IDs from producer to workflow
- log event IDs, entity IDs, and tenant/school IDs
- keep analytics and audit writes explicit and retry-safe

### Correlation and tracing

Every durable workflow should have:

- a `correlationId` that stays stable across the workflow chain
- a `causationId` that points to the immediate parent action or event

Practical rule:

- for mobile replay, seed `correlationId` from the queued mutation ID
- keep that same `correlationId` as the workflow fans out into domain events
- set `causationId` to the event or mutation that directly triggered the next step

This gives you two useful debugging views:

- **whole journey** via `correlationId`
- **direct parent-child edge** via `causationId`

In the current marketing worker shell, audit rows now persist correlation metadata and a trace endpoint exists at:

- `/api/inngest/trace?correlationId=...`

That endpoint is meant for operational debugging and incident triage, not public product usage.

## New Developer Guide

If a new developer opens this repo and feels disoriented, they should follow this path.

### Step 1: Understand the topology

Read:

- this document
- [009-inngest-hosting-topology.md](/C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/decisions/009-inngest-hosting-topology.md)

Memorize the current rule:

- mobile emits
- marketing web hosts workers
- shared packages own contracts and pure logic

### Step 2: Find the three locations for any workflow

Every workflow has three homes:

1. **Contract**
   - shared package event definition
2. **Producer**
   - app or shared helper that sends the event
3. **Worker**
   - server shell handler that receives and processes it

If you cannot point to all three, the workflow is not fully integrated.

### Step 3: Ask the discernment question first

Before adding a new event, ask:

- should this be a direct write, or should this be durable orchestration?

Do not start with Inngest by default.

### Step 4: If it should use Inngest, implement in this order

1. create or reuse a shared event contract
2. add or reuse a producer helper
3. add a worker handler in the server shell
4. make the handler retry-safe and idempotent
5. add correlation and logging fields

If the real success seam lives in shared code, insert one more check:

- should this use a shell-injected workflow bridge rather than a direct shell emitter call?

### Step 5: Validate the workflow shape

A new workflow change should be reviewable with these questions:

- what emits it?
- who owns the contract?
- where does it execute?
- what is the idempotency strategy?
- what happens if it retries?
- how do we trace it in production?

### Starter checklist for adding a new workflow

- decide direct-write vs Inngest
- define the payload contract
- include entity/tenant/correlation fields
- centralize the producer call
- if the success seam is in shared code, define or reuse a shell-injected bridge
- add the server handler
- wrap side effects in `step.run()`
- make writes idempotent
- add logs/audit/alerts as needed

## Current Repo Assessment

The repository now has a valid working core-shell path, but it is still not the end state.

### What looks directionally correct

- the idea of keeping orchestration out of shared packages
- mobile acting as an emitter shell
- web hosting a worker shell
- domain services being injected into handlers

### What is still incomplete or worth improving

1. Some adjacent docs still reflect earlier "put everything in marketingWeb" or "each module gets its own Inngest folder" thinking. Those should be treated as legacy guidance when they disagree with this document.
2. `packages/core/src/logic/events/schemas.ts` is still acting like a centralized registry. That is acceptable for now, but long term the cleaner shape is domain-owned contracts with a thinner shared catalog.
3. The worker set is now real for selected flows, not exhaustive for the whole product. Production readiness should be evaluated per workflow family, not assumed monorepo-wide.
4. Correlation, traceability, and audit conventions are in place, but failure routing and alert ownership still need to be made explicit for critical workflows.
5. Vercel deployment behavior, signing-key posture, preview/prod separation, and replay runbooks still need a full operational pass before this can be called fully hardened.

These gaps do not invalidate the core-shell model.

They do mean we should treat the current implementation as a **working production-shaped foundation** rather than a finished orchestration platform.

## Full Integration Roadmap

Using Inngest in production is much more than:

- one client
- one `/api/inngest` route
- two handlers

That is only the **runtime shell**.

A production-grade integration also needs:

- event contract governance
- producer discipline
- idempotency strategy
- retry-safe handler design
- observability
- environment and secret management
- local development ergonomics
- deployment checks
- operational runbooks

### Phase 0: Architecture Lock

Goal: freeze the topology so implementation work stops moving under our feet.

Required outcomes:

- `gurudevi-mobile` remains emitter-only
- `gurudevi-marketingWeb` is the current worker host
- shared packages own event contracts and pure logic
- new workflows follow the producer / contract-owner / worker-host model

This phase is now mostly done in documentation.

### Phase 1: Contract Foundation

Goal: make event contracts explicit, typed, and stable.

Required outcomes:

- every production event has a named shared contract
- every handler uses a shared contract, not stringly-typed ad hoc triggers
- event naming is canonical and documented
- payload fields are reviewed for tenant, actor, entity, and correlation needs
- contract ownership is assigned per domain

What to consider:

- which events are domain events vs sync/infra events
- which fields are required for retries and auditing
- whether contracts should stay in `@repo/core` or move into domain packages over time

### Phase 2: Producer Standardization

Goal: make all event producers predictable and safe.

Required outcomes:

- mobile emission helpers exist for each workflow trigger
- event IDs are set when duplicate sends are possible
- correlation IDs are passed through from UI / request / mutation queue
- offline mutation replay and event sending semantics are clearly separated
- producers never construct payloads ad hoc in multiple places
- shell-injected bridge seams are documented when shared APIs emit workflow events

What to consider:

- whether a shared `emitXEvent(...)` helper layer should exist
- whether offline queue records should map one-to-one to event IDs
- how mobile retry behavior interacts with Inngest retry behavior
- whether the authoritative success point lives in shared code and therefore needs a bridge

### Phase 3: Handler Hardening

Goal: make workflow handlers retry-safe and operationally trustworthy.

Required outcomes:

- every external side effect is wrapped in a stable `step.run()`
- step names are deterministic and meaningful
- every database write is idempotent or conflict-safe
- every privileged operation is isolated to the server shell
- business logic is delegated into reusable services where possible
- no handler depends on implicit ambient state

What to consider:

- which writes need explicit idempotency keys
- which steps should be split further for partial retries
- which workflows need compensation or dead-letter procedures

### Phase 4: Environment and Hosting Readiness

Goal: make the Vercel + Inngest deployment safe and repeatable.

Required outcomes:

- production keys are correctly provisioned
- preview and production environments are clearly separated
- Vercel deployment protection does not block Inngest sync/invocation
- runtime limits are reviewed for all long-running functions
- local development instructions are current and tested

What to consider:

- `INNGEST_EVENT_KEY`
- `INNGEST_SIGNING_KEY`
- whether `INNGEST_DEV=1` is required locally
- whether any functions are too long or too large for the current Vercel runtime posture

### Phase 5: Observability and Operations

Goal: make workflows diagnosable in real incidents.

Required outcomes:

- logs include event ID, correlation ID, tenant/school ID, and entity ID
- failures are visible in one place
- audit and analytics writes are deliberate and retry-safe
- operators know how to replay, inspect, and triage failed executions

What to consider:

- Sentry integration for function failures
- structured logging format
- whether important workflows need custom alerts
- how to trace from mobile action to workflow execution to DB side effect

### Phase 6: Domain Rollout

Goal: expand from the shell foundation into the actual product workflows.

Candidate rollout areas:

- offline mutation replay
- wellbeing interventions
- notification fan-out
- scheduled reports / digests
- cross-domain reactions such as attendance -> wellbeing or classroom -> parent communication

What to consider:

- which workflows are worth durable execution vs simple direct request handling
- which workflows are latency-sensitive and should not be backgrounded
- which workflows need cron/schedule support later

### Phase 7: Governance and Agent Steering

Goal: make future agent-driven work consistent instead of drifting back to mixed patterns.

Required outcomes:

- a short implementation checklist exists for every new workflow
- ADRs and architecture docs stay synchronized with code
- agents know the allowed boundaries
- review criteria for workflow changes are explicit

Recommended steering prompt for future agents:

- Do not instantiate `Inngest` in shared packages.
- Do not host workers in mobile.
- Put shared event contracts in packages and runtime execution in app shells.
- Every new workflow must identify producer, contract owner, worker host, idempotency strategy, and observability fields.
- Prefer current Inngest v4 docs over inherited repo patterns when they differ.

## Production Readiness Checklist

The integration should not be called "production-ready" until the following are true.

### A. Contract readiness

- every live event has a shared contract
- every live handler uses that contract
- payloads include the identifiers needed for tracing and retries
- no contract drift exists between producers and consumers

### B. Producer readiness

- mobile emission paths are centralized
- duplicate sends are either prevented or made harmless
- event IDs and correlation IDs are consistently set where needed

### C. Handler readiness

- no `any`-based workflow definitions remain
- all side effects live in `step.run()`
- all writes are idempotent
- step names are stable across deploys

### D. Security and environment readiness

- secrets only exist in server shells
- signing and event keys are provisioned correctly
- no privileged workflow path depends on client-exposed secrets

### E. Operations readiness

- workflow failures are visible
- replay/debug procedure is documented
- logs are structured and correlated
- critical functions have owner awareness

### F. Deployment readiness

- local dev flow is documented and tested
- preview/prod behavior is understood
- runtime limits are reviewed
- deploy protection and sync behavior are verified

## What We Still Need To Consider

If the question is "what is left beyond the current code we already have?", the remaining work is mostly in these categories:

1. **Producer layer**
   - where and how mobile actually emits production events
2. **Workflow inventory**
   - which business flows deserve Inngest at all
3. **Operational guarantees**
   - idempotency, retries, step granularity, and replay behavior
4. **Observability**
   - logs, Sentry, audit trails, and correlation
5. **Environment discipline**
   - dev, preview, prod, secrets, deployment protection
6. **Governance**
   - how agents and developers keep using one pattern consistently

## Recommended Next Move

For Gurudevi, the recommended operational plan is:

1. Keep `gurudevi-mobile` as emitter-only.
2. Keep workflow contracts in shared packages.
3. Keep privileged execution in one server shell.
4. Short term, you may continue using the existing server app as the worker host.
5. Medium term, move durable workflows into a dedicated worker app if orchestration becomes central to the platform.
6. Refactor toward v4-native event definitions and remove `any`-based handler creation.

## Recommended Implementation Sequence

If we continue implementation from here, the safest order is:

1. Finish the shared contract inventory for the first real workflows.
2. Build centralized producer helpers on mobile/web for those workflows.
3. Harden the handlers with explicit idempotency and correlation fields.
4. Add observability and failure-triage conventions.
5. Validate Vercel + Inngest production environment behavior.
6. Roll out one workflow at a time instead of trying to "Inngest-ify" the whole platform at once.

## Important Honesty Boundary

We can absolutely move this toward production-level quality, but we should not promise "nothing is missed."

The honest target is:

- no known architectural gaps for the chosen workflow set
- no known contract drift
- no known idempotency holes in implemented handlers
- verified deployment and failure visibility

That is a realistic production standard.

## Non-Goals

This document does **not** recommend:

- an Inngest client in every package
- running durable workflows inside the mobile app
- putting all business rules inside handlers
- treating the marketing site as the permanent orchestration home by default
- scaling a monorepo by building one giant central event file forever

## Practical Rule Of Thumb

If you are asking:

- "Should this package know about Inngest?"

the default answer is **no**.

If you are asking:

- "Should this deployable server runtime know about Inngest?"

the answer is usually **yes**, if it emits or executes workflows.

---

_Updated: 2026-04-28_  
_Architecture Level: Sovereign Runtime Boundary_  
_Status: Canonical guidance, with real workflows live and remaining work concentrated in operational hardening and domain rollout._
