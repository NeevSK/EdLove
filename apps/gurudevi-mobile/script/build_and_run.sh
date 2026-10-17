#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---dev-client}"
APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_ROOT="$(cd "$APP_ROOT/../.." && pwd)"

cd "$APP_ROOT"

show_usage() {
  cat <<'USAGE'
usage: bash ./script/build_and_run.sh [mode]

Modes:
  --dev-client  Start Metro for the installed development build (default).
  --android     Start Metro and open the Android development build.
  --web         Start the Expo web target.
  --doctor      Run Expo Doctor without changing dependencies.
  --help        Show this help.

Run from apps/gurudevi-mobile. Development server modes load the existing
Doppler configuration and keep Metro in the foreground.
USAGE
}

start_with_doppler() {
  exec doppler run --no-fallback -- pnpm exec cross-env \
    NODE_OPTIONS=--max-old-space-size=8192 \
    expo start "$@"
}

case "$MODE" in
  --dev-client)
    start_with_doppler --dev-client
    ;;
  --android)
    start_with_doppler --dev-client --android
    ;;
  --web)
    start_with_doppler --web
    ;;
  --doctor)
    cd "$WORKSPACE_ROOT"
    exec pnpm --filter gurudevi-mobile exec expo-doctor
    ;;
  --help|-h|help)
    show_usage
    ;;
  *)
    show_usage >&2
    exit 2
    ;;
esac
