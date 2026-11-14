---
title: "Mobile state audit 4: reconciliation and proposed direction"
status: "draft"
created: 2026-10-26
updated: 2026-10-26
author: "Codex"
tags: [mobile, state, reconciliation, architecture, performance]
---

# Mobile state audit 4: reconciliation and proposed direction

1. [Existing holders and consumers](2026-10-26-mobile-state-01-existing-inventory.md)
2. [Installed runtime capabilities](2026-10-26-mobile-state-02-runtime-capabilities.md)
3. [Existing documentation audit](2026-10-26-mobile-state-03-documentation-audit.md)
4. [Reconciliation and proposed direction](2026-10-26-mobile-state-04-reconciliation-and-direction.md)

## Decision proposed for review

Execution correction: see the [behavior-parity audit](2026-10-26-mobile-state-07-behavior-parity-review.md). The foundation is not fully implemented. Recent retirement work left changed offline-cache behavior, incomplete native policy disposition and remaining duplicate ownership. The revised plan prioritizes these responsibilities before further removal; earlier planning-only statements in this document describe its original draft.

Stop treating an existing store, provider or wrapper as a requirement. Re-derive each responsibility from its user behavior, data authority, lifetime, subscribers and failure contract, then use the smallest verified affordance already available. A value may disappear through derivation, become local React state, remain a persisted key, use an existing Query/SQLite observer, retain a justified bounded store, or earn a protocol controller. Store count and API novelty are not success metrics.

The evidence supports decisive simplification of specific ownership boundaries. It does not support a blind app-wide rewrite, another root orchestrator, replacing every provider with Zustand, or moving everything into XState/MMKV. A bounded implementation can be designed afresh and cut over completely; leaving another indefinitely writable compatibility architecture is a failed exit. Preserve user data and required journeys while explicitly retiring the obsolete internal contract under the repository deletion process.

This document proposes work; it neither implements it nor authorizes deletion of routes, tests, stored records or existing flows. All four audit documents were added without modifying application code or rewriting prior records.

## What the three evidence sets establish

| Source evidence | Capability evidence | Existing-record evidence | Reconciled conclusion |
| --- | --- | --- | --- |
| 21 holders, including three omitted by old store-name scanning | Zustand selector/persistence APIs exist | Phase 0 was deliberately lexical | Use the current semantic/call ledger; do not build a strategy from the old count of 18. |
| 185 facade hook calls subscribe to all four underlying snapshots | Zustand supports selector subscriptions directly | Facade migration deferred to Phase 5 | The facade is live coupling. Evaluate removing responsibilities and collisions before mechanically replacing imports. |
| Dormant sensory/draft declarations and a separate live sensory provider/service arrangement | MMKV has reactive keyed hooks | Sensory plan proposes conversion to stores | New declarations are not convergence. A preference pilot must retire competing authority and migrate the actual key. |
| Main bootstrap defaults to AsyncStorage; wrapper hides disk-write completion | Synchronous MMKV exists but startup cost is real | Historical physical startup concerns explain the opt-in | Choose/validate one backend path deliberately; do not infer active MMKV from installation. |
| Scope coordinator owns supported writes and still updates three mirrors | Reducer/store/actor options exist | Phase 2 accepted G1/G2 with mirrors retained | Retain validated transitions while planning an explicit consumer cutover; do not add another independent session authority. |
| Notifications/security summaries already use Query | Query owns read status, cache and observers | Phase 3.1/3.3 records completed | Keep those gains; resolve remaining authorization/flags with their real requirements. |
| Provider lifetimes and derived policies differ | Context/local state are still valid | Later canon overstates provider/store/singleton absolutes | Audit dependency and lifetime per provider; indentation reduction is not a measured performance improvement. |
| A52 historical debug observations exist | Native profiling and modern renderer tools exist | Low-end/release comparison remains bounded or open | Require matched device evidence before claiming a pristine phone experience. |

## Hostile findings, ordered by consequence

Priority means review order for this program, not a claim that a production exploit has been demonstrated. No P0 outage or exploit is established by this source-only audit.

### P1 — Storage completion can be mistaken for durability

[packages/core/src/adapters/native/AsyncStorageAdapter.ts](../../../../packages/core/src/adapters/native/AsyncStorageAdapter.ts) updates its memory cache then starts AsyncStorage.setItem and catches/logs rejection without returning its promise. [packages/core/src/lib/storageWrapper.ts](../../../../packages/core/src/lib/storageWrapper.ts) delegates through a void-returning manager path. A caller awaiting that wrapper cannot establish disk completion for this backend. This affects the interpretation of “saved locally” and “queued,” particularly in [packages/self/src/features/selfCanvasStore.ts](../../../../packages/self/src/features/selfCanvasStore.ts) and durable-command paths.

The source establishes the lost completion/error signal; it does not prove a particular command was lost on a phone. Required closure: inject write rejection/delay, distinguish accepted-in-memory from durably stored, kill/relaunch after each boundary, and verify recovery against actual selected backend. Expose durability where required through the existing storage/domain seam rather than scattering direct native calls or adding universal wrappers. Do not remove the working fallback to make the signature simpler.

### P1 — Entitlement fallback does not explicitly bind its cached result to the requested bond

[packages/core/src/store/useEntitlementStore.ts](../../../../packages/core/src/store/useEntitlementStore.ts) distinguishes principal and bond before a request, but its failure canUseCache check uses snapshotUserId and freshness without rechecking the requested activeBondId. A failed same-principal bond transition can therefore label retained metadata cached/loaded under a different request scope. Existing grant clearing may constrain the resulting behavior; this is not proof of unauthorized access. The exact consumer consequence requires a scenario.

Required closure: same principal, bond A → bond B, B fetch rejection, then late A/B responses and offline retry; assert snapshot identity, readiness, grants and UI admission. Safe denial and explicit scope mismatch must survive a future Query migration. A remote cache is never authorization itself.

### P1 — Canonical scope still carries compatibility replication costs

[packages/core/src/store/scopeSessionCoordinator.ts](../../../../packages/core/src/store/scopeSessionCoordinator.ts) validates and guards transitions, then commits Auth, Tenant, Perspective and ScopeSession representations with rollback. This is better controlled than independent writes, but not a simple final model. Current records intentionally retain mirrors.

Required closure: decide which raw facts actually need to be retained, migrate each reader to the intended meaning, then retire mirror writers and keys in a specifically reviewed cutover. Preserve generation guards, rollback, cancellation, private-cache disposal and original-principal command retention. A generic “session runtime” with another snapshot would worsen this seam.

### P1 — Facade subscriptions and field collisions hide different contracts

[packages/core/src/store/useStore.ts](../../../../packages/core/src/store/useStore.ts) subscribes broadly and overwrites duplicate names by spread order. AuthSlice.activePerspective and TenantSlice.activePerspective have different shapes; dismissedSampleIds also overlaps. Its type assertion hides rather than resolves that ambiguity.

Required closure: classify the 218 call sites by intended fields, delete no-longer-needed stored values where behavior permits, and use a qualified owner directly for remaining reads. Verify selected-object identity. A caller-count decrement is useful migration evidence; unrelated-update commit/CPU evidence determines runtime benefit. Do not “fix” the facade by layering another dynamically routed subscription dispatcher.

### P2 — Temporal navigation stores derived and animation state together

[packages/core/src/store/useTemporalStore.ts](../../../../packages/core/src/store/useTemporalStore.ts) keeps date, phase, isPastView, intensity and offline state. setViewDate starts a 300 ms timeout without cancelling earlier ones. There are 36 whole-hook calls across the scoped inventory.

Required closure: keep the minimum navigational fact, define date/timezone and midnight behavior, derive projections, and place presentation interpolation in its proper owner. Test rapid date changes and unmount/background behavior. Reanimated shared values are an available option only for a real animated value; they are not a replacement for date authority. Narrow remaining readers; do not create a separate global store for each derived property.

### P2 — Sensory convergence added an unused competing preference model

[packages/core/src/store/useSensoryStore.ts](../../../../packages/core/src/store/useSensoryStore.ts) has no production consumer in scope. [packages/ui/src/context/SensoryProvider.tsx](../../../../packages/ui/src/context/SensoryProvider.tsx) reads @gurudevi/sensory_preferences and configures the singleton; the unused store persists gurudevi_sensory_preferences_v1. [packages/ui/src/sensory/SensoryFeedbackService.ts](../../../../packages/ui/src/sensory/SensoryFeedbackService.ts) keeps its own mutable preferences and defaults, while soundFeedback owns a native player registration.

Required closure: establish the actual mounted preference/player path and defaults, choose one persisted preference authority, migrate old keys explicitly, subscribe/configure the imperative layer once with cleanup, and verify quiet mode/reduced motion/power behavior. An MMKV-key pilot can be evaluated only on the same selected instance/backend. Do not add a second settings provider just to make the dormant store appear useful.

### P2 — Self canvas mixes a preference reducer with persistence and network coordination

The store module owns local writes, remote transport, debounce, retries, a circuit breaker and module-level pending/retry slots. Its custom persistence is missed by a middleware-only audit.

Required closure: retain the actual preference model only where needed; assign local durable acknowledgement and remote synchronization to an existing qualified domain seam. Test account switch during debounce/request, process death with queued preferences, retry rejection and stale completion. A local queued label must not pretend a memory-only pending slot is a durable journal.

### P2 — Dormant declarations and broad persistence remain unreviewed liabilities

useDraftsStore and useSensoryStore have no statically identified production calls/imports beyond exports/metadata. That does not establish absence of stored data, import-side effects, external consumers or test contracts. Seventeen middleware holders exist; only subtabs and provisional workspace declarations include version+migrate options. An existing outbox item schema version is distinct from the surrounding persisted container version.

Required closure: classify data retention/scope first, inspect bootstrap import reachability, then make a specific retain/migrate/retire decision. A package export can cause initialization/hydration even without a hook call, depending on bundling. Never clear old keys blindly to make a store disappear.

### P2 — Lifecycle integration and modern compiler coverage need proof

No named Query focusManager/onlineManager wiring or mobile/core/UI useEffectEvent/useActionState usage was found. Babel config requests the React Compiler. These are gaps in demonstrated adoption, not proof that every modern API should be introduced.

Required closure: trace existing network/AppState adapters before adding listeners; prove reconnect/focus scenarios; verify compiler transformation and skip diagnostics for the relevant app/shared files. Prefer a local Action or effect callback only where it removes real bookkeeping while preserving semantics.

### P2 — Documentation gives agents mutually incompatible instructions

Document 3 identifies unsupported latency/worklet/context claims, older Router exclusions, stale source-of-truth maps and tool/skill signature drift. These can recreate unnecessary code after a cleanup.

Required closure: update the relevant authoritative records with the accepted implementation and evidence, keeping history linked. Future agents must start from one reconciled decision record rather than whichever “canon” a text search returns first.

## Candidate destination by responsibility

These are hypotheses to test, not mandatory container assignments. A store can split into an eliminated projection plus one retained owner; many rows deliberately have no replacement store.

| Existing holder / responsibility | Smallest candidate | Admission / retirement condition |
| --- | --- | --- |
| Auth session acquisition and account lifecycle | Existing authenticated lifecycle boundary plus one authoritative minimal account fact model | Preserve credential-subject/account distinction, offline matching identity, sign-out/recovery and guest conversion. |
| Auth toast, network flags, demo presentation | Existing event/UI/network owner or route-local value | Remove duplicate facts only after tracing their actual readers and failure UI. |
| ScopeSession and Auth/Tenant/Perspective mirrors | One validated scope representation; derived tenant/bond projections | All affected consumers cut over, with account/scope/cancellation/rollback scenarios. Store versus reducer/actor is secondary. |
| useUIStore theme/themeMode | One preference value; system theme derived from platform | Validate default, override, subscription and old-key migration. Direct reactive storage can be sufficient. |
| Sidebar / breathing overlay | Local route/subtree state if actual ownership permits | Confirm cross-route callers; preserve intentional global invocation without making every overlay global. |
| Desk items | Existing structured domain persistence or scoped preference record | Determine whether these are durable resources/drafts rather than UI booleans. |
| Sensory preferences | Three validated keys or one bounded preference record with native-owned reactivity | Stable selected backend/instance, key migration, one service configuration path. No new Zustand by default. |
| Consent | Minimal persisted consent value and subscribed UI when needed | Preserve meaning of undecided/denied/granted and telemetry behavior; not merely “two booleans gone.” |
| Temporal view | Minimal domain/route date-scale fact with derived projections | Preserve shared timeline semantics/timezone; local animation owner and narrow observation. |
| Active subtabs/workbench | Existing task model/reducer with justified scoped observer; preferences stored separately where helpful | Preserve capacity, dirty-task non-eviction, task identity, focus, restore/migration. |
| Generic drafts | Possibly no active runtime holder; scoped draft persistence where a real consumer exists | Audit retained user records and tests before any retirement. |
| Growth counters/stages | Observe the domain's actual data owner; derive stage/display deltas | Account isolation and intentional animation history must be defined before removing previous-value fields. |
| Feature flags | One rollout snapshot and derived flag reads using the rollout port | Freshness/exposure/default policy survives; no authority inferred from flag visibility. |
| Entitlement reads | Qualified scoped remote-read observer plus explicit offline continuity policy | Bond/entity/principal freshness and failure gates pass; no independent mutable mirror. |
| Cedar decisions | Verified snapshot reader/evaluator and a narrow observed readiness/result | Signature, policy version, expiry, principal and scope remain fail-closed. |
| Mutation queue / provisional workspace | Existing durable command/receipt system; minimal observable status projection | Preserve journal, idempotency, recovery, original principal and rejection. XState only if it demonstrably simplifies the protocol. |
| Mutation audit / conflicts | Bounded journal/history and domain reconciliation projection | Preserve reconciliation links and principal binding; do not replace with ephemeral Action state. |
| Version gate | Remote manifest facts + derived severity; local dismissal preference | Preserve maintenance/hard-block and safe failure behavior; no actor needed merely for three status labels. |
| Self canvas | Preference model plus explicit local durable save and existing remote sync boundary | Account switch/debounce/restart/write rejection scenarios; retire duplicate retry/persistence ownership. |

## Proposed execution sequence with concrete exits

### 0 — Freeze evidence, not development

Use this inventory as a dated baseline. Each implementation slice captures the current diff, affected consumers, actual package versions and a matched native artifact before changing that seam. Do not infer performance from this dirty checkout's source alone. Re-run the holder/call scan after each cutover and record how its scope differs from the baseline.

### 1 — Resolve correctness contracts before aesthetic rewrites

Start with storage acknowledgement/failure visibility and entitlement scope fallback. These define whether later simplification is safe. Use the existing ports/adapters and scoped read boundaries. Add only tests that distinguish failure, cross-account/bond and interruption behaviors; do not mirror implementation details. Exit: no “saved” success without the required guarantee and no cached snapshot admitted for a mismatching request scope, under named G1/G2 scenarios.

### 2 — Prove one small preference reduction end to end

Choose one bounded setting family with real consumers, such as theme or sensory after its mounted path is confirmed. Compare local state plus direct persisted observation against a retained tiny store. On the actual enabled backend, prove restart/default/corrupt/write-failure/migration behavior and native feedback. Exit: one owner, one required persisted representation, no second settings authority, and an explicit reviewed retirement of superseded hooks/keys. Do not automatically convert all preferences from the pilot.

### 3 — Cut the facade by meaning, not by search-and-replace

Prioritize startup/account consumers and high-fan-out domain hooks. For each group, first eliminate duplicated/derived state, then bind remaining reads to the qualified owner. Resolve activePerspective and dismissedSampleIds semantics explicitly. Exit for each group: zero facade import/call in that group, no whole-state fallback introduced, working command/error behavior, and measured unrelated-update work. Final facade retirement requires all remaining package/browser consumers and compatibility exports to be addressed and deletion approval recorded.

### 4 — Finish actual authority consolidation

Cut canonical-scope consumers to the accepted single representation and remove mirrors through an explicit retirement decision. Continue admitted entitlement/Cedar/flags work from the current Phase 3 records, preserving completed notification/security work. Exit: no second independently mutable or retained compatibility authority for the migrated fact, safe stale-response behavior, and complete scoped disposal. Reconcile the dated migration sequence if the user accepts earlier facade work; do not silently claim the old phase ordering was followed.

### 5 — Simplify the mixed temporal, workbench and canvas seams

Use the candidate table and real consumers. Derive display facts, keep transient state local, and separate actual durable work from render values. Decide any actor pilot using transition complexity and measured code removed, not package availability. Exit: fewer synchronized facts and lifecycle owners; no permanent adapter whose only role is preserving a retired shape; old tests remain or are intentionally migrated without weakened assertions.

### 6 — Reconcile documentation and measure release acceptance

Update the authoritative ownership/provider records with implemented facts, migration receipts and remaining uncertainties. Keep the older records linked as history. Complete the physical matrix below before reporting a device improvement or release readiness. A green linter does not close this step.

## What “pristine on a real phone” must mean

Use the existing [performance execution plan](../current_progress/2026-10-19-performance-engineering-execution-plan.md) as measurement authority and [runtime evidence reconciliation](../current_progress/2026-10-22-runtime-performance-reconciliation-and-plan.md) for instrument limitations. Historical A52 debug captures are context, not the new baseline. This audit performs no device actions and claims no new G5/R1 evidence.

Record package/build ID, commit+diff identity, runtime versions, enabled storage backend, database namespace, device/OS/RAM, refresh rate, thermal/battery state, network conditions, observer tooling, release/debug/profileable mode and scenario before interpreting a run. Compare baseline and candidate under matched conditions. Debug Metro timing, JS wall time, native CPU and user-visible interaction latency are different measurements.

| Physical scenario | Required visible/data behavior | Measurements / assertions |
| --- | --- | --- |
| Cold signed-out launch, guest entry and direct sign-in | Public content usable; optional services do not block admission | Native startup markers where available, first meaningful/interactive frame, main/JS stalls, PSS/native heap. |
| Warm launch and process-death restart | Correct account/scope and persisted settings; no wrong-profile flash | Restore latency, actual backend/namespace, required saved values, no silent memory-only recovery. |
| Account A → B → A | No A reads/grants/notifications/drafts shown for B; original queued work remains correctly partitioned | Cache observers/disposal, database detach/open, pending commands, late request completion. |
| Personal ↔ institutional scope, including rejected switch | Correct scope, rollback and denial; no old entitlement admission | Request scope IDs, cancellation, retained commands, no transient incorrect authorized UI. |
| Offline action → force-stop → relaunch → reconnect | Required command still present; one server outcome/receipt; rejection/conflict recoverable | Journal state before/after restart, original idempotency key, replay count and receipt. |
| Rapid temporal changes and sustained real lists | Responsive controls and correct final date/focus | Frame time/jank and JS/UI CPU; compare high-fan-out component commits; no accumulating timer/subscription work. |
| Theme/sensory/quiet changes and corruption/write failure | Correct default, persisted preference, no unwanted sound/haptics; save failure visible where required | Actual selected instance and old-key migration, resource cleanup, native feedback and accessibility behavior. |
| Background/resume, network loss, repeated navigation | Freshness/reconnect policy works; no duplicate listeners/players or growing retained state | Listener/player counts, memory trend after repeated journeys, cache/query activity and battery/thermal behavior. |
| Primary 2–3 GB physical Android and representative newer device | Same required journeys; graceful pressure/reduced-motion behavior | Device-specific memory envelope and matched sustained performance. A52 pressure simulation cannot stand in for low-memory hardware. |

Use repeated runs rather than one screenshot. Establish startup distributions with at least 20 matched launches per condition where practicable; record sample size and spread, and treat tail estimates from small samples cautiously. Capture longer sustained list/navigation traces separately. Set project-specific budgets from the existing plan and measured baseline before judging a candidate; do not invent a universal FPS/memory guarantee. Candidate goals in older plans remain goals until their conditions are met.

Failure of a required flow blocks cutover even if LOC, provider count or render count falls. Sustained regressions in latency, memory, background work or battery need explanation and a fix; cosmetic source flattening cannot compensate. Record unavailable devices or profiling facilities as open evidence, not simulated success.

## Verification and retirement record for each implementation slice

| Level | Evidence to produce | Boundary of the claim |
| --- | --- | --- |
| G0 | Relevant package typechecks, import/dialect/deprecation checks, raw deletion-first diff | Static contracts only. |
| G1 | Actual storage/read/protocol boundary fault tests | External/native dependencies substituted as declared. |
| G2 | Account/bond/offline/restart/retry scenarios as applicable | Stateful contracts under explicit substitutions; no phone claim. |
| G3 | Mounted native components and effect/resource cleanup | Native bridges still substituted where configured. |
| G4 | Real platform bundle/native build for affected journeys | Build compatibility, not physical usability. |
| G5 | Matched physical-device scenario evidence above | Only named artifact/device/conditions/journeys. |
| R1 | Separately authorized production canary observation | Real traffic only when actually deployed and observed. |

A retirement receipt names: the exact old code/behavior/key, retained required behavior, migrated consumers, stored-data migration/disposition, test continuity, rollback/recovery strategy, deletion approval and resulting delta. Temporary compatibility has a named owner and an exit; it is not the default permanent architecture. Required monorepo gates remain in force. This document's audit validation cannot be reused as implementation acceptance.

## Immediate next implementation boundary

The strongest first engineering slice is **durable storage acknowledgement and entitlement scope-failure characterization**, followed by one measured preference reduction. Those directly test whether the current abstractions preserve their claimed guarantees. Only then choose the final retained store/actor set from field-level evidence. The four reports provide a reviewable baseline; they do not assert that the app has become pristine by being documented.

## Validation performed for this documentation patch

| Check | Actual result | Claim boundary |
| --- | --- | --- |
| Supplemental AST/source inventory | 2,931 TS/TSX files parsed, zero parser failures; 21 holder contracts, 616 mapped calls, 95 exported wrapper-hook boundaries | Static source coverage under document 1 exclusions; no execution proof. |
| Local document validation | All four have required frontmatter and balanced fences; local references resolve; raw new-file diffs contain additions only and reconstruct saved contents | Documentation integrity, not application correctness. |
| Scoped git diff --no-index --check | No whitespace diagnostics for the four documents (exit 1 indicates different new-file content in this git invocation) | Scoped documents only. Whole-checkout git diff --check reports unrelated existing whitespace. |
| pnpm run check:anti-slop | Exit 1 at native-slop stage; later stages did not execute in this chain | CNG stage exited 0; no claim that the composite gate passed. |
| pnpm run check:native-slop | Exit 1: 48 findings, including BLOCK for React.forwardRef in packages/ui/src/components/ui/pressable/index.tsx and ScrollView collection in packages/ui/src/screens/NotificationsScreen.tsx | Existing application-source findings outside these four new documents; 46 other findings are REVIEW. No application code changed by this patch. |
| pnpm run audit:device-evidence | Exit 1: UNKNOWN file-open error writing reports/device-evidence/latest-claim.json | The command selected its certified baseline fixture. No physical-device run or G5 proof occurred. |
| pnpm run check:version-drift | Exit 0; dossier still lists unannotated dependency lag and cohort divergence | Zero exit is not absence of findings and not native runtime proof. Command regenerates its normal version-drift report. |
| pnpm run check:test-evidence | Exit 0 | Static test-command evidence-label audit only; no Vitest/Jest/device test was executed. |

No package typecheck/build or runtime test was needed to validate these Markdown additions; implementation checks remain required for the future code changes. Existing source/gate failures were reported rather than hidden, weakened or repaired outside scope.

## Upstream research integration — 2026-10-26

The follow-up [upstream guidance and lessons](2026-10-26-mobile-state-05-upstream-guidance-and-lessons.md) expands the earlier release/API checks into maintainers' architecture lessons. The [implementation plan](2026-10-26-mobile-state-06-implementation-plan.md) operationalizes this reconciliation; actual changes/evidence belong in the [separate execution log](../current_progress/2026-10-26-mobile-state-modernization-log.md). No proposed destination below is described as shipped.

| Research decision | Reconciliation refinement | Plan package |
| --- | --- | --- |
| R01–R02 derived facts and Effects | Elimination precedes container selection; cut synchronization loops rather than simply rename stores. | S05, S08, S09 |
| R03 scoped owner through Context | A stable subtree store instance is a valid candidate; provider removal is not a goal in itself. | S04, S08 |
| R04 compiler boundary | Verify compiled shared-package coverage and measured behavior; keep explicit external subscriptions correct. | S00, S05, S11 |
| R05 route ownership | Use non-sensitive route identity/filter params where correct; retain required local drafts and back behavior. | S08 |
| R06 SDK58 loaders/Activity and platform recycling | Extend the earlier capability review; check installed APIs and actual cache/lifecycle/platform needs before adoption. Local skill list guidance is stale for the new platform APIs. | S07/S08 evaluation; list redesign remains adjacent work |
| R08–R09 selector identity and hydration | Direct store migration must not introduce unstable object selectors or account-bound restore races. | S05, S06 |
| R10–R11 reactive storage and migration | Direct MMKV preference hooks are conditional on the same active instance/backend, not an automatic replacement for every store. | S01, S02, S04 |
| R12–R14 data/command/protocol distinctions | Reuse Query/SQL observation and durable journal separately; actor adoption must retire coordination. | S06, S07, S09 |
| R15 lifecycle cleanup | Count callback/player/listener registrations as state ownership; moving into a singleton does not release resources. | S04, S07 |
| R16 release-like measurements | Gate claims on matched artifact/device/journeys, not source elegance or debug FPS. | S00, S11 |

### Additional source defects to include in the first cuts

The read-only plan review found that both native MMKVStorageAdapter and FallbackMMKVStorageAdapter accept any and invoke .delete(key); installed MMKV4.3.2 declares .remove(key). The fallback can delete alternate storage while an older primary value remains, or later consult stale alternate values after a primary miss. Correcting the method name alone does not establish a consistent fallback/migration protocol. These are source findings with conditional impact when that backend is active; they belong in S01, before a preference pilot enables MMKV.

SoundFeedback registers a native player callback without matching unregister; FeedbackProvider also registers during useMemo render. Player disposal does not itself clear a callback retained by the singleton. S04 must choose one committed registration owner, identity-safe cleanup and verified listener/player disposal. No new provider/store or universal service framework is needed to fix that bounded lifetime problem.

A recent upstream Zustand clearStorage-vs-pending-rehydrate fix is a useful test lead, not proof our installed v5.0.16 is defective or permission to add another workaround. Scope the scenario precisely and rely on current installed behavior.

### Delivery decision

Execute S00, then S01/S02 storage correctness and S03 entitlement scope characterization; a bounded preference/lifetime cut follows. Facade groups and scope consolidation then progress toward complete retirement, with temporal/canvas simplification and physical acceptance. S03 can run beside storage design with disjoint file ownership. Do not keep earlier phase ordering if it preserves the proven facade unnecessarily; record the changed order against the dated migration plan. All source metrics in the four original audit documents remain a snapshot, not live completion counters.

Final research qualification: Expo Router data loaders are documented as web server-side acquisition; useLoaderData export presence does not make them a native Query/PowerSync substitute. S07 excludes them from the native cutover. S01 protocol design/API correction may proceed first, but storage migration/cutover waits for S02 completion acknowledgement and evidence.

## Horizontal design correction — 2026-10-26

The prior delivery sequence answered what to change first before fully specifying the shared capability structure. The [foundational design](2026-10-26-mobile-state-foundational-design.md) supplies the missing dependency-role, capability/current/target, ownership/lifetime and interaction views. Read it before implementation plan 06. Its proposed decisions and open questions must determine the final implementation slices; neither a larger audit nor a list of smaller stores is a replacement for this design. Existing task packages remain draft and unstarted.

## Resolved foundation and upstream accounting — 2026-10-26

The [foundation](2026-10-26-mobile-state-foundational-design.md) now resolves D01–D12, maps all 21 inventoried holders to target ownership and defines staged identity/database/policy admission. The [plan](2026-10-26-mobile-state-06-implementation-plan.md) H0–H6 order supersedes the earlier delivery decision above. Domain evidence still gates cutovers; it does not justify another aggregate store or mandatory XState layer.

Full offline work spans device preferences, restart-safe cached reads, local/replicated SQL, drafts, explicit commands, specialized receipts, bytes/media, guest conversion and authorization expiry. Attendance is one example. The publication migration lists four tables while checked-in streams select three; neither proves hosted state. Existing persisted useLocalFirstQuery continuity must survive a Query migration. File caches are evictable; durable upload recovery is not established by retaining bytes alone.

Verger is a device resource-policy/work-admission owner, separate from domain state, permissions and durable work. Fetched adaptive-runtime 33600d997 and Claude f24742058352 contain material unmerged integration/replay/scene changes; worlds and offline-demo tips are already ancestors. Current helper presence does not mean mounted runtime. Review startup permissiveness, derived network writeback, old governor actuator disposition and local-append versus upload workload classification before integration. Detailed refs/limitations are retained in the foundation. No merge, application edit or phone verification occurred.

## Feature reconciliation update (2026-10-26)

The SDK-backed Feature owner is retained with a reduced contract: bindContext/clear plus synchronous flags/snapshot reads. Removed the slice/shim and duplicate persisted flags. Cache restoration requires the same account/guest lease and targeting context; callbacks/resolutions are generation-bound and mounted expiry is explicit. This follows the existing rollout-port direction without adding Query as a second authority. Exact-context latest-cache retention and the existing evaluation-time TTL are provisional decisions; payload freshness/poll lifecycle and multi-perspective offline continuity remain unresolved. See the execution log for the four-file G1/G2 and three-file G3 results, static checks, and the still-failing anti-slop gate.

## Network-freshness reconciliation (2026-10-26)

The earlier Feature evaluation-time TTL limitation is now closed at the adapter boundary: only verified network payload receipts renew freshness. Version 2 caches enforce the changed meaning while retaining previous records untouched. One owned poll/network subscription replaces eager/unowned SDK polling; late and failed refreshes preserve the prior state. Full acceptance remains open (35 AIslop errors; no new G5). Next: remove rollout authority over access to durable local PowerSync data while retaining an explicit remote sync control. See the execution log for physical SDK grounding, scenario substitutions and remaining cold-start context/foreground lifecycle limits.

## PowerSync reconciliation update (2026-10-26)

The earlier rollout-owned local database gap is closed in source: local availability belongs to account/runtime ownership; remote admission belongs to rollout, observed connectivity and read policy, checked again at credential/upload boundaries. One native provider supplies context; the unused gate and factory-owned implicit connectors are retired. Account isolation, pending work, secure Drizzle and explicit removal remain intact. G1/G2 evidence has 63 assertions with substituted boundaries and G3 has 29 mounted assertions; neither proves native SQLCipher. Full gates and device acceptance remain open. Installed SDK inspection now shows the factory's onConfigure PRAGMA policy is ignored, so supported typed storage options must replace that false configuration affordance next.
