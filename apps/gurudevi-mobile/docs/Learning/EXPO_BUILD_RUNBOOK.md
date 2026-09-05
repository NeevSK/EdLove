---
title: "Expo CNG Build Runbook"
status: "active"
created: 2026-08-03
updated: 2026-09-05
author: "Naveen"
scribe: "Antigravity"
tags: [mobile, build, expo, gradle, android]
---

# Expo CNG Build Runbook

> **The definitive guide for building Gurudevi mobile on Expo 57 / RN 0.86.**
> This app uses **Continuous Native Generation (CNG)** — the native `android/` and `ios/` directories are **ephemeral build artifacts**, not source code.

---

## 1. The CNG Model (understand this first)

In managed Expo, `android/` and `ios/` are **generated** from your `app.json` config + plugins every time you run `npx expo prebuild`. They are **ephemeral** — like compiled output.

**Single source of truth**: `apps/gurudevi-mobile/app.json` and `apps/gurudevi-mobile/plugins/`.

| ✅ Source of truth | ❌ Never edit directly |
|---|---|
| `app.json` (config plugins) | `android/build.gradle` |
| `plugins/*.js` (custom config plugins) | `android/app/build.gradle` |
| `android/gradle.properties` (generated) | `android/settings.gradle` |

If you hand-edit `android/build.gradle`, your changes **will be wiped** the next time `prebuild` runs. All native configuration must be declared in `app.json` or `plugins/`.

---

## 2. Plugin Architecture

This app has **6 custom config plugins** that inject native configuration during prebuild:

### Plugin table (current as of 2026-08-03)

| Plugin | Target file | Purpose |
|---|---|---|
| `plugins/withMavenRepos.js` | Optional custom Maven repository hook | Use only for a verified custom artifact repository |
| `plugins/withAndroidCruncherDisabled.js` | `android/app/build.gradle` | Disables AAPT PNG crunching |
| `plugins/withGradleProperties.js` | `android/gradle.properties` + `android/app/build.gradle` | JVM memory, parallel=false, arch, lint ignore, bridgeless |
| `plugins/withSentryGradleDisabled.js` | `android/app/build.gradle` | Comments out sentry.gradle apply |
| `plugins/withSentryProperties.js` | `android/sentry.properties` | Injects Sentry org/project |
| `expo-build-properties` | `android/gradle.properties` | Adds `extraMavenRepos` for allprojects via autolinking |

### Plugin ordering (app.json)

Plugins execute in array order. For gradle plugins, this matters:

```
1. withMavenRepos           → root build.gradle (buildscript)
2. withAndroidCruncherDisabled  → app build.gradle (android{})
3. withGradleProperties      → gradle.properties + app build.gradle (lint, bridgeless)
4. expo-build-properties     → gradle.properties (extraMavenRepos → allprojects)
```

### Adding a new native mutation

1. Create `plugins/withYourNewThing.js` using the shared helper:
   ```js
   const { ensureAndroidBlockSnippets } = require('./lib/buildGradleBlock');
   ```
2. Register it in `app.json` plugins array **before** `expo-build-properties` but **after** `withMavenRepos`.
3. The helper's `ensureAndroidBlockSnippets()` takes `{ breadcrumb, code }` objects. The `breadcrumb` is a unique string used to detect prior application (idempotency key).

### Maven repo injection (two mechanisms)

Custom Maven repositories are injected via **two** paths when a verified custom repository is required:

1. **`buildscript.repositories`** — via the optional custom repository plugin. Covers Gradle classpath/plugin resolution.
2. **`allprojects.repositories`** — via `expo-build-properties` `android.extraMavenRepos`. Covers native library resolution.

The former `https://packages.expo.dev/maven` entry is intentionally disabled because it returned HTML instead of Maven XML. Standard Expo SDK dependencies resolve through Google/Maven Central; add a custom URL only after validating its POM responses.

Both survive `prebuild --clean` because they're declared in `app.json`/`plugins/`.

---

## 3. Build Commands

### Local development (connected device or emulator)

```bash
# Start Metro bundler (dev mode)
pnpm --filter gurudevi-mobile start

# Run on Android (generates android/ then builds)
pnpm --filter gurudevi-mobile android

# This internally runs: expo run:android
# Which does: prebuild → gradle assembleDebug → install
```

### EAS Build (cloud)

```bash
# Development build (APK, internal distribution)
pnpm --filter gurudevi-mobile build:dev

# Preview build (APK, internal)
pnpm --filter gurudevi-mobile build:preview

# Production build (AAB, Play Store)
pnpm --filter gurudevi-mobile build:prod
```

### Local development build (WSL 2 + physical Android device) — PRIMARY WORKFLOW

> [!IMPORTANT]
> **Standard Build Target is Debug (`:app:assembleDebug`)**.
> Always use the Debug development client APK for daily engineering and physical device testing. Release builds (`assembleRelease`) are strictly on-demand and built **only when explicitly requested**.
>
> **Build Environment**: Always build inside **WSL 2 (Ubuntu)** from the active workspace mount (`/mnt/c/x/apps/gurudevi-mobile/android`).
> Do **NOT** build inside separate static clones (such as `/home/<user>/polymath-platform-wsl`), as that will compile stale code and generate outdated APKs.
> Do **NOT** build native Android on Windows host directly to avoid MAX_PATH and Ninja manifest loops.

To build the **Development Client APK** (debug build) directly inside WSL 2:

```bash
# In WSL 2 (Ubuntu) from repo root:
./scripts/build-wsl-dev-client.sh
```

Or run directly from the android directory in WSL 2:

```bash
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'

if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
fi

cd /mnt/c/x/apps/gurudevi-mobile/android
./gradlew :app:assembleDebug --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --console=plain
```

Once built, install the Debug APK directly to your connected device from Windows PowerShell:

```powershell
# 1. Reverse Metro dev server port
adb reverse tcp:8081 tcp:8081

# 2. Install the newly built Debug APK
adb install -r apps\gurudevi-mobile\android\app\build\outputs\apk\debug\app-debug.apk

# 3. Start Metro on Windows host (if not already running)
pnpm --filter gurudevi-mobile start
```

### Local standalone release APK (WSL 2 + physical Android device) — ON-DEMAND ONLY

> [!WARNING]
> **Release builds are strictly on-demand**.
> Only run `assembleRelease` when explicitly requested by the user (e.g. for pre-submission production smoke-testing). Daily testing must always use the Debug development build above.

Run from the generated Android directory in WSL 2:

```bash
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'

cd /mnt/c/x/apps/gurudevi-mobile/android
doppler run --no-fallback -- ./gradlew :app:assembleRelease --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --console=plain
```

Install the Release APK from Windows PowerShell:

```powershell
adb install -r apps\gurudevi-mobile\android\app\build\outputs\apk\release\app-release.apk
```

### Release verification gate

Do not call a build successful only because Gradle produced an APK. Verify all
three layers:

1. `BUILD SUCCESSFUL` from Gradle.
2. `adb install -r` succeeds and the launcher starts `org.edlove.gurudevi`.
3. After 10–15 seconds, `adb shell pidof org.edlove.gurudevi` is non-empty,
   logcat has no fatal exception, and the phone shows the app UI rather than a
   blank/black surface.

Useful clean-launch checks:

```powershell
adb logcat -c
adb shell am force-stop org.edlove.gurudevi
adb shell monkey -p org.edlove.gurudevi -c android.intent.category.LAUNCHER 1
Start-Sleep -Seconds 12
adb shell pidof org.edlove.gurudevi
adb logcat -d -v threadtime | Select-String 'FATAL EXCEPTION|ReactNativeJS: .*Error|crash : org.edlove.gurudevi'
```

An alive process with a black screen is not a pass. Check the focused window,
device unlock state, splash-screen logs, and the first JavaScript exception.

### Startup visual contract: native splash → app splash → welcome

These are three different layers and must be verified separately:

1. **Native splash:** controlled by the `expo-splash-screen` plugin in
   `app.json`. The current repository configuration points to
   `assets/splash-icon.png`; changing the JavaScript route does not change this
   image. If that asset is not the approved Gurudevi artwork, the APK will show
   the wrong artwork before JavaScript starts.
2. **App splash:** `app/index.tsx` renders `assets/splash-animation.json`. It is
   finite and must navigate to `/welcome`; it must never be an infinite loop.
3. **Welcome route:** `app/welcome.tsx` renders the real welcome screen. A
   device test is not complete until the native splash disappears and the
   welcome route is visible.

The post-bootstrap handoff is deliberate and must remain in this order:

```text
native splash (Expo) → React shell commits → next animation frame hides native splash
→ finite Lottie index route → /welcome for a public session
→ /onboarding or /self when the session route guard resolves otherwise
```

Native splash must not wait for remote auth/profile calls or fonts. Those can be
slow, unavailable, or cancelled, and delaying the native splash until they
finish makes the visual sequence nondeterministic. `AppContent` schedules the
handoff after its first committed frame; the index route then owns the finite
Lottie transition and has one guarded completion path shared by the animation
callback and timeout fallback.

Google One-Tap is configured only after critical boot succeeds. Configuration
does not show a prompt; it only prepares Credential Manager. The actual Google
UI appears only after the user opens `/auth` and taps the sign-in action. The
sign-in call reuses the same idempotent configuration, so a fast user action
cannot race deferred startup.

### Production session and offline-capability contract

Authentication and capabilities are deliberately different concerns. Restoring
a Supabase session is local and may work without a network, but creating a new
credential, refreshing an expired credential, Google sign-in, and fetching a
previously unseen profile require the network. The app must never treat a
persisted profile record as proof of authorization.

For an offline return, the route guard accepts only a hydrated entitlement
snapshot that is fresh, marked `verified` or `cached`, and belongs to the same
Supabase user ID as the restored session. That snapshot is the local authority
for feature continuity; individual actions remain protected by the signed
Cedar permission snapshot and the local data store. A stale, missing, or
other-user snapshot is rejected and cannot route into the authenticated app.

If the profile/capability request fails and no valid local snapshot exists,
Gurudevi keeps the public shell on screen, preserves local data, shows a
retryable capability-recovery notice, and does not use a timer to guess that
authorization is safe. This is the intended production failure mode. Test the
owner match, stale-snapshot rejection, offline return, and retry notice before
changing session or entitlement persistence.

The current source contains a target/grid placeholder for the native splash,
while the available marketing artwork lives outside the mobile app. Do not
silently substitute one for the other: approve the intended artwork first,
then wire that exact asset through `app.json` and regenerate native artifacts.

### Native migration validation in CI

For Expo/NativeWind/Gluestack dependency or styling-engine changes, use the repository workflow after pushing the intended commit. It runs the Expo native-graph, NativeWind style-stack, and legacy-interop gates before the long Android build:

```bash
gh workflow run android-build.yml --repo NeevSK/Gurudevi \
  -f profile=development -f build_method=local -f build_type=apk
gh run list --repo NeevSK/Gurudevi --workflow android-build.yml --limit 5
gh run view <run-id> --repo NeevSK/Gurudevi --log-failed
```

Do not treat a successful web export or TypeScript build as native proof. The native gate requires Gradle completion and a device/emulator startup check.

### Manual prebuild (rarely needed)

```bash
# Regenerate android/ from app.json
pnpm --filter gurudevi-mobile exec expo prebuild --no-install --platform android

# Clean + regenerate (DESTROYS android/ then rebuilds)
pnpm --filter gurudevi-mobile exec expo prebuild --clean --no-install
# ⚠️ WARNING: --clean wipes android/ and rebuilds from scratch.
# Only use when you suspect stale generated code.
```

### Inspect resolved config

```bash
# See full resolved Expo config
pnpm --filter gurudevi-mobile exec expo config --type prebuild

# Check which plugins are applied
pnpm --filter gurudevi-mobile exec expo config --type public
```

---

## 4. Architecture Selection (GRADLE_ABI)

Default: **`arm64-v8a` only** (fastest build, matches CI intent).

To build for other ABIs (e.g. x86_64 for emulators):

```bash
# Single ABI
$env:GRADLE_ABI = "x86_64"
pnpm --filter gurudevi-mobile android

# All ABIs (slowest, widest device support)
$env:GRADLE_ABI = "arm64-v8a,x86_64,armeabi-v7a,x86"
pnpm --filter gurudevi-mobile android
```

The `GRADLE_ABI` env var is read by `plugins/withGradleProperties.js` and written to `reactNativeArchitectures` in `gradle.properties`.

---

## 5. Git Workflow

### Branching

- **`expo-57-gluestack-v5-rngh-v3`** — active development branch (bleeding edge)
- **`main-dev`** — integration branch
- **`main`** — production

### What to commit

| ✅ Commit | ❌ Never commit |
|---|---|
| `apps/gurudevi-mobile/app.json` | `android/` (ephemeral) |
| `apps/gurudevi-mobile/plugins/*.js` | `ios/` (ephemeral) |
| `apps/gurudevi-mobile/package.json` | `node_modules/` |
| `pnpm-lock.yaml` | `.expo/` |

The `android/` and `ios/` directories are **gitignored** (`.gitignore` lines 46-48). If you see untracked files under `android/`, that's expected — they're generated.

### Merging to main-dev → main

When the branch is stable:

```bash
# 1. Merge feature branch → main-dev
git checkout main-dev
git merge expo-57-gluestack-v5-rngh-v3

# 2. Test on main-dev
pnpm --filter gurudevi-mobile android

# 3. Merge main-dev → main (production)
git checkout main
git merge main-dev
```

**Never rebase** a long-lived branch — use merge to preserve history.

---

## 6. Version Pinning

This app intentionally uses **newer-than-Expo-recommended** versions for several packages:

### Intentional overrides (do NOT run `expo install --fix`)

| Package | Pinned version | Why |
|---|---|---|
| `react-native-gesture-handler` | 3.0.2 | New architecture support |
| `react-native-reanimated` | 4.5.0 | New architecture support |
| `react-native-worklets` | 0.11.1 | Required by reanimated 4.x |
| `react-native-mmkv` | 4.3.2 | Nitro modules (v4) |
| `react-native-nitro-modules` | 0.36.1 | Required by mmkv 4.x |
| `@shopify/react-native-skia` | 2.6.5 | New architecture support |
| `typescript` | 7.0.2 | Latest stable |

These are whitelisted in `package.json` under `expo.doctor` and `expo.install.exclude`. **Do not remove these exclusions.**

### Running expo doctor

```bash
# Check package health (diagnostic only)
pnpm --filter gurudevi-mobile exec expo-doctor

# ⚠️ NEVER run: npx expo install --fix
# This would downgrade our intentional overrides.
```

---

## 7. Troubleshooting

### Build fails with "Could not find ... in Maven repositories"

The Expo Maven repo is missing from the build. Verify:

```bash
# Check app.json has extraMavenRepos
cat apps/gurudevi-mobile/app.json | grep -A5 "extraMavenRepos"

# Check plugins are wired
cat apps/gurudevi-mobile/app.json | grep "withMavenRepos"

# Regenerate android/ to pick up changes
pnpm --filter gurudevi-mobile exec expo prebuild --no-install --platform android
```

### "Duplicate class" or "Duplicate resource" errors

Android `packagingOptions` issue. Add to `app.json`:

```json
"android": {
  "packagingOptions": {
    "pickFirst": ["**/*.so"]
  }
}
```

### Gradle OutOfMemoryError (OOM)

The `withGradleProperties.js` plugin sets JVM memory to 3GB. If still OOM:

1. Close other apps
2. Check `$env:GRADLE_ABI` — building all 4 ABIs uses 4x memory
3. Use `arm64-v8a` only (default)

For WSL, the 3GB JVM setting is too aggressive on a typical 8GB Windows
machine. Use the release command's 1.5GB heap, two Gradle workers, and CMake
parallelism of two. This avoids native C++ OOM and is usually faster than
repeated failed builds.

### Why the first build is slow

The first local release build compiles React Native, Expo modules, Nitro/MMKV,
Skia, and other native dependencies, and Metro creates a production bundle and
sourcemap. Subsequent builds reuse Gradle, CMake, pnpm, and Metro caches. A
warm release build is therefore commonly a few minutes, not 50 minutes.

It becomes slow again after a clean build, deleted caches, a native dependency
or Expo plugin change, a prebuild that changes generated native files, or a
new WSL checkout. JavaScript-only changes normally avoid most native work, but
still require Metro to regenerate the production bundle for a release APK.

### Standalone startup crash or blank screen

Gurudevi has two intentionally separate startup modes:

1. **Foreground UI:** `index.ts` loads only entry-safe shims and the background
   task definition before `expo-router/entry`. `RootShell` then completes the
   critical sequence `runtime → catalog → workflow bridge` before mounting
   `GlobalProvider` or a route. A failed runtime remains on the recovery screen;
   it must never be converted into a normal app render by a timeout.
2. **Background worker:** Android may load the JavaScript bundle without mounting
   React. `src/lib/backgroundSyncTask.ts` therefore defines the Expo task at
   entry evaluation time and dynamically loads the sync graph only when the OS
   invokes that worker. The worker calls the same idempotent `bootstrapPlatform`
   before accessing storage or network adapters.

Keep `index.ts` entry-safe: Hermes/polyfills and worker definitions only. Domain
catalogs, providers, authentication, native sign-in setup, analytics, fonts,
and remote work belong after critical startup. Optional services must log and
continue; only runtime/catalog/bridge failure may block UI.

The contract is covered by `startup-coordinator.test.ts` and
`background-sync-task-entry.test.ts`, `native-splash-handoff.test.ts`, and
`google-one-tap-bootstrap.test.ts`. Session/capability routing is covered by
`session-route-readiness.test.ts`. Run it with:

```bash
pnpm --filter gurudevi-mobile test
```

Vitest resolves workspace aliases through Vite's native
`resolve.tsconfigPaths: true` in `vitest.config.mts`; do not restore
`vite-tsconfig-paths` merely to suppress configuration issues.

If the process dies, capture the first `ReactNativeJS` error rather than the
later Expo Router `ErrorBoundary` error. The latter is usually a secondary
rendering symptom. Symbolicate Hermes bundle frames using the release
sourcemap under `android/app/build/generated/sourcemaps/react/release/`.

### "expo install --fix" was accidentally run

Check `git diff` immediately. If versions changed:

```bash
# Revert package.json changes
git checkout -- apps/gurudevi-mobile/package.json
pnpm install
```

Then re-apply any legitimate updates manually with `npx expo install <package>@<specific-version>`.

### Prebuild generated wrong code

Delete `android/` and regenerate:

```bash
Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
pnpm --filter gurudevi-mobile exec expo prebuild --no-install --platform android
```

---

## 8. Key Files Quick Reference

```
apps/gurudevi-mobile/
├── app.json                    ← single source of truth (plugins, config)
├── plugins/
│   ├── lib/buildGradleBlock.js ← shared helpers (idempotent mutations)
│   ├── withMavenRepos.js       ← buildscript maven repo
│   ├── withAndroidCruncherDisabled.js ← AAPT cruncher
│   ├── withGradleProperties.js ← jvmargs, arch, lint, bridgeless
│   ├── withSentryGradleDisabled.js ← sentry.gradle disable
│   └── withSentryProperties.js ← sentry.properties inject
├── eas.json                    ← EAS build profiles
└── docs/
    └── Learning/EXPO_BUILD_RUNBOOK.md ← this file
```
