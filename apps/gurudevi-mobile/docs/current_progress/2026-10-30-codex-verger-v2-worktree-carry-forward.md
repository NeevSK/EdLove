---
title: "Codex Verger v2 worktree: integration audit and carry-forward"
status: active
created: 2026-10-30
updated: 2026-10-30
author: Claude
tags: [startup, splash, verger, android, carry-forward]
---

# Scope

Audit of `C:/Users/Naween/.codex/worktrees/verger-android-v2/x` (branch `codex/verger-android-v2`, tip `1ab9e7e63`, plus 11 uncommitted paths) before the user removes it to recover disk space. Question: what does it hold that the main checkout (`C:/x`, `integrate/worlds-and-upstream`) lacks? No native or JS builds were run.

# Method

All 1,669 paths changed between the merge base (`e0c32b3fb`) and the worktree's working tree were hashed on both sides and three-way compared against `C:/x`'s working tree.

- 1,354 identical to `C:/x`.
- Commit `785958472` ("Local workspace snapshot") is a copy of `C:/x`'s dirty tree on 2026-10-27. Of its 305 differing files, 255 are blobs already in `C:/x` history. The other 50 are in-flight web and core edits that `C:/x` has since rewritten. None is carried over.
- The 50 snapshot files not in history were checked line by line against `C:/x` by functionality. Their remaining lines are only old wiring: imports from the retired `demoProvider`, the central `sandboxDataset` list (all 9 domains now self-register, alongside 19 more), and `@repo/ui/world` / `@repo/core/scene` paths (moved to `@repo/ui/theme` in Phase 0). The profile, settings, library and curator features are all present in `C:/x`. Nothing was carried. The web prototypes `living-domain` and `worlds-showroom` were removed in `6d90936b4` and remain in history.
- Codex's own work: commits `8aee62a7b`, `57bf1e04b` and `1ab9e7e63`, plus the uncommitted edits, 54 paths in all.

# Already in C:/x

- Verger Android Expo Modules 2.0 binding, `VergerModuleBindingTest.kt`, build and module config, and the A52 device evidence JSON (brought in 2026-10-29). `C:/x` is the newer side.
- `PresenceBoundary` wrapper removed from `VergerRoot`; presence now comes from the RNGH root in `EntryShell`.
- `SuccessCheck` native style no longer array-spreads its conditional style (the onboarding `iterator method is not callable` crash).
- Entitlement query with no identity uses `skipToken`.
- `useSelfCanvas` stable empty snapshots (here via module constants, with tests at `selfCanvasPins.test.tsx`).
- Mascot, splash-poster and animation assets, the profileable/Gradle config plugins, and their `.gitignore` exceptions.

# Brought over

| Path | Note |
| --- | --- |
| `packages/ui/src/__tests__/Success.test.tsx` | Mock path updated to `../theme/native/WorldContext` |
| `.argent/flows/*-20261027.yaml` (2) | Welcome to sandbox device flows |
| `apps/gurudevi-mobile/docs/architecture/2026-10-27-startup-sandbox-world-profiling-plan.md` | |
| `apps/gurudevi-mobile/docs/current_progress/2026-10-27-windows-profiling-continuation.md` | Codex device session log; open items below |
| `docs/current_progress/2026-10-27-wsl-windows-preservation-audit.md` | |
| `reports/device-evidence/verger-v2-sandbox-console-20261027.png` | |

# Seam carried forward: native splash release

Codex moved the native splash release out of `EntryShell`'s first frame and into `SessionRouteGate`, so the first visible frame is the admitted route instead of a "Continue to …" transition. Its version had two gaps: a failed startup stayed hidden under the splash, and a stuck transition never released it. The port keeps `C:/x`'s fallbacks:

- `SessionRouteGate` releases the splash when its presentation is not `transition`. A transition that lasts 8 s releases it anyway, so the existing Continue button can be reached. The restore wait timer now covers both waits.
- `EntryStartupBoundary` keeps the splash up while startup runs, releases it at once on failure (error and retry visible), and releases it after 8 s if startup stalls.
- `EntryShell` keeps its `first-shell-frame` trace and only releases the splash as an 8 s safety net, for an error boundary above the gate or the development concept preview.
- `nativeSplashService` hides once (`NATIVE_SPLASH_MAX_HOLD_MS`, release-once guard). The new trace `admitted-route-frame` marks the gate's release.

Not carried: Codex's `EntryLoadingSurface`. It imports legacy `@repo/ui` primitives and hard-coded colours, which the UI legacy ratchet forbids. Codex also dropped the transition Continue button and the restore escape hatch, which would need sign-off under the deletion veto. Not carried either: Codex's identity-absent entitlement render test, because it imports `react-dom/server`, which `@repo/core` does not declare.

Evidence: G1 boundary / Vitest 5.0.5. `SessionRouteGate.test.tsx` adds splash-over-transition and transition-timeout cases, and `native-splash-service.test.ts` adds release-once. Does not prove: real splash timing on device, Expo Router commit order on Android, or the error-boundary path.

# Open items from the Codex session (still unverified)

1. Blank tab shell after an explicit Metro reload, with about 128% CPU and 1.4 GB RSS on the A52 (point samples). Investigate before any v1/v2 timing comparison.
2. Live acceptance of the `SuccessCheck` fix on onboarding completion. It was not confirmed on the running client.
3. Repeated SSE connection failures to `localhost:3000` under Windows Metro: check the intended API setup and retry policy.
4. CSS variable remount warnings and the `OptionalStartupServices`/`WorldFonts` render cost lead (profile attribution, not cause).
5. Verger v2 full qualification: API 36 CPU headroom, positive CPU hints, lower-memory comparison, release shrinking.
6. Device check of this splash seam: cold start to Welcome, guest to Self, and forced startup failure.

Raw artifacts named in the Codex log live under `E:/CodexArtifacts/verger-20261027` and are unaffected by removing the worktree. The worktree's 47 git-ignored `reports/` logs and screenshots (17.6 MB) were copied to `E:/CodexArtifacts/verger-20261027/worktree-reports`. The branch `codex/verger-android-v2` stays in `C:/x`'s repository; removing the worktree folder does not delete its commits.

The worktree was removed on 2026-10-30 (`git worktree remove`, folder deleted). Its uncommitted diff, the untracked `EntryLoadingSurface.tsx` and the audit tables are saved in `E:/CodexArtifacts/verger-20261027/worktree-uncommitted`. Kept: branch `codex/verger-android-v2` and the four `refs/codex-backups/*-20261027` refs.
