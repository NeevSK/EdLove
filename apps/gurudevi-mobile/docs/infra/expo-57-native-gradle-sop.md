---
title: "Expo 57 Native Gradle SOP"
status: "active"
created: 2026-08-03
updated: 2026-08-03
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
| Node | 22.23.0 | Required by eas.json + engines |
| Gradle | 8.x | Managed by RN gradle plugin |
| Kotlin | managed | Set by Expo version catalog |
| Android compileSdk | managed | Set by Expo version catalog |
| Android minSdk | 24 | Set by Expo version catalog |

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

- **pnpm**: 11.13.1
- **Node**: from `.nvmrc` (22.23.0)
- **actions/cache**: v4 (Gradle cache)
- **Shell**: `set -eo pipefail` (fail-fast on errors)
- **JVM**: 3GB heap (matches gradle.properties)
- **Architectures**: arm64-v8a only (fast CI)

### EAS build profiles (`eas.json`)

| Profile | Channel | Build type | Notes |
|---|---|---|---|
| `development` | development | APK (debug) | Dev client |
| `preview` | preview | APK | Internal testing |
| `production` | production | AAB (app-bundle) | Play Store, autoIncrement |

## 7. Troubleshooting

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
