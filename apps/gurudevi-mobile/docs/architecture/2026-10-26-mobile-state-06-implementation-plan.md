---
title: "Mobile state modernization: implementation plan"
status: "draft"
created: 2026-10-26
updated: 2026-10-27
author: "Codex"
tags: [mobile, implementation, state, modernization]
---

# Mobile state modernization: implementation plan

## Execution status — 2026-10-26

**Latest user steering: foundational contracts first.** Stop sequencing work by leaf feature. Revalidate D02–D08 and D12 through the existing account transition, selected storage, single database runtime, qualified query lifecycle, durable command pipeline and Verger seams. Implement missing shared guarantees there; use feature journeys as acceptance cases. The parity-first correction below remains a preservation requirement, not an instruction to work through every feature before completing the foundation. No additional aggregate coordinator or state engine is implied.

Auth ownership implementation follows the [credential/identity/scope cutover](2026-10-26-mobile-state-08-auth-ownership-cutover.md). Credentials now belong to AuthProvider; AuthStore retains profile identity and hydration. Mixed feedback, experience and onboarding presentation fields have moved to their canonical owners with retained-data migration. Full identity/resource lifecycle acceptance remains open. The [2026-10-27 remaining-owner and installed-affordance audit](2026-10-27-mobile-state-affordance-and-remaining-foundation-audit.md) supplies the current field-level criteria and next-work priority; remaining stores are not presumed necessary or redundant merely from their names.

**Priority correction after behavior-parity review:** the original rework is incomplete. The [responsibility audit and revised order](2026-10-26-mobile-state-07-behavior-parity-review.md) now govern the next cuts: repair continuity/parity risks, prove full offline workflows, finish remaining ownership convergence, integrate lifecycle/Verger seams, then physical acceptance. Hold further source retirement until each affected responsibility has a reachable replacement, data transition, failure/offline contract and evidence. Store count and deleted lines are not success metrics. Historical “NOT STARTED” statements below are draft-era context, not current status.

Implementation is active under the user's explicit proceed instruction and delegated reversible decisions. Earlier “NOT STARTED” and planning-only statements describe the original draft, not current delivery. The [execution log](../current_progress/2026-10-26-mobile-state-modernization-log.md) is authoritative for current cut status and evidence. The full H0–H6 objective remains open; removal of the aggregate facade alone is not completion.

H3/H5 now includes the native group/DM producer cut: qualified Query history and offline snapshot, acknowledged generic-outbox admission, payload-bound server receipt transaction and observable replay scheduling. The log records exact mocked/component evidence and open real-database, legacy-record, web-producer and cross-runtime obligations. Do not treat native caller wiring as acceptance of every chat or offline producer.

## Foundation design precedes this backlog — 2026-10-26

The user correctly identified that the earlier work-package sequence ran ahead of the horizontal architecture. The [capability ownership and interaction design](2026-10-26-mobile-state-foundational-design.md) now sits between research/reconciliation and this implementation plan. **S00–S11 remain a draft backlog, not the next automatic execution order.** D01–D12 now resolve shared ownership, scope/lifetime, backend/acknowledgement and interaction choices. Use the foundation-derived order below; verify domain details within those choices.

Required design outputs: capability→current→target map; dependency roles and compatible installed baseline; allowed interactions and forbidden duplication; identity/account/scope and per-resource key policy; persistence and command guarantees; resource lifetimes; end-to-end account/offline/navigation/preference flows; explicit unresolved choices. Implementation tasks must then be re-derived against that model. A plan to fix storage first is not a substitute for deciding its relationship to preferences, command durability, runtime selection and account lifetime. No new generic foundation framework is implied.

## Foundation-derived delivery order — 2026-10-26

The foundation now resolves D01–D12 and maps all 21 holders, app-wide offline materials and Verger boundaries. This section supersedes earlier delivery ordering; the detailed S00–S11 descriptions remain input, not permission to reproduce the old store topology. No application package is implemented by this documentation update.

| Cut | Concrete reviewable outcome | Existing packages / prerequisite | Acceptance boundary |
| --- | --- | --- | --- |
| H0 baseline and contract ledger | Pin dirty-tree/ref/artifact identities; assign every inventoried field/read/producer to the foundation owner; classify device/account/guest lifetime and actual offline guarantees | S00; 21-holder map and caller ledger | No unassigned persisted fields or unreviewed branch imports. Record existing failures separately. |
| H1 persistence and observation | Selected backend per launch; real completion/error for durable consumers; per-key observation at the same seam; defined migration/read-back/recovery | S01/S02; D04–D06 | Both supported backend paths, write/delete failure, restart, stale alternate data, partial migration and no premature old-data clearing. MMKV physical startup qualification before enabling it. |
| H2 identity and resource admission | Candidate identity, matching single account runtime, selected scope and policy readiness; cancel/generation guards and original-account quarantine | S03 plus scope-related S06/S09 work; D02/D03 | Credential subject/account mismatch, failed close/attach, offline policy, account switch during dispatch, workspace rollback, guest conversion retention. No global reset on scope change. |
| H3 representative complete flows | Preference→native feedback; remote persisted read→offline restart; multi-domain draft→journal→receipt; route→task restore | S04/S07 plus matching command work; H1/H2 as applicable | Demonstrate one authority and no lost behavior across every boundary, including unknown outcome. Attendance is one member; include a non-attendance personal/profile/workspace command and media availability. |
| H4 resource-policy integration design | Compare current governor and Verger branch capability by capability; choose one actuator owner and explicit workload/quality consumers | D12, fetched-ref comparison; before adaptive startup/global motion/refresh/pressure integration | No unreviewed loss of heap/query tuning, no canonical network writeback from policy, startup readiness preserved, local append never deferred as upload. No merge implicit in this cut. |
| H5 eliminate duplicated observation by capability | Move each facade group to actual local/route/preference/Query/SQL/scoped-model owner; retire mirrors only after concrete disposition review | Remaining S05–S10 work re-derived from holder map; proven H3 contracts | Caller migration and behavior/data disposition evidence per group; no second aggregate facade and no mandatory replacement store. |
| H6 physical acceptance and retirement | Matched release-like native artifact, representative real-phone journeys and resource measurements; final bounded removal decisions | S11, all affected cuts | Cold/offline/restart/account/scope/media/pressure cases, native resource cleanup and observed latency/memory/thermal. G0–G4 cannot claim pristine phone behavior. |

H1 and H2 contract work can proceed independently with disjoint ownership; any cutover waits for its actual dependencies. H4 is required before changing adaptive governor/startup/global-quality consumers. Preference persistence and identity-safe feedback registration cleanup may proceed independently; connecting feedback to adaptive motion/quality policy waits for H4. Do not build generalized infrastructure in advance of these flows.

### Full offline deliverable within H0/H3/H5

Extend the existing caller inventory with a row per actual read/write/file producer: capability and source path; original principal/guest and real scope dimensions; local read material/bytes; draft retention; chosen command transport; persistence acknowledgement; server idempotency/receipt; conflict/unknown-outcome handling; restart/account-switch behavior; current versus target support; evidence. Registry names alone are not support evidence. Group identical contracts without hiding exceptions.

Include settings, qualified cached reads, relational replica/local-only tables, profile/self/wellbeing, provisional workspace/layout, classroom work, security, media download/voice/file upload, and guest conversion. Online-only operations remain explicit; new offline uploads require a real product/retention contract rather than an implied universal queue. Preserve current useLocalFirstQuery restart continuity; ordinary Query is currently memory-only. Verify hosted publication/rules separately from checked-in configuration.

Implementation logs use H-cut plus S-package identifiers and record actual files, baseline, approved disposition, exact evidence and failures. All remain NOT STARTED until code work actually begins.

## Outcome, scope and source of decisions

Deliver fewer independent facts, fewer synchronized copies, explicit resource lifetimes and reliable persistence, while keeping required guest/account/offline/authorization journeys. Use modern installed affordances when they remove actual machinery. Do not prescribe a target number of stores or demand one library for everything.

Inputs: [inventory](2026-10-26-mobile-state-01-existing-inventory.md), [capabilities](2026-10-26-mobile-state-02-runtime-capabilities.md), [documentation audit](2026-10-26-mobile-state-03-documentation-audit.md), [reconciliation](2026-10-26-mobile-state-04-reconciliation-and-direction.md), [upstream research](2026-10-26-mobile-state-05-upstream-guidance-and-lessons.md). Execution records belong in the [separate progress log](../current_progress/2026-10-26-mobile-state-modernization-log.md), not retrospective edits that turn planned work into “implemented.”

This turn prepares the plan and research only. Code tasks below are NOT STARTED. The user's direction supports decisive internal replacement, but the repository requires concrete removal scope/risk sign-off before removing working behavior; broad language about breaking old things is not treated as permission to delete unspecified data or flows. Prepare complete bounded changes and a retirement receipt before any required final deletion decision. Do not ask for repeated approval where a specific retirement is already authorized.

## Final architecture rules

- Derive facts before storing them. Scope a value to the component, route, subtree, account or device that owns its actual lifetime.
- Native key/value preferences may be directly reactive. Zustand remains an option for shared app-owned models, including subtree-scoped vanilla instances. Context can supply a stable instance or dependency.
- Query owns qualified remote reads; PowerSync owns its replicated/local SQL observations. Expo Router data loaders are web server-side acquisition here, not a native Query/PowerSync substitute; separate web work must not create another private cache.
- Durable commands retain their journal, principal binding, receipt and idempotency contract. React Actions/optimistic hooks serve display/action lifecycles, not recovery after process death.
- Every remaining global owner justifies global reach, initialization, subscriber needs, reset and persistence. A service owns callback/player/listener lifetime even if it renders no JSX.
- No XState rollout, new state engine, dependency cohort upgrade or native-list replacement is bundled into this plan by default. An actor or external package must retire more complexity than it adds and satisfy exact version/native evidence.

## Ordered work packages

Each package starts with updated callers/blast radius and a three-line Bounding Triad. Named files are the starting ownership boundary, not permission to touch everything nearby. If a required contract change expands callers, enumerate and review that expansion before editing. Use the actual package test/config/script surfaces inspected in package.json.

| ID | Work | Depends on | Exit |
| --- | --- | --- | --- |
| S00 | Capture current source/artifact/backend baseline and classify ownership | None | Exact code/diff, versions, actual backend and scenario baseline recorded. |
| S01 | Correct MMKV adapter API and backend consistency contract | S00 | Typed native calls, defined migration/fallback/delete semantics, fault scenarios. |
| S02 | Expose required storage acknowledgement through existing seam | S01 design | Required callers can distinguish memory acceptance, backend completion and failure. |
| S03 | Fix entitlement scope-failure admission | S00; parallel to S01 design | Failed bond switch cannot admit a mismatching cached snapshot. |
| S04 | One preference simplification and sensory registration cleanup | S01–S02; or retain existing backend until ready | One persisted preference authority and one bounded resource owner with cleanup. |
| S05 | Retire facade consumers in semantic groups | S00; S03 for security-sensitive readers | Each group stops using facade without replacing it with another aggregate. |
| S06 | Consolidate canonical scope and retire mirrors | Relevant S05 groups, existing Phase 2 contracts | One active fact model; no obsolete mirror writes/keys in migrated scope. |
| S07 | Finish qualified remote-read ownership and native Query lifecycle | S03, relevant S06 contract | Entitlement/Cedar/flags preserve policies; completed families remain intact. |
| S08 | Reduce temporal, workbench and local route state | Relevant S05 groups | Derived/display facts eliminated, transient work scoped, task behavior retained. |
| S09 | Separate self-canvas preferences from durable/remote save coordination | S02 and relevant S05 scope | No ambiguous saved/queued state or stale account completion. |
| S10 | Retire dormant declarations and correct architectural guidance | Completed affected consumers and retention decisions | No unexplained compatibility residue; docs match implementation. |
| S11 | Matched physical acceptance and release decision | All shipped slices | Named G5 journeys meet agreed baseline/budgets; open gaps explicit. |

### S00 — Baseline and field-level ownership decisions

Owner: coordinator; reuse Luna for bounded read-only mapping. Start with packages/core/src/store, actual wrappers in document 1, app EntryShell/bootstrap, package manifests and installed declarations. Re-run existing state inventory and CodeGraph for each target. Record dirty-tree identity; do not overwrite unrelated in-flight auth/sync/UI work. Confirm enabled backend from the actual build/runtime, not EXPO_PUBLIC_USE_MMKV in an assumed environment. Capture representative release-like device observations before performance changes when a device/build is available; missing hardware does not prevent G0–G3 engineering but prevents claiming G5 closure.

For each affected field write a short decision row: user purpose, authoritative owner, read/write sites, actual lifetime, derivability, persistence need, failure behavior, minimal candidate, retained/migrated key and retirement condition. No new runtime registry. Baseline reference: 21 holders, 218 facade calls/130 files, 185 facade hook calls, 36 whole temporal calls; these are dated source metrics, not release metrics.

### S01 — Native storage adapter contract and fallback consistency

Starting files: packages/core/src/adapters/native/MMKVStorageAdapter.ts, FallbackMMKVStorageAdapter.ts, AsyncStorageAdapter.ts, native/bootstrap.ts; installed react-native-mmkv/lib/specs/MMKV.nitro.d.ts. Preserve the app-facing StorageManager.delete method; use installed native remove at the implementation boundary and replace adapter any with a verified minimal structural/native-boundary type. Core domain code must not acquire a native import.

Design must select one authoritative backend/namespace for a session or define an equally explicit supported degradation protocol. Do not hide per-operation backend divergence. Cover key types, missing-vs-deleted values, stale alternate data, write ordering, corruption, unavailable native module, interrupted startup/copy and restart. S01 may fix native API typing and define/test the protocol, but production migration/cutover and old-key removal wait for S02 acknowledgement implementation and evidence. Migration is read-old/write-new with verified completion; do not clear old data until required completion and rollback policy are defined. Use tombstones/completion tracking only if the chosen dual-backend protocol actually requires them; one canonical backend after staged migration may be simpler. Do not invent a general migration framework.

Tests that matter: native remove dispatch; failed primary write and later recovery; missing primary plus stale fallback; delete while one backend fails; clear scope without deleting another account; cold restart during migration; read-your-write/read-after-delete. Test underlying contract with G1 fault injection, not a mock that implements the same erroneous .delete dialect. Required G5 storage scenario remains separate. Preserve unsupported-build fallback while making its guarantees explicit.

### S02 — Required durability signal, bounded adoption

Starting files: packages/core/src/logic/interfaces/storage.port.ts (scalar KV), logic/managers/StorageManager.ts, lib/storageWrapper.ts, lib/keyValueStorageAdapter.ts and direct adapters/callers requiring acknowledged persistence. Do not edit logic/ports/storage.port.ts merely because it has a similar name: it is a separate file-storage/upload contract. logic/ports/storage.ts is the feature-level KV port and must be traced separately.

First classify existing callers: best-effort preference, restart-required draft/command, and security-sensitive record. Preserve sync getter behavior. Choose an additive explicitly awaited acknowledgement on the existing port/adapter seam or a bounded return propagation supported by all actual implementations; do not mechanically promise-convert every caller or create a second StorageManager. Awaiting a function that returns void cannot establish AsyncStorage completion. Backend completion is not a universal power-loss/fsync guarantee; name what each backend actually promises.

Adopt the stronger contract first where the app says saved/queued and needs restart survival, including self canvas and affected durable-command writes. Assess pending-command UI acknowledgement and outbox persist timing before claiming all commands are fixed. Tests: delayed/rejected writes/removes, memory cache vs persistent record, restart after acknowledgement, account-specific failure recovery, no success label on required failed persistence. The existing quota/corruption scenarios are starting coverage, not proof native disk is exercised.

### S03 — Entitlement failure scope, before migration

Starting files: packages/core/src/store/useEntitlementStore.ts and store/__tests__/entitlementReadiness.test.ts; expand only to actual admission consumers if the test demonstrates an exposed mismatch. The existing test covers freshness helpers, not the full bond transition.

Define complete request identity from the established entitlement port and Phase 3.4 admission record. Cache eligibility must bind principal and the actual EntitlementScopeContext dimensions: activeBondId, activeEntityId and activeEntityType where required. The current stored identity names principal and bond only; characterize whether required entity identity is missing and preserve it explicitly. Add a perspective dimension only if a traced caller contract establishes it; do not invent absent scope values or rely on a global TTL. Preserve existing grant clearing and generation guards. Characterize principal A→B, same-principal bond A→B failure, stale expiry, missing scope, late response, clear while request pending and reconnect. Fix the demonstrated admission gap while preserving safe cached continuity only for matching identity. G1/G2 prove the substituted boundary; actual backend/device admission needs G5. Can run beside S01 with separate ownership.

### S04 — First no-extra-store pilot: sensory preferences and resource lifetime

Starting files: packages/ui/src/context/SensoryProvider.tsx, context/FeedbackProvider.tsx, sensory/SensoryFeedbackService.ts, apps/gurudevi-mobile/src/interaction/soundFeedback.tsx, and dormant packages/core/src/store/useSensoryStore.ts. Confirm actual mounts before changing any. Current sensory keys are @gurudevi/sensory_preferences and gurudevi_sensory_preferences_v1; inspect existing contents/schema via controlled fixtures, never dump private device data into logs.

Candidate: one validated persisted record, observed through a native-owned hook on the chosen backend; direct MMKV hooks are eligible only with the same gurudevi-store instance and accepted native path. If the existing AsyncStorage fallback remains required, a small existing scoped observer can be the correct interim/final owner. Compare maintenance and behavior, not library purity. Avoid another permanent preference mirror or broad subscription abstraction.

Also close concrete lifecycle defects: FeedbackProvider currently registers a player during useMemo (render); soundFeedback separately registers in an Effect without matching unregister. Pick one committed registration owner with identity-safe cleanup so an old owner's teardown cannot clear a newer callback. Keep player disposal, verify installed audio listener teardown, and preserve quiet/haptic/sound defaults and unavailable-audio behavior. Do not claim a singleton callable directly from a worklet; use verified scheduling.

Exit: one mounted preference authority, restart/corruption/write-failure/old-key migration cases, no stale callbacks after replacement/unmount, StrictMode/remount and player capacity/eviction coverage, G3 native mounting where configured, then physical toggles/relaunch on the actual enabled backend. Retire unused declaration/export/key only through a recorded specific decision; leave no fake “migration complete” duplicate.

### S05 — Facade cutover by intended meaning

Starting file: packages/core/src/store/useStore.ts; consumer groups come from inventory sections, not an unrestricted repository rewrite. A group's patch moves actual readers/writers to minimum qualified owners, eliminates derivable values first, and resolves activePerspective/dismissedSampleIds collisions explicitly. A retained compatibility export may exist only with named remaining consumers and an exit.

Order: app entry/bootstrap/PowerSync provider → core domain hooks/adapters → classroom/workspace → self/profile/library/community/admin/AI → shared UI and remaining browser variants. Handle imperative getState calls separately from reactive hooks; do not replace reactive reads with imperative snapshots to lower rerender counts. Fresh object selectors need stable/equality handling. Narrow types without as unknown as escapes.

Per-group exit: zero facade calls/imports for that group; no newly aggregated replacement; intended field contract and error/fallback behavior preserved; unrelated-store-update mounted assertion/profile where relevant. Final exit: zero production facade consumers and exports needed by active callers, compatibility disposition and deletion approval, then retire the facade. Keep actual raw diff and source metric deltas. If the scan remains lexical, document alias/dynamic limitations rather than manufacture completeness.

### S06 — Scope model consolidation and mirror retirement

Starting files: store/scopeSession.ts, scopeSessionCoordinator.ts, slices/auth.slice.ts, slices/tenant.slice.ts, usePerspectiveStore.ts, resetScopedStores.ts, hooks/useAuthLifecycle.ts and actual migrated readers. Preserve canonical account UUID versus credential subject. Scope is a real domain transition; not every scope field becomes a raw persisted scalar.

Derive tenant/bond display projections from the canonical model where possible. Transfer reader/writer semantics completely before removing legacy fields/actions or storage. Retain generation guards, validation, capability cancellation/denial, private Query disposal, rollback, guest conversion and original-principal command retention. A scope change must not erase account-wide inbox/security cache by convenience.

Use existing scopeSession.test.ts, scopeSessionCoordinator.test.ts and scopeSessionLifecycle.scenario.test.ts as the regression core. Add only missing account/bond/late-response/hydration cases. A reducer/store coordinator may remain the smallest implementation; admit XState only with a full transition/effect/stop/recovery comparison and actual complexity retired. Final exit has no independently writable scope mirror, not just a comment saying it is canonical.

### S07 — Remaining reads and Query native lifecycle

Follow the existing Phase 3.4/3.5 admission records rather than restart completed notification/device-security work. Starting owners: entitlement/decision/flag stores and qualified ports/hooks, app queryClient.ts, existing network/AppState adapters and cache boundaries. Cedar verification of signature, expiry, policy version and exact scope stays outside generic “cached success.” Retain authorized offline continuity where explicitly required.

Select Query for native remote lifecycle and PowerSync for local SQL observers. Expo Router loaders belong to separately scoped supported web server acquisition, not the native mobile cutover. Do not migrate SQL reads into Query solely for hook uniformity or copy loader responses into another writable store. Trace native online/focus wiring first; if missing, implement one app-owned integration with cleanup and explicit offline/unknown behavior. Test reconnect/background/resume, invalidation, stale response and duplicate realtime/listener handling. Zero duplicate writable read authority is the exit, not zero Zustand declarations.

### S08 — Temporal, route and workbench ownership

Starting files: useTemporalStore.ts, useTemporalStore.test.ts, useActiveSubTabsStore.ts and actual route/task consumers. Separate minimal date/scale/focus from derived phase/past flags, network observations and animation intensity. Define timezone/midnight semantics; rapid updates must not leave old timers. Keep per-frame values with qualified animation ownership when animation is real.

Use local params for navigable filters/identity where appropriate; retain drafts locally/durably according to user requirements. Do not put credentials/permission payloads in URLs. Workbench task identity, capacity, dirty-task non-eviction and intentional restore remain required even if navigation already owns route identity. Scoped store or reducer+Context can avoid a module-global model. Qualify Router Activity retention by memory and effect cleanup on actual hardware. Exit: no unnecessary synchronized derivative facts; preserved task/back/deep-link behavior; narrow subscriptions and no timer accumulation.

### S09 — Self canvas persistence separation

Starting files: packages/self/src/features/selfCanvasStore.ts, selfCanvasPersistence.ts and userPreferences.ts with actual hook/route callers. Reuse existing preference/domain ports and durable contracts. Keep only the necessary client preference model. Separate local save acknowledgement from remote synchronization and temporary presentation.

Characterize account switch during 800 ms debounce, remote rejection, delayed old-account response, process death with pending work, local write rejection and guest lease behavior. Do not persist arbitrary actor snapshots or implement another global retry/outbox engine. Exit: confirmed local save means the required backend operation completed; remote queued/retry state has its declared durability; late old-account completions cannot write current account UI.

### S10 — Retirement and documentation repair

Audit unused Drafts/Sensory declarations, barrels, test support, startup side effects and retained keys. Zero calls does not establish zero stored work or external consumers. Preserve historical records; update authoritative ownership/provider guidance through explicit decisions, correcting latency/worklet/context absolutes, old Router exclusion and actual backend assumptions. Record SDK58 list/loader improvements without rewriting working lists as part of this state scope.

Each retirement receipt lists exact old symbol/file/behavior/key, retained behavior, migrated readers/writers, stored-data disposition, recovery plan, validation, remaining compatibility and approval reference. A compatibility adapter has an owner and deadline/exit condition. Final source policy must cover plain useStore and selected facade use, not only useXStore() naming patterns. Improve an existing checker only if its blind spots obstruct the cutover; do not build another disconnected audit platform.

### S11 — Physical acceptance

Reuse the physical matrix and evidence tiers in document 4 and the existing performance execution authority. Record actual backend/namespace, build and diff identity, debug/release/profileable status, device/OS/RAM, network, thermal state and observer overhead. Compare repeated cold/warm launches, account/scope change, offline write→force-stop→relaunch→reconnect, long lists/rapid temporal interaction, settings/sensory changes and background/resume. Primary 2–3 GB hardware is a separate requirement; A52 simulations cannot stand in for it.

Budgets come from measured baseline and existing goals; no invented universal FPS or memory number. A candidate that drops required behavior fails even if LOC/stores/provider nesting fall. Physical evidence is per artifact/device/journey; no G0–G3 suite may be relabelled G5. Code can progress through earlier evidence stages while hardware is unavailable, but release/device acceptance stays open.

## Verification commands and evidence discipline

Run package-scoped checks for actual changed owners, then applicable repository gates. Use package scripts so the evidence recorder captures the command; when selecting a focused test directly, run it through the existing run-and-report surface and state substitutions. Paths below are real starting tests; they do not imply all required scenarios already exist.

~~~powershell
pnpm --filter @repo/core run check-types
pnpm --filter @repo/ui run check-types
pnpm --filter gurudevi-mobile run check-types
pnpm --filter @repo/core exec vitest run src/store/scopeSession.test.ts src/store/scopeSessionCoordinator.test.ts src/store/scopeSessionLifecycle.scenario.test.ts
pnpm --filter @repo/core exec vitest run src/store/__tests__/entitlementReadiness.test.ts src/store/useTemporalStore.test.ts
pnpm --filter @repo/ui run test:boundary
pnpm --filter @repo/ui run test:runtime
pnpm run check:state-architecture-policy
pnpm run check:anti-slop
pnpm run audit:device-evidence
pnpm run check:test-evidence
~~~

Direct focused Vitest examples require explicit G1/G2 labels and substitutions in the execution log; they are not recorded as “tests passed.” Physical audit fixture success is not a device run. Native build/device commands must follow loaded android-build and device workflow skills for the chosen environment; do not invent a build path here. No expo install --fix, prebuild --clean, direct android/ios edits, gate weakening or package upgrades are authorized by this plan.

## Efficient agent ownership and reuse

Coordinator owns the plan/log, cross-boundary decisions, raw diff and integration. Reuse a Luna worker for one bounded patch or read-only mapping at a time; supply exact files, required behavior, installed declarations and tests. Tell every worker it is not alone and must preserve others' changes. Parallelize S03 versus S01 only with disjoint files; serialize S01/S02 shared port edits. Reuse the same worker for later consumers when their context remains relevant. A worker may report failure/evidence gaps and must not expand ownership to force green gates. Do not use separate user chats for subtasks.

## Completion and stopping rules

A work package can be implemented with open physical acceptance, but its status must say so. “Accepted” requires the relevant behavioral evidence and concrete retirement decision; “released” requires actual authorized release evidence. The progress log records exact commands/results and artifact links, blockers and next action. Gate failures from unrelated in-flight work remain visible; no global toolchain cleanup is hidden in a state patch. Keep required data/authorization paths working while removing obsolete internal shapes decisively.

## Feature cut status (2026-10-26)

Implemented context-bound Feature observation and retired the feature slice/shim/persist facade. Raw delta: reports/mobile-state-feature-reviewed-delta.patch. G1/G2: four files, 25 assertions with SDK/storage/network substitutions; G3: three files, 23 assertions with mounted React and substituted boundaries. Core/mobile G0 compilation exited 0. Full anti-slop remains failed (35 errors, 961 warnings), with no physical-device acceptance. Next Feature contract work must address SDK payload freshness, poll lifecycle and multiple offline contexts before describing full offline rollout continuity. Upstream changes integrate through bindContext/clear; no branch was merged. The full horizontal program remains active, including the other owners and all offline producers.

## Feature follow-through and next seam (2026-10-26)

Implemented verified network payload freshness and subscription-owned/network-admitted polling. Cache format moved to v2 without deleting old records; SDK upgrade audits must verify the documented public payload-reference behavior. Four-file G1/G2 evidence has 29 assertions; three-file G3 regression has 23 assertions. Full anti-slop remains failed (35 errors, 968 warnings), and there is no physical acceptance. Next cut is PowerSync ownership: current provider/gate incorrectly let a rollout default hide the durable local database. Preserve account isolation and required SQL behavior, move rollout control to the remote connection seam, and verify offline launch plus flag changes and account transitions before claiming the local-first floor is established.

## PowerSync ownership cut status (2026-10-26)

Implemented local database availability independent of rollout/network/read policy and a separate cancellable remote sync lifetime. Retired PowerSyncGate and implicit factory .sync. Explicit connector admission and owner signals are required integration seams. Evidence: four-file G1/G2 63 assertions, three-file G3 29 assertions, core/mobile static compilation and scoped policy/seam checks. Full anti-slop remains failed (35 errors, 975 warnings); no physical acceptance. Next: replace the unsupported onConfigure PRAGMA callback with installed typed native SQLite options and verify encryption/key/configuration behavior without clearing data, then continue the remaining holder/offline producer matrix. See execution log for failure limits and exact commands/results.
