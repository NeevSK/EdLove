---
title: "2026-08-15 Local & Cloud Android Build Chronicle & Diagnostics Log"
status: "active"
created: 2026-08-15
updated: 2026-08-15
author: "Naveen"
scribe: "opencode"
tags: [docs, infra, historical]
---

# 2026-08-15 Local & Cloud Android Build Chronicle & Diagnostics Log

**Date:** August 15, 2026  
**Application:** `gurudevi-mobile` (Expo SDK 57 / React Native 0.86.2 New Architecture)  
**Target:** Android Release APK with Debug Signing (`arm64-v8a`)  
**Native Engines Active:** Skia 2.6.5, Nitro MMKV 4.3.2, Reanimated 4.5.0, OP-SQLite (SQLCipher), RNGH v3.0.2

---

## 1. Cloud Build Diagnostics (GitHub Actions 45m Timeout)

- **Issue Observed:** The GitHub Actions workflow `android-build.yml` failed with `The job has exceeded the maximum execution time of 45m0s`.
- **Root Cause:**
  1. Strict `timeout-minutes: 45` limit in the workflow file.
  2. Free `ubuntu-latest` runners (2 vCPUs) compiling large C++ codebases from scratch without shared build caches.
  3. Single-threaded / 2-worker Gradle throttle (`org.gradle.workers.max=2`) configured to prevent OOM errors on hosted runners.
- **Remediation Applied:** Bumped `timeout-minutes: 90` in `.github/workflows/android-build.yml`.

---

## 2. Local Build Execution Chronicle (Windows Environment)

### Step 1: Environment Verification
- **Android SDK:** `C:\Users\Naween\AppData\Local\Android\Sdk` (Valid)
- **Android NDK:** `27.1.12297006` (Matches `withNdkVersion.js`)
- **JDK:** OpenJDK 21 via Android Studio JBR (`C:\Program Files\Android\Android Studio\jbr`)

### Step 2: Safe Prebuild Generation
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
pnpm exec expo prebuild --no-install --platform android
```
- **Outcome:** `√ Finished prebuild` (Clean Gradle files generated without modifying sacred exclusions or locked versions).

### Step 3: Gradle Assembly Run
```powershell
./gradlew :app:assembleRelease
```
- **Execution Log Highlights:**
  - 126 Gradle tasks evaluated.
  - Kotlin compilation, Skia configuration, OP-SQLite SQLCipher binding, and TurboModules JNI prefabs succeeded.
  - **Windows-Specific Constraint:**
    CMake emitted path length warnings (>240 chars in deep `.pnpm/react-native-nitro-modules...` paths) and Ninja manifest re-evaluation hit `manifest 'build.ninja' still dirty after 100 tries` due to the timestamp touching behavior in Nitro's `fix-prefab.gradle`.

---

## 3. Key Takeaways & Recommendations

1. **Zero-Quota EAS Local Builds:**
   Running `npx eas-cli build --platform android --profile preview --local` runs locally on the host container without using any of your 15 free EAS cloud credits.
2. **GitHub Actions Cloud Builds:**
   Now allowed up to 90 minutes with updated `.github/workflows/android-build.yml`.
3. **WSL 2 / Linux Local Builds:**
   For developers running Windows, executing the Gradle command inside WSL 2 completely eliminates the Windows `CMAKE_OBJECT_PATH_MAX` and Ninja file-locking issues.
