---
title: "Linux ext4 Native Android Release Build SOP & Device Verification"
status: "active"
created: 2026-09-08
updated: 2026-09-08
author: "Naveen"
scribe: "Antigravity"
tags: [infra, android, gradle, expo, wsl2, linux, ext4, release, sop]
---

# Linux ext4 Native Android Release Build SOP & Device Verification

> **Definitive Standard Operating Procedure (SOP) for compiling production-grade Android Release builds (`:app:assembleRelease`) in pure Linux WSL 2 ext4 storage and verifying on physical ADB hardware.**

---

## 1. Architectural Guardrails & Core Constraints

1. **Pure Linux ext4 Execution (`/home/nsk/projects/polymath-platform`)**:
   - **NEVER** execute C++ Native CMake or Ninja compilation on Windows NTFS mounts (`/mnt/c/...`). Windows timestamp granularity causes fatal rebuild loops (`build.ninja dirty after 100 tries`) and exceeds `CMAKE_OBJECT_PATH_MAX`.
   - The Linux workspace shares packages via `pnpm` hardlinking, requiring only **~3 GB** incremental disk overhead.
2. **Side-by-Side Coexistence (`applicationIdSuffix ".release"`)**:
   - Release builds must configure `applicationIdSuffix ".release"` (`org.edlove.gurudevi.release`) and display name `"Gurudevi (Release)"` in `android/app/build.gradle` so they never overwrite or conflict with active Debug development APKs (`org.edlove.gurudevi`).
3. **Local Build Sentry Guard**:
   - Always export `SENTRY_DISABLE_AUTO_UPLOAD=true` for local APK builds to prevent DNS/network failures during `:app:createBundleReleaseJsAndAssets_SentryUpload_*`.
4. **Hermes Universal Shims**:
   - Third-party packages containing dynamic web worker imports (`pdfjs-dist`, `pdf-parse`, `@huggingface/transformers`) must be intercepted via `src/shims/pdfjs-dist-shim.js` and wired into `UNIVERSAL_SHIMS` in `metro.config.js`.

---

## 2. Standard Build Script (`apps/gurudevi-mobile/build_release_linux_ext4.sh`)

```bash
#!/usr/bin/env bash
set -e

START_TIME=$(date +%s)
log_step() {
  ELAPSED=$(($(date +%s) - START_TIME))
  printf "\n\033[1;36m[%02dm %02ds] ===> %s\033[0m\n" $((ELAPSED/60)) $((ELAPSED%60)) "$1"
}

log_step "Initializing build environment and toolchain"

export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'
unset CSS_TRANSFORMER_WASM

if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
  export CCACHE_DIR="$HOME/.ccache"
  export CCACHE_MAXSIZE="10G"
  export CCACHE_SLOPPINESS="include_file_ctime,include_file_mtime,time_macros"
fi

cd /home/nsk/projects/polymath-platform/apps/gurudevi-mobile

# Source environment variables and disable remote sourcemap upload
set -a
source .env.release
export SENTRY_DISABLE_AUTO_UPLOAD=true
set +a

log_step "Starting Gradle assembleRelease"
cd /home/nsk/projects/polymath-platform/apps/gurudevi-mobile/android

./gradlew :app:assembleRelease --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --profile --console=plain

TOTAL_TIME=$(($(date +%s) - START_TIME))
printf "\n\033[1;32m[%02dm %02ds] BUILD COMPLETED SUCCESSFULLY!\033[0m\n" $((TOTAL_TIME/60)) $((TOTAL_TIME%60))
```

---

## 3. Physical Device Deployment & Verification SOP

### Step 1: Copy Output to Workspace
```bash
cp /home/nsk/projects/polymath-platform/apps/gurudevi-mobile/android/app/build/outputs/apk/release/app-release.apk \
   /mnt/c/x/apps/gurudevi-mobile/app-release.apk
```

### Step 2: Install Side-by-Side to Connected Device
```powershell
adb -s <DEVICE_ID> install -r "c:\x\apps\gurudevi-mobile\app-release.apk"
```

### Step 3: Verify Coexistence
```powershell
adb -s <DEVICE_ID> shell pm list packages --user 0 | Select-String "gurudevi"
# Expected Output:
# package:org.edlove.gurudevi
# package:org.edlove.gurudevi.release
```

### Step 4: Measure Performance & Frame Metrics
```powershell
# Measure Cold Start Launch Time
adb -s <DEVICE_ID> shell am force-stop org.edlove.gurudevi.release
adb -s <DEVICE_ID> shell am start -W -n org.edlove.gurudevi.release/org.edlove.gurudevi.MainActivity

# Profile Memory Footprint
adb -s <DEVICE_ID> shell dumpsys meminfo org.edlove.gurudevi.release

# Profile Frame Stats & Jank Rate
adb -s <DEVICE_ID> shell dumpsys gfxinfo org.edlove.gurudevi.release
```

---

## 4. Benchmark Performance Baselines (Physical Samsung Galaxy `R58T33Y0E3M`)

| Metric Domain | Recorded Value | Target Standard | Status |
|---|---|---|---|
| **Cold Start Time** | `2,007 ms` (~2.0s) | < 3,000 ms | 🟢 Optimal |
| **Janky Frames Rate** | `0.63%` (75 / 11,849 frames) | < 5.0% | 🟢 Exceptional |
| **90th Percentile Frame Time** | `19 ms` | < 25 ms | 🟢 50–60 FPS Smooth |
| **Memory Allocation (Total PSS)** | `328 MB` | < 450 MB | 🟢 Healthy |
| **Hermes Bytecode Compilation** | 6,917 modules pre-compiled | Zero runtime parsing | 🟢 Verified |

---

## 5. Troubleshooting & Root Cause Reference

| Issue Observed | Mechanism | Resolution |
|---|---|---|
| **Sentry DNS Upload Timeout** | Gradle upload task blocks on HTTP sourcemap transfer. | Export `SENTRY_DISABLE_AUTO_UPLOAD=true`. |
| **Hermes Dynamic Worker Import Syntax Error** | Hermes bytecode compiler rejects dynamic browser worker syntax. | Wire `pdfjs-dist-shim.js` in `UNIVERSAL_SHIMS`. |
| **Device Offline Anonymous Auth Error** | Supabase anonymous session creation fails without active network. | Connect device to Wi-Fi/Cellular (`ping 8.8.8.8`). |
| **One-Tap Google Sign-In Silent Bypass** | Missing client ID in env file. | Supply `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env.release`. |
