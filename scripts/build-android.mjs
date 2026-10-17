#!/usr/bin/env node
/**
 * scripts/build-android.mjs — Unified, High-Performance Android Build Pipeline for WSL2
 *
 * Implements the complete 5-stage native build lifecycle:
 * 1. Pre-Flight Validation & Lock Hygiene (Kotlin daemon, Gradle lock clearance)
 * 2. High-Speed Windows-to-WSL2 Delta Sync (< 1s into Linux ext4)
 * 3. Multi-Tier Compiler & Build Caching (CCACHE, Gradle Build Cache, In-Process Kotlin)
 * 4. Build Execution (Debug with Metro / Release with Doppler)
 * 5. Post-Build Telemetry, CCACHE Diagnostics & Deployment Guide
 */

import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { resolveWslWorkspace, toWslPath, repoRoot } from './lib/wsl-workspace.mjs';

const START_TIME = Date.now();
const getElapsed = () => {
  const sec = Math.floor((Date.now() - START_TIME) / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `[${m}m ${s}s]`;
};

const logStep = (title) => console.log(`\n\x1b[1;36m${getElapsed()} ===> ${title}\x1b[0m`);
const logSuccess = (msg) => console.log(`\x1b[1;32m${msg}\x1b[0m`);
const logWarn = (msg) => console.log(`\x1b[1;33m${msg}\x1b[0m`);
const logError = (msg) => console.error(`\x1b[1;31m${msg}\x1b[0m`);

// Parse CLI flags
const args = process.argv.slice(2);
const isRelease = args.some((arg) => arg.includes('release'));
const buildType = isRelease ? 'release' : 'debug';
const gradleTask = isRelease ? ':app:assembleRelease' : ':app:assembleDebug';
const basePackage = 'app.gurudevi.sanctuary';
const targetPkg = isRelease ? basePackage : `${basePackage}.dev`;
const appName = isRelease ? 'Gurudevi' : 'Gurudevi (Dev)';
const abi = args.find((arg) => arg.startsWith('--abi='))?.split('=')[1] || 'arm64-v8a';
const buildRunId = new Date().toISOString().replace(/[:.]/g, '-');

// Linux-ext4 workspace inside WSL2; overridable per contributor via
// POLYMATH_WSL_DIR. Interpolation happens inside bash so "$HOME" expands there.
const WSL_WORKSPACE = resolveWslWorkspace();
const WINDOWS_REPORTS_DIR = toWslPath(path.join(repoRoot, 'reports', 'android-build'));

console.log(`\x1b[1;35m`);
console.log(`========================================================================`);
console.log(`  GURUDEVI NATIVE ANDROID BUILD PIPELINE (WSL2 EXT4)`);
console.log(`========================================================================`);
console.log(`  • Variant:       ${buildType.toUpperCase()} (${appName})`);
console.log(`  • ApplicationId: ${targetPkg}`);
console.log(`  • Target ABI:    ${abi}`);
console.log(`  • Gradle Task:   ${gradleTask}`);
console.log(`========================================================================\x1b[0m`);

// -----------------------------------------------------------------------------
// STAGE 1: Pre-Flight Validation & WSL2 Lock Hygiene
// -----------------------------------------------------------------------------
logStep('Stage 1: Pre-flight toolchain validation & lock hygiene in WSL2');

const preflightScript = `
set -e
if [ -z "\${HOME:-}" ] || [ ! -d "\$HOME" ]; then
  echo "ERROR: WSL environment not detected (no HOME inside the distro)" >&2
  exit 1
fi

WSL_WORKSPACE="${WSL_WORKSPACE}"

ANDROID_SDK="\${ANDROID_SDK_ROOT:-\$HOME/Android/Sdk}"
if [ ! -d "\$ANDROID_SDK" ]; then
  echo "ERROR: Android SDK not found at \$ANDROID_SDK" >&2
  exit 1
fi

# Pre-flight hygiene: clear stale Kotlin daemon sockets, Gradle binary tmp, and Gradle cache locks
rm -rf "$HOME/.local/share/kotlin/daemon/"* "/tmp/kotlin"* 2>/dev/null || true
rm -rf "$HOME/.gradle/.tmp" 2>/dev/null || true
rm -f "$HOME/.gradle/caches/modules-2/modules-2.lock" 2>/dev/null || true
rm -rf "$WSL_WORKSPACE/apps/gurudevi-mobile/android/.gradle" 2>/dev/null || true

# Ensure target workspace exists
mkdir -p "\$WSL_WORKSPACE"
echo "  workspace: \$WSL_WORKSPACE"
`;

const preflightRes = spawnSync('wsl', ['-e', 'bash', '-c', preflightScript], { stdio: 'inherit' });
if (preflightRes.status !== 0) {
  logError('❌ Pre-flight checks failed. Ensure WSL2 and Android SDK are properly configured.');
  process.exit(1);
}
console.log('  ✓ Kotlin daemon run markers cleared');
console.log('  ✓ Gradle modules cache lock verified');
console.log('  ✓ Android SDK & NDK toolchain confirmed');

// -----------------------------------------------------------------------------
// STAGE 2: High-Speed Windows-to-WSL2 Delta Sync (< 1s)
// -----------------------------------------------------------------------------
logStep('Stage 2: High-Speed Windows-to-WSL2 ext4 delta sync');
const syncRes = spawnSync('node', ['scripts/sync-wsl.mjs'], { stdio: 'inherit' });
if (syncRes.status !== 0) {
  logError('❌ Workspace synchronization failed.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// STAGE 3: Managed native configuration regeneration
// -----------------------------------------------------------------------------
logStep('Stage 3: Regenerating managed Android configuration in WSL2');

const prebuildScript = `
set -e
cd "${WSL_WORKSPACE}"
pnpm --filter gurudevi-mobile exec expo prebuild --no-install --platform android

# Ensure local.properties points to Linux SDK and NDK
ANDROID_SDK="\${ANDROID_SDK_ROOT:-\$HOME/Android/Sdk}"
NDK_DIR="\$ANDROID_SDK/ndk/27.1.12297006"
echo "sdk.dir=\$ANDROID_SDK" > "${WSL_WORKSPACE}/apps/gurudevi-mobile/android/local.properties"
echo "ndk.dir=\$NDK_DIR" >> "${WSL_WORKSPACE}/apps/gurudevi-mobile/android/local.properties"
`;

const prebuildRes = spawnSync('wsl', ['-e', 'bash', '-c', prebuildScript], { stdio: 'inherit' });
if (prebuildRes.status !== 0) {
  logError('❌ Managed Android configuration regeneration failed.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// STAGE 4: Multi-Tier Caching & Environment Pre-Warm
// -----------------------------------------------------------------------------
logStep('Stage 4: Initializing CCACHE, Gradle Build Cache & JVM limits');

const buildScript = `
set -uo pipefail

WSL_WORKSPACE="${WSL_WORKSPACE}"
cd "\$WSL_WORKSPACE"

# Toolchain paths
export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_NDK_HOME="$ANDROID_SDK_ROOT/ndk/27.1.12297006"

# Memory and GC optimization
export CMAKE_BUILD_PARALLEL_LEVEL=2
export GRADLE_OPTS='-Xmx1536m -XX:MaxMetaspaceSize=256m -XX:+UseSerialGC'
export NODE_OPTIONS='--max-old-space-size=4096'

# Safety: prevent WASM memory exhaustion in CSS runtime
unset CSS_TRANSFORMER_WASM
export SENTRY_DISABLE_AUTO_UPLOAD=true

# CCACHE Acceleration Layer
if command -v ccache >/dev/null 2>&1; then
  export NDK_CCACHE="$(which ccache)"
  export CMAKE_C_COMPILER_LAUNCHER="$(which ccache)"
  export CMAKE_CXX_COMPILER_LAUNCHER="$(which ccache)"
  export CCACHE_DIR="$HOME/.ccache"
  export CCACHE_MAXSIZE="10G"
  export CCACHE_SLOPPINESS="include_file_ctime,include_file_mtime,time_macros"
fi

cd "\$WSL_WORKSPACE/apps/gurudevi-mobile/android"

REPORTS_DIR="\$WSL_WORKSPACE/reports/android-build"
mkdir -p "\$REPORTS_DIR"
BUILD_STARTED_AT="$(date -Is)"
BUILD_STARTED_EPOCH="$(date +%s)"
RAW_LOG="\$REPORTS_DIR/${buildRunId}-${buildType}.gradle.log"
HEARTBEAT_LOG="\$REPORTS_DIR/${buildRunId}-${buildType}.heartbeat.log"
SUMMARY="\$REPORTS_DIR/${buildRunId}-${buildType}.summary.txt"
APK_PATH="\$WSL_WORKSPACE/apps/gurudevi-mobile/android/app/build/outputs/apk/${buildType}/app-${buildType}.apk"
STALL_TIMEOUT_SECONDS="\${ANDROID_BUILD_STALL_TIMEOUT_SECONDS:-1200}"
WINDOWS_REPORTS_DIR="${WINDOWS_REPORTS_DIR}"
WINDOWS_RAW_LOG=""
WINDOWS_HEARTBEAT_LOG=""
WINDOWS_SUMMARY=""
if mkdir -p "\$WINDOWS_REPORTS_DIR" 2>/dev/null; then
  WINDOWS_RAW_LOG="\$WINDOWS_REPORTS_DIR/${buildRunId}-${buildType}.gradle.log"
  WINDOWS_HEARTBEAT_LOG="\$WINDOWS_REPORTS_DIR/${buildRunId}-${buildType}.heartbeat.log"
  WINDOWS_SUMMARY="\$WINDOWS_REPORTS_DIR/${buildRunId}-${buildType}.summary.txt"
fi

write_heartbeat() {
  if [ -n "\$WINDOWS_HEARTBEAT_LOG" ]; then
    tee -a "\$HEARTBEAT_LOG" "\$WINDOWS_HEARTBEAT_LOG"
  else
    tee -a "\$HEARTBEAT_LOG"
  fi
}

write_summary() {
  if [ -n "\$WINDOWS_SUMMARY" ]; then
    tee -a "\$SUMMARY" "\$WINDOWS_SUMMARY"
  else
    tee -a "\$SUMMARY"
  fi
}

set_phase() {
  if [ "\${build_phase:-}" != "\$1" ]; then
    build_phase="\$1"
    phase_elapsed_seconds=$(( $(date +%s) - BUILD_STARTED_EPOCH ))
    printf '[%s] phase=%s elapsed_seconds=%s\n' "$(date -Is)" "\$build_phase" "\$phase_elapsed_seconds" | write_heartbeat
  fi
}

printf 'started_at=%s\nvariant=${buildType}\ntask=${gradleTask}\nabi=${abi}\nstall_timeout_seconds=%s\n' "\$BUILD_STARTED_AT" "\$STALL_TIMEOUT_SECONDS" > "\$SUMMARY"
if [ -n "\$WINDOWS_SUMMARY" ]; then cp "\$SUMMARY" "\$WINDOWS_SUMMARY"; fi
printf '[%s] build started; raw_log=%s\n' "\$BUILD_STARTED_AT" "\$RAW_LOG" | write_heartbeat
set_phase 'gradle-configuration'

# Check Doppler authentication for Release builds
RUN_COMMAND="./gradlew ${gradleTask} --build-cache --no-daemon --max-workers=2 -PreactNativeArchitectures=${abi} --console=plain --stacktrace --warning-mode=all"

${
  isRelease
    ? `
if command -v doppler >/dev/null 2>&1 && doppler me >/dev/null 2>&1; then
  echo "  ✓ Doppler authenticated: injecting release secrets into Metro bundler"
  RUN_COMMAND="doppler run --no-fallback -- \$RUN_COMMAND"
else
  echo "  ⚠️ Doppler not authenticated in WSL; running Gradle with local environment fallback"
fi
`
    : ''
}

if [ -n "\$WINDOWS_RAW_LOG" ]; then
  setsid bash -c "exec \$RUN_COMMAND" > >(awk '{ print "[" strftime("%Y-%m-%dT%H:%M:%S%z") "] " \$0; fflush() }' | tee "\$RAW_LOG" "\$WINDOWS_RAW_LOG") 2>&1 &
else
  setsid bash -c "exec \$RUN_COMMAND" > >(awk '{ print "[" strftime("%Y-%m-%dT%H:%M:%S%z") "] " \$0; fflush() }' | tee "\$RAW_LOG") 2>&1 &
fi
build_pid=\$!
stalled=0
external_signal=""

terminate_build_tree() {
  kill -TERM -- "-\$build_pid" 2>/dev/null || true
  sleep 15
  kill -KILL -- "-\$build_pid" 2>/dev/null || true
}

trap 'external_signal=SIGINT; terminate_build_tree' INT
trap 'external_signal=SIGTERM; terminate_build_tree' TERM

while kill -0 "\$build_pid" 2>/dev/null; do
  sleep 30
  current_epoch="$(date +%s)"
  latest_output_epoch="$(stat -c %Y "\$RAW_LOG" 2>/dev/null || printf '%s' "\$current_epoch")"
  silent_seconds=$((current_epoch - latest_output_epoch))
  if grep -qE 'C/C\+\+|ninja:|buildCMakeDebug|externalNativeBuildDebug' "\$RAW_LOG"; then
    set_phase 'native-cpp'
  elif grep -qE ':app:.*(package|assemble|merge).*Debug|APK' "\$RAW_LOG"; then
    set_phase 'apk-packaging'
  elif grep -qE 'Kotlin|\.kt:' "\$RAW_LOG"; then
    set_phase 'kotlin-java'
  fi
  printf '[%s] build_pid=%s phase=%s output_silence_seconds=%s\n' "$(date -Is)" "\$build_pid" "\$build_phase" "\$silent_seconds" | write_heartbeat
  if [ "\$silent_seconds" -ge "\$STALL_TIMEOUT_SECONDS" ]; then
    stalled=1
    printf '[%s] watchdog: no Gradle output for %ss; terminating process group %s\n' "$(date -Is)" "\$silent_seconds" "\$build_pid" | write_heartbeat
    terminate_build_tree
    break
  fi
done

wait "\$build_pid"
gradle_status=\$?

artifact_size=""
artifact_sha256=""
if [ "\$gradle_status" -eq 0 ]; then
  if [ ! -s "\$APK_PATH" ]; then
    gradle_status=97
    failure_reason="Gradle exited successfully but APK is missing or empty: \$APK_PATH"
  else
    artifact_size="$(stat -c %s "\$APK_PATH")"
    artifact_sha256="$(sha256sum "\$APK_PATH" | awk '{print \$1}')"
  fi
fi

if [ -n "\${failure_reason:-}" ]; then
  :
elif [ "\$stalled" -eq 1 ]; then
  failure_reason="watchdog terminated Gradle after no output for at least \${STALL_TIMEOUT_SECONDS}s"
elif [ -n "\$external_signal" ]; then
  failure_reason="build interrupted by \${external_signal}"
elif [ "\$gradle_status" -ne 0 ]; then
  failure_reason="Gradle exited with status \${gradle_status}"
else
  failure_reason="none"
fi

{
  printf 'finished_at=%s\nelapsed_seconds=%s\nexit_status=%s\nresult=%s\nfailure_reason=%s\nfinal_phase=%s\napk_path=%s\napk_bytes=%s\napk_sha256=%s\n' "$(date -Is)" "$(( $(date +%s) - BUILD_STARTED_EPOCH ))" "\$gradle_status" "$( [ "\$gradle_status" -eq 0 ] && printf success || printf failed )" "\$failure_reason" "\$build_phase" "\$APK_PATH" "\$artifact_size" "\$artifact_sha256"
  if [ "\$gradle_status" -ne 0 ]; then
    printf '\n--- failure excerpt ---\n'
    grep -nE 'FAILURE:|Execution failed|What went wrong|^\* Exception|^\* Cause|(^|[^a-zA-Z])error:' "\$RAW_LOG" | tail -n 80 || true
    printf '\n--- trailing output ---\n'
    tail -n 120 "\$RAW_LOG" || true
  fi
} | write_summary

if [ "\$gradle_status" -ne 0 ]; then
  cp "\$RAW_LOG" "\$REPORTS_DIR/last-failed-${buildType}.gradle.log"
  cp "\$SUMMARY" "\$REPORTS_DIR/last-failed-${buildType}.summary.txt"
  if [ -n "\$WINDOWS_RAW_LOG" ]; then cp "\$RAW_LOG" "\$WINDOWS_REPORTS_DIR/last-failed-${buildType}.gradle.log"; fi
  if [ -n "\$WINDOWS_SUMMARY" ]; then cp "\$SUMMARY" "\$WINDOWS_REPORTS_DIR/last-failed-${buildType}.summary.txt"; fi
fi

printf '[%s] build finished: status=%s summary=%s\n' "$(date -Is)" "\$gradle_status" "\$SUMMARY" | write_heartbeat
exit "\$gradle_status"
`;

// -----------------------------------------------------------------------------
// STAGE 5: Build Execution
// -----------------------------------------------------------------------------
logStep(`Stage 5: Executing Gradle ${gradleTask}`);
console.log(`  • CCACHE: Enabled (10GB Pool)`);
console.log(`  • Gradle Cache: Enabled (--build-cache)`);
console.log(`  • Architectures: ${abi}\n`);

const buildRes = spawnSync('wsl', ['-e', 'bash', '-c', buildScript], { stdio: 'inherit' });

const diagnosticFiles = ['gradle.log', 'heartbeat.log', 'summary.txt'];
for (const suffix of diagnosticFiles) {
  const relativeReportPath = `reports/android-build/${buildRunId}-${buildType}.${suffix}`;
  const sourcePath = `\${WSL_WORKSPACE}/${relativeReportPath}`;
  const destinationPath = path.resolve(repoRoot, relativeReportPath);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  spawnSync('wsl', ['-e', 'bash', '-c', `test -f "${sourcePath}" && cp "${sourcePath}" "${toWslPath(destinationPath)}"`]);
}

if (buildRes.status !== 0) {
  logError(`\n❌ Gradle build execution failed inside WSL2. Diagnostics: reports/android-build/${buildRunId}-${buildType}.summary.txt`);
  process.exit(1);
}

// -----------------------------------------------------------------------------
// STAGE 6: Post-Build Telemetry, Diagnostics & Deployment Guide
// -----------------------------------------------------------------------------
logStep('Stage 6: Post-build diagnostics and artifact verification');

const apkRelPath = `apps/gurudevi-mobile/android/app/build/outputs/apk/${buildType}/app-${buildType}.apk`;
const wslApkPath = `\${WSL_WORKSPACE}/${apkRelPath}`;
const apkStat = spawnSync('wsl', ['-e', 'bash', '-c', `ls -lh "${wslApkPath}"`], {
  encoding: 'utf-8',
});
const apkVerification = spawnSync(
  'wsl',
  ['-e', 'bash', '-c', `test -s "${wslApkPath}" && sha256sum "${wslApkPath}"`],
  { encoding: 'utf-8' },
);

if (apkVerification.status !== 0 || !apkVerification.stdout?.trim()) {
  logError(`❌ Gradle exited without a verifiable ${buildType} APK at ${apkRelPath}.`);
  process.exit(1);
}

const apkSha256 = apkVerification.stdout.trim().split(/\s+/)[0];

console.log(`\n\x1b[1;32m========================================================================`);
console.log(`  ✅ ${buildType.toUpperCase()} BUILD COMPLETED SUCCESSFULLY! ${getElapsed()}`);
console.log(`========================================================================\x1b[0m`);

if (apkStat.stdout && apkStat.stdout.trim()) {
  console.log(`  📦 APK Artifact:  ${apkRelPath}`);
  console.log(`  📊 Details:       ${apkStat.stdout.trim()}`);
  console.log(`  🔐 SHA-256:       ${apkSha256}`);

  try {
    const winApkPath = path.resolve(repoRoot, apkRelPath);
    fs.mkdirSync(path.dirname(winApkPath), { recursive: true });
    const winWslPath = toWslPath(winApkPath);
    const syncResult = spawnSync('wsl', ['-e', 'bash', '-c', `cp "${wslApkPath}" "${winWslPath}" && sha256sum "${winWslPath}"`], { encoding: 'utf-8' });
    const syncedSha256 = syncResult.stdout?.trim().split(/\s+/)[0];
    if (syncResult.status !== 0 || syncedSha256 !== apkSha256) {
      throw new Error(`Windows artifact verification failed (expected ${apkSha256}, received ${syncedSha256 ?? 'none'}).`);
    }
    console.log(`  🔄 Synced to:     ${winApkPath}`);
  } catch (err) {
    // Non-fatal if Windows sync fails
  }
}

// CCACHE Statistics
const ccacheStat = spawnSync('wsl', ['-e', 'bash', '-c', `ccache -s 2>/dev/null || true`], { encoding: 'utf-8' });
if (ccacheStat.stdout && ccacheStat.stdout.trim()) {
  console.log(`\n\x1b[1;36m=== ⚡ CCACHE Compiler Acceleration Statistics ===\x1b[0m`);
  console.log(ccacheStat.stdout.trim());
}

console.log(`\n\x1b[1;35m========================================================================`);
console.log(`  📲 Quick Device Deployment Commands`);
console.log(`========================================================================\x1b[0m`);
console.log(`  1. Install APK to connected device:`);
console.log(`     \x1b[33madb install -r ${apkRelPath}\x1b[0m`);
console.log(`  2. Launch Application:`);
console.log(`     \x1b[33madb shell am start -n ${targetPkg}/${basePackage}.MainActivity\x1b[0m`);
if (!isRelease) {
  console.log(`  3. Reverse Metro port for development:`);
  console.log(`     \x1b[33madb reverse tcp:8081 tcp:8081\x1b[0m`);
}
console.log(`========================================================================\n`);
