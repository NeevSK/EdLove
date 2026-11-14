---
title: "Windows profiling continuation and onboarding crash investigation"
status: active
created: 2026-10-27
updated: 2026-10-27
author: Codex
tags: [startup, android, profiling, world, onboarding, verger]
---

# Session and scope

Continues the [startup and sandbox plan](../architecture/2026-10-27-startup-sandbox-world-profiling-plan.md) after the [source preservation audit](../../../../docs/current_progress/2026-10-27-wsl-windows-preservation-audit.md). Ubuntu remains stopped. The physical A52 (`R58T33Y0E3M`, API 34) and Windows Metro on port 8081 remain reachable. Metro's process command points to the isolated Windows worktree's mobile app.

The default agent-device state retained an unreachable 0.21.28 daemon record. Installed agent-device 0.21.29 worked with a separate state directory, `E:\CodexArtifacts\agent-device-verger-20261027`, session `verger-startup-windows`. The existing daemon state was not deleted or force-recovered. Current CLI help and the [0.21.29 release](https://github.com/callstack/agent-device/releases/tag/v0.21.29) ground the commands used. No package upgrade was performed.

# Feature spec: native success feedback composition

- Blast zone: AMBER, shared UI component `packages/ui/src/components/Success.tsx`.
- Reuses: existing World tokens, visual capabilities, Reanimated CSS keyframes and caller style precedence.
- Invariant: native success feedback accepts both animated and static styles without attempting to iterate an object.
- Change: retain the conditional style object as an element in the style array, rather than spreading it into the array.
- Boundaries: no changes to onboarding admission, identity, animation policy, fallback selection, tokens or dependencies.
- Verification: focused boundary regression checks, then actual candidate device journey; UI type/lint gates remain separately reported.

# Observed failure and candidate fix

The app initially displayed the `OnboardingRoute` error boundary. React DevTools inspection of that boundary's state and the Metro stack both identify `TypeError: iterator method is not callable`, at `SuccessCheck`, line 82. `CelebrationOverlay` reaches this component on its reduced-motion/static path. The conditional produces an object on both branches; array-spreading it throws before rendering.

The patch removes that array spread and preserves the conditional style. `Success.test.tsx` calls the actual component with mocked World/visual-capability hooks and checks construction and caller-style ordering with subtle motion false and true. G1 boundary / Vitest 5.0.5, vitest-native mock engine (iOS platform): 2/2 cases passed. This proves component construction under those substitutions; it does not prove native animation playback, Android rendering or full onboarding completion.

G0 checks are not green: `pnpm --filter @repo/ui exec tsc --build --noEmit` fails on unresolved core imports/exports across the graph. Scoped Oxlint reports an existing synchronous set-state effect in `SuccessGlow` plus warnings. Neither diagnostic was suppressed or weakened. `git diff --check` is clean. RN-Terrain's strict affordance command inspected actual installed Reanimated 4.7.1 declarations (178 symbols); the installed CSS animation types were also inspected.

# Live sequence and capture limits

1. Opened the isolated v2 client, observed and inspected its error boundary.
2. Applied the candidate source fix, then used Restore view to return to onboarding. A React recovery profile was captured and saved.
3. Entered `dev::sandbox` via the normal name field, verified its value, continued to the Sandbox Console, then submitted its default teacher/FREE/WANDERER profile through Fast-Track Profile.
4. That submission still encountered the old iterator failure before an explicit JS reload. Updated symbolicated source text alone is insufficient proof that the running function received the edit. Do not count that attempt as fixed-device acceptance.
5. Explicit `metro reload` succeeded. The log subsequently reached tab-shell/GlobalHeader code, but a screenshot showed a black app surface and React DevTools Runtime.evaluate timed out. A reached route log is not usable-screen acceptance. A data-preserving candidate relaunch was then initiated for recovery.

All operations target `app.gurudevi.sanctuary.vergerv2.dev`; the original development app's data was not cleared. Samsung keyboard dismissal was unsupported by the tool; normal Back dismissed it, after which the input was filled and its value verified.

# Measurements collected

Artifacts are under `E:\CodexArtifacts\verger-20261027` and the separate agent-device state directory above. These are diagnostic passes, not clean startup baselines:

| Artifact | Evidence and limitation |
| --- | --- |
| `onboarding-recovery-react-profile.json` | 40,969 ms recording, 22 commits, 3,247.285 ms aggregate render, worst commit 325.014 ms. Tool reports CSS context-driven rendering associated with OptionalStartupServices/WorldFonts. Attribution is a lead requiring source/commit inspection, not causal proof. |
| `sandbox-entry-react-profile.json` | 19,282 ms recording, 22 commits, 3,501.21 ms aggregate render, worst commit 523.82 ms. Includes LogBox/error presentation; do not attribute its diagnostic UI costs to normal app startup. |
| `sandbox-entry-after-success-fix.perfetto-trace` | Despite its provisional filename, this captures the first, still-failing submission. Successful Windows native capture, 35,066 ms, 20,546,872 bytes. Agent-device reports 10/16 sampled frames missed deadlines; gfxinfo sample is bounded and is not a whole-session jank rate or Perfetto root-cause analysis. |
| `sandbox-entry-errors.json` | DevTools errors include repeated disabled-entitlement missing-queryFn errors and the iterator crash. |
| `sandbox-console-restored.json`, `sandbox-entry-after-submit.json` | Accessibility evidence for console and subsequent error destination. |
| `after-metro-reload.png` | Black surface following explicit reload. |

The tool's initial open reported 1,708 ms using `open-command-roundtrip`. This is not TTI, cold launch or the first useful screen metric.

The candidate relaunch completed (7,523 ms tool roundtrip), but the blank shell and Runtime.evaluate timeout persisted. A subsequent Android `top` snapshot showed candidate PID 16054 at approximately 128% CPU and 1.4 GB RES; this is a point sample, not a sustained CPU average or a leak proof. Simpleperf capture was attempted but failed opening `cpu-clock:u` with Permission denied. Do not claim a CPU profile from that attempt. The separate `blank-shell-memory.json` sample reports 1,579,978 kB PSS, 1,675,784 kB RSS and 987,181 kB native-heap PSS. The candidate session was then closed without clearing data. Investigate this persisted shell failure before any v1/v2 timing comparison.

Additional G0 checks: CNG firewall exits 0. Native anti-slop sentinel exits 0 with one review finding on the pre-existing inline SuccessGlow style. These do not replace the failed type/lint checks or pending physical acceptance of the style fix.

Metro also repeatedly logs SSE connection failures to localhost:3000. Check the intended Windows API setup and retry implementation before treating them as a product-network defect. The disabled-entitlement queryFn diagnostic, CSS variable remount warnings, blank tab shell and success-feedback live acceptance remain active investigations. No performance improvement, full World compliance or matched v1/v2 acceptance is claimed.

# Feature spec: identity-absent entitlement query

AMBER target: `packages/core/src/hooks/useEntitlementQuery.ts` and its existing test. Reuse TanStack Query's installed `skipToken` sentinel for the existing disabled key when principal identity is absent. Keep `enabled` false, data null, readiness unknown, and perform no entitlement adapter read. Keep all qualified-identity options, offline snapshot validation, cancellation and returned guards unchanged. Do not introduce a default query function or manufacture an entitlement snapshot. Verification: a server-rendered React/QueryClient boundary test must reproduce the exact diagnostic before the fix, then stop emitting it afterward; existing scope/offline/cancellation assertions must remain green. This does not prove Android UI behavior or resolve the blank shell by itself.

# Feature spec: Self canvas external-store snapshot stability

AMBER target: `src/hooks/useSelfCanvas.ts` and its existing pin-ownership tests. Device logs identify `useSelfCanvas` at the uncached `getSnapshot` warning, followed by maximum update depth failures. Two selectors allocate empty fallback arrays: missing scope bonds and missing Self pins. Installed Zustand 5.0.16 reads selected values through React's `useSyncExternalStore`; equal store state must produce a stable selected reference. Reuse its `useShallow` hook around these selectors, preserving array contents and immutable update detection. Do not alter scope, layout ownership, pin persistence, capacity filtering, auth or Verger policy. Strengthen the existing test's null-scope boundary to use a real Zustand store so React detects the original loop; retain all existing pin assertions. Physical usable-screen replay remains required after patching.
