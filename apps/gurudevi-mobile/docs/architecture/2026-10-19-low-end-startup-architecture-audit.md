---
title: "Low-End Startup Architecture Audit"
status: "draft"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [mobile, startup, performance, low-end, hardware, powersync]
---

# Low-End Startup Architecture Audit

## Decision under investigation

Design the complete launch and onboarding workload for the primary 2 GB Android
audience before making further isolated performance patches. This document is a
source-grounded audit and proposed operating contract, not an implemented
optimization or a release-performance certification. The operator authorized
the [performance execution plan](../current_progress/2026-10-19-performance-engineering-execution-plan.md)
after this review, with the A52 as the middle reference and a low-end phone later.
See the [profiling workflow](mobile-performance-profiling.md) and
[runtime adaptation design](2026-10-19-runtime-adaptation-design.md) for execution.

The two preceding fault repairs remain in the working tree: GrowthBook renderer
recursion and an incompatible oRPC error prototype shim. Their correctness and
runtime evidence are separate from whole-app efficiency.

## Existing rationale and gaps

- [Adaptive capabilities integration](../../../../docs/architecture/adaptive-visual-capabilities-integration.md)
  defines shared runtime facts with separate visual and operational policies.
  Extend this boundary rather than create a competing device-profile system.
- [Adaptive hardening](../../../../docs/architecture/adaptive-capabilities-production-hardening-plan.md)
  requires conservative unknown signals, lifecycle cancellation, and release proof.
- [Memory plan](../../../../docs/architecture/memory-efficiency-implementation-plan.md)
  mostly targets 4–8 GB devices. The mobile director explicitly requires 2 GB.
  The primary support tier needs its own acceptance contract.
- [Mascot contract](../../../../docs/architecture/gurudevi-mascot-low-end-performance.md)
  distinguishes decoded images, native animation, and additional GPU surfaces.
- [September mutation design](../../../../docs/architecture/2026-09-20-mutation-pipeline-optimizations-and-low-end-efficiency.md)
  proposes bounded queues and allocation control. Its performance numbers are
  design claims, not measurements of the current opening journey.
- [October physical findings](2026-10-17-physical-startup-performance-findings.md)
  explicitly lack a release-like memory/startup baseline. The approximately
  1.52 GB development-client PSS and 49 MB development bundle cannot be treated
  as production measurements.
- [Entry authority](entry-system-standard.md) already separates runtime,
  identity, admission, and intent. Scheduling must preserve these distinctions.

## Current launch chain, top to bottom

| Stage | Actual owner | Work and architectural consequence |
| --- | --- | --- |
| OS and native process | Generated Android app / Expo development or release runtime | Loads native libraries, Hermes, and native views. Native startup cost precedes React device detection. Installed dependencies do not all necessarily initialize eagerly; trace actual loading. |
| JavaScript entry | `index.ts`, `src/shims/early-bootstrap.js` | Polyfills, Worklets/Reanimated imports, background-task definition, Router entry. Conditional WeakRef fallback retains strong references; inspect whether it activates on the shipped Hermes build before attributing retention. |
| Module evaluation | `app/_layout.tsx`, `EntryStartupBoundary`, `EntryShell`, package barrels | i18n loads all three locale JSON resources; broad imports expose optional services and UI modules before their components mount. Determine evaluation cost from a release bundle/import trace. |
| Essential local boot | `src/boot/startupCoordinator.ts`, core native bootstrap | Registers adapters/network bridge/storage/runtime, then imports and registers all domain catalogs, then initializes device-account scope. Sequential stages have 200-second deadlines each. Recovery deadlines are not latency budgets. |
| First route tree | `EntryShell`, `GlobalProvider`, environment providers | Mounts assets/language hydration, auth lifecycle, environment sensing, theme/fidelity, portals, deep links, guest boundaries and route gate. Provider count alone does not measure cost; their effects and subscriptions matter. |
| Optional startup | `startDeferredServices` | Workflow bridge, Google configuration when configured, background-task registration and install referrer imports start immediately after `setState(ready)`. No explicit first-frame/input/idle admission or shared concurrency budget. |
| Onboarding and admission | Auth lifecycle / central entry gate / onboarding command | Local guest and permanent-account paths differ. Keep server authority and subject scoping; do not make every optional capability part of admission. |
| Admitted shell | `AuthenticatedAppServices`, tabs layout | Capability hydration, flag synchronization, authenticated outbox, rewards/notifications and perspective hydration can converge near entry. Local guests skip several cloud operations. |
| Local database | `PowerSyncProvider`, core op-sqlite adapter | Skips activation for local-only identity. For eligible accounts, creates encrypted database and Drizzle wrapper; connection starts without awaiting first sync in the render path. Children render before DB readiness. |
| Ongoing work | React stores, query observers, PowerSync subscriptions, outbox and media | Repeated work, retained screens, decoded images, retry waves and foreground resumes determine sustained performance and memory churn. |

## Concrete source findings

### Profiles exist, but do not govern the whole startup workload

`classifyMemoryTier` uses <3 GiB / <6 GiB / remaining tiers. Unknown memory maps
to medium. `RealityProvider` initially assumes 4 GB, good network and no battery
saver; hardware detection runs after it mounts. Startup fallback appears before
this provider. Therefore device adaptation does not currently govern the entire
launch path from its earliest frame.

`VisualCapabilities` and `ExperienceProfile` control effects, image policy and
prefetch. `EfficiencyContext` governs battery, network and disk but has no startup
stage, device memory tier, CPU capacity, thermal condition, running-job count or
per-job execution budget. This is the central coordination gap.

### State subscription amplification

`packages/core/src/store/useStore.ts` subscribes to all four complete stores
before applying a selector. A selector at a call site does not prevent those
parent subscriptions from rerendering. Tabs and PowerSyncProvider consume this
facade. The source comment promising downstream isolation is inaccurate.

This amplified the confirmed flag feedback loop; it also warrants measuring
ordinary auth/flag/network transitions. Prefer existing atomic stores at hot
consumers after tracing; do not rewrite the entire facade indiscriminately.

### Database tuning is not connected through the supplied callback

Installed `@powersync/react-native` 2.3.1 constructs `OPSqliteOpenFactory` and
consumes the explicit `SqliteOptions` fields. The app supplies an `onConfigure`
function containing its PRAGMA tuning, but this SDK's options/open path does
not consume `onConfigure`. Thus that callback is not evidence that the listed
8 MiB cache or heap settings are applied.

The installed adapter opens one writer and five readers. Its default
`cacheSizeKb` is `50 * 1024`, applied to each connection. This is a potential
cache ceiling, not evidence of immediate 300 MiB resident use. The app's listed
256 MiB mmap setting is also neither proof of execution nor resident allocation.
Verify effective settings and native memory before selecting smaller budgets.

Preserve encryption, account-scoped files, write ordering and durable queues.
Do not reduce SQLCipher security parameters as a performance shortcut. Do not
invent an unsupported connection-count option.

### Workload ownership is split

Foreground `SyncManager` and background sync have distinct triggers. Background
sync consults `evaluateEfficiency`; foreground outbox processing has identity,
lease, ordering and retry protections but no common startup-stage admission.
Per-command leases protect correctness; they do not by themselves limit all
database, network and React work across subsystems.

GrowthBook construction starts SDK initialization, and flag resolution awaits
that initialization. Mount gating alone does not prove import-time work is
deferred. Its useful rollout boundary and local fallbacks can remain; audit
constructor timing, lifecycle and duplication before deciding full deprecation.

## Proposed performance contract

### Three inputs, with distinct meanings

1. **Capacity profile:** primary 2 GB constrained Android, 3–4 GB reference,
   and 6+ GB capable reference. RAM is one signal. Add OS low-RAM status and
   validated CPU/storage behavior where adapters support them. A high-RAM phone
   can still have slow cores or storage. Unknown capacity starts conservatively.
2. **Live conditions:** battery saver, thermal pressure where available, memory
   pressure, network/disk state and foreground/background. These may reduce
   permitted work below the stable capacity profile. Do not infer heat from RAM.
3. **Journey stage:** first local paint, usable public screen, admission,
   current-screen data readiness, settled foreground, background. The same phone
   gets different optional-work budgets at different stages.

Use the existing runtime-facts boundary. Keep operational safety decisions
separate from user-selected visual fidelity. Profile changes must not oscillate
on every frame; use conservative recovery and hysteresis for live pressure.

### Work admission by stage

| Stage | Required work | Optional-work rule |
| --- | --- | --- |
| First local frame | Minimum runtime, readable language/theme fallback, safe actions | No catalog-wide feature warmup, optional artwork prefetch or sync drain. Identify which current registration work can safely move after this frame. |
| Welcome/onboarding usable | Local onboarding state, accessibility, validation and immediate input feedback | Admit only the next step's small assets; keep unrelated domains dormant. |
| Admission | Current subject, account scope, required admission verification | Do not wait for analytics, experiments, rewards, full sync or unrelated domains. Valid cached admission remains subject scoped. |
| First useful app screen | Visible screen's local data and essential queries | Local database readiness and remote first sync remain different states. Load visible data first. |
| Settled foreground | Optional capabilities and bounded synchronization | Start with one optional job at a time on constrained hardware; choose final concurrency from traces. User activity preempts optional work. |
| Background/pressure | Durable write completion and authorized short tasks | Cancel disposable work, release decoded media, preserve offline data and pending commands. |

Yield between bounded work units. `async` and resolved promises do not guarantee
an event-loop yield; a microtask chain can starve input. `requestIdleCallback`
exists in the installed RN source, but an idle callback cannot preempt a large
synchronous job. Break CPU work into small batches; explicitly bound network,
decode and DB concurrency. Native background work still competes for physical
CPU, storage bandwidth and memory. Arbitrary fixed sleeps are not a scheduler.

Avoid eagerly importing a heavy module merely to ask whether its service should
run. Confirm production bundler behavior before claiming dynamic imports reduce
installed bundle size or deliver native production route splitting.

## Evidence and acceptance sequence

1. Build a startup work ledger: owner, trigger, imports, dependencies, required
   journey, CPU/thread, allocation/retention, I/O, failure path, cancellation and
   stop condition. Trace both first install and returning-account paths.
2. Define the primary device matrix and a reproducible release-like profiling
   artifact using the existing `performance` EAS profile. Keep Metro compilation,
   native Activity timing, first React frame and actual usable-screen timing separate.
3. Record cold launch, Welcome, onboarding step/completion, admitted first value,
   first DB open/sync, offline return and background/resume. Include low battery,
   slow network, large outbox and memory-pressure scenarios.
4. Capture TTID, useful-screen readiness, tap response, longest JS task, frame
   times, PSS/RSS plus swap, native/JS/graphics breakdown, bytes/queries and live
   subscriptions. Use trace markers for stage boundaries. Do not call a painted
   loading screen interactive completion.
5. Ratify numerical budgets from the 2 GB baseline. Candidate acceptance goals
   are P95 visible tap feedback within 100 ms, no optional JS task over 50 ms,
   60 Hz frame budget 16.7 ms, no growing retained memory across ten identical
   navigation loops, and no lost queued mutations. These are proposed product
   targets, not current measurements or guarantees. Set an absolute memory and
   cold-start ceiling after obtaining the release baseline.
6. Implement one measured architectural change per comparison: work admission,
   eager import containment, state subscriptions, supported DB configuration,
   media ownership. Re-measure the same journeys and check security/offline
   invariants after each change.

No blanket GrowthBook removal, dependency upgrade, route replacement, data
clearing or native regeneration follows from this audit. Architecture changes
in root/core logic require the repository's explicit design review gate.

## External grounding

- [Android startup analysis](https://developer.android.com/topic/performance/appstartup/analysis-optimization)
  distinguishes TTID/TTFD, traces critical work and warns that background work
  can still compete during launch.
- [Android low-RAM practices](https://developer.android.com/guide/topics/androidgo/best-practices)
  describes low-RAM and memory-class signals.
- [React Native performance](https://reactnative.dev/docs/performance.html)
  explains separate JS/UI budgets, idle work and release-build measurement.
- [RN 0.88 release](https://reactnative.dev/blog/2026/10/19/react-native-0.88)
  is the exact runtime release reference; installed source remains the API authority.
- [PowerSync 2.3.1 release](https://github.com/powersync-ja/powersync-js/releases/tag/@powersync%2Freact-native@2.3.1)
  and [native documentation](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)
  accompany the inspected local SDK options and connection implementation.
