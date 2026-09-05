#!/usr/bin/env bash
set -euo pipefail

# Run from WSL so Gradle, the Android SDK, NDK and CMake share one Linux toolchain.
# This script deliberately does not edit android/ or local.properties: Expo config
# and prebuild own generated native state.
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd -- "$script_dir/.." && pwd)"
mobile_root="$repo_root/apps/gurudevi-mobile"

export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="${ANDROID_NDK_HOME:-$ANDROID_SDK_ROOT/ndk/27.1.12297006}"
export CMAKE_BUILD_PARALLEL_LEVEL="${CMAKE_BUILD_PARALLEL_LEVEL:-2}"
export GRADLE_OPTS="${GRADLE_OPTS:--Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC}"

if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
  export CMAKE_C_COMPILER_LAUNCHER="$(which ccache)"
  export CMAKE_CXX_COMPILER_LAUNCHER="$(which ccache)"
fi

if [[ ! -x "$ANDROID_HOME/platform-tools/adb" ]]; then
  echo "Android SDK not found at $ANDROID_HOME. Set ANDROID_SDK_ROOT in WSL." >&2
  exit 1
fi

cd "$mobile_root/android"

if command -v doppler >/dev/null 2>&1 && doppler me >/dev/null 2>&1; then
  doppler run --no-fallback -- ./gradlew :app:assembleDebug --no-daemon --max-workers=2 \
    -PreactNativeArchitectures=arm64-v8a --console=plain
else
  echo "Doppler unauthenticated in WSL; running Gradle directly."
  ./gradlew :app:assembleDebug --no-daemon --max-workers=2 \
    -PreactNativeArchitectures=arm64-v8a --console=plain
fi

echo "APK: $PWD/app/build/outputs/apk/debug/app-debug.apk"

if command -v ccache >/dev/null 2>&1; then
  echo "=== ccache Statistics ==="
  ccache -s
fi
