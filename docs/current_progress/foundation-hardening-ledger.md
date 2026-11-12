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

## 2026-11-12 — Tier from the file name; ratchet re-baselined

- `tooling/architecture-tiers.mjs` now places every `packages/core/src` file. Folder rules come first. Then name rules apply (`*.schema|types|contract` → T0, `*.port|*.tags` → T1, `*.adapter`/Driver/Monitor/Sink/Vault → T3, stores/slices/machines → T4, `use*` hooks → T5, `.tsx` → T6). Any file left over defaults to T2.
- The pre-v1 client (`packages/core/src/api/` except `v1/`) is tier `RETIRED`. Live files that import it are reported as `imports-retired`.
- Declared package entries (the `exports` barrels) are the public surface and are exempt from import direction.
- Ratchet re-baseline, with reasons. No code got worse:
  - `unplacedFiles` 335 → 0: every core file now has a tier.
  - `tierImportViolations` 161 → 199: 309 files that had no tier before are now checked. The rule is unchanged, so the extra violations were always there and are now visible. Before this change the count was 154.
  - `passThroughFiles` 41 → 30: tightened to the current count.
- `Source files > 800 LOC` (39/36) and `Root package.json scripts` (165/129) fail at HEAD as well. They are pre-existing and their ceilings are left alone, as the owner asked.
- `scripts/move-modules.mjs` now rewrites explicit `package.json` exports entries for moved files.

### Batch 1: files named for what they are

- 30 I/O files became `*.adapter.ts` (`lib/` storage and session, security, sync eventBus and replayIdentity, permissions evaluator with `.native`/`.web` variants, signature, snapshotRefresh, reflection records, webAuth, reliefAgent, apiInterceptor, AuthClient, offline resilience, accounts/*). `logic/i18n/config.ts` became `i18n.adapter.ts`.
- 7 state files became `*.store.ts` / `*.machine.ts`: experienceState, mutationAuditLog, versionGating, mutationQueue (formerly `useMutationQueue.ts`, a store and not a hook), pendingIntent, provisionalWorkspace, contextRegistry, roleJourney.machine (formerly `roleJourneyMachine.v6.ts`).
- Export names are unchanged; only paths moved. The `package.json` exports entries (storageWrapper, web-auth, offline) were updated by the script.
- `PLACEMENTS` is now empty, because the names carry the tier.
- Core findings went from 242 to 192. forbidden-package went from 21 to 3: the remaining three are React hooks in `adapters/`. `tierImportViolations` ceiling 199 → 161.
- G0: all package and app tsc counts are identical to HEAD. G1: the 22 failing core test files are the same as the baseline.

### Batch 2: pass-throughs retired, adapter React bindings named

- 28 pass-through files in core were removed after every importer was pointed at the module that declares each name. This is a move, not a deletion: `@repo/core` and `@repo/core/logic` export the same 720 names as before, checked with the type checker against HEAD. The 11 domain `index.ts` files, `logic/domains/index`, `logic/store-slices/*`, `logic/permissions/index`, `logic/entities`, `logic/experience`, `logic/forms/{analytics,dynamic-loader,form-engine}`, `logic/utils/uuid`, `flows/pjc.ts`, `lib/monitoring/index`, `educational/index`, `spatial/index` and `thresholds/index` were removed. New tool: `scripts/inline-barrels.mjs` (flattens `export *` in files that stay, re-points named imports via `move-exports.mjs` and its new `source`/`pkg:` support, and removes a pass-through only when nothing resolves to it).
- Two remain on purpose. `native/webSentryAdapter.ts` is a Metro platform switch, not a barrel. `adapters/powersync/powersync-react-shim.ts` is unwired, so it is left with the other ghosts.
- `@repo/community` now declares `uuid` directly. It used to borrow it through core's `logic/utils/uuid` shim.
- `package.json` exports lost 4 entries that already pointed at missing files at HEAD (`./zen`, `./logic/classroomResolver`, `./adapters/supabase/educational`, `./forms/form-manager`). The only importer is `packages/ui/src/svelte/SvelteForm.svelte` (a ghost), which was already broken.
- The React hooks over PowerSync and Supabase are now `*.react.ts` (`liveQueries.react.ts`, `todos.react.ts`, `webTodos.react.ts`). `REACT_BINDING` lets a Tier 3 file use React, and nothing else, when it is a vendor's reactive binding.
- Core findings went from 192 to 153. Ratchet: tier-import 161 → 150, pass-through 30 → 2.
- G0 is lower or the same everywhere. ui 46 → 32 and community 72 → 63, because names that used to be ambiguous now resolve. One check now surfaces a real, pre-existing bug: community's `CreateGroupModal` passes `name`, which `EntityDefinition` doesn't have. Earlier the import didn't resolve, so the error was hidden. G1: the core failing set is unchanged. The PJC catalog binding was repointed from `flows/pjc.ts` to `flows/pjc/hierarchy.ts`.

### Batch 3: decode once, at the boundary

- **Growth** now follows the entitlement pattern. The contracts `GrowthViewSchema` and `SavedGrowthSchema` live in `logic/schemas/growth.schema.ts`. `adapters/supabase/growthView.adapter.ts` reads and decodes the view and its offline snapshot. It is bound in `effect/bindings.ts` as `growthView`, next to the new `sessionScope.activeAccountId` and `accountRevision`. `store/queries/growthQuery.ts` (T4) owns the read, including the stale-account checks. `hooks/useGrowthQuery.ts` only composes. Behaviour is unchanged: the mobile `growth-query.native.test.tsx` passes 6/6, as it does at HEAD.
- **Role journey**: the snapshot envelope moved to `adapters/storage/journeySnapshot.adapter.ts`, bound as `journeySnapshots`, and the context and event schemas moved to `logic/schemas/roleJourney.schema.ts`. The machine now holds only the machine. The test was renamed `roleJourney.machine.test.ts` (7/7).
- `flows/pjc/catalogLoader.ts` reads files, so it is now `catalogLoader.adapter.ts`. Inside the generic `logic/` and `flows/` folders the file name decides the tier (`GENERIC_FOLDERS`).
- New rule: a parse marked `// contract-check: <why>` checks data the code owns and isn't counted. That covers an authored manifest or catalog, the function's own output, or a codec the caller supplies. 15 sites are marked, each with its reason.
- Still open, and real: `lib/sync/replayPolicy.ts` decodes queued variables, and `logic/workspace/layoutSession.ts` (a stored intent) and `layoutSync.ts` (the appearance JSON column) decode stored data. Each needs its storage or repository adapter to hand up typed values.
- Core findings went from 153 to 137 and parse-above-boundary from 15 to 3. The tier-import ceiling went from 150 to 134. G0 is unchanged apart from community 63 → 62. G1: the core failing set is unchanged.

### Batch 4: stores reach the device through the composition root

- New `effect/bindings/state.ts` (C) holds what state needs synchronously: `persistStorage`, `scopedState` (`createStorage`, `pauseWrites`), `deviceStorage`, `sessionScope` (account and guest identity, revisions, keys) and `eventBus`. It is separate from `bindings.ts` for two reasons: a store must not load the feature-rollout SDK, and `bindings.ts → authProfileStorage → experienceState.store` would form an import cycle. Zustand's `createJSONStorage` reads storage eagerly, so a cycle would quietly switch persistence off.
- 15 stores (store/*, lib/sync/*.store, pendingIntent, provisionalWorkspace, experienceState) no longer import adapters. Behaviour is the same, because the bindings are the same objects and functions.
- Core findings went from 137 to 113, and the tier-import ceiling from 134 to 110. G0: no change in any package or app. G1: core and the mobile, web, admin, self, ui and community suites fail exactly the same files as HEAD.

### Batch 5: effectful files named, the time window made explicit, experience reads moved to Tier 4

- Renamed to adapters, because they perform I/O: `lib/feedback` (it publishes to the event bus), `lib/failureFeedback` (toasts plus telemetry), `lib/monitoring/sentry`, `logic/utils/LanguageUtils` (it changes the i18n language), and `logic/agents/index` → `agents.adapter.ts` (it runs relief audits on the runtime). `effect/Runtime.ts` (promise bridges onto the app runtime) is now C. `testing/` (the scenario harness) is test infrastructure and isn't tiered. `AIContextDomain` moved to `types/aiContext.ts`.
- **The time window is now a parameter.** `TemporalPhase`, `TemporalViewMode`, `TemporalReadPolicy` and `TemporalCapability` moved from the temporal store to `types/Temporal.ts`, with a new `TemporalView`. `applyTemporalFilter(query, spec, view)` is pure: before, it read `useTemporalStore.getState()` from inside repositories, so adapters were reading application state. Its test passes the window and needs no store any more.
- **UI experience** has its read models in `types/uiExperience.ts`, replacing the hook-local copies of JourneyEvent, StudentGoal, PendingAttendanceItem, PendingGradingItem and HeatmapData. Its port is `logic/ports/uiExperience.port.ts`; the journey reads take a `TemporalView`. `effect/bindings/experience.ts` binds the port. `store/queries/experienceQueries.ts` holds the query keys and reads. The five hooks (journey history, manual snapshot, pending actions, student goals, temporal heatmap) no longer import the Supabase repository. Journey-history query keys now include `phase`, because the read depends on it.
- **Bindings split by weight.** `growthView` (new port `GrowthViewSource`) and `journeySnapshots` (new port `JourneySnapshotStore`) each have their own file under `effect/bindings/`. With everything in one module, `useAuthStore → bindings.ts` had loaded the database client and date-fns, and the first entitlement read slowed from about 0.5s to 1.1s. That broke `useEntitlementQuery.test.ts`'s "future dated" case, which gives only 1s of slack (the test is time-fragile; worth hardening). With the split it is 0.4s, faster than HEAD.
- The architecture standard now records name-based tiers, `RETIRED`, test infrastructure, `*.react.ts` bindings, `contract-check` and `effect/bindings/*`.
- Core findings went from 113 to 92, and the tier-import ceiling from 110 to 89. G0 is lower or the same everywhere (admin 128 → 124, ai 65 → 61, analytics 37 → 36, self 137 → 136, ui 32 → 31) and introduces no new error. G1: core and the six app and package suites fail exactly the same files as before.

### Batch 6: owner decisions applied; hooks reach I/O through bindings

- Owner decisions (2026-11-12): (1) a hook may use the composition root's bindings directly, and a Tier 4 module is only for real query or state logic, never for forwarding; (2) a store may read another store's current value but never subscribe to it. Both are now in `ALLOWED`, the audit and the architecture standard. None of the 13 store-to-store imports subscribe, so all 13 are now allowed.
- New bindings under `effect/bindings/`: `network` (snapshot, subscribe, isConnected), `feedback` (toast, presentFailure), `deviceSecurity` (`IDeviceSecurityPort`), `notifications` (`INotificationPort`), `auth` (the device accounts, identity, realtime channel, local database and telemetry subject that the auth lifecycle drives), `deviceRecords` (pending gated action, per-tenant storage) and `nativeStorage`. `state.ts` stays light and platform-neutral. For a while it also held the AsyncStorage binding, which pulled React Native into every web store: six web test files failed and two `Timeout` type errors appeared. The binding was moved out before this commit.
- 17 hooks no longer import adapters (storage-backed creation hooks, perspective switch, local-first query, snapshot hydration, safe mutation, offline and sync status, device security ×2, scoped notifications, device accounts, pending gate, sanctuary visitor, auth lifecycle). `useAuth` and the auth context moved from `providers/AuthProvider.tsx` to `hooks/useAuth.ts`, so hooks don't import a component.
- `useEntitlementQuery.test.ts`: the "future dated" case is now an hour ahead instead of one second, so slow module loading can't flip it.
- Core findings went from 92 to 51, and the tier-import ceiling from 89 to 48. G0 is lower in 12 packages (about 2 each) and has no new error. G1: core and six suites fail exactly the same files as before.

### Batch 7: coordinators, atomic selectors, schema rule, stale-path guard

- **Coordinator archetype implemented** (tier `F`, `*.coordinator.ts`): `lib/sync/deviceSecurityIntents.coordinator.ts` and `lib/sync/replayPolicy.coordinator.ts`. Read-only helpers over stores are `*.selectors.ts` (Tier 4): `logic/modes/demo.selectors.ts` and `sandboxMode.selectors.ts`. `localGuestActivation`, `accountTransition` and `snapshotRefresh` also coordinate, but they still call the database or native identity directly. They need their I/O behind bindings first, and Metro maps `localGuestActivation` by file path, so those moves come next.
- **Zustand:** 41 whole-store reads (`const { a, b } = useTemporalStore()`, which re-render on every store change) became atomic selectors, as AGENTS.md requires, across ui, self and mobile.
- **TanStack Query:** the experience query builders now use `queryOptions()`.
- **Schema rule:** `.dependency-cruiser.cjs` `no-db-leaks-to-apps` now covers `@repo/schema` as well as `@repo/database`. No code outside core imports either. Inside core, only contracts and adapters do, plus one type import in `profile.port.ts`. Switching that import to the hand-written `types/Growth` type broke the profile repository, which shows the generated contract and the hand-written interface have drifted, so it stays for now.
- **Stale paths caught:** earlier renames left file paths in four places that no type check or test sees. Fixed: the client-state registry (four entries), `apps/gurudevi-mobile/.../efficiency-policy-boundaries.test.ts` (it failed: `replayPolicy.ts` not found), `scripts/check-supabase-boundaries.mjs` (its allow-list named `webAuth.ts`, so it flagged the adapter; it is back to the 4 violations it had at `1d601f440`) and the web architecture page. New guard: `clientStateFoundation.test.ts` fails when a registry entry names a missing file; checked by breaking one path on purpose. The bundler and test configs were also checked: every path they name exists.
- Core findings went from 51 to 43, and the tier-import ceiling from 48 to 40. G0: no change in any package. G1: core unchanged; the six suites are back to the same failing set once the stale test path was fixed.

### Tooling: dependency-cruiser reads TypeScript again

- dependency-cruiser imports `typescript` without declaring it, so under the repo's TypeScript 7.1 beta it silently fell back to a parser that misses TS sources (its own warning: support for TS ≥7 waits for 7.1's API). Fixed the same way the repo already serves typescript-eslint and ZenStack: `packageExtensions` declares the dependency, and an override points it at `@typescript/typescript6`. Tools only; builds still use 7.1 beta.
- Now it reads 11,410 dependencies (it read 11,134 before). `no-db-leaks-to-apps` lets the schema package import its own generated files (earlier this produced 6 false positives). Current result: 131 errors (59 cycles, 27 app imports of core stores, 24 core imports of `verger-core` / `policies`, 8 ui→verger, 7 cross-domain, 3 mobile screen, 3 public-API) and 143 warnings. No CI job or hook runs it yet.

### Batch 8: Zustand baseline enforced; the remaining coordinators

- **Zustand baseline:** all 17 persisted stores now declare `version` next to their storage key. Twelve had none, including the offline outbox (`gurudevi-mutation-queue`), whose items carry their own schema version but whose envelope didn't. `version: 0` is what Zustand already wrote, so nothing migrates today; the next shape change must bump the version and add a `migrate`. New guard: `store/__tests__/persistContract.test.ts` requires the key and version as sibling properties of the persist options. It caught my own slip (in `useConflictStore` the version went into a state object) and was checked by reintroducing it. Two stores had been miscounted by my earlier table; the guard found them.
- **Coordinators:** `accounts/localGuestActivation.coordinator.ts` (moved from `native/`; Metro's explicit mapping updated), `accounts/accountTransition.coordinator.ts` (now a plain object, no class) and `logic/permissions/snapshotRefresh.coordinator.ts`. Their I/O goes through new bindings: `effect/bindings/localDatabase.ts` (disconnect, clear the account, store the signed permission snapshot; the SQL moved into `adapters/powersync/permissionSnapshot.adapter.ts`) and `effect/bindings/guestDevice.ts`.
- **Async or XState:** decided with the repo's own `assessProtocolAdmission` test (all five criteria). All three are async. Snapshot refresh has timers but rebuilds from the current scope on every start and is fully covered by direct tests. The rule and its table are in the mental-model doc.
- Core findings went from 43 to 38, and the tier-import ceiling from 40 to 35. G0: no change anywhere. G1: core and the six suites fail exactly the same files as before.

### Docs: state, effects, hooks and the capability map

- New `docs/architecture/2026-11-12-state-effects-hooks-and-capabilities.md`. It covers who owns which state; a step-by-step rule for `useEffect` (the replacement for each anti-pattern and the lint rule that catches it); what a hook may be; `useReducer` versus XState; and a capability map (upstream offers, what we use, what to do), checked in both directions.
- Evidence recorded there: 537 effects classified; the React Compiler lint rules installed but off; 9 `rules-of-hooks` violations; 10 effects without cleanup; `useSchoolCreation` (reducer plus persistence in effects) running parallel to `schoolProvisioningMachine`, with neither wired; 14 of 19 machines without `setup()` (XState 6 deprecates `createMachine`'s options argument); and our hand-built snapshot versioning, which XState 6 now ships as `validatePersistedSnapshot` and `machineVersions`.
- Status notes added to the client-state decision (still authoritative, item 5 fixed), the monorepo state guidance ("singleton service" superseded) and the RN state canon (versions out of date). AGENTS.md links the new guide.

### Tooling: React rules enforced by oxlint, gated by the ratchet

- `.oxlintrc.react.json`: categories off; the React and React Compiler rules on explicitly (the earlier "noise" came from enabling whole categories). It checks every package and app in about 2.5 s. ESLint's configs are unchanged.
- `scripts/ratchet.mjs` gains five metrics: Rules of Hooks 0, dependency gaps 87, effects that set or derive state 156, compiler rule hits 218, parse errors 10. Ceilings were set by hand at today's counts, not by `--update`. A planted conditional hook fails the gate.
- Fixed: all 9 Rules of Hooks violations. The last one was `VisionCamera.adapter.tsx`, where the hook moved into an always-rendered child. Also fixed: timer cleanups (CommandPalette, InteractiveChat, ScannerModal.web, AIAssistantScreen.web, ProgressTree), `useFloorPresence` (now `useSyncExternalStore` over navigation focus, with no try/catch around a hook) and the web `AuthQueryCacheBoundary` (now `useOptionalAuth`; its two tests spy on that hook).
- Eight files do not parse and have been broken since `308aa4f35` (2026-11-06): SubmissionModal(.web), SpreadsheetViewer, gesture-handler.d.ts, DocumentListScreen.web, TeacherFeedbackModal, TeacherEchoHistoryModal and BaseSelfView.web. The selector codemod did not cause the BaseSelfView error; it only moved it 2 lines.
- G0: no change in any touched package. G1: core fails the same 22 files; the app and package suites fail the same files as at HEAD.

### Tooling: reference-only `.web` files excluded

- Rule (from Neev): `*.web.ts(x)` outside `apps/gurudevi-web` are reference only. The import graph agrees for 87 of the 100. The other 13 are live, because shared code imports them by name: the `@repo/ui` barrels export four Gateway/WebScreen components and `AppSettingsScreen.web`; `@repo/admin` exports `SchoolProfileScreen.web`; `useAnalytics` imports `PostHogAnalytics.web`; and form-builder, library and self barrels export their web screens. Mobile bundles all of these. gurudevi-web also loads `icons.web.ts` (browser condition) and `FeatureStateBoundary.web.tsx`.
- One list: `tooling/live-web-files.json`, read by `tooling/reference-only.mjs` (`isReferenceOnly`, rg args) and `.dependency-cruiser.cjs`. `scripts/check-reference-only.mjs` recomputes the set from the import graph (browser resolution for gurudevi-web's tree, react-native resolution for everything else) and checks that every config carries it. It is a ratchet metric with a ceiling of 0; removing an entry fails it.
- Applied to:
  - oxlint: root, React and mobile configs. The React config moved to the repo root because oxlint resolves `ignorePatterns` relative to the config file, so its earlier ignores (tests, dist) never applied.
  - Biome formatting, ESLint `base.js` and mobile, knip, dependency-cruiser.
  - tsconfig excludes in ui, core, analytics, scanner-kit, ai and mobile, with live files under `files`. Admin, form-builder, library and self already excluded every `.web` file, which caused five TS6307 errors in the baseline; their live files are now listed.
  - Core vitest skips `*.web.test.ts`.
  - The ratchet, both tier audits, the API-composition audit and the registry-coverage audit (coverage counts unchanged).
  - check-ui-boundaries still counts `*.web.tsx` files; that count tracks their retirement (78, baseline 112).
- Ceilings re-measured: dependency gaps 86, set-state effects 151, compiler hits 187, parse errors 5. G0: every package at or below baseline (ui 29→26, admin 122→121, form-builder 46→44, library 41→40, self 134→133). G1: unchanged.
