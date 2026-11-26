#!/usr/bin/env bash
# Regenerates everything from spec/*.tsp. Never edit gen/ or out/ by hand.
set -uo pipefail
cd "$(dirname "$0")"
R=../../node_modules/.bin
out=$($R/tsp compile spec --warn-as-error 2>&1) || { echo "$out" | grep -v '^- \|^✔'; exit 1; }
out=$($R/openapi-ts 2>&1) || { echo "$out"; exit 1; }
/root/.bun/bin/bun postgen.ts || exit 1
