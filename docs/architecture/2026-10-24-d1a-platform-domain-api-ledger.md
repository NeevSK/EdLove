---
title: "D1A Platform Domain API Ledger"
status: "active"
created: 2026-10-24
updated: 2026-10-24
author: "Naveen"
scribe: "Codex"
tags: [architecture, api, sanctuary, capability-ledger, v0, v1, evidence]
---

# D1A Platform Domain API Ledger

## Purpose and evidence frame

This is the D1A implementation artifact for the [D1A plan](./2026-10-24-d1a-platform-domain-led-api-reconciliation-plan.md). It applies the [Human-First Sanctuary Map](./2026-10-23-platform-domain-reality-and-human-first-sanctuary-map.md) to the API substrate recorded in [Gate A](./2026-10-23-api-v0-v1-gate-a-baseline.md). It does not replace the product map, create a new service taxonomy, or authorize runtime changes.

**Captured against:** Git `921ba54650f65e420458bb3b97ad056383841466`; `git status --porcelain -- apps/sanctuary-api packages/core apps/gurudevi-web apps/gurudevi-mobile` reported **136** dirty paths at capture. The dirty roots were `apps/sanctuary-api`, `apps/gurudevi-web`, `apps/gurudevi-mobile`, and `packages/core`. Statements below describe inspected source in that frame. They do **not** prove deployment, route reachability, caller adoption, policy correctness, SQL isolation, provider delivery, or production maturity.

Gate A remains a dated baseline: 127 HTTP-described procedures in 17 contract modules, 50 explicit native compatibility mounts, and a broad `/api/*` oRPC fallback. Those numbers identify migration material; they are not the domain model.

## Classification vocabulary

| Disposition | Meaning | Does not mean |
| --- | --- | --- |
| `retain-v0` | Existing compatibility behavior remains the only admitted client surface for now | Deprecated, incorrect, or safe to delete |
| `candidate-v1` | A named capability has enough source evidence to be assessed for one canonical vertical slice | Mounted, adopted, deployed, or ready for other callers |
| `specialised-transport` | An adapter has protocol-specific lifecycle/authority rules: auth, webhook, upload, stream, worker, OpenAPI | A normal domain CRUD family |
| `draft/local-only` | Local/draft/proposal state exists without proof of canonical server commitment | Durable shared domain truth |
| `external-effect` | A provider/action runs beyond the local transaction and needs explicit acceptance/retry/reconciliation | A committed domain result |
| `blocked` | Material authority, data, correction, privacy, recovery or caller facts are unknown | Absent or rejected forever |

## Capability-family cards

### 1. Person and control

**Lived places and promise:** Profile, Self and every participating context need a person-controlled account, bond/capacity, active scope, consent and privacy edge. This family supplies context to domains; it does not own their records merely because an actor has an account.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| Identity, active scope and profile | `packages/core/src/api/identity.orpc.contract.ts`, `profile.orpc.contract.ts`, `onboarding.orpc.contract.ts`; `apps/sanctuary-api/src/core/router.ts` | `retain-v0`. Identity/onboarding share `/identity/*` paths while remaining separate contract/router namespaces; profile information also appears under identity. Do not collapse them before ownership and callers are reconciled. |
| Auth/session gateway | `apps/sanctuary-api/src/core/app.ts`; `apps/gurudevi-web/lib/sanctuary/authorizedEntry.ts` | `specialised-transport`. Session/claim acquisition is not a license for arbitrary protected-data access. |
| Consent/delegation/channel linkage | `channel.orpc.contract.ts`, `privacy.orpc.contract.ts` | `retain-v0`, with bounded `candidate-v1` operations only after consent, delegation, retention and cross-client compatibility are defined. |

**Authority/state:** active bond/capacity and persisted membership remain distinct facts. The authoritative decision source/parity across Cedar, ZenStack and handlers is unresolved. Sensitive self/profile fields need per-field ownership and purpose; no product activity is implied.

**Blocked facts:** canonical account/bond/membership/delegation/revocation grammar; authority-parity evidence; caller migration impact.

### 2. Participating contexts and Workspace

**Lived places and promise:** Workspace adapts to learning, classroom, family/guardian, tutoring, school operations, workforce and financial participation. These are concrete contexts, not evidence for a generic organization model. Classroom is a major module, not the platform centre.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| Attendance | `attendance.orpc.contract.ts`; `apps/sanctuary-api/src/core/handlers/attendance.ts`; current `attendanceV1.ts`, `attendance-v1.orpc.contract.ts`, `canonicalV1.ts` | Existing procedures are `retain-v0`. `classroom.attendance.batch-record` is the sole `candidate-v1`, described below. Correction/amendment remains blocked; it must not be hidden inside batch record. |
| Learning/assessment/guardian/workspace coordination | `educational`, `grading`, `guardianAssessment`, `announcements`, `planBridge`, `principalNotes` contracts/handlers | `retain-v0`. `planBridge` serves `/plan/*`; `principalNotes` has camel/kebab mounts. These names are compatibility/history, not domain proof. |
| Workforce, finance and institutional operations | Gate A `admin`, `erp`, `inventory`, `forms` namespaces; product map sources | `blocked` for v1 admission. The source does not establish a complete HR suite, universal institution model, financial correction/tenant model, or a shared durable authority grammar. |

**Authority/state:** school, grade class, classroom, academic cycle, teaching assignment, enrolment, guardian relation and workforce assignment are not interchangeable scope facts. Client body cannot nominate actor, school or scope for a protected commit.

**Cross-family seam:** Person/control supplies actor and relationship facts; Operations supplies receipt/audit mechanics; Community handles publication/delivery effects rather than turning classroom notices into direct provider writes.

### 3. Library and EdLove Commons

**Lived places and promise:** Library serves protected resource discovery, collection, curation, reading and engagement; EdLove Commons adds public editorial/research exchange. Neither source family establishes a municipal/public lending system.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| Resources, collections, search and engagement | `packages/core/src/api/library.orpc.contract.ts`; `apps/sanctuary-api/src/core/handlers/library.ts`; `packages/library/src/api/library.ts` | `retain-v0`. Local `knowledgeDB` search and remote API data are distinct local/derived/canonical layers. |
| Editorial/public exchange | `apps/sanctuary-api/src/core/router.ts` includes editorial; governing map distinguishes EdLove | `blocked` pending a dedicated contract/caller/release-effect map. Router presence is not enough to claim it is an ordinary v1 procedure. |
| Verification/engagement/provider links | library contract and handler seams | `external-effect` or derived activity only when implementation proves provider/verification semantics; do not equate engagement with durable curation truth. |

**Authority/state:** resource/collection authority, public-versus-protected visibility, curation review and link/provider confirmation require separate rules. No activity/analytics payload may absorb reading content by default.

### 4. Community and communication

**Lived places and promise:** Groups, posts, conversations, notices and participation form shared life. Delivery is not equal to publication, and moderation/trust remains its own authority concern.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| Groups, posts, comments and reactions | `community.orpc.contract.ts`; `packages/community/src/api/community.ts` | `retain-v0`. Static source shows direct Supabase calls as well as API seams; each must be classified by execution context and authority before migration. |
| Conversations, social controls and announcements | `messaging`, `social`, `channel`, `announcements` contracts; `apps/sanctuary-api/src/agents/noticeRelease.ts` | `retain-v0` for domain intent. Provider dispatch/release is `external-effect`; a scheduled worker does not prove delivery success. |
| SSE and event dispatch | `events.orpc.contract.ts`; `/api/events/stream` in `apps/sanctuary-api/src/core/app.ts` | `specialised-transport` and `blocked` as a product activity feed. Gate A observes handshake/heartbeat mechanics, not a scoped, authorized, replayable domain-event service. |

**Authority/state:** group membership, audience selection, moderation, notice approval and channel consent must remain separate. Product activity, compliance audit, provider status and telemetry cannot become one generic event stream.

### 5. Bounded assistance and automation

**Lived places and promise:** AI assistance, durable workflow and student-support/notice flows help people under explicit rules. They are not a general autonomous-agent platform.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| AI streaming | `apps/sanctuary-api/src/ai/routes.ts`; AI mount in `apps/sanctuary-api/src/core/app.ts` | `specialised-transport`. AI output is proposal/draft until a domain capability and human approval commit it. |
| Durable agents/workers | `/api/durable-agents/*`, `/api/inngest`, `studentSupport.ts`, `platformEvents.ts`, mobile `DurableAgentsScreen.tsx` | Entry points are `specialised-transport`; consequential provider/action work is `external-effect`. |
| General orchestration | Product map and current source | `blocked`. Worker presence does not prove approval, durable outcome, retry safety or a general agent runtime. |

**Authority/state:** a worker/agent invokes or proposes a domain capability; it does not own the domain or acquire independent authority. Input minimization, model/provider retention, approval, operation receipt, recovery and result visibility must be specified per workflow.

### 6. Platform operations

**Purpose:** receipts, audit, outbox/effect state, policy mechanics, sync, OpenAPI, observability and billing/operations are cross-cutting support. They must not become an alternative product-domain owner.

| Concern | Source evidence | Disposition and limit |
| --- | --- | --- |
| Sync and receipts | `sync.orpc.contract.ts`; `/powersync/*` and `/sync/*`; attendance v1 receipt implementation | `specialised-transport` for upload/receipt lookup; existing operations remain `retain-v0` pending authority and recovery review. |
| Canonical attendance adapter | `apps/sanctuary-api/src/core/handlers/attendanceV1.ts`; `routes/canonicalV1.ts`; `core/app.ts` | A source-represented literal `/api/v1/classroom/attendance/batch-record` mount is observed before the v0 fallback. This is not a deployment claim. |
| OpenAPI, webhooks, providers and telemetry | `core/app.ts`; PayHere/WhatsApp/Telegram ingress; Gate A route map | `specialised-transport`; provider work is `external-effect`. Verification, replay and reconciliation need seam-specific evidence. |

**Record separation:** domain record, operation receipt, compliance audit, user-facing product activity and operational telemetry have distinct purpose, audience, retention and failure semantics. The current event stream does not join them.

## Card-control matrix

This matrix makes the required lifecycle, confidence and offline boundaries explicit. `G0` means static source/contract evidence only; no row claims runtime proof.

| Family | Observed lifecycle classes | Evidence confidence | Offline disposition / blocker |
| --- | --- | --- | --- |
| Person and control | reads, commits (scope/profile/consent), external identity effects | G0; source-represented, fragmented authority | Blocked: no reviewed cross-client revocation/active-scope/offline authority contract. |
| Participating contexts and Workspace | reads, drafts, proposals, commits, external notice/payment effects | G0; attendance has the deepest current seam | Capability-specific only. Attendance caller/offline queue semantics remain unproven; workforce/finance are blocked. |
| Library and EdLove Commons | reads, drafts/curation proposals, commits, verification effects | G0; remote/local search evidence | Blocked: local search is not evidence of sync/conflict/visibility behaviour. |
| Community and communication | reads, proposals, commits, delivery effects | G0; mixed API/direct-client paths | Blocked: no reconciled offline mutation, moderation, consent or delivery-recovery model. |
| Bounded assistance and automation | drafts/proposals, worker commits, provider effects | G0; specialised entry points observed | Blocked: worker retry/approval/operation-recovery semantics are not established generically. |
| Platform operations | receipt/audit commits, sync upload, streams, webhooks, external effects | G0; route and receipt source evidence | Blocked: PowerSync/SSE/provider paths require individual replay, revocation and repair contracts. |

## State-owner and caller/door matrix

This is deliberately compact. A listed caller/door proves source representation
only; a blank category is declared **not inspected**, not absent. Direct
Supabase use is an authority-review lead, never an automatic violation.

| Family | Authoritative state / owner hypothesis | Local or draft state | Derived state | External/effect state | Representative caller / door evidence | Still unknown |
| --- | --- | --- | --- | --- | --- |
| Person and control | Account, bond/capacity, active-scope and consent facts in server/persistence seams; final owner parity is unresolved | Auth/session stores and client session state | Capability/bootstrap projections | Identity-provider/session gateway | Web `lib/sanctuary/authorizedEntry.ts`, `capabilityBootstrap.ts`; identity/onboarding/profile contracts | Mobile/package caller census; Cedar/ZenStack/handler parity; revocation propagation |
| Participating contexts and Workspace | Attendance, enrolment/classroom and institutional records; exact per-module owners remain distinct | Workspace preferences, drafts and offline queues | Rosters, reports and capacity summaries | Notice delivery, payments and provider sync | Web `lib/workspace/attendance.ts`, `assignmentSubmissions.ts`; mobile `src/lib/inngestEvents.ts`; attendance/plan/assessment contracts | School/tutoring/family/workforce/finance caller census; database-policy and offline-conflict proof |
| Library and EdLove Commons | Resource/collection/curation records in library/API seams | `knowledgeDB` search/cache and UI state | Search, map and engagement projections | Link verification/content providers | `packages/library/src/api/library.ts`; library contract/handler | Web/mobile route/consumer coverage; curation/review and sync semantics |
| Community and communication | Group, post, comment, conversation and notice-intent records | Client cache/drafts; exact local queue semantics not inspected | Feed, unread and resonance projections | Scheduled notice/channel provider delivery | `packages/community/src/api/community.ts`; `agents/noticeRelease.ts`; messaging/social/channel contracts | Mobile/web door census; direct-write policy, moderation and delivery recovery |
| Bounded assistance and automation | Per-workflow durable run/proposal state where implemented; no general owner admitted | Assistant drafts/client conversation state | Model suggestions and run/status projections | LLM/model calls and worker executions | Mobile `src/screens/DurableAgentsScreen.tsx`; API AI/durable-agent/Inngest routes | Approval, retry, receipt, caller and result-visibility contract per workflow |
| Platform operations | Operation receipts, audit/effect/policy records where each seam defines them | Device sync cache and observability buffers | OpenAPI, telemetry and operational projections | Webhook/provider ingress and outbound effects | `core/app.ts`, `routes/eventsStream.ts`, `routes/verifiedWhatsappIngress.ts`, `routes/verifiedTelegramIngress.ts`, PayHere ingress | Full provider/replay/reconciliation matrix; SSE audience/retention/back-pressure contract |

## Complete contract and specialised-seam disposition index

The index reconciles the 17 Gate A method/path modules, Gate A's five
method/path-shape omissions, and source-visible current additions. It is
module/seam-level intentionally: endpoint-by-endpoint cards are deferred until
a family admits a capability.

| Module or seam | Family | Lifecycle signal | Disposition | Why / ambiguity |
| --- | --- | --- | --- | --- |
| `announcements.orpc.contract.ts` | Community | proposal, commit, delivery effect | `retain-v0` | Publication intent and provider delivery are separate. |
| `attendance.orpc.contract.ts` | Workspace | reads, commits | `retain-v0` | Legacy procedures remain until caller/compatibility and correction maps exist. |
| `attendance-v1.orpc.contract.ts` | Workspace + Operations | commit | `candidate-v1` | Sole source-visible canonical slice; source-only evidence. |
| `channel.orpc.contract.ts` | Person/control + Community | commits, effects | `retain-v0` | Consent/delegation/linkage need purpose and retention reconciliation. |
| `community.orpc.contract.ts` | Community | reads, commits | `retain-v0` | Direct client data paths require authority review. |
| `events.orpc.contract.ts` | Operations | dispatch/effect | `specialised-transport` | Not evidence of a product activity feed. |
| `identity.orpc.contract.ts` | Person/control | reads, commits | `retain-v0` | Overlaps onboarding/profile path vocabulary. |
| `library.orpc.contract.ts` | Library/Commons | reads, commits, verification effect | `retain-v0` | Public/protected/canonical-local distinctions are unresolved. |
| `mapping.orpc.contract.ts` | Workspace + Operations | reads, commits | `retain-v0` | School/topology ownership and caller scope need mapping. |
| `messaging.orpc.contract.ts` | Community | reads, commits | `retain-v0` | Conversation semantics overlap group messaging. |
| `onboarding.orpc.contract.ts` | Person/control | commits | `retain-v0` | Shares identity path family; bond lifecycle unresolved. |
| `planBridge.orpc.contract.ts` | Workspace + Community | reads, proposals, effects | `retain-v0` | Router name and `/plan/*` path differ; notices cross delivery boundary. |
| `principalNotes.orpc.contract.ts` | Workspace | reads, drafts, commits | `retain-v0` | Camel/kebab compatibility mounts persist. |
| `privacy.orpc.contract.ts` | Person/control + Operations | reads, commits/audit | `retain-v0` | Privacy ledger is not generic activity telemetry. |
| `profile.orpc.contract.ts` | Person/control | reads, commits | `retain-v0` | Profile facts overlap identity concern. |
| `rewards.orpc.contract.ts` | Unassigned (possible Community/Operations lead) | reads, commits | `blocked` | Product meaning, authority and ledger/reward effects need a separate card. |
| `social.orpc.contract.ts` | Community | reads, commits | `retain-v0` | Notification/blocking needs consent/delivery and moderation separation. |
| `sync.orpc.contract.ts` | Operations | upload, receipt query, commit | `specialised-transport` | `/sync/*` and `/powersync/*` require protocol/caller reconciliation. |
| `admin.orpc.contract.ts` | Workspace | unknown source shape | `blocked` | Gate A omitted it from the procedure checksum; no inferred owner. |
| `agent.orpc.contract.ts` | Assistance/automation | unknown source shape | `blocked` | Gate A omission plus no general-agent admission. |
| `dailyContent.orpc.contract.ts` | Unassigned | unknown source shape | `blocked` | Recorded by Gate A, absent from current inspected file list; reconcile baseline/current state. |
| `educational.orpc.contract.ts` | Workspace | unknown source shape | `blocked` | Gate A omission; must distinguish learning vocabulary from route ownership. |
| `self.orpc.contract.ts` | Unassigned | unknown source shape | `blocked` | Recorded by Gate A, absent from current inspected file list; do not infer retirement. |
| `grading.orpc.contract.ts`, `guardian-assessment.orpc.contract.ts` | Workspace | unknown source shape | `blocked` | Present currently but not in Gate A counted table; reconcile version/source shape. |
| `workspace-provisioning.orpc.contract.ts` | Workspace + Operations | commit/receipt | `blocked` | Current shared-worktree addition; scope, caller and compatibility evidence are incomplete. |
| Native `/api/*` oRPC fallback and mounts | Cross-family | compatibility transport | `specialised-transport` | 50 mounts/aliases are migration material, not target taxonomy. |
| `/api/auth/*`, OpenAPI, SSE, uploads/sync | Person/control or Operations | protocol transport | `specialised-transport` | Each has protocol-specific authority/replay rules. |
| Webhooks, WhatsApp/Telegram ingress, PayHere | Community or Operations | external ingress/effect | `external-effect` | Verification, dedupe and reconciliation remain seam-specific. |
| AI, durable-agent and Inngest routes/workers | Assistance/automation | proposal, worker/effect | `specialised-transport` | Human approval and durable outcome are not established generically. |

## Reconciliation queue

| Ambiguity | Required resolution before a domain/API decision |
| --- | --- |
| `identity`/`onboarding` paths, profile overlap | Establish account, bond, membership, delegation, consent and active-scope grammar plus caller impact. |
| Camel/kebab aliases (`dailyContent`, `schoolForest`, `studentPotential`, `principalNotes`) | Caller/traffic characterization and explicit retirement proposal; retain behavior meanwhile. |
| `planBridge` router versus `/plan/*` paths | Classify each operation by capability/authority, not namespace. |
| `/sync/*` versus `/powersync/*` | Define protocol/recovery distinction and authorized caller set. |
| Gate A contract omissions (`admin`, `agent`, `dailyContent`, `educational`, `self`) | Reconcile source shape before interpreting their absence from the 127-procedure checksum. |
| Direct Supabase uses in consumers/packages | Identify browser/server execution, durable truth, policy enforcement and whether a transitional adapter is approved. |
| SSE/product activity | Design purpose, privacy, audience, retention, scope authority, replay and back-pressure before calling it a feed. |

## Unassigned source/capability queue

These are not merely questions about known families. They are source or
capability signals that D1A deliberately refuses to force into a family until
the listed evidence exists.

| Item | Why unassigned | Required evidence |
| --- | --- | --- |
| `dailyContent.orpc.contract.ts` and `self.orpc.contract.ts` in Gate A | Gate A records source modules that are absent from the current inspected file list. | Baseline-to-current path history, current replacement/caller map and an explicit retention/deprecation decision. |
| `rewards` | A procedure module exists, but source names alone do not establish whether it is learning motivation, community recognition, financial value or operations. | Durable truth, authority, correction and privacy/activity purpose. |
| `admin`, `grading`, `guardian-assessment`, `educational` | Current/baseline source-shape mismatch makes their omission from the normalized procedure list non-semantic. | Contract shape reconciliation, callers, scope facts and related durable records. |
| `workspace-provisioning` | New shared-worktree contract/handler appears during capture. | Settled revision, caller inventory, authority/receipt proof and v0 relationship. |
| Direct Supabase client paths | Static matches span adapters, server code and client packages; execution context is unknown. | Per-path actor, runtime, policy, durable owner and approved transitional-boundary classification. |
| `events.dispatch` plus SSE | They are transport signals without an established user/audience/event-purpose model. | Product activity/audit/telemetry decision, scope authority, retention, replay and back-pressure design. |

## Proving-capability decision

**Admitted candidate:** `classroom.attendance.batch-record`.

It is the only candidate presently supported by a source-visible vertical seam:
typed contract, server-derived active context, persisted scope recheck,
transaction-scoped attendance/receipt work, idempotency/payload-hash handling,
minimal audit decision and literal v1 mount before the v0 fallback. The current
source is still uncommitted/shared-worktree evidence; it has not established
real Postgres concurrency, first-client adoption, offline semantics, deployed
route behavior, correction/amendment or v0 retirement.

**Deferred candidates:** identity/scope selection (authority grammar unresolved);
community publication/delivery (audience/moderation/effect boundary unresolved);
library curation/verification (visibility/review/effect boundary unresolved);
payments (provider/ledger/reconciliation unresolved); agents/workflows
(approval/recovery boundary unresolved).

**Next implementation boundary if admitted after review:** verify the existing
attendance vertical seam with its exact G0–G4 evidence plan and a caller/v0
compatibility matrix. Do not broaden `/api/v1`, migrate callers or remove v0 as
part of that verification.

## D1A hostile-review checklist

- A family card must cross-link the Sanctuary lived places and concrete Workspace
  contexts; never turn six cards into packages/services/routes.
- Every disposition names its source and what static inspection cannot prove.
- Person/control remains context, not default ownership of every domain.
- No generalized university/organization, full HR suite, circulation library or
  autonomous-agent capability is inferred from labels or plans.
- No product-activity stream includes sensitive content or replaces audit,
  receipts, telemetry or domain truth.
- Raw diff is reviewed before acceptance; no route, fallback, alias, test or
  existing behavior is removed.
