---
title: "Verger Android modernization: capability gates and execution plan"
status: draft
created: 2026-10-27
updated: 2026-10-27
author: Naveen
scribe: Codex
tags: [verger, android, expo-modules-v2, migration, plan]
---

# Recommendation

Proceed with a bounded migration of the Expo binding after establishing an exact-source native baseline. Android Modules 2.0 is available; parity for Verger has not yet been demonstrated. The first deliverable is a verified compatibility result, not a rewritten sensor system.

The motivation is a smaller SDK-aligned binding and potentially cheaper conversion/event delivery. Expo microbenchmarks are not an estimate of whole-app speedup: Verger aggregates frames and samples other signals at bounded intervals. Sensor work, wakeups, allocation, and event frequency may dominate. A syntax migration alone does not add sensing capabilities or justify more sampling.

## Grounded substrate, 2026-10-27

- Installed `expo-modules-core@58.0.24` selects Android `expo-modules-v2-react@0.2.5` and integrates it through `ExpoModulesV2Host`.
- The installed Gradle extension defaults `v2` to false. `ExpoModulesGradlePlugin` applies the v2 plugin only when enabled. Installed `expo-application@58.1.2` explicitly sets `expoModule { v2 true }` and uses `@ExpoModule`, `@JS`, and the v2 Module superclass. SDK membership alone is insufficient.
- Inspection of the cached 0.2.5 AAR with javap confirms `Module.onDestroy()`, `ExpoObject.event(...)`, typed `events.Event<T>.emit(T)`, observer attachment/detachment, ExpoContext closure state, and ReactExpoContext. These signatures prove available API shape, not ordering, thread safety, conversion semantics, or correct cleanup.
- The artifact POM points to [Expo's Android v2 repository](https://github.com/expo/expo-modules-v2-android). Inspect source tied to the resolved artifact/version before implementing critical lifecycle and event behavior; main may differ.
- [SDK 58 release notes](https://expo.dev/changelog/sdk-58) establish Android beta availability. The older [September preview](https://expo.dev/blog/an-early-look-at-expo-modules-2-0) is useful context but is not authority for Android parity or mixed-mode authoring. Do not transfer Swift migration recipes to Kotlin.

## Contract that must survive

Module lookup stays `Verger`, lazy on first use. Import and kill-switched startup must not initialize a sensor. Capacity, exit-history and process-ID reads must not create VergerSense. Existing clients without the module and iOS continue with the current JS/floors behavior and unknown facts.

All nine methods remain synchronous at the JS boundary: readCapacity, readExits, readProcessId, start, stop, setSensors, setRefreshCap, setCpuBoost, readTotals. Preserve parameters, nullability, numeric values, exceptions, and return shapes. Synchronous stop currently queues native teardown; it is not a completion acknowledgement. Do not silently claim stronger semantics or convert it to a Promise.

All eleven event names and payloads remain: onFrameWindow, onThermal, onMemoryTrim, onPowerSaver, onThreadLoad, onMemory, onNetwork, onBattery, onCpuHeadroom, onDataUsage, onLever. Reuse mapping.ts and contract/native-events.json; extend missing coverage rather than creating a competing schema.

## Capability fit and unresolved proof

| Need | Current mechanism | Android v2 evidence | Required proof |
| --- | --- | --- | --- |
| Identity and method exposure | Name/Function DSL | Installed @ExpoModule/@JS reference | Exactly one registered Verger, all nine exports and unchanged sync calls |
| Application and activity access | appContext.reactContext/currentActivity | ReactExpoContext; installed androidContext reference | Available only after binding; null activity and recreated activity handled; no stale activity retention |
| Background/native readings | Existing HandlerThread, Android callbacks | Binding replacement does not replace Android sensing | Preserve sensor thread ownership and Android API guards |
| Eleven event channels | String emitter and JS addListener | Typed Event<T>, emit and observer APIs exist | Payload conversion, nulls, number precision, names and existing JS subscription/removal compatibility |
| Worker-thread emission | SenseEmitter called from native paths | Signatures alone are insufficient | Inspect 0.2.5 delivery code; exercise concurrent emit/unsubscribe/destroy; preserve per-channel ordering |
| Runtime destruction | DSL OnDestroy calls sense.destroy | Module.onDestroy exists in artifact | One effective teardown; no post-destruction JS call, leaked callback, thread, refresh request or CPU session |
| Runtime reload | New module/runtime after reload | Host attaches/closes v2 runtime | No duplicate registry entry or second surviving sensor after repeated reloads |
| Configuration conversion | Map<String, Any?> and synchronous parseConfig | @JS methods exist; exact map dialect unproven | Compile/runtime fixtures for maps, nested sensors, null hz, nonfinite values, rejected configs |
| Read-only facts | Direct DeviceFacts calls | Ordinary exposed functions available | No cached constant conversion; exit records and PID preserved |
| Autolinking | Current expo-module.config and package | Opt-in compiler/discovery pipeline | Inspect resolved module list and generated hints; absence of legacy config entry is not automatically evidence of failure for v2 |
| Compatibility with JS wrapper | NativeModule declaration, requireOptionalNativeModule | v2 host registers under expo.modules | Same lookup, addListener and removal behavior in actual Hermes development client |

Typed native records may be useful if the verified v2 converter requires them. Introduce only boundary types that map to the existing wire schema. Do not redesign payloads, force missing readings to zero, add a dynamic untyped event bus, or assume arbitrary maps serialize because Kotlin accepts the type.

## Target architecture and scope

Keep VergerSense, Android signal collectors, Presence, estimator, native levers, core reducer and host rules as they are. Replace the thin Expo-specific exposure and lifecycle/event adapter. One regulator, one active sensor instance, one stable JS API. World components continue reading the same snapshots; no World styling work belongs in this migration.

Expected edits: packages/verger-android/android/build.gradle, VergerModule.kt, expo-module.config.json only if verified discovery requires it, focused native/binding contract tests, and package documentation. index.ts/mapping.ts should retain their public contract; changes require concrete runtime/type evidence. A small typed payload file is allowed if needed by the verified converter. No general runtime abstraction, second controller, dependency upgrade, or new telemetry service.

Do not register v1 and v2 under the same name. Do not assume Android supports Swift-style mixed DSL/annotation exposure. Preserve the prior binding as a recoverable Git state, not a permanently duplicated runtime implementation.

## Execution sequence

### 0. Establish a trustworthy control build

Capture current dirty-source identity, manifests and lockfile in a recoverable checkpoint without disturbing other work. Run pnpm verger:check serially; preserve failures. Locate a Linux ext4 workspace whose source identity can be verified. The existing WSL checkout differs and has local edits: do not blanket-sync over it or build stale sources as evidence.

Build the exact current DSL binding through Gradle, run native unit tests and the existing TS gate, and record resolved Kotlin/compiler-plugin/runtime versions. Confirm real module availability. If the existing binding fails, resolve the baseline failure separately before comparing v2. A stub compile or Metro export is not a native baseline.

Exit: reproducible baseline native build and source/version receipt, or a named prerequisite preventing meaningful comparison.

### 1. Prove the difficult capabilities before replacing exposure

Inspect resolved 0.2.5 source/binary and Gradle variant metadata. Verify context/activity access, destruction, event thread behavior, map/record conversion, numeric/null handling and the actual generated registration path. Run a focused build-time test fixture within the existing module/test infrastructure under a distinct test-only identity; if impractical, use the reversible binding patch, not a new production probe module.

Exercise one representative structured sensor event and a synchronous config method, plus destruction during delivery. Do not migrate nine functions first and discover that teardown or payload conversion is unsupported last.

Exit: every capability row has physical source evidence and its designated compilation/runtime check. Any unsupported critical row blocks the production switch. Keep the working DSL binding while investigating; do not substitute no-op behavior.

### 2. Migrate only the binding

Enable per-module v2, preserve the Verger name, expose the nine methods and eleven events, adapt SenseEmitter explicitly, and connect the destruction hook. Keep parseConfig synchronous and sensor work on the existing handler. Use application context for lifetime ownership and resolve current activity live at the relevant calls. No eager sensor construction in annotated properties or module initialization.

Retain start replacement/idempotency, setSensors behavior, disabled-sensor neutrality, timestamps, event cadence, frame aggregation, refresh release and CPU-session closure. No control-policy or data-budget change. Validate autolinking and generated output without manually editing generated native project files.

Exit: exact-source Gradle compilation/tests, complete wire-contract parity, JS wrapper compatibility, and serial Verger gate ALL_PASS=1. Raw unified diff reviewed deletions first; no removed fallback/test.

### 3. Adversarial runtime verification

Use a rebuilt development client with the actual compiled module. Verify nine methods and eleven event subscriptions using controlled scenarios and explicit unsupported readings. Test: no current activity, activity recreation, background/foreground, start/start/stop/start, stop before start, repeated stop, runtime reload while emitting, unsubscribe while emitting, and destruction while stop is queued. Check thread/callback/session counts return to baseline and hardware requests are released. Old JS listeners must not receive a new runtime's events.

Verify kill switch/off mode performs no sensing, missing-module fallback still works, and native readings retain precedence over JS signals. Exercise offline/reconnect, Data Saver, battery saver and frame collection without changing real user data. Keep critical attendance writes outside optional-work admission.

Compare control build versus v2: cold-start effect, Verger thread CPU, event count/rate, allocation/heap growth, queue delay, dropped/out-of-order events and frame behavior. Use equal configuration/scenarios. Runtime failures, leaked resources or changed contracts veto adoption regardless of microbenchmark speed. Investigate reproducible performance regressions before acceptance; do not invent a budget that blesses them.

Exit: physical-device evidence for a representative lower-memory phone and normal phone, or explicitly partial acceptance pending those devices. Emulator-only evidence cannot close real thermal/power/calibration gaps. A release variant eventually needs separate optimization/registration verification before production rollout; do not claim a debug build proves R8 behavior.

### 4. Integration and delivery

Review the complete path: OS readings -> native event -> TS mapping -> Verger sensor precedence -> snapshot -> World/UI and optional workload consumers. Confirm no output-schema drift and preserve existing release preset, kill switch and ladder behavior. Record evidence and known limits in pipeline/open-items. Native binding changes require a new binary; OTA cannot install the new module. Validate the repository's native fingerprint/runtime policy so an incompatible JS update is not delivered to an old client.

Roll back with the prior binding/build state and a rebuilt native binary if parity fails. The runtime kill switch mitigates active sensing but is not rollback for failed module registration or native startup crashes. No automatic publication, release-mode enablement, or broad rollout is part of this plan.

## Hostile review: reasons to refuse a proposed patch

- “It compiles” with a changed event name, erased null, or Promise replacing a sync method: contract failure.
- “It is faster” while increasing sensing frequency or emitting per frame: scope violation; compare equal workloads.
- “We kept lifecycle callbacks” while runtime destruction leaks their owner: lifecycle failure.
- “The kill switch covers it” while module discovery crashes before the switch is read: invalid mitigation.
- “We can maintain two implementations indefinitely”: unjustified ongoing cost; use a reversible migration with one active implementation.
- “Typed events cover everything” without inspecting map/record conversion or JS addListener compatibility: unsupported inference.
- “Android works like Swift mixed mode”: unverified dialect assumption.
- “Phone calibration is fixed by the new binding”: separate problem; provisional thresholds remain provisional.
- “World migration should go in too”: independent scope; keep its visual regressions separate.

## Decision

Go for baseline and capability proof, followed by the bounded migration if those gates succeed. Do not make production adoption depend on optimism about a beta. If a required capability cannot preserve behavior on the installed cohort, retain the DSL binding and report that specific blocker. No additional runtime feature, shared-object transport or custom JSI path is justified without measured need.

This turn produces a plan only. No migration code, native build, runtime test, policy change or new G4/G5 evidence is claimed.
