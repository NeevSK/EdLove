#!/usr/bin/env bash
# Type-check and run the API's own tests. Every run is logged to .check-log.
cd "$(dirname "$0")/apps/sanctuary-api"
out=$( { npx tsc --noEmit -p tsconfig.json && npx vitest run src/modules src/institutions src/security --reporter=dot; } 2>&1 ); code=$?
echo "$(date +%s) $code" >> ../../.check-log
[ $code -eq 0 ] && echo "check: OK" || { echo "$out" | tail -60; echo "check: FAILED"; }
