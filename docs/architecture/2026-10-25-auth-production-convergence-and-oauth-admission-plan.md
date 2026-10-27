---
title: "Auth Production Convergence and OAuth Admission Plan"
status: "superseded"
superseded_by: "../current_progress/2026-10-25-canonical-uuidv8-account-cutover.md"
created: 2026-10-25
updated: 2026-10-25
author: "Naveen"
scribe: "Codex"
tags: [architecture, authentication, identity, authorization, oauth, verification, production]
---

# Auth Production Convergence and OAuth Admission Plan

## Purpose and authority

The user subsequently authorized the breaking pre-production UUIDv8 primary-key
cutover. The additive handle/compatibility sequence in this proposal is no
longer the execution plan. Its session, delegation, and evidence concerns remain
relevant; see the linked cutover record for implemented scope and actual proof.

Connect existing identity, API, database, and client-state work into a bounded
production release sequence. This is an integration proposal, not a replacement
authority, deployment approval, or completed security audit. Inspection covers
the current shared working tree, which contains concurrent uncommitted work.

The governing records remain:

- [Authentication and Sovereign Identity Authority](authentication-and-sovereign-identity.md).
- [EdLove Identity Convergence Program](edlove-identity-convergence-program.md).
- [Identity Phase 2 ledger](../current_progress/2026-10-24-edlove-identity-foundation-phase-2-plan.md).
- [Phase 1B operations](../current_progress/2026-10-24-edlove-phase-1b-controlled-assignment-operations-plan.md).
- [API canonicalization](2026-10-23-api-v0-v1-canonicalization-plan.md) and [Gate C](2026-10-23-api-v0-v1-gate-c-admission-plan.md).
- [Gate D human-first programme](2026-10-23-gate-d-human-first-platform-programme.md) and [platform capability ledger](platform-capability-and-implementation-ledger.md).
- [Client-state completion roadmap](2026-10-25-client-state-phase-3-completion-roadmap.md) and [authorization-snapshot admission](2026-10-25-client-state-phase-3-authorization-snapshot-admission.md).
- [Production evidence governance](production-evidence-governance.md).

## Architecture decision proposed

Keep Supabase as the sole enabled human credential/session issuer during
convergence. Own the durable account, provider binding, lifecycle, membership,
authorization, recovery policy, and audit contracts in the existing platform
boundaries. Operating a new credential issuer is a separate decision.

```text
Supabase credential/session
  -> verified issuer subject
  -> server-owned auth_identities binding
  -> public.users.id + lifecycle
  -> persisted relationship and selected scope
  -> capability authorization
  -> domain read/write + receipt/recovery

users.edlove_id: additive UUIDv8 handle, outside the authorization chain
```

Provider neutrality is achieved at this application boundary. It does not
promise that password hashes, refresh tokens, MFA enrollments, passkeys, or
external OIDC subjects migrate automatically between issuers.

## Current evidence and gaps

| Workstream | Current source or recorded evidence | Production gap |
|---|---|---|
| Account resolution | `apps/sanctuary-api/src/core/authenticatedAccount.ts` maps provider subject to a non-deleted canonical account. | Hosted binding integrity, lifecycle enforcement across every entry point, and deployed role/configuration parity. |
| UUIDv8 assignment | Dark schema, private writer, new-account queue/worker, and historical-operation controls exist. Phase 1B has a newer locally implemented operations record than the Phase 2 summary. | Hosted forward reconciliation, verified worker role, approved operational execution and count reconciliation. Older count of 281 is a dated observation, not a live inventory. |
| API convergence | Canonical attendance route, server-derived authority, receipts, and external-effect foundation exist. | Real Postgres contention/rollback, policy parity, caller adoption, and deployed effect delivery. Gate C checkpoint records substituted DB evidence. |
| Gate D | Human-first programme records bounded D0 inventory closure. | Inventory closure is not domain admission or runtime maturity. The older Classroom-centred Gate D constitution remains a preserved draft. |
| Client state | Scoped session coordinator and scoped notification/attendance/device-security reads exist. | Authorization-snapshot admission, authenticated browser/device journeys, stale-response and disposal proof. |
| Browser E2E | `apps/gurudevi-web/tests/e2e/auth-flows.spec.ts` contains a password journey expecting the private-space signed-out prompt when Sanctuary is absent. | That assertion does not prove successful authenticated application entry. Add a release-like API-backed journey without weakening the existing characterization. |
| Token verification | `apps/sanctuary-api/src/jwt.ts` verifies signatures and configured issuer/audience; uses key and verification caches. | Characterize missing/malformed required claims, exact expiry boundary, unknown-key rotation, cache invalidation, session revocation, and third-party client admission. |

The inspected oRPC context currently resolves `verifiedPayload.sub` to an
account, then constructs persisted scope. This seam must carry and enforce
session and delegated-client context where required; account ownership alone
cannot distinguish a first-party session from an external OAuth grant.

## Invariants and verification obligations

| ID | Invariant | Required negative or recovery proof |
|---|---|---|
| A1 | Credential subject, canonical account, and EdLove handle remain distinct. | Fixtures deliberately use different values; every authorized path still selects the same account. |
| A2 | A verified `(issuer, subject)` maps to exactly one account through a server-owned binding. | Missing, conflicting, deleted, wrong-provider and wrong-environment cases deny; callers cannot write/rebind identities. Current provider labels must resolve to a configured issuer; multi-issuer labels need explicit design. |
| A3 | Signature validation is only the authentication boundary. | Reject wrong algorithm/key/issuer/audience/token purpose, invalid time claims and invalid production configuration; production-like tests disable identity bypasses. |
| A4 | Session, lifecycle, MFA assurance and domain permission are separate decisions. | Deactivated/deleted accounts, revoked membership, stale scope, insufficient assurance and replayed credentials never gain authority from a valid JWT alone. |
| A5 | Revocation has a documented maximum enforcement delay per operation. | Test active-session/recent-auth checks for sensitive commands; bound ordinary JWT/cache exposure and propagate revocation to clients, realtime and sync as supported. Do not claim instant universal logout from signature verification. |
| A6 | Domain authority comes from persisted relationships, never request roles or tenant headers. | Account A/B and school X/Y allow/deny matrix across v0, v1, SQL RLS, ORM policy, storage, realtime and sync where reachable. |
| A7 | Account/scope transitions cannot expose outgoing private data or reassign durable work. | Delayed A response after switching to B is discarded; outgoing subscriptions/cache are disposed; A outbox remains A-owned and is quarantined/revalidated. |
| A8 | Linking and recovery cannot become takeover or lockout paths. | Matching email/phone never independently authorizes a merge; require recent auth, collision handling, last-credential protection, recovery and audit. Characterize provider-native automatic linking separately. |
| A9 | Durable changes and operation receipts settle coherently. | Real transaction rollback, duplicate concurrent request, lost response, changed-payload replay, worker crash/reclaim, and cross-principal receipt isolation. |
| A10 | UUID assignment cannot rewrite identity or grant privilege. | Null/pending handle preserves the canonical-account contract; collision/retry and worker failure do not create a second account. Queue-enqueue failure during account creation needs an explicit availability contract and fault test. |
| A11 | Third-party grants never inherit unrestricted first-party authority. | Deny external tokens by default at every reachable API/data surface until client, audience, consent and permission checks exist. Missing `client_id` alone is not sufficient positive proof of first-party origin. |
| A12 | Compatibility survives deployment and rollback. | Old supported clients and v0 routes operate against the expanded schema; rollback preserves bindings, assigned handles, receipts and pending work. |

## Delivery sequence and exit gates

| Slice | Deliverable and existing owner | Exit proof |
|---|---|---|
| 0. Reconcile reality | Extend the existing identity/capability ledgers with route-to-authority-to-data paths, enabled issuers/methods, client versions, migration state, and evidence references. | Every reachable credential/authority path has an owner, environment and disposition. Unknowns remain unknown; no broad rewrite. |
| 1. Close the shared authority contract | Sanctuary verifies credential/session context, resolves account/lifecycle and persisted scope; `@repo/core` carries typed projections; web/native consume them. Reuse the current resolver/router and bootstrap contracts. | A1-A6 contract tests, then one real credential -> API -> database allow/deny scenario. Resolve JWT/cache findings through focused regressions before adaptation. |
| 2. Prove database compatibility | Disposable release-like Supabase/Postgres, real migrations, real roles and actual policy/trigger code. Separately inspect the hosted ledger read-only. | Fresh replay AND upgrade rehearsal; bindings, RLS/ORM parity, grants, queue/receipt races and rollback. Historical migration edits cannot update an already-migrated hosted DB. |
| 3. Prove client transitions | Existing scope/session coordinator, browser authorized-entry boundary and native lifecycle/storage paths. Keep v0 routes and fallbacks. | Login -> canonical profile -> scoped read/write -> refresh/wake -> account switch -> logout, including late responses, offline outbox ownership and denied scope. |
| 4. Complete credential stewardship | Explicit link/unlink, recovery, MFA/recent-auth, device/session revoke, guest conversion and account deletion. | Takeover/lockout negative scenarios and browser/device recovery journeys. Only advertise methods evidenced in the target environment; passkeys remain gated. |
| 5. First-party release | Operational controls, least-privilege roles, key rotation/outage drills, privacy-safe logs, SMTP/delivery, abuse controls, restore/rollback and canary. | G0-G5 applicable evidence plus R1 operational packet; stop on unresolved identity mismatch or cross-account/tenant access. Define numerical availability/latency/revocation limits before canary. |
| 6. External OAuth admission | Separate issuer decision and consent/delegation contract after first-party authority is proven. A private compatibility spike can proceed earlier without exposing users or data. | Independent relying-party interoperability and adversarial API/RLS isolation tests; explicit launch decision. |

Historical UUID backfill remains its own controlled operations lane. It is not
a prerequisite for stabilizing first-party login, because `edlove_id` is
additive. No hosted mutation, worker enablement, live backfill or retirement is
authorized by this draft.

## Verification strategy

Use invariants to define the contract, integration tests to prove owned seams,
and thin end-to-end journeys to prove composition. None substitutes for the
others. Prefer extending existing suites over building a parallel harness.

| Evidence | Engine and boundary | Examples and limitations |
|---|---|---|
| G0 | TypeScript, import/policy sentinels, schema/contract checks | No provider-specific identity used as a domain key; no new client authority writes. No runtime proof. |
| G1 | Vitest boundary tests, with named substitutions | JWT verifier, account resolver, typed denials, cache keys, callback validation and linking conflicts. Mocks do not prove SQL or hosted issuer behaviour. |
| G2 | Stateful scenarios plus explicitly labelled real-SQL integration | Account A/B and school X/Y matrix; expiry/revoke/switch/offline/retry; pgTAP grants/triggers and real receipt contention. State whether provider/network are substituted. Real SQL is not device evidence. |
| G3 | Actual mounted React/native tree | Callback/lifecycle rendering, fail-closed state, transition cleanup. Record bridge substitutions. API composition tests remain API integration, not mounted React proof. |
| G4 | Next/browser and native platform build/runtime as applicable | Real cookie refresh, CSRF/redirect rejection, cross-tab logout, API-backed allowed and denied journeys. Browser auth routing alone is insufficient. |
| G5 | Physical Android/iOS | System-browser OAuth/deep link, cancellation, cold/warm callback, secure storage, app wake, account switch and device revoke. |
| R1 | Release-like hosted rehearsal then controlled production canary | Key rotation, provider/DB outage, rate/abuse controls, restore and rollback, delivery and monitoring. Use dedicated synthetic accounts; no secret/token logging. |

Every result records source revision or selected-input hashes (including dirty
files), environment/migration versions, command, assertions, substitutions and
limitations. Keep the repository's evidence taxonomy explicit; suite names or
an `integration` filename do not establish an evidence level.

CI should run scoped G0/G1 and critical state scenarios on relevant changes,
real disposable-DB migrations/policy/race checks before admission, and a small
release-like browser suite before release. Device and operational evidence
must match the enabled auth methods and the release candidate. Reuse existing
Supabase tests, Sanctuary configs and device/browser workflows; the real-PG
policy config recreates its target schema and must use an isolated test DB.

## OAuth-specific admission

As checked on 2026-10-25, Supabase's getting-started guide calls its OAuth 2.1
server beta. Its OAuth flow guide lists standard identity scopes and says
custom scopes are unsupported; data access must be constrained with policies
using client identity. Installed `@supabase/supabase-js` and `auth-js` are
2.117.2, with `@supabase/ssr` 0.12.7 in the lockfile. Installed `GoTrueClient.ts`
exposes authorization details, approve/deny, list grants and revoke grant
methods. SDK availability is not proof the deployed Auth server enables them.

Before choosing Supabase-backed OAuth versus a separate mature issuer, define:

1. Is the product offering identity-only OIDC login, delegated Gurudevi data
   access, institutional SSO into Gurudevi, or several independently gated jobs?
2. Stable issuer URL and `(iss, sub)` contract, including provider exit and
   client migration. Do not rewrite Supabase's `sub` to an EdLove UUID. Consider
   pairwise subjects to avoid unnecessary cross-product correlation; UUIDv8
   metadata is not automatically appropriate for third-party disclosure.
3. Public/confidential client registration, exact redirect allowlists, PKCE
   S256, CSRF/state and applicable OIDC nonce validation, one-use codes,
   audience/token-purpose checks, refresh replay protection and revocation.
   Do not accept ID tokens as API access tokens or embed client secrets in apps.
4. Consent, least-privilege grant storage, client/permission enforcement,
   disconnect and recovery. Standard profile scopes cannot authorize attendance
   or private journal access. Audit direct PostgREST/storage/realtime access as
   well as Sanctuary; protecting one gateway leaves other data planes reachable.
5. Dedicated external-principal context: granted permissions intersect current
   account permissions and resource scope; revocation or account deletion
   removes access according to the declared enforcement bound.
6. Independent OIDC relying party: discovery/JWKS/ID-token/UserInfo consistency,
   subject stability, code replay, redirect mismatch, expired/revoked grant,
   client A token at client B/resource B, and attempts against first-party APIs.

The recommendation is to evaluate the existing Supabase capability first,
with a private, deny-by-default integration. If its verified limitations do
not meet the delegated-permission requirements, select a mature dedicated
issuer through a separate decision. Do not implement a new OAuth protocol
engine as a side effect of account decoupling.

## Inspection evidence for this planning task

G1 boundary / Vitest 5.0.5 Node engine:

```text
Working directory: apps/sanctuary-api
pnpm exec vitest run src/__tests__/authenticated-account.test.ts src/__tests__/canonical-account.security.test.ts src/__tests__/jwt.test.ts src/__tests__/identity-scope-context.test.ts
Result: 4 files, 37/37 assertions passed on 2026-10-25.
```

Proves only the existing assertions under the selected configuration, including
synthetic signing keys in JWT tests and substituted service/database boundaries.
Does not prove hosted Supabase configuration, complete JWT adversarial coverage,
real SQL isolation, policy parity, external OAuth, device behaviour or production
readiness. No product code, database or provider configuration changed here.

## Primary guidance checked on 2026-10-25

- [Supabase 2.117.2 release](https://github.com/supabase/supabase-js/releases/tag/v2.117.2), paired with installed source and lockfile inspection; no upgrade proposed.
- [Supabase OAuth server setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started) and [OAuth flows and scope limits](https://supabase.com/docs/guides/auth/oauth-server/oauth-flows).
- [Supabase SSR advanced guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide): signature validation versus live session checks and private response caching.
- [RFC 9700, January 2025](https://www.rfc-editor.org/rfc/rfc9700.html): OAuth security best current practice.
- [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252.html): native OAuth through external user agents.
- [OpenID Connect Core, errata set 2](https://openid.net/specs/openid-connect-core-1_0.html): subject, issuer and ID-token semantics.
- [OWASP ASVS 5.0](https://asvs.owasp.org/): map applicable authentication/session/authorization requirements into evidence; Level 2 is a proposed baseline, not a certification claim.
