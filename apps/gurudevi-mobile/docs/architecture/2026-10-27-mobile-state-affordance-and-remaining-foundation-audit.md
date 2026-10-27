---
title: "Mobile state: remaining ownership and installed affordance audit"
status: "active"
created: 2026-10-27
updated: 2026-10-27
author: "Codex"
tags: [mobile, state, architecture, affordances, audit]
---

# Mobile state: remaining ownership and installed affordance audit

## Verdict and scope

The original modernization is incomplete. Aggregate-facade removal and AuthStore separation are useful ownership cuts, but do not establish coherent state ownership throughout the app. Some modern affordances are already used; remaining owners still combine unrelated lifetimes, duplicate facts, and expose persistence operations without acknowledgement. Modern package versions alone do not repair those contracts.

This is a source/declaration and documentation audit, not a production cutover or physical-device acceptance. Searches cover TypeScript/TSX in apps and packages, excluding test/spec files for runtime-reference classification. Barrel exports, registry descriptions and definitions are not consumers. Dynamic references, external package consumers and retained device bytes require separate disposition before retirement. No exhaustive AST reachability claim is made.

The [original plan](2026-10-26-mobile-state-06-implementation-plan.md), [foundation design](2026-10-26-mobile-state-foundational-design.md), [parity review](2026-10-26-mobile-state-07-behavior-parity-review.md) and [auth cutover](2026-10-26-mobile-state-08-auth-ownership-cutover.md) remain inputs. This audit corrects next-work priorities rather than creating another state framework.

## Decision criteria

Evaluate each field and transition, not merely each store filename:

1. **Authority:** Is this an independent fact, a projection of an SDK/SQL/Query/credential owner, or a derivation? A runtime actuator may legitimately hold a projection without becoming another authority.
2. **Scope and lifetime:** Does it belong to one mounted component, route, task, workspace, account, guest, device or runtime? A module singleton needs demonstrated shared lifetime.
3. **Interaction:** Which imperative and React consumers need synchronous access? Does the existing owner's subscription already provide a stable snapshot?
4. **Protocol:** Are pending, cancellation, retries and unknown outcomes a real workflow? Use an actor where explicit transitions simplify that workflow; ordinary values do not need a machine.
5. **Durability:** What survives restart, when is a write acknowledged, how are schema and principal validated, and what happens after failed writes or an account switch? UI optimism and persisted actor snapshots are not server receipts.
6. **Rendering:** Can values be derived during render? Are animation-only values better owned on the UI thread? Use selectors for actual read dependencies; do not subscribe every reader to an entire model.
7. **Retirement:** Require a reachable replacement, caller migration, retained-data disposition, failure/restart evidence and preserved behavior. No-consumer source findings alone do not authorize deleting old bytes or prove a feature is implemented elsewhere.

Keep Zustand when a small shared synchronous model is justified. Prefer component/reducer/context lifetime for local interaction, qualified Query for remote read caching, live SQL for replicated relational facts, reactive key storage for preferences, and a durable command repository for acknowledged intent. These roles can interact without mirroring each other's whole state.

## Remaining owner decisions

Paths below are repository-relative evidence pointers, not claims that all consumers were traced through an AST.

| Owner / evidence | Current diagnosis | Target and retirement conditions |
| --- | --- | --- |
| `packages/core/src/store/useTemporalStore.ts` | Date lens, duplicated `phase`/`isPastView`/`isPast()`, animation intensity, read policy and view controls share a singleton. `setViewDate` starts an unowned timer; phase is computed against UTC today only when changed. | Narrow to genuine shared temporal intent. Decide product timezone and midnight refresh; derive phase. Assign read admission to resource policy and animation intensity to its mounted animation owner where appropriate. Trace temporal consumers before scoping the date lens. |
| `packages/core/src/store/useTenantStore.ts`, `store/slices/tenant.slice.ts`, `hooks/useTenantContext.ts`, classroom role hook and AttendanceScreen | School configuration and server-derived class count coexist with academic-cycle selection. Configuration/count persistence uses an unqualified global key. | Configuration/count belong to qualified Query/SQL authority; cycle selection belongs to the workspace lens. Candidate for eventual full retirement after field-by-field migration and legacy-key handling. |
| `packages/core/src/store/useSensoryStore.ts`, `packages/ui/src/context/SensoryProvider.tsx` | Store has definition/export references but no runtime consumer found. Provider independently persists preferences under another key and configures the feedback service. Two storage paths do not establish a coherent preference authority. | Converge on selected-backend reactive preferences; provider owns native resource configuration. Determine key precedence and preserve existing choices. Candidate to retire the unused store after compatibility/data review. |
| `packages/core/src/store/useConsentStore.ts` | Two persisted booleans encode one consent decision and permit contradictory representation. Consent itself is required. | One durable undecided/denied/granted value, with derived booleans if callers need them. Preserve undecided behavior and old-key migration; no workflow machine needed for a simple decision. |
| `packages/core/src/store/useDraftsStore.ts` | Generic unchecked `getDraft<T>` assertion, unqualified map, void mutation methods. Search found definition, exports and foundation registry references, but no runtime producer/consumer. Its comment promising crash recovery is not implementation evidence. | First map actual draft producers and recovery paths across domains. Use typed principal-qualified durable drafts with observable write outcomes where needed. Retain historical bytes; do not invent a universal replacement repository before those contracts are known. |
| `packages/core/src/store/useConflictStore.ts`, SyncManager and classroom dashboard consumers | Recovery is real behavior. Conflict type has no original-principal field; global persistence and void resolution do not independently prove account ownership or durable acknowledgement. | Bind recovery records to original command/principal and qualified journal/receipt authority. Separate UI projection from durable resolution. Do not remove the recovery interface to reduce store count. |
| `packages/core/src/store/useActiveSubTabsStore.ts` | Improved typed task/scoped persistence still combines tasks, focus, pin/preferences and transient chrome. | Keep real multi-task semantics. Move mounted chrome/focus where their lifetimes allow; settle pin and navigation-preference ownership without duplicating layout state. Router state is not automatically a replacement for tasks. |
| `packages/core/src/store/useUIStore.ts` | Transient sidebar/breathing/onboarding presentation and persisted dismissals/desk/scaffold counters coexist. | Scope ephemeral presentation to actual hosts. Retain shared facts only where cross-tree readers justify them. Preserve dismissal and onboarding behavior. |
| `packages/self/src/features/selfCanvasStore.ts`, `screens/SelfScreen.unified.tsx` | Self preferences, hydration, debounce/pending/retry machinery, remote writes and a whole-store screen subscription share a module owner. | Compare a mounted/scoped preference session plus existing command/query infrastructure against this save protocol. Preserve guest retention, idempotency and retries. Self preferences are not automatically the same data as workspace layout. |
| `packages/core/src/store/useFeatureStore.ts` | SDK-backed qualified rollout projection with ownership/freshness guards; not merely an arbitrary remote-data store. | Retain unless direct SDK subscription demonstrably removes machinery while preserving stable snapshots, context isolation and offline policy. No mandatory library rewrite. |
| `packages/core/src/store/useCedarDecisionStore.ts` | Synchronous verified policy projection has security and scope obligations. | Retain the authority boundary; audit expiry/reload and failure admission. A live SQL projection is only a replacement after signature, scope, synchronous decision and freshness contracts are preserved. |
| `packages/core/src/store/useAuthStore.ts`, `store/scopeSession.ts` | AuthStore now holds profile identity plus hydration; credentials belong to provider, selected scope elsewhere. Previous mixed fields have moved. | Small observable identity may remain justified for imperative consumers. Remaining account/resource admission and lifecycle correctness are separate work, not a reason to repopulate AuthStore. |
| `packages/core/src/lib/experienceState.ts` | Shared demo/explorer interaction and transient demo intents; only explorer preference persists with qualification. | Retain bounded shared behavior. Review workflow transitions and cleanup if complexity grows; avoid treating transient demo logs as a durable command journal. |
| `packages/core/src/logic/deeplink/pendingIntentStore.ts` | Deferred navigation has TTL and readiness obligations; legacy-key mirroring and unacknowledged writes remain. | Canonical acknowledged deferred-intent capture/consume, with readiness and private-intent ownership policy. Router location alone cannot preserve a pre-auth deferred intent. |
| `packages/core/src/lib/sync/versionGating.ts` | Remote policy and derived admission need offline/freshness semantics. | Evaluate qualified policy cache plus derived decision; retain blocking behavior until offline and expiry contracts are explicit. |
| `packages/core/src/logic/workspace/provisionalWorkspace.ts`, mutation queue and audit log | Durable commands, dispatch ownership and unknown-outcome receipts are genuine requirements. | Keep durable intent and receipt semantics. Compare actor-based control with existing controllers, rather than replacing a journal with in-memory pending state. |

## Installed affordances: fit and limits

Observed app baseline: React 19.3.1, React Native 0.88.0, Expo manifest `~58.0.17`, Zustand 5.0.16, XState 6.0.0-alpha.70, MMKV 4.3.2. This audit changes no dependencies.

| Capability grounded in installed declarations | Current use / assessment | Appropriate next use and limit |
| --- | --- | --- |
| React `useSyncExternalStore` | Already used for NetworkManager/offline status, storage-key observation, layout session, replay admission and actor snapshots. | Connect React directly to an existing canonical observable owner. Stable snapshot and cleanup contracts still matter; a new hook around a duplicate cache does not remove duplication. |
| React `useEffectEvent` | Already used in auth lifecycle wake handling. | Latest committed values in effect-originated callbacks; not a workaround for missing effect ownership or a replacement for account generation guards. |
| React `useOptimistic`, `useActionState` | No direct use found in the bounded mobile/core/ui/classroom search. This absence is not itself a defect. | Pending presentation and local Action result state where they simplify an actual interaction. Optimistic UI lasts for an Action; it cannot replace restartable intent, original-account quarantine or server receipts. Native event integration must be verified per caller. |
| React Activity / ViewTransition declarations | Export presence was inspected, not renderer acceptance or app integration. | Do not prescribe browser transition APIs or hidden-tree behavior as a native store replacement without RN renderer/platform proof. |
| Zustand vanilla `createStore`, selector `useStore`, `useShallow` | Installed declarations support scoped stores and selector subscriptions. Existing models frequently use module-bound stores; SelfScreen subscribes to the whole Self model. | Scope an instance to a real workspace/task owner when required. Select actual fields; use shallow comparison only for suitable compound selections. Never add a store/provider layer solely to demonstrate a new API. |
| XState actor snapshots and `xstate/durable` | Existing onboarding, attendance, journey and somatic actors use actor machinery; custom React bridge subscribes via `useSyncExternalStore`. Durable declarations expose experimental execution adapters, effect IDs and replay clock/identity requirements. | Compare existing hand-written cancellation/retry/admission controllers with actor lifetimes and explicit transitions. Experimental durable host support is a candidate, not an automatic migration: host storage, deduplication, timers and external effects remain obligations. Exact alpha compatibility and restart scenarios must be proven. |
| MMKV typed reactive hooks | Installed exports include per-key hooks/listeners. Current core uses platform-neutral selected-backend observation. | Useful within native boundaries when MMKV is the qualified selected backend. Do not bypass backend selection or import native MMKV into core. Ordinary persistence does not prove write acknowledgement, schema safety or account isolation. |
| RN 0.88 / New Architecture and native animation | RN Terrain found native APIs; framework version does not provide a domain-state authority. | Keep animation-only mutation close to the UI-thread animation owner; profile actual native behavior. New Architecture does not remove Query, persistence, admission or lifecycle requirements. |

Physical grounding includes `@types/react/index.d.ts`, `zustand/vanilla.d.ts`, `zustand/react.d.ts`, `zustand/react/shallow.d.ts`, `xstate/dist/declarations/src/durable/index.d.ts`, and `react-native-mmkv/lib/index.d.ts` under the app's installed node_modules.

RN Terrain was executed through `scripts/run-rn-terrain.mjs affordance <package> apps/gurudevi-mobile --strict`. Reports are `reports/mobile-state-2026-10-27-{react,rn,zustand,xstate}-affordance.txt`. All four completed with exit 0. React, Zustand and XState extraction returned zero symbols despite their actual declarations; RN extraction returned 93. Therefore zero is an extractor coverage limitation, not evidence that APIs do not exist. RN output also includes deprecated exports: presence is not approval to use them. Manual declaration inspection is required for this audit; repair of the extractor is separate tooling work.

## Original plan: what remains

| Cut | Current conclusion / remaining acceptance |
| --- | --- |
| H0 baseline | Historical inventory exists; current caller/field disposition and full offline-producer coverage still need reconciliation. Include owners outside `store/`, actors, SDKs, managers, queues and native resources. |
| H1 persistence | Selected backend, acknowledgement and observation work exists. Remaining drafts/conflicts/preferences/deferred intents need those guarantees applied and legacy bytes accounted for. Native backend qualification and power-loss behavior remain unproven here. |
| H2 identity/admission | Credentials/profile/scope separation advanced. Complete original-principal ownership, transactional resource lifetime, policy expiry and account-switch failure acceptance. |
| H3 complete offline flows | Native chat/layout and shared command contracts advanced. Still demonstrate personal/profile/self, draft/recovery, guest conversion and media across offline/restart/account switch. Attendance alone cannot satisfy this row. |
| H4 Verger | Existing upstream analysis remains input; this audit performs no fetch or merge. Revalidate exact refs and one-actuator policy when implementing workload/lifecycle integration. |
| H5 observation ownership | Aggregate facade and several mirrors retired; table above shows substantial remaining mixed owners. Retire by proven responsibility disposition, not a store-count target. |
| H6 physical acceptance | Open. Mock/static evidence cannot establish phone startup, latency, memory, thermal behavior, native cleanup or offline restart fidelity. |

## Revised execution priority

1. Complete the shared ownership/durability matrix for actual draft, conflict, deferred-intent and preference producers. Fix original-principal qualification, write acknowledgement, hydration races and recovery through the existing selected-storage/command seams. Prove old-data continuity. Unused generic stores must not be mistaken for implemented capabilities.
2. Resolve tenant authority and sensory preference convergence, then narrow Temporal/workbench/UI according to consumer lifetime. Keep required data and user-visible behavior throughout each concrete cutover.
3. Compare complex existing lifecycle/dispatch controllers against installed XState 6 capabilities using one bounded existing workflow. Choose on reduced states/guards/manual synchronization and stronger failure evidence; do not introduce another coordinator or a generic durable host speculatively.
4. Finish full offline and Verger integration acceptance, global quality gates and matched physical-device scenarios. Record each cut's actual evidence and limitations in the execution log.

## Research and evidence

Broad official guidance was followed by exact-version release inspection. React's [optimistic-state contract](https://react.dev/reference/react/useOptimistic) limits optimism to pending Actions. Zustand's [persistence documentation](https://zustand.docs.pmnd.rs/reference/middlewares/persist.html) describes persistence/hydration mechanics; it does not establish domain command delivery. Reanimated's [shared-value guidance](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/shared-values/) explains animation state outside ordinary React rerenders. XState generic persistence material is not sufficient authority for the installed v6 alpha.

Exact anchors: [React 19.3.1](https://github.com/react/react/releases/tag/v19.3.1), [RN 0.88.0](https://github.com/react/react-native/releases/tag/v0.88.0), [Zustand 5.0.16](https://github.com/pmndrs/zustand/releases/tag/v5.0.16), [XState 6 alpha.70](https://github.com/statelyai/xstate/releases/tag/xstate%406.0.0-alpha.70). The XState release includes breaking actor-reference/id typing rules, reinforcing the need for exact-alpha grounding rather than v5 recipes. Durable-host conclusions above come from the installed experimental declarations, not inferred release headlines.

Evidence for this audit is G0 source/declaration/CLI inspection. No new runtime tests or production code changes were made. Prior scoped evidence and outstanding global gate failures remain in the execution log; this document neither reruns nor upgrades those claims. No upstream merge, dependency upgrade or G5 proof is implied.
