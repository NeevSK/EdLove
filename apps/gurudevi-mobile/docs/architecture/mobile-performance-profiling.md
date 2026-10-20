---
title: "Mobile Performance Profiling Workflow"
status: "active"
created: 2026-10-19
updated: 2026-10-19
author: "Codex"
tags: [mobile, android, profiling, workflow, evidence]
---

# Mobile Performance Profiling Workflow

## Purpose and evidence boundary

This is the reusable measurement loop for the
[performance execution plan](../current_progress/2026-10-19-performance-engineering-execution-plan.md).
Read the [source register](../research/2026-10-19-device-profiling-source-register.md)
for metric definitions and the [work ledger](2026-10-19-startup-work-ledger.md)
for the actual operations being investigated.

The capture action is integrated into `@repo/platform-mcp`'s existing
`DeviceService`. It reads a named Android device and target package, saves raw
outputs and a manifest, and does not launch, install, reset or modify app data.
It never emits a production score or automatic G5 pass. Trace recording writes
only its own bounded diagnostic artifact; it does not change clocks/settings.

## 1. Define the experiment before collecting

Write the question, metric, endpoint, baseline artifact and proposed single
change. Example: does reducing optional job overlap improve input responsiveness
during guest entry without delaying required intent handling?

Record model/OS/actual RAM, reference label, build version/hash, source revision,
dirty-source hashes, identity mode, starting screen, install/cache state,
charging/network/thermal conditions, sampling overhead and run count. Do not put
tokens, account IDs, email addresses or personal screen content in telemetry.

Use the operator's A52 middle reference without relabeling its measured RAM as
2 GB. A constrained A52 policy is a simulation, not a physical low-end result.
Do not set device clocks, disable thermal management or clear app data as an
incidental setup step.

## 2. Select the right artifact

- Development client: useful for functionality, JS/React attribution and tool
  integration. Not a release startup/memory baseline. Metro compilation and
  bundle transport are separate from native app execution.
- Existing EAS `performance` profile: extends preview with production JS and an
  opt-in `withProfileableBuild` config plugin. Verify the resulting artifact;
  selecting the profile alone does not prove manifest flags or code identity.
- Production/store artifact: final validation, without assuming the internal
  profileable build has identical instrumentation overhead.

Keep the installed package and declared build kind separate from observed
debuggable/profileable package flags. Profileable is not the same as debuggable.
Use the existing build runbook and Doppler. New standalone release builds follow
the `android-build` skill's explicit authorization rule; no clean prebuild or
direct generated-native edits are required by this workflow.

## 3. Capture device facts and conditions

After restarting/rebuilding the gateway to expose new actions, call:

```json
{
  "action": "capture_profile",
  "params": {
    "serial": "YOUR_ADB_SERIAL",
    "appId": "app.gurudevi.sanctuary.dev",
    "label": "self-settled-reference",
    "buildKind": "development"
  }
}
```

The params are validated again inside the service. Build kinds are
`development`, `performance`, `release`, `unknown`. Labels are short safe names,
not free-form shell input. Always supply the actual installed package.

For local work before the long-running gateway reloads, invoke the same service
from the repository root using installed `tsx`:

```powershell
$env:PROFILE_SERIAL = 'YOUR_ADB_SERIAL'
$env:PROFILE_APP_ID = 'app.gurudevi.sanctuary.dev'
pnpm exec tsx -e 'import { DeviceService } from "./packages/platform-mcp/src/services/DeviceService.ts"; new DeviceService().handleDeviceAction("capture_profile", { serial: process.env.PROFILE_SERIAL, appId: process.env.PROFILE_APP_ID, label: "self-settled-reference", buildKind: "development" }).then(r => { console.log(r.content[0]?.text); if (r.isError) process.exitCode = 1; });'
```

Each invocation creates `reports/mobile-performance/<timestamp-random-id>/`:

- `manifest.json`: target package, declared artifact kind, hashed device alias,
  command provenance/time/outcome, normalized values with explicit units.
- Named text files: raw model/SDK/SoC/low-RAM property, system memory, online CPU
  range, battery/thermal dump, target process memory/package metadata and PID.
- Failed reads remain recorded; metrics are `null`, not invented zeroes. Empty
  low-RAM property is unknown. A `complete` capture means commands completed;
  it does not mean every OEM exposes every field or that performance is good.

Reads are sequential with bounded command timeouts and output size. A snapshot
is a time window, not an atomic view of the whole device. It is unsuitable for
short-lived peak detection. Inspect `status: partial` and raw failures before
using any normalized field. A non-running app is not a zero-memory app.

## 4. Record and prove the journey

Use installed `agent-device help workflow` / command-specific help or Argent's
live schemas. Start an Argent recording before the first action; use semantic
selectors and verify destination-only landmarks. Save it under the app's
`.argent/flows/`, with prerequisites and no device identifiers or credentials.
Replay the final flow end to end before using it for repeated comparisons.

Capture at process launch, useful Welcome, onboarding step/completion, admitted
first value, settled screen, post-navigation and post-background states. Separate
guest, permanent, offline and account-switch paths. Do not replace real entry
with bypass/deep-link shortcuts in the measured journey.

Automation elapsed time includes accessibility dump, transport, screenshot and
tool overhead. It is not touch latency. `unreadable`/`Killed` from uiautomator is
an unknown check, not an app pass/fail. Preserve the failed recording and repair
the source before declaring the flow reusable. Stop after two unsuccessful
repair cycles rather than weakening checks.

## 5. Attribute the cost

Use React/Hermes profiling for commits, renders, JS long tasks and CPU stacks.
Use native Perfetto scheduling/frame evidence for run/wait/blocked time and
contention. Memory-growth signals require allocation/lifetime investigation;
one high PSS value does not establish a leak.

Argent native profiling on this Samsung currently fails during an unscoped
`pm list packages` verification because shell cannot inspect secondary user
150. Supplying `app_process` does not bypass that check. Do not grant broader
permissions or modify vendor code to make the profiler pass.

The capture service's optional bounded Perfetto fallback uses the explicit target
package and avoids all-package enumeration. Add `traceSeconds` (integer 1–15)
only for an intentional trace experiment. It records scheduler/frequency/idle
and Android graphics/window/view categories into `native.pftrace`, with command
provenance and output limits. This does not automatically provide JS stacks,
sampled native CPU call stacks, memory allocation stacks, TTID or TTFD. Inspect
which data sources actually recorded before interpreting the file.

Raw native traces stay local; do not upload them to a web UI automatically.
Use a local trace processor/Perfetto UI, retaining SQL and results beside the
trace. A blank data table means missing evidence, not zero cost.

## 6. Compare and evolve

Start with five comparable runs and report median/range plus N. Do not infer a
credible P95 from five values. Match device, artifact mode, journey endpoint,
profile/cache state and environmental conditions; repeat contaminated runs.
Never compare the dev launcher snapshot with an app screen as an optimization.

Change one architectural constraint at a time. Compare the named metric and
correctness, memory, energy, resume and visual trade-offs. Keep the raw before
and after files. Report what improved, stayed flat, regressed or remains unknown.
Revisit budgets once a physical 2–3 GB reference is available.

## Runtime adaptation

The shipped-app controller is specified in
[runtime adaptation design](2026-10-19-runtime-adaptation-design.md). Profiling
calibrates it; debug tooling is not required for it to operate. Unknown hardware
starts conservatively, user work takes priority, optional work is bounded, and
pressure reduces resource use immediately with slower recovery. Existing visual
and operational policies retain their separate responsibilities.
