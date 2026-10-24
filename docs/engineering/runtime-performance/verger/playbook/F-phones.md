---
title: "Verger playbook, phase F: on real phones"
status: active
created: 2026-10-24
owners: [Naveen]
tags: [verger, playbook, android, devices, G5]
---

# Phase F: on real phones (highest leverage)

Read [README.md](README.md) first. Load `.agents/skills/android-build/SKILL.md` and
`.agents/skills/expo-overview/SKILL.md` before building (AGENTS.md section 8).

## Why this is first

Everything verger does has been proven only at G0 to G3 (types, Vitest, jsdom). On a phone:
- `VergerSense.kt` and `VergerModule.kt` (they import the Android SDK) have **never compiled**:
  the cloud session had no Android SDK. The pure Kotlin (signals, estimator, display modes, exit
  reasons, thread sampler, network and battery mapping) passes 30 JVM tests.
- Every threshold is provisional: memory classes (5 GiB, 9 GiB), weak link (1000 kbps, 60 s),
  heat from battery (40/45/50 °C), battery low (20 %), frame ratios.
- The battery temperature unit (tenths of a degree) is an assumption.

## Hard rules for this phase

- **Never** `npx expo prebuild --clean`, `npx expo install --fix` or `--check` (AGENTS.md Native
  Integrity Rules 1 and 2). Never edit `android/` or `ios/` by hand; they are generated.
- **Maestro CLI only, never Maestro Cloud.** Stryker locally only.
- The pilot build (2026-10-26) is not from this branch. Build this branch only as a dev client.
- Record every measurement in the tables below and in [pipeline.md](../pipeline.md). Do not
  change a default in `config.ts` from one phone's numbers: propose it to Naveen.

## F1. First build

1. `pnpm install` at the root. `pnpm verger:check` must pass.
2. Build the dev client per the android-build skill. A development build runs verger's `lab`
   preset by default (`resolveVergerLaunch`, `dev: true`).
3. Expect Kotlin compile errors in `VergerSense.kt` and `VergerModule.kt` the first time. Fix
   them one at a time. Do **not** change behaviour while fixing: if a fix needs a design choice,
   write it down and ask.
4. Run the module's JVM tests through Gradle as well (the build file passes
   `-Dverger.fixtures` and `-Dverger.contract`): they must still be 30/30.
5. Android lint `NewApi` at minSdk 28 will flag any call above the minimum. Every flagged call
   needs a version check, not a suppression.

## F2. See what verger sees

There is no dev lab yet (phase D). Until then, read the snapshot in a development build:

```tsx
// Temporary, development builds only; never commit it.
import { useVerger } from '@repo/verger-react';
const verger = useVerger();
console.log(JSON.stringify(verger?.getSnapshot(), null, 2), verger?.outcomes());
```

`VisualCapabilityInspector` (`packages/ui/src/components`) already shows what the components
receive. Clear the app's data to reset the recovery ladder between experiments.

## F3. Measurements to take (G5)

Phones: the A52 (8 GB), the A24 (4 GB or 6 GB, note which), one 2 to 4 GB phone.

| Measure | How | Why |
|---|---|---|
| Reported total memory | snapshot `capacityClass`, and the bytes the platform reports (`readCapacity`) | the 5 GiB and 9 GiB class thresholds assume 4 GB phones report under 5 GiB and 8 GB phones under 9 GiB |
| Battery temperature unit | compare snapshot `battery.temperatureC` with `adb shell dumpsys battery` (temperature, in tenths of °C there) | `BatterySignals.temperatureC` assumes tenths |
| Network | airplane mode on and off; Wi-Fi to mobile data; Data Saver on in system settings | `networkLimit` should go `offline`, `unstable` for 60 s, `none`; `data-saver` |
| Battery saver | system quick setting | `powerSaver` true; ambient levers stilled |
| Heat | a long session in the sun or a stress app | thermal status, headroom (Android 11+), battery-temperature fallback below Android 10 |
| Frames | scroll a long list, open the workspace | frame windows, stages, the closed loop lowering then restoring |
| Cost of verger | per-thread CPU of verger's sampler thread, wakeups | the self-cost budget (phase D) needs a real number |

Optional, `adb` shortcuts (verify each on the phone first; vendors differ):
`adb shell dumpsys battery set level 15`, `adb shell dumpsys battery unplug`,
`adb shell dumpsys battery reset`, `adb shell cmd netpolicy set restrict-background true`
(Data Saver), `adb shell settings put global low_power 1` (battery saver).

## F4. Flows with the Maestro CLI (free, local)

Write flows under `apps/gurudevi-mobile/maestro/` (check whether the folder exists first):
cold start to the home screen; open the workspace; toggle airplane mode (from `adb`, between
steps). Assert on visible UI only; read verger's state from the log line above.

## F5. Write it back

1. Fill the table above with numbers per phone, in [sensing.md](../sensing.md) and
   [pipeline.md](../pipeline.md) (evidence column: G5, phone, Android version).
2. Mark resolved items in [open-items.md](open-items.md).
3. Propose threshold changes to Naveen with the numbers; change `config.ts` only after he agrees,
   and then add the new values to both golden fixtures by hand.
