#!/usr/bin/env bash
# Compiles verger's Android sensing code against the real android.jar (API 36) and runs its JUnit
# suite on the desktop JVM: no Android SDK, emulator or Gradle project needed. Everything but the
# Expo binding (VergerModule.kt, which needs expo-modules-core) is compiled. Evidence level: G0
# for the Android calls (they type-check against the platform), G2 for the pure logic (tests).
#
# Downloads, once, into VERGER_JVM_CACHE (default ~/.cache/verger-android-jvm): Kotlin 2.1.20,
# the API 36 platform, JUnit 4.13.2, Hamcrest 1.3, org.json 20240303.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${VERGER_JVM_CACHE:-$HOME/.cache/verger-android-jvm}"
PKG="$ROOT/packages/verger-android/android"
SRC="$PKG/src/main/java/expo/modules/verger"
TEST="$PKG/src/test/java/expo/modules/verger"
mkdir -p "$CACHE"

fetch() { # url dest: retried, since Maven Central rate-limits (429)
  local url="$1" dest="$2"
  [ -s "$dest" ] && return 0
  for wait in 2 4 8 16; do
    if curl -fsSL -o "$dest.part" "$url"; then mv "$dest.part" "$dest"; return 0; fi
    sleep "$wait"
  done
  echo "download failed: $url" >&2
  return 1
}

fetch https://github.com/JetBrains/kotlin/releases/download/v2.1.20/kotlin-compiler-2.1.20.zip "$CACHE/kotlin.zip"
fetch https://dl.google.com/android/repository/platform-36_r02.zip "$CACHE/platform-36.zip"
fetch https://repo1.maven.org/maven2/junit/junit/4.13.2/junit-4.13.2.jar "$CACHE/junit.jar"
fetch https://repo1.maven.org/maven2/org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar "$CACHE/hamcrest.jar"
fetch https://repo1.maven.org/maven2/org/json/json/20240303/json-20240303.jar "$CACHE/json.jar"
[ -x "$CACHE/kotlinc/bin/kotlinc" ] || unzip -q -o "$CACHE/kotlin.zip" -d "$CACHE"
[ -s "$CACHE/android-36/android.jar" ] || unzip -q -o "$CACHE/platform-36.zip" "*/android.jar" -d "$CACHE"

KOTLINC="$CACHE/kotlinc/bin/kotlinc"
ANDROID_JAR="$CACHE/android-36/android.jar"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

sources=()
for f in "$SRC"/*.kt; do
  [ "$(basename "$f")" = "VergerModule.kt" ] || sources+=("$f")
done
echo "compile ${#sources[@]} files against android.jar 36"
"$KOTLINC" "${sources[@]}" -cp "$ANDROID_JAR" -d "$OUT/main" -jvm-target 17 -nowarn

# org.json first: android.jar carries a stub org.json without the methods the tests use.
TEST_CP="$CACHE/json.jar:$OUT/main:$ANDROID_JAR:$CACHE/junit.jar:$CACHE/hamcrest.jar"
"$KOTLINC" "$TEST"/*.kt -cp "$TEST_CP" -d "$OUT/test" -jvm-target 17 -nowarn

classes=$(cd "$OUT/test" && find . -name '*Test.class' | sed 's|^\./||; s|\.class$||; s|/|.|g')
cd "$PKG"
# shellcheck disable=SC2086
java -Dverger.fixtures=../../verger-core/src/__fixtures__ \
  -Dverger.contract=../contract/native-events.json \
  -cp "$OUT/test:$CACHE/json.jar:$OUT/main:$CACHE/junit.jar:$CACHE/hamcrest.jar:$CACHE/kotlinc/lib/kotlin-stdlib.jar:$ANDROID_JAR" \
  org.junit.runner.JUnitCore $classes
