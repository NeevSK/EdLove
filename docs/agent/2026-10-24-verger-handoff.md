# Verger handoff (2026-10-24)

Read this first in any new session working on verger, the adaptive runtime. It carries what
the chat that built it knew. The design doc and the ADR hold the reasoning; this file holds
the state, the open items and the next step.

## Where things are

| What | Where |
| --- | --- |
| Branch | `feat/adaptive-runtime` (latest: `7d61258`) |
| Decision record | `docs/decisions/2026-10-21-adaptive-runtime-resource-economy.md` (D1 to D12) |
| Design doc | https://claude.ai/artifact/4yGyJ6Z6H1n4MkiVkBT6j8 (tabs: main plan; "Lineage and recovery", with the implementation-status checklist) |
| Pure core | `packages/verger-core` (reducer, controller, recovery ladder, telemetry, `createVerger`) |
| Android | `packages/verger-android` (Kotlin Expo module `Verger`; `createVergerAndroidPlatform`) |
| React shell | `packages/verger-react` (`VergerProvider`, hooks) |
| Gurudevi as host | `packages/core/src/governor` (levers, `GURUDEVI_MOBILE_HOST`) and `apps/gurudevi-mobile/src/runtime/GurudeviVerger.tsx` (not mounted) |

## Constraints that still hold

- Pilot on Monday 2026-10-26 runs under a native-code freeze: `GurudeviVerger` stays unmounted
  and verger stays off by default. Native work goes on a separate dev build.
- Deletion Veto (AGENTS.md): the old governor in `packages/ui/src/context` is not removed or
  replaced without Neev's sign-off.
- Commits and pushes on this branch use `--no-verify`, as Neev authorised. The pre-push hook
  fails on an eslint config missing outside his machine; the prepare-commit-msg hook needs
  PowerShell, so on Linux commit with `HUSKY=0` after checking commitlint by hand.
- Report evidence by level (G0 to G5, R1; AGENTS.md section 6). Today everything is G2 at most:
  nothing has run on a phone, and there has been no Gradle build.
- Working style: atoms before narrative; integrate into the existing structure rather than
  re-narrate; keep an intended-vs-done checklist; independent hostile review before calling
  mission-critical work done.

## Evidence so far

- verger-core: 51 Vitest tests; Gurudevi host: 50; verger-android mapping: 9 (G1/G2).
- Kotlin: 21 JUnit tests on the JVM, and every source compiled against android.jar 35 with
  Expo signature stubs (G1). The harness lived in a cloud scratchpad and is gone; on the
  laptop, run the module's tests through Gradle instead.
- Two independent hostile reviews; all critical and major findings fixed (commit `7d61258`).

## The situation found on 2026-10-24

The app is mid-handover. The old governor in `@repo/ui/src/context` (`EnvironmentProvider`,
`FidelityProvider`, `RealityProvider`, `visualPolicy.classifyDeviceTier`, about 1,900 lines,
read by 37 files) still decides everything at runtime. Verger is built but not mounted, and
both decide blur and glass quality, so one must hand over to the other.

Checked against release notes (not memory):
- RN 0.86: `PerformanceObserver` `event` entries now default to `durationThreshold` 104 ms.
- RN 0.88: no new performance API; the JS scheduler clears pending work when a task throws;
  web-style event dispatching is the default (check `PresenceBoundary` against it).
- Expo Observe (`expo-observe`): field startup, per-route TTI and frozen or slow frames, with
  thermal state and low-power mode; dev and production builds; needs EAS and a new binary.

## Next steps, in order

1. Capability atlas: per layer (hardware, Android 9 to 16, Hermes and RN 0.88, libraries,
   tooling), what each senses or actuates, minimum version, cost, whether used, source.
   Verified against installed `node_modules` and official notes.
2. Map of the old governor: every decision it makes and every consumer that reads it.
3. One top-down architecture picture: sense, decide, act, learn; the old context becomes a
   reader of verger's snapshot, not a second decider.
4. Handover plan: verger in shadow beside the old governor, logging every disagreement; then
   one lever at a time, each with sign-off.
5. On the laptop with the phones: first Gradle build, dev client on the A52 and A24,
   autolinking check, lab procedure. Dev build only, never the pilot build.

Steps 1 to 4 touch no native code and are safe before the pilot.

## Open minor items from the last review (not yet done)

- A `stopped` marker skips the exit check, so a crash during native stop is missed.
- Relapses never decay within a ladder key.
- `@repo/verger-android` looks up the native module at import time, whatever the kill switch.
- Kill-switch changes after mount wait for the next launch (props are frozen in `useState`).
- Not built: agility metric, battery-temperature and frame-drift heat fallback, baseline
  profiles, user switch for adaptation.
