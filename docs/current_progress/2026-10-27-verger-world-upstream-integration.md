---
title: "Verger and World upstream integration"
status: "active"
created: 2026-10-27
updated: 2026-10-27
author: "Naveen"
scribe: "Codex"
tags: [verger, worlds, integration, verification]
---

# Verger and World upstream integration

Follow-up: [shared networking and World/Verger audit](2026-10-27-network-world-verger-followup.md) records the current 517-case Verger gate, World bootstrap repair, production web build, and remaining World migration/native device limits.

The production web and Android bundle failures recorded below were subsequently
resolved without a dependency upgrade. See the
[oRPC build boundary repair](2026-10-27-orpc-build-boundary-repair.md) for current
G4 evidence, upstream research and rn-terrain findings.

## Scope and preservation

Fetched `origin` and integrated the content of
`origin/claude/project-thread-x3d8lb` at `eaa6d6c2f` into the working checkout.
Its history contains `origin/feat/adaptive-runtime` at `33600d997`. The older
`origin/feat/worlds-foundation` was already an ancestor of HEAD. The incoming
history has 112 commits beyond HEAD, across 528 paths. No remote branch was
pushed and HEAD was not moved; integration remains reviewable as working changes.

Before applying changes, preserved tracked and non-ignored untracked local work
in Git snapshot `f991af024ae1eb757e83a2c93a8b9a99ed028c1b`, retained by
`refs/codex-backups/verger-world-20261027`. This is a local recovery object, not a
commit on the user's branch. Ignored files, including environment files, were
not added. The original index was not changed.

Compared the incoming branch with both committed HEAD and that snapshot. The
former conflicts only in the lockfile; the latter has 13 conflicting paths.
The integration preserves local auth stores, session/query boundaries, account
replay ownership, sensory feedback, breathing overlay, shared connectivity,
and classroom navigation while adding Verger and World behavior.

## Approved removals and replacements

Naveen approved the replacements in this chat, explicitly requiring that their
rationale and treatment be checked. The following records and source were read
before removing the corresponding paths:

| Retired path or behavior | Replacement and rationale |
| --- | --- |
| UI RealityProvider, visualPolicy, experiencePolicy and their tests | `useVisualCapabilities`, `experienceOf`, process-bound Verger, native/browser shells. Commit `e3f6c66b8` records moved readers, settings ownership, migrated safe-mode assertions and the differential oracle. [The drift record](../engineering/runtime-performance/verger/drift-record.md) retains intended differences from 5,760 enumerated cases. Local connectivity ownership stays with NetworkManager rather than restoring the old combined store. |
| Core governor naming and host files | `packages/core/src/verger` and `packages/verger-core/src/reducer.ts`. Commit `18f20b507` records the rename, unchanged persisted ladder key and telemetry treatment. The incoming host tests cover the replacement. |
| Efficiency policy, visual budget, wallpaper and work admission | Gurudevi Verger view, `wallpaperOf`, `admitWork`, background snapshot and native/browser sensors. [Everywhere](../engineering/runtime-performance/verger/everywhere.md) and the drift record explain the cross-platform migration. The Hermes shield remains. |
| VergerProvider | Host-neutral hooks in verger-react; native shell in verger-react-native and browser shell in verger-web. Native peer dependencies move with the native shell so browser bindings remain platform neutral. |
| AssetProvider, constants/Fonts and duplicate/static fonts | Bundled World fonts, OFL licenses, WorldFonts availability registration and system-font fallback. Commit `acc09859f` explains the unmounted loader and 20 MB duplicate/static inventory; later commits embed every world's fonts. Repository search found no callers of the retired loader outside its own constants. Font inventory tests validate the new app configuration. |
| Browser visual-budget hook and tests | `useGurudeviView`, GurudeviWebVerger and browser integration tests. The incoming branch carries the full browser host. |

No old tests were skipped or loosened to accept a failure. One incoming source
assertion expected an inline `item.userId === activeUserId` filter in background
sync. The local implementation already delegates selection to
`planMutationReplay(queue, activeUserId, ...)`. The assertion now verifies both
that delegation and the planner's `item.userId !== principalId` rejection.
The planner's behavioral suite also runs, including another-account rejection.

## Reconciliation details

- EntryShell wraps the existing local session and sensory subtree in GurudeviVerger.
  SessionRouteGate retains its public/protected startup phase contract.
- The tab shell retains local auth, provisional-workspace reconciliation and
  scoped notifications while accepting the upstream custom/native experiment.
- External links and the knowledge map retain shared `useOfflineStatus` reads.
  Verger's live JS network sensor reads NetworkManager's snapshot instead of
  introducing another platform listener. Unknown reachability stays unknown;
  captive portals remain offline. Added a conversion contract test.
- Removed upstream's obsolete `useStore.setIsOnline` bridge; the local platform
  adapter and network bus remain the connectivity owner.
- Settings retain local account/security behavior and sensory controls, adding
  the incoming Verger diagnostics. Local helper props now use their actual
  sensory and translation types.
- Ran the repository harmonizer for the two new package manifests. Existing
  TypeScript, React, RN and Reanimated cohort pins remain authoritative. Resolved
  the lockfile with `pnpm install --lockfile-only --ignore-scripts` and installed
  workspace links offline. No unconstrained upgrade was performed.
- Added a native cross-platform Verger gate runner with the same steps as the
  upstream shell gate. WSL could not execute the installed Windows TypeScript
  binary. The native runner limits Vitest workers to two, preserves assertions
  and timeouts, and emits full output. The original shell script remains.
- Added an explicit source alias for verger-core in UI Vitest: runtime tests
  must not execute declaration files selected by the core build tsconfig.
- Replaced the incoming toast's deprecated `runOnJS` with `scheduleOnRN`, verified
  against installed Worklets 0.13 declarations and its
  [official documentation](https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN/).
- World guardrail inventory now uses tracked and non-ignored new source, avoiding
  generated exports and broken skill symlinks. Its color rules and baseline are
  unchanged. Stack-map bootstrap, annotation review and generation were run.

## Evidence

| Level / engine | Result | Limits |
| --- | --- | --- |
| G0 / TypeScript 7.1 beta | All five Verger packages, mobile app and UI package typecheck successfully. | No native ABI, rendering or production proof. |
| G1/G2/G3 / Vitest and vitest-native mock engine | Final `pnpm verger:check`: `ALL_PASS=1`. Core 304, Android contracts 25, browser contracts 17, Gurudevi host 136, UI 10, mobile runtime 14, browser integrations 10; 516 assertions total. | Sensors/native bridges/storage are substituted; simulations use provisional phone models. |
| G1/G3 / focused mobile Vitest | Session/account preservation, font inventory and tab-selection: 37 checks across six suites. | No real OS navigation or physical font rendering. |
| G1 / shared network/replay Vitest | NetworkManager, network adapters and replay planner: 9 checks across three suites. | Platform observation/storage substituted. |
| G1/G3 / World Vitest | 1,492 checks across four suites, including 1,452 contrast cases. | No screenshot or physical device proof. |
| G0 / repository checks | CNG, test-evidence classification and focused tool Biome checks succeed. | Broader gates below remain red. |
| G4 / Next 16.4.2 Turbopack | Production build fails on checkout workforce imports of RN UI and the library-map client boundary, among 17 errors. | No successful production web bundle claimed. These paths were already locally modified before this integration. |
| G4 / Metro and Hermes Android export | Metro reaches 7,483 modules; Hermes rejects `async (...[input, callerOptions])`. The exact expression is present in installed `@orpc/server@2.0.0-beta.46/dist/shared/server.BB464y-6.mjs:30` (also beta.44). | No successful Android production bundle or APK claimed. The oRPC server dependency version predates this integration; no dependency patch or compiler bypass was applied. |

Logs: `reports/verger-world-final-gate.log`, `verger-world-preservation-tests.log`,
`verger-world-network-replay-final.log`, `verger-world-world-tests.log`,
`verger-world-web-build.log`, `verger-world-mobile-types.log`,
`verger-world-ui-types.log`. Raw snapshot-to-integration delta:
`reports/verger-world-reviewed-delta.patch`.

The broad anti-slop command stops at aislop findings across the dirty checkout.
Version drift initially flagged the incoming toast plus three other local
deprecated usages; the toast was corrected without editing unrelated gestures
or image-picker behavior. World color count is 4,493 against the existing
4,139 ratchet; the preserved local snapshot already had 4,492. Incoming scene
palette constants add two colors and another migrated use removes one. The
baseline was not raised. Full web TypeScript also reports unresolved shared
source imports and legacy theme indexing. None of these gates was suppressed.

The device-evidence command validates an existing fixture only; no new G5
physical-device evidence was produced. A new native client is needed to verify
the embedded fonts and Verger native module on a phone. Runtime thresholds and
release policy remain the upstream configuration choices, not newly calibrated
values. The Android export failure is logged in
`reports/verger-world-android-export.log`.
