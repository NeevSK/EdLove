---
title: "Mobile state audit 5: upstream guidance and engineering lessons"
status: "active"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, research, react, expo, state]
---

# Mobile state audit 5: upstream guidance and engineering lessons

## Purpose and method

Research checked on 2026-10-26, following the existing four-part audit. The previous audit already consulted releases and API references; this pass expands the evidence to framework guidance, maintainers' experience, migration hazards and lessons applicable to this saved working tree. Two reused Luna research/review agents supported the parent; the parent integrates findings and owns decisions. No application change, dependency installation, deployment or device action is part of this research.

Search round 1 covered state ownership, effects, context, compiler, route state, hydration, native persistence, offline commands and profiling. Round 2 targeted React 19.3/19.3.1, RN 0.88, SDK 58/Router 58.0.25, Zustand 5.0.16 (and recent fixes), MMKV 4.3.2, XState 5.33.3 versus v6 alpha, Query v5 and PowerSync's installed hook declarations. Current guidance is not automatically an exact-version contract. The physical capability report remains [document 2](2026-10-26-mobile-state-02-runtime-capabilities.md); exposure/call counts remain the dated [inventory](2026-10-26-mobile-state-01-existing-inventory.md).

Primary framework docs, exact release records and original maintainer writing are used below. Older articles supply enduring design lessons, not modern API signatures. An issue report supplies a failure scenario, never proof this app suffers that defect. General community opinions were searched but are not used as technical authority. No library-adoption popularity claim is made.

## Research decisions and pain points

### R01 — Remove the duplicated fact before selecting its container

React recommends deriving calculable values and avoiding independently synchronized copies. Apply this first to temporal phase/past flags, theme aliases and version severity. A migration that moves each duplicate into a smaller store preserves the defect. Selecting an entity by ID can avoid retaining a stale object copy. [React state structure](https://react.dev/learn/choosing-the-state-structure).

### R02 — Synchronization Effects are often the actual state-management tax

Render transformations and action-specific work need not be propagated through Effects. Keep Effects for genuine external synchronization with cleanup; do not turn this into a ban on subscriptions. Inspect route→store→context→component copy loops before debating containers. [React effect guidance](https://react.dev/learn/you-might-not-need-an-effect).

### R03 — Context can scope an owner rather than broadcast its changing values

A Query maintainer describes using Context to provide one stable Zustand instance to a subtree, allowing prop initialization, independent instances and cleaner tests. This is a third option between module-global state and a broad mutable context. Apply only where multiple descendants need a shared local model; a single screen can still use a reducer. [TkDodo, April 14 2024](https://tkdodo.eu/blog/zustand-and-react-context). The v5-shaped concept must be checked against installed vanilla/react declarations.

### R04 — memo and Compiler do not repair authority or subscription fan-out

Changed context still reaches its consumers; memo cannot block it. Compiler optimizes compatible render work, not storage durability, scope keys or lifecycle ownership. Confirm actual transforms for shared workspace code and inspect skip diagnostics before treating compiler configuration as evidence. [React context](https://react.dev/reference/react/useContext), [Expo Compiler guide](https://docs.expo.dev/guides/react-compiler/). The Expo guide is rolling guidance; installed Babel/Metro configuration and output determine coverage.

### R05 — Route identity already has an owner

Use route/local parameters for non-sensitive navigable identity and filters when their semantics match. Avoid a duplicated selected-route store synchronized with Effects. Global parameters update mounted background screens, whereas local parameters follow the relevant route. Neither URL state nor a hidden mounted screen is a place for credentials, authorization or unbounded drafts. [Expo URL parameter guidance](https://docs.expo.dev/router/reference/url-parameters/), [SDK 58 Router reference](https://docs.expo.dev/versions/v58.0.0/sdk/router/).

### R06 — SDK 58 adds alternatives our earlier capability pass underexplored

The October 15 SDK 58 record makes Router loaders/native tabs stable and describes navigation Activity integration. Installed Router exports useLoaderData. Expo documents these [data loaders](https://docs.expo.dev/router/web/data-loaders/) as web server-side acquisition tied to web output/export/request behavior. Treat them as a web-only option in this plan, not a replacement for native Query/PowerSync. API export presence does not establish native loader support. For any separate web adoption, verify invalidation, HTTP caching, auth scope and loading/error behavior first. [SDK 58 release](https://expo.dev/changelog/sdk-58), [installed Router declarations](../../node_modules/expo-router/build/exports.d.ts).

The same release describes row recycling for platform-specific Expo UI List/lazy APIs. Installed @expo/ui 58.0.22 contains build/recycling declarations. This contradicts the local expo-overview skill's blanket “List is not virtualized” statement; universal and platform-specific APIs still need separate checks. Existing FlashList/LegendList stay candidates. This is a UI-adjacent evaluation, not a state-program prerequisite or replacement instruction. [SDK 58 list changes](https://expo.dev/changelog/sdk-58), [installed recycling types](../../node_modules/@expo/ui/build/recycling/useRecycledRows.d.ts).

### R07 — Package exports, stable renderer support and canary are different gates

React 19.3's ViewTransition announcement is DOM-only at release. RN 0.88 changes event dispatch but labels imperative native-ref listener examples Canary. Avoid importing DOM or preview assumptions into native state simplification. [React September 9 release](https://react.dev/blog/2026/09/09/react-19-3), [RN October 19 release](https://reactnative.dev/blog/2026/10/19/react-native-0.88).

### R08 — Stable selector identity matters when retiring the facade

Zustand 5 subscriptions are useful only when we actually select from the appropriate owner. Fresh composite selector objects can be unstable; choose primitives or deliberate stable/shallow selection. Imperative getState does not subscribe. The existing facade's all-store subscription cannot be repaired by adding a selector at its call site. Follow installed react.d.ts, vanilla.d.ts and shallow declarations, plus [exact Zustand 5.0.16 release](https://github.com/pmndrs/zustand/releases/tag/v5.0.16).

### R09 — Persist is a lifecycle protocol, not a one-line safety guarantee

Zustand supports explicit partialization, schema migration, hydration control/listeners and merge behavior. Async restoration can race account switching or overwrite nested defaults under shallow merge. Review hydration and reset order, not only key names. [Maintainer persistence reference](https://github.com/pmndrs/zustand/blob/main/docs/reference/integrations/persisting-store-data.md). Its main branch is rolling; this app's installed persist.d.ts/source remains authority. Account transitions must bind restored records to the intended principal.

Concrete upstream lesson: the [clearStorage/rehydrate race fix](https://github.com/pmndrs/zustand/pull/3555), recorded in [v5.0.15](https://github.com/pmndrs/zustand/releases/tag/v5.0.15), addresses a pending async restoration applying a value after storage was cleared. This app installs v5.0.16, so use the scenario to verify integration; do not assume that exact upstream defect remains or add a speculative workaround.

### R10 — Direct reactive storage may eliminate preference stores

MMKV's typed hooks can observe a selected instance directly. A simple persisted preference may therefore need no Zustand mirror. Account/namespace identity, default validation and failure semantics still belong to the app. Main bootstrap currently defaults to AsyncStorage; a default MMKV instance would silently create another owner. [MMKV hooks](https://github.com/mrousavy/react-native-mmkv/blob/main/docs/HOOKS.md), [4.3.2 release](https://github.com/margelo/react-native-mmkv/releases/tag/v4.3.2).

### R11 — Migration and fallback are data semantics, not adapter cosmetics

The maintainer's AsyncStorage migration reference uses a defined migration boundary. In this repo, fallback writes can land on a different backend and later reads can consult it. Review interrupted copy, delete/tombstone propagation, stale fallback resurrection and actual acknowledgements. Do not enable MMKV globally or delete old keys merely because both APIs store strings. [Margelo migration reference](https://github.com/margelo/react-native-skills/blob/main/skills/react-native-mmkv/references/migrate-from-async-storage.md). This rolling reference is a design lead, not a drop-in patch.

Physical follow-up: MMKV4.3.2 declares remove(key), while both native MMKV adapters call an any-typed .delete(key). The fallback catches that error and deletes only from the alternate backend. This is a concrete source mismatch with conditional device impact when that path is active. The user-facing StorageManager.delete method name can remain; its implementation must invoke the verified native method. Backend lifetime/namespace and missing-vs-deleted semantics must be settled before consolidating it.

### R12 — Async server state, local database state and a command journal differ

A maintainer's older explanation of Query as async state management supports avoiding a second client mirror of remote reads. Use today's installed v5 signatures, not its historical examples. [TkDodo, August 20 2021](https://tkdodo.eu/blog/react-query-as-a-state-manager). PowerSync already observes local SQL; do not copy every SQL result into Query or Zustand. [PowerSync SDK source](https://github.com/powersync-ja/powersync-js). Identify who confirms writes and who owns conflict/replay before selecting a read hook.

### R13 — Optimistic state cannot replace restart-safe commands

Query can persist/resume mutations, but functions are not serialized and resumption needs the required defaults and lifecycle. That facility is not automatically equivalent to this app's account-bound command/receipt system. Keep temporary display projection separate from a durable accepted command. [Query mutation guidance](https://tanstack.com/query/latest/docs/framework/react/guides/mutations). It is v5 rolling documentation; inspect installed source for implementation details.

### R14 — XState requires fewer lifecycle bugs, not just a nicer diagram

An actor is worthwhile if it replaces awkward guarded transitions, cancellation and recovery. A restored snapshot is not a transaction log guaranteeing exactly-once side effects. Installed v5.33.3 exports and behavior must be verified because live Stately pages now mix in v6 alpha. [Exact release](https://github.com/statelyai/xstate/releases/tag/xstate@5.33.3), [persistence](https://stately.ai/docs/persistence). No blanket actor rollout or alpha adoption is justified.

### R15 — Native lifecycle and observer cleanup are part of state design

The Query native guide requires deliberate connectivity/focus integration. Check existing AppState/network owners before adding another listener. Sound players, callbacks, timers and background subscriptions also hold state; each registration needs an owner and release path. Replacing Context with a singleton does not remove lifecycle work. [Query native guide](https://tanstack.com/query/v5/docs/react/react-native), [Worklets 0.13 scheduleOnRN](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN/).

### R16 — Release-mode workload evidence decides performance

Debug runtime overhead can distort results. Match scenario, artifact, device and observer configuration, and distinguish source/React profiling from user-visible latency and native memory. [Expo development/production modes](https://docs.expo.dev/workflow/development-mode/), [RN performance overview](https://reactnative.dev/docs/performance). Historical debug A52 snapshots are not a release or low-memory baseline.

## Alternative selection order

| Actual requirement | First candidate | Escalate only when |
| --- | --- | --- |
| Calculable display fact | No new state; pure derivation | Calculation cost is measured, then memoize/compile appropriately. |
| Input/overlay in one owner | React state/reducer | Multiple independent descendants genuinely need observation. |
| Navigable selection/filter | Router/local URL parameters | It is non-sensitive and matches back/deep-link semantics. |
| Small persistent native preference | Existing reactive storage instance | Its backend/lifecycle/migration is proven; otherwise retain the current path until characterized. |
| Shared route model | Reducer+Context or scoped vanilla Zustand instance | Selective subscriptions/complex local commands justify the extra tool. |
| Remote read | Existing scoped Query family; loader only for a separate supported web target | One cache/authority remains, failure/invalidation/account scope proven. |
| Synced relational read | Existing PowerSync query | Do not add another entity mirror for hook uniformity. |
| Recoverable command | Existing durable journal/receipt | A state machine only if it improves protocol correctness while retiring duplicate coordination. |

External signal/atom engines remain unselected. A new engine requires a concrete requirement unmet by these installed choices, verified native support, explicit code it removes and a smaller resulting lifetime/maintenance burden. No source says “modern React makes every store obsolete.” Several sources show why many values never needed a global store in the first place.

## Integration and limits

R01–R05 revise the ownership decision; R06–R07 extend capability/channel admission; R08–R15 shape implementation cuts and failure tests; R16 sets physical acceptance. See [reconciliation](2026-10-26-mobile-state-04-reconciliation-and-direction.md), [implementation plan](2026-10-26-mobile-state-06-implementation-plan.md), and [execution log](../current_progress/2026-10-26-mobile-state-modernization-log.md).

G0 research/source evidence only. No runtime benchmark, device result, API adoption or code simplification is claimed. The exact package set is the dated audit baseline; re-check before each implementation cut.
