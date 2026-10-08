---
name: android-build
description: "Use when assembling, compiling, debugging, or installing native Android APKs in WSL 2."
---

# Android Native Build Runbook (WSL 2)

Authoritative engineering SOP for compiling native Android Debug and Release builds for `apps/gurudevi-mobile`.

---

## 1. Core Principles

1. **Default Target is Debug (`:app:assembleDebug`)**:
   For daily development, iteration, and physical device testing, always assemble a **Debug / Development Client APK** that connects to the active Metro bundler.
   - Run Metro: `pnpm --filter gurudevi-mobile start`
   - Reverse device port: `adb reverse tcp:8081 tcp:8081`
   - Install and launch the Debug APK on the connected device.

2. **Release Builds ONLY When Explicitly Requested**:
   Do **NOT** run `assembleRelease` unless the user explicitly asks for a standalone release build. Standalone release builds bundle offline assets and take significantly longer. When explicitly requested, wrap with `doppler run --no-fallback --` so public environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, etc.) are injected into Metro during asset bundling.

3. **ALWAYS Build Inside WSL 2 (Ubuntu)**:
   **NEVER** build native Android on the Windows host directly. Windows paths exceed limits (`CMAKE_OBJECT_PATH_MAX`) and trigger Ninja manifest timestamp loops (`build.ninja dirty after 100 tries`).

---

## 2. One-Command Unified Execution from Windows

Always prefer running the standardized scripts from the Windows workspace root:
- **Dev Debug APK**: `pnpm run build:android`
- **Release APK**: `pnpm run build:android:release`
- **Install Dev APK**: `pnpm run install:android`
- **Install Release APK**: `pnpm run install:android:release`

These scripts read `POLYMATH_WSL_DIR` (see `scripts/lib/wsl-workspace.mjs`).
If your Linux ext4 checkout is not at `~/projects/polymath-platform`, set it:
```powershell
$env:POLYMATH_WSL_DIR = '~/projects/my-other-clone'
```

---

## 3. Direct Execution Inside Ubuntu (WSL 2)

When running directly from Ubuntu inside the WSL 2 terminal:

```bash
# Toolchain environment setup:
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'

# Enable ccache if installed
if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
  export CCACHE_DIR="$HOME/.ccache"
  export CCACHE_MAXSIZE="10G"
fi

# Navigate to native android directory in your ext4 checkout:
export POLYMATH_WSL_DIR="${POLYMATH_WSL_DIR:-$HOME/projects/polymath-platform}"
cd "$POLYMATH_WSL_DIR/apps/gurudevi-mobile/android"

# Standard development build (default):
./gradlew :app:assembleDebug --build-cache --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --console=plain

# Standalone release build (ONLY if user explicitly requested):
# doppler run --no-fallback -- ./gradlew :app:assembleRelease --build-cache --no-daemon --max-workers=2 \
#   -PreactNativeArchitectures=arm64-v8a --console=plain
```

---

## 4. Troubleshooting & Clean Regeneration

If Gradle builds fail due to stale ephemeral state:
```bash
# Delete android artifact folder and regenerate prebuild cleanly:
Remove-Item -Path "apps\gurudevi-mobile\android" -Recurse -Force
npx expo prebuild --no-install --platform android
```
- Never hand-edit files in `apps/gurudevi-mobile/android/` directly.
- All native configuration belongs in `app.json` or config plugins under `apps/gurudevi-mobile/plugins/`.

---

## 5. Reference Documentation
- [`apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md`](file:///c:/x/apps/gurudevi-mobile/docs/Learning/EXPO_BUILD_RUNBOOK.md) — Comprehensive developer build and runbook
- [`apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md`](file:///c:/x/apps/gurudevi-mobile/docs/infra/expo-57-native-gradle-sop.md) — Native gradle state, plugin compatibility matrix, and decision log
