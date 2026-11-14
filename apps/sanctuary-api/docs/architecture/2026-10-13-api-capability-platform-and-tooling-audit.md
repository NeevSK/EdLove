---
title: "Sanctuary API Capability Platform and Tooling Audit"
status: "draft"
created: 2026-10-13
updated: 2026-10-13
author: "Naveen"
scribe: "Codex"
tags: [api, capabilities, orpc, hono, graphql, ai, mcp, architecture, hostile-review]
---

# Sanctuary API Capability Platform and Tooling Audit

## Scope and stance

This is a hostile, source-grounded architecture review of the Sanctuary API as the capability boundary for mobile, web, WhatsApp, Telegram, SMS, device assistants, authorized agents, MCP clients, and future edge/local runtimes. It is not an implementation plan, a penetration test, a production load result, or a claim that every existing route is safe for every door.

The question is not “does the API have many endpoints?” It is:

> Can a client discover one meaningful capability, understand its authority and consequences, request it with the right context, survive interruption, and obtain a truthful receipt—without each channel inventing its own semantics?

The review uses the repository on 2026-10-13, installed declarations, existing API documentation, and dated primary documentation for the proposed interoperability choices. Findings marked **Observed** are present in inspected source. **Inferred** findings are reasoned consequences that still require runtime proof. **Proposed** items are design decisions for review.

## Bounding triad

1. **Surface & mode:** `apps/sanctuary-api`, `packages/core` API contracts, and client/agent boundaries; Maintain-mode architecture audit, documentation only.
2. **Grounded substrate:** 63 core API contract files, 40 API handler modules, 47 native oRPC path mounts, Hono app registration, AI routes, durable-agent routes, PowerSync upload handler/connector, API architecture decisions, package manifests, and targeted source searches.
3. **Active seam & constraints:** API capability exposure across heterogeneous clients; preserve existing routes, do not introduce GraphQL or new vendors by implication, do not silently delete legacy behavior, and distinguish source presence from operational proof.

## Executive verdict

### Hono + oRPC is sufficient as the core API foundation

Hono is a suitable transport/runtime shell for Node/Bun, middleware, webhooks, limits, streaming, and adapters. oRPC is a suitable typed procedure contract and client transport for first-party TypeScript clients. The repository already follows this direction: native oRPC procedures are mounted under Hono, contracts carry Zod input/output/error metadata, and read-only OpenAPI is generated selectively from the same router.

The official oRPC contract model describes input, output, errors, and metadata without business logic. Hono RPC similarly shares validated route types with clients. This supports a coherent first-party API, but neither library supplies the product’s missing semantics: capability discovery, consent, operation receipts, offline authority, channel policy, cost governance, or recovery after external acceptance.

### Do not add GraphQL as a second general-purpose API now

GraphQL is valuable when many independent consumers need flexible, nested, read-heavy projections and can support schema governance, query-cost controls, resolver authorization, caching, persisted operations, and a second toolchain. It is not a remedy for missing mutation lifecycle or authorization semantics. Adding it now would create a second schema, resolver layer, error dialect, observability path, and security surface beside 63 contract files.

The current recommendation is **oRPC as the domain command/query authority; selective read-only OpenAPI for broad interoperability; dedicated streaming/webhook transports where their protocol requires it; no general GraphQL endpoint until a measured consumer problem proves the need**. If a future GraphQL need is real, place it as a read-oriented projection/federation adapter over the same use cases and policy boundary—not as a second business-logic implementation.

### AI should consume a curated capability projection, not the raw API

Agents must not receive the entire router, database schema, or unrestricted OpenAPI document as an implicit action surface. MCP tools, assistant functions, CopilotKit actions, Mastra/LangChain tools, n8n nodes, or a future WebMCP surface should all compile from a reviewed capability registry. The registry should expose purpose, audience, input schema, authority requirements, confirmation level, data classification, side effects, idempotency, offline allowance, cost, and receipt query.

The API remains sovereign. AI frameworks orchestrate language, planning, retries, and presentation; they do not become the record authority, authorization engine, or durable transaction log.

## What exists today

| Area | Observed substrate | Honest maturity reading |
| --- | --- | --- |
| First-party API | `packages/core/src/api/*.contract.ts`; `apps/sanctuary-api/src/core/handlers/`; shared oRPC client | Broad contract surface; migration/coverage completeness still requires audit |
| HTTP runtime | Hono app with secure headers, compression, body limit, CORS, timeout, rate limit, request IDs, OTel hooks, feature gates | Good shell; each special route must still be checked against the same policy/lifecycle rules |
| Authorization | Supabase JWT, active-bond scope, Cedar/Rust evaluator, double-gate middleware, explicit route policy metadata | Strong direction; agent/channel/offline projections need uniform evidence |
| Native RPC | `RPCHandler`, `BatchHandlerPlugin`, native wildcard mounts | Suitable for typed web/mobile TypeScript clients; mount/contract drift is a maintained risk |
| OpenAPI | `OpenAPIHandler` filtered to GET procedures, `/doc`, `/reference` | Useful read compatibility surface; intentionally not a mutation authority |
| Offline sync | PowerSync connector, encrypted local adapters, `sync.uploadBatch`, durable idempotency ledger | Substantive foundation; domain coverage and conflict policy are not universal |
| AI | `/api/ai/chat` streamed through TanStack AI; provider adapters; billing/persistence/privacy modes; `/student-potential` | AI interaction exists; not equivalent to safe domain action execution |
| Durable agents | Durable run/event tables, Inngest functions, status/timeline/promote routes | Valuable pattern; request/event/dispatch handoff still needs crash-repair proof |
| Webhooks | WhatsApp, PayHere, ads, Inngest routes | External delivery and acceptance are separate concerns; verify each signature, dedupe, and acknowledgement contract |
| Product MCP | No product MCP route found in the API surface; platform MCP exists as an engineering control plane | Do not describe engineering gateway as user-facing capability exposure |
| GraphQL | No GraphQL dependency or route found in targeted source/manifests | There is no current GraphQL capability to preserve or test |

### Current surface shape

The API is already a large platform surface, not a small CRUD server: self, profile, identity, onboarding, learning reflections, principal notes, sync, daily content, journals, missions, library, authorization, educational, editorial, grading, attendance, community, messaging, social, announcements, guardian assessment, agents, ERP, mapping, media, inventory, history, longitudinal, school forest, tracking, wellbeing/warm mirror, presence, privacy, rewards, echoes, student potential, and forms. Breadth is useful only if clients can distinguish a private draft, a protected domain commit, an external notification, an AI suggestion, and a fictional/demo result.

## Hostile capability audit

### 1. Contract breadth is not capability parity

**Observed:** native oRPC has many routers and explicit mounts; legacy/compatibility contracts and orchestration APIs also remain in `packages/core`.

**Risk:** two clients can reach similarly named behavior through different transports, output shapes, or authority checks. A route list cannot prove that mobile, web, WhatsApp, an agent, and OpenAPI all receive the same meaning.

**Required evidence:** a generated capability matrix mapping each public capability to canonical contract, implementation, scope policy, side-effect class, client doors, offline policy, receipt, and test evidence. Fail CI when a declared public capability lacks one of those fields.

### 2. Context resolution is expensive and potentially fragile

**Observed:** `buildORPCContextFromHono` reuses Hono context, resolves active bond/scope, derives classroom IDs, and builds principal/security context. `parseORPCContext` separately performs authentication and scope resolution for other paths.

**Risk:** context can diverge by transport; every request may perform relationship queries; incomplete classroom/guardian facts can cause denial or, worse, an incorrect positive if a handler trusts request input.

**Required evidence:** one canonical context builder per runtime path, measured query cost, explicit stale/offline context semantics, and tests proving identical authorization facts across RPC, OpenAPI, webhooks, agent routes, and assistant adapters.

### 3. Policy metadata is necessary but not sufficient

**Observed:** oRPC contract conversion asserts explicit policy metadata; double-gate middleware combines entitlement and Cedar authorization; route-level AI policy is attached separately.

**Risk:** metadata can say a procedure is protected while domain-specific authorization facts, consent, actor linkage, or output redaction remain incomplete. AI and webhook routes do not automatically inherit oRPC metadata.

**Required evidence:** a policy coverage report spanning every route family, including non-oRPC routes, with actor/scope/data classification and negative tests. “Authenticated” must never be treated as “authorized to perform this effect.”

### 4. Mutation durability is inconsistent by design

**Observed:** `sync.uploadBatch` has a durable idempotency ledger; several domain contracts accept idempotency keys; external notification and agent flows have separate event tables.

**Risk:** callers may assume a common retry contract where only some procedures are idempotent. A generic retry from WhatsApp, n8n, an agent, or a low-connectivity device can duplicate a side effect or produce an ambiguous result.

**Required evidence:** every mutation declares one of `read`, `local_draft`, `domain_commit`, `enqueue_external_effect`, or `composite`; each non-read operation has key scope, payload binding, replay response, expiry/retention, and receipt query.

### 5. External delivery cannot be hidden behind domain success

**Observed:** WhatsApp, payment, and agent routes are mounted beside oRPC; AI streaming is a separate Hono route.

**Risk:** a domain commit, provider acceptance, provider delivery, and recipient comprehension are different facts. A single HTTP success or assistant sentence cannot collapse them.

**Required evidence:** capability receipts with separate states: `proposed`, `accepted`, `committed`, `queued`, `provider_accepted`, `delivered`, `unknown`, `failed`, `reconciled`, `expired`, and `rejected`. Clients must be able to query the receipt without repeating the effect.

### 6. AI route is not an action API

**Observed:** `/api/ai/chat` validates transcript size, applies a circuit breaker/rate limit, supports provider adapters, privacy modes, persistence, and billing. The inspected route returns a stream; it does not establish a general typed tool-call/action protocol for all domain mutations.

**Risk:** an LLM can produce a persuasive answer without a domain commit, or a future tool adapter can bypass the exact review/confirmation lifecycle used by a human client.

**Required evidence:** separate `explain`, `draft`, `propose`, `confirm`, and `execute` capabilities. AI may draft/propose by default. Protected commits require a structured proposal version, current scope, explicit confirmation policy, replay key, and receipt. Model text is never an authority source.

### 7. Durable agent handoff still needs a repair story

**Observed:** durable agent routes insert a run and event, then call `sanctuaryInngest.send`; status/promote routes read durable tables.

**Inferred risk:** a crash between durable acceptance and event dispatch can leave a run recorded but never delivered. Inngest retry semantics cannot repair an event that was never accepted by the worker system.

**Required evidence:** an outbox/dispatcher or equivalent reconciliation job that finds `accepted but undispatched` runs, sends the same event identity, records dispatch state, and is safe under concurrent repair. Inject a crash at each handoff.

### 8. Demo and fictional modes must be capability metadata

**Observed:** durable agent promotion contains `demo_teacher_note` behavior; the API has demo-oriented routes/data in the wider surface.

**Risk:** an AI, workflow tool, or client may expose demo output in a production-looking shell. A user cannot distinguish “simulated success” from a protected record.

**Required evidence:** mode is part of every response and receipt; demo capabilities are excluded from production agent catalogs by default; no demo output can satisfy an authoritative downstream dependency.

### 9. Error semantics are not yet a universal client contract

**Observed:** oRPC has typed error maps in many contracts; Hono/AI/webhook routes also return direct JSON/text responses; global error handling does not automatically infer Hono RPC response types.

**Risk:** clients and automators cannot consistently decide retry, ask for confirmation, show offline state, or escalate to a person.

**Required evidence:** stable error envelope with category (`validation`, `unauthenticated`, `unauthorized`, `conflict`, `rate_limited`, `temporarily_unavailable`, `provider_unknown`, `permanent_failure`), retry advice, receipt/operation ID, and safe user message. Keep protocol-specific encoding, but preserve canonical semantics.

### 10. Resource and query cost are not one concern

**Observed:** body limit, timeout and rate-limit middleware exist; no general capability-level cost declaration is visible in the inspected route registration.

**Risk:** GraphQL is not required to create expensive queries. Nested oRPC reads, broad sync, AI transcript size, agent fan-out, media, and provider messages can all exhaust shared resources.

**Required evidence:** per-capability cost units and budgets: DB rows/joins, bytes, tokens, model calls, external deliveries, queue time, and tenant concurrency. Apply limits before work begins and record the reason for degraded/fallback behavior.

## The capability contract the API needs

The missing abstraction is not another transport. It is a **Capability Descriptor** plus a **Capability Lifecycle**.

### Capability Descriptor (proposed)

```text
capabilityId / version
canonical domain procedure
human purpose and localized labels
audiences and role/scope requirements
input/output/error schemas
data classification and retention
side-effect class
consent and confirmation level
idempotency key scope and replay behavior
offline/local-draft allowance
cost/resource budget
supported doors and minimum affordance
receipt/status query
recovery owner and escalation
evidence maturity (contract, mock, scenario, runtime, device, production)
mode (real, demo, experimental)
```

### Lifecycle (proposed)

`discover → clarify → draft → propose(version) → confirm → authorize(current scope) → commit/enqueue → observe receipt → reconcile/repair → correct/export`

Reads can use a shorter path. A local draft can remain on-device without pretending to be a server commit. An external notification must not be reported as delivered merely because a message was queued. An AI response can be useful without creating any domain effect.

This descriptor is the shared source from which to generate:

- first-party oRPC client functions;
- selective read-only OpenAPI operations;
- channel adapters for WhatsApp/Telegram/SMS;
- assistant function schemas;
- curated MCP tools/resources/prompts;
- n8n nodes and webhook documentation;
- CopilotKit/Mastra/LangChain tool wrappers;
- human-readable capability/help pages;
- observability dashboards and cost ledgers.

Generation must not expose every internal procedure. Public capability is an allow-list, not router introspection.

## Transport decision

| Transport | Use now | Strength | Hostile limitation |
| --- | --- | --- | --- |
| Hono | Yes | Runtime shell, middleware, webhooks, streaming, deployment portability | Not a domain contract or capability registry by itself |
| oRPC | Yes, primary | Typed procedure contracts, shared TS client, errors/metadata, batch transport | First-party TypeScript bias; non-TS ecosystems need adapters; does not solve lifecycle automatically |
| OpenAPI | Yes, selective | Language-neutral read interoperability and docs | Current adapter is read-only; generated schema is not a safe mutation catalog |
| GraphQL | No general addition now | Flexible nested reads, schema introspection, client-selected projections | Second schema/resolver/security/cache/query-cost stack; poor fit as a universal offline/command authority |
| Webhooks | Yes, bounded | Provider ingress and asynchronous notifications | Signature, dedupe, acknowledgement, replay and provider state must be explicit |
| SSE/streaming | Yes, bounded | AI/token/event streams | Stream completion is not durable domain commit; reconnect and replay need their own contract |
| MCP | Curated future adapter | Standard model-facing tools/resources/prompts | Model-controlled tools increase prompt-injection, confused-deputy and overbreadth risk |
| Assistant functions | Curated future adapter | Native Siri/Gemini/platform invocation | Platform-specific consent, invocation and account-linking constraints |
| SMS/WhatsApp/Telegram | Channel adapters | Familiar, low-friction delivery and commands | Vendor/account/number/linkage and message-cost constraints; not full app parity |

The official GraphQL guidance describes a typed schema in which clients select fields and mutations trigger side effects. That flexibility is valuable for read projections, but it does not remove resolver authorization, mutation idempotency, external-effect receipts, or offline conflict rules. The official oRPC documentation’s contract model maps more directly to the current contract-first source of truth. Hono’s RPC documentation also notes that global error handlers/middleware do not automatically become inferred client response types—an important reason to keep canonical error envelopes explicit.

## How each client should receive capabilities

### Mobile and web

Use the shared oRPC client for online procedures and the local PowerSync/SQLite boundary for permitted offline reads/drafts. The UI should consume capability descriptors for labels, availability, confirmation, and status—not infer them from route names. A client must never use a cached permission snapshot as proof for a protected server commit without current server revalidation.

### WhatsApp, Telegram, and SMS

Expose a tiny channel-specific projection: identify/clarify, show a bounded preview, request explicit confirmation, submit a scoped operation key, and return/query a receipt. Do not expose the whole workspace or arbitrary nested reads through a chat command. When a message cannot carry the complete result, say exactly what is missing and offer a safe link or human escalation.

### Device assistants

Expose only typed, user-invoked functions such as “show my next class,” “draft a lesson reflection,” or “prepare this family notice.” Protected writes should create a proposal and require platform-appropriate confirmation; assistant invocation is not a blanket delegation. Keep a text/manual route for devices without the assistant.

### AI chat and copilots

Give the model a curated list of read, draft, and proposal tools. Use structured schemas and return machine-readable status plus human explanation. A natural-language “done” is never a commit receipt. CopilotKit, Mastra, LangChain/LangGraph, or TanStack AI can provide agent UI/orchestration; they should call the same capability adapter and never own domain persistence.

### n8n and workflow automation

Provide versioned webhook/OpenAPI actions with idempotency, signed callbacks, retry guidance, and a receipt lookup. n8n is good at integration choreography; it is not the authority for school scope, learner privacy, or final records. A workflow that writes a protected record must use the same proposal/authorization/commit path as a first-party client.

### MCP / WebMCP

MCP has distinct prompts, resources, and tools; tools are model-controlled, while resources are application-controlled. Publish a small allow-list of resource-bound read tools first. Mutation tools should default to proposal-only and require explicit confirmation. Resource-bound tokens, audience restrictions, audit events, tool versioning, and prompt-injection defenses are mandatory. The existing engineering `@repo/platform-mcp` gateway should not be presented as a product MCP server without a separate threat model and consent surface.

## AI/tooling discernment

The ecosystem names are not one category. Select by responsibility, not fashion:

| Category | Examples named by user | What it should own | What it must not own in Gurudevi |
| --- | --- | --- | --- |
| Model/provider SDK | OpenAI/Anthropic/Gemini adapters already present | Token/model invocation and provider translation | Authority, record truth, consent, durable side effects |
| Agent runtime/orchestrator | Mastra, LangChain/LangGraph, Rivet/Rivet AI where applicable | Planning, tool selection, stateful workflow execution | Direct unrestricted DB writes or policy bypass |
| Agent UI/action surface | CopilotKit, TanStack AI patterns | Chat/stream UI, action proposals, human-in-loop presentation | Canonical action semantics and receipts |
| Workflow automation | n8n | External integration choreography and scheduled jobs | Domain authorization and institutional custody |
| Tool/resource protocol | MCP, future WebMCP | Standardized model/app discovery and invocation | Unreviewed exposure of the entire API |
| Runtime/deployment | Hono, Workers/edge, Node/Bun | HTTP execution and resource placement | Replacing domain contracts or data governance |
| Database/sync | PostgreSQL/Supabase, ZenStack, PowerSync | Durable records, policy-aware query, local sync | LLM memory or transient workflow state as source of truth |
| Blockchain/web3 infrastructure | Alchemy and similar services | Only a specifically justified verifiable external ledger use case | Default identity, school records, or “sovereignty” theatre |

“Rivet” is ambiguous in this context; identify the exact product before architecture selection. “Alchemy” likewise spans blockchain infrastructure products and is not automatically relevant to an educational capability API. Do not add either based on name recognition.

### Recommended narrow selection

Keep Hono + oRPC + Zod + current domain/database/policy layers. Keep TanStack AI/provider adapters for chat streaming. Add a small internal capability registry and adapter layer. Add MCP only for curated resources/tools after lifecycle and security evidence. Use one agent runtime at most for a bounded experiment; do not introduce Mastra, LangChain, Rivet, CopilotKit, and n8n simultaneously. Use n8n only where an external integration genuinely benefits from visual workflow ownership. Defer GraphQL, blockchain infrastructure, and a second offline database until a measured problem justifies them.

## Database readiness: capable foundation, incomplete platform contract

### Strengths observed

- PostgreSQL/Supabase/ZenStack provide a durable server record and policy-aware access boundary.
- PowerSync/op-sqlite/MMKV/native adapters support local-first work and encrypted device storage.
- Sync upload has payload-bound idempotency and a durable ledger.
- Domain handlers commonly expose explicit idempotency fields and scoped queries.
- Agent and webhook paths have dedicated event/receipt tables in several flows.

### Gaps that block universal affordances

- Not every mutation is proven to be idempotent or conflict-safe.
- Not every external effect has a durable outbox and repair dispatcher.
- Scope/permission snapshots, stale offline authority, revocation, and shared-device behavior need per-domain evidence.
- Capability-level cost/quota and fairness are not one uniform contract.
- The database cannot by itself tell a client whether a provider delivered a message or a person understood it.
- Demo/experimental rows and real authoritative rows need an unmistakable mode boundary.
- Backups, restore, migration, retention, export, and operator succession remain operational capabilities, not just schema features.

### Database acceptance contract for a capability

Before a capability is exposed to automation or an agent, show: authoritative tables; transaction boundary; unique/idempotency constraints; conflict policy; audit/event rows; outbox/dispatcher; read receipt; repair query; retention/export policy; RLS/Cedar scope; migration/restore evidence; and a bounded cost estimate. If any are absent, expose only a draft/read/proposal capability.

## Roadmap by proof, not vendor adoption

### P0 — capability truth and blast-radius inventory

1. Generate the capability matrix from contracts/routes and explicitly include non-oRPC routes.
2. Mark each capability `real`, `demo`, or `experimental`; identify all direct DB writes and external effects.
3. Standardize canonical error and receipt semantics without changing every wire format at once.
4. Select one meaningful pilot effect (for example, private teacher lesson draft → reviewed classroom note).

### P1 — lifecycle hardening

1. Add/verify proposal version, confirmation, operation key, current-scope revalidation, and receipt lookup for that effect.
2. Prove durable accepted→dispatched repair for agents and provider notifications.
3. Run crash, retry, duplicate, stale-scope, account-switch, provider-timeout, and DB-restore scenarios.
4. Generate one channel adapter and one AI proposal tool from the same descriptor.

### P2 — selective interoperability

1. Publish read-only OpenAPI projections for external developers.
2. Publish one MCP resource and one proposal-only tool with resource-bound authorization.
3. Publish one signed n8n/webhook integration if a real partner workflow exists.
4. Test web/mobile/channel parity for meaning, not visual similarity.

### P3 — only if evidence demands it

GraphQL read projections, a second agent runtime, local semantic indexing, school hubs/cells, federation, or blockchain verification each require a written problem statement, baseline, owner, security model, operating cost, migration/exit plan, and a bounded experiment. “The ecosystem has it” is not a requirement.

## Decision log

| Question | Current decision | Revisit trigger |
| --- | --- | --- |
| Is Hono + oRPC capable enough for the core? | Yes, with a capability/lifecycle layer added | Non-TypeScript consumer or projection problem remains after OpenAPI |
| Do we need GraphQL now? | No general GraphQL; preserve as a future read adapter | Measured nested-read/client autonomy problem plus funded governance |
| How do AI systems access the API? | Curated descriptors → adapter-specific tools; same domain procedures | A platform requires a new protocol adapter |
| Should we adopt all listed AI tools? | No; one bounded orchestrator/UI/workflow experiment at a time | A concrete workflow proves a missing primitive |
| Is the DB capable? | Strong foundation, not universal guarantee | Per-capability acceptance evidence closes lifecycle gaps |
| Is the API the core? | Yes, but API means contracts + authority + data + lifecycle + recovery, not routes alone | Never narrow the definition back to endpoint count |

## Verification boundary

This audit performed static source and manifest inspection plus official documentation research. It did not run production traffic, real provider delivery, physical-device sync, restore drills, penetration testing, or independent specialist review. The API package’s existing tests are evidence for their named assertions under their configured substitutions; they are not evidence of universal cross-channel parity. Any implementation derived from this document must emit its own G0–G5/R1 evidence according to the repository policy.

## Primary references

- [oRPC procedure contracts](https://orpc.dev/docs/contract/procedure) — input/output/errors/metadata contract model.
- [oRPC protocol](https://orpc.dev/docs/rpc/protocol) — RPC request/response and error behavior.
- [Hono RPC](https://hono.dev/docs/guides/rpc) — shared server/client route typing and its inference limits.
- [GraphQL learning guide](https://graphql.org/learn/) and [queries/mutations](https://graphql.org/learn/queries/) — schema-selected fields and side-effect operations.
- [MCP server primitives](https://modelcontextprotocol.io/specification/draft/server/index) — prompts, resources, and tools with different control surfaces.
- [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — resource/audience-bound authorization considerations.
