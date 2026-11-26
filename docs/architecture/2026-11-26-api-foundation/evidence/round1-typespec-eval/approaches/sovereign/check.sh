#!/usr/bin/env bash
# Type check (and regenerate, where the approach generates). Every run is logged.
cd "$(dirname "$0")"
out=$( { ../../node_modules/.bin/tsc -p tsconfig.json; } 2>&1 ); code=$?
echo "$(date +%s) $code" >> .check-log
[ -n "$out" ] && echo "$out"
[ $code -eq 0 ] && echo "check: OK" || echo "check: FAILED"
exit $code
