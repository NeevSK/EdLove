---
title: "Startup Work Ledger"
status: "draft"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [mobile, startup, performance, work-ledger, powersync]
---

# Startup Work Ledger

This source ledger records concrete owners and triggers for profiling. It is
not a proposal to remove working flows or a performance measurement. Follow-up
acceptance design remains in the [low-end startup architecture audit](2026-10-19-low-end-startup-architecture-audit.md);
measurement interpretation and sources are in the [device profiling register](../research/2026-10-19-device-profiling-source-register.md).
The previous [physical findings](2026-10-17-physical-startup-performance-findings.md)
remain historical evidence; their development-client values are not release
baselines.

## Work inventory

“Thread” names the execution context only when the inspected source proves it.
JS/React effects and promise continuations run on the JS runtime; native
internals and SDK callbacks are **unknown** here unless their implementation
was inspected. An `await`/dynamic import marks asynchronous sequencing, not a
guaranteed event-loop yield or off-thread computation. “Risk” entries are
profiling hypotheses, not measured costs.

| ID / source owner | Trigger, dependency, journey/stage | Thread; async vs yield | I/O, CPU, allocation/retention risk (hypotheses) | Failure, cleanup, evidence needed |
| --- | --- | --- | --- | --- |
| W01 `index.ts` + `src/shims/early-bootstrap.js` | Process JS entry; before Router. Installs globals/polyfills, worklets/reanimated, random values, background task module, CSS, then Router entry. | JS module evaluation; sync imports. Thread detail within native package initialization unknown. | Import/initialization cost possible; WeakRef fallback retains strong target by design **if activated**. No claim that every imported package initializes services. | No local cleanup path; process lifetime. Trace module evaluation and confirm production Hermes actually takes fallback branch before attributing retention. |
| W02 `app/_layout.tsx` | Root route evaluation/render. URL polyfill/i18n config imports; splash prevent-hide call; Observe configure; mounts `EntryStartupBoundary`. | Module evaluation synchronous; splash call promise asynchronous with catch; React effects later. No yielding guarantee from import alone. | Locale config/import footprint, Observe config, native splash call are measurement targets, not known bottlenecks. | Splash rejection logged; startup boundary owns visible fallback/handoff. Record native launch, module load, first React frame separately; inspect shipped bundle/runtime config. |
| W03 `EntryStartupBoundary` + `startupCoordinator.ts` | Boundary mounts; effect installs global handlers then serially awaits platform bootstrap, dynamically imports catalog, registers catalog synchronously, initializes device accounts. 200 s per-stage timeout; retry increments attempt. Required for all routes before `EntryShell`. | Async promise chain and dynamic import; catalog registration itself synchronous JS. Await does not prove CPU work yielded or moved off JS. | Bootstrap adapters, module parse/evaluation, registry spread and account enumeration/storage may consume JS/IO; quantify rather than assume. | Stage errors show retry UI; timeout races do not cancel underlying operation. `bootstrapPlatform` resets rejected shared promise; catalog is idempotent; device account behavior inspect its owner for teardown. Capture stage begin/end, JS long tasks, actual I/O, retry/late completion behavior. |
| W04 `registerAppCatalog.ts` | Called by W03 once after dynamic import; imports/spreads eight domain registries before first route tree. | Registry construction/synchronous registration on JS after async module load. No explicit yield. | Import graph/module evaluation and object spread may cost CPU/heap. Registry presence does not show that every registered domain initializes runtime services. | Idempotence flag; no unregister path found in this owner. Measure import/evaluation vs call duration and inspect downstream registration effects before classifying as warmup. |
| W05 `packages/core/src/native/bootstrap.ts` | W03 invokes `bootstrapPlatform`; registers crypto/telemetry/network/identity adapters, starts native NetworkBus bridge, selects storage, registers runtime. MMKV only when enabled, native runtime ready and not Expo Go; otherwise AsyncStorage. | Native adapter registration mostly synchronous JS; web adapter/MMKV dynamic imports awaited; NetworkBus native internals unknown. | Storage adapter construction, bridge subscription, optional MMKV JSI load are hypotheses. Default route uses AsyncStorage per current guard. | Shared bootstrap promise; rejects clear cache for retry. NetworkBus stop/unregister not evident in this owner. Capture per-stage duration, adapter activation, storage backend and native/JS thread trace. |
| W06 `GlobalProvider` → `AssetsProvider` / `AuthProvider` → `useAuthLifecycle` | `EntryShell` render mounts these providers. Assets and auth effects start after commit; session lookup and auth listener are both established; auth profile resolution only for permanent authenticated session. | Effects and promises on JS; auth/network adapter internals unknown. Network awaits are async, not proof of background execution. | Language storage hydration, auth session read, profile/identity/school requests, account capture, state writes and realtime channel may allocate/do I/O. | Assets catches/logs and remains non-gating. Auth cleanup unsubscribes auth and AppState listeners; realtime profile channel unsubscribes on user/session change. Trace cold/no-session, offline, permanent session; separate session read from profile resolution and verify request waterfall. |
| W07 `EnvironmentProvider` / `RealityProvider` | Mounted in `EntryShell`; composes language, reality, sensory, theme and fidelity. Reality effect subscribes NetInfo and AppState, reads power/device/network initially, refreshes on foreground. | JS effects; signal providers and NetInfo/native power callback implementation detail unknown. `refreshReality` awaits collected signals; no scheduler-yield claim. | Device capability probe, network event traffic, state updates/context rerenders possible; unknown initial values are medium/4 GB/good until collected. | Removes NetInfo, AppState, optional power subscriptions; latest sequence suppresses stale refresh result; read failures retain prior values/log. Measure provider first values, signal call durations, subscription cleanup, rerenders. |
| W08 `SessionRouteGate` + `bootstrapRouteState.ts` | Every shell route evaluates session/readiness. Anonymous session triggers local guest identity lookup and guest lease check; route policy handles guest, public and protected destinations. Authenticated readiness depends on profile/session/capability snapshot. | React render/effect, JS promise + local guest identity/lease reads; router replacement effect. No explicit batch yield. | Local storage access, route state subscriptions and repeated readiness renders possible. No evidence this route gate itself performs remote request. | Cancels guest state update on unmount; logs lookup failure and marks local guest not ready; pending intent drains only when action says consume. Measure per-path lookup/render/redirect count, offline local guest, stale/unexpired lease. |
| W09 `PowerSyncProvider` | Only mounted where app composition includes it; effect activates when PowerSync flag on, account ID exists and identity is not local-only. Creates account-scoped OPSQLite factory/database/Drizzle, injects DB; starts connection without awaiting it. | React effect + awaited factory/activation; native SQLite/JSI and connection worker thread specifics unknown. Promise start does not establish thread or first-sync completion. | Secure key/file/database open, schema, native allocations, reader/writer cache and first network sync are separate hypotheses. Database is capability, not route render gate. | Deactivate on ineligible identity/dependency change/unmount; active flag blocks stale setState. DB failure logged; initial sync rejection logged while local use remains. Capture activation/open/injection/first-sync separately, effective DB config and PSS/native memory. |
| W10 `AuthenticatedSyncService` → core `SyncManager` | `SessionRouteGate` mounts `appServices` only for protected content when presentation permits; service further requires authenticated session, active identity and user in store. Queue drain starts when online, queue nonempty, not already syncing. | React effect invokes async sequential queue processing on JS; mutation/network/dispatcher implementations may delegate internally—unknown here. A series of awaits is not a fixed yield budget. | Queue sorting/copy, migration, lease/state updates and mutation requests; large queue or expensive synchronous mutation setup are hypotheses. | Auth gate prevents local guest drain. Per-item leases/order/backoff/conflict/DLQ/auth-pause; finally clears syncing. Need cleanup/abort behavior from downstream mutations; capture queue length, per-item duration, network retries and JS responsiveness. |
| W11 `OptionalStartupServices` → `optionalStartupWork.ts` → core `workAdmission` | `EntryShell` mounts service; requires AppState active and battery saver off, then requests animation frame + idle callback. Schedules background-sync registration and (when env ID exists) Google sign-in configuration one at a time. For this lane only, frame+idle is called `settled`; it is not screen interactivity/TTFD. | React effects plus JS callbacks/promises/dynamic imports. Idle callback is a scheduling opportunity, not a time-sliced execution guarantee; started import cannot be aborted. | Both optional tasks can perform native registration/configuration; exact CPU, I/O and allocation cost unmeasured. Unknown pressure and capacity do not prove low resource use. | Cleanup cancels queued frame/idle callback; in-flight task is allowed to settle. Task failure logs and scheduler continues. Admission state persists in a ref across effect replacement; task IDs persist in started set. G1: work scheduler 4 tests, reducer 8. Measure task start/end, cleanup race, and whether actual screen is interactive first. |

## Journey distinctions to preserve in evidence

| Journey | Proven path and work distinction | Evidence boundary |
| --- | --- | --- |
| Local guest, first entry | W03–W05 critical registration occurs before `EntryShell`. Auth initial-session check runs after shell mount. Anonymous session does not call `fetchAndSetUserProfile`; route state reads local guest identity/lease. | Separate shell-ready/Welcome from guest-state restoration and onboarding usability. Do not count cloud profile resolution or PowerSync as required local-guest work. |
| Local guest, returning | Same auth session read; guest route state checks local onboarding/capacity and lease. PowerSync guard excludes local-only identity. | Measure local storage reads and route transition; prove any media/domain work from actual screen mount/trace rather than catalog imports. |
| Permanent account, online | Auth initial session read; authenticated session resolves profile/identity and may request account lifecycle, identity, school; protected app services mount when route policy permits. Capability hydration/FeatureProvider and foreground outbox may then start; PowerSync depends separately on flag/account. | Timestamp session, profile resolution, gate admission, capability hydration, DB open, first sync and queue drain independently. They are not one “startup complete” event. |
| Permanent account, offline return | Auth profile resolution can yield unavailable/error; code checks a stored account match for the same auth subject and can preserve local identity. Route readiness may use an offline capability snapshot. | Record network fault and subject/account IDs (privacy-safe); verify local DB availability and route usability separately from remote refresh. Do not equate a cached screen with remote sync. |
| Account switch / sign-out | Auth listener resolves changed session. Identity state updates; inactive identity requests PowerSync disconnect. PowerSync effect deactivates/re-activates on account ID/local-only/flag changes. Authenticated service unmounts unless active authenticated identity. | Verify old account data cannot be observed/replayed under the new account; capture unsubscribe, DB deactivation/activation, leases and queue scoping. The reviewed path does not establish atomic teardown completion; inspect lifecycle implementation. |

## Interpretation limits

- Import reachability is not evidence of eager service initialization. W01/W04
  only identify evaluation/registration work; prove runtime work with module
  traces, constructor/registration behavior or measured spans.
- Async is not synonymous with idle, low priority, off-thread, or cooperative.
  Conversely, native work competes with JS for device CPU and memory even when
  it executes on another thread.
- Samsung A52 is a user-selected **middle hardware reference**. Its observed
  RAM is 7.3 GiB; this is a memory observation only, not CPU-tier evidence and
  not a proxy for the primary low-end device cohort.
- Failure paths listed above are source-observed handlers, not proof of every
  timeout, cancellation or recovery outcome. Validate those with controlled
  traces and boundary evidence before changing orchestration.
- Essential startup stages now report bounded durations through startup
  telemetry. Coordinator events do not currently include native TTID, route
  interactivity, optional warmup duration, or actual pressure readings; avoid
  joining those concepts under one “startup complete” metric.
