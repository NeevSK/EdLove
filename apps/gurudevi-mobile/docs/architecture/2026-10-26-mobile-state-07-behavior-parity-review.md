---
title: "Mobile state modernization: behavior parity and intent review"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, state, offline, parity, implementation]
---

# Behavior parity and intent review

## Verdict

The original rework is not complete. The foundation remains the right scope: account/scope lifetimes, persistence acknowledgement, local and remote data ownership, durable commands, UI lifetime, resource policy and full offline workflows. Removing useStore or reducing store count does not satisfy that scope. Recent execution gave retirement too much prominence and needs a behavior-first acceptance correction.

This review supersedes automatic execution of the earlier backlog. Hold further source retirement until each affected responsibility has a reachable replacement, a persisted-data disposition, failure/offline behavior and appropriate evidence. Existing changes are not blanket-approved by this document. Do not restore aggregate facades merely to conceal missing implementation; repair the actual responsibility.

## Initial responsibility audit

This is an initial source-grounded review, not an assertion that every deleted line has been audited. Baseline means HEAD compared with the shared dirty checkout; attribution of unrelated edits remains open.

| Responsibility / retired surface | Current replacement or retained owner | Finding and required closure |
| --- | --- | --- |
| useStore aggregate | Auth, Tenant, UI and Feature owners; migrated direct consumers | Old implementation spread and subscribed to four stores; it did not implement domain actions. Removing this wrapper is sensible, but compilation and individual caller behavior remain acceptance requirements. The bounded source search found no retired owner references in production TS/TSX. |
| Perspective / identity mirrors | scopeSession and coordinator | Replacement exists. Recheck account/scope switch with pending reads, commands and failed close; do not infer complete lifecycle parity from symbol retirement. |
| Entitlement mirror and readiness test | useEntitlementQuery; expiry/provider scenarios | Current query tests cover fresh matching offline cache, three scope mismatches, expired/future timestamps and cancellation. Missing/fresh/expired readiness assertions must remain traceable through real admission consumers. |
| Growth mirror | useGrowthQuery, useBanyanGrowth, useNaturePaths | Old persisted projection has no principal identity. Legacy bytes are retained but not adopted: cold offline continuity changes. Account for Bhumi/signals/previous-value animation responsibilities even where current readers were absent; do not silently equate absent references with an approved product deletion. |
| Feature slices and cache | SDK projection owner, qualified v2 snapshot | v1/global records remain but do not restore under the verified-freshness contract. Defaults can appear on cold offline launch. Resolve a safe continuity policy; never fabricate account identity or network receipt time to migrate bytes. |
| Notification store and duplicate hooks | useScopedNotifications; header and notification screen callers | Replacement includes list/count, mutations and shared realtime. Behavior differs: old code queried real data for an identified explorer/guest and used samples on empty/error; replacement selects samples before querying. Old tests included actual load/mark-read dispatch; current seven tests exercise helpers/scope/realtime, not mounted hook dispatch. Requires explicit behavior decision and mounted regression coverage. |
| Device-security store | useScopedDeviceSecurity and useDeviceSecurity manager commands | Current tests retain queued-versus-confirmed and rejection contracts through a helper. Mounted summary/command feedback and account-transition reachability still need evidence. |
| Split per-operation storage fallback | selected launch backend and acknowledged StorageManager seam | Replacement addresses divergent writes. Retain startup migration, failed acknowledgement, restart and alternate-backend recovery evidence; no physical MMKV qualification established here. |
| PowerSyncGate / implicit factory sync | local account runtime plus separately admitted remote connector | Local SQL remains available when rollout/network/read policy pauses remote work. G1–G3 evidence exists; native encryption, actual replication and phone journeys remain open. |
| Core OP-SQLite adapter | native app createAccountDatabaseOptions | Key namespace/filename/reuse and acknowledged key creation retained; supported cache/lock options implemented. Unsupported old onConfigure never executed, but its intended heap/mmap/vacuum/checkpoint/integrity policies are not thereby unnecessary. Decide each against installed native support, connection scope, durability and Verger ownership before claiming configuration completion. |
| Crypto shims / haptics.web deletion | Not yet attributed or audited in this review | Do not claim safe retirement or reverse others' work. Trace old callers, actual replacement and platform behavior first. |
| Deleted test files | Several replacement suites exist | Replacement file existence is insufficient. Preserve the old behavioral assertions at their actual new boundary; record intentional behavior changes explicitly. |
| SelfCanvas pins/preferences | workspace layout session plus ActiveSubTabs persistence | Current toggle writes both owners; nonempty remote pins override local pins, while empty remote pins fall back locally. Empty authoritative state and failed-save divergence need a single ownership/transition contract. |
| Temporal state | useTemporalStore | readPolicy is separated from connectivity, but phase/isPastView remain stored derivations and date changes start an unowned 300ms timer. Finish lifetime/interaction design with actual consumers before restructuring. |
| Sensory preferences | SensoryProvider, service/player paths, exported useSensoryStore | More than one arrangement remains. Trace actual mounts, keys, accessibility and feedback behavior; converge without losing native cleanup or stored preference continuity. |
| Full offline capability | SQL, qualified snapshots, drafts, generic outbox and domain transports | Chat/layout are examples, not app-wide completion. Profile/self/classroom/security/media/guest conversion need producer-by-producer read/write/restart/account-switch disposition. Cross-runtime replay and unknown outcomes remain open. |
| Verger / upstream changes | Existing foundation comparison and explicit local integration contracts | Previously compared origin/feat/adaptive-runtime at 33600d997340cdbd1f3c3dec8d6239c8664a3e28; this review did not refresh refs. Recheck relevant upstream deltas before integrating. No merge authorized by this review. Governor cannot own account, physical connectivity, persistence acknowledgement or server completion. |

## Reprioritized execution

**User correction: foundation first.** The sequence below was still too feature-led. Its parity obligations remain, but they do not determine the next implementation order. Complete shared identity/scope transition barriers; selected storage acknowledgement/migration/recovery; local database lifetime/configuration; query hydration/expiry/cancellation/native lifecycle; durable command admission/replay/receipt/conflict contracts; then Verger resource-policy integration. Audit each through its actual producers and consumers. Feature scenarios validate these shared contracts; they are not separate modernization workstreams to exhaust first. SelfCanvas, notification and other leaf repairs remain bounded regression work, not the primary program. Do not add a new universal state framework to implement this ordering.

First concrete foundation finding on retrace: AuthQueryCacheBoundary passes the outgoing Supabase session.user.id to disposeAccountBoundaryQueries, while scoped query namespaces now use canonical account IDs. These identities must not be conflated. Resolve the account-transition/disposal contract before expanding feature work. queryClient.ts already wires onlineManager; no focusManager integration was found in the bounded mobile/core source search. Inspect initial native state, listener ownership and existing lifecycle helpers before deciding the lifecycle implementation.

Foundation repair status: the boundary now subscribes to canonical AuthStore user.id changes and synchronously captures/cancels/removes outgoing query instances before awaiting cancellation completion. Credential changes still refresh the credential-owned event stream and do not alone clear canonical account data. MutationCache and other scoped accounts are retained. Native Query focus now uses AppState at the existing QueryClient setup, with owned cleanup, initial-state sampling, delayed null-state support and web focus handling retained. G1/G2: four core files, 21 assertions; G3 plus G1 native-lifecycle adapter scenarios: two mobile files, eight cases. Core/mobile G0 builds exit 0. This fixes the named mismatches; it does not establish all resource families' key qualification, persisted read continuity, native suspension behavior, cross-runtime replay or whole account-transition completion. See execution log and reports/mobile-state-query-foundation-*.

1. **Close parity risks first.** Map deleted behavior/tests to replacements; resolve notification real-versus-sample behavior, offline legacy-cache continuity and native DB policy intentions. Repair demonstrated regressions and test the new boundary rather than reintroducing facades. Preserve unqualified legacy data without exposing it to a guessed account.
2. **Prove the local-first floor end to end.** Cold/restart offline reads, acknowledged writes, original-principal recovery, account/scope switching, expiry and unknown outcomes. Include one self/profile workflow and media availability alongside classroom/chat/layout. Document online-only limits honestly.
3. **Complete remaining ownership convergence.** SelfCanvas pins/preferences/save feedback; Temporal derivations and timer lifetime; sensory preference and resource owners; remaining inventoried holders. Choose React/local/route/KV/Query/SQL/bounded store from lifetime and data authority, not a store quota.
4. **Integrate lifecycle and resource policy.** Query/native foreground/background observation, replay coordination and Verger actuator boundaries. Review upstream changes through those explicit seams without merging the branch wholesale or making optional-work policy block local durable acceptance.
5. **Accept only with evidence.** Source/declaration checks, meaningful scenario and mounted regressions, required repository gates, then matched native artifact and physical journeys/resource observations. Current global gate failures and missing G5 prevent a completed/pristine claim.

Each implementation cut must name: user capability; authoritative owner; reachable readers/producers; scope/lifetime; old/new storage transition; offline/error/cancellation behavior; upstream contract; evidence and remaining limits. A removed abstraction is an implementation detail, not an acceptance metric.

## Evidence for this review

Read the original foundation/implementation/log, HEAD deletion list and old notification owner/tests, current scoped hooks/tests, store exports, Temporal, SelfCanvas and sensory paths. No production source was changed during this review.

G1 boundary / Vitest 5.0.5: useScopedNotifications.test.ts, useScopedDeviceSecurity.test.ts and useEntitlementQuery.test.ts: 3 files, 20/20 assertions. Proves the named helper, QueryClient and substituted API/storage contracts. Does not prove mounted notification dispatch, real native storage/network, complete old-test parity, or phone behavior. Prior mobile compilation and global anti-slop failures remain unresolved; this run does not replace them.

See the [foundation](2026-10-26-mobile-state-foundational-design.md), [implementation plan](2026-10-26-mobile-state-06-implementation-plan.md) and [execution log](../current_progress/2026-10-26-mobile-state-modernization-log.md).

## Notification parity repair following the initial review

Implemented in useScopedNotifications and notificationQueryKeys, with mounted coverage in mobile src/__tests__/providers/scopedNotifications.test.tsx. An admitted explorer/guest principal again attempts real notifications first. Samples appear for an empty/failed settled read, or an unbound guest; loading and scope-denied states do not pretend to be sample content. A refresh failure retains real cached content. Real read mutations still call the transport and invalidate matching reads; sample mutations remain local.

Sample read state now uses a disabled, explicitly skipToken Query observer under an account-qualified samples key (or unbound guest key), so header/screen observers agree without a second store. Account disposal already removes the corresponding scoped namespace. This state is not persisted and this change does not establish cold-offline inbox support. The realtime hook owns subscription/status cleanup; the error message is derived from that status rather than independently stored.

The initial mounted suite reproduced six failures before the repair. The final suite has eleven G3 cases: real explorer/guest data, settled empty/error fallback, pending loading, ordinary account empty state, real read mutations, refresh/mutation failure retention, denied scope, late old-account response, and shared sample state with account isolation. The four behavioral subjects in the deleted notification-store tests now have mounted replacement coverage; this does not prove every notification flow or transport race. Further work includes actual offline persistence requirements, transport/account admission races and native evidence. The hook still exceeds configured complexity thresholds; this is retained work, not a suppressed finding or permission to remove behavior.
