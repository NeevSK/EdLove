#!/usr/bin/env bash
set -e

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

cd /mnt/c/x/apps/gurudevi-mobile

# Source the exported environment variables
set -a
source .env.release
set +a

cd /mnt/c/x/apps/gurudevi-mobile/android

./gradlew :app:assembleRelease --no-daemon --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a --profile --console=plain
