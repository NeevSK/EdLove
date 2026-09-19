---
title: "Android Local & Cloud Build Guide (Zero-Quota Alternatives & Non-Default Native Deps)"
status: "active"
created: 2026-08-15
updated: 2026-09-05
author: "Naveen"
scribe: "Antigravity"
tags: [android, build, ci-cd, gradle, ndk, expo, windows, cmake]
---

# Android Local & Cloud Build Guide (Gurudevi Mobile)

This guide documents how native compilation works for Gurudevi Mobile, why custom native dependencies affect build times, how local builds operate, and how to build unlimited APKs without consuming EAS cloud quotas.

---

## 1. Cloud vs Local Build Dynamics

### A. Why GitHub Actions Timed Out (45-Minute Limit)
In `.github/workflows/android-build.yml`:
1. **Hard Limit**: The job specified `timeout-minutes: 45` (now bumped to `90`).
2. **Clean Room Environment**: GitHub hosted runners (`ubuntu-latest`) start fresh with zero cached files every time.
3. **Heavy Native C++ / NDK Compilation**:
   Gurudevi Mobile uses React Native New Architecture with high-performance native modules:
   - `react-native-reanimated` 4.5.0 (C++ / Worklets)
   - `@shopify/react-native-skia` 2.11.2 (C++ Skia engine)
   - `react-native-mmkv` 4.3.2 + `react-native-nitro-modules` (C++ Nitro bindings)
   - `@op-engineering/op-sqlite` (C++ SQLite / SQLCipher engine)
   - `react-native-gesture-handler` 3.0.2 (RNGH v3)
   - `react-native-get-random-values` 2.0.0
4. **Constrained CPU**: Free GitHub runners provide 2 vCPUs. To prevent Out-Of-Memory (OOM) errors, Gradle was restricted with `-Dorg.gradle.parallel=false -Dorg.gradle.workers.max=2 -Dorg.gradle.daemon=false`, making fresh C++ compilation take >45 minutes.

---

## 2. Windows-Specific Local Build Nuances (CMake Object Path Limits)

When building locally on Windows:
1. **Deep pnpm paths & Windows MAX_PATH**:
   pnpm stores nested modules like:
   `node_modules/.pnpm/react-native-nitro-modules@.../node_modules/react-native-nitro-modules/android/.cxx/RelWithDebInfo/403ul5z2/arm64-v8a/CMakeFiles/...`
   CMake has a default 250-character limit (`CMAKE_OBJECT_PATH_MAX`) on Windows.
2. **CMake / Ninja manifest loop**:
   In `react-native-nitro-modules/android/fix-prefab.gradle`, an `afterEvaluate` hook touches `prefab_config.json` timestamps during Gradle configuration. On Windows file systems with CMake/Ninja, modifying timestamps while CMake is evaluating causes `ninja: error: manifest 'build.ninja' still dirty after 100 tries`.
3. **Targeted Environments**:
   - **Linux / CI / WSL 2**: Builds smoothly without path-length truncation or Ninja manifest lockups.
   - **Local Android Compilation Policy**: **ALWAYS build in WSL 2 (Ubuntu)** from the active workspace mount (`/mnt/c/x/apps/gurudevi-mobile/android`). NEVER compile on Windows host directly.

---

## 3. How to Build APKs Locally (Zero EAS Quota Used)

### Method A: EAS Local Build (`--local`) — Zero Cloud Quota
> [!IMPORTANT]
> Running `eas build --local` runs the EAS pipeline on your **own machine**. It **does NOT consume your 15 free EAS cloud build credits**.

From `apps/gurudevi-mobile`:
```powershell
# Build preview APK locally without touching cloud limits
npx eas-cli build --platform android --profile preview --local
```

### Method B: Direct Gradle Build in WSL 2 (Primary Development Workflow)

> [!IMPORTANT]
> **Debug (`:app:assembleDebug`) is the default target** for daily engineering and physical device testing with Metro.
> **Release (`:app:assembleRelease`) is ONLY built when explicitly requested by the user.**

Run the build inside WSL 2 from the active workspace:

```bash
# In WSL 2 (Ubuntu):
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'

# Enable ccache if available
if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
fi

cd /mnt/c/x/apps/gurudevi-mobile/android

# Standard Debug build (DEFAULT):
./gradlew :app:assembleDebug --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --console=plain

# Standalone Release build (ONLY IF EXPLICITLY REQUESTED):
# doppler run --no-fallback -- ./gradlew :app:assembleRelease --no-daemon --max-workers=2 \
#   -PreactNativeArchitectures=arm64-v8a --console=plain
```

To install directly to a connected phone from Windows PowerShell:
```powershell
# Reverse Metro port and install Debug APK
adb reverse tcp:8081 tcp:8081
adb install -r apps\gurudevi-mobile\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 4. Alternative CI/CD & Build Platforms Matrix

If you want cloud-hosted builds outside of EAS free tiers:

| Solution | Free Tier / Allocation | Ideal Use Case |
| :--- | :--- | :--- |
| **EAS Local (`eas build --local`)** | **Unlimited (100% Free)** | Full EAS build pipeline executed on your own computer without using cloud quota. |
| **Local PC Build (Gradle / WSL)** | **Unlimited (100% Free)** | Daily active development, rapid debugging, zero quota risk. |
| **GitHub Actions (Self-Hosted Runner)** | **Unlimited (100% Free)** | Run GitHub workflows directly on your machine's hardware with unlimited time. |
| **GitHub Actions (Hosted Runner)** | 2,000 mins/month (Free) / 3,000 mins/month (Edu/Pro) | Cloud builds with `timeout-minutes: 90`. |
| **Codemagic** | 500 build mins/month | Dedicated React Native CI/CD. |
| **CircleCI** | 30,000 credits/month free | Parallel builds on cloud runners. |

---

## 5. Local Environment Prerequisites Checklist

1. **Android Studio** and **Android SDK 35/36** installed at `C:\Users\<User>\AppData\Local\Android\Sdk`.
2. **Android NDK** `27.1.12297006` installed via Android Studio SDK Manager.
3. **JDK 17 or JDK 21** (`JAVA_HOME` pointing to Android Studio `jbr` or Eclipse Adoptium Temurin).
4. Run `pnpm exec expo prebuild --no-install --platform android` to generate the clean Gradle project.
