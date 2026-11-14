---
title: "Product Activity Event Layer and Top-Down API Design"
status: "draft"
created: 2026-10-23
updated: 2026-10-23
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, events, activity, privacy, audit, product-analytics]
---

# Product Activity Event Layer and Top-Down API Design

## Decision in brief

Gurudevi needs an intentional product activity event layer: a privacy-bounded
record of meaningful user interactions and server outcomes that can improve UX,
support recovery, reveal reliability problems, provide aggregate product
learning, and supply selected compliance evidence. It is not a surveillance
ledger, a replacement for domain records, or a reason to capture every click or
store message/educational content in analytics.

This layer is a shared platform capability. It sits beside identity,
authorization, operation receipts, and observability. It does not create a
separate per-feature analytics stack.

The current API direction remains a modular monolith: Hono hosts HTTP concerns,
native oRPC is the canonical first-party command/query transport, and selective
read-only OpenAPI is an interoperability adapter. No rewrite, GraphQL addition,
microservice split, data migration, or route deletion is authorized by this
document.

## Bounding triad

1. **Surface & mode:** cross-platform product activity and Sanctuary API
   organization; Maintain-mode architecture decision with no product-code,
   schema, or route changes.
2. **Grounded substrate:** Sanctuary API's Hono/oRPC routes, existing event
   contracts and SSE receiver, core audit/event/telemetry modules, durable-agent
   events, PowerSync mutation audit work, and the 2026-10 API capability and
   layered-roadmap records.
3. **Active seam & constraints:** give people useful and truthful activity
   history without conflating analytics, audit, receipts, telemetry, or domain
   truth; preserve current behavior and establish a top-down consolidation path
   before changing compatibility layers.

## The five record types

The word "event" is overloaded. These records may share infrastructure but do
not have the same audience, retention, authority, or safety rules.

| Record type | Core question | Authority and retention | Typical audience |
| --- | --- | --- | --- |
| Domain record | What is true now? | Canonical domain store; domain retention | Authorized participants |
| Operation receipt | Did the requested command commit, fail, or remain unknown? | Durable; tied to an operation key and repair state | Requesting person and operators |
| Audit record | Who made a protected change, under what authority, and what was corrected? | Durable, append-oriented, stricter retention/access | Authorized stewards and compliance roles |
| Product activity event | What meaningful interaction or outcome can improve a person's experience or aggregate product learning? | Privacy-bounded; purpose-limited retention | Person, authorized institution view, product team in aggregate |
| Telemetry | Why did the system fail, slow down, or consume resources? | Operational retention; redacted and access-controlled | Engineers/operators |

An activity feed is a projection. It must never be the source of truth for an
attendance record, a financial state, a permission decision, or an operation's
success. A log line is likewise not proof that a command committed.

## What earns an activity event

Capture intentional, meaningful events with a named product, reliability,
support, compliance, or consent purpose. Prefer outcome events from the server
when the claim is about something that actually happened.

Examples:

- `workspace.opened`, `onboarding.step_completed`, and bounded feature
  discovery events for navigation and accessibility improvements;
- `lesson.draft_saved`, `attendance.batch_accepted`,
  `assignment.submission_received`, and `notice.delivery_confirmed` for useful
  personal/institutional timelines;
- `sync.conflict_detected`, `operation.recovered`, and
  `provider.delivery_unknown` for support and reliability;
- `consent.changed`, `export.requested`, and selected authorization-sensitive
  actions for governance;
- `ai.proposal_created`, `ai.proposal_reviewed`, and `ai.proposal_applied` for
  human oversight of AI-assisted work.

Do not capture raw message text, learner reflections, assessment answers,
health/wellbeing content, authentication credentials, full request bodies, or
free-form AI prompts/responses in generic activity properties. These may have
their own explicitly governed domain storage when necessary; they do not belong
in a broad product-event stream.

## Event production model

```text
Client interaction                         Domain command
       │                                         │
       ├─ lower-trust UX event                    ├─ transaction commits domain record,
       │  (allow-listed, consent-filtered)        │  audit row, receipt, and durable event
       │                                         │
       ▼                                         ▼
             privacy and purpose policy
                         │
                         ▼
              durable event/projection pipeline
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
  personal activity   aggregate UX   operational/recovery
      timeline          learning          dashboards
```

For a protected command, the authoritative domain write, audit row, operation
receipt, and outbox/domain event belong in one transaction when the current
database can provide it. External effects such as push, email, WhatsApp, or an
LLM call are not part of that transaction: they need queued/dispatched/accepted/
unknown/reconciled states and repair handling.

Client-only events are valuable for UX but cannot assert a server outcome. A
`screen.viewed` event can be client-originated; `attendance.batch_accepted` must
be server-originated after the authoritative commit.

## Common envelope, not a common dump

Every product activity event should use one versioned, allow-listed envelope.
Individual domains define their permitted `properties` shape; arbitrary JSON is
not an acceptable long-term event contract.

```ts
type ProductActivityEvent = {
  eventId: string;
  schemaVersion: number;
  eventName: string;
  category: 'product' | 'domain' | 'audit' | 'operational';
  occurredAt: string;
  source: 'client' | 'server' | 'worker' | 'provider';
  outcome?: 'started' | 'accepted' | 'rejected' | 'completed' | 'failed' | 'unknown';
  actorType: 'person' | 'system' | 'automation' | 'ai';
  actorRef?: string;
  scopeRef?: string;
  capabilityId?: string;
  operationId?: string;
  privacyClass: 'minimal' | 'sensitive' | 'restricted';
  purpose: 'ux' | 'support' | 'reliability' | 'governance';
  properties: Record<string, unknown>;
};
```

`actorRef` and `scopeRef` should be pseudonymous or omitted where the stated
purpose does not need identity. `properties` must be schema-validated by the
producer. This sketch is a contract target, not an approval to use an
unconstrained `Record<string, unknown>` in implementation.

## Privacy and human limits

1. **Purpose before collection:** every event family declares why it exists and
   which decisions it may inform.
2. **Minimum necessary data:** collect interaction names and bounded dimensions,
   not content or a replay of a person's life.
3. **Visible benefit:** where appropriate, return useful history to people:
   saved drafts, accepted attendance, delivery status, recovery state.
4. **No behavioural scoring by default:** product events do not become learner,
   staff, or family rankings without an explicit, separately governed proposal.
5. **Consent and access:** privacy class, institutional context, consent, and
   retention must be evaluated before exposure to dashboards or providers.
6. **Correction and deletion rules:** a user-visible feed may redact or show a
   correction; an audit record may require a controlled retention exception.
7. **Provider minimization:** analytics and monitoring vendors receive only the
   data justified for their narrow purpose.

## Top-down API organization

The correct question is not "how many contracts or repositories should exist?"
It is "which domain owns this rule and durable truth?" A module boundary is
meaningful when it owns its rules, records, correction path, and events.

```text
Product world and participant needs
        ↓
Domain ownership and authoritative records
        ↓
Capabilities and their lifecycle/authority/receipt
        ↓
Transport contracts (native oRPC; selective OpenAPI; SSE/webhooks where needed)
        ↓
Application services and narrow domain ports
        ↓
Database, sync, outbox, worker, and provider adapters
        ↓
UI hooks and screens
```

The likely first-level domains are:

| Domain | Owns examples | Does not own |
| --- | --- | --- |
| Identity and scope | accounts, bonds, capacities, permissions, consent | classroom or community records |
| Classroom learning | enrollment, attendance, assignments, grading | generic messaging delivery |
| Self and wellbeing | private reflections and person-owned progress | institutional authorization |
| Community and communication | groups, notices, messaging, delivery intent | external provider truth or school records |
| Platform operations | receipts, audit infrastructure, outbox, feature controls, observability | arbitrary domain CRUD |

A feature does not automatically deserve a repository, contract facade, hook,
and handler family. A new abstraction must own a stable business rule or a real
replaceable boundary. Generic `findMany`/`update` repositories and screen-shaped
contracts should not proliferate when a domain capability already owns the
decision.

For example, attendance may be one Classroom Learning capability group with
`getRoster`, `recordBatch`, and `getDailySnapshot`; it is not necessarily five
independent architectural stacks because five UI views happen to exist.

## Consolidation rules

- New first-party domain commands and queries use the canonical native oRPC
  contract path unless a documented protocol requirement needs SSE, a webhook,
  file transfer, or another adapter.
- Hono remains the runtime shell; it does not duplicate business contracts.
- OpenAPI remains a selective read interoperability projection, not a second
  mutation authority.
- Each compatibility layer receives an owner, caller inventory, retirement
  trigger, and characterization test before it can be merged or removed.
- A port names a domain need (`commitAttendanceBatch`, `enqueueFamilyNotice`),
  not a generic ORM method.
- Hooks own UI/cache behavior and call capabilities; they do not recreate
  authorization, receipt, or domain lifecycle semantics.
- Each capability declares activity/audit/receipt/telemetry emission explicitly
  rather than scattering ad-hoc `track()` calls across clients.

## Reorganization sequence

### Phase 0 — establish the map

Generate a route, contract, handler, client, direct-fetch, data-owner, and event
inventory. Classify each item as canonical, adapter, compatibility, deprecated,
or unknown. This phase changes no behavior.

### Phase 1 — choose authoritative capability groups

For each domain, define the canonical operations, authority/scope, durable
records, activity/audit/receipt requirements, offline policy, and correction
model. Do not begin by moving folders.

### Phase 2 — make one vertical slice real

Choose one protected Classroom Learning action. Prove transaction-bound domain
write, audit record, idempotent receipt, durable event/outbox, activity
projection, recovery after a lost response, and privacy-bounded analytics. Only
then extract the common machinery.

### Phase 3 — consolidate incrementally

Move callers from duplicate facades and legacy contract adapters one domain at a
time. Preserve old behavior until caller inventory and characterization tests
show it can be retired; removal still requires explicit human approval.

### Phase 4 — enforce the constitution

Add CI-visible inventory checks: protected routes need policy metadata;
capabilities need a named owner/lifecycle/evidence plan; event producers need a
schema, purpose, privacy class, and retention owner; new direct client paths
need a documented exception.

## Acceptance questions for every capability

1. What domain owns the rule and authoritative record?
2. Who may request it, under what current scope, and who may correct it?
3. What is the canonical input/output/error/receipt contract?
4. Which side effects occur, and what happens after timeout, retry, or provider
   uncertainty?
5. Which activity, audit, operation, and telemetry records are emitted—and why?
6. Which event properties are prohibited by privacy or dignity constraints?
7. Is local/offline work allowed, and when does server authority revalidate it?
8. Which transports are allowed, and which are deliberately excluded?
9. What evidence level proves the claimed behavior?

## Non-goals

- Capturing every click, keystroke, message body, or learner datum.
- Introducing a new analytics vendor, event broker, database, or microservice.
- Turning product activity into automated performance scoring or behavioural
  surveillance.
- Deleting existing contracts, routes, tests, fallbacks, or compatibility code.
- Treating architecture documentation as proof of a working runtime.

## Relationship to existing records

This decision extends, rather than replaces, the layered API roadmap and the
Sanctuary API capability/platform audit. It gives the event/activity layer an
explicit position in that roadmap. Existing audit, telemetry, sync, durable
agent, and SSE code must be inventoried in Phase 0 before any claim that they
form a coherent implementation.

## Verification boundary

This is a source-grounded design record. It does not prove current schema
compatibility, production event delivery, consent enforcement, analytics
quality, database atomicity, provider delivery, or the appropriateness of any
specific retention period. It authorizes discovery and a bounded design plan,
not implementation changes.
