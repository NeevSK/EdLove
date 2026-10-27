---
title: "API v0-to-v1 Gate D — Domain Capability Constitution and Migration Map"
status: "draft"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, gate-d, domains, capabilities, migration, scalability, governance]
---

# API v0-to-v1 Gate D — Domain Capability Constitution and Migration Map

> **Status correction — 2026-10-23:** This is a deliberately preserved draft,
> not the Gate D constitution. It was scoped from the API migration evidence
> alone and therefore over-centred Classroom Learning. Before any Gate D plan
> can become active, the platform's actual applications, packages, schemas, UI
> surfaces, and existing vision documents must establish the full human-first
> Sanctuary/ERP domain map. It authorizes no implementation work.

## Decision

Gate D is the top-down phase. It turns the Gate C proof—one safe attendance mutation—into a domain-by-domain operating model for the platform. It does **not** authorize an endpoint-by-endpoint rewrite, a new repository per feature, a BFF-by-default, or v0 deletion.

The primary unit of design and migration is a **domain capability family**. A capability family owns a coherent piece of durable product truth, its rules, commands, queries, events, and recovery semantics. Individual screens, tables, hooks, and tickets do not get to become architectural boundaries merely by existing.

```text
product intent
  -> domain capability family
    -> command/query/effect capabilities
      -> one application boundary
        -> transport adapters (v1, BFF only when justified, webhook, worker)
          -> persistence/integration ports
```

## Why Gate D exists

The current codebase has many legitimate functions, but its historical growth has left several ways to reach the same product truth: native oRPC namespaces, Hono routes, API facades, direct clients, hooks, table-oriented access, and some special protocol handlers. Adding a v1 route for each legacy surface would preserve that fragmentation under a newer prefix.

Attendance was chosen only because it is a hard enough mutation to prove the v1 mechanics: authority, active scope, receipt, idempotency, audit, and replay. It is not the organizing principle for the platform. It belongs to the Classroom Learning domain and must be designed alongside roster, enrolment, sessions, submissions, grading, and communication relationships.

## North-star shape

### The five canonical domain families

| Domain family | Owns durable truth and rules | Does not own |
| --- | --- | --- |
| Identity & Scope | account identity, active bond/capacity, consent, capability discovery, session-facing scope state | classroom truth, product activity feeds, arbitrary profile edits in other domains |
| Classroom Learning | school/classroom/grade-class relationships, roster/enrolment, attendance, learning material, assignments, submissions, assessment and feedback | global identity, generalized notification delivery |
| Personal Practice & Wellbeing | person-owned private reflections, goals, mood/wellbeing records, drafts and personal visibility | institutional classroom truth or social moderation |
| Community & Communication | groups, posts, notices, membership-facing intent, conversation/announcement intent, audience selection | delivery-provider retries or unrelated domain mutation authority |
| Platform Operations | receipts, audit infrastructure, outbox/effect state, consent records, feature policy, operational projections | product workflows masquerading as infrastructure |

The first Gate D migration family is **Classroom Learning**, because Gate C is its embedded proof and the current attendance surface already exposes the key questions: roster authority, scope, durable writes, recovery, sensitive data, and downstream communication.

### Nested modules, not a flat field of micro-domains

```text
classroom-learning
├─ membership-and-roster       # grade classes, enrolment, teaching assignment
├─ attendance                  # register, batch record, correction, history, reporting
├─ learning-content            # material and planned learning content
├─ assignments                 # assignment lifecycle and submission
├─ assessment                  # marks, feedback, publication
└─ classroom-coordination      # classroom-level notices and teacher coordination intent
```

These are modules inside one domain family. They may have focused contracts and ports, but they share the same language for school/grade-class authority, membership, academic-cycle validity, lifecycle receipts, and privacy. Splitting each into a repository, API client, or database service before that shared language is stable is prohibited.

## Capability model

### Capability is not a route, screen, table, or repository

A capability is the smallest stable product promise that can be authorized, tested, observed, and evolved independently. It has a verb, a target, an actor/scope rule, a lifecycle, a recovery policy, and an information boundary.

Examples:

| Good capability | Why it is a capability | Bad replacement |
| --- | --- | --- |
| `classroom.attendance.batch-record` | One actor records a scoped register and needs idempotent recovery | `AttendanceRepository`, `AttendanceScreenApi`, or `daily_attendance.upsert` as public API |
| `classroom.roster.list-active` | A scoped query with an explicit membership/time rule | `getStudentsForPage` |
| `classroom.assignment.submit` | A durable learner action with receipt semantics | `submitAssignmentMutationV2` |
| `community.notice.publish` | A publication intent with audience and later delivery effect | `notificationsApi.send` |
| `identity.scope.select-active` | Changes the authorization context for later work | `setCurrentSchool` in a generic store |

### Lifecycle classes determine implementation burden

| Lifecycle | Example | Required machinery |
| --- | --- | --- |
| Read | roster list, attendance history | scope/policy, consistency/caching rule, privacy projection |
| Draft | reflection draft | actor ownership, autosave/conflict policy, no product activity by default |
| Proposal | publish a notice for approval | authority, review state, auditable transition |
| Commit | record attendance, submit assignment | transaction, idempotency, receipt/replay, audit decision, conflict policy |
| External effect | deliver a notice, charge, provider sync | committed intent first, outbox/effect state, retry/deduplication/provider repair |

A command cannot be admitted merely because it is a `POST`. If it changes durable truth, it is a commit. If it invokes an external system, it is an external effect even when called by a button in the same screen.

### The required capability card

Every candidate v1 capability receives a short, reviewable card before code:

```text
ID and domain:       classroom.attendance.batch-record
Product promise:     What a user can reliably accomplish
Actor and scope:     Server-derived principal, active bond, school, grade class
Lifecycle:           Read / draft / proposal / commit / external effect
Input/output:        Typed contract; excluded authority facts named explicitly
Policy:               Cedar/action/resource and persisted recheck requirements
Truth mutation:       Tables/aggregates changed; transaction boundary
Recovery:             Idempotency identity, receipt state, replay/conflict behavior
Effects/events:       Audit, domain event/outbox, activity, telemetry—each decide yes/no
Privacy:              Data class, audience, retention owner, redactions
Clients:              Intended consumers; offline/cache/retry rule
Compatibility:        v0 operations/callers affected; migration state
Evidence:             Required G0–G5 checks and operational SLO/monitoring
Non-goals:            What this capability explicitly will not absorb
```

No new route, repository, client hook, or BFF endpoint is created without the card. The card is intentionally small enough to reject bad architecture early.

## Boundary constitution

### Package and runtime responsibilities

| Layer | Owns | Must not own |
| --- | --- | --- |
| `@repo/core` | capability contracts, application commands/queries, domain types, ports, result/failure vocabulary, event decisions | Hono context, ZenStack/Prisma clients, direct HTTP, browser cache state, server secrets |
| `@repo/classroom` | reusable Classroom domain rules only where a real shared abstraction is proved | cross-domain platform glue or app-specific transport |
| `apps/sanctuary-api` | Hono/oRPC v2 adapters, existing request-context derivation, policy invocation, transaction/persistence adapters, specialized ingress/egress | a second domain model or browser-specific state |
| `apps/gurudevi-web` | web composition, presentation, browser experience; narrow BFF only with an approved capability reason | direct protected-domain writes or duplicate authorization |
| `apps/gurudevi-mobile` | native presentation, offline interaction, approved sync adapters | parallel server truth or a mobile-only domain API |
| Platform operations | generic receipt/audit/outbox mechanics with domain-provided metadata | making product audience/retention decisions for a domain |

### The admission test for a new module or repository

Create a module only if all are true:

1. it owns a stable business rule or replaceable external boundary;
2. at least two real capabilities use it, or one high-risk capability demonstrably needs isolation;
3. its inputs/outputs use domain language rather than screen/table language;
4. its placement does not cross the monorepo boundaries above; and
5. an existing module cannot own it without becoming incoherent.

Otherwise, add the capability to its domain module. One feature does not justify a repository. One database table does not justify a client. One hook does not justify a service layer.

### BFF admission rule

`/web-bff/*` is allowed only when the browser has a real adapter concern: cookie/session exchange, SSR aggregation, SEO/image response, browser-only cache transformation, or safely composed read model.

It is rejected when it merely proxies one v1 call, hides an authorization decision, reaches protected database tables directly, or becomes the new place where domain writes are invented.

## Classroom Learning: first full-domain map

### Shared invariants

All Classroom Learning capabilities must use the same canonical facts:

- authenticated principal and persisted active bond;
- school, academic cycle, grade class, and classroom relationship—not names or fallback guesses;
- current teaching assignment/membership where the action is staff-scoped;
- learner enrolment eligibility at the operation's relevant date;
- server-owned authority facts, never body-nominated school/actor/role;
- a declared correction model when a later action changes prior educational truth.

### Capability portfolio

| Module | Capability family | Initial canonical capabilities | Lifecycle / risk | Gate D disposition |
| --- | --- | --- | --- | --- |
| Membership & roster | teaching and learner membership | list active roster; inspect assigned grade classes; enrol/transfer/leave learner | reads + high-integrity commits | establish shared authority/query vocabulary first |
| Attendance | daily register | batch record; read register; read history; report; amend/correct | sensitive commit/read | promote after correction lineage design; Gate C batch record is seed |
| Learning content | materials | list, create, update, publish/archive material | draft/proposal/commit | map current educational routes; do not merge with assignments |
| Assignments | assigned work | list, create/update/publish assignment; submit; return/reopen | commits with learner/teacher transition rules | reuse receipt discipline from existing settlement only after parity card |
| Assessment | grades and feedback | draft mark; submit mark; publish feedback; read progress | highly sensitive commit | separate draft vs publish; no casual upsert API |
| Classroom coordination | classroom intent | create teacher note; publish classroom notice intent; list coordination feed | proposal/commit/effect | leave provider delivery to Communication/Operations adapters |

### Attendance correction is a separate capability family

`batch-record` is not allowed to become a disguised correction API. Gate D must design:

```text
original attendance operation
  -> correction proposal / authority reason
  -> amendment operation with causal link
  -> effective register projection
  -> audit trail and recipient/activity policy
```

Until the causal link, authorization, retention, and reporting effects are specified, corrections stay deferred. Overwriting an attendance row without that model is not a v1 solution.

## Migration operating model

### The domain conveyor

Every domain follows the same sequence. No later step may be claimed from an earlier one.

```text
1. Inventory + caller map
2. Domain language and invariant map
3. Capability cards + disposition
4. Shared kernel gaps only
5. One vertical capability admission
6. Capability-family migration
7. First caller migration behind evidence
8. Observe and repair
9. v0 retirement proposal, per operation
```

### Step 1 — inventory and blast radius

Use the Gate A ledger as the base, then produce a domain slice containing every v0 route/procedure, contract member, direct database/API caller, browser/mobile consumer, worker/webhook/agent caller, and documentation claim. Classify each as:

- **retain-v0**: must stay compatibility-only for now;
- **promote-v1**: semantic candidate with a named capability card;
- **merge**: duplicated legacy surface maps to one canonical capability, while both v0 forms remain until approved retirement;
- **specialized transport**: stream, webhook, upload, external ingress/egress; does not become ordinary CRUD;
- **blocked**: missing authority, data model, migration, or product policy decision.

An inventory that only lists routes is incomplete. It must also list callers and write paths.

### Step 2 — define the domain grammar before APIs

Write a concise glossary and relation map. In Classroom Learning, distinguish `school`, `classroom`, `grade class`, `academic cycle`, `teaching assignment`, `enrolment`, `attendance day`, `session`, `assignment`, `submission`, `grade`, and `publication`. If two existing APIs use the same word differently, do not hide that conflict behind a v1 alias; make the distinction explicit.

### Step 3 — capability portfolio and sequencing

Sequence by shared invariants and risk, not route count:

1. scope/membership reads needed to make authority understandable;
2. one high-value durable commit with recovery proof;
3. its immediately adjacent reads/projections;
4. its correction/reversal design where applicable;
5. external effects only after the intent lifecycle is stable.

For Classroom Learning, the recommended first wave is:

```text
assigned-grade-classes + active-roster reads
  -> attendance batch record (already admitted)
  -> attendance register/history reads
  -> attendance correction model
  -> assignment submission / publication transition
  -> assessment draft/publish
```

### Step 4 — implement only the missing seam

Reuse proven shared rules. Extract only when v0 and v1 truly share a stable domain primitive. Do not port an entire legacy handler merely to avoid thinking. Do not duplicate persistence logic just to leave v0 untouched; make an additive shared primitive and characterize v0 where the rule is genuinely common.

### Step 5 — migrate callers deliberately

The first consumer of a capability is selected, not accidental. Define its retry, cache invalidation, offline behavior, and user-visible recovery state. A caller migration does not authorize a broad client rewrite.

| Caller type | Default migration rule |
| --- | --- |
| Web UI | use narrow v1 client function/hook after the canonical contract and route evidence exist |
| Mobile | migrate only with explicit offline/replay policy and capability-equivalence test |
| Worker/agent | call application/capability boundary, not a browser BFF or UI facade |
| Webhook/provider | use specialized ingress adapter that invokes the domain command |
| Existing v0 client | preserve until the capability has parity, caller inventory, observed rollout, and a retirement decision |

### Step 6 — retirement is a proposal, never cleanup

For a single v0 operation, prepare a deletion proposal naming exact route(s), contract(s), aliases, client(s), fallback(s), compatibility window, telemetry evidence, migration state, and rollback plan. It needs explicit human approval under the Deletion Veto. There is no bulk "remove v0" ticket.

## Expansion map after Classroom Learning

| Domain | First coherent slice | Critical design question | Unsafe shortcut to reject |
| --- | --- | --- | --- |
| Identity & Scope | active scope selection and capability discovery | How does a capacity transition invalidate cached authority? | global mutable `currentSchool` as authorization |
| Personal Practice & Wellbeing | drafts + privacy-preserving read/write | Who can ever see a record, and what is retained? | sending raw records to activity/telemetry |
| Community & Communication | notice publication intent + audience | What is publication versus delivery versus moderation? | making provider send the source of truth |
| Platform Operations | outbox/effect repair for approved effects | What must be exactly-once versus idempotent-at-least-once? | generic event bus with no owner/schema/retention |

The order may change only with a written leverage/risk rationale. A new stakeholder request does not get to jump the constitution and create an isolated API island.

## Events, activity, audit, telemetry, and effects

These are separate decisions on each capability card:

| Stream | Purpose | May contain | Must not become |
| --- | --- | --- | --- |
| Audit | accountability/security/history | minimal actor, target, operation, outcome | user-visible feed by accident |
| Domain event/outbox | reliable internal follow-up after commit | stable domain facts, correlation identifiers | unbounded analytics payload |
| Product activity | user-facing meaningful change | approved audience/visibility/redacted summary | surveillance log or every click |
| Telemetry | reliability/performance diagnosis | pseudonymous/minimized technical facts | durable product truth |
| External effect state | provider delivery/payment/sync repair | provider reference, attempt/retry/result | direct side effect without committed intent |

Default: a capability emits audit only when mandated, telemetry only when its operational question is clear, and product activity only with an approved audience, purpose, visibility, consent, and retention rule. Attendance stays **no product activity by default**.

## Scale constraints and pragmatic controls

### What scales

- One stable capability vocabulary per domain family.
- Small contracts, application commands/queries, and ports with real replaceable boundaries.
- Transaction-local mutation adapters for commits.
- A machine-readable capability ledger tied to source and caller evidence.
- Per-capability observability correlated by request and operation ID.
- Additive extraction from v0 only when the shared rule is proven.

### What does not scale

- one API client/repository/service per screen or feature ticket;
- generic CRUD for educational or sensitive truth;
- a single mega-router or a single mega-domain package;
- BFFs that own write logic;
- "events" that conflate activity, audit, analytics, and effects;
- blanket cache invalidation/retry with no command receipt semantics;
- rewrites whose only acceptance criterion is a cleaner folder tree.

### Capacity triggers

| Signal | Required response |
| --- | --- |
| A module has unrelated vocabulary/invariants | split by capability family inside the domain, not by UI screen |
| The same authority/persistence rule is duplicated in two admitted capabilities | extract a shared domain primitive after characterization tests |
| A capability needs a provider retry/reconciliation loop | model committed intent + effect state; do not run it inline in the request |
| A browser needs multiple canonical reads for one view | consider an approved read-composition/BFF adapter; preserve source capability ownership |
| A domain crosses a legal/privacy boundary | create a dedicated privacy/review gate before expanding the API |
| A v1 contract changes incompatibly | create a new capability revision or explicit version strategy; never silently mutate product meaning |

## Ruthless hostile review protocol

### Before any capability implementation

Reject the proposal if any answer is missing:

1. What product promise does this make, in one sentence?
2. Which domain owns it, and why is it not an existing sibling capability?
3. What facts are client-provided versus server-derived?
4. What happens if the request is retried, duplicated, times out, partially fails, or arrives after scope changes?
5. What exact tables/aggregates/effects change, in what transaction?
6. Who can observe the outcome, and what data must be redacted?
7. Which v0 routes/callers/aliases are affected, even if none are changed now?
8. Why is a new module, port, repository, BFF, or event required rather than existing vocabulary?

### Automatic rejection conditions

- “We need a repository for this feature” with no stable boundary proof.
- A request body supplies school, actor, role, organization, or authority facts.
- A durable mutation has no receipt/idempotency decision.
- A correction overwrites prior truth without causality/audit/reporting policy.
- A product activity event contains sensitive educational/wellbeing payload without audience/retention policy.
- A BFF directly writes protected truth or becomes a shadow authorization layer.
- A route is mounted by wildcard or copied from v0 without a capability card.
- A migration promises deletion without a caller inventory and explicit approval.
- A test double is presented as proof of real database concurrency, provider delivery, or device/offline behavior.
- A refactor changes unrelated v0 code or removes a fallback/test to make the target look cleaner.

### Per-turn engineering gate

1. State the Bounding Triad.
2. Inspect the domain ledger, callers, types, and installed dependency declarations relevant to the change.
3. Implement the smallest additive seam.
4. Run evidence at the required level and state what it does **not** prove.
5. Read raw `git diff` deletions first; invoke the Deletion Veto for any working behavior removal.
6. Update the capability card and ledger before accepting the next adjacent capability.

## Gate D deliverables

1. A maintained, machine-readable domain capability map derived from the Gate A ledger.
2. Domain grammars and invariant maps, starting with Classroom Learning.
3. Capability cards and a disposition for every Classroom Learning v0 operation/caller.
4. A v1 module map showing `@repo/core` contracts/application seams and Sanctuary adapters without cross-boundary pollution.
5. A first-caller migration plan for attendance, including offline/recovery and rollout evidence.
6. A correction/amendment design decision for attendance before correction code exists.
7. An event/activity/audit/telemetry matrix for Classroom Learning.
8. A per-operation v0 retirement template, with no retirement carried out in Gate D by default.

## Gate D exit criteria

Gate D is complete only when Classroom Learning is understandable as one coherent capability family: its vocabulary, invariants, route/caller inventory, capability cards, sequencing, event choices, and v0 disposition are all explicit and source-grounded.

It is **not** complete when there is merely a new folder tree, a list of endpoints, another generic repository layer, or a second attendance route. Full caller migration, attendance corrections, real-database concurrency evidence, and v0 retirement are subsequent governed work, not claims Gate D can make in advance.

## Recommended immediate execution order

1. Generate the Classroom Learning domain slice from the Gate A capability ledger and caller inventory.
2. Write its grammar and shared invariant map; resolve classroom versus grade-class ambiguity explicitly.
3. Produce capability cards/dispositions for roster, attendance, material, assignment, submission, grading, and coordination surfaces.
4. Design attendance correction lineage before adding any correction endpoint.
5. Add the first narrow v1 attendance client and one intentionally chosen caller only after its operational/offline policy is reviewed.
6. Use the evidence from that caller to decide the next Classroom capability family.
