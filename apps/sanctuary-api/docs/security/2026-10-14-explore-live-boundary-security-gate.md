---
title: "Explore and Live Capability Boundary Security Gate"
status: "active"
created: 2026-10-14
updated: 2026-10-14
author: "Naveen"
scribe: "Codex"
tags: [security, explore, authorization, runtime, integration, hardening]
---

# Explore and Live Capability Boundary Security Gate

## Authority and direction

The human authorized updating the direction and enforcing security on 2026-10-14. Web/mobile hardening remains first priority. Public Explore is a safe projection of actual capability declarations plus explicitly delivered local practice, not an anonymous version of protected account APIs. One feature identity and renderer may serve both experiences; the selected runtime and its effects must remain explicit.

Browser persistence namespaces and TypeScript types are correctness controls, not a security sandbox. Same-origin scripts and a person using the same browser profile can potentially read browser storage. The inspected Explore/Safe Try adapters store strings without application-level encryption. Fictional initial state does not prevent a visitor entering real sensitive content. Do not describe IndexedDB or separate keys as cryptographic isolation.

## Coordinated ownership

- API chat owns Sanctuary API enforcement/tests and this gate; live principal/resource/tenant authority remains server-side.
- Explore chat owns the existing shared web renderer/runtime extraction, guest-local entry, workbench/layout isolation, disposal of stale callbacks and web integration evidence. API work must not compete in those files.
- Core manifest/runtime/persistence changes require a bounded impact set and reviewer coordination; extend the existing seams, not a second catalogue or generic runtime framework.

Both chats preserve unrelated dirty-worktree changes. Neither this gate nor coordination authorizes deployment, production credential changes, database migrations or route deletion.

## Feature spec: bootstrap affordance hardening

**Blast zone:** AMBER API handlers/ingress. **Targets:** `src/core/handlers/identity.ts`, `src/core/onboardingBootstrap.ts`, and focused bootstrap security tests. **Reuses:** shared capability declarations, existing Cedar check, authenticated context, exact path exception helper and mounted oRPC test client. **Does not:** relax live Self policy, create an anonymous data endpoint, change UI ownership, add a new framework or change the database. **Budget:** fewer than 60 added production lines; new functions below 15 cognitive complexity.

Mounted characterization found a bootstrap-only OpenAPI input mismatch. The bounded impact set additionally includes `packages/core/src/api/contracts.ts` (optional existing oRPC input-structure type), `packages/core/src/api/identity.orpc.contract.ts` (bootstrap-only detailed input and legacy wrapped-query normalization), and `src/core/orpc.ts` (carry the optional setting). Other routes retain their current input-structure default; input requirements are not weakened. Use the existing Sovereign error middleware for this bootstrap's safe authentication failures.

1. A permitted catalogue read cannot establish create permission. Check each advertised operation against the server principal and resource. Preserve the existing read-entry prerequisite; a read-only feature remains available with only read advertised.
2. Add only the actual native capability-bootstrap path and declared read-only OpenAPI bootstrap path to the no-selected-scope exception list. This exception waives scope selection for authenticated discovery, not authentication or permission on actual data operations.
3. Anonymous bootstrap cannot return account subject/bond metadata. Missing scope produces locked/no-operation affordances. Client mode/role/subject fields never create live authority.
4. Every live data mutation is still independently authorized at settlement. Capability bootstrap is a short-lived affordance hint, never a token granting permission.

## Joint release conditions

| Boundary | Required proof before public promotion |
| --- | --- |
| Public catalogue | Safe declared/delivered projection; no subject/bond/token/real-record fixture; no protected data requests |
| Guest/local practice | Zero protected history, mutation or remote-layout sync, even with an existing signed-in session |
| Failure | Unavailable/corrupt/quota-denied local storage never falls back to live; draft and failure states remain truthful |
| Mode/account transition | Disposed callbacks cannot settle in another mode/account; no implicit queue or practice-data promotion |
| Live authorization | Anonymous/forged actor/tenant/resource requests remain denied, independently of UI affordances |
| Live availability | A valid same-account request still dispatches and succeeds; denial-only tests cannot prove correctness, including lifecycle rehearsal |
| Privacy | Honest local retention/shared-device warnings; no raw sensitive-content analytics; reset and retention failures are visible |
| Live/local outcome | Provenance and storage destination are clear; local save is never described as a server commit |

Do not allow new public practice based only on `localModes` or a renderer name: explicit practice policy, implementation and boundary evidence are required. Fire Journal persists a short preview on the current live path; burning is not verified secure deletion. Mood Lotus has independent live calls and must be included in UI isolation testing.

## Verification status

### Implemented API half

- Account bootstrap now checks the server principal separately for each advertised operation. Read-only permission no longer advertises create. This remains an affordance hint for the declared resource, not a resource-bound authority grant; actual writes still use their own gate.
- Native `identity.capabilityBootstrap({ query: { domain, platform } })` under `/api` and read-only OpenAPI `/api/openapi/capabilities/bootstrap/v1?domain=self&platform=browser` work for authenticated accounts without a selected scope, returning locked/no-operation affordances. Ordinary protected Self routes remain scope-gated.
- OpenAPI detailed input is enabled only for this contract. The previous wrapped `query[domain]`/`query[platform]` form remains accepted; conflicting mixed selectors fail validation. Other routes retain existing defaults. The browser loader's older `/api/identity/capabilities/bootstrap/v1` URL is not a verified REST route; its owner must use one of the actual transports rather than invent another alias.
- Existing Sovereign error middleware maps anonymous account discovery to 401 in both transports. Fictional client roles or Explore mode do not authorize protected Self writes. No anonymous Self endpoint or client-mode permission rule was added.

### Evidence and limits

**G1 boundary / Vitest 5.0.3:** final `capability-bootstrap.security.test.ts` has eleven tests; together with existing Self, identity-scope/bootstrap and converter suites, five files yielded **48/48 tests**. Real Hono, RPCLink and OpenAPI handling are exercised with substituted JWT/DB/policy dependencies. Covers read/create affordance separation, denied reads, missing scope, anonymous/fictional-role rejection, authority-store failure, forged role/school headers, exact paths and legacy query compatibility. Anonymous rejection precedes handler database availability checks. Does not prove production token verification, actual Cedar/Rust policy equivalence, database row isolation or web component zero-network behaviour.

**G0:** targeted Biome and whitespace inspection succeeded. jscpd reported zero clones over the two source files it analyzed (its configured exclusions omit test files). Direct API TypeScript still fails on the existing Sentry option in `app.ts`, context typing in `adRewards.ts`, and inherited `APIError.cause`; no clean compilation claim is made and no suppressions were added. Repository and core checks are recorded when completed.

**UI half:** the coordinated Explore chat now reports a shared feature renderer with an injected runtime: `SelfFloor` composes the floor and `FireJournalFeature` owns the feature presentation; `fireJournalRuntime.ts` selects the authenticated live adapter or Explore-local adapter. Explore uses local practice/workbench storage, disables remote sync, performs no protected account-self calls, and keeps Mood Lotus non-interactive. Reported G2 scenario / Vitest 5.0.0: five web files, **55/55 tests**, including existing-account/selected-scope Explore render, local Fire Journal submission with zero account-client/global fetch calls, matching-account live success, delayed-session account-switch rejection, pre-dispatch cancellation, post-dispatch unknown-outcome handling, StrictMode lifecycle rehearsal, and non-interactive Mood Lotus. API chat independently reproduced the focused client/component subset at **24/24** and the client contract at **11/11**; the full 55/55 remains the web owner's run evidence.

The renderer/runtime split is additive and preserves one feature identity across catalogue, Explore practice, and Sanctuary. The web evidence is configured jsdom/hooks/API substitution, not production-browser network, XSS, cryptographic local isolation, provider delivery, or server idempotency proof. The old unmounted Fire Journal scaffolding remains in `SelfFloor` pending an explicit deletion-only cleanup review; it is not on the active path and is not silently removed by this gate.

The same Sanctuary passwordless entry now exposes phone OTP through the shared `@repo/core/api/auth` seam, with explicit phone/code steps and session-required navigation. Focused G1 evidence is **2/2 tests**; provider delivery, SMS/Twilio configuration, abuse limits, number ownership and account-linking policy remain deployment responsibilities and are not claimed by this UI seam.

**Repository checks, 2026-10-14:** `pnpm check-types` exits one at core (41 reported errors, including missing installed declarations and unrelated domain/layout types); standalone version-drift exits zero; test-evidence exits one on the existing unlevelled edlove-web runner; anti-slop exits one at aislop (44 errors, 616 warnings across 3,324 current dirty-worktree files), so later chained stages were not reached. Counts are not attributed wholesale to this patch. Targeted core contract ESLint exits zero. No gate bypass, suppressions or dependency upgrades were added here.

This gate does not claim an exploitable auth bypass, XSS or data leak has been demonstrated. The horizontal foundation and public promotion gates remain unaccepted until their required evidence exists. Separate-origin isolation, encryption and provider deployments were not implemented or claimed by this patch.

## Coordinated implementation checkpoint

The earlier live-helper findings are resolved in the current bounded implementation: matching-account success proves session resolution and dispatch; delayed-session account change blocks dispatch; pre-dispatch cancellation performs no fetch; post-dispatch cancellation reports an unknown outcome and does not imply safe retry; and the root StrictMode lifecycle rehearsal establishes setup/cleanup ordering without poisoning a subsequent live action. These are test-harness proofs only. They do not certify production browser scheduling, server-side idempotency or provider delivery.
