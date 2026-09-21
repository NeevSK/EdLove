---
title: "Foundation Hardening Ledger"
status: "active"
created: 2026-09-20
updated: 2026-09-21
author: "Naveen"
scribe: "Codex"
tags: [foundations, hardening, ledger, handoff, collaboration]
---

# Foundation Hardening Ledger

## Purpose

This is the durable control panel for work that crosses chats. It records
what is actually known, which evidence has been earned, what remains
unproven, and the next bounded slice. It is not a roadmap of promises and it
does not turn an untested area green through omission.

The project is directed through the [Human AI Collaboration Charter](../engineering/human-ai-collaboration-charter.md).
That charter is itself foundational infrastructure: Naveen owns product intent
and consequential trade-offs; agents provide explicit options, evidence, and
limits. Every work chat must use its truth labels (Known, Inferred, Unproven)
and translation contract.

The governing hardening approach is the [Adversarial Production Hardening
Ratchet Plan](2026-09-20-adversarial-production-hardening-ratchet-plan.md).
This ledger names the workstreams that the ratchet will harden one at a time.

## How to Use This Across Chats

1. Start a chat with one row's named next slice and its canonical document.
2. Create or update a feature spec before AMBER/RED implementation.
3. At the end, update this row with exact evidence and limitations—not a
   blanket completion claim.
4. A new chat treats this ledger and the linked documents as durable context;
   chat history is supporting context only.

## Status Vocabulary

| Status | Meaning |
| --- | --- |
| Not assessed | No sufficiently scoped inventory/evidence exists yet. It is not low risk. |
| Mapped | Code and ownership were inventoried; behavior remains unproven. |
| In progress | A bounded feature spec exists and implementation/evidence is underway. |
| Verified at Gx | Only the stated evidence level and limitations have been achieved. |
| Hardened for stated scope | Contract, hostile cases, recovery, operational evidence, and required review are complete for the named scope—not for the whole foundation. |

## Active Slice: Route Intent, QR, and Link Entry

Canonical policy: [Route Intent Policy](../architecture/route-intent-policy.md).  
Feature contract: [Route Intent Policy Hardening](2026-09-20-route-intent-policy-hardening-feature-spec.md).

| Area | Status | Known evidence | Unproven / remaining next work |
| --- | --- | --- | --- |
| Shared QR route classification | In progress | G0 pure policy/QR contracts: 26 cases; canonical HTTPS and custom-scheme routes classify consistently for covered inputs. | Independent review; public QR variants beyond covered contract; pending-action expiry. |
| Scanner and mobile provider handoff | In progress | G1 scanner boundary: 3 cases; G3 React provider runtime: 6 cases, with Expo/native/storage substituted. | Real scanner/device behavior, cold start, offline/retry and authenticated delivery on physical devices. |
| Web QR landing | Verified at local server runtime only | Local Next 16 server rendered valid and invalid public QR paths, including explicit app handoff and no automatic action. | Browser-level G4 behavior, deployed HTTPS behavior, app/universal-link association and device opening. |
| Verified HTTPS app handoff | Blocked by deployment evidence | Mobile configuration declares iOS associated domains and Android auto-verified `/qr` filters. Live checks on 2026-09-20 found `https://gurudevi.app/.well-known/assetlinks.json` and `apple-app-site-association` return 404; the sanctuary host TLS handshake failed from this environment; no ADB device is connected. | Publish correct per-host association files using the real Android signing certificate and Apple Team ID, repair/verify sanctuary TLS, then run installed Android and iOS G5 tests. |
| Host ownership alignment | In progress | Mobile configuration additionally declares `platform.gurudevi.edlove.org`; route policy presently treats `gurudevi.app` and `sanctuary.gurudevi.app` as public hosts. | Make an explicit keep/migrate/remove decision and ensure policy, app config, association files, and deployment ownership match. |
| Diff-scoped hardening ratchet | In progress | `pnpm run check:route-intent-slice` now completes fail-closed for the owned files: G0/G1/G3 reports, changed-file lint, and duplication scan (0 clones). | Independent critic review and a stable tool/version decision for broader scoped anti-slop analysis. |

Do not read the above as authentication completion. The route slice intentionally
does not establish or validate OAuth callback state, PKCE, nonce, expiry, or
replay protections.

## Remaining Foundation and Plumbing Inventory

| Foundation | Why it matters | Current status | First bounded hardening slice |
| --- | --- | --- | --- |
| Human–AI operating system | Keeps product authority, technical translation, agent limits, and handoffs visible across chats. | Mapped; charter exists. | Add a standard slice handoff/evidence template and use it for the next RED/AMBER slice. |
| Authentication and session lifecycle | Identity, account recovery, OAuth callback safety, session renewal, logout and account switching determine who the app is acting for. | In progress — the immediate delivery contract is [Single-Account Authentication and Session Release Slice](2026-09-21-single-account-auth-session-release-slice.md); broader feature and architecture context remain in [Authentication and Session Lifecycle Hardening](2026-09-20-auth-session-lifecycle-hardening-feature-spec.md) and [Cross-Platform Auth, Session, and Local-First Implementation Plan](2026-09-20-cross-platform-auth-session-seam-implementation-plan.md). `AccountTransitionPort` is retained but has no new release consumer. Web callback exchange, local sign-out, and deletion status/request/cancel use authenticated server route handlers with `private, no-store` responses; mobile browser-OAuth rejects URL tokens, uses the code-only deep-link manager, and exposes cancel for eligible deletion requests. Linked-project CLI evidence confirms the deletion RPC migrations and restricted RPC grants. On 2026-09-21, an isolated target-asserting Supabase configuration push added the two hosted `/auth/complete` URLs; post-push comparison has zero declared updates. | Finish one-account callback/session/onboarding/recovery proof and obtain non-mock G3/G4/G5 evidence. Keep passkey unavailable until hosted WebAuthn is enabled and validated. |
| Authorization and tenant isolation | Prevents cross-school/user data access and privilege escalation even when a user is authenticated. | Not assessed. | Inventory one sensitive read and one mutation end-to-end; prove cross-tenant, revoked-role, and stale-session denial. |
| Public links, app/universal links, invitations, and notifications | Every external entry must preserve intent without silently acting, leaking data, or dropping recovery. | Route/QR partially in progress; other transports unassessed. | Test deployed association files and real installed-app opening; then map invitation and notification dispatch into the same policy. |
| API contracts and error/retry semantics | Web and mobile need the same safe contract when servers reject, time out, or partially succeed. | Not assessed. | Pick one shared API boundary; standardize typed error, retryability, redaction, and correlation behavior. |
| Mutation idempotency and reconciliation | Duplicate taps, retries after timeout, and workflow re-delivery must not duplicate money, joins, or records. | In progress — the shared queue now has legal lifecycle transitions, atomic overflow refusal, original-account binding, principal-scoped pause/resume, and migration-backed DLQ recovery. The mobile bridge sends the mutation ID as Inngest transport identity and settles only from a typed oRPC receipt lookup; the worker handler scopes receipt lookup to the requesting actor. Direct registry replay now receives the idempotency key, but the remaining legacy registry is not yet a single typed server command protocol. | Replace `variables: any`/string registry paths with the RED envelope; make every adopter settle from an atomic server receipt keyed by principal + idempotency key + digest; prove collision, authorization, and concurrent-device behavior. |
| Offline queue and synchronization | Mobile must survive lost connectivity, restart, conflict, and account switch without applying work to the wrong account. | In progress — foreground and restored mobile background drainers use exact-account filtering, lifecycle guards, leases, retry state, and `finally` cleanup. The legacy mobile DLQ is now imported into the core DLQ before use rather than acting as a competing recovery authority. `AccountTransitionPort` quarantines or discards only the outgoing principal before PowerSync data is cleared. **Decision (2026-09-21): `gurudevi-web` is online-only for this release; no browser command persistence, OPFS, PowerSync-web, or background-sync promise.** | Prove mobile persistence/restart and simultaneous foreground/background lease contention; add overflow/DLQ recovery UI; complete the platform-neutral command/receipt ports so a future browser adapter can reuse them without changing feature contracts. |
| Data ownership, migrations, backup, and deletion | Correctness includes schema changes, privacy/deletion requests, restoration, and irreversible data operations. | Not assessed. | Inventory data stores and choose the highest-risk mutation/migration path for rollback and audit design. |
| Observability and incident recovery | Production failures need privacy-safe correlation, useful signals, alerts, and a tested rollback—not console hope. | Not assessed. | Define one critical journey's error/latency/success signals plus an operator recovery runbook. |
| Payments, entitlements, and webhooks | Money and access changes need signature verification, replay/idempotency protection, reconciliation, and auditability. | Not assessed. | Map provider webhook to entitlement; define signature, replay, failure, and reconciliation contract. |
| AI routes, tools, retrieval, and cost controls | AI can be induced to leak data, act beyond authority, follow hostile content, or incur uncontrolled cost. | Not assessed. | Inventory AI ingress, tool permissions, tenant-scoped retrieval, logging/redaction, and budget limits before expanding agent features. |
| Deployment, configuration, secrets, and rollback | A correct build is unsafe if it has the wrong environment, secrets, flags, migration order, or no rollback. | Not assessed. | Map one staging-to-production path, immutable versioning, secret/config validation, health checks, and rollback execution. |
| Accessibility, performance, and client resilience | A journey is not dependable if it fails under assistive tech, slow devices, poor networks, or large data. | Not assessed. | Select J1 authentication and define baseline accessibility/performance/network checks at browser and device levels. |

## Ordering Principle

Work is selected by user harm and shared leverage, not by which layer feels
most elegant to refactor. The current recommended order is:

1. Finish route-intent proof through browser/device association and its scoped
   ratchet.
2. Harden authentication callback and session lifecycle as a separate RED
   slice.
3. Prove authorization/tenant isolation on a real sensitive journey.
4. Harden one mutation plus its offline/retry/reconciliation path.
5. Expand into operational recovery, payments, and AI boundaries as their
   real integrations become active.

## Required Handoff Record

Every completed work chat adds a brief entry beneath its relevant row or links
to a dated feature spec containing:

- outcome and exact owned paths;
- decisions made and decisions explicitly deferred;
- Known, Inferred, and Unproven facts;
- exact evidence commands, G-level, runtime/substitutions, counts, and limits;
- open risks, waivers with expiry, and the next smallest slice.

No work chat is responsible for hardening every row. It is responsible for
leaving its one row more truthful, safer, and easier for the next collaborator
to continue.

## 2026-09-20 mutation foundation handoff

**Outcome:** initial shared safety slice in `packages/core/src/lib/sync/`,
`packages/core/src/store/resetScopedStores.ts`, and mobile coordinator/task
adapters. It removes silent accepted-command loss, unbound replay, event-only
settlement, destructive account-reset clearing, and unsafe cross-account
background replay. The Inngest bridge now waits for a worker receipt before
settling a command.

**Known:** `pnpm --filter @repo/core exec vitest run
src/lib/sync/__tests__/commandLifecycle.test.ts
src/lib/sync/__tests__/useMutationQueue.test.ts` produced 9/9 G0 unit/state
cases using Vitest 5.0.0. It proves the tested lifecycle, overflow,
concurrent-insertion, account-binding, and scoped-resume contracts under
Zustand/storage substitution. `pnpm --filter gurudevi-mobile exec vitest run
src/__tests__/entry/AuthenticatedSyncService.test.tsx
src/__tests__/architecture/background-sync-task-entry.test.ts
src/__tests__/architecture/efficiency-policy-boundaries.test.ts` produced 6/6
G1 boundary cases using Vitest 5.0.0; it proves the mocked mobile entry/task
integration preserves the workflow bridge while enforcing the active-account
background boundary. `pnpm --filter @repo/core exec tsc --noEmit` and `pnpm
--filter gurudevi-mobile exec tsc --noEmit` completed with exit 0.
The Inngest bridge now has a receipt-backed pending/completed boundary; the
Sanctuary worker scenario `platform-workers.test.ts` remains 3/3 under Vitest.
`pnpm run check:anti-slop` remains blocked by 46 existing repository errors
and 511 warnings; this slice's unused-import finding was removed. The remaining
changed-file warning flags pre-existing capped retry-backoff logic in
`SyncManager` and is not suppressed.

**Does not prove:** deployed receipt-route behavior against production schema,
native storage/restart, a real auth refresh, background OS execution, server
transaction rollback under live Inngest timing, PowerSync, Next browser persistence,
real multi-device convergence, accessibility, or production behavior. The
next smallest RED slice is typed command/receipt transport plus principal
partitioned durable storage; do not migrate attendance or another domain first.

## 2026-09-21 mutation and account lifecycle handoff

**Outcome:** the foundation now has a shared lifecycle state machine, account
transition port, safe queue capacity semantics, receipt-aware mobile workflow
bridge, actor-scoped typed receipt contract, background/foreground lease
guards, and legacy-DLQ import into the shared recovery store. oRPC is the
canonical typed client boundary over the existing Hono host; the earlier 400
was an invalid active-scope test fixture, not a transport incompatibility.

**Known:** raw Vitest 5 commands produced 29/29 focused core scenarios,
including a serialized durable-ledger concurrent-retry contract and an atomic
lease-claim contract; 6/6 mobile mocked entry/task scenarios; and 6/6
Sanctuary receipt-route scenarios, including assertion that the query binds the
requested mutation and authenticated actor. Mobile TypeScript completed with
exit 0. These are G0/G1-style unit/boundary evidence under Zustand, Expo/task,
and database substitutes; they prove the named contracts, not a live browser,
device, PowerSync service, worker schema, or production convergence. Core
package-wide TypeScript is currently blocked by the inherited
`src/hooks/useAccessibility.ts` timeout type error; Sanctuary remains blocked
by the inherited `src/ai/routes.ts` `totalTokens` error. The repository-wide
anti-slop command remains blocked by inherited findings and must not be treated
as green.

**Infrastructure verification (read-only, 2026-09-21):** PowerSync Cloud
instance `69f985158d064eb85ee933e0` reports its Supabase source connected,
initial replication complete, and zero replication lag. Supabase project
`qzoawolfkuwiuyaoiybz` is `ACTIVE_HEALTHY`; remote migration history contains
`20260811070000_powersync_idempotency_ledger` and
`20260814050000_platform_worker_events`. No infrastructure mutation or deploy
was performed.

**Database integration verification (rolled back, 2026-09-21):** against
Supabase project `qzoawolfkuwiuyaoiybz`, a transaction inserted and completed
a disposable principal/idempotency-key ledger row, observed its completed
receipt fields, and rolled back. A second rolled-back transaction inserted two
disposable worker receipts with the same entity but different `payload.actorId`
values; the production receipt predicate returned only the requested actor's
row. This proves deployed table/constraint/query compatibility under an admin
test connection. It does not prove the deployed Sanctuary API process, ZenStack
authorization context, or real client network path.

**Unproven:** a deployed `platform_worker_events` receipt schema and actor
isolation under its real database, crash/restart persistence, concurrent
foreground/background execution under real OS scheduling, every direct registry
mutation's server-side idempotency, browser storage/SSR boundaries, real
Android/iOS execution, and multi-device reconciliation.

**Next bounded sequence:** (1) finish typed command/receipt adoption for one
server command boundary and its transaction; (2) add persistence, actor
isolation, lease-contention, and recovery-UI tests; (3) expose the shared
platform-neutral command/receipt contract for all future consumers; (4) obtain
mobile/device evidence. Browser offline capability is explicitly deferred;
web remains online-only with normal request/reconnect error handling.
