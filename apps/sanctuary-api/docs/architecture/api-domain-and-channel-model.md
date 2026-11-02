---
title: "Canonical API, Domain Ownership and Channel Model"
status: "active"
created: 2026-10-30
updated: 2026-10-31
author: "Naveen"
scribe: "Codex"
tags: [api, domains, channels, orpc, brownfield, enforcement]
---

# Canonical API, Domain Ownership and Channel Model

For the whole platform's structure, read the [platform map](../../../../docs/architecture/platform-map.md).
For the learning reference, read [What: API landscape](api-landscape.md) and
[API design first principles](api-design-first-principles.md).
For implementation sequence and evidence, read [How: API engineering](api-engineering-playbook.md).
For finding a capability's owner, read the [domain design method](../../../../docs/architecture/domain-design-method.md);
for privacy, audit and retention, [data governance and records](../../../../docs/architecture/data-governance-and-records.md).
Those guides explain this policy and link its source authorities; they do not
replace product decisions. Horizontal engineering has resumed; business admission remains deferred.

## Authority and delivery scope

This is the governing API integration policy for the current hard cutover. The
owner confirmed that deployed consumers and workers do not require compatibility.
The target is native oRPC v2 for first-party commands and queries, exclusively at
`/api/v1`, without legacy route aliases, declaration converters or a parallel
first-party OpenAPI transport. The URL's `v1` is the product API generation; it
does not mean oRPC package v1.

The immediate delivery is the **horizontal foundation**: ownership rules, channel
boundaries, architecture enforcement and verification. Feature migrations and
unresolved product-policy choices are subsequent work. The owner subsequently authorized a hard reset of the API implementation. The
current source is a v1 foundation with two read-only identity procedures, not a
feature migration or completed API.
Passing its architecture gate does not establish feature or authorization coverage.

The user's ERP + LMS + AI/agentic + social + wellbeing description expresses
product breadth. It is not a prescribed domain taxonomy. Preserve the
[product covenant](../../../../docs/Core/gurudevi-soul-and-core-covenant.md), the
[human-first product map](../../../../docs/architecture/2026-10-23-platform-domain-reality-and-human-first-sanctuary-map.md)
and existing institutional rules. A principal acts in an institutional or
commercial context, never a personal principal workspace. Personal teacher
capacity is a distinct case, not permission to invent personal principal authority.

This policy supersedes the compatibility/coexistence instructions in the
[v0/v1 plan](../../../../docs/architecture/2026-10-23-api-v0-v1-canonicalization-plan.md)
and the earlier dual-wire narrative. Those records remain historical evidence;
their preserve-v0 instructions do not govern this cutover. Historical tests and
reports remain evidence for their named revisions, not acceptance of this target.

## Three connected maps

| Map | Owns | Does not establish |
| --- | --- | --- |
| Product places: Self, Workspace, Library, Community, Profile & Settings | Orientation, navigation, role-shaped composition | Universal business ownership or authorization |
| Business modules | Authoritative facts, invariants, permitted changes, correction and lifecycle | A separate service, database or deployment |
| Journeys | Ordered interactions and coordination between capabilities | A second implementation of those capabilities |

Keep a modular monolith. A feature may have several implementation files inside
one module; file count is not a domain count. Split a module only when its rules,
language, authority or lifecycle need an independent owner. Do not create a new
public namespace merely because a new screen, bot intent or agent tool exists.

Workspace composes work under persisted relationships: classroom learning,
school operations, finance or family participation. The same academic result can
appear to a learner, teacher and guardian without three owners of the grade.
UI read projections may combine domains, but mutation/correction rules remain
with their owner. Do not introduce separate BFF services without an actual need.

## Ownership discovery and admission

Before admitting any capability, answer and source-link these questions:

1. Which module owns the authoritative fact and its lifecycle?
2. Which identity, relationship, tenant and privacy facts authorize the action?
3. Which invariants and writes must commit together, and who may correct them?
4. Which native input/output/error schemas and implementation enforce this?
5. Which channels may invoke it, under what delegation, consent and approval?
6. Which receipts, retries, cancellation, audit and external-effect states apply?
7. Which scenario evidence exercises success, denial, failure and recovery?

Use existing PJC journey requirements and bindings to record this reasoning;
do not create a second feature catalog. The former API `CapabilityDescriptor` was retired with the reset. Existing
Cedar policies and database/schema packages remain source authorities, but the
new API does not yet integrate them. Future capability admission must establish
lifecycle, privacy, receipt, idempotency, audit and effect rules explicitly.

The following ownership areas guide discovery; they are not a frozen API-key
enum or a claim that every module is implemented:

| Ownership area | Facts and decisions to investigate |
| --- | --- |
| Person and access | Canonical account, credential binding, profile, bonds, active scope, consent and delegation |
| Institutions and participation | Institution setup, memberships, organizational relationships and responsibility |
| Learning | Enrolment, classes, attendance, assignments, assessment and academic scheduling |
| Institutional operations and finance | Workforce, assets, requests, charges, financial settlement and correction; split by actual invariants |
| Personal wellbeing | Private mood, journals, reflection and personal practices; sharing is explicitly governed |
| Knowledge and publishing | Resources, collections, curation, editorial and public/protected publication |
| Social participation and communication | Groups, feed, conversations, moderation, audiences, publication and delivery intent |
| Assistance and automation | Conversations, runs, drafts and proposals; domain tools retain source-domain authority |

Identity does not own every account-linked record. A learner's enrolment,
financial obligation and private journal have different authorities even when
they reference the same immutable account ID. Platform operations supplies sync,
receipts, audit and delivery mechanisms, not generic permission to mutate domain
records. A feature flag controls availability; an entitlement controls a granted
product allowance; neither substitutes for authentication or Cedar authorization.

## Entry points and shared capability execution

The following is the target architecture, not a claim that these channels are
currently connected or authorized.

```text
Web/mobile UI ────────────── native oRPC /api/v1 ─┐
In-app AI / approved intents ─ scoped tools ─────┤
User-facing remote MCP ───── curated tools ──────┤
Browser WebMCP ───────────── page affordances ───┤
Telegram / WhatsApp ─────── verified ingress ────┤
                                                ▼
                            verified account + relationship + policy
                                                ▼
                           owned capability / application use case
                                                ▼
                        domain commit + applicable receipt/audit/outbox
```

Adapters may call the shared application capability in-process; they need not
make a loopback HTTP request. They must not fork authority, validation or mutation
rules. A single canonical command/query transport does not make a provider
webhook, health probe or MCP protocol into an oRPC wire request.

| Entry point | Boundary and current source observation |
| --- | --- |
| Native web/mobile RPC | The native contract exposes two read-only identity foundation procedures; the typed shared client and server handler use `/api/v1`, with no product procedures admitted. Existing old clients have no compatibility passthrough. |
| In-app AI, intent and slash-command affordances | Retired from the API reset; not connected or admitted. |
| User-facing remote MCP | Retired from the API reset; distinct from developer `@repo/platform-mcp`, which is outside this reset. |
| Browser WebMCP | No integration is admitted by this foundation. |
| Telegram, WhatsApp, providers and workers | Prior API ingress, workers and provider adapters were removed. No delivery or channel execution is provided by the new API. |
| Health | `/health/live` reports liveness; required-mode readiness checks selected database, policy and key dependencies, not complete product readiness. |

These source observations describe the mutable post-reset 2026-10-30 worktree.
They do not prove deployment, provider delivery, or readiness of other packages.
Provider signature verification identifies the provider message, not its
authority to change a school record. Resolve provider subject to a verified
canonical account binding, then check the action's relationship, scope, consent
and delegation. Reject unlinked, expired, revoked or ambiguous authority.

User MCP tool exposure must be explicit and fail closed; a procedure appearing
in a router does not make it safe to advertise. Browser affordances use the
current authorized session and server enforcement; browser support is not an
authorization mechanism. WebMCP absence must not prevent ordinary UI operation.

### Device Trust vs. Channel Ingress Boundary

Device Trust (biometric security, Secure Enclave keys, physical `installId`) is an assurance attribute strictly scoped to the **Native Mobile Door**:
- **Non-Conflation Law**: Native device trust must NEVER be enforced as a global API prerequisite that rejects non-device channels (WhatsApp webhooks, Telegram bots, or AI Agent MCP calls).
- **Contextual Assurance (AAL)**: High-risk security mutations (credential unlinking, account deletion, financial settlement) demand AAL3 (Hardware Device Trust); routine operational capabilities (recording attendance, drafting lesson notes, reading notices) require only verified channel identity linking and active ReBAC Bond authority.

## Horizontal acceptance and enforcement

`pnpm audit:api-composition` is the existing architecture gate, included in
`pnpm audit:api-quality`. It must reject mismatches rather than retain the old
fixed mount count. Its source checks and fixture suite are only G0/G1 evidence;
the real app must subsequently be exercised through native RPCLink and RPCHandler.

The required PR workflow runs guard fixtures and the source quality gate without
`continue-on-error`. The inventory describes admitted procedures and does not establish business-feature
coverage.

```powershell
node scripts/run-and-report.mjs --cmd "node --test scripts/tests/audit-api-composition.test.mjs" --name "api_composition_foundation" --evidence-level G1
pnpm audit:api-composition
node scripts/audit-api-composition.mjs --json
pnpm audit:api-quality
```

The guard uses the installed TypeScript 7 public synchronous and AST APIs. It
checks syntax, admitted native contract procedures, the v1 client/server boundary and
known retired source locations. It does not resolve arbitrary package aliases,
generated registration, every indirect symbol or every dynamic expression. Source findings require review; they are not a count of
confirmed runtime defects. Existing non-composition quality checks have their own
bounded lexical/source coverage and must not be read as runtime authorization proof.

The target enforcement matrix is:

| Requirement | Deterministic foundation check | Required later behavior evidence |
| --- | --- | --- |
| One native first-party base | Client/server composition uses `/api/v1`; reject alternate RPC/OpenAPI entry points | Real app dispatch and retired-path denial, including batch/error wire format |
| One native contract authority | Reject legacy declaration conversion and composition type escapes | Input/output/error validation through the installed SDK |
| Owned capability composition | Reject root compatibility facades and duplicate handler aliases | Source-linked owner and cross-domain scenarios; not inferred from names |
| Channel neutrality | Explicit protocol adapters; no implicit public tool exposure | Same domain denial/commit/recovery semantics through each admitted channel |
| Honest failures | Preserve typed failure and recovery authorities; no assurance from route presence | Storage/provider rejection, ambiguous commit, safe replay and cancellation |
| Truthful evidence | PJC distinguishes source observations, proposals and scenario evidence | Real checks at each applicable G0–G5/R1 tier without skipped promotions |

Foundation checks must cover malformed and mixed fixtures as well as an accepted
fixture, be deterministic, and fail if their parser/source substrate is missing.
No baseline waiver, skipped check, suppressed exit code or legacy allowance may
make the application gate green. The reset foundation currently passes the source
composition check; this does not admit any product capability.

An AST source check cannot prove arbitrary dynamic registration, business
ownership, Cedar enforcement, transaction safety, channel execution or correct
UI behavior. Document its actual coverage and add runtime checks where required.
Never report a syntax scan or linked test as exhaustive application verification.

## Deferred decisions and work order

These decisions are held for the owner; none blocks documentation or honest
foundation enforcement. Do not invent permissive behavior while waiting.

| ID | Decision to resolve | Owner and next action | Until resolved |
| --- | --- | --- | --- |
| DEC-CHANNEL-001 | Launch bot actions, private versus group chats, inbound consent/delegation and approvals | Product/API owner: choose supported journeys and consent/delegation rules before assigning an adapter owner | Do not claim linked ingress is a working domain-action bot |
| DEC-MCP-001 | Approved external user MCP tool catalog and consequential-action approvals | Product/API owner: approve the tool catalog and approval rules before MCP admission | No blanket authority or assumption that all router procedures are approved |
| DEC-WEBMCP-001 | Intended browser WebMCP journeys and supported browser experience | Product/API owner: choose whether and which browser journeys to admit; then verify current browser support | Record as unimplemented; preserve normal UI capability |
| DEC-DOMAIN-001 | Ownership/privacy of personal versus assigned tasks, rewards, principal notes and wellbeing sharing | Product/domain owner: trace current records and journeys, then approve visibility and sharing rules before capability design | Do not broaden visibility or create a personal principal workspace |
| DEC-DOMAIN-002 | Institution/commercial/workforce/finance distinctions not established by current contracts | Product/domain owner: map existing authorities and decide distinctions before assigning capability ownership | Do not invent universal institution models or financial authority |

Already decided by the owner: no deployed-compatibility requirement; hybrid
navigation/ownership/journey model; modern native oRPC-only first-party API;
hard retirement of legacy procedure surfaces; horizontal foundation before
feature migrations. Framework migration mechanics and guardrails are engineering
work that may proceed autonomously within those constraints.

After the horizontal foundation is verified, choose clear bounded capabilities
with known ownership and follow them end to end. Track unresolved capabilities
and failures openly. Do not declare the full API complete because a small slice
or the gate's own fixture tests pass.

### Reset status and historical findings

The owner authorized removal of the previous API source and compatibility
surfaces. The reset snapshot and manifest are retained at
`reports/api-reset-20261030-86aefd17accd4ae3b565f3ede6e1c3cb.zip` and its
`.manifest.json`; the prior composition gate and fixtures are preserved under
`reports/api-composition-pre-reset-20261030/`. Previous source-quality findings
and test runs concern the pre-reset tree and must not be represented as current
routes, policies or runtime evidence. Historical PJC bindings remain identifiable
and mark removed sources as retired.

The new server has two read-only identity foundation procedures, a matching `/api/v1` handler,
and liveness and foundation-only readiness endpoints. It has request size and
time limits and an integrated required-mode identity/Cedar, scoped SQL, shared
budget and receipt/outbox foundation. Synthetic capabilities exercise those seams;
no business, delegation, bot, user MCP, AI or provider worker capability is admitted.
Preserved policy/database packages alone are never enforcement evidence.
Old API consumers must be rebuilt; their prior imports and calls do not pass through.
Feature ownership, identity and policy decisions remain required before admitting
any capability. Full API readiness is not established by these foundation procedures or their
checks.

The [runtime checkpoint](api-foundations/runtime-foundation.md) records the resumed
horizontal work: configured Node production entry, safe response containment,
drain-aware readiness, budgets and scoped evidence. Identity, scoped persistence,
Cedar and durable/distributed work controls remain required before business admission.
Their [authority/durability implementation checkpoint](api-foundations/authority-and-durability.md)
is now available with isolated PostgreSQL evidence; hosted provider/deployment and
business-capability admission remain unverified.

## Supporting guidance

- [oRPC contract-first](https://orpc.dev/docs/contract-first) and
  [v2 migration](https://orpc.dev/docs/migrations/from-v1): native contracts,
  SDK implementation/client inference and explicit middleware behavior.
- [Microsoft domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis):
  consistent contextual models and explicit integration; not a requirement for microservices.
- [Shopify boundary enforcement](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk):
  executable dependency boundaries rather than folders alone.
- [MCP authorization](https://modelcontextprotocol.io/specification/latest/basic/authorization)
  and [WebMCP security](https://developer.chrome.com/docs/ai/webmcp/secure-tools):
  separate protocol/session and application authorization responsibilities.
- [PJC guide](../../../../docs/architecture/product-journey-catalog.md) and
  [brownfield skill](../../../../.agents/skills/brownfield-feature-integration/SKILL.md).
