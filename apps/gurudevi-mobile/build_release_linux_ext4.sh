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

# Source the exported environment variables
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

