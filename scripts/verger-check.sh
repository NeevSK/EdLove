#!/usr/bin/env bash
# Verger's verification gate: every typecheck and test that guards verger, in one command.
# Prints PASS/FAIL per step and exits non-zero if any step fails. Never commit on a FAIL.
#   pnpm verger:check            # the gate (about 2-4 minutes)
#   VERGER_RUNS=3000 pnpm verger:check   # deep property run (before a release or a policy change)
set -u
cd "$(dirname "$0")/.."
failed=0
step() {
  local name="$1"; shift
  if output=$("$@" 2>&1); then
    echo "PASS  $name"
  else
    echo "FAIL  $name"
    echo "$output" | tail -40 | sed 's/^/      /'
    failed=1
  fi
}

for pkg in verger-core verger-react verger-react-native verger-android verger-web; do
  step "tsc $pkg" bash -c "cd packages/$pkg && npx tsc --noEmit -p ."
done
step "test verger-core" bash -c "cd packages/verger-core && npx vitest run"
step "test verger-android" bash -c "cd packages/verger-android && npx vitest run"
step "test verger-web" bash -c "cd packages/verger-web && npx vitest run"
step "test gurudevi host (core/src/verger, property suites)" bash -c "cd packages/core && npx vitest run src/verger"
step "test ui context" bash -c "cd packages/ui && pnpm exec vitest run --config vitest.config.mts src/context/__tests__"
step "test mobile runtime" bash -c "cd apps/gurudevi-mobile && npx vitest run src/__tests__/runtime src/__tests__/architecture/efficiency-policy-boundaries.test.ts"
step "test web verger" bash -c "cd apps/gurudevi-web && npx vitest run tests/integration/gurudeviWebVerger.test.tsx tests/integration/workspaceWallpaperLayer.test.tsx"

if [ "$failed" = 0 ]; then echo "ALL_PASS=1"; else echo "ALL_PASS=0"; exit 1; fi
