---
title: "Expo 57 Native Gradle SOP"
status: "active"
created: 2026-08-03
updated: 2026-08-22
author: "Naveen"
scribe: "opencode"
tags: [infra, android, gradle, expo, build]
---

# Expo 57 Native Gradle SOP

> **Reference document for the native Android build configuration of Gurudevi mobile.**
> For the developer-facing runbook, see `docs/Learning/EXPO_BUILD_RUNBOOK.md`.

---

## 1. Runtime Versions (as of 2026-08-03)

| Component | Version | Notes |
|---|---|---|
| Expo SDK | 57 | `expo: ~57.0.9` |
| React Native | 0.86 | `react-native: ~0.86.0` |
| React | 19.2.3 | `react: 19.2.3` |
| TypeScript | 7.0.2 | Intentionally ahead of Expo recommended |
| pnpm | 11.21.0 | Workspace-pinned package manager |
| Node | 22.23.2 | `.nvmrc`; required by eas.json + engines |
| Kotlin | managed | Set by Expo version catalog |
| Android compileSdk | managed | Set by Expo version catalog |
| Android minSdk | 28 (Android 9) | Set in `app.json` via `expo-build-properties` |

## 2. Generated Gradle State (post-prebuild)

### Root `android/build.gradle`

```groovy
buildscript {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://packages.expo.dev/maven' }  // ← injected by withMavenRepos.js
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
  // NOTE: packages.expo.dev/maven is added to allprojects by the
  // expo autolinking plugin via gradle.properties android.extraMavenRepos,
  // NOT by text injection. It appears at configure-time, not in file text.
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
```

### `android/gradle.properties`

```properties
org.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=false
reactNativeArchitectures=arm64-v8a
android.extraMavenRepos=[{"url":"https://packages.expo.dev/maven"}]
```

### `android/app/build.gradle` (relevant snippets)

```groovy
android {
    aaptOptions {
        cruncherEnabled = false
    }
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
    // bridgeless: not present in RN 0.86 template (defaults to true).
    // withGradleProperties.js has a safety-net replaceIfFound for
    // bridgeless = false → bridgeless = true if it ever appears.
}
```

## 3. Maven Repo Injection (dual mechanism)

The `https://packages.expo.dev/maven` repo is injected via **two** independent paths:

| Mechanism | Target | Covers | Survives prebuild --clean |
|---|---|---|---|
| `withMavenRepos.js` (text injection) | `buildscript.repositories` | Gradle classpath, plugin resolution | ✅ (plugin re-runs) |
| `expo-build-properties.extraMavenRepos` | `allprojects` (via gradle.properties + autolinking) | Native library resolution | ✅ (config plugin) |

**Why both?** Buildscript-stage resolution needs the repo in `buildscript.repositories`. The expo autolinking mechanism handles `allprojects` via a Gradle plugin that reads `android.extraMavenRepos` from `gradle.properties`. The text in `android/build.gradle` does NOT show the allprojects injection — it's applied at configure-time.

### Historical context

- Expo SDK 52–53 had a bug where `extraMavenRepos` was NOT applied to subprojects (PR #36500 fixed it in SDK 53+).
- Workaround: delete `android/` and regenerate (`expo prebuild --clean`).
- In SDK 57 this is fixed; the autolinking plugin correctly applies to all projects.

## 4. Config Plugin Architecture

### Shared helper: `plugins/lib/buildGradleBlock.js`

Exports:
- `EXPO_MAVEN_URL` — the canonical maven URL constant
- `ensureAndroidBlockSnippets(contents, snippets)` — idempotent insertion into `android{}` block. Each snippet has `{ breadcrumb, code }`. The `breadcrumb` is a unique string used as an idempotency key.
- `replaceIfFound(contents, old, rep)` — idempotent string replacement.

### Plugin execution order

Defined by the `plugins` array in `app.json`. For gradle-related plugins, order matters:

| Order | Plugin | Mechanism | Target |
|---|---|---|---|
| 1 | `withMavenRepos` | `withProjectBuildGradle` | Root `android/build.gradle` (buildscript) |
| 2 | `withAndroidCruncherDisabled` | `withAppBuildGradle` | App `android/app/build.gradle` (android{}) |
| 3 | `withGradleProperties` | `withGradleProperties` + `withAppBuildGradle` | `gradle.properties` + app build.gradle |
| 4 | `expo-build-properties` | Built-in | `gradle.properties` (extraMavenRepos) |
| 5 | `withSentryGradleDisabled` | `withAppBuildGradle` | App build.gradle (sentry.gradle) |
| 6 | `withSentryProperties` | `withDangerousMod` | `android/sentry.properties` |

### Why a shared helper?

The original plugins each did independent regex-`android{}` splices. This is fragile because:
- Ordering is implicit (depends on plugin array position).
- Multiple plugins can fight over the same regex match.
- No idempotency guarantee without manual breadcrumb checks.

The helper centralizes the mutation logic:
- Each plugin registers its concern's snippet + breadcrumb.
- The helper applies snippets in a single pass (per plugin call).
- Breadcrumbs prevent duplication across prebuild cycles.

## 5. Intentional Version Overrides

These packages are pinned to versions **newer than Expo SDK 57 recommends**:

| Package | Pinned | Expo recommended | Why |
|---|---|---|---|
| `react-native-gesture-handler` | 3.0.2 | 2.x | New architecture native gestures |
| `react-native-reanimated` | 4.5.0 | 3.x | New architecture animations |
| `react-native-worklets` | 0.11.1 | N/A | Required by reanimated 4.x |
| `react-native-mmkv` | 4.3.2 | 2.x | Nitro modules (v4) |
| `react-native-nitro-modules` | 0.36.1 | N/A | Required by mmkv 4.x |
| `@shopify/react-native-skia` | 2.6.5 | 1.x | New architecture |
| `typescript` | 7.0.2 | 5.x | Latest stable |
| `@react-native-vector-icons/lucide` | 13.1.2 | varies | Custom icon set |
| `react-native-screens` | 4.25.2 | varies | Latest stable |
| `zod` | 4.3.6 | varies | Latest stable |

These are whitelisted in `package.json` under:
- `expo.doctor.reactNativeDirectoryCheck.exclude`
- `expo.install.exclude`

**Do NOT remove these exclusions or run `expo install --fix`.**

## 6. CI Configuration

### Android build workflow (`.github/workflows/android-build.yml`)

- **pnpm**: 11.21.0
- **Node**: from `.nvmrc` (22.23.2)
- **actions/cache**: v4 (Gradle cache)
- **Shell**: `set -eo pipefail` (fail-fast on errors)
- **JVM**: 3GB heap (matches gradle.properties)
- **Architectures**: arm64-v8a only (fast CI)
- **Pre-build gates**: `audit:expo-native-graph`, `audit:style-stack`, and `audit:css-interop` run after the frozen install and before EAS/Gradle.

### Dispatching the native validation

After the intended changes have been committed and pushed, dispatch the workflow from the repository root:

```bash
gh workflow run android-build.yml \
  --repo NeevSK/Gurudevi \
  -f profile=development \
  -f build_method=local \
  -f build_type=apk
```

Follow the run and inspect the gate plus build result:

```bash
gh run list --repo NeevSK/Gurudevi --workflow android-build.yml --limit 5
gh run view <run-id> --repo NeevSK/Gurudevi --log-failed
```

The local audits are necessary but insufficient: a successful native validation requires the three fast gates, Gradle completion, and installation/startup on a development device or emulator.

### EAS build profiles (`eas.json`)

| Profile | Channel | Build type | Notes |
|---|---|---|---|
| `development` | development | APK (debug) | Dev client |
| `preview` | preview | APK | Internal testing |
| `production` | production | AAB (app-bundle) | Play Store, autoIncrement |

## 7. Troubleshooting

### Windows versus WSL

Use Windows `adb` for USB device discovery, APK installation, logcat, and
screenshots. Use WSL for the Linux-native Gradle/NDK toolchain when Windows
path length or native build tooling causes problems. Keep one WSL checkout and
one pnpm installation there; repeatedly reinstalling dependencies or switching
between Windows and WSL node_modules wastes disk and invalidates caches.

The fast, stable WSL profile is: arm64-v8a only, Gradle max-workers 2, CMake
parallelism 2, and a 1.5GB Gradle heap on an 8GB host. The first build remains
expensive; warm builds reuse the native and Metro caches.

### Disk-growth audit (2026-08-22)

The Windows system drive was at 92% usage with approximately 26 GB free. The
Ubuntu WSL virtual disk had grown to 41.09 GB. Its main build consumers were:

| Location | Approx. size | Meaning |
|---|---:|---|
| `/home/nsk/.gradle/caches` | 8.8 GB | Gradle dependency/build cache |
| `/home/nsk/.local/share/pnpm` | 7.6 GB | pnpm content-addressable store |
| `/home/nsk/Android/Sdk` | 4.7 GB | SDK, NDK, CMake, build tools |
| mobile `android/` | 4.8 GB | Generated Gradle/native build tree |
| WSL checkout `node_modules` | 11 GB | Workspace dependency installation |

This is expected accumulation from native builds plus caches, but it is not
free space. Before deleting anything, preserve the single working checkout and
confirm no build is running. Safe cleanup candidates are stale generated
`android/` artifacts and unused Gradle/pnpm cache entries; do not delete the
active pnpm store, Android NDK 27.1.12297006, or the working checkout blindly.
After cleanup, `wsl --shutdown` is required before compacting the WSL VHDX;
compaction is a separate operation from deleting files inside Linux.

### Hardware guidance for local Android builds

The inspected build machine has an Intel Core i7-1195G7 with 4 cores and 8
logical processors. That is the primary bottleneck for Gradle/CMake compilation;
`vmmem` is the WSL virtual machine process and becomes CPU-heavy while Linux
native builds are running. More RAM helps when Windows is paging or the build
hits memory pressure, but it does not materially speed a CPU-bound compile.

Use 16 GB system RAM as the practical minimum for Windows + WSL + Android
tooling, and 32 GB if the machine is upgradeable and is used with Android
Studio, browsers, and multiple services. The i7-1195G7 is a soldered/mobile
processor in typical systems, so a CPU upgrade normally means replacing the
machine; do not purchase RAM until the installed capacity and upgrade slots
are checked. For a replacement, prioritize a modern 8-core/16-thread or
higher CPU and 32 GB RAM over gaming-oriented features.

### Release build versus development build

`assembleDebug`/Expo development profiles produce a dev client that expects a
Metro server and may show the Expo development launcher. `assembleRelease`
embeds the JavaScript bundle and is the correct artifact for testing startup,
routing, native modules, and production behavior without Metro. Always record
which artifact was installed when reporting a device result.

### Device acceptance is separate from Gradle success

A successful `assembleRelease` proves packaging only. The acceptance gate is:
install, launch, live process after 10–15 seconds, no fatal logcat exception,
and visible app UI. A live process with a black screen remains a failed device
test and requires checking the focused window and first JavaScript error.

### Bootstrap ordering contract

`apps/gurudevi-mobile/index.ts` is the true entrypoint and must load early
Hermes shims before `expo-router/entry`. Its only other permitted side effect is
the lightweight `backgroundSyncTask` definition: Expo can boot a JavaScript
worker without rendering React, so `TaskManager.defineTask` must be registered
at entry evaluation time. The worker dynamically imports its sync graph and
calls `bootstrapPlatform()` before using `coreRuntime`.

For the foreground app, `RootShell` owns the hard sequence:

```text
bootstrapPlatform (idempotent) → AppCatalog → workflow bridge → GlobalProvider/routes
```

`GlobalProvider` and routed content must not mount before that sequence
completes. Runtime failure displays a recovery screen and may be retried; it
must not be replaced by a timeout-based "ready" state. Google One Tap,
analytics, language setup, and background-task registration are deferred and
cannot block first render. Modules imported by the route graph must never
dereference `coreRuntime` providers at module scope.

The order, failure gate, retry semantics, and worker definition are covered by
the mobile Vitest startup-contract tests.

### Post-bootstrap visual and sign-in contract

After `RootShell` has completed critical boot and mounted the provider tree,
the native splash is hidden on the next committed React frame. This guarantees a
painted app shell exists before the Android starting window disappears. The
initial `/` route then owns the finite Lottie splash and calls `replace` exactly
once to `/welcome`; the existing auth route guard may instead send a resolved
authenticated session to `/onboarding` or `/self`.

Do not bind native-splash dismissal to auth, profile, font, analytics, or
network completion. Those are not prerequisites for a first frame. A fallback
font or route loading placeholder is preferable to an indefinite native splash
or black screen.

Google One-Tap configuration is deferred until after critical boot, is
idempotent, and never presents UI itself. `signInWithGoogleNative()` invokes the
same configuration defensively before checking Play Services and showing the
user-requested credential UI. This preserves the required Android ordering
without allowing Google configuration failure to block app startup.

### Session and offline authorization boundary

The foreground route guard separates session restoration from authorization.
It may enter the app offline only with a fresh user-scoped entitlement snapshot
(`verified` or `cached`) whose `snapshotUserId` matches the restored Supabase
session user. A profile object by itself is not a capability grant. Signed
Cedar snapshots continue to control individual local actions; remote refreshes
are best-effort and never decide whether the initial React frame can render.

When identity resolution fails without that local capability evidence, keep the
public shell visible and present Retry. Do not redirect to onboarding, synthesize
a role, or use an elapsed-time fallback. This avoids both incorrect access and
the misleading "app started" state that previously hid initialization failure.

### "Could not resolve ... from project :app"

A dependency needs a repo that isn't in the configured repositories. Check:
1. `app.json` has `extraMavenRepos` in `expo-build-properties`
2. `withMavenRepos.js` injects into `buildscript.repositories`
3. If using JitPack, it's already in the default template

### "Duplicate class" / "Duplicate resource"

Add `packagingOptions` to `app.json`:

```json
"android": {
  "packagingOptions": {
    "pickFirst": ["**/*.so"],
    "exclude": ["META-INF/**"]
  }
}
```

### Gradle OOM / Metaspace

The plugin sets `-Xmx3072m -XX:MaxMetaspaceSize=512m`. If still OOM:
1. Close other apps
2. Build single ABI: `$env:GRADLE_ABI = "arm64-v8a"`
3. Use `--no-daemon` for CI

### Stale generated code

The `android/` directory may have stale generated code from a previous prebuild. Solution:

```bash
Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
pnpm --filter gurudevi-mobile exec expo prebuild --no-install --platform android
```

### Bridgeless mode

RN 0.86 defaults to bridgeless=true. The `withGradleProperties.js` plugin has a safety-net that replaces `bridgeless = false` → `bridgeless = true` if the string ever appears. If you see bridgeless issues, check the generated `android/app/build.gradle` for this line.

### Sentry not disabling

The `withSentryGradleDisabled.js` plugin comments out `apply from: "../../node_modules/@sentry/react-native/sentry.gradle"`. If Sentry still tries to run, check:
1. The plugin is in `app.json` plugins array
2. The regex match in the plugin matched the line (exact string must be present)

## 8. Decision Log

| Decision | Rationale | Date |
|---|---|---|
| CNG over bare workflow | Native folders are ephemeral; all config in app.json/plugins | 2026-02-18 |
| arm64-v8a default | Fastest build; all target devices are arm64 | 2026-02-20 |
| 3GB JVM heap | Balance between CI memory limits and build speed | 2026-03-01 |
| Dual maven injection | buildscript needs text injection; allprojects via autolinking | 2026-08-03 |
| Shared helper for android{} mutations | Idempotency + ordering across plugins | 2026-08-03 |
| GRADLE_ABI env override | Future flexibility for emulators/multi-ABI without code edits | 2026-08-03 |
| Explicit JS boot boundary | Runtime/catalog/bridge precede providers; optional services are deferred | 2026-08-22 |
| Entry-defined background worker | Android worker boot may occur without React; worker bootstraps runtime lazily | 2026-08-22 |
| Frame-based native splash handoff | Hide only after the React shell commits; auth/font work remains non-blocking | 2026-08-22 |
| Idempotent Google One-Tap setup | Configure after critical boot and again safely at user-initiated sign-in | 2026-08-22 |
| Offline capability gate | Permit offline app entry only from a fresh, session-owned entitlement snapshot; otherwise show retryable public shell | 2026-08-22 |
