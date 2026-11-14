---
title: "Horizontal Foundation Coherence Plan"
status: "draft"
created: 2026-10-13
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [foundation, authn, authz, errors, resilience, phased-plan, api]
---

# Horizontal Foundation Coherence Plan

## Purpose

This plan establishes the horizontal foundation required before protected vertical capabilities expand. It does not demand a rewrite or microservices. It makes the existing modular monolith coherent by defining shared semantics, proving the highest-risk seams, and postponing physical separation until evidence justifies it.

The first audit pass is recorded in [the current foundation audit](../current_progress/2026-10-13-horizontal-foundation-audit.md). The earlier capability constitution and classroom-note slice remain downstream consumers; they do not override this foundation gate.

## Human-prioritized delivery order — 2026-10-14

1. **Now: harden the API for web and mobile.** Restore trustworthy static verification; inventory current ingress; prove authentication, authorization and tenant boundaries; enforce reviewed input/output/error contracts; settle writes/retries/receipts truthfully; prove the relevant offline, observability and recovery controls. Implement against current consumers, not imagined universal adapters.
2. **Next: WhatsApp and Telegram.** Connect meaningful capabilities to verified, linked channel identities and channel-appropriate interaction/confirmation. Reuse core authority and operation semantics rather than creating parallel business logic. Provider setup, durable delivery and real channel evidence belong to this stage.
3. **Later: WebMCP, product MCP, agents and workflows.** Add curated discovery, scoped delegation and protocol adapters to proven capabilities. Preserve the current human-confirmation boundary for protected AI proposals. No new orchestration framework is needed merely to keep this direction possible.

**Keep doors open now:** stable account IDs separate from email/phone/provider addresses; explicit identity/channel-linking boundaries; domain capabilities independent of UI and transport; shared schemas, policy and truthful operation outcomes. Phone-capable identity remains part of the direction; this prioritization neither makes email a permanent prerequisite nor authorizes immediate SMS-provider deployment. Preserve the modular monolith and existing architectural boundaries.

**Do not build ahead of need:** a universal gateway framework, all-client SDKs, speculative GraphQL, parallel databases, microservices or multiple agent runtimes. Future compatibility means avoiding unnecessary coupling, not implementing every future protocol today.

**Security qualification:** deferring a channel feature does not defer security for a route already registered in the current API. Public webhook signature/configuration behavior and prototype success claims must be resolved through the hardening inventory and explicit compatibility approval where behavior is restricted. No route is removed by this priority decision.

**Urgency discipline:** use the existing F0–F6 gate and a short evidence-backed remediation queue. No additional broad exploration dossier is required before execution. A reviewed web/mobile release envelope can be accepted before future channel/agent stages exist, but its real authentication, tenant isolation, contract, integrity and recovery requirements cannot be waived by urgency. This is sequencing of delivery, not a declaration that the current foundation is complete.

## Foundation definition

```text
identity → authority → tenant boundary → contract → application failure
→ transaction/idempotency → transport response → observability → recovery
```

Every protected capability must pass through each layer. A route is not foundational merely because it has authentication middleware or a passing happy-path test.

## Phases and gates

### F0 — Inventory and freeze the truth

**Window:** 1–2 weeks.

**Tasks:** enumerate all HTTP/RPC/AI/webhook/worker/sync entry points; map authn/authz path; map contract/handler/DB ownership; mark direct responses/raw errors/idempotency/transactions; classify real/demo/experimental; identify unsupported claims.

**Gate:** route-family inventory and contradiction register reviewed. No new protected door is added while a route’s authority or failure semantics are unknown.

### F1 — Identity and authority coherence

**Window:** 2–4 weeks.

**Tasks:** unify request principal/context construction; document JWT/JWKS/issuer/audience/expiry/key rotation and development bypass boundaries; map active bond/scope derivation; produce policy metadata coverage; test forged IDs, stale roles, shared accounts, tenant crossing, and anonymous bootstrap; separate route-specific webhook/provider authentication.

**Gate:** every protected route family has one declared authority path, fail-closed behavior, an actor/scope matrix, and AUTHZ G1 evidence. Device/network headers cannot become authority without verified injection.

### F2 — Error, contract, and cancellation coherence

**Window:** 2–4 weeks.

**Tasks:** define canonical internal error (`code`, category, retryable, safe message, safe metadata, cause); classify expected failures versus defects; declare oRPC errors; map Hono to RFC 9457; define streaming error callbacks; define timeout/cancellation propagation; redact logs/telemetry; eliminate protocol-specific drift or explicitly document adapters.

**Gate:** representative read, validation, auth, policy denial, conflict, dependency outage, timeout, and streamed failure have stable client action and structured evidence.

### F3 — Data integrity and operation semantics

**Window:** 3–6 weeks.

**Tasks:** classify read/draft/domain commit/external effect; require operation IDs and payload-bound idempotency for mutations; define replay/changed-payload conflict; identify transaction boundaries; add outbox/repair for delayed work; define receipt states and lookup authorization; map migration/restore behavior.

**Gate:** no protected mutation is exposed without explicit atomicity, replay, conflict, receipt, and recovery semantics. Database success is never conflated with provider delivery.

### F4 — Resilience, observability, and resource fairness

**Window:** 2–5 weeks.

**Tasks:** align rate-limit keys and proxy trust; define per-tenant/user/capability budgets; correlate request/operation/trace/audit IDs; redact sensitive fields; measure queue age, retries, timeouts, unknowns, DB pool pressure, and provider failures; define readiness/liveness/degraded states; add graceful shutdown/drain and retry budgets.

**Gate:** operators can answer what failed, for whom, at which operation, whether it committed, who repairs it, and what it cost—without reading raw sensitive content.

### F5 — Recovery, security, and operational proof

**Window:** 3–8 weeks.

**Tasks:** crash/failure/restore/rotation drills; backup and migration rehearsal; worker/outbox repair; secret rotation and revocation; incident runbooks; operator succession; dependency outage simulations; physical-device/offline replay scenarios; independent security challenge.

**Gate:** FAIL/DATA/RACE/AUTHZ evidence exists for the selected protected capability, with named residual-risk owners and stop conditions.

### F6 — Foundation release decision

**Window:** 1 week.

Choose one:

- **Proceed:** foundation floor is coherent for a named capability envelope.
- **Proceed with limits:** only private/read/draft or one controlled door is allowed.
- **Reshape:** architecture or ownership changes before implementation.
- **Block:** unresolved critical risk or missing operator/evidence path.

The result is capability-scoped. It does not certify the entire Sanctuary API forever.

## Non-goals

- no GraphQL introduction;
- no wholesale Effect migration;
- no microservice split;
- no mass `any` rewrite without an impact set;
- no deletion of legacy routes;
- no “100% foundation complete” claim based on static counts;
- no vertical AI/channel expansion before the relevant foundation gates pass.

## Channel-neutral delivery direction

The API is the authority and capability catalogue; web, mobile, WhatsApp, Telegram, WebMCP/MCP and workflow runners are projections/adapters, not separate domain implementations. A capability is identified once, carries its declared input/output/error and access-class metadata once, and is settled through the same server-side authentication, authorization, idempotency and audit path regardless of channel. Channel adapters may translate text, buttons, callbacks or offline envelopes, but they must not invent authority, duplicate domain rules or write directly around the API.

Explore is the public, low-risk catalogue and practice projection. It may use explicitly delivered local adapters for safe interaction rehearsal, but it is not an anonymous Sanctuary API and must never be used to test protected mutations against live data. Sanctuary is the authenticated, authoritative app. This keeps the user-facing experience testable without creating a second backend or a misleading demo door.

Phone authentication is now represented in the shared `IAuthPort`/`AuthManager`/`authAPI` seam as a two-step OTP capability (`signInWithPhoneOtp`, `verifyPhoneOtp`). The Supabase adapter maps the seam to SMS OTP and the memory adapter supports deterministic tests. Provider configuration, abuse/rate limits, number ownership, account-linking policy and UI enrollment remain explicit operational work; the seam does not claim those controls are deployed. Stable internal account IDs and identity/channel links remain the invariant for future channels.

## Cross-cutting evidence contract

| Area | Minimum evidence before protected release |
| --- | --- |
| Authn | Signed token/claims, key refresh/failure, expiry, dev bypass boundary |
| Authz | Allow/deny, forged scope, stale role, tenant isolation, resource lookup |
| Contracts | Strict input/output/error schema and safe metadata |
| Errors | Stable code/type, retryability, safe response, structured diagnostics |
| Data | Transaction, constraint, idempotency, conflict, restore |
| Async | Outbox/worker acceptance, retry, unknown, repair |
| Offline | Local draft, stale authority, account switch, revocation |
| Operations | Rate fairness, queue age, trace/correlation, alert, runbook |
| Security | Threat model, secret boundary, redaction, abuse tests, independent challenge |

## Exit criteria for starting the classroom-note implementation

The classroom-note slice may begin only when F1–F3 gates are accepted and the highest-risk F4/F5 controls have an implementation owner. The current source finding that note and lifecycle event writes are separate means the slice is presently in **design-only** status.

## Boundary calibration from F2 evidence

The [F2 addendum](../current_progress/2026-10-13-f2-error-contract-audit.md) directly demonstrated that the current contract converter preserves input but drops declared response schemas and has an empty error map for a representative route. Its shared RPC client is parameterized with `any`. Previous broad output-validation/typed-client claims must therefore be treated as architecture intent, not proof.

The coherent target has parallel transport adapters: domain/application failures → native oRPC declared errors; ordinary HTTP failures → RFC 9457; streamed failures → terminal protocol events; provider failures → provider-required response plus internal canonical event. Never rewrite native oRPC errors indiscriminately through Hono. Request IDs, operation IDs, safe resolution instructions, retry budgets and redaction must survive each supported projection.

First remediation packet: characterize converter output/error metadata and client retry/cancellation semantics. Inventory actual runtime upload/outbox callers before reusing the legacy sync classifier. Keep this work separate from adding channels, databases or AI frameworks.

## Verification boundary

This plan defines target responsibilities and acceptance gates. Source probes establish specific current gaps, not full platform coverage. Architecture coherence is not runtime assurance: F1–F5 remain open until their named evidence exists. No foundation release is approved by this document.
