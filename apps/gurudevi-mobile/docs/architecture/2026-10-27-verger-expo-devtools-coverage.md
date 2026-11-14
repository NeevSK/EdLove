---
title: "Verger development observability coverage and local-store feasibility"
status: active
created: 2026-10-27
updated: 2026-10-28
author: Codex
tags: [verger, expo, devtools, observability, local-first]
---

# Decision

## Priority: a usable app before the microscope

**P0:** Cold and returning launches reach the correct public, guest, authenticated, or recovery
destination as applicable, load usable screen content, and complete an interaction. Essential
startup failures provide actionable recovery. Shell rendering, a route decision, or a readiness
event alone does not establish a usable journey. The previously observed onboarding screen while
route admission remained `booting` is unresolved for the current build until device evidence
shows otherwise. Instrumentation must not be a prerequisite for startup.

After P0, implement in this order: (1) capture integrity, source availability and loss, build
identity, clock correlation and original profiler artifacts; (2) a joined interaction, startup,
route, frame, CPU/thread and Verger decision timeline; (3) JS/React, memory/GC, storage, sync
and network attribution; (4) thermal, power, device context and failures; (5) specialized
profiles. Each source must disclose its actual fidelity and missing bridge. Development capture
is separate from bounded, privacy-filtered field telemetry.

“Exhaustive” means complete against the declared, enabled and supported sources and their
recorded fidelity, not omniscience: show sampling, filtered or dropped data, caps, failures,
unsupported sources and unaligned clocks. Preserve source precision without claiming an
unmeasured sampling rate.

The premise is **partly true**. Development-time observability can be brought under
one local session index and a substantial portion can be stored as structured events.
It cannot be a complete automatic ingestion of every Expo and React Native DevTools
panel: DevTools-owned CPU/React profiles, heap snapshots, and some network inspection
data are interactive profiling artifacts, not a general application subscription API.
Treat them as linked source artifacts with explicit completeness state. Do not scrape
DevTools UI or depend on its private protocol.

The practical target is a **local-first diagnostic session** joining Verger's replayable
input/decision record, app-level runtime events, supported performance observations,
and links to manually captured DevTools/native artifacts. “Exhaustive” must be scoped to
the source capabilities and session settings listed in its manifest; it cannot mean all
device activity, all requests, or all DevTools state.

## Capture contract clarified by the product requirement

- **Development sessions:** collect the highest-detail supported event stream for an
  explicitly started diagnostic session and make it queryable as rows/timeline events,
  not just a screenshot, summary, or rolling snapshot. Persist raw supported event fields,
  stable session/interaction correlation IDs, source timestamps, ordering, and loss/cap
  counters. Link original DevTools/native profile artifacts where those tools do not expose
  their data as an application event stream.
- **Real-user sessions:** use a separate bounded, privacy-filtered capture policy with
  explicit limits for fields, sampling, duration, count/bytes and retention. Never inherit
  the development capture's detail or duration. Preserve the user's consent and the existing
  production analytics/network budget.
- **Timeline precision:** store each source event's monotonic timestamp at the precision the
  source supplies, and render/query it on a millisecond or sub-millisecond axis. This does
  not mean poll every metric once per millisecond. Event-driven sources should remain
  event-driven; periodic samples need per-source cadences chosen from the native/runtime
  affordance and measured overhead. Most sources cannot report every 1 ms, and polling can
  itself create the stalls being investigated.
- **Queryable is not equivalent to exhaustive:** retain raw supported event records and
  clearly mark missing, unsupported, disabled, filtered, capped and failed sources. Do not
  call a summary, sampled stream, or DevTools screenshot a full trace.

# Grounded stack and existing work

- Mobile manifest: Expo `~58.0.17`, React Native `0.88.0`, React `19.3.1`, Expo Router
  `~58.0.25`, `expo-dev-client` `~58.0.14`, `expo-sqlite` `~58.0.13`, and
  `expo-observe` `~58.0.16`.
- `packages/verger-core` has bounded session recording (`recording()`), a flight recorder,
  outcomes and self-cost readings, but its recording is in memory and replay-oriented.
- `packages/verger-react` already observes supported `longtask` and Event Timing entries;
  the app has a development Event Timing observer and fixed-field startup/runtime traces.
- `apps/gurudevi-mobile/src/telemetry/localDevelopmentTelemetry.ts` journals sanitized
  analytics/runtime events to per-process JSONL and batches the same structured rows into
  an on-device SQLite database in development builds. It also accepts Verger events through
  the root callback. It can import a user-selected React Native DevTools Chrome trace-event
  JSON export as a separate SQLite timeline session. React Profiler profile files, heap
  snapshots, native traces and DevTools panel buffers are not ingested by that path.
- `devTelemetryCatcher` passes its attributes through the local recorder's scalar/key
  sanitizer. That deny-list and shape cap are not a source-specific typed field allowlist;
  “local-only” does not make arbitrary payload retention safe.
- `packages/platform-mcp` separately owns host-side SQLite at
  `reports/mobile-performance/device-profiles.sqlite`, with bounded device-profile and
  projected logcat trace rows. This is not the on-device diagnostic database.
- `expo-sqlite` is already a mobile dependency. The local store has indexed session/source/time
  queries and explicit removal of a stopped session plus its JSONL sidecars. SQLite still has
  no automatic global retention quota or reclamation schedule.

# Coverage map

“Available” means supported by the installed/documented runtime; “integrated” means this
repository currently routes it into Verger or a local record. Silent data is not evidence
of unsupported data. Instrumentation can be disabled, absent, capped or simply produce no
events during a session.

| Source | What can be obtained | Current repository coverage | Local ingestion path / limit |
| --- | --- | --- | --- |
| Verger sensor inputs and decisions | App event stream, snapshots, reasons, lever levels, outcomes, policy/config/activation | Integrated into Verger; bounded replay recording and flight recorder; local telemetry sink exists | Export/link `Verger.recording()` and session metadata. Preserve input event ordering and dropped count. |
| Verger self-cost | Reduction time, wakeups, events and self-budget summaries | Readable from Verger; native thread CPU is still an open item | Structured session events; values represent instrumented Verger cost, not whole-app CPU. |
| JS long tasks | Supported `PerformanceObserver` long-task entries | Observer exists in `packages/verger-react`; app trace plumbing is partial | Structured event rows with source, monotonic time, duration and supported fields; observer lifetime must follow dev session/sensor activation. |
| Input/Event Timing | Supported event name, duration, processing start/end and interaction id where exposed | Verger adapter and bounded development observer exist; fast entries can be filtered by the runtime default | Structured rows, with supported fields only. It is delayed/thresholded evidence, not a complete press lifecycle or timely presence signal. |
| App startup, route and task marks | App-owned spans, route templates, selected action/decision correlations | Startup and selected route traces exist; Router integration remains optional/proposed in the diagnostics plan | Structured event rows. Normalize route templates; never store route params. Keep source clock and session/action IDs. |
| Expo Observe | Fixed-field sampled startup/admission measurements and interactive markers | Integrated for selected events; debug dispatch disabled in existing setup; development traces are local | Reuse local development sink. Observe is a sampled production/observability mechanism, not the exhaustive dev-session recorder. |
| Expo performance monitor overlay | Displayed RAM, JS heap, view counts and UI/JS FPS | No supported programmatic ingestion found | Human comparison during a profiling run only. Do not OCR/scrape overlay. Prefer native/app-supported sensors for structured records. |
| Element inspector / touchables | Selected element, layout/style details, touchable highlighting | Developer-tool interaction only | No automatic event stream established. Use to diagnose a specific view; it is not proof of a completed action. |
| VS Code Expo Tools debugger | Inspector-protocol breakpoints, variables and debug console | No Verger ingestion; an alternative control surface for the same attached runtime | Operator-driven session only. Paused execution distorts timing; do not store evaluated locals or debugger state. |
| Rozenite plugins | Plugin panels can provide tool-specific integrations | `@rozenite/performance-monitor-plugin` is installed as a dev dependency; searched app JS/TS has no confirmed registration/wiring path | Verify actual Metro/entry registration and plugin's supported export contract before counting it as covered. Do not infer integration from package presence. |
| RN DevTools Network panel | Request metadata/timing for documented sources; RN docs list `fetch`, XHR and image, with Expo-specific coverage differences | Exported performance-trace events can be imported; standalone panel request buffers and response previews are not subscribed to | Import only the exported trace-event rows. Do not assume every Expo/native client, WebSocket, or custom transport is included; request bodies and headers require separate explicit handling. |
| RN DevTools Performance timeline | JS execution, React tracks, supported network track and custom User Timings | A selected Chrome trace-event JSON export is imported into SQLite; app long-task/Event Timing cover additional live events | Imported trace events keep their fields in a dedicated session, with microsecond `ts`/`dur` normalized to millisecond `at_ms`. Its source clock is not joined to the live session clock. |
| React Components / render highlighting | Component tree and live render visualization | DevTools only | Manual diagnostic use. No general component-tree stream should be added to runtime telemetry. |
| React Profiler exported profile | Render and commit timings/profile data | No React Profiler profile-file importer; React performance track events inside the exported performance trace are retained | Profiler profile JSON remains a separate manual artifact; do not infer it from JS long tasks. |
| JS CPU sampling | Debug-build JS CPU profile | DevTools-only profile workflow | Original DevTools profile artifact; debugger/profiler overhead and sourcemap/symbolication limitations must be declared. |
| Hermes heap / GC summaries | Selected runtime counters exposed through existing sampler when supported | Partial sampler in `packages/verger-react`; no heap snapshot/allocation stacks | Store only supported scalar samples in structured rows. Heap snapshots and allocation profiles are sensitive source artifacts, opt-in and not continuous. |
| Native/UI thread, GPU, worklet profiling | Platform-level scheduling/render evidence | Verger Android sensors cover selected frame/thread/resource readings; not a full native trace | Capture through Android Studio/Perfetto and link originals. App runtime code cannot claim exhaustive native profiling. |
| Android device profile/logcat | Read-only ADB system/app snapshots and captured log buffers | Host-side `device-profiles.sqlite` already indexes bounded profiles and trace projections | Keep as a separate host capture source linked by device/build/session IDs; logcat is a bounded snapshot and may contain user/app content. |
| Crashes and caught exceptions | DevTools pause-on-exception and existing reporting adapters | Not the same as a complete local crash journal; remote delivery has separate config/consent requirements | Add only sanitized exception metadata to a local session if explicitly enabled. Never persist locals, account payloads or secrets. |

# One-place data model

Use one session manifest/index as the source-of-truth for completeness, with separate
structured event rows and artifact references. A suggested logical shape (not yet an
approved schema):

- `diagnostic_sessions`: UUID, schema version, app/native build, RN/Expo versions, device
  alias and OS, Verger mode/policy/config hash, consent/capture flags, start/end wall and
  monotonic times, time origin, state, storage path and retention status.
- `diagnostic_sources`: session, source name, state (`unsupported`, `disabled`, `recording`,
  `complete`, `capped`, `failed`, or `silent`), options/sample rate, supported fields,
  count, filtered/dropped counts, cap/truncation reason, error code and artifact reference.
- `diagnostic_events`: session, sequence, source, event kind, monotonic timestamp, optional
  wall timestamp, bounded typed payload. Keep events append-only; do not flatten DevTools
  profiles into guessed scalar rows.
- `diagnostic_artifacts`: session, source, relative file URI, media type, byte count, hash,
  export/import time, redaction declaration and source tool/version. Preserve original trace
  files outside SQLite when that tool owns their serialization.

SQLite can index and query the structured events while app-private files hold large original
traces. “One place” means one session and query surface that links those files, not forcing
large binary profiles or sensitive heap contents into the database. If the requirement means
every artifact byte must be inside one SQLite file, that is technically possible but would
increase write amplification, backup/export size, and sensitive-data retention without
making unavailable DevTools data capturable.

# Integration order

1. Define capture sources, lifecycle, privacy and completeness states; keep normal production
   analytics separate from local detailed capture.
2. Introduce a development-only store behind the existing local telemetry seam. Use
   `expo-sqlite` with append-oriented batched inserts and migrations; preserve the existing
   JSONL export/diagnostic path until SQLite persistence and migration/continuity are proven.
3. Add one session coordinator that starts/stops app-owned observers, Verger recording,
   Event Timing, long tasks, Router marks and selected action markers; stop or flush on
   background, unmount, cap, error and explicit user stop. Keep event sources optional and
   record observer setup failures instead of silently implying coverage.
4. Create clock/build/session correlation and export a manifest plus structured rows and
   linked original files. Correlate only after validating time origin and clock drift; do not
   claim causality from wall-clock coincidence.
5. Add explicit manual import/link for RN DevTools, Perfetto and Android Studio artifacts if
   their exports do not expose a stable in-app API. Verify bytes/hashes and record artifact
   provenance; avoid modifying inspector internals.
6. Measure instrumentation-on/off overhead on the same connected-device journey. Include
   storage-full, write-failure, abrupt termination, queue overflow, cap, app background,
   privacy filtering and disabled-sensor cases before calling the local store dependable.

# Verification boundaries

G0/G1/G3 can prove schema, bounded queues, serialization, query/export behavior, and observer
lifecycle under configured substitutions. Only a connected development client can prove
native SQLite persistence and actual runtime source availability. DevTools artifact import
needs a captured export from the installed version. None of these alone proves all panels or
all request sources are covered. Device captures with DevTools attached can distort timing;
collect comparable runs with observer state explicitly recorded.

# Implemented development-session path and known gaps

Development events are stored in `gurudevi-development-telemetry.db` under the app's
private database directory. `diagnostic_sessions`, `diagnostic_events`, and
`diagnostic_sources` are indexed by session, source, timestamp and sequence. The app
diagnostics route supports session selection, source/name filters, timestamp bounds,
attribute filtering through the debugger API, cursor pagination, source completeness,
timeline display and evidence-linked findings. Findings now include an explicit coverage
limitation when the source manifest is missing or a source is disabled, unsupported,
capped or failed; silence from such a source is not presented as evidence that a threshold
was not crossed. The global
`__GURUDEVI_DEV_TELEMETRY__` debugger API exposes `sessions`, `query`, `sources`, `flush`,
`export`, `bundle`, `setSource` and sanitized `ingest` operations.

The database is an append-oriented query store, not a millisecond poller. It persists
actual source events with the source's timestamp and a sequence tie-breaker; writes are
batched on a 100 ms timer. Source timestamp precision and clock origin are not yet
normalized across JS, native and host tools. In development only, the JSONL journal remains
a parallel persistence/export fallback. A developer can explicitly remove a stopped session
and its JSONL sidecars from the diagnostics screen. The existing 32 MiB JSONL cap and
4,096-event pending queue do not impose a global SQLite retention quota; long-running
development sessions can still grow the database, and SQLite space reclamation is not
scheduled automatically.

The diagnostics screen imports React Native DevTools performance trace JSON containing a
root event array or a `traceEvents` array. It refuses oversized or partially invalid files
before writing, with 32 MiB and 50,000-event ceilings. Each `ts` and `dur` value remains in
the full imported event object; `ts` microseconds are converted to a trace-relative
millisecond timeline. Envelope metadata is a separate row. Imported sessions have their own
session id because the artifact clock has not been aligned with the app's live clock. The
import is explicit and local-only; raw trace event fields may include URLs or user values, so
developers must choose sandbox data. This path does not import React Profiler profile JSON,
heap snapshots or standalone DevTools network-panel buffers.

The real-user event path uses the existing product-analytics port and its opt-out flag.
Its shared scalar sanitizer now inspects at most 64 input keys, emits at most 32
properties, limits keys to 64 code units and strings to 120 code units, and caps the
serialized payload at 4,096 code units. Nested values, sensitive key names, non-finite
numbers and oversized strings are excluded. This bounds payload shape and size; it does
not impose an aggregate byte budget. The mobile Verger host separately caps its Verger
transport at 24 state/one-off events and four summaries per process launch, with a
15-minute summary cadence. This is a per-process event/count bound, not a daily quota or
durable consent record. A repository search found no production mobile PostHog provider
injection; the development build injects a local SQLite/JSONL port instead. Therefore
this documents the bounded Verger policy, not verified production delivery or a complete
app-wide real-user capture policy. The detailed SQLite/JSONL diagnostic path is guarded by
`__DEV__` and is not installed as a production transport.

G0 typecheck and G1 focused boundary coverage verify the app integration and event
sanitizer/dual-write fallback. The connected Samsung Galaxy A52 (Android 14 / API 34)
verified local SQLite persistence and query on session `mvqrg0nt-yr80psy9`: 48 ordered rows,
sequences 1–48, with 0 queued, dropped, or database-error events at the observed status
check. A later connected-device run after Metro reload reported 47 written events, 0 dropped,
0 pending, and null JSONL and SQLite errors in the active session status. The app reached the
developer Sandbox Console from offline arrival onboarding after the reload, confirming the
development shortcut now runs before the production online-only guard. This is G5 evidence
for app runtime capture status and sandbox navigation; the earlier 48-row database query
remains the direct query proof. It does not prove that the diagnostics route rendered.

The captured run is not a cold-start TTI benchmark. `bootstrapPlatform` took 93 ms, and a
`root` route commit occurred about 1.19 s after the first measured bootstrap event. Native
process start and first usable frame were not marked, so this interval must not be reported
as TTI. Deferred `workflow-event-bridge` and `install-referrer-resolution` work took about
5.2 s and 5.9 s after the essential startup gate. Their overlap makes them candidates for
capture-on/off investigation, not demonstrated TTI blockers. One touchend recorded about
329 ms presentation delay (23 ms input delay and 3 ms processing) in this debug run. This is
a triage sample, not a production latency estimate; the evidence alone does not justify
startup reordering or feature suppression.

## Follow-up device log audit (2026-10-27)

The connected A52 JS log registry contained 328 entries (298 log, 3 info, 23 warning,
4 error). Across recent reloads, `bootstrapPlatform` measured about 44–71 ms and its
essential siblings (`runtimeRegistration`, `loadCatalog`, `registerAppCatalog`, and
`initializeDeviceAccounts`) completed in under 9 ms apiece. `install-referrer-resolution`
completed in about 453–560 ms on the observed reloads; this work was already after the
essential gate. The log time origin persisted across reloads and was not a native process
start marker, so these measurements cannot establish cold-start TTI or justify moving
optional work yet.

The device logs also recorded React's warning that an external-store `getSnapshot` result
must be cached, followed by a maximum-update-depth error. The captured stack ended in
React's `updateStoreInstance` path and did not identify the owning component. This is a
real unresolved UI/runtime defect; the available log is insufficient to assign it to a
particular subscription or to claim a fix. There were also repeated Android
`SSLHandshakeException` / `CertPathValidatorException` trust-anchor failures during auth
fetches, leaving profile restoration offline. Do not bypass certificate verification;
inspect the endpoint and device trust chain before changing network configuration.

The development-only `SessionRouteGate` exception for `/verger-lab` and
`/verger-diagnostics` now has focused G1 coverage and keeps protected cloud services
unmounted. The on-device route check remains inconclusive: the app's custom-scheme
navigation returned to the offline entry state, and a subsequent debugger component-tree
read timed out. A cold process restart detached the RN app from Metro; do not count the
later dev-launcher/Expo Go screens as app-route evidence. The device remains useful for
local persistence evidence above, but the diagnostics screen has not yet been visually
verified on it.

On a later live A52 read, the current SQLite bundle contained 83 events and 7 source
statuses. Runtime and Verger inputs, Event Timing and route readiness were recording;
Android native profiling, standalone React Profiler profile import and heap profiling were
explicitly disabled. Status reported 83 JSONL writes, 0 pending/dropped records, 0 SQLite
drops and no active database error. The app also logged a Knowledge Sync `Service
Unavailable` console error at `packages/library/src/api/sync.ts:101` and repeated Android
TLS trust-anchor errors from auth fetches. These are observed service/device transport
failures, not reasons to weaken TLS checks or evidence of a telemetry defect.

Three recent JS startup-stage samples showed `bootstrapPlatform` around 48–88 ms; the
remaining essential stages varied from sub-millisecond to about 196 ms for `loadCatalog`,
102 ms for `registerAppCatalog`, and 3.6–15.6 ms for device-account initialization. The
deferred `workflow-event-bridge` and `install-referrer-resolution` completions ranged from
roughly 10 ms to 3.5 s and 0.43–4.2 s respectively across reloads. These tasks overlap and
the current clock/first-frame joins do not prove that they delay TTI. Event Timing also
captured two very different `touchend` presentation delays (about 925 ms and 1.4 ms); this
debugger session included navigation, system resolution and sync-error overlays, so the
high sample is a triage signal rather than a baseline. Device `__DEV__` telemetry hook
serialization call costs reported about 1–7 ms in the affected records. These measurements
justify a matched capture-on/off cold-launch and onboarding experiment with native first-
frame marks; they do not yet justify moving startup work or changing Verger thresholds.
Argent could not start Android Perfetto: ADB `pm list packages` was denied access to the
device's managed user 150, including when the app process was supplied explicitly.

Engineering findings are limited to the collected records and configured thresholds:
long tasks, Event Timing delay, Verger frame-window missed-vsync ratios, database write
failure, long deferred startup tasks, and recorded presentation-delay samples. The latter
two are informational and do not assert a configured threshold or causal blocking. These
are triage hints, not causal diagnosis or a replacement for Hermes CPU,
React Profiler, Perfetto, Android Studio, or native worklet/GPU traces.

# Remaining concerns to resolve

1. **Capture boundary and consent:** define what a real-user bounded session is allowed to
   retain, for how long, and whether any session upload exists. Detailed development capture
   stays local by default; local storage still requires deletion/retention controls.
2. **Payload privacy:** the live development path has a scalar/key deny-list, but it does
   not have a source-specific typed allowlist. Imported trace files intentionally preserve
   selected event fields locally. Establish stricter typed capture contracts before adding
   automatic request sources. Exclude
   request/response bodies, auth headers, text input, route params, heap object contents,
   console locals and stable account identifiers by default.
3. **Per-source timestamps:** RN/JS monotonic clocks, native Android clocks, DevTools export
   timestamps and host ADB wall time are different clocks. Every source needs a time origin,
   units, precision and correlation method; wall-time joins alone do not prove event order or
   causality.
4. **Instrumentation overhead:** synchronous JS serialization/SQLite work can delay the JS
   thread; native/DevTools profilers alter the measured system too. Use bounded batching or a
   native/worker-safe queue where supported, record queue/write cost and loss, and compare
   same-build capture-on and capture-off journeys.
5. **Retention and storage pressure:** per-session JSONL size/pending limits, disk-failure
   reporting and user-confirmed removal of stopped sessions exist. SQLite has no automatic
   global byte quota, rotation or reclamation schedule. Define a global ceiling and export
   policy from device measurements without silently pruning evidence.
6. **Flow semantics:** a timeline needs explicit journey/session markers and action outcomes.
   Event Timing does not tell whether a press succeeded; DevTools render tracks do not
   explain the product action. Instrument selected action start/completion/cancel outcomes
   without recording labels or input content.
7. **Inspector API boundary:** Expo/RN panels are operator tools. For any panel stream that
   lacks a stable public export/API, preserve its native trace artifact or mark it unavailable;
   do not bind the app to private inspector protocol internals.
8. **Dev versus production comparison:** debugger pauses, Fast Refresh, overlays, and
   profiling can distort timing. The capture manifest must record tool/debugger state and
   build mode, and performance comparisons need a non-debugger run with equivalent journey
   markers.

# Upstream sources checked 2026-10-27

- [Expo debugging and profiling tools](https://docs.expo.dev/debugging/tools/)
- [Expo SDK 58 dev-client docs](https://docs.expo.dev/versions/v58.0.0/sdk/dev-client/)
- [React Native DevTools](https://reactnative.dev/docs/react-native-devtools)
- [React Native 0.83 DevTools and Performance APIs](https://reactnative.dev/blog/2025/12/10/react-native-0.83)
- [React Native 0.86 release notes](https://reactnative.dev/blog/2026/06/11/react-native-0.86)
- [React Native 0.86 `console.timeStamp`](https://reactnative.dev/docs/0.86/global-console)

The repository audit also inspected the installed package versions and current source paths
listed above. The Expo/RN inspector feature list is not treated as a public telemetry SDK.
