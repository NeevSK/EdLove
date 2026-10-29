---
title: "Startup, sandbox and World profiling execution plan"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Naveen
scribe: Codex
tags: [startup, onboarding, profiling, world, verger, android, sandbox]
---

# Outcome and current evidence

Make launch, onboarding and entry into a usable sandbox responsive while preserving account identity, auth, offline recovery and World presentation. Measure and remove the causes of unnecessary work; use Verger to observe pressure and adapt optional spending. Verger must not mask startup defects by permanently lowering quality or gating essential work.

The isolated v2 candidate runs on the physical Samsung A52/API 34 in actual Hermes. Complete debug APK, 48 native JVM cases and the 517-case Verger gate are recorded in [the implementation record](../../../../docs/engineering/runtime-performance/verger/2026-10-27-android-modules-v2-implementation.md). The final post-device gate log is reports/verger-v2-final-after-device.log, ALL_PASS=1. Main C:/x retains the older binding. The candidate is not production-qualified.

Use the existing [startup work ledger](2026-10-19-startup-work-ledger.md), [low-end audit](2026-10-19-low-end-startup-architecture-audit.md), [profiling source register](../research/2026-10-19-device-profiling-source-register.md) and [sandbox contract](2026-06-26-developer-sandbox-console.md). Historical timings are not current baselines.

# Grounded tooling inventory

| Existing facility | Purpose and next verification |
| --- | --- |
| EntryStartupBoundary/startupCoordinator/startupTelemetry | Existing stage timing and retry boundary; correlate stage work with first usable route and deferred work |
| expo-observe 58.0.16 | ObserveRoot already mounted; welcome and self-floor already have ObserveInteractiveMarker. Verify readiness semantics, not merely marker presence. Debug dispatch is false; do not assume local traces reach a dashboard |
| React Native DevTools | Inspect React commits, JS execution, memory, console and network; verify available panels in this actual RN 0.88 client |
| Argent Hermes/React profiling | Available start/stop/analyze, component renders, CPU and commit queries; automation and source-linked hotspot inspection |
| Argent native profiling / Android Perfetto | Scheduler, UI/render contention, jank and memory signals; validate device support before promising trace fields |
| Verger lab/snapshots | Read native and JS pressure, activation, applied levers and outcomes; correlate with the same journey/timestamps |
| Rozenite performance-monitor-plugin ^1.13.0 | Already declared in mobile manifest; inspected app/Metro files did not show a root hook or Metro integration. Verify installed API and actual discovery before calling it active |
| Expo Atlas / bundle reports | Inspect module/import contribution when startup CPU or imports justify it; verify availability in installed CLI |
| RN-Terrain | Source/version affordance and AST/seam checks before package-sensitive fixes; complements runtime profiling |

The Expo developer menu contains tools and first-run onboarding UI. Identify any advertised tool by its actual label rather than guessing. Verify whether it adds useful visibility beyond installed facilities. Do not install every plugin, enable duplicate collectors, introduce paid services or add startup overhead without a concrete measurement gap. Preserve current Observe configuration while investigating local collection and any custom endpoint.

Official sources checked 2026-10-27: [Expo debugging tools](https://docs.expo.dev/debugging/tools/), [dev tools plugins](https://docs.expo.dev/debugging/devtools-plugins/), [SDK 58 release](https://expo.dev/changelog/sdk-58), [Observe SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/sdk/observe/). Installed source remains the API authority. Observe marker source marks once on mount, so route mount alone does not certify a usable action.

# Execution order

1. **Make the diagnostic session reliable.** Confirm exact app/artifact, device, Metro root and source hashes. Close developer onboarding/menu overlays for measurements. Inventory available panels and verify existing Observe/Rozenite wiring. Preserve the separate candidate package and existing account data. Record the current warning set before changes.
2. **Record reproducible journeys.** First launch → welcome → normal onboarding → dev sandbox → first useful screen; returning local/session launch; warm navigation; offline/failed-network recovery. Inspect the current dev::menu/dev::sandbox parser and permitted QA identity before exercising account creation. These are real scoped accounts through normal onboarding, not auth bypasses. Keep first-run and returning-state samples separate; never clear the original app's data.
3. **Establish baseline and metric semantics.** Separate process/native first draw, first useful route, actionable CTA, actual input response and first usable sandbox content. Verify existing TTI markers against these endpoints. Take at least five repeat runs per practical scenario and retain raw values, median and range; small samples do not establish a population p95. Log device temperature, charging, network, cache/account state, build and instrumentation. Use lightweight runs for timing and separate instrumented runs for attribution.
4. **Explain the critical path.** Capture React/Hermes profiles and native traces in separate or capability-verified combined passes. Join them with startup stages, requests, storage/auth readiness and Verger readings. Check import evaluation, catalog registration, provider rerenders, duplicated effects, deferred tasks competing immediately after readiness, fonts/artwork decode, layout and draw costs. Treat each as a hypothesis until measured. Optional async work can still consume the startup JS thread.
5. **Fix the top measured offender.** One architectural change per before/after cycle. Preserve retries, fallbacks, identity and offline behavior. First triage the observed disabled-entitlement missing-queryFn warning and CSS variable-remount warning; do not claim either is the bottleneck without profiling. Narrow tests plus live replay must confirm behavior and a net benefit. Avoid adding memoization when React Compiler already covers the component unless a compiler bailout is established.
6. **Verify World behavior on the measured path.** Inspect welcome/onboarding/sandbox in supported languages, bundled fonts, first paint, images, motion/reduced motion and static fallbacks. Trace UI tokens and actual components to World definitions. Correlate Verger capability changes with visual/workload consumers; unknown readings must remain unknown. Device screenshots and interaction checks are required; bundle success alone is insufficient. Fix expensive effects or work placement before considering quality policy changes.
7. **Re-measure and report.** Replay identical journeys after each fix. Report response/startup deltas alongside frames, CPU, memory, request counts and correctness. Stop changes without a net benefit. Keep regression evidence and outstanding native migration gates visible. Debug results explain causes; representative production timing still requires a separately authorized release/profileable artifact and lower-memory phone.

# Boundaries and acceptance

- No new auth shortcut, developer-only path in public UI, permanent dual Verger registration, threshold tuning from one phone, destructive prebuild, package upgrades or account-data clearing.
- No tool integration until its installed API and need are established. No cloud telemetry expansion or paid service activation is implied by local tool inspection.
- Required app states and actions remain usable through offline, timeout and server failures; essential attendance/auth correctness is not traded for timing.
- Every optimization records source identity, scenario, engine/evidence level, sample count, before/after raw artifacts and limitations. G0/G1/G3 checks accompany actual G5 replay. The broad repository anti-slop gate currently remains red at inherited Fallow findings; do not hide that status.
- Deliverables: tool inventory with active/unwired status, journey captures, stage/request/profile evidence, ranked bottlenecks, narrowly verified fixes and a World behavior matrix. Numerical acceptance budgets follow baseline evidence and product constraints rather than invented targets.

Immediate next step: inspect the live developer menu and instrumentation wiring, then record the welcome/onboarding/dev-sandbox journey on the isolated A52 client while collecting a low-overhead startup baseline. Keep deeper profilers off for the initial timing pass.

## Active continuation: matched v1/v2 comparison and tooling reference

Naveen requested a full v1-versus-v2 qualification alongside this work. Here v1/v2 refer only to the Expo binding dialect around the same Verger sensor/policy implementation. Build the v1 control from the integrated snapshot used for the v2 candidate, preserving the same dependency graph, config, JS bundle, device and workload. The previously installed development app is not an equivalent control. Separate package IDs preserve data but can introduce different account/cache histories; record and match those conditions. Adoption depends on parity, lifecycle and runtime evidence, not a claimed microbenchmark speedup. Keep the recovery refs and v1 source until qualification completes.

The exact page open on the A52 was [Tools, workflows and extensions](https://docs.expo.dev/develop/development-builds/development-workflows/), last updated September 29, 2026. Its tools cover tunnel connectivity, update/QR launch links, custom dev-menu entries, update extensions and runtimeVersion. For this USB setup, ADB reverse is sufficient; tunnelling and publishing updates add no measurement value. SDK 58 launch parameters can hide the dev-menu/FAB and skip its tooling onboarding without changing the app's own onboarding. Custom entries could expose existing Verger/diagnostic routes, provided registration is centralized: subsequent registerDevMenuItems calls replace previous entries. This API was verified in installed expo-dev-menu declarations. Do not publish updates or change production runtimeVersion during a local profiling task.

Installed Rozenite performance plugin 1.13.0 exports usePerformanceMonitorDevTools and peers on react-native-performance (resolved 6.0.0). Its hook and Metro host wiring were not found in the inspected app files. Official releases now include Rozenite 2.2.0, but no upgrade is authorized or performed merely to activate a panel. First determine compatibility and incremental value versus existing React Native DevTools, Observe and Argent. [Version-tagged release history](https://github.com/callstackincubator/rozenite/releases/tag/v1.13.0).

Fresh entry gate on this continuation: ALL_PASS=0, two existing stability scenarios exceeded the unchanged 5000ms timeout while Metro was cold-starting (high heatSoak seed 2: 5730ms; high sun seed 1: 5080ms). No control assertion failure was reported. Preserve reports/startup-verger-entry-gate-20261027.log. Diagnose the named cases and host contention before any Verger changes; do not raise timeout/bounds or replace this failure with a rerun. Prior green evidence remains historical.

The initial recorder attempt rejected a Windows path because Argent runs in WSL; the same worktree's /mnt/c path resolved correctly. The resulting startup-world-welcome-sandbox-20261027 flow contains only echo/launch and is incomplete: Brave's documentation page was foreground, not an asserted app destination. It is not a passing journey. Naveen then identified the page as the requested tooling reference and explicitly authorized taking device control after recording/analyzing it.

## First live walkthrough and host failure

Physical A52/API 34, isolated v2 client: Welcome → Explore as Guest → onboarding name → dev::sandbox → Continue → Sandbox Console. Destination waits succeeded. The 11-step live recording is `.argent/flows/welcome-to-sandbox-v2-20261027.yaml`. It is a fragment requiring English Welcome, a non-authenticated state, connected Metro and closed tooling overlays. It has not yet been polished/replayed, so it is not a completed repeatability acceptance artifact. No Fast-Track Profile action was submitted in this recording.

React/Hermes profiling started at 2026-10-27T06:30:25.465Z with a 1000µs sampling interval, Hermes 260318099.0.4, bridgeless architecture. Native profiling failed both autodetection and explicit app_process because Argent's package enumeration omits --user 0 and Samsung's user 150 denies shell access. A later native pass must use a verified user-0-compatible capture path; no native profile was collected.

Profiler stop failed saving `/tmp/argent-profiler-cwd` with EIO. Status confirmed profiling stopped; CPU-query recovery found no stored profile. This run supplies UI journey observations only, not an analyzable performance profile or latency baseline. The diagnostic was not silently counted as successful.

At the same time, WSL package installation failed with a read-only store-operation lock and Linux df/findmnt returned Input/output error. Windows C: had approximately 1.1GB free; D: 5.2GB, E: 33.2GB and G: 20.8GB were available. Low host space is a concern, not an established cause of the Linux filesystem fault. Do not keep writing/building in the affected Linux filesystem or restart the distro without accounting for other active sessions.

The matched v1 source was staged at `/home/nsk/projects/verger-v2-verification-20261027/client-v1` from the same client source, with only the baseline binding/Gradle/discovery files restored, candidate-only binding tests excluded and verification package suffix vergerv1. Offline install found a missing package-store snapshot; online retry hit the read-only error. There is no v1 APK or accepted v1/v2 performance comparison yet. Candidate v2 and original app data remain intact.

The two named timed-out stability scenarios passed a diagnostic-only selected run (2 exercised, 37 filtered out, unchanged test limits); log reports/startup-verger-timeout-diagnostic-20261027.log. That does not replace the ALL_PASS=0 full-gate result. Recheck the unchanged complete gate after the host is stable and no heavy cold bundle/build competes for resources.

Recovery preparation: moved only this task's generated Windows temporary APK and bundle to `E:/CodexArtifacts/verger-20261027/` to preserve them while freeing C: space. Original filenames are unchanged. The previous Windows temporary APK path in the migration record is historical; the Linux artifact remains at its recorded build path. No user files, app data or dependency versions were removed. Distro restart approval is pending because it stops unrelated Linux sessions as well as Argent. The Windows Metro process and worktree are separate from that restart.

Naveen subsequently requested local commits of all task changes using --no-verify before restart. The Windows worktree can be committed; this is a preservation checkpoint, not migration acceptance, and the current full Verger gate is still ALL_PASS=0 due to the two recorded timeouts. WSL Git status through the Windows share could not open the Linux repository: filesystem I/O errors prevent treating it as a readable Git checkout. The readable-home copy reports ERROR 1117 on multiple directories. Thus neither that copy nor the Windows commit may be described as a complete Ubuntu backup. No Linux directory was moved, deleted, reset or cleaned, and no distro restart has occurred at this checkpoint.

Backup locations: `E:/CodexArtifacts/ubuntu-recovery-20261027/` contains the Windows candidate patch/status, Git history bundle and readable-home-copy log/destination. Generated APK/bundle remain under `E:/CodexArtifacts/verger-20261027/`. Ubuntu's original ext4.vhdx is approximately 94.6GB logical size; none of the inspected drives has that much free space for a straightforward full image copy. Full image/export/recovery options must be assessed without claiming unreadable files are secured.
