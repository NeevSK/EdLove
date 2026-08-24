---
title: "Gurudevi Native Dependency Migration â€” RNGH v3, Sentry v8, get-random-values v2"
status: "active"
created: 2026-07-14
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [docs, current_progress, historical]
---

# Gurudevi Native Dependency Migration — RNGH v3, Sentry v8, get-random-values v2

**Status:** In progress — dependencies overridden ahead of `expo doctor` recommendations, verified locally, EAS Build not yet run.
**Owner:** Neev
**Last updated:** 2026-07-08

---

## 1. What we're doing

Moving three native-module dependencies ahead of what Expo SDK 56 (→57) officially certifies:

| Package | From | To | Type |
|---|---|---|---|
| `react-native-gesture-handler` | `2.31.1` / `2.30.0` (duplicated) | `3.0.2` | Native (New Architecture only) |
| `@sentry/react-native` | `7.11.0` | `8.13.0` | Native |
| `react-native-get-random-values` | `1.11.0` | `2.0.0` | Native (TurboModule) |

`expo doctor` flags all three as major-version mismatches against SDK 56's bundled/expected versions. SDK 57 only bumps RNGH to 2.32 — it does **not** certify v3. We are deliberately running ahead of Expo's certification timeline on all three.

## 2. Why we're doing it despite `expo doctor` warnings

Expo's compatibility tables track what Expo has *built and tested into its own prebuild/config-plugin pipeline* for a given SDK — not what's technically compatible upstream. There's a structural lag between upstream library releases and Expo's SDK cycles. `expo doctor` is deliberately conservative; it doesn't mean the newer version is broken.

We verified each package individually rather than trusting the doctor's blanket flag — see Section 4. All three checked out as safe at the source-diff level.

## 3. Why each package, specifically

- **RNGH v3** — hook-based API, better New Architecture alignment, `Gesture.Pan()`-family builder API still present (deprecated, not removed) so no forced rewrite.
- **Sentry v8** — needed for functional integrations API and current crash-tracking capabilities; old class-based integrations are being phased out upstream.
- **get-random-values v2** — TurboModule conversion, Android `SecureRandom` caching performance improvement. Required minimums (RN ≥0.81, Expo SDK ≥54) are already met.

## 4. What we've verified (evidence-based, not assumed)

### 4.1 Codebase impact — RNGH
Every import of `react-native-gesture-handler` across the monorepo, confirmed via grep:

| File | Symbols used |
|---|---|
| `packages/ui/src/components/visualization/AstroView.tsx` | `Gesture`, `GestureDetector` |
| `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx` | `Gesture`, `GestureDetector`, `GestureHandlerRootView` |
| `packages/classroom/src/components/AttendanceSheet.tsx` | `GestureHandlerRootView`, `Swipeable` |
| `packages/library/src/screens/MapScreen.tsx` | `GestureHandlerRootView` |
| `apps/gurudevi-mobile/jest-setup.ts` | `react-native-gesture-handler/jestSetup` |
| `apps/gurudevi-mobile/src/shims/gesture-handler-web.js` | web shim exports |

No `.onChange()` outside the two custom-gesture files, no `stateManager` reads in touch callbacks, no `GestureStateManager.begin()` calls, no RNGH-imported `Touchable*`/`RectButton`/`BorderlessButton` anywhere. Legacy `<Swipeable>` (not `ReanimatedSwipeable`) is what's in use in `AttendanceSheet.tsx`, so the `dragOffsetFromRight` sign-flip issue in v3's rewritten `ReanimatedSwipeable` does not apply.

**Confirmed via scoped source diff:** `PanGesture` (the class behind `Gesture.Pan()`) still exists in v3, marked `@deprecated`, fully functional — including `onChange` override. The old builder API is not removed in v3, only deprecated.

**`onEnd` cancel-semantics check — the one real landmine, checked and cleared:**
RNGH v3 replaces the `onEnd(event, success)` two-arg callback with a single event object carrying `event.canceled` (inverted: `canceled: true` ≈ old `success: false`).

Our actual `DraggableCanvasSurface.tsx` `onEnd` callback takes **zero arguments** and never read the v2 `success` param. Behavior is identical pre/post migration — `onDragEnd` and the snap-back animation fire the same way regardless of cancel state, in both versions. **No silent behavior change.**

*Optional (not required) follow-up:* if you want canceled drags to skip snap-back/`onDragEnd`, add:
```ts
.onEnd((event) => {
  if (!isDragging.value || event.canceled) return;
  ...
```

### 4.2 Third-party / transitive dependency check
No packages like `@gorhom/bottom-sheet`, `react-native-reanimated-carousel`, or similar RNGH-dependent UI libraries are installed. Navigation gestures (swipe-to-go-back) run through native OS-level stack transitions via `expo-router/stack` → `@react-navigation/native-stack`, not RNGH.

`react-native-drawer-layout` exists in the dependency tree as a **peer dependency of `expo-router` itself** (declared regardless of whether a drawer is used), not because we use a drawer navigator. Confirmed via `git grep`:
- `react-navigation/drawer` — 0 matches
- `createDrawerNavigator` — 0 matches

**No drawer-gesture migration work needed.**

### 4.3 Duplicate version resolution — outstanding
`pnpm why react-native-gesture-handler` confirms **two RNGH versions coexist** (`2.30.0` and `2.31.1`), tied to two different `expo`/`expo-router` peer resolution branches (`expo@56.0.11` vs `expo@56.0.12`). This is a pre-existing fragmentation in the tree, not something the RNGH v3 override causes — but it needs to be collapsed to one resolution before or alongside the override, or v3 may not fully replace both branches.

**Action:** confirm `pnpm why expo-router` also collapses to one version, ideally after the SDK 57 bump (do SDK 57 first, RNGH override second — see Section 6).

### 4.4 Sentry v8 toolchain floor — verified against actual project versions
| Requirement | v8 minimum | Our version | Status |
|---|---|---|---|
| Android Gradle Plugin | 7.4.0 | 8.12.0 | PASS |
| Kotlin | 1.8 | 2.1.20 | PASS |
| iOS deployment target | 15.0 | 16.4 | PASS |

All confirmed via `libs.versions.toml` and `app.json`/Expo SDK 56 minimums — not inferred.

### 4.5 get-random-values v2 — verified via real source diff
Actual diff (not changelog) confirms: TurboModule/codegen conversion, `SecureRandom` caching. Core randomness logic (`SecRandomCopyBytes` on iOS, `SecureRandom.nextBytes` on Android) unchanged in substance. Peer requirement `react-native ≥0.81`, and Expo SDK ≥54 — both met (we're on RN 0.85.3 / SDK 56.0.12).

**Live end-to-end Supabase auth test passed:** signup + signin against real Supabase project returned a valid JWT, session, and user record. Full session output captured and archived separately (not reproduced here — contains a real token).

### 4.6 Unverified / deferred
- Sentry v7→v8 full diff (25,000+ lines) — only migration-guide-level facts confirmed (functional integrations, native init changes), not a full line-by-line diff. Toolchain floors are cleared regardless (Section 4.4).
- **EAS Build has not been run.** Everything above is local-machine verification only. This is the one test that determines whether prebuild/config-plugin/native-image resolution actually succeeds — see Section 5.

## 5. What "done" actually requires

Local verification (`pnpm why`, source diffs, unit tests, local auth E2E) is necessary but **not sufficient**. EAS Build uses a fresh container with Expo's managed image (specific Xcode, Android SDK/NDK, CocoaPods cache) and regenerates native projects via `expo prebuild` from scratch. This is a different environment from anything tested so far, and is where the following could still surface:

1. **Prebuild/config-plugin mismatch** — a config plugin assuming RNGH's pre-v3 native module registration shape could generate broken native project files.
2. **CocoaPods resolution on EAS's iOS image** — get-random-values v2's podspec changed (`install_modules_dependencies`, new codegen spec files); local `pod install` success doesn't guarantee EAS's cache resolves identically.
3. **Gradle resolution for RNGH v3's New-Architecture-only build** — three simultaneous native overrides stacked could conflict over shared native dependency versions in ways only a full from-scratch build would surface.

**Required before calling this done:** a real EAS Build (not local `expo run:android/ios`) on a branch carrying all three overrides.

## 6. Recommended sequencing

1. Collapse duplicate `expo`/`expo-router` resolution branches — ideally by completing the SDK 56→57 bump first, since that should naturally collapse `expo-router` to one version.
2. Confirm `pnpm why expo-router` and `pnpm why react-native-gesture-handler` both show single resolutions post-SDK-bump.
3. Apply the RNGH v3 override on top of the now-unified tree.
4. Run a real EAS Build (both platforms) before merging to main.

## 7. If EAS Build fails

Don't guess — triage in this order:

1. **Read the actual native build log** (Gradle output or Xcode build log from the EAS dashboard), not the top-line error summary. It will point to a specific step: codegen, `pod install`, Gradle dependency resolution, or a link error.
2. **Bisect if the log is ambiguous.** Revert one override at a time — start with RNGH v3, since it's the largest native-architecture jump — and rebuild. Whichever removal makes the build pass identifies the culprit.
3. **Fix, in order of how invasive it is:**
   - **`patch-package`** — for a small native file (Gradle script, podspec line, a Java/Swift file expecting the old API). Fix it directly in `node_modules`, snapshot with `patch-package`, it reapplies automatically on install. This is the standard way to run ahead of a library's official framework support. *(Note: some patches may already exist in this repo — check for overlap before adding a new one.)*
   - **Custom Expo config plugin** — if the problem is Expo's prebuild generating wrong native config (not the library itself), a config plugin can correct the generated `android/`/`ios/` output post-prebuild.
   - **Fork-and-pin** — for something structural, fork the package, apply the fix, point `pnpm` at the fork/tarball instead of the registry version.

None of these are exotic; they're the normal toolkit for running ahead of Expo's certification cycle.

## 8. Rollback

If the override needs to be fully reverted:
```bash
git checkout package.json apps/gurudevi-mobile/package.json packages/library/package.json packages/graphics/package.json pnpm-lock.yaml
pnpm install
```
Confirms package.json/lockfile return to pristine state, followed by a clean reinstall.

## 9. Manual verification checklist (post-build, on device/emulator)

- [ ] `AstroView.tsx` — pinch-to-zoom and multi-finger pan, smooth, no lockups or frame drops.
- [ ] `DraggableCanvasSurface.tsx` — long-press activates, springs outward, drag + snap-back fluid.
- [ ] `AttendanceSheet.tsx` — swipe left/right registers present/absent correctly.
- [ ] Supabase signup + login flow — real session token generated, no crash (already passed locally; re-confirm on EAS-built binary).
- [ ] Sentry crash reporting — trigger a test crash/error, confirm it reports.
- [ ] `pnpm why react-native-gesture-handler` post-build — single resolved version, no duplicates.
