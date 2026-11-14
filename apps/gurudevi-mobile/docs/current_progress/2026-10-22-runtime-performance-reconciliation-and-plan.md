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
  capture ID, development JS-process session token and per-session event index,
  while retaining the
  redacted raw logcat output. Every process marks its first trace event, which
  separates launches found together in the circular buffer. It accepts only
  known trace categories, finite bounded scalar fields and up to 65,536 events
  per capture; unknown/malformed records remain raw only. Schema initialization
  upgrades existing databases to user_version 5 and rebuilds trace projections
  from retained logcat when upgrading from the capture/index-only key. The
  `profile_trace_events` action retrieves a bounded capture's events.
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

## Windows A52 trace integration update (2026-10-22)

- Fixed the source-to-store gap: development `[runtime-trace]` records now carry
  process-relative `at_ms`, `wall_time_ms`, a `time_origin_ms` correlation
  anchor, session token and event index. Only fixed low-cardinality fields are
  serialized. Pretty console duplication is suppressed while the in-memory
  development telemetry buffer still receives records.
- Added committed route buckets and development React Native Event Timing
  capture for touch start/end. The device trace records duration, input delay,
  JS processing duration and presentation delay without retaining view IDs or
  user-entered text. This requires runtime support and a development build; it
  does not attribute a touch to a specific component or measure semantic task
  completion. Development Event Timing is capped at 2,048 records per JS
  process.
- Extended the fixed-field SQLite projection with interaction timing and
  wall-clock anchors using additive schema migration (user_version 5). Trace
  rows are keyed by capture, JS session and per-session event index. Migration
  reparses retained logcat to recover session records previously hidden by the
  old capture/index-only key; raw redacted output remains the source of truth.
  parser retains raw redacted logcat while excluding unapproved JSON fields.
- Windows G5 snapshot/trace: capture
  `2026-10-22T12-46-04-771Z-8969c10f` (`verger-live-touch`) is stored in
  `reports/mobile-performance/device-profiles.sqlite` and its artifact folder.
  All 26 read commands and the 15-second requested Perfetto scheduler trace
  completed; Perfetto artifact is 6,145,249 bytes and cleanup succeeded. The
  A52 (SM-A525F, API 34, dev build) snapshot reported app PSS 1,946,166 KiB,
  RSS 2,044,808 KiB and system available memory 2,398,356 KiB. These are one
  development-build point-in-time sample, not a leak or release baseline.
- The first capture's legacy rows were rebuilt from raw logcat: all 278 events
  across nine JS sessions are now projected instead of the 58 that survived
  the old key. A follow-up snapshot
  `2026-10-22T12-53-09-388Z-4de0acb0` is complete and contains 376 events across
  11 JS sessions, including eight Event Timing records. Live taps reached
  Library, Self and Profile. The Library FAB was registered and visible; its
  add action is permission-gated and reports contributions unavailable for the
  anonymous account. After adding route matching to the shell, the stale
  Library FAB disappeared on Profile while Profile remained usable. The
  circular logcat snapshot contains multiple JS sessions and prior routes, so
  capture ID is a collection batch, not a causal journey ID. No route target or
  account content was captured.
  The mounted observer's own trace-write cost is included in the stream and
  can perturb development measurements.
- The previous “no current Metro” note above describes an earlier check. During
  this update the Windows Metro listener on 8082 (PID 15832) served the A52;
  the source JS reload emitted startup and route records. Port 8081 remained
  untouched.
- FAB source check: `FABProvider` defaults to `visible: false`; the mobile
  shell mounts `LotusPetalFAB`; route screens in shared packages register
  actions, but Expo tab screens can stay mounted after losing focus. The shell
  now passes the active route tab and the FAB hides when that does not match
  its registration. This fixed a stale Library FAB appearing on Profile.
  Library's add handler still correctly shows the permission restriction for
  the anonymous account; authenticated role-specific actions remain
  unverified.
- `LivingJourneyPanel` now reports a failed growth-journey fetch as a warning
  while keeping its existing fallback. G5 has not yet confirmed this change:
  the log showing the old `console.error` was from the bundle served before a
  fresh Metro restart. A later fresh bundle was loaded below; its Profile route
  reached the loading skeleton, but the API failure message was not captured
  from that route. Do not claim the development error overlay is fixed until
  the new bundle visibly emits the warning and leaves the app interactive.

### Fresh Windows Metro and route check (18:34–18:36 local)

- Restarted only the Gurudevi Metro listener on port 8082 after edits in shared
  packages; port 8081 was left untouched. Metro successfully loaded the
  Doppler-backed environment and served a cold-cache Android bundle in
  92,396 ms for 7,581 modules. The delay is Metro graph compilation, not ADB
  transfer latency. Subsequent entry bundle update completed in 73 ms.
- On the newly served bundle, ADB reached the Profile route and emitted a
  committed `profile` route trace. The screenshot showed the Profile loading
  skeleton with no Library books FAB; the screenshot was taken before profile
  content finished loading, so this proves route-level FAB hiding only.
- The Library route then reached its settled fallback: public collections
  returned an unavailable state with a Retry action and the personal library
  remained available. The Library books FAB appeared on that route. Its
  anonymous-account add action remains permission-gated. This confirms the
  route-scoped FAB behavior on the fresh shared-package bundle, while the
  earlier follow-up screenshot had been served before Metro restarted.
- Assistant Menu controls were enabled in Android and appear as grey floating
  overlays in the screenshots; they are OS controls, not app FABs. Screenshots
  are stored beside the capture artifacts in
  `reports/device-runs/2026-10-22-verger-live/`.
- The profile journey's API 503/warning behavior remains unverified against
  this fresh bundle. The captured Library fallback shows its own public
  collection failure handling, not the Profile journey request.
- Focused G1 verification: `deviceProfileStore.test.ts` 4/4, mobile
  `startupTelemetry.test.ts` 3/3 and core `workAdmission.test.ts` 11/11 passed.
  Package G0 type checks for `@repo/platform-mcp`, `@repo/profile` and
  `@repo/ui` each reported zero findings. Targeted Biome check still reports
  the pre-existing formatting in `LotusPetalFAB.tsx` gesture callbacks outside
  this change; no formatter rewrite was applied. Workspace-wide `git diff
  --check` reports pre-existing blank-line-at-EOF findings in other dirty
  files, so those were left untouched.

### Governor contract and A52 reconnection check (18:40–18:47 local)

- ADB server recovery restored the Samsung A52 without changing app data. The
  Android thermal service reported status `0` (normal) in this snapshot. That
  is one native device reading and does not prove thermal listener delivery or
  pressure transitions.
- Gurudevi Metro is listening on Windows port 8082; port 8081 belongs to the
  separate Feedora process and was left untouched. The dev launcher had lost
  its recent server entry after app force-stop. An ADB reverse for 8082 and an
  explicit `127.0.0.1:8082` connection moved the launcher to a blank app
  surface, but the app emitted no React Native startup traces and Metro showed
  no bundle compilation during the bounded observation. Therefore no fresh
  governor or interaction G5 claim is made from this reconnect attempt.
- The focused governor contracts now pass 27/27: optional startup scheduling,
  runtime-pressure recovery, bounded Observe telemetry and SessionRouteGate.
  Updated the telemetry assertion to expect both the human-readable governor
  line and its JSON overhead trace; added a route-bucket privacy assertion so
  dynamic route identifiers are not recorded. These are G1 contracts only.
- No configuration A/B experiment was run in this continuation. The next
  device step is to resolve why the Dev Client shows a blank surface despite
  an active 8082 listener, then repeat the same A52 route/touch/profile
  journey and capture its fresh trace before any stress or policy comparison.

### Remaining evidence gaps

- No dedicated journey-start/end ID yet connects the physical app-icon tap,
  launch intent, JS session, individual interaction and host capture. The
  existing wall/monotonic anchor supports clock conversion but does not prove
  the clocks are stable through device sleep or wall-clock changes.
- `capture_profile` snapshots the logcat buffers before starting its optional
  Perfetto interval. It is not a single synchronized continuous journey
  recorder. A next additive step is an explicit bounded capture session that
  records host start/end, device boot-time anchors and app process identity,
  streams logs during user-guided launch/touch, and writes the same redacted
  artifacts and profile rows.
- No controlled low-memory/thermal stress, authenticated profiles, other
  devices, repeated cold-start set, trace-off comparison, or statistical
  touch-latency baseline was run. The Perfetto scheduler trace is not CPU
  sampling or JS stack profiling.

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

### A52 current bundle-reload check (18:51–18:55 local)

- Rechecked the live Windows ADB device `R58T33Y0E3M` (SM-A525F, API 34),
  foreground package `app.gurudevi.sanctuary.dev`, and Gurudevi Metro PID 29568
  on 8082. The unrelated 8081 listener was left untouched. ADB reverse reports
  `tcp:8082 tcp:8082`.
- Metro `/status` and `/manifest?platform=android&dev=true&hot=false&lazy=true`
  both returned HTTP 200. The manifest points to
  `/apps/gurudevi-mobile/index.ts.bundle`.
- The installed Expo launcher and React Native dev menus are responsive. One
  launcher Reload and one React Native dev-menu Reload both returned to the same
  white app surface. The foreground activity remained `MainActivity`; the
  screenshot and UI hierarchy are saved as `reports/device-runs/2026-10-22-verger-live/after-rn-reload.png`
  and `after-rn-reload.xml`.
- The app-PID log has no `ReactNativeJS` startup trace. It does contain repeated
  React Native soft exceptions from `ReactHost.onWindowFocusChange` stating
  that the context is not ready. This confirms the JS host had not become ready
  at those focus events, but does not prove whether bundle delivery, Hermes
  initialization, or an earlier launch stage caused it. The full current
  PID-scoped log is saved as
  `reports/device-runs/2026-10-22-verger-live/a52-app-pid-18711-current-logcat.txt`.
- No config A/B, app-data clear, reinstall, or build was performed. Next
  diagnose bundle delivery/execution from the device request and Metro-side
  evidence before attempting app-level interaction or governor stress. The
  current state still provides no fresh G5 route, FAB, touch, profile, or
  governor-pressure evidence.
- Current focused contract checks: `@repo/core` `workAdmission.test.ts` 11/11,
  and mobile optional-startup, pressure-recovery, and governor-telemetry suites
  11/11 across three files (G1 Vitest; substituted native/runtime boundaries).
  These cover reducer recovery and telemetry contracts, not A52 execution.

### Forensic synthesis of the saved A52 run (2026-10-22)

- The app **did run** in the earlier measured session. PID `12864` logged
  `Running "main"`, `SessionRouteGate` decisions, route transitions and
  `[runtime-trace]` records. The later Metro/Dev Launcher attempt used PID
  `18711` and is a separate launch attempt. The failed later reload must not be
  used to erase the earlier G5 app-run evidence.
- Two same-process profile snapshots exist for the A52 development build
  (`SM-A525F`, API 34, SoC `SM7125`):
  `2026-10-22T12-46-04-771Z-8969c10f` (18:16 UTC+05:30) and
  `2026-10-22T12-53-09-388Z-4de0acb0` (18:23 UTC+05:30). Both are stored in
  `reports/mobile-performance/device-profiles.sqlite`. App PSS rose from
  1,946,166 KiB to 2,158,742 KiB (+212,576 KiB); RSS rose from 2,044,808 KiB
  to 2,257,456 KiB; native-heap PSS rose from 1,459,813 KiB to 1,648,749 KiB.
  System-available RAM fell from 2,398,356 KiB to 2,159,896 KiB. This is a
  serious same-process growth signal over seven minutes, but two snapshots of
  a debuggable build do not identify an allocator or prove a leak. Heap/Perfetto
  allocation attribution and comparable repeated samples are still required.
- The captured `cpuStats` reports the app at 82% CPU (73% user, 8.3% kernel)
  over 18:13:22–18:18:22 local device time. It is a process-level interval
  report, not per-thread CPU attribution. The first snapshot includes a
  15.8-second Perfetto scheduler trace (6,145,249 bytes); this trace is not CPU
  sampling, JS stacks, or allocation profiling. The second snapshot requested
  no native trace.
- Android graphics counters are cumulative since their own `Stats since`
  point, not isolated to a tap or the profile capture. The standard janky-frame
  ratio moved from 3.46% (628/18,167) to 3.11% (847/27,278); p95 stayed 36 ms
  and p99 stayed 77 ms. Legacy jank is reported separately at 66.54% and
  53.89%, so it cannot be combined with the standard ratio. Individual
  `Choreographer`/`OpenGLRenderer` entries include 31–85 skipped frames and
  944–1,475 ms slow frames during loading/navigation. They confirm visible
  stalls occurred, but do not attribute them to the governor.
- The profile samples report thermal service status `0` (no throttling) and AP
  temperature 33.2°C then 39.8°C. The app governor trace reports thermal
  `normal`, memory `unknown`, battery saver off and admission allowed with an
  optional cap of one. The native module intentionally ignores Android
  `onTrimMemory` callbacks on API 34, so this run could not observe memory
  pressure transitions regardless of its high PSS. Native pressure snapshot
  requests took 3.5–4.1 seconds wall time to resolve; because the call is
  asynchronous, that duration does not prove the JS thread was blocked.
  No constrained/severe-memory or thermal-stress governor decision was tested.
- The retained raw logcat shows repeated network `503`/offline failures for
  explored features and the anonymous guest journey; Profile logged “Error
  fetching growth journey”. This is an observed backend-unavailable path, not a
  crash. The app process log contains no `FATAL EXCEPTION`, app ANR,
  `OutOfMemoryError` or native fatal-signal entry in the captured buffers.
  It also contains 78 NativeWind `className 'undefined'` remount warnings and
  11 leaked `exoplayer_internal.db` SQLite-connection warnings. Both are
  follow-up investigation leads; neither is proven to cause the memory growth
  or frame stalls.
- FAB evidence is **not conclusive**. `after-fab-touch.png` shows Samsung’s
  system Assistant Menu open over a white surface, so that action did not prove
  an in-app FAB press. `lotus-fab-pressed.png` proves the Books FAB was visible.
  The later trace records Library and Profile route commits, then generic
  `touchstart`/`touchend` events (55–117 ms); those touches carry no view/FAB
  identity, and the route commits precede them. Therefore the traces cannot
  establish that the FAB caused either route change or completed its action.
  Eight Event Timing entries average 89.4 ms (mean input delay 60.3 ms), but
  they are not eight independently identified taps or a statistical baseline.
- Both profile commands snapshot all readable circular logcat buffers rather
  than continuously recording the whole journey. Each retained logcat is about
  53.7 MB; the follow-up snapshot contains 376 trace events across 11 JS
  sessions spanning 12:40:44–12:52:05 UTC, not just its eight-second capture
  interval. The first snapshot has 278 events across nine sessions; all 278
  reappear in the follow-up. These are overlapping buffer snapshots, not 654
  independent events. The first trace is 15.8 seconds of scheduler data only.
  The manifest warns that other user content may remain in local raw system
  logs, so these files and the SQLite store should stay local unless redacted
  for sharing.
- The later PID `18711` log establishes one narrow cause: at 18:41:34 it could
  not reach `127.0.0.1:8082`; the packager-status request failed at 18:41:36
  and script loading failed at 18:41:37. That sequence precedes the later ADB
  reverse mapping. Subsequent evidence confirmed the 8082 reverse and TCP
  reachability, but the saved logs still show no React Native JS startup for
  that later attempt. Its remaining cause is unresolved; it does not change
  the earlier successful PID `12864` session.
- Forensic review found that the SQLite projection dropped allowed decision
  fields even when emitted in the JSON trace. The v7 projection now preserves
  bounded phase/app-state/pressure/reason strings, operation names, the
  optional cap, and capacity/battery/admission booleans. The source admission
  trace now emits the pressure bucket, capacity-known flag and effective cap;
  a new device bundle is needed to verify those fields live.
  The existing local DB was reprojected from its retained logcat; it now has
  278 and 376 events for the two captures. Legacy JSON lines never included
  the pressure/capacity/cap fields, so those values cannot be restored for the
  old run; its multiline human-readable `Governor DEV` records remain in raw
  logcat. The DB migration is additive and leaves those raw outputs intact.
- Verification: platform MCP `deviceProfileStore.test.ts` G1 boundary/Vitest,
  5/5; this covers scalar allowlisting, boolean fields, v5-to-v7 re-projection
  and SQLite persistence, not device runtime. Platform MCP G0 TypeScript check
  reported zero findings. Mobile governor G1 suites were 11/11 across three
  files. The full mobile G0 typecheck returned 32 errors in unrelated test,
  community and library files; none is reported in the edited governor or
  profile-store files. This run did not establish when those other errors were
  introduced.

