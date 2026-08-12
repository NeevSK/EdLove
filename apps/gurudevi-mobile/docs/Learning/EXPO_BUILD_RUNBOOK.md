---
title: "Expo CNG Build Runbook"
status: "active"
created: 2026-08-03
updated: 2026-08-03
author: "Naveen"
scribe: "opencode"
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
