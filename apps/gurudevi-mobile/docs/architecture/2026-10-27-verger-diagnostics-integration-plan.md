---
title: "Verger diagnostics integration and input repair plan"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Codex
tags: [verger, diagnostics, telemetry, gestures, expo-router]
---

# Scope and contracts

Maintain Mode. Execute on Windows, using the connected A52 through Windows ADB.
Preserve actions, persistence, haptics, routes and the existing root-capture fallback.
No dependency upgrades, direct generated-native edits, or reducer policy changes.

Amber targets: shared workspace drag and action sheet; Verger React/native binding;
mobile runtime diagnostics and tests. Reuse `usePanGesture`, `scheduleOnRN`, the
bound Verger store, `recordDevelopmentTrace`, recording/lab exports, analytics
sanitizer and the existing shell. Keep new helpers single-purpose and component
cognitive complexity below 15. Root `_layout.tsx` is outside this repair.

## 1. Capture design: preserve useful detail and disclose omissions

Use three complementary records with a manifest connecting their clocks and
build identity. No panel scraping or importing inspector internals into core.

| Record | Contents | Capture and retention |
| --- | --- | --- |
| Runtime evidence | Original Verger events, decisions, outcome ledger, config/activation, sensor availability, self-cost and dropped counts | Existing bounded Verger recording; export locally; missing readings stay unknown |
| Diagnostic session | Full supported Event Timing fields, long tasks, Router marks, selected press phases/outcomes, performance marks, source timestamps | Explicit development/session capture with record/byte caps, sequence numbers, dropped/filtered counters and start/stop/background cleanup |
| Native/DevTools trace | JS CPU samples, React render/commit tracks, network timing, allocations/heap, UI/native/worklet profiling | Short recording in the owning tool; export originals without flattening them into analytics summaries |

The manifest must list each requested source as unsupported, disabled, recording,
complete, capped or failed; include capture settings, sampling rate, event count,
buffer truncation, schema/version, build and source time origin. Preserve original
profiling files for analysis. A supported source being silent is different from
an unconnected source. Do not label a sample or capped ring buffer exhaustive.

Keep normal production analytics aggregated under the existing consent/sanitizer
and network budgets. Detailed local recordings are separate from third-party
uploads. Response bodies, route parameters and heap contents can contain account
data; an explicit capture/export policy must precede retaining those payloads.
Capture all performance metadata available within the selected diagnostic session,
not arbitrary user content. Raw sources stay available for deeper analysis rather
than being reduced permanently to summary buckets.

## 2. Verger presence without an additional layout boundary

The app already has a `GestureHandlerRootView`. Reuse its non-claiming capture
callbacks to notify the process-bound Verger, with the same 250 ms presence
throttle. Add an opt-out of the extra Verger presence View only for hosts that
wire that source. Keep default capture for other hosts and tests.

Do not replace presence with Event Timing: its filtering and delayed delivery
cannot protect an in-progress gesture. Do not install a global competing gesture
recognizer. This change removes an extra layout View in the mobile host; it does
not eliminate the app's required RNGH root or claim native-modal coverage.
Test unbound/off state, throttle, a new binding, handler return value and host
rendering. Verify actual child taps/scrolls with Verger off/shadow/active on device.

## 3. Gesture repairs and API receipts

Migrate the workspace recognizer coherently to the installed hook API. A pan
with `activateAfterLongPress` prevents pre-hold pan ownership; activation applies
the existing haptic/visual feedback, successful deactivation persists translation,
and finalization always restores visual state, including cancellation. Test
ordinary child taps, disabled state, canceled pan, successful drag and reset.

Migrate action-sheet pan to `usePanGesture`; read `canceled` only on the hook
end event; always reset on finalization. Preserve offsets, dismissal threshold
and spring behavior. Use `scheduleOnRN` only at completion, never per update.

Installed declarations and TypeScript are authoritative. RN Terrain was queried
on Windows: its compass uses RNGH 3.3 metadata and incorrectly labels
`usePanGesture` severed; its affordance scanner misses wildcard re-exports in
RNGH and Expo Router. Direct inspection of `src/v3/index.ts`, `ConfigTypes.ts`,
`PanTypes.ts` and Router `build/exports.d.ts` proves these APIs exist. Do not
weaken tests or introduce deprecated builders to appease that stale result.

Audit all imported symbols for RNGH, Reanimated, Worklets and Expo Router using
the installed TypeScript resolver, including re-exports and subpaths; record
invalid and deprecated symbols separately. Broader migrations remain grouped by
gesture relations, because hook/builder relations cannot be mixed.

## 4. Telemetry configuration and Router integration

Confirmed: `vergerTelemetrySink` uses `trackProductEvent`, sanitizes through the
core port and retains policy name. Host production budgets are deliberately small.
No production mobile `injectPostHog` caller was found; the sink test injects a fake.
Sentry adapter registration alone is not initialization or delivery evidence.
Check enabled/configured states without printing credential values. Verify actual
provider initialization, capture, flush, consent, offline/error behavior and
transport receipt before claiming remote telemetry works.

Router 58.0.25 physically exports `unstable_enablePerformanceIntegration`,
`unstable_PerformanceObserver` and typed page/action marks. It retains 250 native
marks and forwards them to User Timing; its observer preserves `detail`. Optional
development initialization must occur before the root mounts. Normalize route
templates; exclude params from shared analytics. Correlate action IDs locally
and retain source timestamps. Experimental enable currently has no disable API;
document that instrumentation remains enabled until process restart even when
an observer disconnects. Do not promise removable production overhead.

## 5. Ordered delivery and acceptance

1. Establish green Verger baseline; run RN Terrain and inspect physical types.
2. Repair the two confirmed gesture contracts and add cancellation/activation tests.
3. Reuse existing root capture and preserve Verger fallback; verify host contracts.
4. Check telemetry configuration; add optional Router/DevTools integration only
   through the existing trace/lab boundaries with explicit completeness metadata.
5. Run Windows Metro against the installed development client, exercise welcome,
   navigation, buttons, scroll and affected gesture screens; capture logs and
   screenshots. Record build identity and whether current source actually loaded.
6. Run types, focused tests, Verger gate, installed-symbol/deprecation checks and
   required repository audits. Review raw unified diff, deletions first. Report
   G0-G5 evidence separately and retain unresolved failures.

This is a staged integration plan, not a claim that every DevTools data stream
has already been ingested or that a device journey has already succeeded.

## 6. Local-first capture implemented and device receipt

Development bootstrap installs local diagnostics before Router entry. Runtime,
startup, Event Timing and Verger events are persisted to a session-indexed Expo
SQLite database and a parallel JSONL journal. SQLite supports indexed session,
source, timestamp and sequence queries; JSONL supports export/fallback. The
development debugger exposes status, flush, export, sessions, query, sources,
bundle, setSource and sanitized ingest at
`globalThis.__GURUDEVI_DEV_TELEMETRY__`. Batches flush every 100 ms with a 4,096
record pending queue. The JSONL journal has a 32 MiB per-session cap; the SQLite
database still has no global retention quota or automatic cleanup. Production
transport is unchanged. Doppler development configuration reports PostHog
disabled, no key, no Sentry DSN, and Verger mode off; remote analytics delivery
is not verified.

G5 receipt, Windows Argent debugger, Samsung A52 Android 14, installed development
client `app.gurudevi.sanctuary.vergerv2.dev`: session `mvqrg0nt-yr80psy9` returned
48 ordered SQLite rows (sequences 1–48), with no pending, dropped or database-error
records at the observed status check. The JSONL fallback reported 30,806 bytes,
also without drops or write error. This proves device-side SQLite persistence and
query of emitted events, not complete DevTools stream coverage or remote delivery.
The device flow stopped at offline arrival onboarding; a follow-up fix moves the
development-only `dev::sandbox` menu shortcut ahead of the online-only guard and
still needs post-reload device verification. Older JSONL-only receipt is superseded.

Read/export without credentials, using observed session names:

```powershell
$adb = 'C:/Users/Naween/AppData/Local/Android/Sdk/platform-tools/adb.exe'
& $adb -s R58T33Y0E3M shell run-as app.gurudevi.sanctuary.vergerv2.dev ls files/dev-telemetry
& $adb -s R58T33Y0E3M exec-out run-as app.gurudevi.sanctuary.vergerv2.dev cat files/dev-telemetry/<session>.status.json
& $adb -s R58T33Y0E3M exec-out run-as app.gurudevi.sanctuary.vergerv2.dev cat files/dev-telemetry/<session>.jsonl
```

No-account entitlement reads now use the installed TanStack `skipToken` sentinel,
and `usePermissions` uses the existing local-only identity classifier before
enabling a read. Authenticated account scope, offline cache and authorization
rules remain intact. G1: three mounted prerequisite cases and seven existing
cache/offline cases; live authenticated account delivery remains unverified.

## 2026-10-27 connected A52 diagnostic follow-up

The later Windows Argent session queried device session `mvqvgwbh-vffddlar`
through the app's debugger API and the persisted SQLite store (334 ordered
rows at export time). Status reported recording, zero pending rows, zero dropped
rows and no SQLite or JSONL write error. The source manifest distinguished
recording app/runtime, route readiness and Verger inputs from disabled native
and Hermes profiling. This is direct G5 evidence that the local database is
queryable; it does not establish full React Native DevTools stream coverage.

An additional development-only screen-ready marker now records fixed buckets
for welcome and onboarding once their visible content meets the local readiness
predicate. Its purpose is to improve app-runtime elapsed-time evidence. It is
not an OS launch-to-TTI measurement, and it still needs device verification.
Observed telemetry-start to first shell was about 13.1 s, while the measured
essential startup task durations summed to about 447 ms. That gap includes JS
bundle/module evaluation and development tooling and is not attributed to any
one module. The original long-task sample had 97 entries above 50 ms (p50
about 269 ms, p95 about 486 ms, max about 1.57 s); these values are a noisy
Metro/dev-client investigation signal, not a release-performance baseline.
Observed route transition timing included manual device interaction and must
not be treated as onboarding TTI. No code reordering is justified by this
sample alone.

The device sandbox flow reached the hidden `dev::sandbox` console without
creating a profile. Further verification is blocked by a reproducible Metro
HTTP 500: Windows reports `EMFILE` opening a Metro transform-cache file, and
the LogBox CSS transform also fails with `EMFILE`. The active server was using
two workers. Metro 0.87.1's installed declaration defines `maxWorkers` as a
number; `metro.config.js` now limits it to one based on this observed failure.
The running server must be restarted with a cleared cache to exercise the
change. Restart is pending explicit user confirmation because it interrupts
the active connected development session. No TLS validation was weakened; the
Android Supabase trust-anchor failure remains a separate network/device issue.

Follow-up read-only ADB inspection of session `mvqvoknk-2i5qijc7` returned 325
JSONL records (sequences 1–325); the status file reported 325 written, zero
pending/dropped, no journal error and no SQLite error. The latest device screen
has no visible app content and the new screen-ready event is absent, so this
session does not verify the added marker. Its recorded sample contains 70
long-task rows, with a maximum of about 1.74 s, and repeated event-loop-lag and
heap samples. The debugger log registry for the connected app contains 14
essential-startup cycles, 263 ReactNativeCss variable-remount warnings and 16
TLS trust-anchor failures. These counts include repeated development reloads;
they are evidence of an unstable dev session, not 14 independent cold starts
or a release-build performance profile. React Profiler / Perfetto attribution
has not run, and the current component-tree request timed out despite the
debugger's connection status reporting connected.

The new startup boundaries have now been read back from SQLite on the A52:
session `mvqw3qqf-syh3jzll` returned sequences 1–33 and the source manifest
reported `startup-boundaries=recording`, with zero pending, dropped or write
errors. In trace `mvqw3rci-rdg938jw`, Expo Router root registration to the
first `EntryStartupBoundary` effect took 10,032 ms; the first effect to
essential bootstrap completion took 100 ms; and bootstrap completion to the
existing shell-frame marker took 1,942 ms. That trace had no screen-interactive
event. Route-readiness rows showed onboarding with no session and no local
guest ready. The device remained visually blank after Metro returned HTTP 200
and a CDP reload. This is evidence that the shell-frame marker can occur
without usable onboarding content on this development path. The 10 s interval
does not isolate a single module or thread; a Hermes CPU profile and native
launch trace are still needed before attributing it or changing import order.

Across two essential-stage sequences in the same captured session, the task
durations summed to 438 ms. The repeated sequence means the session is not a
single cold-start sample; use a cycle identifier and clean repeatable launches
for distribution statistics. Current data argues against optimizing the
essential coordinator first. The major open questions are why entry-to-effect
is long in this dev build, why the screen-ready condition never becomes true,
and whether the blank surface is a route-state problem or a rendering failure.

## 2026-10-27 latest device recovery and performance read

The latest readback repeats the same diagnosis: in trace `mvqw3rci-rdg938jw`,
Router-root registration to the first startup-boundary effect was 10,032 ms,
first effect to essential bootstrap completion was 100 ms, and essential
bootstrap completion to the shell-frame marker was 1,942 ms. The queryable
SQLite session `mvqw3qqf-syh3jzll` held 33 ordered rows (sequences 1–33), and
the source manifest marked startup boundaries and screen readiness as
recording, with no pending, dropped or write-error records. No
`screen-interactive` event was present; readiness rows remained on onboarding
with no session and no local guest ready. Thus there is not yet a valid
onboarding TTI measurement for this run.

After a JavaScript reload, Android showed `[runtime not ready]` with
`Exception in HostFunction: Assertion failed` at Reanimated's
`installTurboModule`. A clean app-process restart removed that redbox, then the
Expo development launcher showed an `SSLHandshakeException` with
`Trust anchor for certification path not found`. The app's installed debug
binary and the Windows debug APK both date from October 22, while the current
JavaScript packages are Reanimated 4.7.1 and Worklets 0.13.0. This makes a
native/JavaScript build mismatch a credible lead, not a proven cause. Reanimated
documentation says its native and JavaScript parts must be compatible and
recommends rebuilding after an upgrade ([troubleshooting](https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting/)).
The local Metro `/status` endpoint returned HTTP 200 and `adb reverse` still
maps device port 8081, but the server process predates the new one-worker
configuration. The development client's saved project URL is local HTTP;
the failing HTTPS request's host was not identified. Certificate validation
was not bypassed. The sandbox-open event callback added to the route has not
yet been read back from a post-change device session.

Optimization priority from this evidence: keep the essential coordinator
unchanged (100 ms here); investigate the roughly 10 s pre-effect interval and
the 1.94 s post-bootstrap shell-to-frame interval separately; fix the route
readiness gap before reporting onboarding TTI. These are development-client
measurements, with repeated reloads and no screen-interactive event. They do
not prove cold-start distributions or release performance, and they do not
identify CPU ownership. At that checkpoint the development project had not
loaded, so no further app-level profile was possible in that session; the later
local-link recovery and its new receipt are recorded below.

The local development-client link format (`exp+gurudevi-sanctuary` with
`http://127.0.0.1:8081`) then loaded the project through the existing USB port
reverse without restarting Metro. On the A52, the app rendered Welcome, then
the guest onboarding route and Sandbox Console. No profile was saved. The
current persisted session `mvqwm2c5-rqc8j89v` reported 19 ordered rows, active
SQLite and JSONL recording, 11,483 journal bytes, and zero pending, dropped or
write-error records when queried. Its source manifest marked app runtime,
Event Timing, route readiness, screen readiness, startup boundaries and Verger
inputs as recording; Android native profiling, Hermes heap profiling and the
RN DevTools profile were disabled. The onboarding route still reported
`booting`, `session_loading=true`, no session and no local guest ready. The
current trace did not contain the newly added sandbox-open event, so callback
delivery remains unverified against the active Metro cache.

This trace corrects the startup boundary calculation: Router registration to
the first effect was 10,143.4 ms; first effect to completion of the final
essential stage (`initializeDeviceAccounts`) was 593.9 ms; that stage to the
shell-frame marker was 1,602.1 ms. The five measured essential stage durations
totaled about 555.6 ms. `workflow-event-bridge` began about 8 ms after the final
essential stage and completed 2,268.1 ms after the shell frame;
`install-referrer-resolution` completed 2,942.8 ms after the frame. This proves
the optional tasks overlapped shell presentation, not that either blocked the
JS thread. The insight analyzer now reports this overlap separately and labels
the final essential stage correctly. Keep both services in place; use a short
Hermes/native recording to decide whether rescheduling them would improve the
first usable screen without delaying their required behavior.

The debugger log also recorded an auth retry with the same TLS trust-anchor
failure, even though the local Metro link succeeded. The cause and failing host
are still unidentified. A TLS bypass is not an acceptable fix; distinguish
network/auth recovery from local project loading in later device evidence.

The boundary and overlap insight change was verified by G1 / Vitest:
`developmentTelemetryInsights.test.ts` 8/8 passed, and by G0 / TypeScript:
mobile `check-types` reported zero findings. The post-change `pnpm verger:check`
completed with `ALL_PASS=1`: core 304, Android 25, web 18, host 136, UI context
10, mobile runtime 42 and web Verger 10. This validates the contracts under
their configured test engines; it is not a native-profiler result.

## 2026-10-27 Sandbox profiling and dev-server fault

On the connected Samsung A52 / Android 14, the local telemetry runtime read
back 45 ordered SQLite rows with a JSONL sidecar. Both stores were recording;
pending, dropped, database-drop, and write-error counts were zero. Event Timing,
route readiness, startup boundaries, and Verger inputs reported `recording`.
Native Android profile, Hermes heap profile, and RN DevTools profile remained
explicitly `disabled` / manual. This proves ingestion and local queryability for
the sources that ran, not complete profiling coverage.

React Profiler session `20261027-164210` captured a 10.9-second Sandbox Console
interaction (1,023 CPU samples, 861 fiber render samples, three React commits).
The three commits took 216.3, 211.8, and 218.8 ms. Each reconciled the whole
`DevSandboxConsole` subtree, including about 60 Views, 59 Text nodes, and 38
Pressables, even though each interaction changed one field. This is a useful
development-tool interaction hotspot, but it does not explain cold start or
onboarding TTI. The React CPU profile also includes profiler host work such as
`clearMeasures` and `reportMeasure`; do not treat those costs as app code.

The Sandbox Console now memoizes its text-field and choice-group sections so a
single field update can leave sibling sections untouched. Shared UI
typecheck: G0, zero findings. Existing onboarding identity contract:
G1 / Vitest mock React Native engine, 2/2 passed. A matching device
before/after profile is still required to claim a measured improvement.

The native Perfetto profiler could not start: its package autodetection command
failed because Android shell access to Secure Folder user 150 is denied. No
device user or permission settings were changed. In the app, a tap recorded an
Event Timing duration of about 731 ms, with 47 ms input delay, 3 ms processing,
and 682 ms presentation delay. This is a single dev-build sample; reproduce it
after the bundler is healthy before treating it as a stable responsiveness
metric.

The current session contained no `screen-interactive` or `sandbox-console`
record. The route-readiness rows say there is no auth session and no local guest
ready. That session used the earlier onboarding marker, which required a
`userId`. I changed the marker contract so an arrival screen is interactive
when the arrival phase is visible, processing is complete, and the developer
console is closed, independent of account admission. This is telemetry-only;
it does not change the route or admission gate. The updated marker still needs a
fresh Metro bundle and device readback.

The active Metro process reported
`TransformError ... packages/ui/src/global.css: EMFILE: too many open files`.
The checked-in working-tree config already sets `maxWorkers = 1`, but the
running server predates that setting. This prevented a reliable bundle of the
current source, so the sandbox callback and the memoization change could not be
verified on-device in this turn. Metro restart/cache-clear was not performed;
it still requires the explicit confirmation requested earlier. The debugger
log registry also contained six TLS trust-anchor warnings and repeated
`ReactNativeCss` undefined-class remount warnings; the failing TLS host is
unknown, so neither warning is attributed to the startup timings.

`pnpm verger:check` completed with `ALL_PASS=1` after the memoization change.
Its package tests passed: Verger core 304, Android 25, web 18, host 136, UI
context 10, mobile runtime 42, and web Verger 10. The run emitted existing Vite
config-loader and React `act(...)` warnings; no quality gate was weakened.

The required repository `check:anti-slop` command did not pass: CNG and the
hollow-stub checks passed, but `aislop ci --changes` reported 35 dependency
security errors and the command exited 1. The native slop stage emitted six
review-level findings elsewhere in already-modified files. Formatting flags
for `DevelopmentScreenInteractiveMarker.tsx` and
`developmentTelemetryInsights.ts` were corrected; the focused insights test
then passed G1 / Vitest, 8/8, and mobile `check-types` passed G0 with zero
findings. No unrelated dependency changes were made.

## 2026-10-27 marker semantics follow-up

`isOnboardingScreenReadyForInteraction` now measures usable arrival content
independently of `userId`. Route readiness continues to carry session and local
guest state separately, so diagnostics can report both screen interactivity
and account admission. G1 / mock React Native tests cover the unresolved-account
case plus processing, developer-console, and non-arrival suppression: 3/3
passed. `@repo/ui check-types` passed G0 with zero findings, and Biome passed the
three changed UI files. The current app remains on the previous bundle because
Metro's live process predates the config and shared-package edits; no claim is
made that the revised marker has been observed on-device yet.

## 2026-10-27 Perfetto trace analysis and import seam

The 15-second A52 capture `verger-sandbox-20261027.pftrace` was parsed on
Windows with Perfetto Trace Processor v58.2 (official wrapper/binary). The
trace spans 14.887 seconds. SQL reports about 6,004 ms scheduled on the app's
main thread, 1,375 ms on `mqt_v_js`, and one 300 ms concurrent ART GC phase on
`HeapTaskDaemon`. Android's actual frame timeline includes 33 app frames: 31
missed the app deadline (26 app-only and 5 also reporting a SurfaceFlinger CPU
deadline miss); the longest was 43.4 ms. These are warning signals, not a
startup/TTI baseline: the capture includes Argent screen-sharing presentation,
video encoding, and a profiler-helper process, and it was recorded during
Sandbox Console interaction. Concurrent GC is not proof of a JS stop-the-world
pause. Repeat without screen sharing and with a clean startup marker before
assigning CPU ownership or changing startup work.

Development trace import now labels Perfetto Trace Processor Chrome JSON as
`perfetto-trace-json`, distinct from React Native DevTools JSON, while keeping
the original trace clock and imported event fields as ordered SQLite rows.
Convert a `.pftrace` with the official Perfetto Trace Processor command
`trace_processor convert json input.pftrace output.json`, then use the
Perfetto import button in Development diagnostics. The importer still enforces
32 MiB and 50,000 events; it does not ingest binary `.pftrace` packets or retain
the original binary artifact in SQLite. Keep the `.pftrace` next to the
queryable conversion when full-fidelity raw analysis is needed. The connected
app is still running the prior bundle, so this import UI path has G1/G0 code
verification only, not fresh G5 import proof.

No startup optimization is justified from this capture. Prioritize repairing
the measured route readiness gap, then capture a clean cold start with
screen-interactive and route-ready markers plus Hermes and native traces. Only
compare repeatable distributions; the profiler-contaminated frame misses and
single concurrent GC are insufficient grounds to reschedule essential or
optional startup work.

## 2026-10-27 live SQLite readback and current app route

On the Samsung A52, latest local session `mvqxokd4-jexeuqdz` was read from the
app's SQLite database and JSONL status file while the recorder remained active:
38 event rows, both stores recording, 0 pending, 0 dropped, 0 SQLite drops, and
no write error. The source manifest lists app runtime, Event Timing, route
readiness, screen readiness, startup boundaries, and Verger inputs as recording;
Android native profile, Hermes heap, and RN DevTools profile remain manual or
disabled. This proves the running capture/query path and source declaration,
not that every declared source emitted an event in every session.

The device was showing a stale protected route's “Restoring your sanctuary”
screen. Returning to Welcome and opening Explore as Guest reached the visible
onboarding arrival form without saving a profile. Its route-readiness row was
still `booting` with no session and no local guest admission, while the form
was visibly interactive. This confirms route admission and first usable screen
must be separate signals. The session has a Welcome `screen-interactive` event,
but none for onboarding; the updated arrival marker semantics have not yet
been confirmed on this route.

Use the first startup cycle in that session only: Expo Router root registration
to first startup effect was 10,135.5 ms; first effect to essential startup end
was 469.8 ms (the five stage durations sum to about 435.4 ms); first effect to
the first shell frame marker was 2,090.1 ms. That shell frame rendered the
restoring state, not the onboarding form. Later boundary markers in the same
session occurred during debugging/HMR and manual navigation, so they are not
additional cold starts. Prioritize attribution of the pre-effect interval and
make screen readiness visible in SQLite before changing import order or
rescheduling startup tasks.

The app debugger still reports Android `SSLHandshakeException` with “Trust
anchor for certification path not found” during profile restoration. Argent's
fetch interceptor captured no request details, so the failing hostname and
certificate chain are unknown. Guest navigation did recover locally; do not
weaken TLS validation. Repeated `ReactNativeCss` variable-remount warnings also
remain unattributed because the log contains no component stack. Both are
diagnostic leads, not fixed issues.
