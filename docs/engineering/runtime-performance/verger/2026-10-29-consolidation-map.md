---
title: "Verger consolidation map: every source compared by function"
status: active
created: 2026-10-29
updated: 2026-10-29
author: "Naveen"
tags: [verger, consolidation, integration, audit]
---

# Verger consolidation map

One pass over every place Verger code lived, judged by one rule: **a version is kept or
dropped by what it does, not by when it was written.** An older version that does something
the current tree does not is a loss until shown otherwise.

## Sources examined

| Source | What it is | Verger content |
|---|---|---|
| `integrate/worlds-and-upstream` (this checkout) | Current tree | Baseline |
| `origin/feat/adaptive-runtime` | Original Verger branch | Fully merged into this branch |
| `codex/verger-android-v2` + its worktree | Android binding rewritten on Expo Modules API 2.0, A52 device evidence | 2 commits and uncommitted edits not merged |
| `checkpoint/wip-working-tree`, `codex/original-checkout-before-wsl-20261027` | Recovery snapshots | No Verger file absent here |
| `refs/codex-backups/verger-v2-before`, `verger-v2-workspace`, `verger-world`, `verger-world-integrated` | Local backup refs | Older Verger, plus the retired governor |
| WSL `/home/nsk/projects/polymath-platform` | August `expo-57` working copy, 4,209 uncommitted files | 149 Verger-scope files |
| WSL `verger-v2-verification-20261027/{client,client-v1,candidate,baseline}` | Native verification staging copies | 634 Verger-scope files |
| Stashes `stash@{0..1}` | lint-staged backups | No Verger files |

## Method

1. Every Verger-scope file in WSL was hashed and looked up in this repository's object store:
   781 of 783 match a version already in git history; the 2 that do not are a TypeScript build
   cache and a whitespace-only variant of `expo-module.config.json`.
2. Every version of every Verger-scope file in any ref (1,290 file versions, 2,775 distinct
   symbols: exports, functions, Kotlin methods and JS bindings, test names, doc headings, package
   exports and scripts) was compared with the whole current tree, so code that moved still counts.
   157 symbols exist in history but nowhere now. Each was judged below.

## Brought in or restored

| What | From | Why it was missing | Change |
|---|---|---|---|
| Mobile JS device signals (`networkEventOf`, `batteryEventOf`, `storageEventOf`, `networkSnapshotEventOf`, imports) | `d85db3aae^1` | The worlds merge cut the first 87 lines of `deviceSignals.ts`; the file threw at runtime, so Verger had no JS battery, network or storage readings and background admission failed | Restored verbatim |
| Hermes heap compaction on memory pressure | Old `OptionalStartupServices` (`be4ddacec`) | Lost when optional startup moved to Verger; nothing called `reclaimHermesMemory` on pressure | Re-wired from `snapshot.memory` (`trimmed` constrained, `low` severe), once per entry; queries untouched, as before |
| Android binding on Expo Modules API 2.0 | `8aee62a7b` | Kept isolated pending acceptance; has compile, 48/48 JVM and A52 G5 evidence | `VergerModule.kt`, binding test, Gradle, module config, README, docs, device record |
| Web world scene budget | (new) | `WorldGroundSurface` passed a hard-coded full budget | Reads `useGurudeviView`; hidden pages hold still; no floor before Verger is read |
| Web embers | (new) | `FloorAtmosphere` ran its own particle loop | Runs only when Verger allows ambient effects; the OS reduced-motion check is kept |
| Gate in CI | (new) | `verger:check` ran only by hand | Required step in `pr-guard.yml`; gate also covers `packages/core/src/scene` and `apps/gurudevi-web/tests/unit/runtime` |

## Missing now, judged equivalent or intentionally retired

| Symbols | Verdict | Evidence |
|---|---|---|
| `RealityProvider`, `visualPolicy`, `experiencePolicy`, `realitySignals`, `utils.detectNetworkQuality`, `VisualCapabilities` legacy tests | Retired by design | `drift-record.md`: 5,760-case differential with every difference named |
| `@repo/core/efficiency` policy, visual budget, wallpaper, runtime conditions, observability | Retired by design | `drift-record.md` "What moved later"; replaced by `experienceOf`, `wallpaperOf`, `vergerFloors`, `admitWork`, verger telemetry |
| `workAdmission` pressure latch and 30 s recovery window | Equivalent | `optionalConcurrency` (reducer) closes on low memory or critical heat, caps at 1 when trimmed, with Verger's own hysteresis |
| Storage "no disk visibility, no maintenance" | Intentionally reversed | Doctrine: unknown is never a limit; `storage-eviction` workload spends the storage account |
| `useBrowserVisualBudget`, `VergerProvider`, `RuntimeExecutive`, `governor.ts`, `toGovernorEvent` | Retired or renamed | Provider-less hooks; governor vocabulary renamed to Verger |
| `verger.test` "death during native start", `cpuBoost` R9, `vergerLab` patch test, golden "governor decisions" | Renamed and strengthened | Present now as "the next launch calls nothing native at all", three CPU-boost cases, "patch and thresholds only when they applied" |
| `P8_PENDING`, `SLOW_LINK_KBPS`, `LOW_MEMORY_DEVICE_BYTES` | Retired | Stability suite has no exemptions; thresholds live in `DEFAULT_VERGER_CONFIG` |
| `WorldFonts` `loadSinhala` / `loadTamil` | Moved | `worldFontFiles` and `packages/ui/src/world/faces.ts` |
| Uncommitted `VergerRoot` edit in the v2 worktree (removes `PresenceBoundary`) | Superseded | This tree keeps `PresenceBoundary` and adds `reportVergerInteraction` for hosts that report presence |

## Still open

| Item | Needs |
|---|---|
| `modules/runtime-pressure`: old native module still autolinked; registers trim and thermal listeners on every launch; nothing reads it | Naveen's sign-off to retire (Deletion Veto) |
| `boot/runtimePressureRecovery.ts`, `boot/runtimeGovernorTelemetry.ts`: imported only by their tests | Same decision |
| Android binding (Expo Modules API 2.0) compiled and tested only in the isolated worktree | `pnpm verger:android-jvm` and a dev-client build in this checkout |
| Uncommitted startup/splash work in the v2 worktree (not Verger) | Its own session; P0 journey |
| Non-Verger web tests absent since 2026-10-17/20 (`syncStatusPill`, `selfFloor` rail, `accountQueryIsolationScenario`, `wallpaperUploadControl`, `workspaceCapacity`) | Check outside this pass |
| Mobile local pnpm cannot fetch the pinned 12.15 binary; the gate ran with version switching off | Toolchain fix |

## Evidence

```text
G0 static / tsc - five Verger packages: 5/5 clean.
G1-G3 / Vitest (jsdom, substituted platforms) - pnpm verger:check: ALL_PASS=1, 589 cases
  (verger-core 305, verger-android 25, verger-web 18, Gurudevi host + scene 157,
   UI context 10, mobile runtime 58, web Verger 16).
  Before this change the same gate was ALL_PASS=0 (5 deviceSignals failures).
New tests: memoryReclaim 2/2, FloorAtmosphere budget 3/3, WorldGroundSurface verger 3/3;
  the Verger assertions in each fail against the previous code.
Proves: the named contracts under substituted devices, browsers and Hermes.
Does not prove: a phone or browser run, the v2 Kotlin build in this checkout, or that
  forced GC relieves real memory pressure.
```

Type checks outside the gate: mobile has 1 error (`ExternalLinkContext.tsx`, untouched);
web has 5, all in the uncommitted worlds work (`WorldGroundSurface` world-id indexing and
ground modes, `SanctuaryFloorCanvas` room type), none on a line this pass changed.
