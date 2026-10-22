---
title: "Runtime Performance Reconciliation and Next Steps"
status: "active"
created: 2026-10-22
updated: 2026-10-22
author: "Codex"
tags: [mobile, performance, runtime, evidence, plan]
---

# Runtime Performance Reconciliation and Next Steps

## Purpose and authority

This note reconciles the runtime adaptation and performance documents with the
current implementation and this session's device evidence. The app-specific
[performance engineering execution plan](2026-10-19-performance-engineering-execution-plan.md)
remains the execution authority for measurement order and release evidence.
The [runtime adaptation design](../architecture/2026-10-19-runtime-adaptation-design.md)
describes the current narrow pilot and future design options. The broader
[`docs/engineering/runtime-performance/README.md`](../../../../docs/engineering/runtime-performance/README.md),
governor spec, and older intent-vs-reality audit are design/research material;
their proposed behavior must not be reported as shipped.

## Implemented and evidenced

- `packages/core/src/efficiency/workAdmission.ts` has a pure admission reducer
  and resolver. It tracks RAM-capacity-known, journey phase, app state, pressure
  and observation time; it ignores stale observations and holds optional
  concurrency to one. It is not a sensor or queue.
- `apps/gurudevi-mobile/src/boot/OptionalStartupServices.tsx` uses that contract
  for two optional startup tasks: background-sync registration and optional
  Google sign-in configuration. `SessionRouteGate` supplies the actual
  `public-ready` or `protected-ready` phase while admitted route content is
  rendered; the service then waits for a frame and JS idle callback,
  consults battery saver/AppState and cancels queued frame/idle callbacks on
  cleanup. The lane's `settled` value is not product-screen readiness.
- `apps/gurudevi-mobile/modules/runtime-pressure` is an Android Expo local
  module. It exposes event-driven thermal status on API 29+ and running-memory
  trim callbacks only before API 34. Android 14+ does not deliver the running
  trim levels, so memory pressure remains `unknown` there. The A52 on API 34
  can provide thermal status but not that foreground memory signal.
- The mobile optional-startup owner combines native signals conservatively,
  closes optional admission for constrained/severe pressure and battery saver,
  and returns a quiet pressure latch to `unknown` after 30 seconds. It never
  reports recovery as normal when the memory source is unknown. Required,
  authenticated, durable and user-triggered work does not use this lane.
- `runtime_conditions_changed` records deduplicated coarse snapshots when app
  state, battery saver, memory or thermal pressure changes. Admission decisions
  are emitted when the optional startup scheduler checks a job; completed-job
  events cover only the two optional warmups (background-sync registration and
  Google sign-in configuration). `SessionRouteGate` supplies the actual
  `public-ready` or `protected-ready` phase; the frame/idle callback only delays
  dispatch. Admission events include phase, known-capacity bit, pressure,
  battery saver, concurrency cap, allow/deny outcome and reason. Events are
  deduplicated; job times
  are finite duration buckets. All three event types share a 64-attempt process
  cap. `app/_layout.tsx` configures Observe at a 20% sample rate by default
  (100% only for the performance environment) and disables dispatch in debug.
  This is not an app-wide usage/activity stream, a record of every resource or
  user action, or proof of backend telemetry delivery.
- Native thermal status is event-driven and updates admission state for any
  optional warmup that has not started yet. The lane does not cancel in-flight
  work, manage other producers, or continuously measure app responsiveness.
- `apps/gurudevi-mobile/src/boot/startupTelemetry.ts` keeps the bounded,
  fixed-field `startup_stage` Observe events for the five essential startup
  stages. Development builds additionally emit exact per-stage elapsed
  milliseconds, deferred startup-task spans, admission/optional-queue events,
  and authenticated outbox drain/item states as JSON lines prefixed
  `[runtime-trace]`; events include fixed task or registered mutation type,
  queue depth, wait, duration, failure and skip/defer decisions. This is still JS elapsed time, not
  thread CPU attribution, TTID, TTFD or interaction-ready evidence. The local
  stream is capped at 65,536 events per JS process and warns when truncated.
  It also measures admission evaluation, synchronous Observe call time, and
  previous trace serialization/console-call cost (one-event lag; no Metro
  transport timing).
- Expo Observe interactive markers exist at `app/welcome.tsx` and
  `app/(tabs)/self/index.tsx`. The older audit correctly identifies missing
  teacher-route coverage, but any exact route-count assertion should be
  refreshed against source before reuse.
- `packages/platform-mcp/src/services/deviceProfileCapture.ts` and
  `DeviceService` capture a fixed read-only ADB profile: device/build identity,
  CPU and memory context, display/features, battery/thermal state, system CPU
  and disk snapshots, app package/PID/memory/graphics frame stats, and all
  currently readable logcat circular buffers. Logcat is a one-time `-d`
  snapshot with a 64 MiB command-output cap, not a continuous/unlimited stream.
  Outputs are saved as files and in local SQLite at
  `reports/mobile-performance/device-profiles.sqlite`; serials, email-shaped
  strings and common credential-shaped values are redacted. Logs may still
  contain other user or app content. Capture is read-only and does not launch,
  install, reset or clear app data.
- `sovereign_device` exposes `capabilities`, `list_android_devices`,
  `capture_profile`, `profile_history` and `profile_comparison`. Captures accept
  a scenario `label` and a `profileName` (for example `baseline`,
  `thermal-stress`, or `low-memory`) so repeated conditions can be compared
  within one hashed device alias and grouped across devices. The comparison
  view reports sample count and min/mean/max PSS, mean RSS and system available
  memory; it does not normalize away differences in build, workload or run
  conditions. The database is local plaintext and is git-ignored.
- The host profile store now projects fixed-field `[runtime-trace]` records
  found in captured logcat into `device_profile_trace_events`, keyed by
  capture ID and development JS-process session token, while retaining the
  redacted raw logcat output. Every process marks its first trace event, which
  separates launches found together in the circular buffer. It accepts only
  known trace categories, finite bounded scalar fields and up to 65,536 events
  per capture; unknown/malformed records remain raw only. Schema initialization
  upgrades existing databases additively to user_version 3. The
  `profile_trace_events` action retrieves a bounded capture's events. Schema
  initialization upgrades existing databases additively to user_version 2.
  Event `at_ms` remains process-relative; the process token does not identify
  a specific touch or workload journey. Buffer snapshots may include earlier
  sessions, so capture association is observational, not causal.
- Connected-device impact is viable to capture in layers. Already-recorded
  command start/end times and output sizes expose ADB/Perfetto collection cost;
  app trace fields include synchronous trace-writer, Observe-call, admission,
  and native-pressure callback processing time; Perfetto and before/after
  system/app snapshots add device-level context. None isolates a governor's
  causal effect on a touch. For that, pair same-artifact journeys with matched
  trace-on/trace-off runs, explicitly record observer tools enabled, and add a
  bounded journey-level session marker plus validated monotonic clock
  correlation before asserting an event-to-touch relationship. See the runtime-adaptation design
  section “Connected-device and observer impact.”
- The SQLite store was seeded from four already-existing A52 manifests (44
  command-output rows) so history is immediately queryable. These historical
  captures predate all-buffer logcat capture; their absence of a logcat row is
  not evidence of an empty device log. They are all development-build samples
  from one physical device and are not a cross-device or release comparison.
- A read-only snapshot was captured on 2026-10-22 at
  [`reports/mobile-performance/2026-10-22T05-24-53-134Z-b7cd1532`](../../../../reports/mobile-performance/2026-10-22T05-24-53-134Z-b7cd1532/manifest.json).
  All 11 ADB reads completed. Device: Samsung SM-A525F, Android API 34, SoC
  SM7125, 7,668,940 KiB total and 2,655,272 KiB available system memory,
  eight online CPUs, swap 8,388,604 KiB total / 6,898,340 KiB free. App
  `app.gurudevi.sanctuary.dev`: PSS 1,958,141 KiB, RSS 2,049,052 KiB,
  swap PSS 50 KiB, debuggable true, profileable false. The package is running
  as a development build. This single point-in-time snapshot is G5 observational
  evidence only; it does not establish a leak, peak, release cost, or trend.
- Earlier 2026-10-19 A52 development snapshots and a bounded Perfetto trace are
  recorded in the execution plan and their original manifests. They are not a
  comparable before/after set. The trace file size does not prove trace duration.
- A prior development session reached Profile as an anonymous explorer on Metro
  8082. In the current session, the newly installed APK attached to Metro 8081
  and reached the Library tab. Neither session had an authenticated teacher
  journey, and production-like telemetry delivery remains unproven.
- This continuation rechecked the live setup: no Metro listener is active on
  8081/8082 and the required Supabase runtime variables are absent in both
  Windows and WSL. The standard Doppler runner has no configured token. Thus
  no current app JS bundle or live governor trace could be collected. The
  latest A52 SQLite profile is still a Dev Launcher/system snapshot, not a
  measurement of this governor build. Do not interpret the new trace-query
  path or G1 contract evidence as G5 runtime proof.

## Not implemented or not yet proven

- No generic runtime governor/facade at `@repo/core/governor`, general-purpose
  prioritized job queue, demand ordering, cross-producer admission integration,
  or policy-driven cancellation of already-running optional jobs.
- No validated foreground memory-pressure signal exists on Android 14+; it
  remains unknown by design. No thermal/memory pressure event has yet been
  induced or observed on the A52, and no pressurized admission transition has
  been verified on a physical device. Do not use RAM totals as free memory or
  CPU capacity.
- No evidence justifies increasing the one-job concurrency ceiling. The
  governor spec's concurrency-two table and `freeMemoryBytes` snapshot are
  proposals, not current contracts.
- No custom Nitro performance module, high-frequency JSI sensor, owned OTLP
  collector, or CI release TTI/memory regression gate is implemented by the
  runtime pilot. Nanosecond/sub-microsecond and fixed bridge-cost claims in
  broad runtime documents are not measurements for this app and must not be
  treated as acceptance evidence.
- No repeated release-like benchmark, primary 2–3 GB physical-device evidence,
  comparable five-run journey set, validated Argent journey, or measured
  teacher interaction baseline is available in this record. The current
  development APK is debuggable and not shell-profileable, so it cannot serve
  as the release-like native profiling baseline.
- No performance improvement is claimed. Historical Wellbeing/
  `ActiveSubTabStrip` crash reporting remains an item to re-check before a
  benchmark journey; this session did not reproduce or resolve it.

## Implementation and verification update (2026-10-22)

- Core reducer G1 / Vitest: `workAdmission.test.ts`, 11/11 passed. This verifies
  boot denial, route-owned public/protected readiness, pressure hysteresis,
  background handling and stale observations under test inputs, not Android
  signal delivery.
- Mobile G1 / Vitest: `optionalStartupWork.test.ts`,
  `runtimeGovernorTelemetry.test.ts`, and `SessionRouteGate.test.tsx`, 22/22
  passed. This covers route-phase ownership, one-at-a-time/cancellation, and
  bounded low-cardinality telemetry fields under mocks.
- Mobile G0 / TypeScript build: exits 1 on existing classroom, admin, fixture,
  provider and test typing errors. The latest run emitted no diagnostics in the
  changed governor, route-gate or telemetry files; this is not a clean app-wide
  typecheck.
- Android G4 / WSL2 Gradle arm64 debug build: `:app:assembleDebug` succeeded,
  including Kotlin compilation of `gurudevi-runtime-pressure`. The build wrapper
  had a false-negative artifact path check; it was corrected and the final
  wrapper run copied/verified the artifact. APK SHA-256:
  `42eff304c3dfd52c2026c12bbc1652dc9af2ce58fdde024cb46a2188c3073179`
  (321,955,154 bytes; debug/development build).
- G5 installation and connection: `adb install -r` succeeded on Samsung
  SM-A525F/API34 and preserved app data. The ADB server was recovered after
  stale local clients hung; no app data clear or uninstall occurred. The
  development client connected to Doppler-backed Metro on 8081 after entering
  `127.0.0.1:8081` (the launcher prepends `http://`; entering a full URL caused
  `Invalid URL port: "8081http:"`). The app reached the Library tab as an
  anonymous user; the screen reported contributions unavailable and no FAB was
  exposed, so its action path could not be tapped. Native pressure runtime,
  telemetry dispatch and post-change profile remain unverified. No thermal
  override or destructive memory stress was attempted.
- The React Profiler captured 107.6 seconds on the development app with
  9,897 samples and 21,631 fiber renders. Its large per-commit times include
  development/profiler overhead; use the QR/SVG tree as a lead for a separate
  controlled profile, not as a production cost or a touch-latency result.
- Platform MCP G1 / Vitest: `deviceProfileCapture.test.ts` and
  `deviceProfileStore.test.ts`, 12/12 passed. This covers command construction,
  output redaction, metric parsing, SQLite persistence, and comparison
  grouping under mocked ADB; it does not prove live ADB capture or device
  equivalence. Platform MCP G0 / TypeScript `tsc --noEmit` completed without
  diagnostics for that package.

## Reconciliation decisions

1. Follow the app-specific execution plan's sequence: evidence and usable
   journey first, measured code changes next. Treat the older “approved
   governor” spec and runtime audit as unvalidated proposals where they conflict
   with that sequence or with the implementation-grounded runtime design.
2. Keep the existing `@repo/core/efficiency`, `RealityProvider`, startup owners,
   and Observe integration as the current seams. Do not add a parallel governor,
   profiler, scheduler, telemetry backend, or native sensing package without a
   measured need and a bounded design decision.
3. Preserve unknown values as unknown. A52's total RAM is device context; the
   2026-10-22 available-memory value is a single transient reading and is not a
   stable app budget. No polling loop or synthetic benchmark belongs in startup.
4. Keep the current profile capture as an observation. Do not clear app data,
   delete queues, reinstall, or rebuild as routine measurement setup. Any such
   intervention needs an experiment question and restoration procedure.

## Ordered plan

| Order | Work | Evidence/deliverable | Exit condition |
| --- | --- | --- | --- |
| 1 | Refresh the source-of-truth map | This note plus links from the active execution plan; identify stale claims in the broad suite | Later docs cite implemented behavior separately from proposals; route claims are source-checked |
| 2 | Finish the observational capture foundation | Existing ADB snapshot + manifest/parser fixtures; inspect partial captures and redaction behavior | A real capture is repeatable, bounded, and parser behavior is covered at G1; do not claim overall G5 performance pass |
| 3 | Obtain a usable release-like performance artifact | Existing performance EAS artifact status, exact binary identity and observed manifest flags | Non-debuggable/profileable status and source identity verified; no new build unless separately authorized through the Android build workflow |
| 4 | Validate one non-sensitive end-to-end journey | Repair/verify the Argent flow; record route, app artifact, state/cache/network conditions and endpoint | Journey reaches named user-visible endpoint with checks readable; tool elapsed time is not treated as input latency |
| 5 | Build a repeatable baseline | Five comparable runs initially; startup stages, route readiness, PSS/RSS/swap and appropriate JS/native traces | Same device/artifact/journey/conditions; report raw values, median/range and N; no P95 claim from N=5 |
| 6 | Rank and change one measured hotspot | Choose one import/startup, subscription, DB, media/list, or optional-work hypothesis based on the baseline | Correctness, offline/auth behavior, memory, energy, startup and resume compared before/after; retain or revert from evidence |
| 7 | Revisit runtime adaptation only if evidence calls for it | Design proposal for actual pressure signals and job ownership, reusing existing boundaries | Unknown semantics, lifecycle owner, cancellation, durable-work priority and recovery tested before widening rollout; native work follows cautious protocol |
| 8 | Verify the target cohort and report limits | Repeat same journey on available 2–3 GB physical Android and richer reference when available | G0–G5 claims precisely scoped; production/R1 claims require separate production evidence and authorization |

## Evidence handling and immediate next actions

- A newer continuation on 2026-10-22 confirmed the physical Samsung SM-A525F
  (API 34, serial redacted in saved artifacts) through both host ADB and
  Argent. The already-installed `app.gurudevi.sanctuary.dev` package was
  updated with `adb install -r`; app data was preserved. No uninstall, cache
  clear, or app-data reset occurred.
- The WSL arm64 debug build used the existing generated Android project and
  invoked `:app:assembleDebug` directly (2m05s, 1,381 tasks; 53 executed and
  1,328 up-to-date). It discovered and compiled the `gurudevi-runtime-pressure`
  module. APK SHA-256:
  `a6e692ac74072b6fd66d62832c290aed046fce18189a64967ccb38f19eba9373`
  (321,955,154 bytes). This was G4 debug-build evidence, not release-like
  performance evidence.
- The installed app opened to Expo Dev Launcher and showed a saved
  `127.0.0.1:8082` server entry. No process was listening on 8081 or 8082 on
  Windows or WSL. The standard Doppler runner refused to start because this
  environment has no Doppler token. A direct Metro attempt correctly failed
  `metro.config.js` validation because `EXPO_PUBLIC_SUPABASE_URL` and
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` were unavailable. Therefore the
  Gurudevi JS bundle never loaded; there is no new G5 governor, touch/FAB,
  telemetry-delivery, or authenticated journey evidence from this attempt.
- A read-only, SQLite-stored ADB/Perfetto profile was captured while the
  development client was on the Expo Dev Launcher, labelled
  `dev-launcher-metro-config-blocked`:
  [`manifest.json`](../../../../reports/mobile-performance/2026-10-22T07-07-10-026Z-c9480243/manifest.json).
  It ran 2026-10-22 07:07:10–07:07:24 UTC, stored all 11 fixed ADB reads, a
  44,741,206-byte all-readable-buffer logcat snapshot, and an 8,344,543-byte
  Perfetto trace request (15 seconds requested; inspect trace timestamps for
  actual captured span). The DB row is in
  `reports/mobile-performance/device-profiles.sqlite`. It observed 7.31 GiB
  physical RAM, 4,011 MiB system-available memory, and 239 MiB app PSS / 316 MiB
  RSS for the development package while its launcher was foreground. These
  are launcher/config-blocked observations, not app-startup, governor, or
  interaction costs. The development package is debuggable and not
  profileable.
- Focused mobile G1/Vitest verification after adding native-pressure snapshot
  and callback timing: 6 files, 32/32 passed. This proves the named contracts
  under test substitutions; it does not prove native callback delivery or
  real-device timing. `git diff --check` passed with an existing CRLF warning
  in an unrelated web file.
- The next device step is to restore the repository's Doppler-backed Metro
  environment, then capture a cold start, named screen interactions including
  the FAB, and telemetry/logcat plus native trace on the same artifact. Keep
  this launcher-only profile as setup evidence, not a baseline. For device
  comparisons, use the existing profile store with identical build, journey,
  workload, charge, network and thermal conditions; the second connected
  device is not currently available.
- When additional devices are available, run `sovereign_device` with action
  `capabilities`, then `list_android_devices`, and capture each device with the
  same app artifact, scenario label and workload while varying `profileName`.
  Query `profile_history` for raw run rows and `profile_comparison` for grouped
  summaries. Preserve one run per changed condition; record workload,
  charging, thermal/network/cache state and exact build identity in the
  label/adjacent run notes. Do not claim a comparative result from unlike
  conditions or a single sample.

